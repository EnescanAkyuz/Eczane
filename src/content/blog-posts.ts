export type BlogSection = {
  heading: string;
  paragraphs: string[];
};

export type BlogPost = {
  category: string;
  description: string;
  publishedAt: string;
  readMinutes: number;
  sections: BlogSection[];
  slug: string;
  title: string;
  updatedAt: string;
};

export const blogPosts: BlogPost[] = [
  {
    category: "Nobet Rehberi",
    description:
      "Nobetci eczane ararken vakit kaybetmemek icin kullanabilecegin pratik adimlar.",
    publishedAt: "2026-02-14",
    readMinutes: 4,
    sections: [
      {
        heading: "1) Once konum, sonra telefon",
        paragraphs: [
          "Acil durumda en sik zaman kaybi, yanlis eczaneye gitmekten kaynaklanir. Bu nedenle once konumdan en yakin eczaneyi bulup hemen telefonla teyit almak iyi bir pratiktir.",
          "Haritada pin kontrolu ve tek dokunusla arama ikilisi, gece saatlerinde yanlis yonlenme riskini azaltir.",
        ],
      },
      {
        heading: "2) Yol uzerindeki eczaneyi sec",
        paragraphs: [
          "Eve donus, hastane cikisi veya havaalani rotasi gibi durumlarda en yakin eczane her zaman en hizli cozum olmaz.",
          "Rota uzerindeki eczane secimi, toplam sureyi kisaltir ve ekstra sapma maliyetini dusurur.",
        ],
      },
      {
        heading: "3) Acil durum bilgilendirmesi",
        paragraphs: [
          "Bu icerik yonlendirme amaclidir; tibbi tanı veya tedavi onerisi degildir.",
          "Hayati risk tasiyan acil durumlarda 112 Acil ile iletisime gecilmelidir.",
        ],
      },
    ],
    slug: "nobetci-eczane-hizli-bulma-rehberi",
    title: "Nobetci Eczane Hizli Bulma Rehberi",
    updatedAt: "2026-02-14",
  },
  {
    category: "Mobil Deneyim",
    description:
      "Mobilde nobetci eczane aramasini hizlandiran arayuz prensipleri ve kullanim aliskanliklari.",
    publishedAt: "2026-02-14",
    readMinutes: 5,
    sections: [
      {
        heading: "Tek ekranda net aksiyonlar",
        paragraphs: [
          "Kullanici mobilde uzun form doldurmak istemez. Konum al, sonucu goster, ara veya rota ac akisi tek ekranda kalmalidir.",
          "Ozellikle gece kullaniminda kontrast ve buton boyutu kritik oldugu icin temel aksiyonlar buyuk ve ulasilabilir olmali.",
        ],
      },
      {
        heading: "Harita olmadan guven azalir",
        paragraphs: [
          "Adres metni tek basina yeterli olmaz. Kullanici pin gorerek konumu dogrulamak ister.",
          "Bu nedenle kullanici konumu, en yakin eczane ve rota cizgisi ayni harita panelinde sunulunca terk orani duser.",
        ],
      },
    ],
    slug: "mobilde-nobetci-eczane-deneyimi",
    title: "Mobilde Nobetci Eczane Deneyimi Nasıl Guclenir?",
    updatedAt: "2026-02-14",
  },
  {
    category: "SEO",
    description:
      "Nobetci eczane sitesinde programatik sayfalar, schema ve icerik stratejisi nasil birlikte calisir?",
    publishedAt: "2026-02-14",
    readMinutes: 6,
    sections: [
      {
        heading: "Programatik sehir ve ilce sayfalari",
        paragraphs: [
          "Yerel aramalarda kullanici niyeti genellikle sehir ve ilce bazindadir. Bu nedenle sehir > ilce > aktif liste hiyerarsisi, dogru indeksleme sinyali verir.",
          "Her sayfada ayni metni kopyalamak yerine yerel, guncel ve kullaniciya yardimci icerik olmasi gerekir.",
        ],
      },
      {
        heading: "Blog neden faydali?",
        paragraphs: [
          "Blog, sadece trafik icin degil, konu otoritesi ve uzun kuyruk sorgular icin faydalidir.",
          "Ancak blog icerigi ana urun akisini yavaslatmamalidir. Ayrik bir rehber bolumu ile hem SEO hem urun hizi korunabilir.",
        ],
      },
    ],
    slug: "nobetci-eczane-seo-stratejisi",
    title: "Nobetci Eczane SEO Stratejisi: Programatik Sayfalar + Blog",
    updatedAt: "2026-02-14",
  },
];

export function getBlogPostBySlug(slug: string): BlogPost | undefined {
  return blogPosts.find((post) => post.slug === slug);
}

