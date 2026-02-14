import type { MetadataRoute } from "next";

import { blogPosts } from "@/content/blog-posts";
import { mapLimit } from "@/lib/async";
import { SITE_URL } from "@/lib/constants";
import { getCities, getDistrictsByCity } from "@/lib/eczane-source";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const entries: MetadataRoute.Sitemap = [
    {
      changeFrequency: "hourly",
      lastModified: now,
      priority: 1,
      url: `${SITE_URL}/`,
    },
    {
      changeFrequency: "daily",
      lastModified: now,
      priority: 0.9,
      url: `${SITE_URL}/nobetci`,
    },
    {
      changeFrequency: "monthly",
      lastModified: now,
      priority: 0.5,
      url: `${SITE_URL}/hakkimizda`,
    },
    {
      changeFrequency: "monthly",
      lastModified: now,
      priority: 0.5,
      url: `${SITE_URL}/veri-kaynagi`,
    },
    {
      changeFrequency: "weekly",
      lastModified: now,
      priority: 0.6,
      url: `${SITE_URL}/rehber`,
    },
  ];

  for (const post of blogPosts) {
    entries.push({
      changeFrequency: "monthly",
      lastModified: new Date(post.updatedAt),
      priority: 0.55,
      url: `${SITE_URL}/rehber/${post.slug}`,
    });
  }

  try {
    const cities = await getCities();
    for (const city of cities) {
      entries.push({
        changeFrequency: "daily",
        lastModified: now,
        priority: 0.8,
        url: `${SITE_URL}/nobetci/${city.slug}`,
      });
    }

    const districtEntries = await mapLimit(cities, 6, async (city) => {
      const districts = await getDistrictsByCity(city.slug).catch(() => []);
      return districts.map((district) => ({
        changeFrequency: "hourly" as const,
        lastModified: now,
        priority: 0.7,
        url: `${SITE_URL}/nobetci/${city.slug}/${district.slug}`,
      }));
    });

    return entries.concat(districtEntries.flat());
  } catch {
    return entries;
  }
}
