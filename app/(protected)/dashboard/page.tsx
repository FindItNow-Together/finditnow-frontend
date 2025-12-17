"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Shop } from "@/types/shop";
import { Product } from "@/types/product";
import ShopCard from "@/components/ShopCard";
import { useAuth } from "@/contexts/AuthContext";
import useApi from "@/hooks/useApi";

export default function DashboardPage() {
  const [shops, setShops] = useState<Shop[]>([]);
  const [shopsWithProducts, setShopsWithProducts] = useState<
    Map<number, Product[]>
  >(new Map());
  const [loading, setLoading] = useState(true);
  const { productApi, shopApi } = useApi();
  const [searchQuery, setSearchQuery] = useState("");
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      loadShops();
    }
  }, [isAuthenticated]);

  const loadShops = async () => {
    try {
      const response = await shopApi.getMyShops();
      setShops(response.data);

      // Load products for each shop
      const productsMap = new Map<number, Product[]>();
      await Promise.all(
        response.data.map(async (shop) => {
          try {
            const productsResponse = await productApi.getByShop(shop.id);
            productsMap.set(shop.id, productsResponse.data);
          } catch (err) {
            console.error(`Failed to load products for shop ${shop.id}`, err);
            productsMap.set(shop.id, []);
          }
        })
      );

      setShopsWithProducts(productsMap);
    } catch (err: any) {
      setError("Failed to load shops");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    router.push("/login");
  };

  // Filter shops based on search query
  const filteredShops = useMemo(() => {
    if (!searchQuery.trim()) {
      return shops;
    }

    const query = searchQuery.toLowerCase();
    return shops.filter((shop) => {
      // Search in shop name, address, and phone
      const matchesShop =
        shop.name.toLowerCase().includes(query) ||
        shop.address.toLowerCase().includes(query) ||
        shop.phone.toLowerCase().includes(query);

      // Search in product names
      const products = shopsWithProducts.get(shop.id) || [];
      const matchesProducts = products.some((product) =>
        product.name.toLowerCase().includes(query)
      );

      return matchesShop || matchesProducts;
    });
  }, [shops, searchQuery, shopsWithProducts]);

  // if (isLoading) {
  //   return <div className="container">Loading...</div>;
  // }

  if (!isAuthenticated) {
    return null;
  }

  if (loading) {
    return <div className="container">Loading shops...</div>;
  }

  if (shops.length === 0) {
    return (
      <div className="container">
        <div className="card">
          <h1>No Shops Found</h1>
          <p>You need to register a shop first.</p>
          <button
            className="btn btn-primary"
            onClick={() => router.push("/register-shop")}
            style={{ marginTop: "16px" }}
          >
            Register Shop
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "24px",
          flexWrap: "wrap",
          gap: "16px",
        }}
      >
        <h1 style={{ margin: 0 }}>My Shops</h1>
        <button className="btn btn-secondary" onClick={handleLogout}>
          Logout
        </button>
      </div>

      {error && (
        <div className="error" style={{ marginBottom: "16px" }}>
          {error}
        </div>
      )}

      {/* Action Buttons */}
      <div
        style={{
          marginBottom: "24px",
          display: "flex",
          gap: "12px",
          flexWrap: "wrap",
        }}
      >
        <button
          className="btn btn-primary"
          onClick={() => router.push("/register-shop")}
        >
          + Add New Shop
        </button>
        <button
          className="btn btn-danger"
          onClick={() => router.push("/delete-shops")}
        >
          Remove Shop
        </button>
      </div>

      {/* Search Bar */}
      <div style={{ marginBottom: "24px" }}>
        <div style={{ position: "relative" }}>
          <input
            type="text"
            placeholder="Search shops by name, address, phone, or products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: "100%",
              padding: "12px 40px 12px 16px",
              fontSize: "16px",
              border: "2px solid #ddd",
              borderRadius: "8px",
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
              right: "16px",
              top: "50%",
              transform: "translateY(-50%)",
              fontSize: "20px",
              color: "#999",
            }}
          >
            🔍
          </span>
        </div>
        {searchQuery && (
          <p
            style={{
              marginTop: "8px",
              fontSize: "14px",
              color: "#666",
            }}
          >
            Found {filteredShops.length}{" "}
            {filteredShops.length === 1 ? "shop" : "shops"}
          </p>
        )}
      </div>

      {/* Shop Cards Grid */}
      {filteredShops.length === 0 ? (
        <div className="card">
          <p style={{ textAlign: "center", color: "#666", margin: 0 }}>
            No shops found matching "{searchQuery}"
          </p>
        </div>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
            gap: "20px",
            marginBottom: "40px",
          }}
        >
          {filteredShops.map((shop) => {
            const products = shopsWithProducts.get(shop.id) || [];
            const topProducts = products.map((p) => p.name);

            return (
              <ShopCard
                key={shop.id}
                shop={shop}
                productCount={products.length}
                topProducts={topProducts}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
