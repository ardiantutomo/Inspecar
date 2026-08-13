const trimSlash = (value: string) => value.replace(/\/+$/, "");

export const APP_URL = trimSlash(process.env.APP_URL || "http://localhost:3000");

export const DATA_DIR = process.env.DATA_DIR || "./data";

export const REPORT_PRICE_IDR = Number.parseInt(
  process.env.REPORT_PRICE_IDR || "29000",
  10,
);

export const PAYMENT_MODE = process.env.PAYMENT_MODE === "live" ? "live" : "mock";

export function sessionSecret(): string {
  const secret = process.env.SESSION_SECRET;
  if (secret && secret.length >= 16) return secret;
  if (process.env.NODE_ENV === "production") {
    throw new Error(
      "SESSION_SECRET belum diisi. Buat dengan: openssl rand -hex 32",
    );
  }
  return "dev-only-session-secret-jangan-dipakai-di-produksi";
}

export function adminEmails(): string[] {
  return (process.env.ADMIN_EMAILS || "")
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
}

export const llm = {
  apiKey: process.env.LLM_API_KEY || "",
  baseUrl: trimSlash(process.env.LLM_BASE_URL || "https://api.openai.com/v1"),
  model: process.env.LLM_MODEL || "gpt-4o-mini",
};

export function isLlmConfigured(): boolean {
  return llm.apiKey.length > 0;
}
