const rawSiteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const SITE_URL = rawSiteUrl.endsWith("/")
  ? rawSiteUrl.slice(0, -1)
  : rawSiteUrl;
export const APP_NAME = "En Yakın Yer";
export const SOURCE_BASE_URL = "https://www.eczaneler.gen.tr";
export const NOMINATIM_BASE_URL = "https://nominatim.openstreetmap.org";
export const OSRM_BASE_URL = "https://router.project-osrm.org";
export const ISTANBUL_TIMEZONE = "Europe/Istanbul";
export const SCRAPER_USER_AGENT =
  process.env.SCRAPER_USER_AGENT ?? `EnYakinYer/1.0 (${SITE_URL})`;

export const CACHE_TTL_MS = {
  cities: 60 * 60 * 1000,
  districts: 60 * 60 * 1000,
  districtDuty: 5 * 60 * 1000,
  pharmacyDetails: 24 * 60 * 60 * 1000,
  reverseGeocode: 10 * 60 * 1000,
  routeSearch: 5 * 60 * 1000,
  routeGeometry: 5 * 60 * 1000,
  destinationGeocode: 15 * 60 * 1000,
} as const;
