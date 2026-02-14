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
    <main className="space-y-4 rounded-[2rem] border border-zinc-200 bg-white/85 p-5 shadow-sm md:p-6">
      <nav aria-label="Breadcrumb" className="text-xs text-zinc-500">
        <ol className="flex items-center gap-2">
          <li>
            <Link className="hover:text-emerald-700" href="/">
              Ana Sayfa
            </Link>
          </li>
          <li>/</li>
          <li className="text-zinc-700">Sehirler</li>
        </ol>
      </nav>

      <h1 className="font-display text-3xl font-semibold text-zinc-900">
        Sehirlere Gore Nobetci Eczane
      </h1>
      <p className="mt-2 text-sm text-zinc-700">
        Sehrinizi secin, ilce listesine gecin, aktif nobetci eczaneleri gorun.
      </p>

      <form action="/nobetci" className="grid gap-2 sm:grid-cols-[1fr_auto]">
        <input
          className="h-11 rounded-xl border border-zinc-300 bg-white px-3 text-sm"
          defaultValue={query}
          name="q"
          placeholder="Sehir ara (ornek: istanbul)"
          type="search"
        />
        <button
          className="h-11 rounded-xl bg-zinc-900 px-4 text-sm font-semibold text-white transition hover:bg-zinc-700"
          type="submit"
        >
          Ara
        </button>
      </form>

      <p className="text-xs text-zinc-500">
        {filteredCities.length} sehir listelendi.
      </p>

      <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        {filteredCities.map((city) => (
          <Link
            key={city.slug}
            className="rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm font-semibold text-zinc-700 transition hover:border-emerald-300 hover:text-emerald-700"
            href={`/nobetci/${city.slug}`}
          >
            {city.name}
          </Link>
        ))}
      </div>

      {normalizedQuery && filteredCities.length === 0 ? (
        <p className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
          Aramaniza uygun sehir bulunamadi. Farkli bir yazim deneyin.
        </p>
      ) : null}

      <script
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
        type="application/ld+json"
      />
    </main>
  );
}
