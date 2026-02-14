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
      name: "NobetHizli",
    },
    dateModified: post.updatedAt,
    datePublished: post.publishedAt,
    description: post.description,
    headline: post.title,
    inLanguage: "tr-TR",
    mainEntityOfPage: absoluteUrl(`/rehber/${post.slug}`),
    publisher: {
      "@type": "Organization",
      name: "NobetHizli",
    },
  };

  return (
    <main className="space-y-4 rounded-[2rem] border border-zinc-200 bg-white/85 p-5 shadow-sm md:p-6">
      <nav aria-label="Breadcrumb" className="text-xs text-zinc-500">
        <ol className="flex flex-wrap items-center gap-2">
          <li>
            <Link className="hover:text-emerald-700" href="/">
              Ana Sayfa
            </Link>
          </li>
          <li>/</li>
          <li>
            <Link className="hover:text-emerald-700" href="/rehber">
              Rehber
            </Link>
          </li>
          <li>/</li>
          <li className="text-zinc-700">{post.title}</li>
        </ol>
      </nav>

      <article className="space-y-4">
        <header className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">
            {post.category}
          </p>
          <h1 className="font-display text-3xl font-semibold text-zinc-900">
            {post.title}
          </h1>
          <p className="text-sm text-zinc-700">{post.description}</p>
          <p className="text-xs text-zinc-500">
            {post.readMinutes} dk okuma • {post.publishedAt}
          </p>
        </header>

        {post.sections.map((section) => (
          <section className="space-y-2" key={section.heading}>
            <h2 className="font-display text-2xl font-semibold text-zinc-900">
              {section.heading}
            </h2>
            {section.paragraphs.map((paragraph) => (
              <p className="text-sm leading-7 text-zinc-700" key={paragraph}>
                {paragraph}
              </p>
            ))}
          </section>
        ))}
      </article>

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

