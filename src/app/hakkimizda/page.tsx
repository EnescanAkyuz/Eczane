import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  alternates: {
    canonical: "/hakkimizda",
  },
  description:
    "En Yakın Yer hakkında bilgiler. Uygulamanın amacı, veri akış modeli ve kullanıcı odaklı hızlı deneyim prensipleri.",
  title: "Hakkımızda",
};

export default function AboutPage() {
  return (
    <main className="space-y-4">
      <section className="rounded-2xl border border-zinc-200/80 bg-white/85 p-5 shadow-sm backdrop-blur sm:rounded-3xl sm:p-6">
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <path d="M12 16v-4M12 8h.01" />
          </svg>
        </div>
        <h1 className="font-display text-2xl font-bold text-zinc-900 sm:text-3xl">Hakkımızda</h1>
        <p className="mt-3 text-sm leading-7 text-zinc-600">
          En Yakın Yer, kullanıcının en yakın nöbetçi eczaneyi minimum adımla bulması
          için geliştirilen mobil odaklı bir web uygulamasıdır. Amacımız, karmaşık
          ekranlar yerine hızlı erişim, net aksiyonlar ve güvenilir yönlendirme
          sunmaktır.
        </p>
        <p className="mt-3 text-sm leading-7 text-zinc-600">
          Uygulama; sehir, ilce, telefon ve konum bilgilerini kaynak sistemden cekip
          normalize eder, mesafe hesaplamasi ile siralar ve yol tarifi baglantisini
          dogrudan kullaniciya sunar.
        </p>
        <p className="mt-3 text-sm leading-7 text-zinc-600">
          Veri akis detayi icin{" "}
          <Link className="font-semibold text-emerald-700 transition hover:text-emerald-600" href="/veri-kaynagi">
            Veri Kaynağı
          </Link>{" "}
          sayfasini inceleyebilirsiniz.
        </p>
      </section>
    </main>
  );
}

