const TOKEN_KEY = "solarmart-auth-token";
const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || "").replace(/\/$/, "");

export function getToken() {
  return window.localStorage.getItem(TOKEN_KEY) || "";
}

export function setToken(token) {
  if (!token) {
    window.localStorage.removeItem(TOKEN_KEY);
    return;
  }

  window.localStorage.setItem(TOKEN_KEY, token);
}

export async function apiFetch(url, options = {}) {
  const token = getToken();
  const headers = new Headers(options.headers || {});
  const resolvedUrl =
    /^https?:\/\//.test(url) || !API_BASE_URL
      ? url
      : `${API_BASE_URL}${url.startsWith("/") ? url : `/${url}`}`;

  if (!headers.has("Content-Type") && options.body) {
    headers.set("Content-Type", "application/json");
  }

  if (token && !headers.has("Authorization")) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(resolvedUrl, {
    ...options,
    headers,
    credentials: "include",
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || "Request failed.");
  }

  return data;
}
