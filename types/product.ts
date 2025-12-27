export type Product = {
  id: number;
  shopId: number;
  name: string;
  description?: string;
  price: number;
  stock: number;
  category?: string;
};

export type ProductRequest = {
  name: string;
  description?: string;
  price: number;
  stock: number;
  category?: string;
};
