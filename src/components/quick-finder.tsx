"use client";

import { useEffect, useMemo, useState } from "react";

import { PharmacyCard } from "@/components/pharmacy-card";
import { PharmacyMap } from "@/components/pharmacy-map";
import type {
  CityOption,
  Coordinate,
  DistrictOption,
  Pharmacy,
  RouteInfo,
} from "@/lib/types";

type FinderResult = {
  context: {
    city: CityOption;
    district: DistrictOption;
    coverage?: "city" | "district";
    origin?: Coordinate;
  };
  fetchedAt: string;
  pharmacies: Pharmacy[];
  route?: RouteInfo;
  shiftLabel: string;
  sourcePath: string;
};

type FinderResponse = FinderResult & {
  error?: string;
};

type LocationResponse = {
  districts: DistrictOption[];
  error?: string;
};

type QuickFinderProps = {
  cities: CityOption[];
};

function formatFetchedAt(value: string): string {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return "";
  }
  return parsed.toLocaleString("tr-TR", {
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    month: "long",
    timeZone: "Europe/Istanbul",
    year: "numeric",
  });
}

function getGeoErrorMessage(error: unknown): string {
  const code =
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    typeof (error as { code?: unknown }).code === "number"
      ? (error as { code: number }).code
      : null;

  if (code === 1) {
    return "Konum izni verilmedi. Sehir ve ilceyi elle secerek devam edebilirsiniz.";
  }
  if (code === 2) {
    return "Konum bilgisi alinamadi. GPS veya baglantiyi kontrol edip tekrar deneyin.";
  }
  if (code === 3) {
    return "Konum alma zaman asimina ugradi. Tekrar deneyin.";
  }

  return error instanceof Error
    ? error.message
    : "Konumdan eczane aranirken hata olustu";
}

async function readJson<T>(url: string): Promise<T> {
  const response = await fetch(url, { cache: "no-store" });
  const payload = (await response.json()) as T & { error?: string };
  if (!response.ok) {
    throw new Error(payload.error ?? "Beklenmeyen bir hata oldu");
  }
  return payload;
}

export function QuickFinder({ cities }: QuickFinderProps) {
  const defaultCity = cities[0]?.slug ?? "";
  const [selectedCity, setSelectedCity] = useState(defaultCity);
  const [selectedDistrict, setSelectedDistrict] = useState("");
  const [districts, setDistricts] = useState<DistrictOption[]>([]);
  const [loadingMode, setLoadingMode] = useState<"none" | "gps" | "manual">(
    "none",
  );
  const [error, setError] = useState("");
  const [result, setResult] = useState<FinderResult | null>(null);
  const [userLocation, setUserLocation] = useState<Coordinate | null>(null);
  const [showLocationConsent, setShowLocationConsent] = useState(false);

  useEffect(() => {
    if (!selectedCity) {
      setDistricts([]);
      setSelectedDistrict("");
      return;
    }

    let cancelled = false;
    setError("");

    readJson<LocationResponse>(`/api/locations?city=${selectedCity}`)
      .then((payload) => {
        if (cancelled) {
          return;
        }
        setDistricts(payload.districts ?? []);
        setSelectedDistrict((current) =>
          current && payload.districts.some((item) => item.slug === current)
            ? current
            : (payload.districts[0]?.slug ?? ""),
        );
      })
      .catch((fetchError: unknown) => {
        if (cancelled) {
          return;
        }
        setDistricts([]);
        setSelectedDistrict("");
        setError(
          fetchError instanceof Error
            ? fetchError.message
            : "Ilce listesi alinamadi",
        );
      });

    return () => {
      cancelled = true;
    };
  }, [selectedCity]);

  const isBusy = loadingMode !== "none";
  const topResult = useMemo(() => result?.pharmacies[0] ?? null, [result]);
  const effectiveUserLocation = userLocation ?? result?.context.origin ?? null;

  async function getCurrentLocation(): Promise<Coordinate> {
    if (!navigator.geolocation) {
      throw new Error("Cihaziniz konum ozelligini desteklemiyor");
    }

    const coords = await new Promise<GeolocationCoordinates>((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(
        (position) => resolve(position.coords),
        (geoError) => reject(geoError),
        {
          enableHighAccuracy: true,
          maximumAge: 30_000,
          timeout: 12_000,
        },
      );
    });

    const coordinate = {
      lat: coords.latitude,
      lng: coords.longitude,
    };
    setUserLocation(coordinate);
    return coordinate;
  }

  async function runManualSearch(): Promise<void> {
    if (!selectedCity || !selectedDistrict) {
      setError("Sehir ve ilce secimi yapiniz");
      return;
    }

    setLoadingMode("manual");
    setError("");
    setResult(null);

    try {
      const payload = await readJson<FinderResponse>(
        `/api/pharmacies?city=${selectedCity}&district=${selectedDistrict}`,
      );
      setResult(payload);
    } catch (searchError: unknown) {
      setResult(null);
      setError(
        searchError instanceof Error
          ? searchError.message
          : "Arama sirasinda hata olustu",
      );
    } finally {
      setLoadingMode("none");
    }
  }

  async function runGpsSearch(): Promise<void> {
    setLoadingMode("gps");
    setError("");
    setResult(null);

    try {
      const coordinates = await getCurrentLocation();
      const payload = await readJson<FinderResponse>(
        `/api/pharmacies/nearby?lat=${coordinates.lat}&lng=${coordinates.lng}`,
      );
      setResult(payload);

      // Konumdan gelen sehir ve ilce bilgilerini arama alanina yansit
      if (payload.context.city?.slug) {
        setSelectedCity(payload.context.city.slug);
      }
      if (payload.context.district?.slug) {
        setSelectedDistrict(payload.context.district.slug);
      }
    } catch (gpsError: unknown) {
      setResult(null);
      setError(getGeoErrorMessage(gpsError));
    } finally {
      setLoadingMode("none");
    }
  }

  return (
    <section className="space-y-4">
      {/* ── GPS Button - prominent CTA ── */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="hidden sm:block">
          <h2 className="font-display text-xl font-bold text-zinc-900 sm:text-2xl">
            Haritada Nöbetçi Eczane Bul
          </h2>
          <p className="mt-0.5 text-sm text-zinc-500">
            Konum aç veya şehir seç, en yakın eczaneleri gor.
          </p>
        </div>
        <button
          className="btn-gps-pulse flex h-14 w-full items-center justify-center gap-2.5 rounded-2xl bg-emerald-600 px-6 text-base font-bold text-white shadow-lg shadow-emerald-200 transition hover:bg-emerald-500 active:scale-[0.97] disabled:cursor-not-allowed disabled:bg-emerald-300 disabled:shadow-none sm:h-12 sm:w-auto sm:text-sm"
          disabled={isBusy}
          onClick={() => setShowLocationConsent(true)}
          type="button"
        >
          {loadingMode === "gps" ? (
            <>
              <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Konum aliniyor...
            </>
          ) : (
            <>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <circle cx="12" cy="12" r="3" />
                <path d="M12 2v3M12 19v3M2 12h3M19 12h3" />
              </svg>
              Konumumu Kullan
            </>
          )}
        </button>
      </div>

      {/* ── Privacy note ── */}
      <div className="flex items-start gap-2.5 rounded-xl border border-emerald-200/60 bg-emerald-50/70 px-3.5 py-2.5 text-xs leading-5 text-emerald-800">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mt-0.5 shrink-0 text-emerald-600">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        </svg>
        <span>
          Konum verisini sadece en yakın eczaneyi bulmak için kullanırız. Veri saklanmaz.
          Izin vermezsen sehir/ilçe seçerek kullanmaya devam edebilirsin.
        </span>
      </div>

      {/* ── Map ── */}
      <PharmacyMap
        loading={isBusy}
        pharmacies={result?.pharmacies ?? []}
        route={result?.route}
        userLocation={effectiveUserLocation}
      />

      {/* ── Manual search ── */}
      <div className="grid gap-2 rounded-2xl border border-zinc-200/80 bg-white/90 p-3 backdrop-blur sm:grid-cols-[1fr_1fr_auto]">
        <div className="relative">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400">
            <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
            <circle cx="12" cy="10" r="3" />
          </svg>
          <select
            className="h-12 w-full rounded-xl border border-zinc-200 bg-white pl-9 pr-8 text-sm font-medium text-zinc-700 transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 focus:outline-none"
            disabled={isBusy}
            onChange={(event) => setSelectedCity(event.target.value)}
            value={selectedCity}
          >
            {cities.map((city) => (
              <option key={city.slug} value={city.slug}>
                {city.name}
              </option>
            ))}
          </select>
        </div>

        <div className="relative">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400">
            <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
            <path d="M3 9h18M9 21V9" />
          </svg>
          <select
            className="h-12 w-full rounded-xl border border-zinc-200 bg-white pl-9 pr-8 text-sm font-medium text-zinc-700 transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 focus:outline-none"
            disabled={isBusy || !districts.length}
            onChange={(event) => setSelectedDistrict(event.target.value)}
            value={selectedDistrict}
          >
            {districts.map((district) => (
              <option key={district.slug} value={district.slug}>
                {district.name}
              </option>
            ))}
          </select>
        </div>

        <button
          className="flex h-12 items-center justify-center gap-2 rounded-xl bg-zinc-900 px-5 text-sm font-bold text-white transition hover:bg-zinc-800 active:scale-[0.97] disabled:cursor-not-allowed disabled:bg-zinc-400"
          disabled={isBusy || !selectedCity || !selectedDistrict}
          onClick={runManualSearch}
          type="button"
        >
          {loadingMode === "manual" ? (
            <>
              <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Araniyor...
            </>
          ) : (
            <>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
              </svg>
              Listele
            </>
          )}
        </button>
      </div>

      {/* ── Error ── */}
      {error ? (
        <div className="flex items-start gap-2.5 rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-2.5 text-sm text-rose-700">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mt-0.5 shrink-0">
            <circle cx="12" cy="12" r="10" /><path d="m15 9-6 6M9 9l6 6" />
          </svg>
          {error}
        </div>
      ) : null}

      {/* ── Results ── */}
      {isBusy ? (
        <div className="flex flex-col items-center justify-center gap-4 rounded-3xl border border-zinc-200/80 bg-white/60 py-16 text-center backdrop-blur-sm">
          <div className="relative">
            <div className="h-12 w-12 rounded-full border-4 border-emerald-100" />
            <div className="absolute top-0 h-12 w-12 animate-spin rounded-full border-4 border-emerald-600 border-t-transparent" />
          </div>
          <div>
            <p className="text-sm font-bold text-zinc-900">
              {loadingMode === "gps" ? "Konumunuz sorgulaniyor..." : "Liste hazirlaniyor..."}
            </p>
            <p className="mt-1 text-xs text-zinc-500">Bu islem birkac saniye surebilir.</p>
          </div>
        </div>
      ) : result ? (
        <div className="space-y-3 animate-fade-in">
          {/* Result header */}
          <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-zinc-200/80 bg-white/90 px-4 py-3 backdrop-blur">
            <div className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100 text-emerald-600">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                  <polyline points="22 4 12 14.01 9 11.01" />
                </svg>
              </span>
              <div>
                <p className="text-sm font-bold text-zinc-900">
                  {result.context.city.name} / {result.context.district.name}
                </p>
                <p className="text-xs text-zinc-500">{result.shiftLabel}</p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-700">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 dot-pulse" />
                {result.pharmacies.length} eczane
              </span>
              {result.context.coverage === "city" ? (
                <span className="rounded-full bg-sky-100 px-3 py-1 text-xs font-bold text-sky-700">
                  Sehir geneli
                </span>
              ) : null}
            </div>
          </div>

          {/* Update time */}
          <p className="px-1 text-xs text-zinc-400">
            Guncelleme: {formatFetchedAt(result.fetchedAt)}
          </p>

          {/* Top result - highlighted */}
          {topResult ? <PharmacyCard highlight pharmacy={topResult} /> : null}

          {/* Other results */}
          {result.pharmacies.length > 1 ? (
            <div className="grid gap-3 sm:grid-cols-2">
              {result.pharmacies.slice(1, 11).map((pharmacy) => (
                <PharmacyCard key={pharmacy.id} pharmacy={pharmacy} />
              ))}
            </div>
          ) : null}

          <a
            className="inline-flex items-center gap-1.5 rounded-xl border border-zinc-200 bg-white/80 px-3.5 py-2 text-xs font-semibold text-zinc-500 transition hover:bg-zinc-50 hover:text-zinc-700"
            href={result.sourcePath}
            rel="noreferrer noopener"
            target="_blank"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" /><polyline points="15 3 21 3 21 9" /><line x1="10" x2="21" y1="14" y2="3" />
            </svg>
            Kaynagi goruntule
          </a>
        </div>
      ) : (
        <div className="flex items-center gap-3 rounded-xl border border-zinc-200/80 bg-white/80 px-4 py-4 backdrop-blur">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-zinc-100 text-zinc-400">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" /><path d="m16 10-4 4-4-4" />
            </svg>
          </span>
          <p className="text-sm text-zinc-500">
            Konumunu açinca veya sehir/ilce secince harita pinleri ve eczane
            listesi otomatik gelir.
          </p>
        </div>
      )}

      {/* ── Location consent modal ── */}
      {showLocationConsent ? (
        <div className="fixed inset-0 z-[10000] flex items-end justify-center bg-zinc-900/60 p-3 backdrop-blur-sm sm:items-center">
          <div className="w-full max-w-md animate-fade-in rounded-2xl border border-zinc-200 bg-white p-5 shadow-2xl sm:rounded-3xl">
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <circle cx="12" cy="12" r="3" />
                <path d="M12 2v3M12 19v3M2 12h3M19 12h3" />
              </svg>
            </div>
            <h3 className="font-display text-lg font-bold text-zinc-900">
              Konum Izni Bilgilendirmesi
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-zinc-600">
              Konumunu yalnızca en yakın nöbetçi eczaneyi bulmak ve haritada pin
              gostermek için kullanırız. Konum verisi saklanmaz. Izin vermezsen
              sehir/ilçe seçerek kullanmaya devam edebilirsin.
            </p>
            <div className="mt-5 grid grid-cols-2 gap-2">
              <button
                className="flex h-12 items-center justify-center rounded-xl border border-zinc-200 text-sm font-bold text-zinc-600 transition hover:bg-zinc-50 active:scale-[0.97]"
                onClick={() => setShowLocationConsent(false)}
                type="button"
              >
                Simdilik Hayir
              </button>
              <button
                className="flex h-12 items-center justify-center gap-2 rounded-xl bg-emerald-600 text-sm font-bold text-white transition hover:bg-emerald-500 active:scale-[0.97]"
                onClick={() => {
                  setShowLocationConsent(false);
                  void runGpsSearch();
                }}
                type="button"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <circle cx="12" cy="12" r="3" />
                  <path d="M12 2v3M12 19v3M2 12h3M19 12h3" />
                </svg>
                Devam Et
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}

