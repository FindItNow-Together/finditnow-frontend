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
    latitude: number;
    longitude: number;
    deliveryAvailable: boolean;
  };
  price: number;
  distanceKm?: number;
};
