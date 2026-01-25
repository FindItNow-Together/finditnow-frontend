export type Shop = {
  id: number;
  name: string;
  address: string;
  phone: string;
  ownerId: string;
  latitude: number;
  longitude: number;
  openHours: string;
  deliveryOption: DeliveryOption;
  category?: CategoryResponse;
};

export type ShopRequest = {
  name: string;
  address: string;
  phone: string;
  latitude: number;
  longitude: number;
  openHours: string;
  deliveryOption: DeliveryOption;
  ownerId?: string;
  categoryId?: number;
};

// Simplified version of Category for embedding if needed, 
// or import the full one. For now defining inline or importing.
import { Category as CategoryResponse } from "./category";

export type DeliveryOption = "NO_DELIVERY" | "IN_HOUSE_DRIVER" | "THIRD_PARTY_PARTNER";
