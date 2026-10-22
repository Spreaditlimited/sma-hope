import "server-only";
import { createPool, type Pool } from "mysql2";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
const shared = globalThis as typeof globalThis & { smahopePool?: Pool };
export function getPool() {
  if (shared.smahopePool) return shared.smahopePool;
  const url = new URL(process.env.SMAHOPE_DATABASE_URL || "mysql://invalid");
  if (url.username !== "smahope_app" || url.pathname !== "/smahope" || !url.password ||
    !["195.35.29.41:3308", "127.0.0.1:13309"].includes(url.host)) {
    throw new Error("SMA Hope database is not configured.");
  }
  const pool = createPool({
    host: url.hostname, port: Number(url.port), user: url.username,
    password: decodeURIComponent(url.password), database: "smahope",
    ssl: { ca: readFileSync(resolve(process.cwd(), "certificates/mysql-ca.pem")), rejectUnauthorized: true },
    connectionLimit: process.env.VERCEL ? 2 : 3, maxIdle: 0, waitForConnections: true, queueLimit: 30,
    connectTimeout: 10000, idleTimeout: 30000, timezone: "Z", decimalNumbers: true,
  });
  shared.smahopePool = pool;
  return pool;
}
