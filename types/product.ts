import { Category } from "./shop";

export type Product = {
  id: number;
  name: string;
  description?: string;
  imageUrl?: string;
  category?: Category;
};

export type ProductRequest = {
  name: string;
  description?: string;
  imageUrl?: string;
  categoryId?: string;
  category?: string; // Alternative to categoryId
};
