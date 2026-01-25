export type Category = {
  id: number;
  name: string;
  description?: string;
  imageUrl?: string;
  type: "PRODUCT" | "SHOP" | "BOTH";
};

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
  category?: Category;
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
