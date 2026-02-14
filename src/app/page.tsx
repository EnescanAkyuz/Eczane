import type { Metadata } from "next";
import Link from "next/link";

import { QuickFinder } from "@/components/quick-finder";
import { getCities } from "@/lib/eczane-source";

export const revalidate = 3600;

export const metadata: Metadata = {
  alternates: {
    canonical: "/",
  },
  description:
    "Nobetci eczane bulma uygulamasi. Konumunu ac, en yakin eczaneyi saniyeler icinde bul, ara ve yol tarifine basla.",
  openGraph: {
    description:
      "Konum tabanli hizli nobetci eczane bulma deneyimi. Tek ekranda arama, telefon ve yol tarifi.",
    title: "NobetHizli | En Yakin Nobetci Eczane",
    url: "/",
  },
  title: "Nobetci Eczane Bul",
  twitter: {
    description:
      "Konumunu kullan, en yakin nobetci eczaneye saniyeler icinde ulas.",
    title: "Nobetci Eczane Bul | NobetHizli",
  },
};

const FALLBACK_CITY_SLUGS = [
  "istanbul",
  "ankara",
  "izmir",
  "bursa",
  "antalya",
  "adana",
  "kocaeli",
  "konya",
  "mersin",
  "gaziantep",
];

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Konumumu Kullan butonuna dokunun. Sistem once il ve ilceyi cozer, sonra aktif nobetci listesinden en yakin eczaneyi siralar.",
      },
      name: "En yakin nobetci eczaneyi nasil bulurum?",
    },
    {
      "@type": "Question",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Her kartta tek dokunusla arama ve yol tarifi aksiyonlari vardir. Harita tusu sizi dogrudan navigasyona goturur.",
      },
      name: "Yol tarifini nasil alirim?",
    },
    {
      "@type": "Question",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Nobetci verileri eczaneler.gen.tr kaynagindan cekilir ve kisa araliklarla yeniden okunur.",
      },
      name: "Veriler nereden geliyor?",
    },
  ],
};

export default async function HomePage() {
  const fetchedCities = await getCities().catch(() => []);
  const cities =
    fetchedCities.length > 0
      ? fetchedCities
      : FALLBACK_CITY_SLUGS.map((slug) => ({
          name: slug.charAt(0).toUpperCase() + slug.slice(1),
          slug,
          sourcePath: `/nobetci-${slug}`,
        }));

  return (
    <main className="space-y-8">
      <section className="rounded-[2rem] border border-zinc-200 bg-white/75 p-5 shadow-lg backdrop-blur md:p-8">
        <div>
          <p className="inline-flex rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-800">
            Mobil odakli hizli deneyim
          </p>
          <h1 className="mt-4 font-display text-4xl leading-tight font-bold text-zinc-900 md:text-5xl">
            Nobetci eczaneyi en hizli sekilde bul.
          </h1>
          <p className="mt-4 max-w-3xl text-base leading-7 text-zinc-700">
            Tek sayfa, minimum tiklama. Konumunu ac, en yakin eczaneyi gorelim,
            haritada pinlerden dogrula, hemen ara ve yol tarifini baslat.
          </p>
        </div>

        <div className="mt-6">
          <QuickFinder cities={cities} />
        </div>
      </section>

      <section className="rounded-[2rem] border border-zinc-200 bg-white/80 p-5 shadow-sm md:p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-2xl font-semibold text-zinc-900">
            Sehirden hizli giris
          </h2>
          <Link
            className="text-sm font-semibold text-emerald-700 hover:text-emerald-600"
            href="/nobetci"
          >
            Tum sehirler
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
          {cities.slice(0, 20).map((city) => (
            <Link
              key={city.slug}
              className="rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm font-semibold text-zinc-700 transition hover:border-emerald-300 hover:text-emerald-700"
              href={`/nobetci/${city.slug}`}
            >
              {city.name}
            </Link>
          ))}
        </div>
      </section>

      <section className="rounded-[2rem] border border-zinc-200 bg-white/80 p-5 shadow-sm md:p-6">
        <h2 className="font-display text-2xl font-semibold text-zinc-900">
          Neden NobetHizli?
        </h2>
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          <article className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4">
            <h3 className="font-semibold text-zinc-900">Aninda sonuc</h3>
            <p className="mt-2 text-sm text-zinc-700">
              Konum + aktif nobet bilgisi + mesafe hesabi tek istekte birlesir.
            </p>
          </article>
          <article className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4">
            <h3 className="font-semibold text-zinc-900">Karmasa yok</h3>
            <p className="mt-2 text-sm text-zinc-700">
              Gereksiz menuler yok. Ilk kart her zaman en yakin eczane.
            </p>
          </article>
          <article className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4">
            <h3 className="font-semibold text-zinc-900">SEO uyumlu</h3>
            <p className="mt-2 text-sm text-zinc-700">
              Sehir/ilce bazli sayfalar, sitemap ve yapisal veri ile
              indekslenebilir yapi.
            </p>
          </article>
        </div>
      </section>

      <section className="rounded-[2rem] border border-zinc-200 bg-white/80 p-5 shadow-sm md:p-6">
        <h2 className="font-display text-2xl font-semibold text-zinc-900">
          Populer nobetci eczane aramalari
        </h2>
        <p className="mt-2 text-sm text-zinc-700">
          Asagidaki sehir sayfalarindan ilce secerek aktif nobetci eczane listesine
          hizli gecis yapabilirsiniz.
        </p>

        <ul className="mt-4 grid list-none grid-cols-1 gap-2 p-0 sm:grid-cols-2 lg:grid-cols-3">
          {cities.slice(0, 18).map((city) => (
            <li key={`query-${city.slug}`}>
              <Link
                className="block rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm font-semibold text-zinc-700 transition hover:border-emerald-300 hover:text-emerald-700"
                href={`/nobetci/${city.slug}`}
              >
                {city.name} nobetci eczane
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section className="rounded-[2rem] border border-zinc-200 bg-white/80 p-5 shadow-sm md:p-6">
        <h2 className="font-display text-2xl font-semibold text-zinc-900">
          Sik sorulan sorular
        </h2>
        <div className="mt-4 space-y-4 text-sm leading-6 text-zinc-700">
          <article>
            <h3 className="font-semibold text-zinc-900">
              En yakin nobetci eczane nasil bulunur?
            </h3>
            <p>
              Konumunu kullanarak il ve ilce otomatik belirlenir. Ardindan aktif
              nobet listesi mesafeye gore siralanir ve en yakin eczane en ustte
              gosterilir.
            </p>
          </article>
          <article>
            <h3 className="font-semibold text-zinc-900">
              Yol tarifine tek dokunusla gidebilir miyim?
            </h3>
            <p>
              Evet. Her eczane kartinda yol tarifi dugmesi bulunur ve Google Maps
              ile dogrudan navigasyon baslatilir.
            </p>
          </article>
          <article>
            <h3 className="font-semibold text-zinc-900">
              Nobetci eczane verisi ne kadar guncel?
            </h3>
            <p>
              Veriler kaynak sistemden periyodik olarak cekilir ve sayfalarda son
              guncellenme zamani gorunur.
            </p>
          </article>
        </div>
      </section>

      <script
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
        type="application/ld+json"
      />
    </main>
  );
}
