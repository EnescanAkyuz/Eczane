import { NextResponse } from "next/server";

import { getNearestDutyPharmacies } from "@/lib/pharmacy-service";

export const runtime = "nodejs";
const SEO_SAFE_HEADERS = {
  "x-robots-tag": "noindex, nofollow",
};

function toNumber(value: string | null): number | null {
  if (!value) {
    return null;
  }

  const numeric = Number.parseFloat(value);
  return Number.isFinite(numeric) ? numeric : null;
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const lat = toNumber(url.searchParams.get("lat"));
  const lng = toNumber(url.searchParams.get("lng"));

  if (lat === null || lng === null) {
    return NextResponse.json(
      { error: "Gecerli lat ve lng parametreleri gereklidir" },
      { headers: SEO_SAFE_HEADERS, status: 400 },
    );
  }

  if (lat < 35 || lat > 43 || lng < 25 || lng > 46) {
    return NextResponse.json(
      { error: "Konum Turkiye sinirlari disinda gorunuyor" },
      { headers: SEO_SAFE_HEADERS, status: 400 },
    );
  }

  try {
    const result = await getNearestDutyPharmacies(lat, lng);
    if (!result.pharmacies.length) {
      return NextResponse.json(
        { error: "Bu konum icin nöbetçi eczane bulunamadi" },
        { headers: SEO_SAFE_HEADERS, status: 404 },
      );
    }

    return NextResponse.json(result, {
      headers: {
        ...SEO_SAFE_HEADERS,
        "cache-control": "public, s-maxage=60, stale-while-revalidate=180",
      },
    });
  } catch (error: unknown) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "En yakın nöbetçi eczane su anda bulunamiyor",
      },
      { headers: SEO_SAFE_HEADERS, status: 500 },
    );
  }
}
