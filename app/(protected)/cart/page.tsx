"use client";

import { useSearchParams } from "next/navigation";
import CartContainer from "@/components/cart/CartContainer";
import { useEffect, useState } from "react";

export default function CartPage() {
  const searchParams = useSearchParams();
  const [shopId, setShopId] = useState<string | null>(null);

  useEffect(() => {
    const shopIdParam = searchParams.get("shopId");
    if (shopIdParam) {
      setShopId(shopIdParam);
    } else {
      // TODO: Get shopId from context or user's active cart
      // For now, we'll show an error if no shopId is provided
      console.warn("No shopId provided in cart page");
    }
  }, [searchParams]);

  if (!shopId) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <p className="text-gray-600 mb-4">No shop selected</p>
          <p className="text-sm text-gray-500">
            Please select a shop to view your cart, or add items from a shop first.
          </p>
        </div>
      </div>
    );
  }

  return <CartContainer shopId={shopId} />;
}

