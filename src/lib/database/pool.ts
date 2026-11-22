import "server-only";
import { createPool, type Pool } from "mysql2";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
const shared = globalThis as typeof globalThis & { smahopePool?: Pool };
export function getPool() {
  if (shared.smahopePool) return shared.smahopePool;
  if (process.env.NODE_ENV !== "production" && process.env.SMAHOPE_TEST_DATABASE_URL) {
    const test = new URL(process.env.SMAHOPE_TEST_DATABASE_URL);
    if(test.host!=="127.0.0.1:33317" || test.username!=="smahope_test" || test.pathname!=="/smahope_test" || !test.password)throw new Error("Invalid isolated test database");
    shared.smahopePool=createPool({host:test.hostname,port:33317,user:test.username,password:decodeURIComponent(test.password),database:"smahope_test",connectionLimit:3,timezone:"Z",decimalNumbers:true});
    return shared.smahopePool;
  }
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
