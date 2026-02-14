"use client";

import { useEffect, useMemo, useRef } from "react";

import type { Coordinate, Pharmacy, RouteInfo } from "@/lib/types";

type PharmacyMapProps = {
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

export function PharmacyMap({ pharmacies, route, userLocation }: PharmacyMapProps) {
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

        const popupLines = [
          `<strong>${escapeHtml(pharmacy.name)}</strong>`,
          `${escapeHtml(pharmacy.district)}, ${escapeHtml(pharmacy.city)}`,
          escapeHtml(pharmacy.address),
        ];
        if (distance) {
          popupLines.push(`Konuma uzaklik: ${distance}`);
        }
        if (routeDistance) {
          popupLines.push(`Rotaya uzaklik: ${routeDistance}`);
        }

        L.circleMarker([pharmacy.latitude, pharmacy.longitude], {
          color: borderColor,
          fillColor: markerColor,
          fillOpacity: 0.95,
          radius: index === 0 ? 9 : 7,
          weight: 2,
        })
          .bindPopup(`${badge}<br/>${popupLines.join("<br/>")}`)
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
    <section className="rounded-3xl border border-zinc-200 bg-white/95 p-3 shadow-sm">
      <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
        <h3 className="font-display text-lg font-semibold text-zinc-900">
          Harita Gorunumu
        </h3>
        <p className="text-xs text-zinc-500">
          Mavi: Sen, Kirmizi: En yakin, Yesil: Diger eczaneler
        </p>
      </div>
      <div
        className="h-[52vh] min-h-[380px] w-full overflow-hidden rounded-2xl border border-zinc-200 sm:h-[62vh] sm:min-h-[500px]"
        ref={mapContainerRef}
      />
    </section>
  );
}
