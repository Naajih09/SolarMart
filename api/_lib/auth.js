import crypto from "node:crypto";
import { ensureAdminUser, ensureSchema, query, verifyPassword } from "./db.js";

const TOKEN_NAME = "solarmart_session";

function base64url(input) {
  return Buffer.from(input)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}

function signPayload(payload) {
  const secret = process.env.AUTH_SECRET;
  if (!secret) {
    throw new Error("AUTH_SECRET is not configured.");
  }

  const encoded = base64url(JSON.stringify(payload));
  const signature = crypto.createHmac("sha256", secret).update(encoded).digest("base64url");
  return `${encoded}.${signature}`;
}

function verifyToken(token) {
  const secret = process.env.AUTH_SECRET;
  if (!secret || !token) {
    return null;
  }

  const [encoded, signature] = token.split(".");
  if (!encoded || !signature) {
    return null;
  }

  const expected = crypto.createHmac("sha256", secret).update(encoded).digest("base64url");
  if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) {
    return null;
  }

  const payload = JSON.parse(Buffer.from(encoded, "base64url").toString("utf8"));
  if (payload.exp && payload.exp < Date.now()) {
    return null;
  }

  return payload;
}

function parseCookies(req) {
  const header = req.headers.cookie || "";
  return header.split(";").reduce((acc, part) => {
    const [key, ...rest] = part.trim().split("=");
    if (!key) {
      return acc;
    }
    acc[key] = decodeURIComponent(rest.join("="));
    return acc;
  }, {});
}

export function setSessionCookie(res, token) {
  res.setHeader(
    "Set-Cookie",
    `${TOKEN_NAME}=${encodeURIComponent(token)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=604800; Secure`,
  );
}

export function clearSessionCookie(res) {
  res.setHeader(
    "Set-Cookie",
    `${TOKEN_NAME}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0; Secure`,
  );
}

export async function createSessionForUser(res, user) {
  const token = signPayload({
    sub: user.id,
    role: user.role,
    email: user.email,
    exp: Date.now() + 7 * 24 * 60 * 60 * 1000,
  });
  setSessionCookie(res, token);
  return token;
}

export async function requireUser(req) {
  await ensureSchema();
  await ensureAdminUser();

  const authHeader = req.headers.authorization;
  const bearer = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;
  const cookies = parseCookies(req);
  const token = bearer || cookies[TOKEN_NAME];
  const payload = verifyToken(token);

  if (!payload?.sub) {
    throw new Error("Unauthorized");
  }

  const result = await query(
    "SELECT id, full_name, email, phone, role, created_at FROM users WHERE id = $1",
    [payload.sub],
  );

  if (!result.rows.length) {
    throw new Error("Unauthorized");
  }

  return result.rows[0];
}

export async function requireAdmin(req) {
  const user = await requireUser(req);
  if (user.role !== "admin") {
    throw new Error("Forbidden");
  }
  return user;
}

export async function requireVendor(req) {
  const user = await requireUser(req);
  if (user.role !== "vendor") {
    throw new Error("Forbidden");
  }

  const result = await query(
    `SELECT id, user_id, business_name, email, phone, status, commission_rate, created_at
     FROM vendors
     WHERE user_id = $1
     LIMIT 1`,
    [user.id],
  );

  const vendor = result.rows[0];
  if (!vendor) {
    throw new Error("Vendor profile not found.");
  }

  if (vendor.status !== "approved") {
    throw new Error(`Vendor account is ${vendor.status.replace("_", " ")}.`);
  }

  return { user, vendor };
}

export async function loginUser(email, password) {
  await ensureSchema();
  await ensureAdminUser();
  const result = await query(
    "SELECT id, full_name, email, phone, role, password_hash FROM users WHERE email = $1",
    [String(email).toLowerCase()],
  );

  if (!result.rows.length) {
    return null;
  }

  const user = result.rows[0];
  const valid = await verifyPassword(password, user.password_hash);

  if (!valid) {
    return null;
  }

  return {
    id: user.id,
    fullName: user.full_name,
    email: user.email,
    phone: user.phone,
    role: user.role,
  };
}

export async function loginVendor(email, password) {
  await ensureSchema();
  const result = await query(
    `SELECT
       u.id, u.full_name, u.email, u.phone, u.role, u.password_hash,
       v.id AS vendor_id, v.business_name, v.status AS vendor_status
     FROM users u
     LEFT JOIN vendors v ON v.user_id = u.id
     WHERE u.email = $1
     LIMIT 1`,
    [String(email).toLowerCase()],
  );

  if (!result.rows.length) {
    return null;
  }

  const user = result.rows[0];
  const valid = await verifyPassword(password, user.password_hash);

  if (!valid || user.role !== "vendor" || !user.vendor_id) {
    return null;
  }

  if (user.vendor_status !== "approved") {
    const error = new Error(
      user.vendor_status === "suspended"
        ? "Your vendor account is suspended. Contact SolarMart support."
        : "Your vendor account is still pending review. We will notify you after approval.",
    );
    error.status = 403;
    throw error;
  }

  return {
    id: user.id,
    fullName: user.full_name,
    email: user.email,
    phone: user.phone,
    role: user.role,
    vendorId: user.vendor_id,
    businessName: user.business_name,
    vendorStatus: user.vendor_status,
  };
}
