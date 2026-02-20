import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex flex-col items-center justify-center rounded-2xl border border-zinc-200/80 bg-white/85 p-8 text-center shadow-sm backdrop-blur sm:rounded-3xl sm:p-12">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-zinc-100 text-zinc-400">
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <path d="M16 16s-1.5-2-4-2-4 2-4 2" />
          <line x1="9" x2="9.01" y1="9" y2="9" />
          <line x1="15" x2="15.01" y1="9" y2="9" />
        </svg>
      </div>
      <h1 className="font-display text-2xl font-bold text-zinc-900 sm:text-3xl">
        Sayfa bulunamadi
      </h1>
      <p className="mt-2 max-w-sm text-sm text-zinc-600">
        Aradiginiz bolge icin veri su an mevcut olmayabilir.
      </p>
      <div className="mt-6">
        <Link
          className="inline-flex h-12 items-center gap-2 rounded-xl bg-emerald-600 px-6 text-sm font-bold text-white transition hover:bg-emerald-500 active:scale-[0.97]"
          href="/"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="m15 18-6-6 6-6" />
          </svg>
          Ana sayfaya don
        </Link>
      </div>
    </main>
  );
}

