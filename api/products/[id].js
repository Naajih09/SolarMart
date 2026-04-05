import { ensureSchema, mapProductRow, query, syncSeedProducts } from "../_lib/db.js";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    await ensureSchema();
    await syncSeedProducts();

    const { id } = req.query;
    const result = await query(
      "SELECT * FROM products WHERE external_id = $1 OR slug = $1 LIMIT 1",
      [String(id)],
    );

    if (!result.rows.length) {
      return res.status(404).json({ message: "Product not found" });
    }

    return res.status(200).json({ product: mapProductRow(result.rows[0]) });
  } catch (error) {
    return res.status(500).json({ message: "Could not fetch product.", error: error.message });
  }
}
