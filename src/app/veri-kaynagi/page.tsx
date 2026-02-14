import type { Metadata } from "next";

export const metadata: Metadata = {
  alternates: {
    canonical: "/veri-kaynagi",
  },
  description:
    "NobetHizli veri kaynagi ve guncelleme modeli. Nobetci eczane bilgilerinin nereden alindigi ve nasil islendigi.",
  title: "Veri Kaynagi",
};

export default function DataSourcePage() {
  return (
    <main className="space-y-4 rounded-[2rem] border border-zinc-200 bg-white/85 p-5 shadow-sm md:p-6">
      <h1 className="font-display text-3xl font-semibold text-zinc-900">Veri Kaynagi</h1>
      <p className="text-sm leading-7 text-zinc-700">
        Nobetci eczane verileri, kamuya acik sayfalardan okunarak elde edilir:
        <strong> eczaneler.gen.tr</strong>.
      </p>
      <p className="text-sm leading-7 text-zinc-700">
        Uygulama bu verileri sunucu tarafinda parse eder, standart bir veri modeline
        donusturur ve kisa sureli onbellekle hizli teslim eder.
      </p>
      <p className="text-sm leading-7 text-zinc-700">
        Konumdan il/ilce cozumleme icin OpenStreetMap Nominatim servisi kullanilir.
      </p>
      <p className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
        Bu sayfa tibbi danismanlik sunmaz. Acil durumlarda 112 Acil aranmalidir.
      </p>
    </main>
  );
}

