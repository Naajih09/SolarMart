import { createSessionForUser } from "../_lib/auth.js";
import { ensureSchema, hashPassword, query } from "../_lib/db.js";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    await ensureSchema();
    const { fullName, email, phone, password } = req.body || {};

    if (!fullName || !email || !password) {
      return res.status(400).json({ message: "Full name, email, and password are required." });
    }

    const existing = await query("SELECT id FROM users WHERE email = $1", [String(email).toLowerCase()]);
    if (existing.rows.length) {
      return res.status(409).json({ message: "An account with this email already exists." });
    }

    const passwordHash = await hashPassword(password);
    const result = await query(
      `INSERT INTO users (full_name, email, phone, password_hash, role)
       VALUES ($1, $2, $3, $4, 'customer')
       RETURNING id, full_name, email, phone, role`,
      [fullName, String(email).toLowerCase(), phone || null, passwordHash],
    );

    const user = {
      id: result.rows[0].id,
      fullName: result.rows[0].full_name,
      email: result.rows[0].email,
      phone: result.rows[0].phone,
      role: result.rows[0].role,
    };

    const token = await createSessionForUser(res, user);

    return res.status(200).json({
      message: "Account created successfully.",
      token,
      user,
    });
  } catch (error) {
    return res.status(500).json({ message: "Could not create account.", error: error.message });
  }
}
