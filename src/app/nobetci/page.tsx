import type { Metadata } from "next";
import Link from "next/link";

import { getCities } from "@/lib/eczane-source";
import { buildBreadcrumbSchema } from "@/lib/seo";
import { normalizeForCompare } from "@/lib/text";

export const metadata: Metadata = {
  alternates: {
    canonical: "/nobetci",
    languages: {
      "tr-TR": "/nobetci",
    },
  },
  description:
    "Turkiye geneli nobetci eczane sehir listesi. Sehrinizi secin, ilce sayfasina hizla gecin.",
  keywords: [
    "sehirlere gore nobetci eczane",
    "turkiye nobetci eczane",
    "ilce bazli nobetci eczane",
  ],
  openGraph: {
    description:
      "Sehirlere gore nobetci eczane listesi. Sehrini sec, ilce sayfasindan guncel nobetci eczanelere ulas.",
    title: "Sehirlere Gore Nobetci Eczane",
    url: "/nobetci",
  },
  title: "Sehirlere Gore Nobetci Eczane",
};

export const revalidate = 3600;

type CitiesPageProps = {
  searchParams: Promise<{
    q?: string;
  }>;
};

export default async function CitiesPage({ searchParams }: CitiesPageProps) {
  const cities = await getCities().catch(() => []);
  const { q } = await searchParams;
  const query = (q ?? "").trim();
  const normalizedQuery = normalizeForCompare(query);
  const filteredCities = normalizedQuery
    ? cities.filter((city) => normalizeForCompare(city.name).includes(normalizedQuery))
    : cities;

  const breadcrumbSchema = buildBreadcrumbSchema([
    { name: "Ana Sayfa", path: "/" },
    { name: "Sehirler", path: "/nobetci" },
  ]);

  return (
    <main className="space-y-4">
      <section className="rounded-2xl border border-zinc-200/80 bg-white/85 p-5 shadow-sm backdrop-blur sm:rounded-3xl sm:p-6">
        <nav aria-label="Breadcrumb" className="mb-4 text-xs text-zinc-500">
          <ol className="flex items-center gap-2">
            <li>
              <Link className="transition hover:text-emerald-700" href="/">
                Ana Sayfa
              </Link>
            </li>
            <li className="text-zinc-300">/</li>
            <li className="font-medium text-zinc-700">Sehirler</li>
          </ol>
        </nav>

        <h1 className="font-display text-2xl font-bold text-zinc-900 sm:text-3xl">
          Sehirlere Gore Nobetci Eczane
        </h1>
        <p className="mt-2 text-sm text-zinc-600">
          Sehrinizi secin, ilce sayfasina gecin, aktif nobetci eczaneleri gorun.
        </p>

        <form action="/nobetci" className="mt-4 grid gap-2 sm:grid-cols-[1fr_auto]">
          <div className="relative">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400">
              <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
            </svg>
            <input
              className="h-12 w-full rounded-xl border border-zinc-200 bg-white pl-10 pr-3 text-sm transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 focus:outline-none"
              defaultValue={query}
              name="q"
              placeholder="Sehir ara (ornek: istanbul)"
              type="search"
            />
          </div>
          <button
            className="flex h-12 items-center justify-center gap-2 rounded-xl bg-zinc-900 px-5 text-sm font-bold text-white transition hover:bg-zinc-800 active:scale-[0.97]"
            type="submit"
          >
            Ara
          </button>
        </form>

        <p className="mt-3 text-xs text-zinc-500">
          {filteredCities.length} sehir listelendi.
        </p>
      </section>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        {filteredCities.map((city) => (
          <Link
            key={city.slug}
            className="card-press flex items-center gap-2 rounded-xl border border-zinc-200/80 bg-white/80 px-3 py-2.5 text-sm font-semibold text-zinc-700 backdrop-blur transition hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-700"
            href={`/nobetci/${city.slug}`}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 text-zinc-400">
              <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
            {city.name}
          </Link>
        ))}
      </div>

      {normalizedQuery && filteredCities.length === 0 ? (
        <div className="flex items-start gap-2.5 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mt-0.5 shrink-0">
            <circle cx="12" cy="12" r="10" /><path d="M12 16v-4M12 8h.01" />
          </svg>
          Aramaniza uygun sehir bulunamadi. Farkli bir yazim deneyin.
        </div>
      ) : null}

      <script
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
        type="application/ld+json"
      />
    </main>
  );
}
