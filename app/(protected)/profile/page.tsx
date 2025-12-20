'use client'

import React, { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import useApi from "@/hooks/useApi";
import { User } from "@/types/user";
import Image from "next/image";

type UserRole = "customer" | "shopOwner" | "deliveryAgent";


const baseTabs = [
    { id: "overview", label: "Overview" },
    { id: "orders", label: "Orders" },
    { id: "profile", label: "Profile" },
    { id: "cards", label: "Cards" },
    { id: "addresses", label: "Addresses" },
];

const roleTabs: Record<UserRole, { id: string; label: string }[]> = {
    customer: [],
    shopOwner: [{ id: "shops", label: "Shops" }],
    deliveryAgent: [{ id: "past-deliveries", label: "Past Deliveries" }],
};

export default function Profile() {
    const { accessRole: role } = useAuth();
    const api = useApi();
    const [userData, setUserData] = useState<User>()

    const [activeTab, setActiveTab] = useState<string>("overview");

    const tabs = React.useMemo(
        () => [...baseTabs, ...(roleTabs[role] || [])],
        [role]
    );

    const fetchProfile = () => {
        api.get("/api/user/me", { auth: "private" }).then(res => res.json()).then(data => {
            setUserData(data.data as User)
        })
    }

    useEffect(() => {
        fetchProfile()
    }, []);

    return (
        <div className="mx-auto flex max-w-6xl gap-6 px-4 py-6 lg:py-10">
            {/* Sidebar */}
            <aside className="w-56 shrink-0 border-r border-gray-200 pr-4 dark:border-gray-800">
                <div className="mb-6 flex items-center gap-3">
                    <div className="h-10 w-10 overflow-hidden rounded-full bg-gray-200">
                        {/* Replace with next/image + src from user */}
                        <div
                            className="flex h-full w-full items-center justify-center text-sm font-semibold text-gray-500">
                            {userData?.firstName.substring(0, 1)}
                        </div>
                    </div>
                    <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                            {userData?.firstName.toUpperCase()}
                        </p>
                        <p className="text-xs text-gray-500">{userData?.email}</p>
                    </div>
                </div>

                <nav className="space-y-1 text-sm">
                    {tabs.map((tab) => {
                        const isActive = activeTab === tab.id;
                        return (
                            <button
                                key={tab.id}
                                type="button"
                                onClick={() => setActiveTab(tab.id)}
                                className={[
                                    "flex w-full items-center justify-between rounded-md px-3 py-2 text-left transition",
                                    isActive
                                        ? "bg-gray-900 text-white dark:bg-gray-100 dark:text-gray-900"
                                        : "text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-900/40",
                                ].join(" ")}
                            >
                                <span>{tab.label}</span>
                            </button>
                        );
                    })}

                    {/* Placeholder for future sections */}
                    <div className="pt-4 text-xs uppercase tracking-wide text-gray-400">
                        Future sections
                    </div>
                </nav>
            </aside>

            {/* Main content */}
            <main className="flex-1 space-y-6">
                {activeTab === "overview" && <OverviewSection />}

                {activeTab === "orders" && <OrdersSection />}

                {activeTab === "profile" && <ProfileSection userData={userData} />}

                {activeTab === "cards" && <CardsSection />}

                {activeTab === "addresses" && <AddressesSection />}

                {role === "shopOwner" && activeTab === "shops" && <ShopsSection />}

                {role === "deliveryAgent" &&
                    activeTab === "past-deliveries" && <PastDeliveriesSection />}

                {/* Example placeholder for future additions */}
                {tabs.every((t) => t.id !== "notifications") && (
                    <section className="rounded-lg border border-dashed border-gray-300 p-4 text-sm text-gray-500">
                        Add new tab sections here later by extending the tabs arrays.
                    </section>
                )}
            </main>
        </div>
    );
}

/* --- Sections (stub implementations you can wire to real data) --- */

function OverviewSection() {
    return (
        <section className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Overview
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-300">
                Quick summary of recent orders, saved cards, and addresses.
            </p>

            <div className="grid gap-4 md:grid-cols-3">
                <div
                    className="rounded-lg border border-gray-200 bg-white p-4 text-sm shadow-sm dark:border-gray-800 dark:bg-gray-900">
                    <p className="text-xs text-gray-500">Total Orders</p>
                    <p className="mt-2 text-2xl font-semibold text-gray-900 dark:text-gray-100">
                        24
                    </p>
                </div>
                <div
                    className="rounded-lg border border-gray-200 bg-white p-4 text-sm shadow-sm dark:border-gray-800 dark:bg-gray-900">
                    <p className="text-xs text-gray-500">Saved Cards</p>
                    <p className="mt-2 text-2xl font-semibold text-gray-900 dark:text-gray-100">
                        3
                    </p>
                </div>
                <div
                    className="rounded-lg border border-gray-200 bg-white p-4 text-sm shadow-sm dark:border-gray-800 dark:bg-gray-900">
                    <p className="text-xs text-gray-500">Addresses</p>
                    <p className="mt-2 text-2xl font-semibold text-gray-900 dark:text-gray-100">
                        2
                    </p>
                </div>
            </div>
        </section>
    );
}

function OrdersSection() {
    return (
        <section className="space-y-4">
            <div className="flex items-center justify-between gap-2">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    Orders
                </h2>
                <input
                    type="search"
                    placeholder="Search orders"
                    className="w-40 rounded-md border border-gray-200 bg-white px-2 py-1 text-xs focus:border-gray-900 focus:outline-none dark:border-gray-700 dark:bg-gray-900"
                />
            </div>

            <div
                className="overflow-hidden rounded-lg border border-gray-200 bg-white text-sm shadow-sm dark:border-gray-800 dark:bg-gray-900">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800">
                    <thead className="bg-gray-50 text-xs text-gray-500 dark:bg-gray-950">
                        <tr>
                            <th className="px-4 py-2 text-left">Order</th>
                            <th className="px-4 py-2 text-left">Date</th>
                            <th className="px-4 py-2 text-left">Total</th>
                            <th className="px-4 py-2 text-left">Status</th>
                            <th className="px-4 py-2" />
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                        {[1, 2, 3].map((id) => (
                            <tr key={id}>
                                <td className="px-4 py-3 text-xs font-medium text-gray-900 dark:text-gray-100">
                                    #ORD{id.toString().padStart(4, "0")}
                                </td>
                                <td className="px-4 py-3 text-xs text-gray-600 dark:text-gray-300">
                                    20 Dec 2025
                                </td>
                                <td className="px-4 py-3 text-xs text-gray-900 dark:text-gray-100">
                                    ₹1,299
                                </td>
                                <td className="px-4 py-3 text-xs">
                                    <span
                                        className="inline-flex rounded-full bg-green-100 px-2 py-0.5 text-[11px] font-medium text-green-700 dark:bg-green-900/40 dark:text-green-300">
                                        Delivered
                                    </span>
                                </td>
                                <td className="px-4 py-3 text-right text-xs">
                                    <button className="text-gray-500 hover:text-gray-900 dark:hover:text-gray-100">
                                        View
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </section>
    );
}

function ProfileSection({ userData }: { userData: User | undefined }) {
    console.log("USERDATA", userData)
    if (!userData?.email) {
        return null;
    }
    return (
        <section className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Profile
            </h2>
            <form
                className="space-y-6 rounded-lg border border-gray-200 bg-white p-4 text-sm shadow-sm dark:border-gray-800 dark:bg-gray-900">
                <div className="flex flex-col gap-4 md:flex-row md:items-center">
                    <div className="h-16 w-16 overflow-hidden rounded-full bg-gray-200">
                        <Image src={"http://localhost/api/files" + (userData.profileUrl ? userData.profileUrl : "/sampleImage.png")} alt="U" height={64} width={64} />
                    </div>
                    <div className="space-y-1 text-xs text-gray-500">
                        <p>Update your profile photo.</p>
                        <button
                            type="button"
                            className="inline-flex items-center text-xs font-medium text-gray-900 underline hover:text-gray-700 dark:text-gray-100"
                        >
                            Change photo
                        </button>
                    </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                    <div>
                        <label className="mb-1 block text-xs font-medium text-gray-700 dark:text-gray-300">
                            Username
                        </label>
                        <input
                            type="text"
                            className="w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm focus:border-gray-900 focus:outline-none dark:border-gray-700 dark:bg-gray-950"
                            placeholder="your_username"
                        />
                    </div>
                    <div>
                        <label className="mb-1 block text-xs font-medium text-gray-700 dark:text-gray-300">
                            Full name
                        </label>
                        <input
                            type="text"
                            className="w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm focus:border-gray-900 focus:outline-none dark:border-gray-700 dark:bg-gray-950"
                            placeholder="Your Name"
                        />
                    </div>
                </div>

                <div>
                    <label className="mb-1 block text-xs font-medium text-gray-700 dark:text-gray-300">
                        Bio
                    </label>
                    <textarea
                        rows={3}
                        className="w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm focus:border-gray-900 focus:outline-none dark:border-gray-700 dark:bg-gray-950"
                        placeholder="Tell something about yourself..."
                    />
                </div>

                <div className="flex justify-end gap-2">
                    <button
                        type="button"
                        className="rounded-md border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-900/40"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        className="rounded-md bg-gray-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-gray-800 dark:bg-gray-100 dark:text-gray-900 dark:hover:bg-gray-200"
                    >
                        Save changes
                    </button>
                </div>
            </form>
        </section>
    );
}

function CardsSection() {
    return (
        <section className="space-y-4">
            <div className="flex items-center justify-between gap-2">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    Cards
                </h2>
                <button
                    className="rounded-md bg-gray-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-gray-800 dark:bg-gray-100 dark:text-gray-900 dark:hover:bg-gray-200">
                    Add card
                </button>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
                {[1, 2].map((card) => (
                    <div
                        key={card}
                        className="flex justify-between rounded-xl bg-gradient-to-br from-gray-900 to-gray-700 p-4 text-xs text-white shadow-md dark:from-gray-100 dark:to-gray-400 dark:text-gray-900"
                    >
                        <div className="space-y-2">
                            <p className="text-[10px] uppercase tracking-wide text-gray-300 dark:text-gray-700">
                                Card holder
                            </p>
                            <p className="text-sm font-medium">User Name</p>
                            <p className="text-[10px] uppercase tracking-wide text-gray-300 dark:text-gray-700">
                                Number
                            </p>
                            <p className="font-mono">**** **** **** 1234</p>
                        </div>
                        <div className="flex flex-col items-end justify-between">
                            <p className="text-[10px] uppercase tracking-wide text-gray-300 dark:text-gray-700">
                                Exp
                            </p>
                            <p className="text-xs font-medium">12/27</p>
                            <button className="mt-4 text-[11px] underline">
                                Remove
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
}

function AddressesSection() {
    return (
        <section className="space-y-4">
            <div className="flex items-center justify-between gap-2">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    Addresses
                </h2>
                <button
                    className="rounded-md bg-gray-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-gray-800 dark:bg-gray-100 dark:text-gray-900 dark:hover:bg-gray-200">
                    Add address
                </button>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
                {[1, 2].map((addr) => (
                    <div
                        key={addr}
                        className="flex flex-col rounded-lg border border-gray-200 bg-white p-4 text-xs shadow-sm dark:border-gray-800 dark:bg-gray-900"
                    >
                        <div className="mb-2 flex items-center justify-between">
                            <p className="font-medium text-gray-900 dark:text-gray-100">
                                Home
                            </p>
                            <span
                                className="inline-flex rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-medium text-gray-600 dark:bg-gray-800 dark:text-gray-300">
                                Default
                            </span>
                        </div>
                        <p className="text-gray-600 dark:text-gray-300">
                            123 Street Name, Locality, City, State - 123456
                        </p>
                        <div className="mt-3 flex justify-end gap-2">
                            <button className="text-[11px] text-gray-500 hover:text-gray-800 dark:hover:text-gray-100">
                                Edit
                            </button>
                            <button className="text-[11px] text-red-500 hover:text-red-600">
                                Remove
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
}

function ShopsSection() {
    return (
        <section className="space-y-4">
            <div className="flex items-center justify-between gap-2">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    Shops
                </h2>
                <button
                    className="rounded-md bg-gray-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-gray-800 dark:bg-gray-100 dark:text-gray-900 dark:hover:bg-gray-200">
                    Add shop
                </button>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
                {[1, 2].map((shop) => (
                    <div
                        key={shop}
                        className="flex flex-col justify-between rounded-lg border border-gray-200 bg-white p-4 text-sm shadow-sm dark:border-gray-800 dark:bg-gray-900"
                    >
                        <div>
                            <p className="font-medium text-gray-900 dark:text-gray-100">
                                Shop #{shop}
                            </p>
                            <p className="mt-1 text-xs text-gray-600 dark:text-gray-300">
                                Brief shop description goes here.
                            </p>
                        </div>
                        <div className="mt-3 flex justify-between text-xs">
                            <button
                                className="text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-gray-100">
                                Manage
                            </button>
                            <button className="text-red-500 hover:text-red-600">
                                Disable
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
}

function PastDeliveriesSection() {
    return (
        <section className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Past deliveries
            </h2>

            <div
                className="overflow-hidden rounded-lg border border-gray-200 bg-white text-sm shadow-sm dark:border-gray-800 dark:bg-gray-900">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800">
                    <thead className="bg-gray-50 text-xs text-gray-500 dark:bg-gray-950">
                        <tr>
                            <th className="px-4 py-2 text-left">Delivery ID</th>
                            <th className="px-4 py-2 text-left">Order</th>
                            <th className="px-4 py-2 text-left">Date</th>
                            <th className="px-4 py-2 text-left">Earnings</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                        {[1, 2, 3].map((d) => (
                            <tr key={d}>
                                <td className="px-4 py-3 text-xs font-medium text-gray-900 dark:text-gray-100">
                                    DELV-{1000 + d}
                                </td>
                                <td className="px-4 py-3 text-xs text-gray-600 dark:text-gray-300">
                                    #ORD{d.toString().padStart(4, "0")}
                                </td>
                                <td className="px-4 py-3 text-xs text-gray-600 dark:text-gray-300">
                                    19 Dec 2025
                                </td>
                                <td className="px-4 py-3 text-xs text-gray-900 dark:text-gray-100">
                                    ₹250
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </section>
    );
}
