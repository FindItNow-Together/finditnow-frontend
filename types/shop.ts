import { Product } from "@/types/product";

export type Shop = {
  id: number;
  name: string;
  address: string;
  phone: string;
  ownerId: string; // UUID
  latitude: number;
  longitude: number;
  openHours: string;
  deliveryOption: DeliveryOption;
  category?: CategoryResponse;
  imageUrl?: string;
};

export type ShopRequest = {
  name: string;
  address: string;
  phone: string;
  latitude: number;
  longitude: number;
  openHours: string;
  deliveryOption: DeliveryOption;
  ownerId?: string; // UUID, only used by admin
  categoryId?: number;
};

// Simplified version of Category for embedding if needed,
// or import the full one. For now defining inline or importing.
import { Category as CategoryResponse } from "./category";

export type DeliveryOption = "NO_DELIVERY" | "IN_HOUSE_DRIVER" | "THIRD_PARTY_PARTNER";

export type PagedResponse<T> = {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
};

export type InventoryResponse = {
  id: number;
  reservedStock: number;
  price: number;
  stock: number;
  shop: Shop;
  product: Product;
};

export type AddInventoryRequest = {
  productId: number;
  stock: number;
  price: number;
};

export type UpdateInventoryRequest = {
  stock?: number;
  price?: number;
};
