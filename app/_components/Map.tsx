import dynamic from "next/dynamic";

const LocationMap = dynamic(() => import("./Map.client").then((m) => m.LocationMap), {
  ssr: false,
});

export default LocationMap;
