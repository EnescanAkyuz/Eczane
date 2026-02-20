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
      className={`card-press rounded-2xl border p-4 shadow-sm transition sm:rounded-3xl ${
        highlight
          ? "border-emerald-500/60 bg-gradient-to-br from-emerald-50 to-teal-50/50 shadow-emerald-200/50"
          : "border-zinc-200/80 bg-white/95 hover:border-zinc-300"
      }`}
    >
      {/* Header */}
      <header className="mb-3 flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            {highlight ? (
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-emerald-600 text-white">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 5v14M5 12h14" />
                </svg>
              </span>
            ) : (
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-zinc-100 text-zinc-500">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 5v14M5 12h14" />
                </svg>
              </span>
            )}
            <h3 className="truncate font-display text-base font-bold text-zinc-900 sm:text-lg">
              {pharmacy.name}
            </h3>
          </div>
          <p className="mt-0.5 pl-8 text-xs text-zinc-500 sm:text-sm">
            {pharmacy.district}, {pharmacy.city}
          </p>
        </div>

        {distance ? (
          <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-bold ${
            highlight
              ? "bg-emerald-600 text-white"
              : "bg-emerald-100 text-emerald-700"
          }`}>
            {distance}
          </span>
        ) : null}
      </header>

      {routeDistance ? (
        <p className="mb-2 ml-8 inline-flex items-center gap-1 rounded-full bg-sky-50 px-2.5 py-1 text-[11px] font-semibold text-sky-700">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 3v18h18" /><path d="m19 9-5 5-4-4-3 3" />
          </svg>
          Rotaya: {routeDistance}
        </p>
      ) : null}

      {/* Address */}
      <div className="flex items-start gap-2 pl-8">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mt-0.5 shrink-0 text-zinc-400">
          <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
          <circle cx="12" cy="10" r="3" />
        </svg>
        <p className="text-sm leading-relaxed text-zinc-600">{pharmacy.address}</p>
      </div>

      {/* Note */}
      {pharmacy.note ? (
        <p className="mt-2 ml-8 flex items-start gap-1.5 rounded-xl bg-amber-50 px-3 py-2 text-xs text-amber-800">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mt-0.5 shrink-0">
            <circle cx="12" cy="12" r="10" /><path d="M12 16v-4M12 8h.01" />
          </svg>
          {pharmacy.note}
        </p>
      ) : null}

      {/* Action buttons - big touch targets */}
      <div className="mt-4 grid grid-cols-2 gap-2">
        {telHref ? (
          <a
            className="flex h-12 items-center justify-center gap-2 rounded-xl bg-zinc-900 text-sm font-bold text-white transition active:scale-[0.97] hover:bg-zinc-800 sm:rounded-2xl"
            href={telHref}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
            </svg>
            Ara
          </a>
        ) : (
          <span className="flex h-12 items-center justify-center gap-2 rounded-xl bg-zinc-100 text-sm font-semibold text-zinc-500 sm:rounded-2xl">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
            </svg>
            Telefon yok
          </span>
        )}

        <a
          className="flex h-12 items-center justify-center gap-2 rounded-xl bg-emerald-600 text-sm font-bold text-white transition active:scale-[0.97] hover:bg-emerald-500 sm:rounded-2xl"
          href={pharmacy.mapUrl}
          rel="noreferrer noopener"
          target="_blank"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="3 11 22 2 13 21 11 13 3 11" />
          </svg>
          Yol tarifi
        </a>
      </div>
    </article>
  );
}
