'use client'
import {createContext, useContext, useState, ReactNode} from 'react';

interface CartContextType {
    itemCount: number;
    setItemCount: (count: number) => void;
    addItem: () => void;
    removeItem: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({children}: {children: ReactNode}) {
    const [itemCount, setItemCount] = useState(0);

    const addItem = () => setItemCount(prev => prev + 1);
    const removeItem = () => setItemCount(prev => Math.max(0, prev - 1));

    return (
        <CartContext.Provider value={{itemCount, setItemCount, addItem, removeItem}}>
            {children}
        </CartContext.Provider>
    );
}

export function useCart() {
    const context = useContext(CartContext);
    if (!context) {
        throw new Error('useCart must be used within CartProvider');
    }
    return context;
}
