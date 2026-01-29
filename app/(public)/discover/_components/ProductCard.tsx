// ProductCard.tsx
import { useRouter, usePathname } from "next/navigation";

export default function ProductCard({ product, opportunities }: any) {
  const router = useRouter();
  const pathname = usePathname();
  const best = opportunities[0];
  const isShopPage = pathname.startsWith("/shops/");

  return (
    <div className="bg-white p-4 rounded-xl flex gap-4">
      <img src={product.image} className="w-20 h-20" />
      <div className="flex-1">
        <h3>{product.name}</h3>
        <p className="text-blue-600">₹{product.minPrice}</p>
      </div>
      <div className="flex flex-col gap-2">
        <button className="bg-green-600 text-white px-3 py-1 rounded">Buy Now</button>
        {!isShopPage && (
          <button
            className="border px-3 py-1 rounded"
            onClick={() => router.push(`/shops/${best.shop.id}?focus=${product.id}`)}
          >
            View Shops
          </button>
        )}
      </div>
    </div>
  );
}
