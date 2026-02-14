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
    <main className="space-y-5 rounded-[2rem] border border-zinc-200 bg-white/85 p-5 shadow-sm md:p-6">
      <nav aria-label="Breadcrumb" className="text-xs text-zinc-500">
        <ol className="flex items-center gap-2">
          <li>
            <Link className="hover:text-emerald-700" href="/">
              Ana Sayfa
            </Link>
          </li>
          <li>/</li>
          <li>
            <Link className="hover:text-emerald-700" href="/nobetci">
              Sehirler
            </Link>
          </li>
          <li>/</li>
          <li className="text-zinc-700">{selectedCity.name}</li>
        </ol>
      </nav>

      <header>
        <p className="text-sm text-zinc-500">Sehir</p>
        <h1 className="font-display text-3xl font-semibold text-zinc-900">
          {selectedCity.name} Nobetci Eczane Ilceleri
        </h1>
        <p className="mt-2 text-sm text-zinc-700">
          Ilcenizi secin, aktif nobetci eczane listesi hemen acilsin.
        </p>
      </header>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
        {districts.map((district) => (
          <Link
            key={district.slug}
            className="rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm font-semibold text-zinc-700 transition hover:border-emerald-300 hover:text-emerald-700"
            href={`/nobetci/${selectedCity.slug}/${district.slug}`}
          >
            {district.name}
          </Link>
        ))}
      </div>

      <section className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4 text-sm text-zinc-700">
        <h2 className="font-display text-xl font-semibold text-zinc-900">
          {selectedCity.name} icin populer aramalar
        </h2>
        <p className="mt-2">
          Kullanici niyetine uygun olarak ilce sayfalari uzerinden dogrudan
          {` "${selectedCity.name} nobetci eczane"`} sorgusuna hizli cevap verilir.
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          {districts.slice(0, 10).map((district) => (
            <Link
              key={`popular-${district.slug}`}
              className="rounded-lg border border-zinc-200 bg-white px-2 py-1 text-xs font-semibold text-zinc-700 transition hover:border-emerald-300 hover:text-emerald-700"
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
