import crypto from "crypto";

const BASE = "https://api.esimaccess.com";
const ACCESS = process.env.ESIM_ACCESS_CODE!;
const SECRET = process.env.ESIM_SECRET!;
const CURRENCY = process.env.DEFAULT_CURRENCY || "USD";

function sign(body: any) {
  const ts = Date.now().toString();
  const rid = crypto.randomUUID();
  const raw = JSON.stringify(body ?? {});
  const sigStr = ts + rid + ACCESS + raw;
  const sig = crypto.createHmac("sha256", SECRET).update(sigStr).digest("hex").toLowerCase();
  return {
    "RT-AccessCode": ACCESS,
    "RT-Timestamp": ts,
    "RT-RequestID": rid,
    "RT-Signature": sig,
    "Content-Type": "application/json",
  };
}

/** Attempt to parse data allowance (GB) from different potential fields */
function getGb(p: any): number {
  // common fields seen across eSIM vendors
  if (typeof p.dataGb === "number") return p.dataGb;
  if (typeof p.flowGb === "number") return p.flowGb;
  if (typeof p.flow === "number") return p.flow / 1024;       // flow in MB
  if (typeof p.traffic === "number") return p.traffic / 1024; // traffic in MB
  if (typeof p.data === "number") return p.data / 1024;       // data in MB

  const tryStr = (s?: string) => {
    if (!s) return NaN;
    const m = s.match(/(\d+(\.\d+)?)\s*([gG][bB])/);
    return m ? parseFloat(m[1]) : NaN;
  };

  return (
    tryStr(p.packageName) ||
    tryStr(p.name) ||
    tryStr(p.title) ||
    tryStr(p.slug) ||
    0
  );
}

/**
 * Returns normalized plans for a country or region.
 * Output:
 *  { countryCode, plans: [{slug, packageCode, dataGb, priceCents, periodDays}] }
 */
export async function listPlansByLocation(locationCode: string) {
  const body = { locationCode, type: "BASE", slug: "", packageCode: "" };
  const r = await fetch(`${BASE}/api/v1/open/package/list`, {
    method: "POST",
    headers: sign(body),
    body: JSON.stringify(body),
    cache: "no-store",
  });

  if (!r.ok) throw new Error(`eSIMAccess list failed ${r.status}`);

  const json = await r.json();
  const list = json?.obj?.packageList ?? [];

  const plans = list.map((p: any) => {
    const dataGb = Number(getGb(p)) || 0;
    const priceCents =
      Number(p.wholesalePriceCents ?? p.priceCents ?? p.price1e2 ?? 0);
    const periodDays = Number(p.periodNum ?? p.validDays ?? 30);

    return {
      slug: p.slug ?? p.packageName ?? p.packageCode,
      packageCode: p.packageCode ?? p.code,
      dataGb,
      priceCents,
      periodDays,
      currency: CURRENCY,
    };
  })
  // only keep ones we can render (with a data amount and a price)
  .filter((p: any) => p.dataGb > 0 && p.priceCents > 0);

  // sort by GB asc
  plans.sort((a: any, b: any) => a.dataGb - b.dataGb);

  return { countryCode: locationCode, plans };
}

/** Countries helper (very simple): unique location codes from the API */
export async function listAllCountries() {
  // Ask for "ALL" then dedupe by locationCode
  const body = { locationCode: "", type: "BASE", slug: "", packageCode: "" };
  const r = await fetch(`${BASE}/api/v1/open/package/list`, {
    method: "POST",
    headers: sign(body),
    body: JSON.stringify(body),
    cache: "no-store",
  });
  if (!r.ok) throw new Error("countries fetch failed");

  const json = await r.json();
  const list = json?.obj?.packageList ?? [];
  const codes = Array.from(new Set(list.map((p: any) => p.locationCode).filter(Boolean))).sort();
  return codes;
}
