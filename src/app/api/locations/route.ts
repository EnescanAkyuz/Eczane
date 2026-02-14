import { NextResponse } from "next/server";

import { getCities, getDistrictsByCity } from "@/lib/eczane-source";
import { toSlug } from "@/lib/text";

export const runtime = "nodejs";

const SEO_SAFE_HEADERS = {
  "x-robots-tag": "noindex, nofollow",
};

export async function GET(request: Request) {
  const url = new URL(request.url);
  const rawCity = url.searchParams.get("city");

  try {
    if (rawCity) {
      const citySlug = toSlug(rawCity);
      const districts = await getDistrictsByCity(citySlug);
      return NextResponse.json(
        { city: citySlug, districts },
        {
          headers: {
            ...SEO_SAFE_HEADERS,
            "cache-control": "public, s-maxage=3600, stale-while-revalidate=3600",
          },
        },
      );
    }

    const cities = await getCities();
    return NextResponse.json(
      { cities },
      {
        headers: {
          ...SEO_SAFE_HEADERS,
          "cache-control": "public, s-maxage=3600, stale-while-revalidate=3600",
        },
      },
    );
  } catch (error: unknown) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Konum bilgileri alinamadi",
      },
      { headers: SEO_SAFE_HEADERS, status: 500 },
    );
  }
}
