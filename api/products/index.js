import { ensureSchema, mapProductRow, query, syncSeedProducts } from "../_lib/db.js";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    await ensureSchema();
    await syncSeedProducts();

    const { category, q, sort } = req.query || {};
    const params = [];
    const conditions = [];

    if (category) {
      params.push(String(category));
      conditions.push(`category = $${params.length}`);
    }

    if (q) {
      params.push(`%${String(q)}%`);
      conditions.push(`(name ILIKE $${params.length} OR brand ILIKE $${params.length} OR category ILIKE $${params.length})`);
    }

    const orderBy =
      sort === "price-low"
        ? "price ASC"
        : sort === "price-high"
          ? "price DESC"
          : sort === "rating"
            ? "rating DESC"
            : "created_at DESC";

    const whereClause = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
    const result = await query(
      `SELECT * FROM products ${whereClause} ORDER BY ${orderBy}`,
      params,
    );

    return res.status(200).json({ products: result.rows.map(mapProductRow) });
  } catch (error) {
    return res.status(500).json({ message: "Could not fetch products.", error: error.message });
  }
}
