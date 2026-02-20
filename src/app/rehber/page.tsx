import type { Metadata } from "next";
import Link from "next/link";

import { blogPosts } from "@/content/blog-posts";
import { buildBreadcrumbSchema } from "@/lib/seo";

export const metadata: Metadata = {
  alternates: {
    canonical: "/rehber",
  },
  description:
    "Nobetci eczane, mobil kullanim ve yerel SEO odakli rehber yazilari.",
  title: "Rehber",
};

export default function GuidePage() {
  const breadcrumbSchema = buildBreadcrumbSchema([
    { name: "Ana Sayfa", path: "/" },
    { name: "Rehber", path: "/rehber" },
  ]);

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
            <li className="font-medium text-zinc-700">Rehber</li>
          </ol>
        </nav>

        <h1 className="font-display text-2xl font-bold text-zinc-900 sm:text-3xl">Rehber</h1>
        <p className="mt-2 text-sm text-zinc-600">
          Nobetci eczane kullanimina dair ek bilgi ve strateji icerikleri bu bolumde yer alir.
        </p>
      </section>

      <div className="grid gap-3 sm:grid-cols-2">
        {blogPosts.map((post) => (
          <article
            className="card-press rounded-2xl border border-zinc-200/80 bg-white/80 p-5 backdrop-blur transition hover:border-emerald-200 hover:shadow-sm"
            key={post.slug}
          >
            <p className="inline-flex rounded-full bg-emerald-100 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-emerald-700">
              {post.category}
            </p>
            <h2 className="mt-3 font-display text-lg font-bold text-zinc-900 sm:text-xl">
              <Link className="transition hover:text-emerald-700" href={`/rehber/${post.slug}`}>
                {post.title}
              </Link>
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-zinc-600">{post.description}</p>
            <p className="mt-3 flex items-center gap-1.5 text-xs text-zinc-400">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
              </svg>
              {post.readMinutes} dk okuma
            </p>
          </article>
        ))}
      </div>

      <script
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
        type="application/ld+json"
      />
    </main>
  );
}

