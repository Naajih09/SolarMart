function normalizeOrigin(value) {
  return String(value || "").trim().replace(/\/$/, "");
}

function isAllowedOrigin(origin) {
  const normalized = normalizeOrigin(origin);
  if (!normalized) {
    return false;
  }

  const configured = String(process.env.ALLOWED_ORIGINS || "")
    .split(",")
    .map(normalizeOrigin)
    .filter(Boolean);

  if (configured.includes(normalized)) {
    return true;
  }

  return (
    normalized.startsWith("http://localhost:") ||
    normalized.startsWith("http://127.0.0.1:") ||
    /^https:\/\/[a-z0-9-]+\.vercel\.app$/i.test(normalized)
  );
}

export function applyCors(req, res, methods = "GET, POST, PATCH, DELETE, OPTIONS") {
  const origin = normalizeOrigin(req.headers.origin);

  if (isAllowedOrigin(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Vary", "Origin");
    res.setHeader("Access-Control-Allow-Credentials", "true");
  }

  res.setHeader("Access-Control-Allow-Methods", methods);
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") {
    res.status(204).end();
    return true;
  }

  return false;
}
