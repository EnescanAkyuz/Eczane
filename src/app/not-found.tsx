import Link from "next/link";

export default function NotFound() {
  return (
    <main className="rounded-[2rem] border border-zinc-200 bg-white/85 p-6 text-center shadow-sm">
      <h1 className="font-display text-3xl font-semibold text-zinc-900">
        Sayfa bulunamadi
      </h1>
      <p className="mt-2 text-sm text-zinc-700">
        Aradiginiz bolge icin veri su an mevcut olmayabilir.
      </p>
      <div className="mt-4">
        <Link
          className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-500"
          href="/"
        >
          Ana sayfaya don
        </Link>
      </div>
    </main>
  );
}

