'use client'
import { CreditCard, ShoppingBag } from "lucide-react";

export default function OverviewSection() {
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