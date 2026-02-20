"use client";

import { useEffect, useMemo, useRef } from "react";

import type { Coordinate, Pharmacy, RouteInfo } from "@/lib/types";

type PharmacyMapProps = {
  loading?: boolean;
  pharmacies: Pharmacy[];
  route?: RouteInfo;
  userLocation?: Coordinate | null;
};

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function formatDistanceLabel(distanceKm: number | undefined): string {
  if (distanceKm === undefined) {
    return "";
  }
  if (distanceKm < 1) {
    return `${Math.round(distanceKm * 1000)} m`;
  }
  return `${distanceKm.toFixed(1)} km`;
}

function toTelHref(phone: string): string {
  const digits = phone.replace(/[^\d+]/g, "");
  if (!digits) return "";
  if (digits.startsWith("+")) return `tel:${digits}`;
  if (digits.startsWith("90")) return `tel:+${digits}`;
  if (digits.startsWith("0")) return `tel:+9${digits}`;
  return `tel:${digits}`;
}

function buildPopupHtml(pharmacy: Pharmacy, badge: string, distance: string, routeDistance: string): string {
  const lines = [
    `<div style="font-family:var(--font-manrope),system-ui,sans-serif;min-width:180px">`,
    `<div style="display:flex;align-items:center;gap:6px;margin-bottom:6px">`,
    `<span style="display:inline-flex;align-items:center;justify-content:center;width:20px;height:20px;border-radius:6px;background:${badge === "En yakin" ? "#059669" : "#e5e7eb"};color:${badge === "En yakin" ? "#fff" : "#71717a"};font-size:11px;font-weight:700">+</span>`,
    `<strong style="font-size:14px;color:#18181b">${escapeHtml(pharmacy.name)}</strong>`,
    `</div>`,
    `<div style="font-size:12px;color:#52525b;margin-bottom:4px">${escapeHtml(pharmacy.district)}, ${escapeHtml(pharmacy.city)}</div>`,
    `<div style="font-size:12px;color:#71717a;line-height:1.5;margin-bottom:6px">${escapeHtml(pharmacy.address)}</div>`,
  ];

  if (distance || routeDistance) {
    lines.push(`<div style="display:flex;flex-wrap:wrap;gap:4px;margin-bottom:8px">`);
    if (distance) {
      lines.push(`<span style="display:inline-block;background:#d1fae5;color:#065f46;font-size:11px;font-weight:600;padding:2px 8px;border-radius:100px">${distance}</span>`);
    }
    if (routeDistance) {
      lines.push(`<span style="display:inline-block;background:#e0f2fe;color:#075985;font-size:11px;font-weight:600;padding:2px 8px;border-radius:100px">Rota: ${routeDistance}</span>`);
    }
    lines.push(`</div>`);
  }

  // Action buttons
  const telHref = toTelHref(pharmacy.phone);
  lines.push(`<div style="display:grid;grid-template-columns:1fr 1fr;gap:6px">`);

  if (telHref) {
    lines.push(
      `<a href="${telHref}" style="display:flex;align-items:center;justify-content:center;gap:4px;height:36px;border-radius:10px;background:#18181b;color:#fff;font-size:12px;font-weight:700;text-decoration:none">` +
      `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>` +
      `Ara</a>`
    );
  } else {
    lines.push(
      `<span style="display:flex;align-items:center;justify-content:center;height:36px;border-radius:10px;background:#f4f4f5;color:#a1a1aa;font-size:12px;font-weight:600">Tel yok</span>`
    );
  }

  if (pharmacy.mapUrl) {
    lines.push(
      `<a href="${escapeHtml(pharmacy.mapUrl)}" target="_blank" rel="noreferrer noopener" style="display:flex;align-items:center;justify-content:center;gap:4px;height:36px;border-radius:10px;background:#059669;color:#fff;font-size:12px;font-weight:700;text-decoration:none">` +
      `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polygon points="3 11 22 2 13 21 11 13 3 11"/></svg>` +
      `Yol tarifi</a>`
    );
  }

  lines.push(`</div>`);
  lines.push(`</div>`);
  return lines.join("");
}

export function PharmacyMap({
  loading,
  pharmacies,
  route,
  userLocation,
}: PharmacyMapProps) {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<{ remove: () => void } | null>(null);

  const markerPharmacies = useMemo(
    () =>
      pharmacies
        .filter(
          (pharmacy) =>
            pharmacy.latitude !== undefined && pharmacy.longitude !== undefined,
        )
        .slice(0, 120),
    [pharmacies],
  );

  useEffect(() => {
    let cancelled = false;

    async function initializeMap() {
      if (!mapContainerRef.current) {
        return;
      }

      const leafletModule = await import("leaflet");
      if (cancelled || !mapContainerRef.current) {
        return;
      }

      const L = leafletModule.default ?? leafletModule;
      const map = L.map(mapContainerRef.current, {
        attributionControl: true,
        scrollWheelZoom: false,
        zoomControl: false,
      });
      mapInstanceRef.current = map;

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "&copy; OpenStreetMap contributors",
        maxZoom: 19,
      }).addTo(map);
      L.control.zoom({ position: "topright" }).addTo(map);

      const boundsPoints: [number, number][] = [];

      if (route?.path?.length && route.path.length > 1) {
        const pathPoints = route.path.map((point) => [point.lat, point.lng]) as [
          number,
          number,
        ][];
        L.polyline(pathPoints, {
          color: "#2563eb",
          opacity: 0.85,
          weight: 5,
        }).addTo(map);
        boundsPoints.push(...pathPoints);
      }

      if (userLocation) {
        L.circleMarker([userLocation.lat, userLocation.lng], {
          color: "#1d4ed8",
          fillColor: "#3b82f6",
          fillOpacity: 1,
          radius: 8,
          weight: 2,
        })
          .bindPopup("Konumun")
          .addTo(map);
        boundsPoints.push([userLocation.lat, userLocation.lng]);
      }

      for (let index = 0; index < markerPharmacies.length; index += 1) {
        const pharmacy = markerPharmacies[index];
        if (pharmacy.latitude === undefined || pharmacy.longitude === undefined) {
          continue;
        }

        const markerColor = index === 0 ? "#dc2626" : "#16a34a";
        const borderColor = index === 0 ? "#991b1b" : "#166534";
        const badge = index === 0 ? "En yakin" : "Eczane";
        const distance = formatDistanceLabel(pharmacy.distanceKm);
        const routeDistance = formatDistanceLabel(pharmacy.routeDistanceKm);

        const popupContent = buildPopupHtml(pharmacy, badge, distance, routeDistance);

        L.circleMarker([pharmacy.latitude, pharmacy.longitude], {
          color: borderColor,
          fillColor: markerColor,
          fillOpacity: 0.95,
          radius: index === 0 ? 9 : 7,
          weight: 2,
        })
          .bindPopup(popupContent, { maxWidth: 260, minWidth: 200 })
          .addTo(map);

        boundsPoints.push([pharmacy.latitude, pharmacy.longitude]);
      }

      if (route?.destination) {
        L.circleMarker([route.destination.lat, route.destination.lng], {
          color: "#5b21b6",
          fillColor: "#8b5cf6",
          fillOpacity: 0.95,
          radius: 8,
          weight: 2,
        })
          .bindPopup(`Varis: ${escapeHtml(route.destinationLabel)}`)
          .addTo(map);

        boundsPoints.push([route.destination.lat, route.destination.lng]);
      }

      if (boundsPoints.length >= 2) {
        map.fitBounds(boundsPoints, { padding: [28, 28] });
      } else if (boundsPoints.length === 1) {
        map.setView(boundsPoints[0], 14);
      } else {
        map.setView([39.0, 35.0], 5);
      }

      window.setTimeout(() => {
        if (!cancelled) {
          map.invalidateSize();
        }
      }, 80);
    }

    initializeMap();

    return () => {
      cancelled = true;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [markerPharmacies, route, userLocation]);

  return (
    <section className="overflow-hidden rounded-2xl border border-zinc-200/80 bg-white/95 shadow-sm sm:rounded-3xl">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-zinc-100 px-4 py-3">
        <h3 className="flex items-center gap-2 font-display text-base font-bold text-zinc-900 sm:text-lg">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-600">
            <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6" />
            <line x1="8" x2="8" y1="2" y2="18" />
            <line x1="16" x2="16" y1="6" y2="22" />
          </svg>
          Harita
        </h3>
        <div className="flex flex-wrap items-center gap-3 text-[11px] text-zinc-500">
          <span className="flex items-center gap-1">
            <span className="h-2.5 w-2.5 rounded-full bg-blue-500" /> Sen
          </span>
          <span className="flex items-center gap-1">
            <span className="h-2.5 w-2.5 rounded-full bg-red-500" /> En yakin
          </span>
          <span className="flex items-center gap-1">
            <span className="h-2.5 w-2.5 rounded-full bg-green-500" /> Diger
          </span>
        </div>
      </div>
      <div className="relative">
        <div
          className={`h-[50vh] min-h-[340px] w-full transition-opacity duration-300 sm:h-[58vh] sm:min-h-[450px] ${
            loading ? "opacity-30" : "opacity-100"
          }`}
          ref={mapContainerRef}
        />
        {loading && (
          <div className="absolute inset-0 z-[401] flex flex-col items-center justify-center gap-3 bg-white/20 backdrop-blur-[1px]">
            <div className="relative">
              <div className="h-10 w-10 rounded-full border-4 border-emerald-100" />
              <div className="absolute top-0 h-10 w-10 animate-spin rounded-full border-4 border-emerald-600 border-t-transparent" />
            </div>
            <p className="text-xs font-bold text-emerald-800">Harita güncelleniyor...</p>
          </div>
        )}
      </div>
    </section>
  );
}
