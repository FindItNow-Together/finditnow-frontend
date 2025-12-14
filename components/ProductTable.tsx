'use client';

import { Product } from '@/types/product';

interface ProductTableProps {
  products: Product[];
  onEdit: (product: Product) => void;
  onDelete: (id: number) => void;
}

export default function ProductTable({ products, onEdit, onDelete }: ProductTableProps) {
  if (products.length === 0) {
    return <p>No products found. Add your first product!</p>;
  }

  return (
    <table>
      <thead>
        <tr>
          <th>Name</th>
          <th>Description</th>
          <th>Price</th>
          <th>Stock</th>
          <th>Category</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        {products.map((product) => (
          <tr key={product.id}>
            <td>{product.name}</td>
            <td>{product.description || '-'}</td>
            <td>${product.price.toFixed(2)}</td>
            <td>{product.stock}</td>
            <td>{product.category || '-'}</td>
            <td>
              <button
                className="btn btn-secondary"
                onClick={() => onEdit(product)}
                style={{ marginRight: '8px', padding: '6px 12px', fontSize: '14px' }}
              >
                Edit
              </button>
              <button
                className="btn btn-danger"
                onClick={() => onDelete(product.id)}
                style={{ padding: '6px 12px', fontSize: '14px' }}
              >
                Delete
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

