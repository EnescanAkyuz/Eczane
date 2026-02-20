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
    <main className="space-y-4">
      <section className="rounded-2xl border border-zinc-200/80 bg-white/85 p-5 shadow-sm backdrop-blur sm:rounded-3xl sm:p-6">
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-100 text-sky-600">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <ellipse cx="12" cy="5" rx="9" ry="3" />
            <path d="M3 5v14a9 3 0 0 0 18 0V5" />
            <path d="M3 12a9 3 0 0 0 18 0" />
          </svg>
        </div>
        <h1 className="font-display text-2xl font-bold text-zinc-900 sm:text-3xl">Veri Kaynagi</h1>
        <p className="mt-3 text-sm leading-7 text-zinc-600">
          Nobetci eczane verileri, kamuya acik sayfalardan okunarak elde edilir:
          <strong> eczaneler.gen.tr</strong>.
        </p>
        <p className="mt-3 text-sm leading-7 text-zinc-600">
          Uygulama bu verileri sunucu tarafinda parse eder, standart bir veri modeline
          donusturur ve kisa sureli onbellekle hizli teslim eder.
        </p>
        <p className="mt-3 text-sm leading-7 text-zinc-600">
          Konumdan il/ilce cozumleme icin OpenStreetMap Nominatim servisi kullanilir.
        </p>
      </section>
      <div className="flex items-start gap-2.5 rounded-xl border border-amber-200/80 bg-amber-50 px-4 py-3 text-sm leading-relaxed text-amber-800">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mt-0.5 shrink-0">
          <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
          <path d="M12 9v4M12 17h.01" />
        </svg>
        Bu sayfa tibbi danismanlik sunmaz. Acil durumlarda 112 Acil aranmalidir.
      </div>
    </main>
  );
}

