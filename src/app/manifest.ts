import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    background_color: "#f5fcf9",
    categories: ["health", "utilities"],
    description: "Konum tabanli hizli nobetci eczane bulma uygulamasi",
    display: "standalone",
    icons: [
      {
        sizes: "any",
        src: "/favicon.ico",
        type: "image/x-icon",
      },
    ],
    name: "En Yakın Yer",
    short_name: "En Yakın Yer",
    start_url: "/",
    theme_color: "#0d7a62",
  };
}

