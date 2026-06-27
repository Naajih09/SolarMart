import { requireAdmin } from "./_lib/auth.js";
import { applyCors } from "./_lib/cors.js";
import { ensureSchema, mapProductRow, query } from "./_lib/db.js";
import { getQueryParam, readJsonBody } from "./_lib/request.js";

export function slugify(value = "") {
  return String(value)
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

export function normalizeProductInput(input = {}) {
  const name = String(input.name || "").trim();
  const category = String(input.category || "").trim();
  const price = Number(input.price);
  const stock = Number(input.stock || 0);
  const slug = slugify(input.slug || name);
  const externalId = String(input.externalId || input.sku || `sm-${slug}`).trim();
  const sku = String(input.sku || `SM-${slug.toUpperCase().replace(/-/g, "-")}`).trim();
  const images = Array.isArray(input.images)
    ? input.images.filter(Boolean)
    : input.imageUrl
      ? [String(input.imageUrl).trim()]
      : [];

  const vendorId = input.vendorId || input.vendor_id || null;

  return {
    name,
    category,
    price,
    stock,
    slug,
    externalId,
    sku,
    brand: String(input.brand || "SolarMart").trim() || "SolarMart",
    rating: Number(input.rating || 0),
    availability: String(input.availability || (stock > 0 ? "In stock" : "Out of stock")).trim(),
    images,
    shortDescription: String(input.shortDescription || "").trim(),
    description: String(input.description || input.fullDescription || input.shortDescription || "").trim(),
    features: Array.isArray(input.features) ? input.features.filter(Boolean) : [],
    variants: Array.isArray(input.variants) ? input.variants.filter(Boolean) : [],
    relatedIds: Array.isArray(input.relatedIds) ? input.relatedIds.filter(Boolean) : [],
    vendorId,
    approvalStatus: String(input.approvalStatus || input.approval_status || (vendorId ? "pending" : "approved")).trim(),
    rejectionReason: String(input.rejectionReason || input.rejection_reason || "").trim(),
  };
}

async function upsertProduct(input = {}) {
  const product = normalizeProductInput(input);

  if (!product.name || !product.category || !Number.isFinite(product.price) || product.price <= 0) {
    throw new Error("Name, category, and price are required.");
  }

  const result = await query(
    `INSERT INTO products (
      external_id, slug, name, category, brand, sku, price, rating, availability, stock,
      images, short_description, description, features, variants, related_ids,
      vendor_id, approval_status, rejection_reason, submitted_at
    )
    VALUES (
      $1, $2, $3, $4, $5, $6, $7, $8, $9, $10,
      $11::jsonb, $12, $13, $14::jsonb, $15::jsonb, $16::jsonb,
      $17, $18, $19, NOW()
    )
    ON CONFLICT (external_id) DO UPDATE SET
      slug = EXCLUDED.slug,
      name = EXCLUDED.name,
      category = EXCLUDED.category,
      brand = EXCLUDED.brand,
      sku = EXCLUDED.sku,
      price = EXCLUDED.price,
      rating = EXCLUDED.rating,
      availability = EXCLUDED.availability,
      stock = EXCLUDED.stock,
      images = EXCLUDED.images,
      short_description = EXCLUDED.short_description,
      description = EXCLUDED.description,
      features = EXCLUDED.features,
      variants = EXCLUDED.variants,
      related_ids = EXCLUDED.related_ids,
      vendor_id = EXCLUDED.vendor_id,
      approval_status = EXCLUDED.approval_status,
      rejection_reason = EXCLUDED.rejection_reason,
      submitted_at = CASE
        WHEN products.approval_status = 'approved'
          AND (
            products.name IS DISTINCT FROM EXCLUDED.name OR
            products.category IS DISTINCT FROM EXCLUDED.category OR
            products.brand IS DISTINCT FROM EXCLUDED.brand OR
            products.sku IS DISTINCT FROM EXCLUDED.sku OR
            products.price IS DISTINCT FROM EXCLUDED.price OR
            products.stock IS DISTINCT FROM EXCLUDED.stock OR
            products.images IS DISTINCT FROM EXCLUDED.images OR
            products.description IS DISTINCT FROM EXCLUDED.description
          )
          AND EXCLUDED.vendor_id IS NOT NULL
        THEN NOW()
        ELSE products.submitted_at
      END,
      updated_at = NOW()
    RETURNING *`,
    [
      product.externalId,
      product.slug,
      product.name,
      product.category,
      product.brand,
      product.sku,
      product.price,
      product.rating,
      product.availability,
      product.stock,
      JSON.stringify(product.images),
      product.shortDescription,
      product.description,
      JSON.stringify(product.features),
      JSON.stringify(product.variants),
      JSON.stringify(product.relatedIds),
      product.vendorId,
      product.approvalStatus,
      product.rejectionReason || null,
    ],
  );

  return mapProductRow(result.rows[0]);
}

export default async function handler(req, res) {
  const action = String(getQueryParam(req, "action") || "");

  if (applyCors(req, res, "GET, POST, PATCH, DELETE, OPTIONS")) {
    return;
  }

  try {
    await requireAdmin(req);
    await ensureSchema();

    if (req.method === "GET" && action === "orders") {
      const result = await query(
        `SELECT order_number, customer_name, customer_email, total, status, payment_status, created_at
         FROM orders
         ORDER BY created_at DESC`,
      );
      return res.status(200).json({ orders: result.rows });
    }

    if (req.method === "GET" && action === "affiliates") {
      const result = await query(
        `SELECT a.id, a.code, a.status, a.commission_rate, a.total_clicks, a.total_conversions, a.total_commission,
                u.full_name, u.email
         FROM affiliates a
         LEFT JOIN users u ON u.id = a.user_id
         ORDER BY a.created_at DESC`,
      );
      return res.status(200).json({ affiliates: result.rows });
    }

    if (req.method === "PATCH" && action === "affiliates") {
      const { id, status } = await readJsonBody(req);
      if (!id || !status) {
        return res.status(400).json({ message: "Affiliate id and status are required." });
      }

      const result = await query(
        "UPDATE affiliates SET status = $2 WHERE id = $1 RETURNING id, code, status",
        [id, status],
      );
      return res.status(200).json({ affiliate: result.rows[0] });
    }

    if (req.method === "GET" && action === "vendors") {
      const status = getQueryParam(req, "status");
      const params = [];
      const where = status ? "WHERE status = $1" : "";
      if (status) {
        params.push(String(status));
      }
      const result = await query(
        `SELECT id, business_name, email, phone, status, paystack_subaccount_id, commission_rate, created_at
         FROM vendors
         ${where}
         ORDER BY created_at DESC`,
        params,
      );
      return res.status(200).json({ vendors: result.rows });
    }

    if (req.method === "PATCH" && action === "vendors") {
      const { id, status, commissionRate } = await readJsonBody(req);
      if (!id || !status) {
        return res.status(400).json({ message: "Vendor id and status are required." });
      }
      const result = await query(
        `UPDATE vendors
         SET status = $2,
             commission_rate = COALESCE($3, commission_rate)
         WHERE id = $1
         RETURNING id, business_name, email, phone, status, commission_rate`,
        [id, status, commissionRate ?? null],
      );
      return res.status(200).json({ vendor: result.rows[0] });
    }

    if (req.method === "GET" && action === "products") {
      const result = await query(
        `SELECT p.*, v.business_name AS vendor_business_name
         FROM products p
         LEFT JOIN vendors v ON v.id = p.vendor_id
         ORDER BY p.created_at DESC`,
      );
      return res.status(200).json({ products: result.rows.map(mapProductRow) });
    }

    if (req.method === "POST" && action === "products") {
      return res.status(201).json({ product: await upsertProduct(await readJsonBody(req)) });
    }

    if (req.method === "PATCH" && action === "products") {
      const { id, dbId, externalId, slug, approvalStatus, rejectionReason } = await readJsonBody(req);
      const identifier = id || dbId || externalId || slug;
      if (!identifier || !approvalStatus) {
        return res.status(400).json({ message: "Product id and approval status are required." });
      }
      if (approvalStatus === "rejected" && !String(rejectionReason || "").trim()) {
        return res.status(400).json({ message: "A rejection reason is required." });
      }

      const result = await query(
        `UPDATE products
         SET approval_status = $2,
             rejection_reason = $3,
             updated_at = NOW()
         WHERE id = $1 OR external_id = $1 OR slug = $1
         RETURNING *`,
        [String(identifier), approvalStatus, approvalStatus === "rejected" ? String(rejectionReason).trim() : null],
      );

      if (!result.rows.length) {
        return res.status(404).json({ message: "Product not found." });
      }

      return res.status(200).json({ product: mapProductRow(result.rows[0]) });
    }

    if (req.method === "POST" && action === "import-products") {
      const body = await readJsonBody(req);
      const products = Array.isArray(body.products) ? body.products : [];

      if (!products.length) {
        return res.status(400).json({ message: "A products array is required." });
      }

      const imported = [];
      for (const product of products) {
        imported.push(await upsertProduct(product));
      }

      return res.status(201).json({
        message: `Imported ${imported.length} products.`,
        products: imported,
      });
    }

    if (req.method === "DELETE" && action === "products") {
      const body = await readJsonBody(req).catch(() => ({}));
      const identifier = getQueryParam(req, "id") || body.id || body.dbId || body.externalId || body.slug;
      if (!identifier) {
        return res.status(400).json({ message: "Product id is required." });
      }

      const deleted = await query(
        "DELETE FROM products WHERE id = $1 OR external_id = $1 OR slug = $1 RETURNING id, name",
        [String(identifier)],
      );

      if (!deleted.rows.length) {
        return res.status(404).json({ message: "Product not found." });
      }

      return res.status(200).json({
        message: "Product deleted.",
        product: deleted.rows[0],
      });
    }

    res.setHeader("Allow", "GET, POST, PATCH, DELETE");
    return res.status(405).json({ message: "Method not allowed" });
  } catch (error) {
    const status = error.message === "Forbidden" ? 403 : error.message === "Unauthorized" ? 401 : 500;
    return res.status(status).json({ message: error.message || "Admin request failed." });
  }
}
