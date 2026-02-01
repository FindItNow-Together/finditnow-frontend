// ProductList.tsx
import ProductCard from "./ProductCard";
import { Opportunity } from "@/app/(public)/discover/types";

export default function ProductList({ products, opportunities }: any) {
  return (
    <div className="space-y-3">
      {products.map((product: any) => {
        const productOpps = opportunities.filter((o: Opportunity) => o.product.id === product.id);

        return <ProductCard key={product.id} product={product} opportunities={productOpps} />;
      })}
    </div>
  );
}
