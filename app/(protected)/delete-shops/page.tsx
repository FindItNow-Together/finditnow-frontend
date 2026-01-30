"use client";

import { useAuth } from "@/contexts/AuthContext";
import useApi from "@/hooks/useApi";
import { Shop } from "@/types/shop";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

const deliveryOptionLabels: Record<string, string> = {
  NO_DELIVERY: "No Delivery Service",
  IN_HOUSE_DRIVER: "In-house Delivery Driver",
  THIRD_PARTY_PARTNER: "3rd Party Delivery Partner",
};

const formatCoordinate = (value?: number) => {
  if (value === undefined || value === null) return "N/A";
  return value.toFixed(6);
};

export default function DeleteShopsPage() {
  const [shops, setShops] = useState<Shop[]>([]);
  const { shopApi } = useApi();

  const [selectedShopIds, setSelectedShopIds] = useState<Set<number>>(new Set());
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [shopsToDelete, setShopsToDelete] = useState<Shop[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);

  const router = useRouter();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      loadShops();
    }
  }, [isAuthenticated]);

  const loadShops = async () => {
    try {
      const shops = (await shopApi.getMyShops()) as Shop[];
      setShops(shops);
    } catch (err) {
      console.error("Error loading shops:", err);
      toast.error("Failed to load shops. Please refresh the page.");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleShopSelection = (shopId: number) => {
    const next = new Set(selectedShopIds);
    next.has(shopId) ? next.delete(shopId) : next.add(shopId);
    setSelectedShopIds(next);
  };

  const handleDeleteSelected = () => {
    const selectedShops = shops.filter((shop) => selectedShopIds.has(shop.id));
    setShopsToDelete(selectedShops);
    setShowConfirmation(true);
  };

  const handleConfirmDelete = async () => {
    const shopIdsArray = Array.from(selectedShopIds);
    setDeleting(true);

    try {
      if (shopIdsArray.length === 1) {
        await shopApi.delete(shopIdsArray[0]);
        toast.success("Shop deleted successfully");
      } else {
        await shopApi.deleteMultiple(shopIdsArray);
        toast.success("Shops deleted successfully");
      }

      setSelectedShopIds(new Set());
      setShowConfirmation(false);
      await loadShops();
    } catch (err) {
      console.error("Error deleting shops:", err);
      toast.error("Failed to delete shops. Please try again.");
    } finally {
      setDeleting(false);
    }
  };

  const handleCancelDelete = () => {
    setShowConfirmation(false);
    setShopsToDelete([]);
    toast.info("Deletion cancelled");
  };

  if (!isAuthenticated) return null;

  if (loading) {
    return <div className="container">Loading shops...</div>;
  }

  if (shops.length === 0) {
    return (
      <div className="container">
        <div className="card">
          <h1>No Shops Found</h1>
          <p>You don&apos;t have any shops to delete.</p>
          <button
            className="btn btn-primary"
            onClick={() => router.push("/dashboard")}
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
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "24px" }}>
          <h1>Confirm Deletion</h1>
          <button className="btn btn-secondary" onClick={() => router.push("/dashboard")}>
            Back to Dashboard
          </button>
        </div>

        <div className="card">
          <h2 style={{ color: "#dc3545", marginBottom: "16px" }}>
            Are you sure you want to delete these shops?
          </h2>

          <p style={{ marginBottom: "20px", color: "#666" }}>
            The following {shopsToDelete.length} shop(s) will be permanently deleted.
          </p>

          <ul style={{ listStyle: "none", padding: 0, marginBottom: "24px" }}>
            {shopsToDelete.map((shop) => (
              <li key={shop.id} style={{ padding: "12px", backgroundColor: "#fff3cd" }}>
                <strong>{shop.name}</strong>
                <br />
                <span style={{ fontSize: "13px", color: "#666" }}>
                  {shop.address} • {shop.phone}
                </span>
                <br />
                <span style={{ fontSize: "13px", color: "#666" }}>
                  Delivery: {deliveryOptionLabels[shop.deliveryOption] || shop.deliveryOption}
                </span>
                <br />
                <span style={{ fontSize: "13px", color: "#666" }}>
                  Location: {formatCoordinate(shop.latitude)}, {formatCoordinate(shop.longitude)}
                </span>
              </li>
            ))}
          </ul>

          <div style={{ display: "flex", gap: "12px" }}>
            <button
              className="btn btn-danger"
              onClick={handleConfirmDelete}
              disabled={deleting}
              style={{ flex: 1 }}
            >
              {deleting ? "Deleting..." : "Yes, Delete"}
            </button>
            <button
              className="btn btn-secondary"
              onClick={handleCancelDelete}
              disabled={deleting}
              style={{ flex: 1 }}
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "24px" }}>
        <h1>Remove Shops</h1>
        <button className="btn btn-secondary" onClick={() => router.push("/dashboard")}>
          Back to Dashboard
        </button>
      </div>

      <div className="card" style={{ marginBottom: "24px", backgroundColor: "#e7f3ff" }}>
        <strong>Instructions:</strong> Select shops and click “Delete Selected”.
      </div>

      <div className="card">
        {shops.map((shop) => {
          const isChecked = selectedShopIds.has(shop.id);
          return (
            <div
              key={shop.id}
              style={{
                padding: "16px",
                marginBottom: "12px",
                backgroundColor: isChecked ? "#fff3cd" : "#f8f9fa",
                border: isChecked ? "2px solid #ffc107" : "1px solid #ddd",
              }}
            >
              <input
                type="checkbox"
                checked={isChecked}
                onChange={() => handleToggleShopSelection(shop.id)}
                style={{ marginRight: "16px" }}
              />
              <strong>{shop.name}</strong>
            </div>
          );
        })}

        {selectedShopIds.size > 0 ? (
          <button className="btn btn-danger" onClick={handleDeleteSelected}>
            Delete Selected ({selectedShopIds.size})
          </button>
        ) : (
          <p style={{ textAlign: "center", color: "#666", marginTop: "20px" }}>
            Select shops above to delete them
          </p>
        )}
      </div>
    </div>
  );
}
