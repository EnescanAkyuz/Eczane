import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { getCities, getDistrictsByCity } from "@/lib/eczane-source";
import { buildBreadcrumbSchema } from "@/lib/seo";

type CityPageProps = {
  params: Promise<{
    city: string;
  }>;
};

export async function generateMetadata({
  params,
}: CityPageProps): Promise<Metadata> {
  const { city } = await params;
  const cities = await getCities().catch(() => []);
  const selectedCity = cities.find((item) => item.slug === city);

  if (!selectedCity) {
    return {
      robots: { index: false, follow: true },
      title: "Sehir bulunamadi",
    };
  }

  return {
    alternates: {
      canonical: `/nobetci/${selectedCity.slug}`,
      languages: {
        "tr-TR": `/nobetci/${selectedCity.slug}`,
      },
    },
    description: `${selectedCity.name} icin ilce bazli nobetci eczane listesi. Ilcenizi secip aktif nobetci eczaneleri hemen goruntuleyin.`,
    keywords: [
      `${selectedCity.name} nobetci eczane`,
      `${selectedCity.name} acik eczane`,
      `${selectedCity.name} en yakin eczane`,
    ],
    openGraph: {
      description: `${selectedCity.name} ilindeki ilceler icin guncel nobetci eczane listesi.`,
      title: `${selectedCity.name} Nobetci Eczane`,
      url: `/nobetci/${selectedCity.slug}`,
    },
    title: `${selectedCity.name} Nobetci Eczane`,
    twitter: {
      description: `${selectedCity.name} ilce bazli nobetci eczane listesi.`,
      title: `${selectedCity.name} Nobetci Eczane`,
    },
  };
}

export const revalidate = 3600;

export default async function CityPage({ params }: CityPageProps) {
  const { city } = await params;
  const cities = await getCities().catch(() => []);
  const selectedCity = cities.find((item) => item.slug === city);

  if (!selectedCity) {
    notFound();
  }

  const districts = await getDistrictsByCity(selectedCity.slug).catch(() => []);
  if (!districts.length) {
    notFound();
  }

  const breadcrumbSchema = buildBreadcrumbSchema([
    { name: "Ana Sayfa", path: "/" },
    { name: "Sehirler", path: "/nobetci" },
    { name: selectedCity.name, path: `/nobetci/${selectedCity.slug}` },
  ]);

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        acceptedAnswer: {
          "@type": "Answer",
          text: `${selectedCity.name} ilinde ilcenizi secerek aktif nobetci eczane listesine ulasabilirsiniz.`,
        },
        name: `${selectedCity.name} icin nobetci eczane nasil bulunur?`,
      },
      {
        "@type": "Question",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Ilce sayfasinda telefon ve yol tarifi linkleri ile en yakin eczaneye hizli erisim saglayabilirsiniz.",
        },
        name: "Ilce sayfasinda hangi bilgiler var?",
      },
    ],
  };

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
            <li>
              <Link className="transition hover:text-emerald-700" href="/nobetci">
                Sehirler
              </Link>
            </li>
            <li className="text-zinc-300">/</li>
            <li className="font-medium text-zinc-700">{selectedCity.name}</li>
          </ol>
        </nav>

        <header>
          <span className="text-xs font-semibold uppercase tracking-wider text-emerald-600">Sehir</span>
          <h1 className="mt-1 font-display text-2xl font-bold text-zinc-900 sm:text-3xl">
            {selectedCity.name} Nobetci Eczane Ilceleri
          </h1>
          <p className="mt-2 text-sm text-zinc-600">
            Ilcenizi secin, aktif nobetci eczane listesi hemen acilsin.
          </p>
        </header>
      </section>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
        {districts.map((district) => (
          <Link
            key={district.slug}
            className="card-press flex items-center gap-2 rounded-xl border border-zinc-200/80 bg-white/80 px-3 py-2.5 text-sm font-semibold text-zinc-700 backdrop-blur transition hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-700"
            href={`/nobetci/${selectedCity.slug}/${district.slug}`}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 text-zinc-400">
              <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
              <path d="M3 9h18M9 21V9" />
            </svg>
            {district.name}
          </Link>
        ))}
      </div>

      <section className="rounded-2xl border border-zinc-200/80 bg-white/80 p-5 backdrop-blur sm:rounded-3xl">
        <h2 className="font-display text-lg font-bold text-zinc-900 sm:text-xl">
          {selectedCity.name} icin populer aramalar
        </h2>
        <p className="mt-1.5 text-sm text-zinc-600">
          Ilce sayfalari uzerinden dogrudan
          {` "${selectedCity.name} nobetci eczane"`} sorgusuna hizli cevap verilir.
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          {districts.slice(0, 10).map((district) => (
            <Link
              key={`popular-${district.slug}`}
              className="card-press rounded-lg border border-zinc-200 bg-zinc-50 px-2.5 py-1.5 text-xs font-semibold text-zinc-600 transition hover:border-emerald-300 hover:text-emerald-700"
              href={`/nobetci/${selectedCity.slug}/${district.slug}`}
            >
              {selectedCity.name} {district.name} nobetci eczane
            </Link>
          ))}
        </div>
      </section>

      <script
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
        type="application/ld+json"
      />
      <script
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
        type="application/ld+json"
      />
    </main>
  );
}
