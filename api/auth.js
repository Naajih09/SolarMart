import { clearSessionCookie, createSessionForUser, loginUser, requireUser } from "./_lib/auth.js";
import { applyCors } from "./_lib/cors.js";
import { ensureSchema, hashPassword, query } from "./_lib/db.js";

export default async function handler(req, res) {
  const action = String(req.query.action || "");

  if (applyCors(req, res, "GET, POST, OPTIONS")) {
    return;
  }

  try {
    if (req.method === "POST" && action === "register") {
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
      return res.status(200).json({ message: "Account created successfully.", token, user });
    }

    if (req.method === "POST" && action === "login") {
      const { email, password } = req.body || {};
      if (!email || !password) {
        return res.status(400).json({ message: "Email and password are required." });
      }

      const user = await loginUser(email, password);
      if (!user) {
        return res.status(401).json({ message: "Invalid email or password." });
      }

      const token = await createSessionForUser(res, user);
      return res.status(200).json({ message: "Login successful.", token, user });
    }

    if (req.method === "GET" && action === "me") {
      const user = await requireUser(req);
      return res.status(200).json({
        user: {
          id: user.id,
          fullName: user.full_name,
          email: user.email,
          phone: user.phone,
          role: user.role,
        },
      });
    }

    if (req.method === "POST" && action === "logout") {
      clearSessionCookie(res);
      return res.status(200).json({ message: "Logged out." });
    }

    res.setHeader("Allow", "GET, POST");
    return res.status(405).json({ message: "Method not allowed" });
  } catch (error) {
    if (error.message === "Unauthorized") {
      return res.status(401).json({ message: "Unauthorized" });
    }
    return res.status(500).json({ message: "Auth request failed.", error: error.message });
  }
}
