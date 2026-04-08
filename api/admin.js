import { requireAdmin } from "./_lib/auth.js";
import { applyCors } from "./_lib/cors.js";
import { ensureSchema, mapProductRow, query } from "./_lib/db.js";
import { getQueryParam, readJsonBody } from "./_lib/request.js";

function slugify(value = "") {
  return String(value)
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
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

    if (req.method === "GET" && action === "products") {
      const result = await query("SELECT * FROM products ORDER BY created_at DESC");
      return res.status(200).json({ products: result.rows.map(mapProductRow) });
    }

    if (req.method === "POST" && action === "products") {
      const {
        externalId,
        slug,
        name,
        category,
        brand,
        sku,
        price,
        rating,
        availability,
        stock,
        images,
        shortDescription,
        description,
        features,
        variants,
        relatedIds,
      } = await readJsonBody(req);

      if (!name || !category || !price) {
        return res.status(400).json({ message: "Name, category, and price are required." });
      }

      const safeSlug = slugify(slug || name);
      if (!safeSlug) {
        return res.status(400).json({ message: "Provide a valid product name or slug." });
      }

      const safeExternalId = externalId || `sm-${safeSlug}`;
      const safeSku = sku || `SM-${safeSlug.toUpperCase().replace(/-/g, "-")}`;
      const imageList = Array.isArray(images)
        ? images.filter(Boolean)
        : String(images || "")
            .split(",")
            .map((item) => item.trim())
            .filter(Boolean);

      const featureList = Array.isArray(features)
        ? features.filter(Boolean)
        : String(features || "")
            .split("\n")
            .map((item) => item.trim())
            .filter(Boolean);

      const numericPrice = Number(price);
      const numericStock = Number(stock || 0);
      if (!Number.isFinite(numericPrice) || numericPrice <= 0) {
        return res.status(400).json({ message: "Price must be greater than zero." });
      }

      const result = await query(
        `INSERT INTO products (
          external_id, slug, name, category, brand, sku, price, rating, availability, stock,
          images, short_description, description, features, variants, related_ids
        )
        VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10,
          $11::jsonb, $12, $13, $14::jsonb, $15::jsonb, $16::jsonb
        )
        RETURNING *`,
        [
          safeExternalId,
          safeSlug,
          name,
          category,
          brand || "SolarMart",
          safeSku,
          numericPrice,
          rating || 0,
          availability || "In stock",
          numericStock,
          JSON.stringify(imageList),
          shortDescription || "Added from the SolarMart admin dashboard.",
          description || shortDescription || "A new SolarMart product is now available in the marketplace.",
          JSON.stringify(featureList),
          JSON.stringify(variants || []),
          JSON.stringify(relatedIds || []),
        ],
      );

      return res.status(201).json({ product: mapProductRow(result.rows[0]) });
    }

    if (req.method === "DELETE" && action === "products") {
      const id = getQueryParam(req, "id");
      if (!id) {
        return res.status(400).json({ message: "Product id is required." });
      }

      const deleted = await query(
        "DELETE FROM products WHERE id = $1 OR external_id = $1 OR slug = $1 RETURNING id, name",
        [String(id)],
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
