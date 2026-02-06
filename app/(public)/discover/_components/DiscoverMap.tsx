import ShopPopup from "./ShopPopup";
import LocationMap from "@/app/_components/Map/Map";

export default function DiscoverMap({ locations, userLocation }: any) {
  return (
    <LocationMap
      locations={locations}
      userLocation={userLocation}
      renderPopup={(loc: any) => <ShopPopup opportunity={loc.data} />}
    />
  );
}
