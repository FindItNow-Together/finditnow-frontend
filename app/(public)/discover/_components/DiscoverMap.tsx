import { LocationMap } from "@/app/_components/Map";
import ShopPopup from "./ShopPopup";

export default function DiscoverMap({ locations, userLocation }: any) {
  return (
    <LocationMap
      locations={locations}
      userLocation={userLocation}
      renderPopup={(loc: any) => <ShopPopup opportunity={loc.data} />}
    />
  );
}
