export default function CardsSection() {
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
