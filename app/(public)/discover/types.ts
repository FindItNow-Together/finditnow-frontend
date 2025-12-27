export type Opportunity = {
  product: {
    id: string;
    name: string;
    image?: string;
    minPrice: number;
    shopCount: number;
    deliveryCount: number;
  };
  shop: {
    id: string;
    name: string;
    lat: number;
    lng: number;
    deliveryAvailable: boolean;
  };
  price: number;
  distanceKm?: number;
};
