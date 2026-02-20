import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { blogPosts, getBlogPostBySlug } from "@/content/blog-posts";
import { absoluteUrl, buildBreadcrumbSchema } from "@/lib/seo";

type BlogPostPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export async function generateStaticParams() {
  return blogPosts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({
  params,
}: BlogPostPageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = getBlogPostBySlug(slug);

  if (!post) {
    return {
      robots: { index: false, follow: true },
      title: "Yazi bulunamadi",
    };
  }

  return {
    alternates: {
      canonical: `/rehber/${post.slug}`,
    },
    description: post.description,
    openGraph: {
      description: post.description,
      title: post.title,
      type: "article",
      url: `/rehber/${post.slug}`,
    },
    title: post.title,
  };
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params;
  const post = getBlogPostBySlug(slug);
  if (!post) {
    notFound();
  }

  const breadcrumbSchema = buildBreadcrumbSchema([
    { name: "Ana Sayfa", path: "/" },
    { name: "Rehber", path: "/rehber" },
    { name: post.title, path: `/rehber/${post.slug}` },
  ]);

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    author: {
      "@type": "Organization",
      name: "En Yakın Yer",
    },
    dateModified: post.updatedAt,
    datePublished: post.publishedAt,
    description: post.description,
    headline: post.title,
    inLanguage: "tr-TR",
    mainEntityOfPage: absoluteUrl(`/rehber/${post.slug}`),
    publisher: {
      "@type": "Organization",
      name: "En Yakın Yer",
    },
  };

  return (
    <main className="space-y-4">
      <section className="rounded-2xl border border-zinc-200/80 bg-white/85 p-5 shadow-sm backdrop-blur sm:rounded-3xl sm:p-6">
        <nav aria-label="Breadcrumb" className="mb-4 text-xs text-zinc-500">
          <ol className="flex flex-wrap items-center gap-2">
            <li>
              <Link className="transition hover:text-emerald-700" href="/">
                Ana Sayfa
              </Link>
            </li>
            <li className="text-zinc-300">/</li>
            <li>
              <Link className="transition hover:text-emerald-700" href="/rehber">
                Rehber
              </Link>
            </li>
            <li className="text-zinc-300">/</li>
            <li className="max-w-[200px] truncate font-medium text-zinc-700">{post.title}</li>
          </ol>
        </nav>

        <article className="space-y-5">
          <header className="space-y-2">
            <p className="inline-flex rounded-full bg-emerald-100 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-emerald-700">
              {post.category}
            </p>
            <h1 className="font-display text-2xl font-bold text-zinc-900 sm:text-3xl">
              {post.title}
            </h1>
            <p className="text-sm leading-relaxed text-zinc-600">{post.description}</p>
            <p className="flex items-center gap-2 text-xs text-zinc-400">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
              </svg>
              {post.readMinutes} dk okuma • {post.publishedAt}
            </p>
          </header>

          {post.sections.map((section) => (
            <section className="space-y-2" key={section.heading}>
              <h2 className="font-display text-xl font-bold text-zinc-900 sm:text-2xl">
                {section.heading}
              </h2>
              {section.paragraphs.map((paragraph) => (
                <p className="text-sm leading-7 text-zinc-600" key={paragraph}>
                  {paragraph}
                </p>
              ))}
            </section>
          ))}
        </article>
      </section>

      <script
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
        type="application/ld+json"
      />
      <script
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
        type="application/ld+json"
      />
    </main>
  );
}

