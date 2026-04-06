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

      return res.status(200).json({
        message: "Affiliate account created.",
        affiliate: {
          ...affiliateResult.rows[0],
          total_clicks: Number(affiliateResult.rows[0].total_clicks || 0),
          total_conversions: Number(affiliateResult.rows[0].total_conversions || 0),
          total_commission: Number(affiliateResult.rows[0].total_commission || 0),
          user,
        },
      });
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

      const transactions = await query(
        `SELECT o.order_number, o.created_at, o.total, o.commission_amount, o.status, o.payment_status,
                COALESCE(oi.name, 'Order item') AS product_name
         FROM orders o
         LEFT JOIN LATERAL (
           SELECT name FROM order_items WHERE order_id = o.id ORDER BY created_at ASC LIMIT 1
         ) oi ON true
         WHERE o.affiliate_id = $1
         ORDER BY o.created_at DESC
         LIMIT 10`,
        [result.rows[0].id],
      );

      return res.status(200).json({
        affiliateCode: result.rows[0].code,
        stats: {
          totalReferrals: Number(result.rows[0].total_clicks),
          commissionEarned: Number(result.rows[0].total_commission),
          clicks: Number(result.rows[0].total_clicks),
          conversions: Number(result.rows[0].total_conversions),
          status: result.rows[0].status,
          pendingPayouts: transactions.rows.filter((item) => item.status !== "paid").length,
          transactions: transactions.rows.map((item) => ({
            date: item.created_at,
            product: item.product_name,
            commission: Number(item.commission_amount || 0),
            status: `${item.status} / ${item.payment_status}`,
            orderNumber: item.order_number,
            total: Number(item.total || 0),
          })),
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
