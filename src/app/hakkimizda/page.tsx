import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  alternates: {
    canonical: "/hakkimizda",
  },
  description:
    "NobetHizli hakkinda bilgiler. Uygulamanin amaci, veri akis modeli ve kullanici odakli hizli deneyim prensipleri.",
  title: "Hakkimizda",
};

export default function AboutPage() {
  return (
    <main className="space-y-4 rounded-[2rem] border border-zinc-200 bg-white/85 p-5 shadow-sm md:p-6">
      <h1 className="font-display text-3xl font-semibold text-zinc-900">Hakkimizda</h1>
      <p className="text-sm leading-7 text-zinc-700">
        NobetHizli, kullanicinin en yakin nobetci eczaneyi minimum adimla bulmasi
        icin gelistirilen mobil odakli bir web uygulamasidir. Amacimiz, karmasik
        ekranlar yerine hizli erisim, net aksiyonlar ve guvenilir yonlendirme
        sunmaktir.
      </p>
      <p className="text-sm leading-7 text-zinc-700">
        Uygulama; sehir, ilce, telefon ve konum bilgilerini kaynak sistemden cekip
        normalize eder, mesafe hesaplamasi ile siralar ve yol tarifi baglantisini
        dogrudan kullaniciya sunar.
      </p>
      <p className="text-sm leading-7 text-zinc-700">
        Veri akis detayi icin{" "}
        <Link className="font-semibold text-emerald-700 hover:text-emerald-600" href="/veri-kaynagi">
          Veri Kaynagi
        </Link>{" "}
        sayfasini inceleyebilirsiniz.
      </p>
    </main>
  );
}

