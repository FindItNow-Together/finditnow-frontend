"use client";

import { Shop } from "@/types/shop";
import { useRouter } from "next/navigation";

interface ShopCardProps {
  shop: Shop;
  productCount?: number;
  topProducts?: string[];
}

const deliveryOptionLabels: Record<string, string> = {
  NO_DELIVERY: "No Delivery",
  IN_HOUSE_DRIVER: "In-house Delivery",
  THIRD_PARTY_PARTNER: "3rd Party Delivery",
};

export default function ShopCard({ shop, productCount = 0, topProducts = [] }: ShopCardProps) {
  const router = useRouter();

  const handleCardClick = () => {
    router.push(`/shop/${shop.id}`);
  };

  return (
    <div
      onClick={handleCardClick}
      className="
    h-full cursor-pointer rounded-xl border border-gray-200
    bg-white p-5
    shadow-sm transition-all duration-300
    hover:-translate-y-1 hover:shadow-md
    flex flex-col
  "
    >
      {/* Shop Name */}
      <h2 className="mb-3 text-xl font-semibold text-gray-800">{shop.name}</h2>

      {/* Address */}
      <p className="mb-2 flex items-center gap-1.5 text-sm text-gray-600">
        <span className="text-base">📍</span>
        {shop.address}
      </p>

      {/* Phone */}
      <p className="mb-2 flex items-center gap-1.5 text-sm text-gray-600">
        <span className="text-base">📞</span>
        {shop.phone}
      </p>

      {/* Open Hours */}
      <p className="mb-2 flex items-center gap-1.5 text-sm text-gray-600">
        <span className="text-base">🕒</span>
        {shop.openHours}
      </p>

      {/* Delivery Option */}
      <div className="mb-3">
        <span
          className="
      inline-block rounded-full
      bg-blue-50 px-3 py-1
      text-xs font-medium text-blue-700
    "
        >
          {deliveryOptionLabels[shop.deliveryOption] || shop.deliveryOption}
        </span>
      </div>

      {/* Divider */}
      <div className="my-3 border-t border-gray-200" />

      {/* Products */}
      <div className="flex-1">
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
          {productCount} {productCount === 1 ? "Product" : "Products"}
        </p>

        {topProducts.length > 0 ? (
          <>
            <p className="mb-1 text-xs font-medium text-gray-400">Featured:</p>
            <ul className="list-disc pl-4">
              {topProducts.slice(0, 3).map((productName, index) => (
                <li key={index} className="text-sm text-gray-600">
                  {productName}
                </li>
              ))}
            </ul>
          </>
        ) : (
          <p className="text-sm italic text-gray-400">No products yet</p>
        )}
      </div>

      {/* Footer CTA */}
      <div className="mt-3 text-right text-sm font-medium text-blue-600">View Details →</div>
    </div>
  );
}
