import { NextResponse } from "next/server";

import { getDutyPharmaciesBySelection } from "@/lib/pharmacy-service";
import { toSlug } from "@/lib/text";

export const runtime = "nodejs";
const SEO_SAFE_HEADERS = {
  "x-robots-tag": "noindex, nofollow",
};

export async function GET(request: Request) {
  const url = new URL(request.url);
  const city = toSlug(url.searchParams.get("city") ?? "");
  const district = toSlug(url.searchParams.get("district") ?? "");

  if (!city || !district) {
    return NextResponse.json(
      { error: "Sehir ve ilce parametreleri zorunludur" },
      { headers: SEO_SAFE_HEADERS, status: 400 },
    );
  }

  try {
    const result = await getDutyPharmaciesBySelection(city, district);
    if (!result.pharmacies.length) {
      return NextResponse.json(
        { error: "Secilen bolge için aktif nöbetçi eczane bulunamadi" },
        { headers: SEO_SAFE_HEADERS, status: 404 },
      );
    }

    return NextResponse.json(result, {
      headers: {
        ...SEO_SAFE_HEADERS,
        "cache-control": "public, s-maxage=120, stale-while-revalidate=300",
      },
    });
  } catch (error: unknown) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Nöbetçi eczane listesi alinamadi",
      },
      { headers: SEO_SAFE_HEADERS, status: 500 },
    );
  }
}
