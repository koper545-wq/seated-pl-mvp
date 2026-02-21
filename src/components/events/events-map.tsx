"use client";

import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { MockEvent } from "@/lib/mock-data";

interface EventsMapProps {
  events: MockEvent[];
}

// Event type colors mapping
const eventTypeColors: Record<string, { bg: string; border: string; icon: string }> = {
  "supper-club": { bg: "#f59e0b", border: "#d97706", icon: "🍽️" },      // amber
  "chefs-table": { bg: "#8b5cf6", border: "#7c3aed", icon: "👨‍🍳" },     // violet
  "popup": { bg: "#ef4444", border: "#dc2626", icon: "🎪" },            // red
  "warsztaty": { bg: "#10b981", border: "#059669", icon: "🥘" },        // emerald
  "degustacje": { bg: "#6366f1", border: "#4f46e5", icon: "🍷" },       // indigo
  "active-food": { bg: "#06b6d4", border: "#0891b2", icon: "🏃" },      // cyan
  "farm": { bg: "#84cc16", border: "#65a30d", icon: "🌾" },             // lime
  "default": { bg: "#f59e0b", border: "#d97706", icon: "🍴" },          // amber fallback
};

// Sold out / waitlist color
const soldOutColor = { bg: "#94a3b8", border: "#64748b" }; // slate gray

// Custom marker icon with event type color
const createCustomIcon = (event: MockEvent) => {
  const isSoldOut = event.spotsLeft === 0;
  const typeColors = eventTypeColors[event.typeSlug] || eventTypeColors.default;
  const colors = isSoldOut ? soldOutColor : typeColors;
  const icon = isSoldOut ? "⏳" : typeColors.icon;

  return L.divIcon({
    html: `
      <div style="
        display: flex;
        align-items: center;
        gap: 4px;
        background: ${colors.bg};
        border: 2px solid ${colors.border};
        color: white;
        padding: 4px 8px;
        border-radius: 9999px;
        font-weight: 600;
        font-size: 12px;
        box-shadow: 0 2px 8px rgba(0,0,0,0.25);
        white-space: nowrap;
        ${isSoldOut ? "opacity: 0.75;" : ""}
      ">
        <span style="font-size: 14px;">${icon}</span>
        <span style="${isSoldOut ? "text-decoration: line-through;" : ""}">${event.price} zł</span>
      </div>
    `,
    className: "custom-marker",
    iconSize: [80, 28],
    iconAnchor: [40, 28],
  });
};

// Popup content
const createPopupContent = (event: MockEvent) => {
  const isSoldOut = event.spotsLeft === 0;
  const typeColors = eventTypeColors[event.typeSlug] || eventTypeColors.default;
  const colors = isSoldOut ? soldOutColor : typeColors;

  const spotsText = isSoldOut
    ? '<span style="color: #ef4444; font-weight: 500;">Lista oczekujących</span>'
    : `<span style="color: #22c55e; font-weight: 500;">${event.spotsLeft} miejsc</span>`;

  return `
    <div style="min-width: 220px; max-width: 280px;">
      <div style="
        height: 100px;
        background: linear-gradient(135deg, ${getGradientColors(event.imageGradient)});
        border-radius: 8px 8px 0 0;
        margin: -10px -10px 10px -10px;
        position: relative;
      ">
        <span style="
          position: absolute;
          top: 8px;
          left: 8px;
          background: ${colors.bg};
          color: white;
          padding: 2px 8px;
          border-radius: 9999px;
          font-size: 11px;
          font-weight: 500;
        ">${event.type}</span>
      </div>
      <h3 style="font-weight: 600; font-size: 14px; margin-bottom: 4px; line-height: 1.3;">
        ${event.title}
      </h3>
      <p style="color: #6b7280; font-size: 12px; margin-bottom: 4px;">
        📅 ${event.dateFormatted}
      </p>
      <p style="color: #6b7280; font-size: 12px; margin-bottom: 8px;">
        📍 ${event.location}
      </p>
      <div style="display: flex; justify-content: space-between; align-items: center;">
        <span style="font-weight: 600; color: ${colors.bg};">${event.price} zł</span>
        ${spotsText}
      </div>
      <a
        href="/events/${event.id}"
        style="
          display: block;
          text-align: center;
          background: ${colors.bg};
          color: white;
          padding: 8px;
          border-radius: 6px;
          margin-top: 10px;
          text-decoration: none;
          font-weight: 500;
          font-size: 13px;
        "
      >
        ${isSoldOut ? "Dołącz do listy" : "Zobacz szczegóły"}
      </a>
    </div>
  `;
};

// Helper to extract gradient colors
const getGradientColors = (gradient: string): string => {
  const colorMap: Record<string, string> = {
    "amber-200": "#fde68a",
    "amber-300": "#fcd34d",
    "amber-400": "#fbbf24",
    "amber-900": "#78350f",
    "orange-300": "#fdba74",
    "orange-400": "#fb923c",
    "orange-500": "#f97316",
    "rose-200": "#fecdd3",
    "rose-300": "#fda4af",
    "pink-300": "#f9a8d4",
    "purple-200": "#e9d5ff",
    "violet-300": "#c4b5fd",
    "red-200": "#fecaca",
    "red-300": "#fca5a5",
    "green-200": "#bbf7d0",
    "teal-300": "#5eead4",
    "yellow-200": "#fef08a",
    "yellow-700": "#a16207",
    "slate-700": "#334155",
    "zinc-900": "#18181b",
  };

  const fromMatch = gradient.match(/from-([a-z]+-\d+)/);
  const toMatch = gradient.match(/to-([a-z]+-\d+)/);

  const fromColor = fromMatch ? colorMap[fromMatch[1]] || "#fde68a" : "#fde68a";
  const toColor = toMatch ? colorMap[toMatch[1]] || "#fdba74" : "#fdba74";

  return `${fromColor}, ${toColor}`;
};

export function EventsMap({ events }: EventsMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.Marker[]>([]);
  const [isMapReady, setIsMapReady] = useState(false);

  useEffect(() => {
    if (!mapContainer.current || mapRef.current) return;

    // Initialize map centered on Wrocław
    const map = L.map(mapContainer.current, {
      center: [51.1079, 17.0385],
      zoom: 13,
      zoomControl: true,
    });

    // Add tile layer (OpenStreetMap with lighter style)
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(map);

    mapRef.current = map;
    setIsMapReady(true);

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  // Update markers when events change
  useEffect(() => {
    if (!mapRef.current || !isMapReady) return;

    // Clear existing markers
    markersRef.current.forEach((marker) => {
      mapRef.current?.removeLayer(marker);
    });
    markersRef.current = [];

    // Add markers for events with coordinates
    const eventsWithCoords = events.filter((e) => e.coordinates);

    eventsWithCoords.forEach((event) => {
      if (!event.coordinates) return;

      const marker = L.marker([event.coordinates.lat, event.coordinates.lng], {
        icon: createCustomIcon(event),
      });

      marker.bindPopup(createPopupContent(event), {
        maxWidth: 300,
        className: "custom-popup",
      });

      marker.addTo(mapRef.current!);
      markersRef.current.push(marker);
    });

    // Fit bounds if there are events
    if (eventsWithCoords.length > 0) {
      const bounds = L.latLngBounds(
        eventsWithCoords.map((e) => [e.coordinates!.lat, e.coordinates!.lng])
      );
      mapRef.current.fitBounds(bounds, { padding: [50, 50], maxZoom: 14 });
    }
  }, [events, isMapReady]);

  return (
    <div className="relative h-full w-full rounded-lg overflow-hidden border">
      <div ref={mapContainer} className="h-full w-full" />

      {/* Legend */}
      <div className="absolute bottom-4 left-4 bg-white/95 backdrop-blur-sm rounded-lg shadow-lg p-3 z-[1000] max-h-[200px] overflow-y-auto">
        <p className="text-xs font-semibold text-gray-700 mb-2">Typy wydarzeń:</p>
        <div className="space-y-1.5">
          {Object.entries(eventTypeColors)
            .filter(([key]) => key !== "default")
            .map(([typeSlug, colors]) => {
              const typeLabel = {
                "supper-club": "Supper Club",
                "chefs-table": "Chef's Table",
                "popup": "Pop-up",
                "warsztaty": "Warsztaty",
                "degustacje": "Degustacje",
                "active-food": "Active + Food",
                "farm": "Farm Experience",
              }[typeSlug];

              return (
                <div key={typeSlug} className="flex items-center gap-2 text-xs">
                  <span
                    className="w-4 h-4 rounded-full flex items-center justify-center text-[10px]"
                    style={{ backgroundColor: colors.bg }}
                  >
                    {colors.icon}
                  </span>
                  <span className="text-gray-600">{typeLabel}</span>
                </div>
              );
            })}
          <div className="flex items-center gap-2 text-xs border-t pt-1.5 mt-1.5">
            <span
              className="w-4 h-4 rounded-full flex items-center justify-center text-[10px]"
              style={{ backgroundColor: soldOutColor.bg }}
            >
              ⏳
            </span>
            <span className="text-gray-600">Wyprzedane / Lista oczekujących</span>
          </div>
        </div>
      </div>

      <style jsx global>{`
        .custom-marker {
          background: transparent !important;
          border: none !important;
        }
        .custom-popup .leaflet-popup-content-wrapper {
          border-radius: 12px;
          padding: 0;
        }
        .custom-popup .leaflet-popup-content {
          margin: 10px;
        }
        .custom-popup .leaflet-popup-tip {
          background: white;
        }
      `}</style>
    </div>
  );
}
