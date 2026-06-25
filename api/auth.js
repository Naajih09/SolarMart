import { clearSessionCookie, createSessionForUser, loginUser, loginVendor, requireUser } from "./_lib/auth.js";
import { applyCors } from "./_lib/cors.js";
import { ensureSchema, hashPassword, query } from "./_lib/db.js";
import { getQueryParam, readJsonBody } from "./_lib/request.js";

export default async function handler(req, res) {
  const action = String(getQueryParam(req, "action") || "");

  if (applyCors(req, res, "GET, POST, OPTIONS")) {
    return;
  }

  try {
    if (req.method === "POST" && action === "register") {
      await ensureSchema();
      const { fullName, email, phone, password } = await readJsonBody(req);

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

    if (req.method === "POST" && action === "vendor-register") {
      await ensureSchema();
      const { businessName, business_name: businessNameSnake, email, phone, password } = await readJsonBody(req);
      const businessNameValue = String(businessName || businessNameSnake || "").trim();
      const emailValue = String(email || "").trim().toLowerCase();

      if (!businessNameValue || !emailValue || !password) {
        return res.status(400).json({ message: "Business name, email, and password are required." });
      }

      if (String(password).length < 8) {
        return res.status(400).json({ message: "Use at least 8 characters for the password." });
      }

      const [existingUser, existingVendor] = await Promise.all([
        query("SELECT id FROM users WHERE email = $1", [emailValue]),
        query("SELECT id FROM vendors WHERE email = $1", [emailValue]),
      ]);

      if (existingUser.rows.length || existingVendor.rows.length) {
        return res.status(409).json({ message: "An account with this email already exists." });
      }

      const passwordHash = await hashPassword(password);
      const userResult = await query(
        `INSERT INTO users (full_name, email, phone, password_hash, role)
         VALUES ($1, $2, $3, $4, 'vendor')
         RETURNING id, full_name, email, phone, role`,
        [businessNameValue, emailValue, phone || null, passwordHash],
      );

      const vendorResult = await query(
        `INSERT INTO vendors (user_id, business_name, email, phone, status)
         VALUES ($1, $2, $3, $4, 'pending_review')
         RETURNING id, business_name, email, phone, status, created_at`,
        [userResult.rows[0].id, businessNameValue, emailValue, phone || null],
      );

      return res.status(201).json({
        message: "Vendor application submitted. SolarMart will review your account before login is enabled.",
        vendor: vendorResult.rows[0],
      });
    }

    if (req.method === "POST" && action === "login") {
      const { email, password } = await readJsonBody(req);
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

    if (req.method === "POST" && action === "vendor-login") {
      const { email, password } = await readJsonBody(req);
      if (!email || !password) {
        return res.status(400).json({ message: "Email and password are required." });
      }

      const user = await loginVendor(email, password);
      if (!user) {
        return res.status(401).json({ message: "Invalid vendor email or password." });
      }

      const token = await createSessionForUser(res, user);
      return res.status(200).json({ message: "Vendor login successful.", token, user });
    }

    if (req.method === "GET" && action === "me") {
      const user = await requireUser(req);
      let vendor = null;
      if (user.role === "vendor") {
        const vendorResult = await query(
          `SELECT id, business_name, email, phone, status, commission_rate, created_at
           FROM vendors
           WHERE user_id = $1
           LIMIT 1`,
          [user.id],
        );
        vendor = vendorResult.rows[0] || null;
      }
      return res.status(200).json({
        user: {
          id: user.id,
          fullName: user.full_name,
          email: user.email,
          phone: user.phone,
          role: user.role,
          vendorId: vendor?.id || null,
          businessName: vendor?.business_name || null,
          vendorStatus: vendor?.status || null,
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
    if (error.status) {
      return res.status(error.status).json({ message: error.message });
    }
    return res.status(500).json({ message: "Auth request failed.", error: error.message });
  }
}
