"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Shop } from "@/types/shop";
import useApi from "@/hooks/useApi";
import { toast } from "sonner";

const deliveryOptionLabels: Record<string, string> = {
  NO_DELIVERY: "No Delivery Service",
  IN_HOUSE_DRIVER: "In-house Delivery Driver",
  THIRD_PARTY_PARTNER: "3rd Party Delivery Partner",
};

export default function AdminDeleteShopsPage() {
  const [shops, setShops] = useState<Shop[]>([]);
  const [selectedShopIds, setSelectedShopIds] = useState<Set<number>>(new Set());
  const [showConfirmation, setShowConfirmation] = useState(false);
  const { shopApi } = useApi();
  const [shopsToDelete, setShopsToDelete] = useState<Shop[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const router = useRouter();

  useEffect(() => {
    loadShops();
  }, []);

  const loadShops = async () => {
    try {
      const response = (await shopApi.getAllShops()) as any;
      // Handle paginated response
      const shops = response.content || response;
      setShops(Array.isArray(shops) ? shops : []);
    } catch (err: any) {
      console.error("Error loading shops:", err);
      toast.error("Failed to load shops. Please refresh the page.");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleShopSelection = (shopId: number) => {
    const newSelectedIds = new Set(selectedShopIds);
    newSelectedIds.has(shopId) ? newSelectedIds.delete(shopId) : newSelectedIds.add(shopId);
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
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "24px" }}>
          <h1>Confirm Deletion</h1>
          <button className="btn btn-secondary" onClick={() => router.push("/admin/dashboard")}>
            Back to Dashboard
          </button>
        </div>

        <div className="card">
          <h2 style={{ color: "#dc3545", marginBottom: "16px" }}>
            Are you sure you want to delete these shops?
          </h2>

          <p style={{ marginBottom: "20px", color: "#666" }}>
            The following {shopsToDelete.length} shop(s) will be permanently deleted. This action
            cannot be undone.
          </p>

          <ul style={{ listStyle: "none", padding: 0, marginBottom: "24px" }}>
            {shopsToDelete.map((shop) => (
              <li
                key={shop.id}
                style={{ padding: "12px", marginBottom: "8px", background: "#fff3cd" }}
              >
                <strong>{shop.name}</strong>
                <br />
                <span style={{ fontSize: "14px", color: "#666" }}>
                  {shop.address} • {shop.phone}
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
        <h1>Remove Shops (Admin)</h1>
        <button className="btn btn-secondary" onClick={() => router.push("/admin/dashboard")}>
          Back to Dashboard
        </button>
      </div>

      <div className="card" style={{ marginBottom: "24px", backgroundColor: "#fff3cd" }}>
        <strong>⚠️ Admin Mode:</strong> You can delete ALL shops in the system.
      </div>

      <div className="card">
        {shops.map((shop) => {
          const checked = selectedShopIds.has(shop.id);
          return (
            <div
              key={shop.id}
              style={{
                padding: "16px",
                marginBottom: "12px",
                backgroundColor: checked ? "#fff3cd" : "#f8f9fa",
                border: checked ? "2px solid #ffc107" : "1px solid #ddd",
              }}
            >
              <input
                type="checkbox"
                checked={checked}
                onChange={() => handleToggleShopSelection(shop.id)}
                style={{ marginRight: "12px" }}
              />
              <strong>{shop.name}</strong>
            </div>
          );
        })}

        {selectedShopIds.size > 0 && (
          <button className="btn btn-danger" onClick={handleDeleteSelected}>
            Delete Selected ({selectedShopIds.size})
          </button>
        )}
      </div>
    </div>
  );
}
