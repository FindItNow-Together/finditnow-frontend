"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Shop } from "@/types/shop";
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

export default function AdminDeleteShopsPage() {
  const [shops, setShops] = useState<Shop[]>([]);
  const [selectedShopIds, setSelectedShopIds] = useState<Set<number>>(
    new Set()
  );
  const [showConfirmation, setShowConfirmation] = useState(false);
  const { shopApi } = useApi();
  const [shopsToDelete, setShopsToDelete] = useState<Shop[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    // Check if user is admin
    // const role = localStorage.getItem('role');
    // if (role !== 'ADMIN') {
    //   router.push('/login');
    //   return;
    // }
    loadShops();
  }, []);

  const loadShops = async () => {
    try {
      const shops = await shopApi.getAllShops() as Shop[];
      setShops(shops);
      setError(null);
    } catch (err: any) {
      setError("Failed to load shops");
      console.error("Error loading shops:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleShopSelection = (shopId: number) => {
    const newSelectedIds = new Set(selectedShopIds);
    if (newSelectedIds.has(shopId)) {
      newSelectedIds.delete(shopId);
    } else {
      newSelectedIds.add(shopId);
    }
    setSelectedShopIds(newSelectedIds);
  };

  const handleDeleteSelected = () => {
    const selectedShops = shops.filter((shop) => selectedShopIds.has(shop.id));
    setShopsToDelete(selectedShops);
    setShowConfirmation(true);
  };

  const handleConfirmDelete = async () => {
    const shopIdsArray = Array.from(selectedShopIds);
    setDeleting(true);
    setError(null);

    try {
      if (shopIdsArray.length === 1) {
        await shopApi.delete(shopIdsArray[0]);
      } else {
        await shopApi.deleteMultiple(shopIdsArray);
      }

      setSelectedShopIds(new Set());
      setShowConfirmation(false);
      await loadShops();
      setError(null);
    } catch (err: any) {
      setError("Failed to delete shops");
      console.error("Error deleting shops:", err);
    } finally {
      setDeleting(false);
    }
  };

  const handleCancelDelete = () => {
    setShowConfirmation(false);
    setShopsToDelete([]);
  };

  if (loading) {
    return <div className="container">Loading shops...</div>;
  }

  if (shops.length === 0) {
    return (
      <div className="container">
        <div className="card">
          <h1>No Shops Found</h1>
          <p>There are no shops in the system.</p>
          <button
            className="btn btn-primary"
            onClick={() => router.push("/admin/dashboard")}
            style={{ marginTop: "16px" }}
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  if (showConfirmation) {
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
          <button
            className="btn btn-secondary"
            onClick={() => router.push("/admin/dashboard")}
          >
            Back to Dashboard
          </button>
        </div>

        {error && (
          <div className="error" style={{ marginBottom: "16px" }}>
            {error}
          </div>
        )}

        <div className="card">
          <h2 style={{ marginBottom: "16px", color: "#dc3545" }}>
            Are you sure you want to delete these shops?
          </h2>

          <p style={{ marginBottom: "20px", color: "#666" }}>
            The following {shopsToDelete.length} shop(s) will be permanently
            deleted. This will also delete all products in these shops. This
            action cannot be undone.
          </p>

          <div style={{ marginBottom: "24px" }}>
            <h3 style={{ marginBottom: "12px" }}>Shops to be deleted:</h3>
            <ul style={{ listStyle: "none", padding: 0 }}>
              {shopsToDelete.map((shop) => (
                <li
                  key={shop.id}
                  style={{
                    padding: "12px",
                    marginBottom: "8px",
                    backgroundColor: "#fff3cd",
                    border: "1px solid #ffc107",
                    borderRadius: "4px",
                  }}
                >
                  <strong>{shop.name}</strong>
                  <br />
                  <span style={{ color: "#666", fontSize: "14px" }}>
                    Owner ID: {shop.ownerId} • {shop.address} • {shop.phone}
                  </span>
                  <br />
                  <span style={{ color: "#666", fontSize: "13px" }}>
                    Open Hours: {shop.openHours}
                  </span>
                  <br />
                  <span style={{ color: "#666", fontSize: "13px" }}>
                    Delivery:{" "}
                    {deliveryOptionLabels[shop.deliveryOption] ||
                      shop.deliveryOption}
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
              {deleting ? "Deleting..." : "Yes, Delete These Shops"}
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
        <h1>Remove Shops (Admin)</h1>
        <button
          className="btn btn-secondary"
          onClick={() => router.push("/admin/dashboard")}
        >
          Back to Dashboard
        </button>
      </div>

      {error && (
        <div className="error" style={{ marginBottom: "16px" }}>
          {error}
        </div>
      )}

      <div
        className="card"
        style={{ marginBottom: "24px", backgroundColor: "#fff3cd" }}
      >
        <p style={{ margin: 0 }}>
          <strong>⚠️ Admin Mode:</strong> You are viewing and can delete ALL
          shops in the system.
        </p>
      </div>

      <div className="card">
        <h2 style={{ marginBottom: "16px" }}>Select Shops to Delete</h2>

        <div style={{ marginBottom: "20px" }}>
          {shops.map((shop) => {
            const isChecked = selectedShopIds.has(shop.id);

            return (
              <div
                key={shop.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  padding: "16px",
                  marginBottom: "12px",
                  backgroundColor: isChecked ? "#fff3cd" : "#f8f9fa",
                  border: isChecked ? "2px solid #ffc107" : "1px solid #ddd",
                  borderRadius: "8px",
                }}
              >
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={() => handleToggleShopSelection(shop.id)}
                  style={{
                    marginRight: "16px",
                    width: "20px",
                    height: "20px",
                    cursor: "pointer",
                  }}
                />

                <div style={{ flex: 1 }}>
                  <h3 style={{ margin: 0, marginBottom: "4px" }}>
                    {shop.name}
                  </h3>
                  <p style={{ margin: 0, color: "#666", fontSize: "14px" }}>
                    Owner ID: {shop.ownerId}
                  </p>
                  <p style={{ margin: 0, color: "#666", fontSize: "14px" }}>
                    {shop.address}
                  </p>
                  <p style={{ margin: 0, color: "#666", fontSize: "14px" }}>
                    Phone: {shop.phone}
                  </p>
                  <p style={{ margin: 0, color: "#666", fontSize: "13px" }}>
                    Open Hours: {shop.openHours}
                  </p>
                  <p style={{ margin: 0, color: "#666", fontSize: "13px" }}>
                    Delivery:{" "}
                    {deliveryOptionLabels[shop.deliveryOption] ||
                      shop.deliveryOption}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {selectedShopIds.size > 0 && (
          <div style={{ display: "flex", gap: "12px", marginTop: "20px" }}>
            <button
              className="btn btn-danger"
              onClick={handleDeleteSelected}
              style={{ flex: 1 }}
            >
              Delete Selected ({selectedShopIds.size} shop
              {selectedShopIds.size > 1 ? "s" : ""})
            </button>
            <button
              className="btn btn-secondary"
              onClick={() => setSelectedShopIds(new Set())}
            >
              Clear Selection
            </button>
          </div>
        )}

        {selectedShopIds.size === 0 && (
          <p style={{ textAlign: "center", color: "#666", marginTop: "20px" }}>
            Select shops above to delete them
          </p>
        )}
      </div>
    </div>
  );
}
