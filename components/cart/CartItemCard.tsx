"use client";

import { Minus, Plus, Trash2 } from "lucide-react";
import { CartItem } from "@/types/cart";
import { useState } from "react";

interface CartItemCardProps {
  item: CartItem;
  onUpdateQuantity: (itemId: string, quantity: number) => Promise<void>;
  onRemove: (itemId: string) => Promise<void>;
}

export default function CartItemCard({ item, onUpdateQuantity, onRemove }: CartItemCardProps) {
  const [isUpdating, setIsUpdating] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);
  const [optimisticQuantity, setOptimisticQuantity] = useState(item.quantity);

  const handleQuantityChange = async (newQuantity: number) => {
    if (newQuantity < 1 || newQuantity === optimisticQuantity || isUpdating) return;

    const previousQuantity = optimisticQuantity;
    setOptimisticQuantity(newQuantity);
    setIsUpdating(true);

    try {
      await onUpdateQuantity(item.itemId, newQuantity);
    } catch (error) {
      setOptimisticQuantity(previousQuantity);
      console.error("Failed to update quantity:", error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleRemove = async () => {
    if (isRemoving) return;

    setIsRemoving(true);
    try {
      await onRemove(item.itemId);
    } catch (error) {
      console.error("Failed to remove item:", error);
      setIsRemoving(false);
    }
  };

  const itemTotal = item.price * optimisticQuantity;

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 md:p-6">
      <div className="flex gap-4">
        {/* Product Image */}
        <div className="flex-shrink-0">
          {item.imageUrl ? (
            <img
              src={process.env.NEXT_PUBLIC_IMAGE_GATEWAY_URL + item.imageUrl}
              alt={item.productName}
              className="w-20 h-20 md:w-24 md:h-24 rounded-lg object-cover"
            />
          ) : (
            <div className="w-20 h-20 md:w-24 md:h-24 rounded-lg bg-gray-100 flex items-center justify-center">
              <span className="text-gray-400 text-xs">No Image</span>
            </div>
          )}
        </div>

        {/* Product Details */}
        <div className="flex-1 min-w-0">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 mb-1">{item.productName}</h3>
              {/*{item.shopName && <p className="text-sm text-gray-600 mb-2">Shop: {item.shopName}</p>}*/}
              <p className="text-lg font-semibold text-blue-600">₹{item.price.toFixed(2)}</p>
            </div>

            {/* Quantity Controls & Remove */}
            <div className="flex items-center gap-4">
              {/* Quantity Controls */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleQuantityChange(optimisticQuantity - 1)}
                  disabled={isUpdating || optimisticQuantity <= 1}
                  className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  aria-label="Decrease quantity"
                >
                  <Minus className="h-4 w-4 text-gray-700" />
                </button>
                <span className="w-12 text-center font-medium text-gray-900">
                  {optimisticQuantity}
                </span>
                <button
                  onClick={() => handleQuantityChange(optimisticQuantity + 1)}
                  disabled={isUpdating}
                  className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  aria-label="Increase quantity"
                >
                  <Plus className="h-4 w-4 text-gray-700" />
                </button>
              </div>

              {/* Remove Button */}
              <button
                onClick={handleRemove}
                disabled={isRemoving}
                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Remove item"
              >
                <Trash2 className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Item Total */}
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Item Total</span>
              <span className="text-lg font-semibold text-gray-900">₹{itemTotal.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
