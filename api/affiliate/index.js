import { ensureSchema, query } from "../_lib/db.js";

function generateCode(name = "solar") {
  return String(name).replace(/[^a-z0-9]/gi, "").slice(0, 8).toUpperCase() || "SOLARNEW";
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    await ensureSchema();
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
        user,
      },
    });
  } catch (error) {
    return res.status(500).json({ message: "Could not create affiliate.", error: error.message });
  }
}
