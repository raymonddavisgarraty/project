// Site settings are read at build time; no secrets are exposed to client scripts.
const placeholderHost = host =>
  /(^|\.)(example\.(com|org|net)|localhost|invalid|test|local)$/.test(host) ||
  /^(127\.|0\.0\.0\.0$|192\.168\.|10\.)/.test(host);

export function resolveSiteUrl(env = process.env) {
  const production = env.NODE_ENV === "production" || env.SITE_ENV === "production";
  const value = typeof env.SITE_URL === "string" ? env.SITE_URL.trim() : "";
  if (!value) {
    if (production) throw new Error("SITE_URL is required for production builds");
    return "http://localhost:8080";
  }
  let url;
  try { url = new URL(value); }
  catch { throw new Error("SITE_URL must be a valid absolute URL"); }
  if (!["http:", "https:"].includes(url.protocol) || url.username || url.password ||
      url.pathname !== "/" || url.search || url.hash) {
    throw new Error("SITE_URL must be an origin without credentials, paths, query or fragment");
  }
  if (production && (url.protocol !== "https:" || placeholderHost(url.hostname))) {
    throw new Error("Production SITE_URL must use HTTPS and a non-placeholder public hostname");
  }
  return url.origin;
}

export function resolveTelegramUrl(env = process.env) {
  const value = typeof env.TELEGRAM_URL === "string" ? env.TELEGRAM_URL.trim() : "";
  if (!value) return null;
  let url;
  try { url = new URL(value); }
  catch { return null; }
  if (url.protocol !== "https:" || url.hostname !== "t.me" || url.username || url.password ||
      url.search || url.hash || !/^\/[A-Za-z0-9_]{5,32}\/?$/.test(url.pathname) ||
      url.pathname.toLowerCase().includes("yourchannel")) return null;
  return "https://t.me/" + url.pathname.split("/").filter(Boolean)[0];
}
