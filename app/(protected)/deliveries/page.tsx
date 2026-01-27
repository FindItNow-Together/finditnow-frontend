"use client";

import { useState } from "react";
import { format } from "date-fns";
import { Calendar, DollarSign, MapPin, Package, Truck, ChevronRight } from "lucide-react";

// Mock data type to simulate OrderResponse structure for deliveries
type Delivery = {
    id: string;
    orderId: string;
    pickupLocation: string;
    dropLocation: string;
    status: "ASSIGNED" | "PICKED_UP" | "DELIVERED" | "CANCELLED";
    earnings: number;
    date: string;
    customerName: string;
};

// Mock data
const MOCK_DELIVERIES: Delivery[] = [
    {
        id: "DEL-001",
        orderId: "ORD-1234",
        pickupLocation: "Fresh Mart, Indiranagar, Bangalore",
        dropLocation: "Flat 402, Sai Residency, Koramangala",
        status: "DELIVERED",
        earnings: 150,
        date: "2024-01-25T14:30:00",
        customerName: "Arjun Kumar",
    },
    {
        id: "DEL-002",
        orderId: "ORD-5678",
        pickupLocation: "Tech Store, MG Road, Pune",
        dropLocation: "Plot 45, Shivaji Nagar, Pune",
        status: "ASSIGNED",
        earnings: 200,
        date: "2024-01-27T10:15:00",
        customerName: "Priya Sharma",
    },
    {
        id: "DEL-003",
        orderId: "ORD-9012",
        pickupLocation: "Burger King, Connaught Place, New Delhi",
        dropLocation: "Sector 15, Gurgaon, Haryana",
        status: "PICKED_UP",
        earnings: 85,
        date: "2024-01-27T12:00:00",
        customerName: "Rahul Singh",
    },
];

const statusColors = {
    ASSIGNED: "bg-blue-100 text-blue-800",
    PICKED_UP: "bg-yellow-100 text-yellow-800",
    DELIVERED: "bg-green-100 text-green-800",
    CANCELLED: "bg-red-100 text-red-800",
};

export default function DeliveriesPage() {
    const [activeTab, setActiveTab] = useState<"ACTIVE" | "PAST">("ACTIVE");

    const activeDeliveries = MOCK_DELIVERIES.filter(
        (d) => d.status === "ASSIGNED" || d.status === "PICKED_UP"
    );
    const pastDeliveries = MOCK_DELIVERIES.filter(
        (d) => d.status === "DELIVERED" || d.status === "CANCELLED"
    );

    const displayedDeliveries = activeTab === "ACTIVE" ? activeDeliveries : pastDeliveries;

    return (
        <div className="min-h-screen bg-gray-50 pb-20 md:pb-8">
            <div className="max-w-4xl mx-auto px-4 py-8">
                <header className="mb-8">
                    <h1 className="text-2xl font-bold text-gray-900">My Deliveries</h1>
                    <p className="text-gray-500">Manage your active and past deliveries</p>
                </header>

                {/* Tabs */}
                <div className="flex space-x-1 bg-white p-1 rounded-xl shadow-sm border border-gray-200 mb-6 w-fit">
                    <button
                        onClick={() => setActiveTab("ACTIVE")}
                        className={`px-6 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === "ACTIVE"
                            ? "bg-blue-600 text-white shadow-sm"
                            : "text-gray-600 hover:bg-gray-50"
                            }`}
                    >
                        Active
                        <span className="ml-2 bg-white/20 px-1.5 py-0.5 rounded-full text-xs">
                            {activeDeliveries.length}
                        </span>
                    </button>
                    <button
                        onClick={() => setActiveTab("PAST")}
                        className={`px-6 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === "PAST"
                            ? "bg-blue-600 text-white shadow-sm"
                            : "text-gray-600 hover:bg-gray-50"
                            }`}
                    >
                        Past
                    </button>
                </div>

                {/* Content */}
                <div className="space-y-4">
                    {displayedDeliveries.length === 0 ? (
                        <div className="text-center py-12 bg-white rounded-2xl border border-gray-200">
                            <Truck className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-gray-900">No deliveries found</h3>
                            <p className="text-gray-500">
                                {activeTab === "ACTIVE"
                                    ? "You have no active deliveries right now."
                                    : "You haven't completed any deliveries yet."}
                            </p>
                        </div>
                    ) : (
                        <div className="grid gap-4">
                            {displayedDeliveries.map((delivery) => (
                                <div
                                    key={delivery.id}
                                    className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow cursor-pointer group"
                                >
                                    <div className="p-5">
                                        {/* Header: ID, Date, Status */}
                                        <div className="flex justify-between items-start mb-4">
                                            <div>
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className="text-sm font-semibold text-gray-900">
                                                        {delivery.orderId}
                                                    </span>
                                                    <span
                                                        className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[delivery.status]
                                                            }`}
                                                    >
                                                        {delivery.status.replace("_", " ")}
                                                    </span>
                                                </div>
                                                <div className="flex items-center text-xs text-gray-500">
                                                    <Calendar className="h-3 w-3 mr-1" />
                                                    {format(new Date(delivery.date), "dd MMM yyyy, hh:mm a")}
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-lg font-bold text-gray-900">
                                                    ₹{delivery.earnings}
                                                </div>
                                                <div className="text-xs text-gray-500">Earnings</div>
                                            </div>
                                        </div>

                                        <div className="border-t border-gray-100 my-4"></div>

                                        {/* Locations */}
                                        <div className="space-y-4 relative">
                                            {/* Connecting Line */}
                                            <div className="absolute left-1.5 top-2 bottom-8 w-0.5 bg-gray-200 -z-10"></div>

                                            {/* Pickup */}
                                            <div className="flex gap-3">
                                                <div className="mt-0.5">
                                                    <div className="w-3.5 h-3.5 rounded-full bg-blue-100 border-2 border-blue-600"></div>
                                                </div>
                                                <div>
                                                    <p className="text-xs uppercase tracking-wider text-gray-500 font-semibold mb-0.5">
                                                        Pickup
                                                    </p>
                                                    <p className="text-sm font-medium text-gray-900">
                                                        {delivery.pickupLocation}
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Drop */}
                                            <div className="flex gap-3">
                                                <div className="mt-0.5">
                                                    <div className="w-3.5 h-3.5 rounded-full bg-green-100 border-2 border-green-600"></div>
                                                </div>
                                                <div>
                                                    <p className="text-xs uppercase tracking-wider text-gray-500 font-semibold mb-0.5">
                                                        Drop off
                                                    </p>
                                                    <p className="text-sm font-medium text-gray-900">
                                                        {delivery.dropLocation}
                                                    </p>
                                                    <p className="text-xs text-gray-500 mt-0.5">
                                                        Customer: {delivery.customerName}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Actions Footer */}
                                    <div className="bg-gray-50 px-5 py-3 border-t border-gray-100 flex justify-between items-center group-hover:bg-blue-50/50 transition-colors">
                                        <span className="text-sm font-medium text-blue-600">View Details</span>
                                        <ChevronRight className="h-4 w-4 text-gray-400 group-hover:text-blue-600" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
