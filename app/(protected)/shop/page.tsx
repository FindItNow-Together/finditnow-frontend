"use client";

import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

export default function NoShopsPage() {
  const { logout } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    logout(() => router.replace("/login"));
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header Navbar */}
      <header className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          {/* Logo Section */}
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => router.push("/")}>
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl">S</span>
            </div>
            <span className="text-xl font-bold text-gray-900 tracking-tight">ShopManager</span>
          </div>

          {/* Action Section */}
          <button
            onClick={handleLogout}
            className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-red-600 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
          >
            Logout
          </button>
        </div>
      </header>

      {/* Main Content (Empty State) */}
      <main className="flex-grow flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center">
          {/* Decorative Icon/Graphic */}
          <div className="mb-6 inline-flex items-center justify-center w-24 h-24 bg-blue-100 rounded-full">
            <span className="text-4xl">🏪</span>
          </div>

          <h1 className="text-2xl font-bold text-gray-900 mb-2">No shops found</h1>
          <p className="text-gray-600 mb-8">
            Your system currently has no registered shops. Get started by creating your first
            storefront to manage products and inventory.
          </p>

          <button
            onClick={() => router.push("/register-shop")}
            className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all shadow-sm hover:shadow-md"
          >
            <span className="mr-2 text-xl">+</span>
            Add Your First Shop
          </button>
        </div>
      </main>

      {/* Footer (Optional) */}
      <footer className="py-6 text-center text-sm text-gray-400">
        &copy; {new Date().getFullYear()} ShopManager Admin Portal
      </footer>
    </div>
  );
}
