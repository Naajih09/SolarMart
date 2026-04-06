import { ensureSchema, query } from "./_lib/db.js";

function generateCode(name = "solar") {
  return String(name).replace(/[^a-z0-9]/gi, "").slice(0, 8).toUpperCase() || "SOLARNEW";
}

export default async function handler(req, res) {
  const action = String(req.query.action || "");

  try {
    await ensureSchema();

    if (req.method === "POST" && action === "signup") {
      const { name, email, phone } = req.body || {};
      if (!name || !email) {
        return res.status(400).json({ message: "Name and email are required." });
      }

      const userResult = await query(
        `INSERT INTO users (full_name, email, phone, role)
         VALUES ($1, $2, $3, 'affiliate')
         ON CONFLICT (email) DO UPDATE SET full_name = EXCLUDED.full_name, phone = EXCLUDED.phone
         RETURNING id, full_name, email, phone, role`,
        [name, String(email).toLowerCase(), phone || null],
      );

      const user = userResult.rows[0];
      const affiliateCode = generateCode(name);
      const affiliateResult = await query(
        `INSERT INTO affiliates (user_id, code, status)
         VALUES ($1, $2, 'pending')
         ON CONFLICT (code) DO UPDATE SET user_id = EXCLUDED.user_id
         RETURNING id, code, status, commission_rate, total_clicks, total_conversions, total_commission`,
        [user.id, affiliateCode],
      );

      return res.status(200).json({ message: "Affiliate account created.", affiliate: { ...affiliateResult.rows[0], user } });
    }

    if (req.method === "GET" && action === "stats") {
      const code = String(req.query.code || "").toUpperCase();
      const result = await query(
        `SELECT a.*, u.full_name, u.email
         FROM affiliates a
         LEFT JOIN users u ON u.id = a.user_id
         WHERE a.code = $1
         LIMIT 1`,
        [code],
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
    }

    if (req.method === "POST" && action === "track") {
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
      await query(`INSERT INTO referrals (affiliate_id, code, status) VALUES ($1, $2, 'clicked')`, [affiliate.id, affiliate.code]);
      await query("UPDATE affiliates SET total_clicks = total_clicks + 1 WHERE id = $1", [affiliate.id]);

      return res.status(200).json({ message: "Referral tracked." });
    }

    res.setHeader("Allow", "GET, POST");
    return res.status(405).json({ message: "Method not allowed" });
  } catch (error) {
    return res.status(500).json({ message: "Affiliate request failed.", error: error.message });
  }
}
