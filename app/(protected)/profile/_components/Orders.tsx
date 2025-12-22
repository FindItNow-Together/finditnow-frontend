export default function OrdersSection() {
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