import { ensureSchema, query } from "../_lib/db.js";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    await ensureSchema();
    const { code } = req.body || {};

    if (!code) {
      return res.status(400).json({ message: "Referral code is required." });
    }

    const affiliateResult = await query("SELECT id, code FROM affiliates WHERE code = $1 LIMIT 1", [
      String(code).toUpperCase(),
    ]);

    if (!affiliateResult.rows.length) {
      return res.status(404).json({ message: "Affiliate not found." });
    }

    const affiliate = affiliateResult.rows[0];

    await query(
      `INSERT INTO referrals (affiliate_id, code, status)
       VALUES ($1, $2, 'clicked')`,
      [affiliate.id, affiliate.code],
    );

    await query("UPDATE affiliates SET total_clicks = total_clicks + 1 WHERE id = $1", [affiliate.id]);

    return res.status(200).json({ message: "Referral tracked." });
  } catch (error) {
    return res.status(500).json({ message: "Could not track referral.", error: error.message });
  }
}
