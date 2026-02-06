import L from "leaflet";
import { useMap } from "react-leaflet";
import { useEffect } from "react";

export default function FitBounds({ points }: { points: [number, number][] }) {
  const map = useMap();

  useEffect(() => {
    if (points.length === 0) return;
    const bounds = L.latLngBounds(points);
    map.fitBounds(bounds, { padding: [40, 40] });
  }, [points, map]);

  return null;
}
