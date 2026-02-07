import { useEffect } from "react";
import { useMap } from "react-leaflet";

export default function RecenterMap({
  lat,
  lng,
  zoom,
}: {
  lat: number;
  lng: number;
  zoom?: number;
}) {
  const map = useMap();

  useEffect(() => {
    if (!lat || !lng) return;

    map.flyTo([lat, lng], map.getZoom(), { duration: 0.4, animate: true });
  }, [lat, lng, zoom, map]);

  return null;
}
