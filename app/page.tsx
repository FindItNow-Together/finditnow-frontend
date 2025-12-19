// app/page.tsx
import {MapPin, Search, ShoppingBag, Store} from "lucide-react";
import Link from "next/link";

export default function Home() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
            {/* Hero Section */}
            <div className="flex flex-col items-center justify-center px-6 py-20 text-center">
                <h1 className="text-6xl font-black text-gray-800 mb-4">
                    <span className="text-blue-500">Findit</span>
                    <span className="text-green-500">Now</span>
                </h1>
                <p className="text-2xl text-gray-600 mb-8 max-w-2xl">
                    Discover products from local shops near you
                </p>
                <p className="text-lg text-gray-500 mb-12 max-w-xl">
                    Browse products, manage your cart, and place orders efficiently from nearby stores
                </p>

                <div className="flex gap-4">
                    <Link href="/login"
                          className="bg-blue-500 hover:bg-blue-600 text-white font-bold px-8 py-3 rounded-lg shadow-lg hover:shadow-xl transition-all">
                        Get Started
                    </Link>
                    <Link href="/sign_up"
                          className="bg-white hover:bg-gray-50 text-gray-800 font-bold px-8 py-3 rounded-lg shadow-lg hover:shadow-xl border-2 border-gray-200 transition-all">
                        Sign Up
                    </Link>
                </div>
            </div>

            {/* Features Section */}
            <div className="py-16 px-6">
                <h2 className="text-4xl font-bold text-center text-gray-800 mb-12">
                    Why Choose FinditNow?
                </h2>

                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
                    <FeatureCard
                        icon={<MapPin className="w-12 h-12 text-blue-500"/>}
                        title="Local Discovery"
                        description="Find products from nearby local shops in your area"
                    />
                    <FeatureCard
                        icon={<Search className="w-12 h-12 text-green-500"/>}
                        title="Easy Search"
                        description="Browse and search through extensive product catalogs"
                    />
                    <FeatureCard
                        icon={<ShoppingBag className="w-12 h-12 text-purple-500"/>}
                        title="Cart Management"
                        description="Add items to cart and checkout seamlessly"
                    />
                    <FeatureCard
                        icon={<Store className="w-12 h-12 text-orange-500"/>}
                        title="Shop Owners"
                        description="Manage inventory and process orders efficiently"
                    />
                </div>
            </div>

            {/* CTA Section */}
            <div className="py-16 px-6 bg-gradient-to-r from-blue-500 to-green-500">
                <div className="max-w-4xl mx-auto text-center text-white">
                    <h2 className="text-4xl font-bold mb-4">
                        Ready to explore local products?
                    </h2>
                    <p className="text-xl mb-8 opacity-90">
                        Join FinditNow today and support your local community
                    </p>
                    <Link href="/login"
                          className="bg-white text-blue-600 font-bold px-10 py-4 rounded-lg shadow-lg hover:shadow-xl hover:scale-105 transition-all inline-block">
                        Start Shopping
                    </Link>
                </div>
            </div>

            {/* Footer */}
            <footer className="py-8 text-center text-gray-600 bg-gray-100">
                <p>© 2025 FinditNow. Connecting customers with local shops.</p>
            </footer>
        </div>
    );
}

function FeatureCard({icon, title, description}: {
    icon: React.ReactNode;
    title: string;
    description: string;
}) {
    return (
        <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow text-center">
            <div className="flex justify-center mb-4">
                {icon}
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">{title}</h3>
            <p className="text-gray-600">{description}</p>
        </div>
    );
}
