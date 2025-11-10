import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import type { Mock } from "vitest";

import type { NextRequest } from "next/server";

vi.mock("@/lib/esim", () => ({
  listAllCountries: vi.fn(),
  listPlansByLocation: vi.fn(),
}));

describe("GET /api/catalog", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("returns the list of countries when no country code is provided", async () => {
    const { listAllCountries } = await import("@/lib/esim");
    (listAllCountries as unknown as Mock).mockResolvedValue(["US", "GB"]);

    const { GET } = await import("./route");

    const request = {
      nextUrl: new URL("http://localhost/api/catalog"),
    } as unknown as NextRequest;

    const response = await GET(request);
    expect(response.status).toBe(200);
    const body = await response.json();

    expect(body.countries).toEqual(["US", "GB"]);
    expect(body.markup_pct).toBe(Number(process.env.DEFAULT_MARKUP_PCT ?? 35));
    expect(body.currency).toBe(process.env.DEFAULT_CURRENCY ?? "USD");
  });

  it("returns catalog data for the requested country", async () => {
    const { listPlansByLocation } = await import("@/lib/esim");
    (listPlansByLocation as unknown as Mock).mockResolvedValue({
      countryCode: "US",
      plans: [
        {
          slug: "base-plan",
          packageCode: "BASE-1",
          dataGb: 5,
          wholesalePriceCents: 1500,
          retailPriceCents: 1500,
          periodDays: 7,
          currency: "USD",
        },
      ],
      markupPct: 18,
      markup_pct: 18,
      currency: "USD",
    });

    const { GET } = await import("./route");

    const request = {
      nextUrl: new URL("http://localhost/api/catalog?countryCode=US"),
    } as unknown as NextRequest;

    const response = await GET(request);
    expect(response.status).toBe(200);
    const body = await response.json();

    expect(body.countryCode).toBe("US");
    expect(body.plans).toHaveLength(1);
    expect(body.topupPlans).toBeUndefined();
  });
});
