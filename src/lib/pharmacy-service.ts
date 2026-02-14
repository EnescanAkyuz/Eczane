import { mapLimit } from "@/lib/async";
import { withCache } from "@/lib/cache";
import {
  CACHE_TTL_MS,
  NOMINATIM_BASE_URL,
  OSRM_BASE_URL,
  SCRAPER_USER_AGENT,
  SOURCE_BASE_URL,
} from "@/lib/constants";
import {
  getCities,
  getDistrictDutyPharmacies,
  getDistrictsByCity,
  getPharmacyDetails,
} from "@/lib/eczane-source";
import { distanceToPolylineKm, haversineDistanceKm, polylineDistanceKm } from "@/lib/geo";
import type {
  CityOption,
  Coordinate,
  DistrictOption,
  GeocodeResult,
  Pharmacy,
  RouteInfo,
} from "@/lib/types";
import { normalizeForCompare, removeDistrictSuffix, toSlug } from "@/lib/text";

type ReverseGeocodePayload = {
  address?: Record<string, string | undefined>;
  display_name?: string;
};

type NominatimSearchItem = {
  display_name?: string;
  lat?: string;
  lon?: string;
};

type OsrmRoutePayload = {
  routes?: Array<{
    distance?: number;
    duration?: number;
    geometry?: {
      coordinates?: number[][];
      type?: string;
    };
  }>;
};

type LocationSelection = {
  city: CityOption;
  district: DistrictOption;
  geocode: GeocodeResult;
};

export type PharmacySearchResult = {
  context: {
    city: CityOption;
    district: DistrictOption;
    coverage?: "city" | "district";
    geocode?: GeocodeResult;
    origin?: Coordinate;
  };
  fetchedAt: string;
  pharmacies: Pharmacy[];
  route?: RouteInfo;
  shiftLabel: string;
  sourcePath: string;
};

function getFallbackMapUrl(pharmacy: Pick<Pharmacy, "name" | "address">): string {
  const query = encodeURIComponent(`${pharmacy.name} ${pharmacy.address}`);
  return `https://www.google.com/maps/search/?api=1&query=${query}`;
}

function parseCityCandidate(
  address: Record<string, string | undefined> | undefined,
): string {
  if (!address) {
    return "";
  }

  return (
    address.city ??
    address.province ??
    address.state_district ??
    address.state ??
    address.region ??
    ""
  ).trim();
}

function parseDistrictCandidates(
  address: Record<string, string | undefined> | undefined,
): string[] {
  if (!address) {
    return [];
  }

  const candidates = [
    address.city_district,
    address.town,
    address.county,
    address.municipality,
    address.district,
    address.suburb,
    address.borough,
    address.village,
  ]
    .filter((value): value is string => Boolean(value))
    .map((value) => removeDistrictSuffix(value));

  return Array.from(new Set(candidates.filter(Boolean)));
}

async function reverseGeocode(lat: number, lng: number): Promise<GeocodeResult> {
  const roundedLat = lat.toFixed(3);
  const roundedLng = lng.toFixed(3);

  return withCache(
    `reverse:${roundedLat}:${roundedLng}`,
    CACHE_TTL_MS.reverseGeocode,
    async () => {
      const url = new URL(`${NOMINATIM_BASE_URL}/reverse`);
      url.searchParams.set("lat", String(lat));
      url.searchParams.set("lon", String(lng));
      url.searchParams.set("format", "jsonv2");
      url.searchParams.set("addressdetails", "1");
      url.searchParams.set("zoom", "18");
      url.searchParams.set("accept-language", "tr");

      const response = await fetch(url, {
        cache: "no-store",
        headers: {
          "accept-language": "tr-TR,tr;q=0.9,en-US;q=0.6",
          "user-agent": SCRAPER_USER_AGENT,
        },
      });

      if (!response.ok) {
        throw new Error(`Konum cozumlenemedi (${response.status})`);
      }

      const payload = (await response.json()) as ReverseGeocodePayload;
      const city = parseCityCandidate(payload.address);
      const districtCandidates = parseDistrictCandidates(payload.address);

      return {
        city: city || undefined,
        district: districtCandidates[0] || undefined,
        districtCandidates,
        displayName: payload.display_name,
        neighborhood: payload.address?.suburb?.trim() || undefined,
      };
    },
  );
}

function scoreBySimilarity(target: string, candidate: string): number {
  const normalizedTarget = normalizeForCompare(target);
  const normalizedCandidate = normalizeForCompare(candidate);
  const slugTarget = toSlug(normalizedTarget);
  const slugCandidate = toSlug(normalizedCandidate);

  if (!normalizedTarget || !normalizedCandidate) {
    return 0;
  }

  if (normalizedTarget === normalizedCandidate || slugTarget === slugCandidate) {
    return 100;
  }

  if (
    normalizedTarget.includes(normalizedCandidate) ||
    normalizedCandidate.includes(normalizedTarget) ||
    slugTarget.includes(slugCandidate) ||
    slugCandidate.includes(slugTarget)
  ) {
    return 60;
  }

  if (
    normalizedTarget.startsWith(normalizedCandidate) ||
    normalizedCandidate.startsWith(normalizedTarget)
  ) {
    return 40;
  }

  return 0;
}

async function resolveCityFromName(cityName: string): Promise<CityOption | null> {
  const cities = await getCities();
  if (!cities.length) {
    return null;
  }

  let bestCity: CityOption | null = null;
  let bestScore = 0;
  for (const city of cities) {
    const score =
      scoreBySimilarity(city.name, cityName) + scoreBySimilarity(city.slug, cityName);
    if (score > bestScore) {
      bestScore = score;
      bestCity = city;
    }
  }

  return bestScore > 0 ? bestCity : null;
}

async function resolveDistrictFromCandidates(
  city: CityOption,
  candidates: string[],
): Promise<DistrictOption | null> {
  const districts = await getDistrictsByCity(city.slug);
  if (!districts.length) {
    return null;
  }

  if (!candidates.length) {
    return districts[0];
  }

  let bestDistrict: DistrictOption | null = null;
  let bestScore = 0;

  for (const district of districts) {
    for (const candidate of candidates) {
      const score =
        scoreBySimilarity(district.name, candidate) +
        scoreBySimilarity(district.slug, candidate);
      if (score > bestScore) {
        bestScore = score;
        bestDistrict = district;
      }
    }
  }

  return bestScore > 0 ? bestDistrict : districts[0];
}

async function resolveSelectionFromCoordinates(
  lat: number,
  lng: number,
): Promise<LocationSelection> {
  const geocode = await reverseGeocode(lat, lng);
  if (!geocode.city) {
    throw new Error("Konumdan sehir bilgisi alinamadi");
  }

  const city = await resolveCityFromName(geocode.city);
  if (!city) {
    throw new Error("Sehir eslestirilemedi");
  }

  const district = await resolveDistrictFromCandidates(city, geocode.districtCandidates);
  if (!district) {
    throw new Error("Ilce eslestirilemedi");
  }

  return {
    city,
    district,
    geocode,
  };
}

async function geocodeDestination(
  query: string,
  origin?: Coordinate,
): Promise<{ coordinate: Coordinate; label: string }> {
  const trimmedQuery = query.trim();
  if (!trimmedQuery) {
    throw new Error("Varis noktasi bos olamaz");
  }

  const cacheKey = `geocode-destination:${normalizeForCompare(trimmedQuery)}:${origin?.lat.toFixed(2) ?? ""}:${origin?.lng.toFixed(2) ?? ""}`;

  return withCache(cacheKey, CACHE_TTL_MS.destinationGeocode, async () => {
    const url = new URL(`${NOMINATIM_BASE_URL}/search`);
    url.searchParams.set("q", trimmedQuery);
    url.searchParams.set("format", "jsonv2");
    url.searchParams.set("addressdetails", "1");
    url.searchParams.set("accept-language", "tr");
    url.searchParams.set("countrycodes", "tr");
    url.searchParams.set("limit", "1");

    if (origin) {
      url.searchParams.set("lat", String(origin.lat));
      url.searchParams.set("lon", String(origin.lng));
    }

    const response = await fetch(url, {
      cache: "no-store",
      headers: {
        "accept-language": "tr-TR,tr;q=0.9,en-US;q=0.6",
        "user-agent": SCRAPER_USER_AGENT,
      },
    });

    if (!response.ok) {
      throw new Error(`Varis noktasi cozumlenemedi (${response.status})`);
    }

    const payload = (await response.json()) as NominatimSearchItem[];
    const first = payload[0];
    if (!first?.lat || !first?.lon) {
      throw new Error("Varis noktasi bulunamadi");
    }

    const lat = Number.parseFloat(first.lat);
    const lng = Number.parseFloat(first.lon);
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
      throw new Error("Varis noktasi koordinati gecersiz");
    }

    return {
      coordinate: { lat, lng },
      label: first.display_name?.trim() || trimmedQuery,
    };
  });
}

async function fetchRoute(origin: Coordinate, destination: Coordinate): Promise<RouteInfo> {
  const key = `osrm:${origin.lat.toFixed(4)}:${origin.lng.toFixed(4)}:${destination.lat.toFixed(4)}:${destination.lng.toFixed(4)}`;

  return withCache(key, CACHE_TTL_MS.routeGeometry, async () => {
    const url = new URL(
      `${OSRM_BASE_URL}/route/v1/driving/${origin.lng},${origin.lat};${destination.lng},${destination.lat}`,
    );
    url.searchParams.set("overview", "full");
    url.searchParams.set("geometries", "geojson");
    url.searchParams.set("steps", "false");
    url.searchParams.set("alternatives", "false");

    const response = await fetch(url, {
      cache: "no-store",
      headers: {
        "user-agent": SCRAPER_USER_AGENT,
      },
    });

    if (!response.ok) {
      return {
        destination,
        destinationLabel: `${destination.lat}, ${destination.lng}`,
        path: [origin, destination],
      };
    }

    const payload = (await response.json()) as OsrmRoutePayload;
    const route = payload.routes?.[0];
    const coordinates = route?.geometry?.coordinates ?? [];

    const path = coordinates
      .map((point) => ({
        lat: Number(point[1]),
        lng: Number(point[0]),
      }))
      .filter((point) => Number.isFinite(point.lat) && Number.isFinite(point.lng));

    const finalPath = path.length > 1 ? path : [origin, destination];
    const distanceKm =
      route?.distance && Number.isFinite(route.distance)
        ? route.distance / 1000
        : polylineDistanceKm(finalPath);
    const durationMin =
      route?.duration && Number.isFinite(route.duration)
        ? route.duration / 60
        : undefined;

    return {
      destination,
      destinationLabel: `${destination.lat}, ${destination.lng}`,
      distanceKm,
      durationMin,
      path: finalPath,
    };
  });
}

async function enrichPharmacies(pharmacies: Pharmacy[]): Promise<Pharmacy[]> {
  const enriched = await mapLimit(pharmacies, 4, async (pharmacy) => {
    try {
      const details = await getPharmacyDetails(pharmacy.detailPath);
      return {
        ...pharmacy,
        latitude: details.latitude,
        longitude: details.longitude,
        mapUrl: details.mapUrl ?? getFallbackMapUrl(pharmacy),
      };
    } catch {
      return {
        ...pharmacy,
        mapUrl: getFallbackMapUrl(pharmacy),
      };
    }
  });

  return enriched;
}

function sortByDistance(pharmacies: Pharmacy[], origin: Coordinate): Pharmacy[] {
  return pharmacies
    .map((pharmacy) => {
      if (pharmacy.latitude === undefined || pharmacy.longitude === undefined) {
        return pharmacy;
      }

      return {
        ...pharmacy,
        distanceKm: haversineDistanceKm(
          origin.lat,
          origin.lng,
          pharmacy.latitude,
          pharmacy.longitude,
        ),
      };
    })
    .sort((a, b) => {
      if (a.distanceKm === undefined && b.distanceKm === undefined) {
        return a.name.localeCompare(b.name, "tr");
      }
      if (a.distanceKm === undefined) {
        return 1;
      }
      if (b.distanceKm === undefined) {
        return -1;
      }
      return a.distanceKm - b.distanceKm;
    });
}

function dedupePharmacies(pharmacies: Pharmacy[]): Pharmacy[] {
  const map = new Map<string, Pharmacy>();

  for (const pharmacy of pharmacies) {
    const existing = map.get(pharmacy.id);
    if (!existing) {
      map.set(pharmacy.id, pharmacy);
      continue;
    }

    if (
      existing.latitude === undefined &&
      existing.longitude === undefined &&
      pharmacy.latitude !== undefined &&
      pharmacy.longitude !== undefined
    ) {
      map.set(pharmacy.id, pharmacy);
    }
  }

  return Array.from(map.values());
}

function getLatestTimestamp(results: PharmacySearchResult[]): string {
  const latest = results.reduce((maxDate, item) => {
    const current = Date.parse(item.fetchedAt);
    if (!Number.isFinite(current)) {
      return maxDate;
    }
    return Math.max(maxDate, current);
  }, 0);

  return latest > 0 ? new Date(latest).toISOString() : new Date().toISOString();
}

function sortForRoute(
  pharmacies: Pharmacy[],
  origin: Coordinate,
  path: Coordinate[],
): Pharmacy[] {
  return pharmacies
    .map((pharmacy) => {
      if (pharmacy.latitude === undefined || pharmacy.longitude === undefined) {
        return pharmacy;
      }

      const distanceKm = haversineDistanceKm(
        origin.lat,
        origin.lng,
        pharmacy.latitude,
        pharmacy.longitude,
      );
      const routeDistanceKm = distanceToPolylineKm(
        { lat: pharmacy.latitude, lng: pharmacy.longitude },
        path,
      );

      return {
        ...pharmacy,
        distanceKm,
        routeDistanceKm,
      };
    })
    .sort((a, b) => {
      if (a.routeDistanceKm === undefined && b.routeDistanceKm !== undefined) {
        return 1;
      }
      if (a.routeDistanceKm !== undefined && b.routeDistanceKm === undefined) {
        return -1;
      }
      if (
        a.routeDistanceKm !== undefined &&
        b.routeDistanceKm !== undefined &&
        a.routeDistanceKm !== b.routeDistanceKm
      ) {
        return a.routeDistanceKm - b.routeDistanceKm;
      }
      if (a.distanceKm === undefined && b.distanceKm !== undefined) {
        return 1;
      }
      if (a.distanceKm !== undefined && b.distanceKm === undefined) {
        return -1;
      }
      if (
        a.distanceKm !== undefined &&
        b.distanceKm !== undefined &&
        a.distanceKm !== b.distanceKm
      ) {
        return a.distanceKm - b.distanceKm;
      }
      return a.name.localeCompare(b.name, "tr");
    });
}

export async function getDutyPharmaciesBySelection(
  citySlug: string,
  districtSlug: string,
): Promise<PharmacySearchResult> {
  const cities = await getCities();
  const city = cities.find((item) => item.slug === citySlug);
  if (!city) {
    throw new Error("Sehir bulunamadi");
  }

  const districts = await getDistrictsByCity(city.slug);
  const district = districts.find((item) => item.slug === districtSlug);
  if (!district) {
    throw new Error("Ilce bulunamadi");
  }

  const dutyResult = await getDistrictDutyPharmacies(city.slug, district.slug);
  const basePharmacies: Pharmacy[] = dutyResult.pharmacies.map((pharmacy) => ({
    ...pharmacy,
    mapUrl: getFallbackMapUrl(pharmacy),
  }));
  const pharmacies = await enrichPharmacies(basePharmacies);

  return {
    context: {
      city,
      district,
    },
    fetchedAt: dutyResult.fetchedAt,
    pharmacies,
    shiftLabel: dutyResult.shiftLabel,
    sourcePath: `${SOURCE_BASE_URL}${dutyResult.sourcePath}`,
  };
}

export async function getNearestDutyPharmacies(
  lat: number,
  lng: number,
): Promise<PharmacySearchResult> {
  const selection = await resolveSelectionFromCoordinates(lat, lng);
  const primaryResult = await getDutyPharmaciesBySelection(
    selection.city.slug,
    selection.district.slug,
  );
  const origin = { lat, lng };
  const districts = await getDistrictsByCity(selection.city.slug).catch(() => []);

  const shouldFetchCityWide =
    districts.length > 1 &&
    (selection.city.districtCount ?? districts.length) <= 25;

  if (!shouldFetchCityWide) {
    return {
      ...primaryResult,
      context: {
        ...primaryResult.context,
        coverage: "district",
        geocode: selection.geocode,
        origin,
      },
      pharmacies: sortByDistance(primaryResult.pharmacies, origin),
    };
  }

  const cityResults = await mapLimit(districts, 4, async (district) => {
    try {
      return await getDutyPharmaciesBySelection(selection.city.slug, district.slug);
    } catch {
      return null;
    }
  });
  const validResults = cityResults.filter(
    (item): item is PharmacySearchResult => item !== null,
  );

  if (!validResults.length) {
    return {
      ...primaryResult,
      context: {
        ...primaryResult.context,
        coverage: "district",
        geocode: selection.geocode,
        origin,
      },
      pharmacies: sortByDistance(primaryResult.pharmacies, origin),
    };
  }

  const combinedPharmacies = dedupePharmacies(
    validResults.flatMap((result) => result.pharmacies),
  );
  const sortedCityPharmacies = sortByDistance(combinedPharmacies, origin);
  const hasWiderCoverage =
    sortedCityPharmacies.length > primaryResult.pharmacies.length;

  if (!hasWiderCoverage) {
    return {
      ...primaryResult,
      context: {
        ...primaryResult.context,
        coverage: "district",
        geocode: selection.geocode,
        origin,
      },
      pharmacies: sortByDistance(primaryResult.pharmacies, origin),
    };
  }

  return {
    ...primaryResult,
    context: {
      ...primaryResult.context,
      coverage: "city",
      geocode: selection.geocode,
      origin,
    },
    fetchedAt: getLatestTimestamp(validResults),
    pharmacies: sortedCityPharmacies,
    sourcePath: `${SOURCE_BASE_URL}/nobetci-${selection.city.slug}`,
  };
}

export async function getRouteAwareDutyPharmacies(
  originLat: number,
  originLng: number,
  destinationQuery: string,
): Promise<PharmacySearchResult> {
  const origin = { lat: originLat, lng: originLng };
  const originSelection = await resolveSelectionFromCoordinates(originLat, originLng);
  const destination = await geocodeDestination(destinationQuery, origin);
  const route = await fetchRoute(origin, destination.coordinate);
  route.destinationLabel = destination.label;

  const candidateSelections: LocationSelection[] = [originSelection];

  const destinationSelection = await resolveSelectionFromCoordinates(
    destination.coordinate.lat,
    destination.coordinate.lng,
  ).catch(() => null);
  if (destinationSelection) {
    candidateSelections.push(destinationSelection);
  }

  const midpoint =
    route.path[Math.floor(route.path.length / 2)] ?? {
      lat: (originLat + destination.coordinate.lat) / 2,
      lng: (originLng + destination.coordinate.lng) / 2,
    };
  const midpointSelection = await resolveSelectionFromCoordinates(
    midpoint.lat,
    midpoint.lng,
  ).catch(() => null);
  if (midpointSelection) {
    candidateSelections.push(midpointSelection);
  }

  const uniqueSelectionMap = new Map<string, LocationSelection>();
  for (const selection of candidateSelections) {
    uniqueSelectionMap.set(
      `${selection.city.slug}:${selection.district.slug}`,
      selection,
    );
  }
  const uniqueSelections = Array.from(uniqueSelectionMap.values());

  const districtResults = await mapLimit(uniqueSelections, 3, async (selection) =>
    getDutyPharmaciesBySelection(selection.city.slug, selection.district.slug),
  );

  if (!districtResults.length) {
    throw new Error("Rota boyunca eczane verisi getirilemedi");
  }

  const combined = dedupePharmacies(districtResults.flatMap((item) => item.pharmacies));
  const ranked = sortForRoute(combined, origin, route.path);

  const routeDistanceLimitKm = route.distanceKm && route.distanceKm > 40 ? 3.5 : 2.5;
  const onRoute = ranked.filter(
    (pharmacy) =>
      pharmacy.routeDistanceKm !== undefined &&
      pharmacy.routeDistanceKm <= routeDistanceLimitKm,
  );
  const finalPharmacies = (onRoute.length >= 3 ? onRoute : ranked).slice(0, 30);

  const latestFetchedTimestamp = districtResults.reduce((latest, item) => {
    const timestamp = Date.parse(item.fetchedAt);
    if (!Number.isFinite(timestamp)) {
      return latest;
    }
    return Math.max(latest, timestamp);
  }, 0);

  return {
    context: {
      city: originSelection.city,
      district: originSelection.district,
      geocode: originSelection.geocode,
      origin,
    },
    fetchedAt:
      latestFetchedTimestamp > 0
        ? new Date(latestFetchedTimestamp).toISOString()
        : new Date().toISOString(),
    pharmacies: finalPharmacies,
    route,
    shiftLabel: districtResults[0].shiftLabel,
    sourcePath: districtResults[0].sourcePath,
  };
}
