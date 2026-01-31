export type Opportunity = {
  product: {
    id: string;
    name: string;
    imageUrl?: string;
    minPrice: number;
    shopCount: number;
    deliveryCount: number;
  };
  inventory: {
    inventoryId: number;
    stock: number;
    price: number;
    reservedStock: number;
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
