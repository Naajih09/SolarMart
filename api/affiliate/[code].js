import { ensureSchema, query } from "../_lib/db.js";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    await ensureSchema();
    const { code } = req.query || {};

    const result = await query(
      `SELECT a.*, u.full_name, u.email
       FROM affiliates a
       LEFT JOIN users u ON u.id = a.user_id
       WHERE a.code = $1
       LIMIT 1`,
      [String(code).toUpperCase()],
    );

    if (!result.rows.length) {
      return res.status(404).json({ message: "Affiliate not found." });
    }

    return res.status(200).json({
      affiliateCode: result.rows[0].code,
      stats: {
        totalReferrals: result.rows[0].total_clicks,
        commissionEarned: Number(result.rows[0].total_commission),
        clicks: result.rows[0].total_clicks,
        conversions: result.rows[0].total_conversions,
        status: result.rows[0].status,
        user: {
          fullName: result.rows[0].full_name,
          email: result.rows[0].email,
        },
      },
    });
  } catch (error) {
    return res.status(500).json({ message: "Could not fetch affiliate.", error: error.message });
  }
}
