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
    <main className="space-y-4 rounded-[2rem] border border-zinc-200 bg-white/85 p-5 shadow-sm md:p-6">
      <nav aria-label="Breadcrumb" className="text-xs text-zinc-500">
        <ol className="flex items-center gap-2">
          <li>
            <Link className="hover:text-emerald-700" href="/">
              Ana Sayfa
            </Link>
          </li>
          <li>/</li>
          <li className="text-zinc-700">Rehber</li>
        </ol>
      </nav>

      <h1 className="font-display text-3xl font-semibold text-zinc-900">Rehber</h1>
      <p className="text-sm text-zinc-700">
        Ana hizli arama deneyimini bozmadan, nobetci eczane kullanimina dair ek
        bilgi ve strateji icerikleri bu bolumde yayinlanir.
      </p>

      <div className="grid gap-3 md:grid-cols-2">
        {blogPosts.map((post) => (
          <article
            className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4"
            key={post.slug}
          >
            <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">
              {post.category}
            </p>
            <h2 className="mt-2 font-display text-xl font-semibold text-zinc-900">
              <Link className="hover:text-emerald-700" href={`/rehber/${post.slug}`}>
                {post.title}
              </Link>
            </h2>
            <p className="mt-2 text-sm text-zinc-700">{post.description}</p>
            <p className="mt-3 text-xs text-zinc-500">
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

