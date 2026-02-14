import type { Pharmacy } from "@/lib/types";

type PharmacyCardProps = {
  pharmacy: Pharmacy;
  highlight?: boolean;
};

function formatDistance(distanceKm: number | undefined): string | null {
  if (distanceKm === undefined) {
    return null;
  }
  if (distanceKm < 1) {
    return `${Math.round(distanceKm * 1000)} m`;
  }
  return `${distanceKm.toFixed(1)} km`;
}

function toTelHref(phone: string): string {
  const digits = phone.replace(/[^\d+]/g, "");
  if (!digits) {
    return "";
  }
  if (digits.startsWith("+")) {
    return `tel:${digits}`;
  }
  if (digits.startsWith("90")) {
    return `tel:+${digits}`;
  }
  if (digits.startsWith("0")) {
    return `tel:+9${digits}`;
  }
  return `tel:${digits}`;
}

export function PharmacyCard({ pharmacy, highlight = false }: PharmacyCardProps) {
  const distance = formatDistance(pharmacy.distanceKm);
  const routeDistance = formatDistance(pharmacy.routeDistanceKm);
  const telHref = toTelHref(pharmacy.phone);

  return (
    <article
      className={`rounded-3xl border p-4 shadow-sm backdrop-blur ${
        highlight
          ? "border-emerald-600 bg-emerald-50/95 shadow-emerald-200"
          : "border-zinc-200 bg-white/95"
      }`}
    >
      <header className="mb-3 flex items-start justify-between gap-3">
        <div>
          <h3 className="font-display text-lg font-semibold text-zinc-900">
            {pharmacy.name}
          </h3>
          <p className="text-sm text-zinc-600">
            {pharmacy.district}, {pharmacy.city}
          </p>
        </div>
        {distance ? (
          <span className="rounded-full bg-emerald-600 px-3 py-1 text-xs font-semibold text-white">
            {distance}
          </span>
        ) : null}
      </header>

      {routeDistance ? (
        <p className="mb-2 inline-flex rounded-full bg-sky-100 px-2 py-1 text-[11px] font-semibold text-sky-800">
          Rotaya uzaklik: {routeDistance}
        </p>
      ) : null}

      <p className="text-sm leading-6 text-zinc-700">{pharmacy.address}</p>
      {pharmacy.note ? (
        <p className="mt-2 rounded-xl bg-amber-100 px-2 py-1 text-xs text-amber-900">
          {pharmacy.note}
        </p>
      ) : null}

      <div className="mt-4 grid grid-cols-2 gap-2">
        {telHref ? (
          <a
            className="flex items-center justify-center rounded-2xl bg-zinc-900 px-3 py-2 text-sm font-semibold text-white transition hover:bg-zinc-700"
            href={telHref}
          >
            Ara
          </a>
        ) : (
          <span className="flex items-center justify-center rounded-2xl bg-zinc-200 px-3 py-2 text-sm font-semibold text-zinc-600">
            Telefon yok
          </span>
        )}

        <a
          className="flex items-center justify-center rounded-2xl bg-emerald-600 px-3 py-2 text-sm font-semibold text-white transition hover:bg-emerald-500"
          href={pharmacy.mapUrl}
          rel="noreferrer noopener"
          target="_blank"
        >
          Yol tarifi
        </a>
      </div>
    </article>
  );
}
