import { SITE_URL } from "@/lib/constants";

type BreadcrumbItem = {
  name: string;
  path: string;
};

export function absoluteUrl(path: string): string {
  if (!path || path === "/") {
    return SITE_URL;
  }

  return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}

export function buildBreadcrumbSchema(items: BreadcrumbItem[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      item: absoluteUrl(item.path),
      name: item.name,
      position: index + 1,
    })),
  };
}

export const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  logo: absoluteUrl("/favicon.ico"),
  name: "En Yakın Yer",
  url: SITE_URL,
};

export const websiteSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  inLanguage: "tr-TR",
  name: "En Yakın Yer",
  potentialAction: {
    "@type": "SearchAction",
    "query-input": "required name=search_term_string",
    target: `${SITE_URL}/nobetci?q={search_term_string}`,
  },
  url: SITE_URL,
};
