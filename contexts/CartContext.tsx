"use client";

import { createContext, ReactNode, useContext, useMemo, useState } from "react";

export interface CartItem {
  id: string;
  productId: number;
  productName: string;
  quantity: number;
  price: number;
}

export interface Cart {
  id: string;
  shopId: number;
  items: CartItem[];
  subtotal: number;
}

interface CartContextType {
  cart: Cart | null;
  cartId: string | null;

  setCart: (cart: Cart) => void;
  clearCart: () => void;

  itemCount: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCartState] = useState<Cart | null>(null);

  const setCart = (c: Cart) => setCartState(c);
  const clearCart = () => setCartState(null);

  const itemCount = useMemo(() => {
    return cart?.items.reduce((sum, i) => sum + i.quantity, 0) ?? 0;
  }, [cart]);

  return (
    <CartContext.Provider
      value={{
        cart,
        cartId: cart?.id ?? null,
        setCart,
        clearCart,
        itemCount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
