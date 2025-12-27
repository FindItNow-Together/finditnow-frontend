"use client";

import { useAuth } from "@/contexts/AuthContext";
import { Bell, CreditCard, LayoutDashboard, MapPin, ShoppingBag, Truck, User2 } from "lucide-react";
import React, { useState } from "react";
import AddressesSection from "./_components/AddressSection";
import CardsSection from "./_components/CardsSection";
import OrdersSection from "./_components/Orders";
import OverviewSection from "./_components/Overview";
import PastDeliveriesSection from "./_components/PastDeliveries";
import ProfileSection from "./_components/ProfileSection";
import { ShopsSection } from "./_components/ShopsSection";

type UserRole = "CUSTOMER" | "SHOP" | "DELIVERY_AGENT";

const baseTabs = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "orders", label: "Orders", icon: ShoppingBag },
  { id: "profile", label: "Profile", icon: User2 },
  { id: "cards", label: "Cards", icon: CreditCard },
  { id: "addresses", label: "Addresses", icon: MapPin },
];

const roleTabs: Record<UserRole, { id: string; label: string; icon: React.ElementType }[]> = {
  CUSTOMER: [],
  SHOP: [{ id: "shops", label: "Shops", icon: ShoppingBag }],
  DELIVERY_AGENT: [{ id: "past-deliveries", label: "Past Deliveries", icon: Truck }],
};

export default function Profile() {
  const { accessRole: role, userData, setUserData } = useAuth();
  // const api = useApi();
  const [activeTab, setActiveTab] = useState<string>("overview");

  const tabs = React.useMemo(
    () => [...baseTabs, ...(roleTabs[(role as UserRole) || "CUSTOMER"] || [])],
    [role]
  );

  // const fetchProfile = async () => {
  //     try {
  //         const res = await api.get("/api/user/me", { auth: "private" });
  //         const data = await res.json();
  //         setUserData(data.data as User);
  //     } catch (error) {
  //         console.error("Failed to fetch profile:", error);
  //     }
  // };

  // useEffect(() => {
  //     fetchProfile();
  // }, []);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="mx-auto max-w-7xl px-4 py-8 lg:px-8 lg:py-12">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <aside className="w-full lg:w-64 shrink-0 bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 lg:sticky lg:h-fit lg:top-8">
            {/* Profile Header */}
            <div className="mb-8 text-center lg:mb-10">
              <div className="relative mx-auto h-20 w-20 mb-4">
                {userData?.profileUrl ? (
                  <img
                    src={process.env.NEXT_PUBLIC_IMAGE_GATEWAY_URL + userData.profileUrl}
                    alt="Profile"
                    className="h-full w-full rounded-2xl object-cover ring-2 ring-gray-200 dark:ring-gray-600"
                  />
                ) : (
                  <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400 ring-2 ring-gray-200 dark:ring-gray-600">
                    <User2 className="h-10 w-10" />
                  </div>
                )}
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                {userData?.firstName || "User"}
              </h3>
              {/* <p className="text-sm text-gray-500 dark:text-gray-400 capitalize">{role || "customer"}</p> */}
            </div>

            {/* Navigation */}
            <nav className="space-y-1">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id)}
                    className={`
                                            flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-colors duration-200
                                            ${
                                              isActive
                                                ? "bg-blue-50 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800"
                                                : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800/50 hover:text-gray-900 dark:hover:text-gray-100 border border-transparent"
                                            }
                                        `}
                  >
                    <Icon
                      className={`h-5 w-5 shrink-0 ${isActive ? "text-blue-600 dark:text-blue-400" : "text-gray-500 dark:text-gray-400"}`}
                    />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </nav>

            {/* Future sections */}
            <div className="mt-10 pt-6 border-t border-gray-200 dark:border-gray-700">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-4">
                Coming soon
              </p>
              <div className="space-y-2">
                <div className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer transition-colors duration-200 group">
                  <div className="w-9 h-9 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center group-hover:bg-blue-50 dark:group-hover:bg-blue-900/20">
                    <Bell className="h-4 w-4 text-gray-500 dark:text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400" />
                  </div>
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Notifications
                  </span>
                </div>
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1 space-y-6 lg:space-y-8">
            {activeTab === "overview" && <OverviewSection />}
            {activeTab === "orders" && <OrdersSection />}
            {activeTab === "profile" && (
              <ProfileSection userData={userData} setUserData={setUserData} />
            )}
            {activeTab === "cards" && <CardsSection />}
            {activeTab === "addresses" && <AddressesSection />}
            {role === "shopOwner" && activeTab === "shops" && <ShopsSection />}
            {role === "deliveryAgent" && activeTab === "past-deliveries" && (
              <PastDeliveriesSection />
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
