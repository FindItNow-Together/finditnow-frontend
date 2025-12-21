'use client'

import { useAuth } from "@/contexts/AuthContext";
import useApi from "@/hooks/useApi";
import { User, UserAddress } from "@/types/user";
import { User2, Camera, CreditCard, MapPin, ShoppingBag, Truck, Image as ImageIcon, LayoutDashboard, Bell } from "lucide-react";
import React, { FormEvent, useEffect, useState } from "react";
import UploadPhotoModal from "./_components/UploadPhotoModal";
import Modal from "@/app/_components/Modal";

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
    const api = useApi();
    const [activeTab, setActiveTab] = useState<string>("overview");

    const tabs = React.useMemo(
        () => [...baseTabs, ...(roleTabs[role || "customer"] || [])],
        [role]
    );

    const fetchProfile = async () => {
        try {
            const res = await api.get("/api/user/me", { auth: "private" });
            const data = await res.json();
            setUserData(data.data as User);
        } catch (error) {
            console.error("Failed to fetch profile:", error);
        }
    };

    useEffect(() => {
        fetchProfile();
    }, []);

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
                            <p className="text-sm text-gray-500 dark:text-gray-400 capitalize">{role || "customer"}</p>
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
                                            ${isActive
                                                ? "bg-blue-50 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800"
                                                : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800/50 hover:text-gray-900 dark:hover:text-gray-100 border border-transparent"
                                            }
                                        `}
                                    >
                                        <Icon className={`h-5 w-5 flex-shrink-0 ${isActive ? 'text-blue-600 dark:text-blue-400' : 'text-gray-500 dark:text-gray-400'}`} />
                                        <span>{tab.label}</span>
                                    </button>
                                );
                            })}
                        </nav>

                        {/* Future sections */}
                        <div className="mt-10 pt-6 border-t border-gray-200 dark:border-gray-700">
                            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-4">Coming soon</p>
                            <div className="space-y-2">
                                <div className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer transition-colors duration-200 group">
                                    <div className="w-9 h-9 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center group-hover:bg-blue-50 dark:group-hover:bg-blue-900/20">
                                        <Bell className="h-4 w-4 text-gray-500 dark:text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400" />
                                    </div>
                                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Notifications</span>
                                </div>
                            </div>
                        </div>
                    </aside>

                    {/* Main Content */}
                    <main className="flex-1 space-y-6 lg:space-y-8">
                        {activeTab === "overview" && <OverviewSection />}
                        {activeTab === "orders" && <OrdersSection />}
                        {activeTab === "profile" && <ProfileSection userData={userData} setUserData={setUserData} />}
                        {activeTab === "cards" && <CardsSection />}
                        {activeTab === "addresses" && <AddressesSection />}
                        {role === "shopOwner" && activeTab === "shops" && <ShopsSection />}
                        {role === "deliveryAgent" && activeTab === "past-deliveries" && <PastDeliveriesSection />}
                    </main>
                </div>
            </div>
        </div>
    );
}

function OverviewSection() {
    return (
        <section className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-sm border border-gray-200 dark:border-gray-700">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">Overview</h2>
                <div className="grid gap-6 lg:grid-cols-3">
                    {[
                        { label: "Total Orders", value: "24", change: "+12%", color: "blue" },
                        { label: "Saved Cards", value: "3", icon: CreditCard },
                        { label: "Addresses", value: "2", change: "+1", color: "emerald" }
                    ].map(({ label, value, change, color }, i) => (
                        <div key={i} className="group border border-gray-200 dark:border-gray-700 rounded-xl p-6 hover:shadow-md transition-shadow duration-200">
                            <div className="flex items-start justify-between">
                                <div className="p-3 bg-gray-100 dark:bg-gray-700 rounded-xl">
                                    <ShoppingBag className="h-6 w-6 text-gray-600 dark:text-gray-400" />
                                </div>
                                <div className="text-right">
                                    <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">{value}</p>
                                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mt-1">{label}</p>
                                    {change && (
                                        <p className={`text-sm font-semibold mt-1 ${color === 'emerald' ? 'text-emerald-600 dark:text-emerald-400' : 'text-blue-600 dark:text-blue-400'}`}>
                                            {change}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}

function OrdersSection() {
    return (
        <section className="space-y-6">
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Orders</h2>
                    <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">Your order history</p>
                </div>
                <input
                    type="search"
                    placeholder="Search orders..."
                    className="w-full lg:w-72 px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                />
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-gray-50 dark:bg-gray-800/50">
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Order</th>
                                <th className="px-4 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Date</th>
                                <th className="px-4 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Total</th>
                                <th className="px-4 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                                <th className="px-4 py-4 text-right text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                            {[1, 2, 3].map((id) => (
                                <tr key={id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors duration-150">
                                    <td className="px-6 py-4 font-medium text-gray-900 dark:text-gray-100">
                                        #ORD{id.toString().padStart(4, "0")}
                                    </td>
                                    <td className="px-4 py-4 text-sm text-gray-600 dark:text-gray-400">20 Dec 2025</td>
                                    <td className="px-4 py-4 font-semibold text-gray-900 dark:text-gray-100">₹1,299</td>
                                    <td className="px-4 py-4">
                                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300">
                                            Delivered
                                        </span>
                                    </td>
                                    <td className="px-4 py-4 text-right">
                                        <button className="text-blue-600 hover:text-blue-700 font-medium text-sm transition-colors duration-200">
                                            View
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </section>
    );
}

function ProfileSection({ userData, setUserData }: {
    userData: User | undefined;
    setUserData: React.Dispatch<React.SetStateAction<User | undefined>>
}) {
    const [showUploadPhotoModal, setShowUploadPhotoModal] = useState(false);
    const api = useApi();

    if (!userData?.email) {
        return (
            <div className="text-center py-20 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700">
                <div className="mx-auto h-16 w-16 bg-gray-100 dark:bg-gray-700 rounded-2xl flex items-center justify-center mb-6">
                    <User2 className="h-8 w-8 text-gray-500 dark:text-gray-400" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">Loading profile...</h2>
                <p className="text-gray-600 dark:text-gray-400">Please wait while we load your information.</p>
            </div>
        );
    }

    const uploadProfilePhoto = async (file: File) => {
        if (!userData) return;
        const formData = new FormData();
        formData.append("domain", userData.role);
        formData.append("entityId", userData.id);
        formData.append("purpose", "profile");
        formData.append("file", file);

        const response = await api.post("/api/files/upload", formData);
        if (!response.ok) throw new Error("File upload failed");

        const data = await response.json();
        const res = await api.put(`/api/user/${userData.id}`, { ...userData, profileUrl: data.fileKey }, { auth: "private" });
        if (!res.ok) throw new Error("File sync failed with user");
        return data;
    };

    return (
        <section>
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 border border-gray-200 dark:border-gray-700 max-w-2xl">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-8">Profile Settings</h2>

                <div className="flex flex-col lg:flex-row gap-8 items-start lg:items-center mb-8">
                    <div className="flex flex-col items-center">
                        <div className="relative mb-3">
                            {userData.profileUrl ? (
                                <img
                                    src={process.env.NEXT_PUBLIC_IMAGE_GATEWAY_URL + userData.profileUrl}
                                    alt="Profile"
                                    className="h-28 w-28 lg:h-32 lg:w-32 rounded-2xl object-cover ring-2 ring-gray-200 dark:ring-gray-600"
                                />
                            ) : (
                                <div className="h-28 w-28 lg:h-32 lg:w-32 rounded-2xl bg-gray-200 dark:bg-gray-700 flex items-center justify-center ring-2 ring-gray-200 dark:ring-gray-600">
                                    <User2 className="h-14 w-14 lg:h-16 lg:w-16 text-gray-600 dark:text-gray-400" />
                                </div>
                            )}
                            <button
                                type="button"
                                onClick={() => setShowUploadPhotoModal(true)}
                                className="absolute -bottom-2 -right-2 h-10 w-10 bg-blue-600 hover:bg-blue-700 rounded-2xl flex items-center justify-center text-white shadow-lg transition-colors duration-200"
                            >
                                <Camera className="h-5 w-5" />
                            </button>
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 text-center">Click camera to update photo</p>
                    </div>

                    <div className="flex-1 space-y-6">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                    Full Name
                                </label>
                                <input
                                    type="text"
                                    defaultValue={userData.firstName}
                                    className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                    Email
                                </label>
                                <input
                                    type="email"
                                    defaultValue={userData.email}
                                    className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 cursor-not-allowed opacity-60"
                                    disabled
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                Bio
                            </label>
                            <textarea
                                rows={4}
                                className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 resize-vertical"
                                placeholder="Tell us about yourself..."
                            // defaultValue={userData.bio || ""}
                            />
                        </div>

                        <div className="flex gap-4 pt-2">
                            <button className="flex-1 px-6 py-3 border border-gray-300 rounded-xl text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200">
                                Cancel
                            </button>
                            <button className="flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl shadow-sm hover:shadow-md transition-all duration-200">
                                Save Changes
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {showUploadPhotoModal && (
                <UploadPhotoModal
                    onClose={() => setShowUploadPhotoModal(false)}
                    onUpload={async (file) => {
                        try {
                            const res = await uploadProfilePhoto(file);
                            setShowUploadPhotoModal(false);
                            if (res.fileKey && userData) {
                                setUserData({ ...userData, profileUrl: res.fileKey });
                            }
                        } catch (err) {
                            console.error(err);
                        }
                    }}
                />
            )}
        </section>
    );
}

// Minimalistic CardsSection, AddressesSection, etc. follow the same pattern...
function CardsSection() {
    return (
        <section className="space-y-6">
            <div className="flex items-center justify-between bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Payment Methods</h2>
                </div>
                <button className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-xl shadow-sm hover:shadow-md transition-all duration-200">
                    Add Card
                </button>
            </div>
            <div className="grid gap-6 md:grid-cols-2">
                {[1, 2].map((card) => (
                    <div key={card} className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <p className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Cardholder</p>
                                <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">User Name</p>
                            </div>
                            <div className="h-12 w-12 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-xl flex items-center justify-center">
                                <span className="text-xl font-bold">★</span>
                            </div>
                        </div>
                        <div className="space-y-2 mb-6">
                            <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">Card number</p>
                            <p className="font-mono text-lg font-semibold text-gray-900 dark:text-gray-100">**** **** **** 1234</p>
                        </div>
                        <div className="flex justify-between items-center">
                            <div>
                                <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">Expires</p>
                                <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">12/27</p>
                            </div>
                            <button className="px-4 py-2 text-red-600 hover:text-red-700 font-medium text-sm transition-colors duration-200">
                                Remove
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
}

type AddressForm = {
    line1: string;
    line2?: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
    isPrimary: boolean;
};

const emptyForm: AddressForm = {
    line1: "",
    line2: "",
    city: "",
    state: "",
    postalCode: "",
    country: "",
    isPrimary: false,
};

function AddressesSection() {
    const { userData } = useAuth();
    const api = useApi();

    const [addresses, setAddresses] = useState(userData?.addresses || []);
    const [showModal, setShowModal] = useState(false);

    const [form, setForm] = useState<AddressForm>(emptyForm);
    const [errors, setErrors] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!showModal) {
            setForm(emptyForm);
            setErrors([]);
        }
    }, [showModal]);

    const extractErrors = async (res: Response): Promise<string[]> => {
        try {
            const body = await res.json();

            if (Array.isArray(body?.errors)) return body.errors;
            if (typeof body?.errors === "object") return Object.values(body.errors);
            if (body?.message) return [body.message];

            return ["Something went wrong"];
        } catch {
            return ["Unexpected server error"];
        }
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setErrors([]);

        try {
            setLoading(true);

            const res = await api.post(
                "/api/user/addresses/add",
                form,
                { auth: "private" }
            );

            if (!res.ok) {
                const extracted = await extractErrors(res);
                setErrors(extracted);
                return;
            }

            const json = await res.json();
            setAddresses(prev => [...prev, json.data]);
            setShowModal(false);

        } catch {
            setErrors(["Network error. Please try again."]);
        } finally {
            setLoading(false);
        }
    };

    const inputClass =
        "w-full rounded-lg border border-gray-300 dark:border-gray-600 px-3 py-2 text-sm bg-white dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500";

    return (
        <section className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between bg-white dark:bg-gray-800 rounded-2xl p-6 border">
                <h2 className="text-2xl font-bold">Addresses</h2>
                <button
                    onClick={() => setShowModal(true)}
                    className="px-5 py-2 rounded-xl bg-purple-600 text-white hover:bg-purple-700 transition"
                >
                    Add Address
                </button>
            </div>

            {/* Address Cards */}
            <div className="grid gap-6 md:grid-cols-2">
                {addresses.map(addr => (
                    <div
                        key={addr.id}
                        className="rounded-2xl p-6 bg-white dark:bg-gray-800 border"
                    >
                        <p className="text-sm text-gray-700 dark:text-gray-300">
                            {addr.fullAddress}
                        </p>
                    </div>
                ))}
            </div>

            {/* Modal */}
            {showModal && (
                <Modal
                    header="Add new address"
                    onCloseAction={() => setShowModal(false)}
                >
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Common Error Box */}
                        {errors.length > 0 && (
                            <div className="rounded-lg bg-red-100 text-red-700 px-4 py-3 text-sm space-y-1">
                                {errors.map((err, i) => (
                                    <p key={i}>• {err}</p>
                                ))}
                            </div>
                        )}

                        <textarea
                            className={inputClass}
                            rows={2}
                            placeholder="Apartment / Building"
                            value={form.line1}
                            onChange={e => setForm({ ...form, line1: e.target.value })}
                        />

                        <textarea
                            className={inputClass}
                            rows={2}
                            placeholder="Landmark (optional)"
                            value={form.line2}
                            onChange={e => setForm({ ...form, line2: e.target.value })}
                        />

                        <input
                            className={inputClass}
                            placeholder="City"
                            value={form.city}
                            onChange={e => setForm({ ...form, city: e.target.value })}
                        />

                        <input
                            className={inputClass}
                            placeholder="State"
                            value={form.state}
                            onChange={e => setForm({ ...form, state: e.target.value })}
                        />

                        <input
                            className={inputClass}
                            placeholder="Pincode"
                            value={form.pincode}
                            onChange={e => setForm({ ...form, postalCode: e.target.value })}
                        />

                        <input
                            className={inputClass}
                            placeholder="Country"
                            value={form.country}
                            onChange={e => setForm({ ...form, country: e.target.value })}
                        />

                        <label className="flex items-center gap-2 text-sm">
                            <input
                                type="checkbox"
                                checked={form.isPrimary}
                                onChange={e =>
                                    setForm({ ...form, isPrimary: e.target.checked })
                                }
                            />
                            Set as default address
                        </label>

                        <button
                            disabled={loading}
                            className="w-full rounded-xl bg-purple-600 text-white py-2 font-medium hover:bg-purple-700 disabled:opacity-50"
                        >
                            {loading ? "Saving..." : "Add Address"}
                        </button>
                    </form>
                </Modal>
            )}
        </section>
    );
}

function ShopsSection() {
    return (
        <section className="space-y-6">
            <div className="flex items-center justify-between bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Your Shops</h2>
                </div>
                <button className="px-6 py-2 bg-orange-600 hover:bg-orange-700 text-white font-medium rounded-xl shadow-sm hover:shadow-md transition-all duration-200">
                    Add Shop
                </button>
            </div>
            <div className="grid gap-6 md:grid-cols-2">
                {[1, 2].map((shop) => (
                    <div key={shop} className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">Shop #{shop}</h3>
                        <p className="text-gray-700 dark:text-gray-300 mb-6">
                            Brief shop description goes here.
                        </p>
                        <div className="flex gap-3">
                            <button className="flex-1 px-4 py-2 text-emerald-600 hover:text-emerald-700 font-medium text-sm transition-colors duration-200">
                                Manage
                            </button>
                            <button className="flex-1 px-4 py-2 text-red-600 hover:text-red-700 font-medium text-sm transition-colors duration-200">
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
        <section>
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm">
                <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Past Deliveries</h2>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-gray-50 dark:bg-gray-800/50">
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Delivery ID</th>
                                <th className="px-4 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Order</th>
                                <th className="px-4 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Date</th>
                                <th className="px-4 py-4 text-right text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Earnings</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                            {[1, 2, 3].map((d) => (
                                <tr key={d} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors duration-150">
                                    <td className="px-6 py-4 font-medium text-gray-900 dark:text-gray-100">DELV-{1000 + d}</td>
                                    <td className="px-4 py-4 text-sm text-gray-600 dark:text-gray-400">#ORD{d.toString().padStart(4, "0")}</td>
                                    <td className="px-4 py-4 text-sm text-gray-600 dark:text-gray-400">19 Dec 2025</td>
                                    <td className="px-4 py-4 text-right font-semibold text-emerald-600 dark:text-emerald-400">₹250</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </section>
    );
}
