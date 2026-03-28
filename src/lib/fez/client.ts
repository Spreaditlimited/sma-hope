import { env } from "@/lib/env";

type UnknownRecord = Record<string, unknown>;

type FezAuthResult = {
  token: string;
  expiresAt: number;
};

type FezOrderInput = {
  reference: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  address: string;
  city: string;
  state: string;
  note?: string;
  quantity: number;
  declaredValueNgn: number;
};

export type FezTrackingUpdate = {
  trackingId: string;
  status: string;
  trackingUrl: string;
  raw: UnknownRecord | null;
};

let cachedAuth: FezAuthResult | null = null;

function trimSlashes(value: string) {
  return value.replace(/^\/+|\/+$/g, "");
}

function composeUrl(path: string) {
  const base = env.fezBaseUrl.replace(/\/$/, "");
  const normalized = trimSlashes(path);
  return `${base}/${normalized}`;
}

function asRecord(value: unknown): UnknownRecord | null {
  if (typeof value !== "object" || value === null) return null;
  return value as UnknownRecord;
}

function firstString(data: unknown, keys: string[]) {
  const record = asRecord(data);
  if (!record) return "";
  for (const key of keys) {
    const value = record[key];
    if (typeof value === "string" && value.trim()) return value.trim();
  }
  return "";
}

function firstNumber(data: unknown, keys: string[]) {
  const record = asRecord(data);
  if (!record) return 0;
  for (const key of keys) {
    const value = record[key];
    if (typeof value === "number" && Number.isFinite(value)) return value;
    if (typeof value === "string" && value.trim()) {
      const parsed = Number(value);
      if (Number.isFinite(parsed)) return parsed;
    }
  }
  return 0;
}

function parseAuthToken(payload: unknown) {
  const data = asRecord(payload);
  const token =
    firstString(data?.authDetails, ["authToken", "token", "access_token", "accessToken", "jwt"]) ||
    firstString(data?.data, ["token", "access_token", "accessToken", "jwt"]) ||
    firstString(data, ["token", "access_token", "accessToken", "jwt"]);
  const expireToken = firstString(data?.authDetails, ["expireToken", "expire_token", "expires_at"]);
  const expiresIn =
    firstNumber(data?.data, ["expires_in", "expiresIn", "ttl"]) ||
    firstNumber(data, ["expires_in", "expiresIn", "ttl"]);
  const parsedExpiryMs = expireToken ? Date.parse(expireToken.replace(" ", "T")) : NaN;
  const expiresAtFromDate = Number.isFinite(parsedExpiryMs) ? parsedExpiryMs : 0;
  return {
    token,
    expiresAt: expiresAtFromDate || Date.now() + Math.max(60, expiresIn || 3600) * 1000,
  };
}

function normalizeStatus(rawStatus: string) {
  const value = rawStatus.trim().toLowerCase();
  if (!value) return "";
  if (value.includes("deliver")) return "delivered";
  if (value.includes("transit")) return "in_transit";
  if (value.includes("pickup") || value.includes("picked")) return "picked_up";
  if (value.includes("fail")) return "failed";
  if (value.includes("cancel")) return "cancelled";
  if (value.includes("return")) return "returned";
  if (value.includes("pending")) return "pending";
  return value;
}

function parseTrackingFromPayload(payload: unknown): FezTrackingUpdate {
  const root = asRecord(payload) || {};
  const data = asRecord(root.data) || root;

  const trackingId =
    firstString(data, ["orderNo", "order_no", "orderNumber", "tracking_id", "trackingId", "id", "waybill"]) ||
    firstString(root, ["orderNo", "order_no", "orderNumber", "tracking_id", "trackingId", "id", "waybill"]);
  const rawStatus =
    firstString(data, ["orderStatus", "order_status", "status", "delivery_status"]) ||
    firstString(root, ["orderStatus", "order_status", "status", "delivery_status"]);
  const status = normalizeStatus(rawStatus);
  const trackingUrl =
    firstString(data, ["tracking_url", "trackingUrl", "track_url", "trackUrl"]) ||
    firstString(root, ["tracking_url", "trackingUrl", "track_url", "trackUrl"]);

  const fallbackTrackingUrl =
    trackingUrl ||
    (env.fezPublicTrackingUrlTemplate && trackingId
      ? env.fezPublicTrackingUrlTemplate.replace("{orderNumber}", trackingId).replace("{trackingId}", trackingId)
      : "");

  return {
    trackingId,
    status,
    trackingUrl: fallbackTrackingUrl,
    raw: asRecord(payload),
  };
}

export function isFezConfigured() {
  return Boolean(env.fezBaseUrl && env.fezOrgSecretKey && env.fezUserId && env.fezPassword);
}

async function authenticateFez() {
  if (cachedAuth && cachedAuth.expiresAt > Date.now() + 15_000) {
    return cachedAuth.token;
  }

  const response = await fetch(composeUrl(env.fezAuthPath), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      user_id: env.fezUserId,
      password: env.fezPassword,
    }),
  });

  const payload = (await response.json().catch(() => null)) as unknown;
  const parsed = parseAuthToken(payload);
  if (!response.ok || !parsed.token) {
    throw new Error("Unable to authenticate FEZ API.");
  }

  cachedAuth = parsed;
  return parsed.token;
}

async function callFez(path: string, init: RequestInit = {}) {
  const token = await authenticateFez();
  const headers = new Headers(init.headers || {});
  headers.set("secret-key", env.fezOrgSecretKey);
  headers.set("Authorization", `Bearer ${token}`);
  if (init.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const response = await fetch(composeUrl(path), {
    ...init,
    headers,
  });
  const payload = (await response.json().catch(() => null)) as unknown;
  return { response, payload };
}

export async function createFezShipment(input: FezOrderInput): Promise<FezTrackingUpdate> {
  const payload = {
    delivery_type: "local",
    order_reference: input.reference,
    orderReference: input.reference,
    package_description: "When Every Breath Matters",
    package_quantity: input.quantity,
    declared_value: input.declaredValueNgn,
    declaredValue: input.declaredValueNgn,
    customer_name: input.customerName,
    customer_email: input.customerEmail,
    customer_phone: input.customerPhone,
    recipient_name: input.customerName,
    recipient_email: input.customerEmail,
    recipient_phone: input.customerPhone,
    drop_off_address: input.address,
    drop_off_city: input.city,
    drop_off_state: input.state,
    note: input.note || "",
    pickup_state: "lagos",
  };

  const { response, payload: responsePayload } = await callFez(env.fezCreateOrderPath, {
    method: "POST",
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    throw new Error("Failed to create FEZ shipment.");
  }

  const tracking = parseTrackingFromPayload(responsePayload);
  if (!tracking.trackingId) {
    throw new Error("FEZ shipment response did not include an order/tracking id.");
  }
  return tracking;
}

export async function getFezShipmentTracking(orderNumber: string): Promise<FezTrackingUpdate> {
  const path = env.fezTrackOrderPathTemplate.replace("{orderNumber}", encodeURIComponent(orderNumber));
  const { response, payload } = await callFez(path, { method: "GET" });
  if (!response.ok) {
    throw new Error("Failed to fetch FEZ tracking status.");
  }

  const tracking = parseTrackingFromPayload(payload);
  if (!tracking.trackingId) {
    tracking.trackingId = orderNumber;
  }
  return tracking;
}

export function parseFezWebhookTracking(payload: unknown): FezTrackingUpdate {
  return parseTrackingFromPayload(payload);
}

export async function testFezConnection() {
  const token = await authenticateFez();
  return {
    ok: true,
    tokenPrefix: token.slice(0, 8),
    expiresAtIso: cachedAuth ? new Date(cachedAuth.expiresAt).toISOString() : "",
  };
}
