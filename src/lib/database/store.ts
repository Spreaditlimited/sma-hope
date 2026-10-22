import "server-only";
import { randomUUID } from "node:crypto";
import { getPool } from "./pool";
// Server-only transition repository: values are parameterised, identifiers are validated,
// and the table allowlist excludes authentication/session tables.
const tables = new Set(["donor_accounts", "donations", "subscriptions", "book_orders", "payment_events", "admin_users"]);
const identifier = (value: string) => {
  if (!/^[a-z_][a-z_0-9]*$/.test(value)) throw new Error("Invalid database field.");
  return `\`${value}\``;
};
const valueFor = (key: string, value: unknown) => {
  if (value === undefined) return null;
  if (value !== null && ["metadata", "payload"].includes(key)) return JSON.stringify(value);
  if (typeof value === "string" && /_at$|_date$/.test(key)) return new Date(value);
  return value;
};
// Existing payment and fulfilment handlers share this narrow result contract.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type StoreResult = { data: any; error: { message: string; code?: string } | null; count?: number };
class Query implements PromiseLike<StoreResult> {
  private fields = "*";
  private filters: string[] = [];
  private values: unknown[] = [];
  private sorts: string[] = [];
  private take = 1000;
  private offset = 0;
  private one = false;
  private required = false;
  private countOnly = false;
  private operation = "select";
  private record: Record<string, unknown> = {};
  private conflict = "id";
  private returning = false;
  constructor(private table: string) {
    if (!tables.has(table)) throw new Error("Unsupported database table.");
  }
  select(fields = "*", options?: { count?: string; head?: boolean }) {
    this.fields = fields === "*" ? "*" : fields.split(",").map(v => identifier(v.trim())).join(",");
    this.countOnly = Boolean(options?.head);
    this.returning = true;
    return this;
  }
  eq(key: string, value: unknown) { this.filters.push(`${identifier(key)} = ?`); this.values.push(valueFor(key,value)); return this; }
  gte(key: string, value: unknown) { this.filters.push(`${identifier(key)} >= ?`); this.values.push(valueFor(key,value)); return this; }
  in(key: string, values: unknown[]) {
    if (!values.length) this.filters.push("1 = 0");
    else { this.filters.push(`${identifier(key)} IN (${values.map(()=>"?").join(",")})`); this.values.push(...values); }
    return this;
  }
  not(key: string, operator: string, value: unknown) {
    if (operator !== "is" || value !== null) throw new Error("Unsupported filter.");
    this.filters.push(`${identifier(key)} IS NOT NULL`); return this;
  }
  or(expression: string) {
    const match = expression.match(/^fez_status\.is\.null,fez_status\.not\.in\.\(([a-z,]+)\)$/);
    if (!match) throw new Error("Unsupported status filter.");
    const values = match[1].split(",");
    this.filters.push(`(fez_status IS NULL OR fez_status NOT IN (${values.map(()=>"?").join(",")}))`);
    this.values.push(...values); return this;
  }
  order(key: string, options?: { ascending?: boolean }) { this.sorts.push(`${identifier(key)} ${options?.ascending === false ? "DESC" : "ASC"}`); return this; }
  limit(value: number) { if (!Number.isSafeInteger(value) || value < 1 || value > 10000) throw new Error("Invalid limit."); this.take = value; return this; }
  range(from: number, to: number) { if (!Number.isSafeInteger(from) || from < 0) throw new Error("Invalid offset."); this.offset = from; return this.limit(to-from+1); }
  single() { this.one = true; this.required = true; return this; }
  maybeSingle() { this.one = true; return this; }
  insert(record: Record<string, unknown>) { this.operation = "insert"; this.record = record; return this; }
  upsert(record: Record<string, unknown>, options: { onConflict: string }) { this.operation = "upsert"; this.record = record; this.conflict = options.onConflict; identifier(this.conflict); return this; }
  update(record: Record<string, unknown>) { this.operation = "update"; this.record = record; return this; }
  delete() { this.operation = "delete"; return this; }
  then<TResult1 = StoreResult, TResult2 = never>(resolve?: ((value: StoreResult) => TResult1 | PromiseLike<TResult1>) | null, reject?: ((reason: unknown) => TResult2 | PromiseLike<TResult2>) | null): PromiseLike<TResult1 | TResult2> {
    return this.execute().then(resolve,reject);
  }
  private async execute(): Promise<StoreResult> {
    try {
      const db = getPool().promise();
      const table = identifier(this.table);
      let where = this.filters.length ? ` WHERE ${this.filters.join(" AND ")}` : "";
      let values = [...this.values];
      if (["insert", "upsert"].includes(this.operation)) {
        const record = { id: randomUUID(), ...this.record };
        const keys = Object.keys(record);
        const updates = Object.keys(this.record).filter(k=>k!=="id" && k!==this.conflict);
        const suffix = this.operation === "upsert" ? ` ON DUPLICATE KEY UPDATE ${updates.length ? updates.map(k=>`${identifier(k)}=VALUES(${identifier(k)})`).join(",") : "id=id"}` : "";
        await db.query(`INSERT INTO ${table} (${keys.map(identifier).join(",")}) VALUES (${keys.map(()=>"?").join(",")})${suffix}`,keys.map(k=>valueFor(k,record[k as keyof typeof record])));
        where = ` WHERE ${identifier(this.operation === "upsert" ? this.conflict : "id")} = ?`;
        values = [this.operation === "upsert" ? this.record[this.conflict] : record.id];
      } else if (this.operation === "update") {
        if (!this.filters.length) throw new Error("Updates must be scoped.");
        const keys = Object.keys(this.record);
        await db.query(`UPDATE ${table} SET ${keys.map(k=>`${identifier(k)}=?`).join(",")}${where}`, [...keys.map(k=>valueFor(k,this.record[k])),...values]);
      } else if (this.operation === "delete") {
        if (!this.filters.length) throw new Error("Deletes must be scoped.");
        await db.query(`DELETE FROM ${table}${where}`,values); return { data:null,error:null };
      }
      if (this.operation !== "select" && !this.returning) return { data:null,error:null };
      if (this.countOnly) {
        const [rows] = await db.query(`SELECT COUNT(*) AS total FROM ${table}${where}`, values);
        return { data:null,error:null,count:Number((rows as {total:number}[])[0].total) };
      }
      const [rows] = await db.query(`SELECT ${this.fields} FROM ${table}${where}${this.sorts.length ? ` ORDER BY ${this.sorts.join(",")}` : ""} LIMIT ${this.one ? 2 : this.take} OFFSET ${this.offset}`,values);
      const data = JSON.parse(JSON.stringify(rows));
      if (this.one && (data.length > 1 || (this.required && data.length !== 1))) return {data:null,error:{message:"Record not found or ambiguous."}};
      return {data:this.one ? data[0] ?? null : data,error:null};
    } catch(error) {
      console.error("Database operation failed", {code:(error as {code?:string}).code || "QUERY_ERROR",table:this.table});
      const duplicate = (error as {code?:string}).code === "ER_DUP_ENTRY";
      return {data:null,error:{message:duplicate ? "Record already exists." : "Database request failed.",code:duplicate ? "23505" : "DATABASE_ERROR"}};
    }
  }
}
export function getDatabase() { return { from: (table: string) => new Query(table) }; }
