'use client';

import { useState, useEffect } from 'react';
import { productApi } from '@/lib/api';
import { Product, ProductRequest } from '@/types/product';

interface ProductFormProps {
  shopId: number;
  product?: Product | null;
  onSave: () => void;
  onCancel: () => void;
}

export default function ProductForm({ shopId, product, onSave, onCancel }: ProductFormProps) {
  const [formData, setFormData] = useState<ProductRequest>({
    name: '',
    description: '',
    price: 0,
    stock: 0,
    category: '',
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name,
        description: product.description || '',
        price: product.price,
        stock: product.stock,
        category: product.category || '',
      });
    }
  }, [product]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (product) {
        await productApi.update(product.id, formData);
      } else {
        await productApi.add(shopId, formData);
      }
      onSave();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to save product');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === 'price' ? parseFloat(value) || 0 : name === 'stock' ? parseInt(value) || 0 : value,
    });
  };

  return (
    <div style={{ marginBottom: '24px', padding: '20px', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
      <h3 style={{ marginBottom: '16px' }}>{product ? 'Edit Product' : 'Add New Product'}</h3>
      
      {error && <div className="error" style={{ marginBottom: '16px' }}>{error}</div>}
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="name">Product Name *</label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={3}
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <div className="form-group">
            <label htmlFor="price">Price *</label>
            <input
              type="number"
              id="price"
              name="price"
              value={formData.price}
              onChange={handleChange}
              step="0.01"
              min="0.01"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="stock">Stock *</label>
            <input
              type="number"
              id="stock"
              name="stock"
              value={formData.stock}
              onChange={handleChange}
              min="0"
              required
            />
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="category">Category</label>
          <input
            type="text"
            id="category"
            name="category"
            value={formData.category}
            onChange={handleChange}
          />
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
          >
            {loading ? 'Saving...' : product ? 'Update Product' : 'Add Product'}
          </button>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={onCancel}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

