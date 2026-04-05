import { requireAdmin } from "../_lib/auth.js";
import { ensureSchema, query } from "../_lib/db.js";

export default async function handler(req, res) {
  try {
    await requireAdmin(req);
    await ensureSchema();

    if (req.method === "GET") {
      const result = await query(
        `SELECT a.id, a.code, a.status, a.commission_rate, a.total_clicks, a.total_conversions, a.total_commission,
                u.full_name, u.email
         FROM affiliates a
         LEFT JOIN users u ON u.id = a.user_id
         ORDER BY a.created_at DESC`,
      );
      return res.status(200).json({ affiliates: result.rows });
    }

    if (req.method === "PATCH") {
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

    res.setHeader("Allow", "GET, PATCH");
    return res.status(405).json({ message: "Method not allowed" });
  } catch (error) {
    const status = error.message === "Forbidden" ? 403 : error.message === "Unauthorized" ? 401 : 500;
    return res.status(status).json({ message: error.message || "Could not manage affiliates." });
  }
}
