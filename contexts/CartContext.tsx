"use client";
import { createContext, useContext, useState, ReactNode, useCallback, useEffect } from "react";
import { Cart } from "@/types/cart";

interface CartContextType {
  itemCount: number;
  setItemCount: (count: number) => void;
  addItem: () => void;
  removeItem: () => void;
  currentCart: Cart | null;
  setCurrentCart: (cart: Cart | null) => void;
  refreshCartCount: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [itemCount, setItemCount] = useState(0);
  const [currentCart, setCurrentCart] = useState<Cart | null>(null);

  const addItem = () => setItemCount((prev) => prev + 1);
  const removeItem = () => setItemCount((prev) => Math.max(0, prev - 1));

  const refreshCartCount = useCallback(() => {
    if (currentCart) {
      setItemCount(currentCart.totalItems);
    } else {
      setItemCount(0);
    }
  }, [currentCart]);

  // Update item count when cart changes
  useEffect(() => {
    if (currentCart) {
      setItemCount(currentCart.totalItems);
    } else {
      setItemCount(0);
    }
  }, [currentCart]);

  return (
    <CartContext.Provider
      value={{
        itemCount,
        setItemCount,
        addItem,
        removeItem,
        currentCart,
        setCurrentCart,
        refreshCartCount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within CartProvider");
  }
  return context;
}
