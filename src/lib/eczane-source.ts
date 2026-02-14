import { load } from "cheerio";

import { withCache } from "@/lib/cache";
import {
  CACHE_TTL_MS,
  ISTANBUL_TIMEZONE,
  SCRAPER_USER_AGENT,
  SOURCE_BASE_URL,
} from "@/lib/constants";
import type {
  CityOption,
  DistrictDutyResult,
  DistrictOption,
  PharmacyDetails,
  RawPharmacy,
} from "@/lib/types";
import {
  fromSlug,
  normalizeForCompare,
  normalizeWhitespace,
  toSlug,
  uniqueBy,
} from "@/lib/text";

const MONTHS_TR = [
  "ocak",
  "subat",
  "mart",
  "nisan",
  "mayis",
  "haziran",
  "temmuz",
  "agustos",
  "eylul",
  "ekim",
  "kasim",
  "aralik",
];

type ParsedDate = {
  day: number;
  month: number;
};

function ensureLeadingSlash(path: string): string {
  if (!path) {
    return "/";
  }
  return path.startsWith("/") ? path : `/${path}`;
}

async function fetchSourceHtml(path: string, ttlMs: number): Promise<string> {
  const normalizedPath = ensureLeadingSlash(path);

  return withCache(`source:${normalizedPath}`, ttlMs, async () => {
    const response = await fetch(`${SOURCE_BASE_URL}${normalizedPath}`, {
      cache: "no-store",
      headers: {
        "accept-language": "tr-TR,tr;q=0.9,en-US;q=0.6",
        "user-agent": SCRAPER_USER_AGENT,
      },
    });

    if (!response.ok) {
      throw new Error(`Kaynak verisi okunamadı (${response.status})`);
    }

    return response.text();
  });
}

function parseMonthIndex(monthText: string): number | null {
  const normalized = normalizeForCompare(monthText).replace(/\./g, "");
  if (!normalized) {
    return null;
  }

  const monthIndex = MONTHS_TR.findIndex(
    (month) =>
      normalized === month ||
      normalized.startsWith(month.slice(0, 3)) ||
      month.startsWith(normalized.slice(0, 3)),
  );

  return monthIndex >= 0 ? monthIndex + 1 : null;
}

function parseFirstDateInLabel(label: string): ParsedDate | null {
  const match = label.match(/(\d{1,2})\s+([A-Za-zÇĞİÖŞÜçğıöşü\.]+)/u);
  if (!match) {
    return null;
  }

  const day = Number.parseInt(match[1], 10);
  const month = parseMonthIndex(match[2]);

  if (!Number.isFinite(day) || day < 1 || day > 31 || month === null) {
    return null;
  }

  return { day, month };
}

function getTodayInIstanbul(now = new Date()): ParsedDate | null {
  const formatter = new Intl.DateTimeFormat("tr-TR", {
    day: "numeric",
    month: "long",
    timeZone: ISTANBUL_TIMEZONE,
  });

  const parts = formatter.formatToParts(now);
  const dayPart = parts.find((part) => part.type === "day")?.value;
  const monthPart = parts.find((part) => part.type === "month")?.value;

  if (!dayPart || !monthPart) {
    return null;
  }

  const day = Number.parseInt(dayPart, 10);
  const month = parseMonthIndex(monthPart);
  if (!Number.isFinite(day) || month === null) {
    return null;
  }

  return { day, month };
}

function pickActiveShiftLabel(labels: string[]): string {
  if (!labels.length) {
    return "";
  }

  const today = getTodayInIstanbul();
  if (!today) {
    return labels[0];
  }

  for (const label of labels) {
    const parsed = parseFirstDateInLabel(label);
    if (!parsed) {
      continue;
    }
    if (parsed.day === today.day && parsed.month === today.month) {
      return label;
    }
  }

  const token = `${today.day} ${MONTHS_TR[today.month - 1]}`;
  const tokenFallback = labels.find((label) =>
    normalizeForCompare(label).includes(token),
  );

  return tokenFallback ?? labels[0];
}

function parseHeadingForCityAndDistrict(
  heading: string,
  citySlug: string,
  districtSlug: string,
): { cityName: string; districtName: string } {
  const cleanedHeading = normalizeWhitespace(heading);
  const match = cleanedHeading.match(/^(.+?)\s+Nöbetçi Eczaneleri\s+\((.+)\)$/i);

  if (match) {
    return {
      cityName: normalizeWhitespace(match[2]),
      districtName: normalizeWhitespace(match[1]),
    };
  }

  return {
    cityName: fromSlug(citySlug),
    districtName: fromSlug(districtSlug),
  };
}

function parseDistrictPharmacies(
  html: string,
  sourcePath: string,
  citySlug: string,
  districtSlug: string,
): DistrictDutyResult {
  const $ = load(html);
  const headingText = $("h1").first().text();
  const heading = parseHeadingForCityAndDistrict(
    headingText,
    citySlug,
    districtSlug,
  );

  const groupedByShift = new Map<string, RawPharmacy[]>();

  $("tr td.border-bottom").each((_, element) => {
    const cell = $(element);

    const shiftLabel =
      normalizeWhitespace(
        cell.parents().prevAll("div.alert-warning").first().text(),
      ) || "Nöbet bilgisi";

    const name = normalizeWhitespace(cell.find("span.isim").first().text());
    const detailPath = normalizeWhitespace(
      cell.find("a[href^='/eczane/']").first().attr("href") ?? "",
    );

    if (!name || !detailPath) {
      return;
    }

    const addressColumn = cell.find("div.col-lg-6").first().clone();
    const note = normalizeWhitespace(addressColumn.find(".font-italic").text());
    addressColumn.find(".py-2,.my-2,br").remove();

    const districtName =
      normalizeWhitespace(cell.find(".bg-secondary").first().text()) ||
      heading.districtName;

    const phoneRaw = normalizeWhitespace(
      cell.find("div.col-lg-3").last().text() ?? "",
    );
    const phone = phoneRaw.replace(/\s+/g, " ").trim();

    const pharmacy: RawPharmacy = {
      id: detailPath.replace("/eczane/", ""),
      name,
      address: normalizeWhitespace(addressColumn.text()),
      city: heading.cityName,
      detailPath,
      district: districtName,
      note: note || undefined,
      phone,
      shiftLabel,
      sourcePath,
    };

    const section = groupedByShift.get(shiftLabel) ?? [];
    section.push(pharmacy);
    groupedByShift.set(shiftLabel, section);
  });

  const shiftLabels = Array.from(groupedByShift.keys());
  const activeShiftLabel = pickActiveShiftLabel(shiftLabels);
  const activePharmacies =
    groupedByShift.get(activeShiftLabel) ??
    groupedByShift.get(shiftLabels[0] ?? "") ??
    [];

  return {
    cityName: heading.cityName,
    citySlug,
    districtName: heading.districtName,
    districtSlug,
    fetchedAt: new Date().toISOString(),
    pharmacies: activePharmacies,
    shiftLabel: activeShiftLabel || "Nöbet bilgisi",
    sourcePath,
  };
}

function parseDistrictCount(raw: string): number | undefined {
  const numeric = Number.parseInt(raw, 10);
  return Number.isFinite(numeric) ? numeric : undefined;
}

export async function getCities(): Promise<CityOption[]> {
  const html = await fetchSourceHtml("/", CACHE_TTL_MS.cities);
  const $ = load(html);

  const cities: CityOption[] = [];
  $("a.hpali[href^='/nobetci-']").each((_, element) => {
    const href = normalizeWhitespace($(element).attr("href") ?? "");
    const name = normalizeWhitespace($(element).text());
    if (!href || !name) {
      return;
    }

    const sourcePath = ensureLeadingSlash(href);
    const slug = sourcePath.replace("/nobetci-", "");
    const districtCountText = normalizeWhitespace(
      $(element).siblings("small").first().text().replace(/[()]/g, ""),
    );

    cities.push({
      districtCount: parseDistrictCount(districtCountText),
      name,
      slug,
      sourcePath,
    });
  });

  return uniqueBy(cities, (city) => city.slug).sort((a, b) =>
    a.name.localeCompare(b.name, "tr"),
  );
}

export async function getDistrictsByCity(citySlug: string): Promise<DistrictOption[]> {
  const sourcePath = `/nobetci-${citySlug}`;
  const html = await fetchSourceHtml(sourcePath, CACHE_TTL_MS.districts);
  const $ = load(html);

  const cityName =
    normalizeWhitespace($("h1").first().text().replace("Nöbetçi Eczaneleri", "")) ||
    fromSlug(citySlug);

  const districts: DistrictOption[] = [];
  $(`a.aok[href^='/nobetci-${citySlug}-']`).each((_, element) => {
    const href = normalizeWhitespace($(element).attr("href") ?? "");
    const name = normalizeWhitespace($(element).text());
    if (!href || !name) {
      return;
    }

    const districtSlug = href.replace(`/nobetci-${citySlug}-`, "");
    if (!districtSlug) {
      return;
    }

    districts.push({
      cityName,
      citySlug,
      name,
      slug: toSlug(districtSlug),
      sourcePath: ensureLeadingSlash(href),
    });
  });

  return uniqueBy(districts, (district) => district.slug).sort((a, b) =>
    a.name.localeCompare(b.name, "tr"),
  );
}

export async function getDistrictDutyPharmacies(
  citySlug: string,
  districtSlug: string,
): Promise<DistrictDutyResult> {
  const sourcePath = `/nobetci-${citySlug}-${districtSlug}`;
  const html = await fetchSourceHtml(sourcePath, CACHE_TTL_MS.districtDuty);
  return parseDistrictPharmacies(html, sourcePath, citySlug, districtSlug);
}

function parseFloatSafe(value: string | undefined): number | undefined {
  if (!value) {
    return undefined;
  }
  const numeric = Number.parseFloat(value);
  return Number.isFinite(numeric) ? numeric : undefined;
}

export async function getPharmacyDetails(
  detailPath: string,
): Promise<PharmacyDetails> {
  const sourcePath = ensureLeadingSlash(detailPath);
  const html = await fetchSourceHtml(sourcePath, CACHE_TTL_MS.pharmacyDetails);
  const $ = load(html);

  const latitude = parseFloatSafe(
    $("meta[itemprop='latitude']").first().attr("content"),
  );
  const longitude = parseFloatSafe(
    $("meta[itemprop='longitude']").first().attr("content"),
  );

  let mapUrl = normalizeWhitespace(
    $("a[href*='google.com/maps?daddr=']").first().attr("href") ?? "",
  );

  if (!mapUrl && latitude !== undefined && longitude !== undefined) {
    mapUrl = `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`;
  }

  return {
    latitude,
    longitude,
    mapUrl: mapUrl || undefined,
  };
}

