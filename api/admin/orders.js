import { requireAdmin } from "../_lib/auth.js";
import { ensureSchema, query } from "../_lib/db.js";

export default async function handler(req, res) {
  try {
    await requireAdmin(req);
    await ensureSchema();

    if (req.method !== "GET") {
      res.setHeader("Allow", "GET");
      return res.status(405).json({ message: "Method not allowed" });
    }

    const result = await query(
      `SELECT order_number, customer_name, customer_email, total, status, payment_status, created_at
       FROM orders
       ORDER BY created_at DESC`,
    );
    return res.status(200).json({ orders: result.rows });
  } catch (error) {
    const status = error.message === "Forbidden" ? 403 : error.message === "Unauthorized" ? 401 : 500;
    return res.status(status).json({ message: error.message || "Could not fetch orders." });
  }
}
