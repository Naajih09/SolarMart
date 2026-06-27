import { requireVendor } from "./_lib/auth.js";
import { applyCors } from "./_lib/cors.js";
import { mapProductRow, query } from "./_lib/db.js";
import { getQueryParam, readJsonBody } from "./_lib/request.js";

function slugify(value = "") {
  return String(value)
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

function normalizeImages(input = {}) {
  if (Array.isArray(input.images)) {
    return input.images.map((item) => String(item || "").trim()).filter(Boolean);
  }

  if (input.imageUrl) {
    return [String(input.imageUrl).trim()].filter(Boolean);
  }

  return [];
}

function normalizeProductInput(input = {}) {
  const name = String(input.name || "").trim();
  const category = String(input.category || "").trim();
  const price = Number(input.price);
  const stock = Math.max(0, Math.floor(Number(input.stock || 0)));
  const description = String(input.description || input.fullDescription || "").trim();
  const shortDescription = String(input.shortDescription || description.slice(0, 160) || name).trim();

  return {
    name,
    category,
    price,
    stock,
    description,
    shortDescription,
    images: normalizeImages(input),
    availability: stock > 0 ? "In stock" : "Out of stock",
  };
}

async function loadVendorProducts(vendorId) {
  const result = await query(
    `SELECT p.*, v.business_name AS vendor_business_name
     FROM products p
     LEFT JOIN vendors v ON v.id = p.vendor_id
     WHERE p.vendor_id = $1
     ORDER BY p.updated_at DESC, p.created_at DESC`,
    [vendorId],
  );

  return result.rows.map(mapProductRow);
}

async function loadVendorOrders(vendorId) {
  const result = await query(
    `SELECT
       o.id,
       o.order_number,
       o.customer_name,
       o.customer_email,
       o.customer_phone,
       o.status,
       o.payment_status,
       o.created_at,
       SUM(oi.price * oi.quantity)::numeric AS vendor_total,
       JSON_AGG(
         JSON_BUILD_OBJECT(
           'name', oi.name,
           'price', oi.price,
           'quantity', oi.quantity,
           'lineTotal', oi.price * oi.quantity
         )
         ORDER BY oi.created_at ASC
       ) AS items
     FROM orders o
     JOIN order_items oi ON oi.order_id = o.id
     JOIN products p ON p.id = oi.product_id
     WHERE p.vendor_id = $1
     GROUP BY o.id
     ORDER BY o.created_at DESC`,
    [vendorId],
  );

  return result.rows.map((row) => ({
    id: row.id,
    orderNumber: row.order_number,
    customerName: row.customer_name,
    customerEmail: row.customer_email,
    customerPhone: row.customer_phone,
    status: row.status,
    paymentStatus: row.payment_status,
    createdAt: row.created_at,
    vendorTotal: Number(row.vendor_total || 0),
    items: row.items || [],
  }));
}

async function loadVendorMetrics(vendorId) {
  const [sales, liveProducts, pendingProducts] = await Promise.all([
    query(
      `SELECT COALESCE(SUM(oi.price * oi.quantity), 0)::numeric AS total
       FROM orders o
       JOIN order_items oi ON oi.order_id = o.id
       JOIN products p ON p.id = oi.product_id
       WHERE p.vendor_id = $1
         AND o.payment_status = 'paid'`,
      [vendorId],
    ),
    query(
      `SELECT COUNT(*)::int AS count
       FROM products
       WHERE vendor_id = $1
         AND approval_status = 'approved'`,
      [vendorId],
    ),
    query(
      `SELECT COUNT(*)::int AS count
       FROM products
       WHERE vendor_id = $1
         AND approval_status = 'pending'`,
      [vendorId],
    ),
  ]);

  return {
    totalSales: Number(sales.rows[0]?.total || 0),
    liveProducts: liveProducts.rows[0]?.count || 0,
    pendingProducts: pendingProducts.rows[0]?.count || 0,
  };
}

async function createVendorProduct(vendorId, input) {
  const product = normalizeProductInput(input);
  if (!product.name || !product.category || !Number.isFinite(product.price) || product.price <= 0) {
    throw new Error("Name, category, and price are required.");
  }

  const slugBase = slugify(product.name) || "vendor-product";
  const suffix = Date.now().toString(36);
  const slug = `vendor-${String(vendorId).slice(0, 8)}-${slugBase}-${suffix}`;
  const externalId = `vendor-${vendorId}-${suffix}`;
  const sku = `VND-${String(vendorId).slice(0, 8).toUpperCase()}-${suffix.toUpperCase()}`;

  const result = await query(
    `INSERT INTO products (
      external_id, slug, name, category, brand, sku, price, rating, availability, stock,
      images, short_description, description, features, variants, related_ids,
      vendor_id, approval_status, rejection_reason, submitted_at
    )
    VALUES (
      $1, $2, $3, $4, 'Vendor', $5, $6, 0, $7, $8,
      $9::jsonb, $10, $11, '[]'::jsonb, '[]'::jsonb, '[]'::jsonb,
      $12, 'pending', NULL, NOW()
    )
    RETURNING *`,
    [
      externalId,
      slug,
      product.name,
      product.category,
      sku,
      product.price,
      product.availability,
      product.stock,
      JSON.stringify(product.images),
      product.shortDescription,
      product.description || product.shortDescription,
      vendorId,
    ],
  );

  return mapProductRow(result.rows[0]);
}

async function updateVendorProduct(vendorId, identifier, input) {
  const product = normalizeProductInput(input);
  if (!identifier) {
    throw new Error("Product id is required.");
  }
  if (!product.name || !product.category || !Number.isFinite(product.price) || product.price <= 0) {
    throw new Error("Name, category, and price are required.");
  }

  const result = await query(
    `UPDATE products
     SET name = $3,
         category = $4,
         price = $5,
         availability = $6,
         stock = $7,
         images = $8::jsonb,
         short_description = $9,
         description = $10,
         approval_status = 'pending',
         rejection_reason = NULL,
         submitted_at = NOW(),
         updated_at = NOW()
     WHERE vendor_id = $1
       AND (id::text = $2 OR external_id = $2 OR slug = $2)
     RETURNING *`,
    [
      vendorId,
      String(identifier),
      product.name,
      product.category,
      product.price,
      product.availability,
      product.stock,
      JSON.stringify(product.images),
      product.shortDescription,
      product.description || product.shortDescription,
    ],
  );

  if (!result.rows.length) {
    throw new Error("Product not found.");
  }

  return mapProductRow(result.rows[0]);
}

export default async function handler(req, res) {
  const action = String(getQueryParam(req, "action") || "dashboard");

  if (applyCors(req, res, "GET, POST, PATCH, OPTIONS")) {
    return;
  }

  try {
    const { user, vendor } = await requireVendor(req);

    if (req.method === "GET" && action === "dashboard") {
      const [metrics, products, orders] = await Promise.all([
        loadVendorMetrics(vendor.id),
        loadVendorProducts(vendor.id),
        loadVendorOrders(vendor.id),
      ]);

      return res.status(200).json({
        user: {
          id: user.id,
          fullName: user.full_name,
          email: user.email,
          phone: user.phone,
          role: user.role,
        },
        vendor,
        metrics,
        products,
        orders,
      });
    }

    if (req.method === "GET" && action === "products") {
      return res.status(200).json({ products: await loadVendorProducts(vendor.id) });
    }

    if (req.method === "GET" && action === "orders") {
      return res.status(200).json({ orders: await loadVendorOrders(vendor.id) });
    }

    if (req.method === "POST" && action === "products") {
      const product = await createVendorProduct(vendor.id, await readJsonBody(req));
      return res.status(201).json({ message: "Product submitted for review.", product });
    }

    if (req.method === "PATCH" && action === "products") {
      const body = await readJsonBody(req);
      const identifier = body.id || body.dbId || body.externalId || body.slug;
      const product = await updateVendorProduct(vendor.id, identifier, body);
      return res.status(200).json({ message: "Product updated and sent for review.", product });
    }

    res.setHeader("Allow", "GET, POST, PATCH");
    return res.status(405).json({ message: "Method not allowed" });
  } catch (error) {
    const status =
      error.message === "Unauthorized" ? 401 :
      error.message === "Forbidden" ? 403 :
      error.message.includes("pending review") || error.message.includes("suspended") ? 403 :
      error.message === "Product not found." ? 404 :
      500;
    return res.status(status).json({ message: error.message || "Vendor request failed." });
  }
}
