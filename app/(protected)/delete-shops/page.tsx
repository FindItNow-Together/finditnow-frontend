"use client";

import { useAuth } from "@/contexts/AuthContext";
import useApi from "@/hooks/useApi";
import { Shop } from "@/types/shop";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

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

/**
 * Delete Shops Page Component
 *
 * This page allows users to delete shops with a two-step confirmation process:
 *
 * Step 1: Selection Phase
 * - Display all shops in a list with checkboxes
 * - User selects shops they want to delete
 * - "Delete Selected" button appears when shops are selected
 *
 * Step 2: Confirmation Phase
 * - Show list of selected shops that will be deleted
 * - Ask for final confirmation
 * - If "Yes": Delete the shops and return to selection
 * - If "No": Go back to selection phase without deleting
 */
export default function DeleteShopsPage() {
  // State to store all shops owned by the user
  const [shops, setShops] = useState<Shop[]>([]);
  const { shopApi } = useApi();

  // State to track which shops are selected for deletion (using Set for efficient lookups)
  const [selectedShopIds, setSelectedShopIds] = useState<Set<number>>(new Set());

  // State to track if we're in confirmation phase (step 2) or selection phase (step 1)
  const [showConfirmation, setShowConfirmation] = useState(false);

  // State to store shops that are selected for deletion (for confirmation display)
  const [shopsToDelete, setShopsToDelete] = useState<Shop[]>([]);

  // State to track loading state
  const [loading, setLoading] = useState(true);

  // State to track if deletion is in progress
  const [deleting, setDeleting] = useState(false);

  // State to store error messages
  const [error, setError] = useState<string | null>(null);

  // Router for navigation
  const router = useRouter();

  // Authentication hook to check if user is logged in
  const { isAuthenticated } = useAuth();

  /**
   * Effect hook: Load shops when user is authenticated
   * This runs once when the component mounts and user is authenticated
   */
  useEffect(() => {
    if (isAuthenticated) {
      loadShops();
    }
  }, [isAuthenticated]);

  /**
   * Function to load all shops owned by the current user
   * Called when the page loads or after shop operations
   */
  const loadShops = async () => {
    try {
      // Call the API to get all shops owned by the current user
      const shops = (await shopApi.getMyShops()) as Shop[];

      // Update the shops state with the fetched data
      setShops(shops);

      // Clear any previous errors
      setError(null);
    } catch (err: any) {
      // If API call fails, show error message
      setError("Failed to load shops");
      console.error("Error loading shops:", err);
    } finally {
      // Mark loading as complete regardless of success or failure
      setLoading(false);
    }
  };

  /**
   * Function to toggle shop selection for deletion
   * Called when user clicks a checkbox
   *
   * @param shopId The ID of the shop to toggle selection
   */
  const handleToggleShopSelection = (shopId: number) => {
    // Create a new Set to avoid mutating state directly
    const newSelectedIds = new Set(selectedShopIds);

    // If shop is already selected, remove it; otherwise, add it
    if (newSelectedIds.has(shopId)) {
      newSelectedIds.delete(shopId);
    } else {
      newSelectedIds.add(shopId);
    }

    // Update the state with the new selection
    setSelectedShopIds(newSelectedIds);
  };

  /**
   * Function to handle "Delete Selected" button click
   * This is Step 1 confirmation - moves to Step 2 (final confirmation)
   */
  const handleDeleteSelected = () => {
    // Get the shops that are selected for deletion
    const selectedShops = shops.filter((shop) => selectedShopIds.has(shop.id));

    // Store them for the confirmation phase
    setShopsToDelete(selectedShops);

    // Move to confirmation phase (Step 2)
    setShowConfirmation(true);
  };

  /**
   * Function to handle final confirmation (Step 2)
   * Called when user clicks "Yes" in the confirmation dialog
   */
  const handleConfirmDelete = async () => {
    // Convert Set to Array for the API call
    const shopIdsArray = Array.from(selectedShopIds);

    // Set deleting state to show loading indicator
    setDeleting(true);

    // Clear any previous errors
    setError(null);

    try {
      // If only one shop, use single delete endpoint
      if (shopIdsArray.length === 1) {
        await shopApi.delete(shopIdsArray[0]);
      } else {
        // If multiple shops, use bulk delete endpoint
        await shopApi.deleteMultiple(shopIdsArray);
      }

      // Clear the selection
      setSelectedShopIds(new Set());

      // Go back to selection phase
      setShowConfirmation(false);

      // Reload shops to reflect the deletion
      await loadShops();

      // Clear any previous errors
      setError(null);
    } catch (err: any) {
      // If deletion fails, show error message
      setError("Failed to delete shops");
      console.error("Error deleting shops:", err);
    } finally {
      // Mark deletion as complete
      setDeleting(false);
    }
  };

  /**
   * Function to handle "No" button in confirmation phase
   * Goes back to selection phase without deleting
   */
  const handleCancelDelete = () => {
    // Go back to selection phase (Step 1)
    setShowConfirmation(false);

    // Clear the shops to delete list
    setShopsToDelete([]);
  };

  // Show loading spinner while checking authentication
  // if (isLoading) {
  //   return <div className="container">Loading...</div>;
  // }

  // If user is not authenticated, don't render anything (will redirect)
  if (!isAuthenticated) {
    return null;
  }

  // Show loading spinner while shops are being loaded
  if (loading) {
    return <div className="container">Loading shops...</div>;
  }

  // If user has no shops, show a message
  if (shops.length === 0) {
    return (
      <div className="container">
        <div className="card">
          <h1>No Shops Found</h1>
          <p>You don&#39;t have any shops to delete.</p>
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

  // STEP 2: Confirmation Phase - Show selected shops and ask for final confirmation
  if (showConfirmation) {
    return (
      <div className="container">
        {/* Header with back button */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "24px",
          }}
        >
          <h1>Confirm Deletion</h1>
          <button className="btn btn-secondary" onClick={() => router.push("/dashboard")}>
            Back to Dashboard
          </button>
        </div>

        {/* Error message display */}
        {error && (
          <div className="error" style={{ marginBottom: "16px" }}>
            {error}
          </div>
        )}

        {/* Confirmation card */}
        <div className="card">
          <h2 style={{ marginBottom: "16px", color: "#dc3545" }}>
            Are you sure you want to delete these shops?
          </h2>

          <p style={{ marginBottom: "20px", color: "#666" }}>
            The following {shopsToDelete.length} shop(s) will be permanently deleted. This will also
            delete all products in these shops. This action cannot be undone.
          </p>

          {/* List of shops to be deleted */}
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
                    {shop.address} • {shop.phone}
                  </span>
                  <br />
                  <span style={{ color: "#666", fontSize: "13px" }}>
                    Open Hours: {shop.openHours}
                  </span>
                  <br />
                  <span style={{ color: "#666", fontSize: "13px" }}>
                    Delivery: {deliveryOptionLabels[shop.deliveryOption] || shop.deliveryOption}
                  </span>
                  <br />
                  <span style={{ color: "#666", fontSize: "13px" }}>
                    Location: Lat {formatCoordinate(shop.latitude)}, Lng{" "}
                    {formatCoordinate(shop.longitude)}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* Action buttons */}
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

  // STEP 1: Selection Phase - Show all shops with checkboxes
  return (
    <div className="container">
      {/* Header with back button */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "24px",
        }}
      >
        <h1>Remove Shops</h1>
        <button className="btn btn-secondary" onClick={() => router.push("/dashboard")}>
          Back to Dashboard
        </button>
      </div>

      {/* Error message display */}
      {error && (
        <div className="error" style={{ marginBottom: "16px" }}>
          {error}
        </div>
      )}

      {/* Instructions */}
      <div className="card" style={{ marginBottom: "24px", backgroundColor: "#e7f3ff" }}>
        <p style={{ margin: 0 }}>
          <strong>Instructions:</strong> Select the shops you want to delete by checking the boxes.
          Then click &#34;Delete Selected&#34; to proceed to confirmation.
        </p>
      </div>

      {/* Shop list with checkboxes */}
      <div className="card">
        <h2 style={{ marginBottom: "16px" }}>Select Shops to Delete</h2>

        {/* List of shops */}
        <div style={{ marginBottom: "20px" }}>
          {shops.map((shop) => {
            // Check if this shop is selected for deletion
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
                {/* Checkbox for selecting shop */}
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

                {/* Shop information */}
                <div style={{ flex: 1 }}>
                  <h3 style={{ margin: 0, marginBottom: "4px" }}>{shop.name}</h3>
                  <p style={{ margin: 0, color: "#666", fontSize: "14px" }}>{shop.address}</p>
                  <p style={{ margin: 0, color: "#666", fontSize: "14px" }}>Phone: {shop.phone}</p>
                  <p style={{ margin: 0, color: "#666", fontSize: "13px" }}>
                    Open Hours: {shop.openHours}
                  </p>
                  <p style={{ margin: 0, color: "#666", fontSize: "13px" }}>
                    Delivery: {deliveryOptionLabels[shop.deliveryOption] || shop.deliveryOption}
                  </p>
                  <p style={{ margin: 0, color: "#666", fontSize: "13px" }}>
                    Location: Lat {formatCoordinate(shop.latitude)}, Lng{" "}
                    {formatCoordinate(shop.longitude)}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Delete Selected button - only shown when shops are selected */}
        {selectedShopIds.size > 0 && (
          <div style={{ display: "flex", gap: "12px", marginTop: "20px" }}>
            <button className="btn btn-danger" onClick={handleDeleteSelected} style={{ flex: 1 }}>
              Delete Selected ({selectedShopIds.size} shop{selectedShopIds.size > 1 ? "s" : ""})
            </button>
            <button className="btn btn-secondary" onClick={() => setSelectedShopIds(new Set())}>
              Clear Selection
            </button>
          </div>
        )}

        {/* Message when no shops are selected */}
        {selectedShopIds.size === 0 && (
          <p style={{ textAlign: "center", color: "#666", marginTop: "20px" }}>
            Select shops above to delete them
          </p>
        )}
      </div>
    </div>
  );
}
