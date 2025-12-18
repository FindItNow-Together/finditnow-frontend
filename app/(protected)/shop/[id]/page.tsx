"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter, useParams } from "next/navigation";
import { Shop } from "@/types/shop";
import { Product } from "@/types/product";
import ProductForm from "@/components/ProductForm";
import { useAuth } from "@/contexts/AuthContext";
import useApi from "@/hooks/useApi";

const deliveryOptionLabels: Record<string, string> = {
  NO_DELIVERY: "No Delivery Service",
  IN_HOUSE_DRIVER: "In-house Delivery Driver",
  THIRD_PARTY_PARTNER: "3rd Party Delivery Partner",
};

const formatCoordinate = (value?: number) => {
  if (value === undefined || value === null) {
    return "N/A";
  }
  return value.toFixed(6);
};

export default function ShopDetailsPage() {
  const params = useParams();
  const shopId = params?.id ? Number(params.id) : null;

  const { productApi, shopApi } = useApi();

  const [shop, setShop] = useState<Shop | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showProductForm, setShowProductForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();
  const { isAuthenticated } = useAuth();

  const [selectedProducts, setSelectedProducts] = useState<Set<number>>(
    new Set()
  );
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (isAuthenticated && shopId) {
      loadShopDetails();
      loadProducts();
    }
  }, [isAuthenticated, shopId]);

  const loadShopDetails = async () => {
    if (!shopId) return;

    try {
      const response = await shopApi.getShop(shopId);
      setShop(response as Shop);
    } catch (err: any) {
      setError("Failed to load shop details");
    } finally {
      setLoading(false);
    }
  };

  const loadProducts = async () => {
    if (!shopId) return;

    try {
      const prods = await productApi.getByShop(shopId) as Product[];
      setProducts(prods);
      setSelectedProducts(new Set()); // Clear selection on reload
    } catch (err: any) {
      setError("Failed to load products");
    }
  };

  const handleAddProduct = () => {
    setEditingProduct(null);
    setShowProductForm(true);
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setShowProductForm(true);
  };

  const handleBulkDelete = () => {
    if (selectedProducts.size === 0) return;
    setShowDeleteConfirmation(true);
  };

  const handleConfirmDelete = async () => {
    setDeleting(true);
    try {
      await productApi.deleteMultiple(Array.from(selectedProducts));
      setShowDeleteConfirmation(false);
      loadProducts();
    } catch (err: any) {
      setError("Failed to delete products");
    } finally {
      setDeleting(false);
    }
  };

  const handleCancelDelete = () => {
    setShowDeleteConfirmation(false);
  };

  const toggleProductSelection = (productId: number) => {
    const newSelection = new Set(selectedProducts);
    if (newSelection.has(productId)) {
      newSelection.delete(productId);
    } else {
      newSelection.add(productId);
    }
    setSelectedProducts(newSelection);
  };

  const toggleAllSelection = () => {
    if (selectedProducts.size === filteredProducts.length) {
      setSelectedProducts(new Set());
    } else {
      setSelectedProducts(new Set(filteredProducts.map((p) => p.id)));
    }
  };

  const handleProductSaved = () => {
    setShowProductForm(false);
    setEditingProduct(null);
    loadProducts();
  };

  // Filter products based on search query
  const filteredProducts = useMemo(() => {
    if (!searchQuery.trim()) {
      return products;
    }

    const query = searchQuery.toLowerCase();
    return products.filter((product) => {
      return (
        product.name.toLowerCase().includes(query) ||
        (product.description &&
          product.description.toLowerCase().includes(query)) ||
        (product.category && product.category.toLowerCase().includes(query))
      );
    });
  }, [products, searchQuery]);

  // if (isLoading) {
  //   return <div className="container">Loading...</div>;
  // }

  if (!isAuthenticated) {
    return null;
  }

  if (loading) {
    return <div className="container">Loading shop details...</div>;
  }

  if (!shop) {
    return (
      <div className="container">
        <div className="card">
          <h1>Shop Not Found</h1>
          <button
            className="btn btn-primary"
            onClick={() => {
              if (isAuthenticated && localStorage.getItem("role") === "ADMIN") {
                router.push("/admin/dashboard");
              } else {
                router.push("/dashboard");
              }
            }}
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const handleBack = () => {
    if (isAuthenticated && localStorage.getItem("role") === "ADMIN") {
      router.push("/admin/dashboard");
    } else {
      router.push("/dashboard");
    }
  };

  const isAdmin =
    typeof window !== "undefined" && localStorage.getItem("role") === "ADMIN";

  if (showDeleteConfirmation) {
    const productsToDelete = products.filter((p) => selectedProducts.has(p.id));

    return (
      <div className="container">
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "24px",
          }}
        >
          <h1>Confirm Deletion</h1>
          <button className="btn btn-secondary" onClick={handleCancelDelete}>
            Back
          </button>
        </div>

        <div className="card">
          <h2 style={{ marginBottom: "16px", color: "#dc3545" }}>
            Are you sure you want to delete these products?
          </h2>

          <p style={{ marginBottom: "20px", color: "#666" }}>
            The following {productsToDelete.length} product(s) will be
            permanently deleted. This action cannot be undone.
          </p>

          <div style={{ marginBottom: "24px" }}>
            <h3 style={{ marginBottom: "12px" }}>Products to be deleted:</h3>
            <ul style={{ listStyle: "none", padding: 0 }}>
              {productsToDelete.map((product) => (
                <li
                  key={product.id}
                  style={{
                    padding: "12px",
                    marginBottom: "8px",
                    backgroundColor: "#fff3cd",
                    border: "1px solid #ffc107",
                    borderRadius: "4px",
                  }}
                >
                  <strong>{product.name}</strong>
                  <br />
                  <span style={{ color: "#666", fontSize: "14px" }}>
                    Price: ${product.price.toFixed(2)} • Stock: {product.stock}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <div style={{ display: "flex", gap: "12px" }}>
            <button
              className="btn btn-danger"
              onClick={handleConfirmDelete}
              disabled={deleting}
              style={{ flex: 1 }}
            >
              {deleting ? "Deleting..." : "Yes, Delete These Products"}
            </button>
            <button
              className="btn btn-secondary"
              onClick={handleCancelDelete}
              disabled={deleting}
              style={{ flex: 1 }}
            >
              No, Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "24px",
        }}
      >
        <h1>{shop.name}</h1>
        <button className="btn btn-secondary" onClick={handleBack}>
          Back to Dashboard
        </button>
      </div>

      {error && (
        <div className="error" style={{ marginBottom: "16px" }}>
          {error}
        </div>
      )}

      <div className="card">
        <h2 style={{ marginBottom: "16px" }}>Shop Information</h2>
        <div style={{ display: "grid", gap: "12px" }}>
          {isAdmin && (
            <p>
              <strong>Owner ID:</strong> {shop.ownerId}
            </p>
          )}
          <p>
            <strong>Address:</strong> {shop.address}
          </p>
          <p>
            <strong>Phone:</strong> {shop.phone}
          </p>
          <p>
            <strong>Open Hours:</strong> {shop.openHours}
          </p>
          <p>
            <strong>Delivery Option:</strong>{" "}
            {deliveryOptionLabels[shop.deliveryOption] || shop.deliveryOption}
          </p>
          <p>
            <strong>Location:</strong> Lat {formatCoordinate(shop.latitude)},
            Lng {formatCoordinate(shop.longitude)}
          </p>
        </div>
      </div>

      <div className="card">
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "16px",
          }}
        >
          <h2>Products ({products.length})</h2>
          <div style={{ display: "flex", gap: "12px" }}>
            {!isAdmin && selectedProducts.size > 0 && (
              <button className="btn btn-danger" onClick={handleBulkDelete}>
                Delete Selected ({selectedProducts.size})
              </button>
            )}
            {!isAdmin && (
              <button className="btn btn-primary" onClick={handleAddProduct}>
                + Add Product
              </button>
            )}
          </div>
        </div>

        {showProductForm && (
          <ProductForm
            shopId={shop.id}
            product={editingProduct}
            onSave={handleProductSaved}
            onCancel={() => {
              setShowProductForm(false);
              setEditingProduct(null);
            }}
          />
        )}

        {/* Product Search Bar */}
        {products.length > 0 && (
          <div style={{ marginBottom: "24px" }}>
            <div style={{ position: "relative" }}>
              <input
                type="text"
                placeholder="Search products by name, description, or category..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: "100%",
                  padding: "10px 40px 10px 12px",
                  fontSize: "15px",
                  border: "2px solid #ddd",
                  borderRadius: "6px",
                  outline: "none",
                  transition: "border-color 0.2s",
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = "#007bff";
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = "#ddd";
                }}
              />
              <span
                style={{
                  position: "absolute",
                  right: "12px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  fontSize: "18px",
                  color: "#999",
                }}
              >
                🔍
              </span>
            </div>
            {searchQuery && (
              <p
                style={{
                  marginTop: "6px",
                  fontSize: "13px",
                  color: "#666",
                }}
              >
                Found {filteredProducts.length}{" "}
                {filteredProducts.length === 1 ? "product" : "products"}
              </p>
            )}
          </div>
        )}

        {/* Products Table */}
        {products.length === 0 ? (
          <p>No products found. {isAdmin ? "" : "Add your first product!"}</p>
        ) : filteredProducts.length === 0 ? (
          <div
            style={{
              padding: "20px",
              textAlign: "center",
              backgroundColor: "#f8f9fa",
              borderRadius: "4px",
            }}
          >
            <p style={{ margin: 0, color: "#666" }}>
              No products found matching "{searchQuery}"
            </p>
          </div>
        ) : (
          <table>
            <thead>
              <tr>
                {!isAdmin && (
                  <th style={{ width: "40px" }}>
                    <input
                      type="checkbox"
                      checked={
                        selectedProducts.size === filteredProducts.length &&
                        filteredProducts.length > 0
                      }
                      onChange={toggleAllSelection}
                    />
                  </th>
                )}
                <th>Name</th>
                <th>Description</th>
                <th>Price</th>
                <th>Stock</th>
                <th>Category</th>
                {!isAdmin && <th>Actions</th>}
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map((product) => (
                <tr key={product.id}>
                  {!isAdmin && (
                    <td>
                      <input
                        type="checkbox"
                        checked={selectedProducts.has(product.id)}
                        onChange={() => toggleProductSelection(product.id)}
                      />
                    </td>
                  )}
                  <td>{product.name}</td>
                  <td>{product.description || "-"}</td>
                  <td>${product.price.toFixed(2)}</td>
                  <td>{product.stock}</td>
                  <td>{product.category || "-"}</td>
                  {!isAdmin && (
                    <td>
                      <button
                        type="button"
                        className="btn btn-secondary"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditProduct(product);
                        }}
                        style={{ padding: "6px 12px", fontSize: "14px" }}
                      >
                        Edit
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
