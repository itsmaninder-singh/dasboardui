import dotenv from "dotenv";
dotenv.config();

function required(name: string, fallback?: string): string {
  const value = process.env[name] ?? fallback;
  if (value === undefined) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

export const env = {
  NODE_ENV: process.env.NODE_ENV ?? "development",
  PORT: parseInt(process.env.PORT ?? "4000", 10),
  FRONTEND_URL: required("FRONTEND_URL", "http://localhost:3000"),

  DATABASE_URL: required("DATABASE_URL"),

  JWT_ACCESS_SECRET: required("JWT_ACCESS_SECRET"),
  JWT_REFRESH_SECRET: required("JWT_REFRESH_SECRET"),
  JWT_ACCESS_EXPIRES_IN: process.env.JWT_ACCESS_EXPIRES_IN ?? "15m",
  JWT_REFRESH_EXPIRES_IN: process.env.JWT_REFRESH_EXPIRES_IN ?? "7d",

  COOKIE_NAME: process.env.COOKIE_NAME ?? "refreshToken",
  COOKIE_SECURE: (process.env.COOKIE_SECURE ?? "false") === "true",
  COOKIE_SAME_SITE: (process.env.COOKIE_SAME_SITE ?? "lax") as "lax" | "strict" | "none",
  COOKIE_DOMAIN: process.env.COOKIE_DOMAIN,

  REFRESH_TOKEN_TTL_MS: 7 * 24 * 60 * 60 * 1000, // 7 days, mirrors JWT_REFRESH_EXPIRES_IN
};
