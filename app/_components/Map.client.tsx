"use client";

import { MapContainer, TileLayer, Marker, Popup, CircleMarker, useMapEvents } from "react-leaflet";
import { MapLocation } from "@/types/mapLocation";
import L from "leaflet";

// Fix for default marker icons (for the generic locations)
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import shadowIcon from "leaflet/dist/images/marker-shadow.png";

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
}: LocationMapProps<T>) {
  const center = userLocation ? [userLocation.lat, userLocation.lng] : [20.5937, 78.9629];

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

        {/* Styled CircleMarker for the selected/user position */}
        {userLocation && (
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
            <Popup>Selected Shop Location</Popup>
          </CircleMarker>
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
