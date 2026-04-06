import { requireAdmin } from "./_lib/auth.js";
import { ensureSchema, mapProductRow, query, syncSeedProducts } from "./_lib/db.js";

export default async function handler(req, res) {
  const action = String(req.query.action || "");

  try {
    await requireAdmin(req);
    await ensureSchema();
    await syncSeedProducts();

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
      const { id, status } = req.body || {};
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
      } = req.body || {};

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
          externalId,
          slug,
          name,
          category,
          brand,
          sku,
          price,
          rating || 0,
          availability || "In stock",
          stock || 0,
          JSON.stringify(images || []),
          shortDescription || "",
          description || "",
          JSON.stringify(features || []),
          JSON.stringify(variants || []),
          JSON.stringify(relatedIds || []),
        ],
      );

      return res.status(201).json({ product: mapProductRow(result.rows[0]) });
    }

    res.setHeader("Allow", "GET, POST, PATCH");
    return res.status(405).json({ message: "Method not allowed" });
  } catch (error) {
    const status = error.message === "Forbidden" ? 403 : error.message === "Unauthorized" ? 401 : 500;
    return res.status(status).json({ message: error.message || "Admin request failed." });
  }
}
