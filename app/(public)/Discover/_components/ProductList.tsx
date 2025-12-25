// ProductList.tsx
import ProductCard from "./ProductCard";

export default function ProductList({ products, opportunities }: any) {
    return (
        <div className="space-y-3">
            {products.map((p: any) => (
                <ProductCard
                    key={p.id}
                    product={p}
                    opportunities={opportunities.filter((o: any) => o.product.id === p.id)}
                />
            ))}
        </div>
    );
}
