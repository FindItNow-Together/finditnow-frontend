"use client";

import { CircleMarker, MapContainer, Marker, Popup, TileLayer, useMapEvents } from "react-leaflet";
import { MapLocation } from "@/types/mapLocation";
import L from "leaflet";

// Fix for default marker icons
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import shadowIcon from "leaflet/dist/images/marker-shadow.png";
import RecenterMap from "@/app/_components/Map/RecenterMap";
import { useMemo } from "react";
import FitBounds from "@/app/_components/Map/FitBounds";

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: markerIcon.src || markerIcon,
  iconRetinaUrl: markerIcon2x.src || markerIcon2x,
  shadowUrl: shadowIcon.src || shadowIcon,
});

type LocationMapProps<T> = {
  locations?: MapLocation<T>[];
  userLocation: { lat: number; lng: number } | null;
  zoom?: number;
  height?: string;
  renderPopup?: (location: MapLocation<T>) => React.ReactNode;
  onMarkerClick?: (location: MapLocation<T>) => void;
  onMapClick?: (lat: number, lng: number) => void;
  customIcon?: L.DivIcon | L.Icon; // Add custom icon support
  useCircleMarker?: boolean; // Option to use circle marker instead
};

function MapEvents({ onMapClick }: { onMapClick?: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      onMapClick?.(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

export function LocationMap<T>({
  locations = [],
  userLocation,
  zoom = 13,
  height = "18rem",
  renderPopup,
  onMarkerClick,
  onMapClick,
  customIcon,
  useCircleMarker = true,
}: LocationMapProps<T>) {
  const center = userLocation ? [userLocation.lat, userLocation.lng] : [20.5937, 78.9629];

  const points: [number, number][] = useMemo(
    () => [
      ...(userLocation ? [[userLocation.lat, userLocation.lng] as [number, number]] : []),
      ...locations.map((l) => [l.lat, l.lng] as [number, number]),
    ],
    [userLocation, locations]
  );

  return (
    <div className="bg-gray-100 rounded overflow-hidden" style={{ height }}>
      <MapContainer
        center={center as [number, number]}
        zoom={zoom}
        scrollWheelZoom
        className="w-full h-full"
      >
        <TileLayer
          attribution="&copy; OpenStreetMap contributors"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <MapEvents onMapClick={onMapClick} />
        {userLocation && <RecenterMap lat={userLocation.lat} lng={userLocation.lng} zoom={zoom} />}
        <FitBounds points={points} />

        {/* User/Selected location - use custom icon if provided, otherwise circle marker */}
        {userLocation && (
          <>
            {customIcon ? (
              <Marker position={[userLocation.lat, userLocation.lng]} icon={customIcon}>
                <Popup>Delivery Agent Location</Popup>
              </Marker>
            ) : useCircleMarker ? (
              <CircleMarker
                center={[userLocation.lat, userLocation.lng]}
                radius={10}
                pathOptions={{
                  color: "#2563eb",
                  fillColor: "#3b82f6",
                  fillOpacity: 0.8,
                  weight: 2,
                }}
              >
                <Popup>Selected Location</Popup>
              </CircleMarker>
            ) : (
              <Marker position={[userLocation.lat, userLocation.lng]}>
                <Popup>Selected Location</Popup>
              </Marker>
            )}
          </>
        )}

        {/* Generic markers for existing shops/locations */}
        {locations.map((loc) => (
          <Marker
            key={loc.id}
            position={[loc.lat, loc.lng]}
            eventHandlers={{ click: () => onMarkerClick?.(loc) }}
          >
            {renderPopup && <Popup>{renderPopup(loc)}</Popup>}
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
