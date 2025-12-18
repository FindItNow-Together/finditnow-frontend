import { MapContainer, TileLayer, Marker, Popup, CircleMarker } from "react-leaflet";
import {MapLocation} from "@/types/mapLocation";

type LocationMapProps<T> = {
    locations: MapLocation<T>[];
    userLocation: { lat: number; lng: number } | null;
    zoom?: number;
    height?: string;

    renderPopup: (location: MapLocation<T>) => React.ReactNode;
    onMarkerClick?: (location: MapLocation<T>) => void;
};

export function LocationMap<T>({
                                   locations,
                                   userLocation,
                                   zoom = 13,
                                   height = "18rem",
                                   renderPopup,
                                   onMarkerClick,
                               }: LocationMapProps<T>) {
    const center = userLocation
        ? [userLocation.lat, userLocation.lng]
        : locations.length
            ? [locations[0].lat, locations[0].lng]
            : [20.5937, 78.9629]; // fallback

    return (
        <div
            className="bg-gray-100 rounded overflow-hidden"
            style={{ height }}
        >
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

                {/* User marker */}
                {userLocation && (
                    <CircleMarker
                        center={[userLocation.lat, userLocation.lng]}
                        radius={8}
                        pathOptions={{
                            color: "#2563eb",
                            fillColor: "#3b82f6",
                            fillOpacity: 0.85,
                        }}
                    >
                        <Popup>You are here</Popup>
                    </CircleMarker>
                )}

                {/* Generic markers */}
                {locations.map((loc) => (
                    <Marker
                        key={loc.id}
                        position={[loc.lat, loc.lng]}
                        eventHandlers={{
                            click: () => onMarkerClick?.(loc),
                        }}
                    >
                        <Popup>{renderPopup(loc)}</Popup>
                    </Marker>
                ))}
            </MapContainer>
        </div>
    );
}
