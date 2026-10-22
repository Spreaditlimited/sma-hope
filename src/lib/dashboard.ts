export type DonationMetric = {
  amount_major: number | string;
  currency: string;
  status: string;
  donation_interval?: string;
  created_at?: string;
};
export function isSuccessful(status: string) {
  return ["success", "successful", "paid", "completed"].includes(String(status).toLowerCase());
}
export function donationTotals(rows: DonationMetric[]) {
  const totals: Record<string, number> = {};
  for (const row of rows) {
    if (!isSuccessful(row.status)) continue;
    const amount = Number(row.amount_major);
    if (!Number.isFinite(amount)) continue;
    const currency = String(row.currency || "UNKNOWN").toUpperCase();
    totals[currency] = Math.round(((totals[currency] || 0) + amount) * 100) / 100;
  }
  return totals;
}
export function formatMoney(amount: number, currency = "NGN") {
  try {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch {
    return `${currency} ${amount.toLocaleString("en-NG")}`;
  }
}
export function displayDate(date: string) {
  return new Date(date).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "Africa/Lagos",
  });
}
