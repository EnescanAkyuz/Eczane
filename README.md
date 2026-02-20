# En Yakın Yer

Mobil odaklı, hızlı ve SEO uyumlu nöbetçi eczane bulma web uygulaması.

## Özellikler

- Konumdan otomatik il/ilçe çözümleme (`/api/pharmacies/nearby`)
- İl + ilçe seçimi ile manuel hızlı arama (`/api/pharmacies`)
- Harita görünümü (kullanıcı konumu + eczane pinleri)
- Yol üzeri eczane arama (`/api/pharmacies/along-route`)
- Mesafeye gore siralama (koordinat bazli)
- Tek dokunusla telefon arama ve Google Maps yol tarifi
- Sehir ve ilce bazli indekslenebilir sayfalar
- Ana akistan bagimsiz rehber/blog bolumu (`/rehber`)
- `robots.txt`, `sitemap.xml`, `manifest.webmanifest`, JSON-LD schema
- Onbellekli veri cekme katmani (kaynak: `eczaneler.gen.tr`)

## Teknoloji

- Next.js 16 (App Router, TypeScript)
- Tailwind CSS 4
- Cheerio (HTML parse)

## Gelistirme

```bash
npm install
npm run dev
```

Uygulama: `http://localhost:3000`

## Build

```bash
npm run lint
npm run build
npm run start
```

## Ortam Degiskenleri

- `NEXT_PUBLIC_SITE_URL`
  - Ornek: `https://ornek-domain.com`
  - Canonical, sitemap ve metadata icin kullanilir.
- `SCRAPER_USER_AGENT` (opsiyonel)
  - Dis kaynak isteklerinde User-Agent ustbilgisi.
- `GOOGLE_SITE_VERIFICATION` (opsiyonel)
  - Search Console dogrulama meta etiketi icin kullanilir.

## Proje Yapisi

- `src/app/page.tsx`: Ana sayfa + hizli bulucu
- `src/app/nobetci/[city]/[district]/page.tsx`: Ilce bazli nobetci liste sayfasi
- `src/app/api/pharmacies/nearby/route.ts`: Konuma gore en yakin akisi
- `src/lib/eczane-source.ts`: Kaynak sayfa parse katmani
- `src/lib/pharmacy-service.ts`: Geocode, eslestirme, zenginlestirme ve siralama

## Notlar

- Veriler dis kaynaktan alindigi icin anlik sapmalar olabilir.
- Uretimde deploy icin Vercel veya Node.js uyumlu herhangi bir platform kullanilabilir.
