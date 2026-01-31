export type CategoryType = "PRODUCT" | "SHOP" | "BOTH";

export interface Category {
  id: number;
  name: string;
  description?: string;
  imageUrl?: string;
  type: CategoryType;
}

export interface CategoryRequest {
  name: string;
  description?: string;
  imageUrl?: string;
  type: CategoryType;
}
