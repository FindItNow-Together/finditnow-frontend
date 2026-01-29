import { Category } from "./category";

// Product is now independent of inventory
// Price and stock are managed at the inventory level
export type Product = {
  id: number;
  name: string;
  description?: string;
  category?: Category;
  imageUrl?: string;
};

export type ProductRequest = {
  name: string;
  description?: string;
  imageUrl?: string;
  categoryId?: string;
  category?: string; // Alternative to categoryId
};
