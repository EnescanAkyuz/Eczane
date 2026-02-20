import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { PharmacyCard } from "@/components/pharmacy-card";
import { PharmacyMap } from "@/components/pharmacy-map";
import { getDistrictsByCity } from "@/lib/eczane-source";
import { buildBreadcrumbSchema } from "@/lib/seo";
import { getDutyPharmaciesBySelection } from "@/lib/pharmacy-service";

type DistrictPageProps = {
  params: Promise<{
    city: string;
    district: string;
  }>;
};

function formatFetchedAt(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return date.toLocaleString("tr-TR", {
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    month: "long",
    timeZone: "Europe/Istanbul",
    year: "numeric",
  });
}

export async function generateMetadata({
  params,
}: DistrictPageProps): Promise<Metadata> {
  const { city, district } = await params;
  const result = await getDutyPharmaciesBySelection(city, district).catch(
    () => null,
  );

  if (!result) {
    return {
      robots: { index: false, follow: true },
      title: "Ilce bulunamadi",
    };
  }

  const cityName = result.context.city.name;
  const districtName = result.context.district.name;

  return {
    alternates: {
      canonical: `/nobetci/${result.context.city.slug}/${result.context.district.slug}`,
      languages: {
        "tr-TR": `/nobetci/${result.context.city.slug}/${result.context.district.slug}`,
      },
    },
    description: `${districtName} ${cityName} icin aktif nobetci eczane listesi. Telefon ve yol tarifi bilgileri ile hizli erisim.`,
    keywords: [
      `${districtName} nobetci eczane`,
      `${cityName} ${districtName} nobetci eczane`,
      `${districtName} acik eczane`,
      `${districtName} en yakin eczane`,
    ],
    openGraph: {
      description: `${districtName} / ${cityName} aktif nobetci eczane listesi, telefon ve yol tarifi bilgileri.`,
      title: `${districtName} Nobetci Eczane`,
      url: `/nobetci/${result.context.city.slug}/${result.context.district.slug}`,
    },
    title: `${districtName} Nobetci Eczane`,
    twitter: {
      description: `${districtName} icin guncel nobetci eczaneler.`,
      title: `${districtName} Nobetci Eczane`,
    },
  };
}

export const revalidate = 300;

export default async function DistrictPage({ params }: DistrictPageProps) {
  const { city, district } = await params;
  const result = await getDutyPharmaciesBySelection(city, district).catch(
    () => null,
  );

  if (!result) {
    notFound();
  }

  if (!result.pharmacies.length) {
    notFound();
  }

  const cityName = result.context.city.name;
  const districtName = result.context.district.name;
  const pageTitle = `${districtName} Nobetci Eczaneleri`;
  const siblings = await getDistrictsByCity(result.context.city.slug).catch(() => []);
  const relatedDistricts = siblings
    .filter((item) => item.slug !== result.context.district.slug)
    .slice(0, 10);

  const itemListSchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: result.pharmacies.map((pharmacy, index) => ({
      "@type": "ListItem",
      item: {
        "@type": "Pharmacy",
        address: pharmacy.address,
        geo:
          pharmacy.latitude !== undefined && pharmacy.longitude !== undefined
            ? {
                "@type": "GeoCoordinates",
                latitude: pharmacy.latitude,
                longitude: pharmacy.longitude,
              }
            : undefined,
        name: pharmacy.name,
        telephone: pharmacy.phone,
        url: pharmacy.mapUrl,
      },
      position: index + 1,
    })),
    name: `${districtName} ${cityName} Nobetci Eczaneleri`,
  };

  const breadcrumbSchema = buildBreadcrumbSchema([
    { name: "Ana Sayfa", path: "/" },
    { name: "Sehirler", path: "/nobetci" },
    { name: cityName, path: `/nobetci/${result.context.city.slug}` },
    {
      name: districtName,
      path: `/nobetci/${result.context.city.slug}/${result.context.district.slug}`,
    },
  ]);

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        acceptedAnswer: {
          "@type": "Answer",
          text: `${districtName} icin listelenen ilk eczane genellikle konuma gore en yakin adaydir. Yol tarifi baglantisi ile dogrudan navigasyon baslatabilirsiniz.`,
        },
        name: `${districtName} en yakin nobetci eczane nasil bulunur?`,
      },
      {
        "@type": "Question",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Her eczane kartinda telefon ve harita bilgisi yer alir. Acil saglik durumlarinda 112 Acil ile iletisime gecilmelidir.",
        },
        name: "Listede hangi bilgiler yer alir?",
      },
    ],
  };

  return (
    <main className="space-y-4">
      <nav aria-label="Breadcrumb" className="text-xs text-zinc-500">
        <ol className="flex flex-wrap items-center gap-2">
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
          <li>
            <Link className="transition hover:text-emerald-700" href={`/nobetci/${result.context.city.slug}`}>
              {cityName}
            </Link>
          </li>
          <li className="text-zinc-300">/</li>
          <li className="font-medium text-zinc-700">{districtName}</li>
        </ol>
      </nav>

      <section className="rounded-2xl border border-zinc-200/80 bg-white/85 p-5 shadow-sm backdrop-blur sm:rounded-3xl sm:p-6">
        <span className="text-xs font-semibold uppercase tracking-wider text-emerald-600">
          {cityName} / {districtName}
        </span>
        <h1 className="mt-1 font-display text-2xl font-bold text-zinc-900 sm:text-3xl">
          {pageTitle}
        </h1>
        <div className="mt-2 flex flex-wrap items-center gap-3">
          <span className="inline-flex items-center gap-1.5 text-sm text-zinc-600">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-600">
              <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
            </svg>
            {result.shiftLabel}
          </span>
          <span className="inline-flex items-center gap-1.5 text-xs text-zinc-400">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" /><path d="M12 6v6h4.5" />
            </svg>
            Son guncelleme: {formatFetchedAt(result.fetchedAt)}
          </span>
        </div>
      </section>

      <PharmacyMap pharmacies={result.pharmacies} />

      <section className="grid gap-3 sm:grid-cols-2">
        {result.pharmacies.map((pharmacy, index) => (
          <PharmacyCard key={pharmacy.id} highlight={index === 0} pharmacy={pharmacy} />
        ))}
      </section>

      <div className="flex items-start gap-2.5 rounded-xl border border-amber-200/80 bg-amber-50 px-4 py-3 text-sm leading-relaxed text-amber-800">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mt-0.5 shrink-0">
          <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
          <path d="M12 9v4M12 17h.01" />
        </svg>
        Bu sayfa yalnizca yonlendirme amacli nobetci eczane bilgisi sunar. Acil tibbi durumlarda 112 Acil aranmalidir.
      </div>

      {relatedDistricts.length > 0 ? (
        <section className="rounded-2xl border border-zinc-200/80 bg-white/80 p-5 backdrop-blur sm:rounded-3xl">
          <h2 className="font-display text-lg font-bold text-zinc-900 sm:text-xl">
            {cityName} icindeki diger ilceler
          </h2>
          <div className="mt-3 flex flex-wrap gap-2">
            {relatedDistricts.map((districtItem) => (
              <Link
                key={`related-${districtItem.slug}`}
                className="card-press rounded-lg border border-zinc-200 bg-zinc-50 px-2.5 py-1.5 text-xs font-semibold text-zinc-600 transition hover:border-emerald-300 hover:text-emerald-700"
                href={`/nobetci/${result.context.city.slug}/${districtItem.slug}`}
              >
                {districtItem.name} nobetci eczane
              </Link>
            ))}
          </div>
        </section>
      ) : null}

      <p className="rounded-xl border border-zinc-200/80 bg-white/80 px-4 py-3 text-sm text-zinc-500 backdrop-blur">
        Kaynak:{" "}
        <a
          className="font-semibold text-emerald-700 transition hover:text-emerald-600"
          href={result.sourcePath}
          rel="noreferrer noopener"
          target="_blank"
        >
          eczaneler.gen.tr
        </a>
      </p>

      <script
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListSchema) }}
        type="application/ld+json"
      />
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
