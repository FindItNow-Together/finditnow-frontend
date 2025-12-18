'use client'
import {useState} from "react";

function useShopCart() {
    const [shopId, setShopId] = useState<string | null>(null);
    const [items, setItems] = useState<Array<{ productId: string; qty: number }>>([]);

    function addToCart(sid: string, productId: string, qty = 1) {
        if (shopId && shopId !== sid) {
            // In real app show modal to confirm clearing cart
            // Here we'll just clear and switch
            setItems([]);
        }
        setShopId(sid);
        setItems(prev => {
            const existing = prev.find(p => p.productId === productId);
            if (existing) return prev.map(p => p.productId === productId ? {...p, qty: p.qty + qty} : p);
            return [...prev, {productId, qty}];
        });
    }

    function clearCart() {
        setItems([]);
        setShopId(null);
    }

    return {shopId, items, addToCart, clearCart};
}

export default useShopCart;