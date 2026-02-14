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

    try {
      const coordinates = await getCurrentLocation();
      const payload = await readJson<FinderResponse>(
        `/api/pharmacies/nearby?lat=${coordinates.lat}&lng=${coordinates.lng}`,
      );
      setResult(payload);
    } catch (gpsError: unknown) {
      setResult(null);
      setError(getGeoErrorMessage(gpsError));
    } finally {
      setLoadingMode("none");
    }
  }

  return (
    <section className="rounded-[2rem] border border-emerald-200 bg-white/92 p-4 shadow-xl shadow-emerald-100 md:p-6">
      <header className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-2xl font-bold text-zinc-900 md:text-3xl">
            Haritada Nobetci Eczane Bul
          </h2>
          <p className="mt-1 text-sm text-zinc-600">
            Konumunu acinca haritada pinlerle en yakin eczaneleri aninda goreceksin.
          </p>
        </div>
        <button
          className="h-12 rounded-2xl bg-emerald-600 px-5 text-sm font-semibold text-white transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:bg-emerald-300"
          disabled={isBusy}
          onClick={() => setShowLocationConsent(true)}
          type="button"
        >
          {loadingMode === "gps" ? "Konum aliniyor..." : "Konumumu Kullan"}
        </button>
      </header>

      <div className="mb-4 rounded-2xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs leading-5 text-emerald-900">
        Konum iznini sadece en yakin eczaneyi hesaplamak ve haritada gostermek
        icin isteriz. Izin vermezsen uygulama yine calisir; sehir ve ilce secerek
        tum listeyi gorebilirsin.
      </div>

      <PharmacyMap
        pharmacies={result?.pharmacies ?? []}
        route={result?.route}
        userLocation={effectiveUserLocation}
      />

      <div className="mt-4 grid gap-2 rounded-2xl border border-zinc-200 bg-zinc-50 p-3 md:grid-cols-[1fr_1fr_auto]">
        <select
          className="h-12 rounded-xl border border-zinc-300 bg-white px-3 text-sm"
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

        <select
          className="h-12 rounded-xl border border-zinc-300 bg-white px-3 text-sm"
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

        <button
          className="h-12 rounded-xl bg-zinc-900 px-4 text-sm font-semibold text-white transition hover:bg-zinc-700 disabled:cursor-not-allowed disabled:bg-zinc-500"
          disabled={isBusy || !selectedCity || !selectedDistrict}
          onClick={runManualSearch}
          type="button"
        >
          {loadingMode === "manual" ? "Araniyor..." : "Listele"}
        </button>
      </div>

      {error ? (
        <p className="mt-3 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
          {error}
        </p>
      ) : null}

      {result ? (
        <div className="mt-4 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-sm text-zinc-700">
              <strong>{result.context.city.name}</strong> /{" "}
              <strong>{result.context.district.name}</strong> - {result.shiftLabel}
            </p>
            <p className="text-xs text-zinc-500">
              Guncelleme: {formatFetchedAt(result.fetchedAt)}
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-800">
              {result.pharmacies.length} eczane listelendi
            </span>
            {result.context.coverage === "city" ? (
              <span className="rounded-full bg-sky-100 px-3 py-1 text-xs font-semibold text-sky-800">
                Sehir genelinden getirildi
              </span>
            ) : null}
          </div>

          {topResult ? <PharmacyCard highlight pharmacy={topResult} /> : null}

          {result.pharmacies.length > 1 ? (
            <div className="grid gap-3 md:grid-cols-2">
              {result.pharmacies.slice(1, 11).map((pharmacy) => (
                <PharmacyCard key={pharmacy.id} pharmacy={pharmacy} />
              ))}
            </div>
          ) : null}

          <a
            className="inline-flex rounded-xl border border-zinc-300 px-3 py-2 text-xs font-semibold text-zinc-600 transition hover:bg-zinc-100"
            href={result.sourcePath}
            rel="noreferrer noopener"
            target="_blank"
          >
            Kaynagi goruntule
          </a>
        </div>
      ) : (
        <p className="mt-3 rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm text-zinc-600">
          Konumunu acinca veya sehir/ilce secince harita pinleri ve eczane listesi
          otomatik gelir.
        </p>
      )}

      {showLocationConsent ? (
        <div className="fixed inset-0 z-[10000] grid place-items-end bg-zinc-900/50 p-3 sm:place-items-center">
          <div className="w-full max-w-md rounded-3xl border border-zinc-200 bg-white p-4 shadow-2xl">
            <h3 className="font-display text-xl font-semibold text-zinc-900">
              Konum Izni Bilgilendirmesi
            </h3>
            <p className="mt-2 text-sm leading-6 text-zinc-700">
              Konumunu yalnizca en yakin nobetci eczaneyi bulmak ve haritada pin
              gostermek icin kullaniriz. Konum verisi saklanmaz. Izin vermezsen
              sehir/ilce secerek kullanmaya devam edebilirsin.
            </p>
            <div className="mt-4 grid grid-cols-2 gap-2">
              <button
                className="h-10 rounded-xl border border-zinc-300 text-sm font-semibold text-zinc-700 transition hover:bg-zinc-100"
                onClick={() => setShowLocationConsent(false)}
                type="button"
              >
                Simdilik Hayir
              </button>
              <button
                className="h-10 rounded-xl bg-emerald-600 text-sm font-semibold text-white transition hover:bg-emerald-500"
                onClick={() => {
                  setShowLocationConsent(false);
                  void runGpsSearch();
                }}
                type="button"
              >
                Devam Et
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}

