import { requireAdmin } from "../_lib/auth.js";
import { ensureSchema, mapProductRow, query, syncSeedProducts } from "../_lib/db.js";

export default async function handler(req, res) {
  try {
    await requireAdmin(req);
    await ensureSchema();
    await syncSeedProducts();

    if (req.method === "GET") {
      const result = await query("SELECT * FROM products ORDER BY created_at DESC");
      return res.status(200).json({ products: result.rows.map(mapProductRow) });
    }

    if (req.method === "POST") {
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

    res.setHeader("Allow", "GET, POST");
    return res.status(405).json({ message: "Method not allowed" });
  } catch (error) {
    const status = error.message === "Forbidden" ? 403 : error.message === "Unauthorized" ? 401 : 500;
    return res.status(status).json({ message: error.message || "Could not manage products." });
  }
}
