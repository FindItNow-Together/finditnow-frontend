"use client";

import { useEffect, useState } from "react";
import { ShoppingCart } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/contexts/CartContext";
import Link from "next/link";

const accessRoleTabMapping: Record<string, string[]> = {
  CUSTOMER: ["Discover", "Orders"],
  SHOP: ["Discover", "Orders", "Dashboard"],
  DELIVERY_AGENT: ["Discover", "Orders", "Deliveries", "Dashboard"],
  UNASSIGNED: ["Discover", "Orders"],
  ADMIN: ["Dashboard"],
};

const tabRouteMapping: Record<string, string> = {
  Discover: "/discover",
  Orders: "/orders",
  Dashboard: "/dashboard",
  Deliveries: "/deliveries",
};

const authRoutes = [
  "/login",
  "/sign_up",
  "/register",
  "/verify_otp",
  "/forbidden",
  "/forgot_password",
];

export default function Navbar() {
  
  const [mounted, setMounted] = useState(false);

  const router = useRouter();
  const pathname = usePathname();
  const { logout, isAuthenticated, userData, accessRole } = useAuth();
  const { itemCount } = useCart();

  
  useEffect(() => {
    setMounted(true);
  }, []);

  
  if (!mounted) {
    return null;
  }

  if (authRoutes.some((route) => pathname.startsWith(route))) {
    return null;
  }

  const role = accessRole ?? "UNASSIGNED";
  const allowedTabs = accessRoleTabMapping[role] ?? [];

  const profileText =
    isAuthenticated && userData?.firstName ? userData.firstName[0].toUpperCase() : "?";

  const handleAuthAction = () => {
    if (isAuthenticated) {
      logout(() => router.replace("/"));
    } else {
      router.push("/login");
    }
  };

  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* LEFT */}
          <div className="flex items-center gap-8">
            <Link href="/" className="text-2xl font-extrabold tracking-tight select-none">
              <span className="text-blue-600">Findit</span>
              <span className="text-green-600">Now</span>
            </Link>

            <div className="hidden md:flex items-center gap-1 bg-gray-100 rounded-full p-1">
              {allowedTabs.map((tab) => {
                const href = tabRouteMapping[tab];
                const isActive = pathname.startsWith(href);

                return (
                  <Link
                    key={tab}
                    href={href}
                    className={[
                      "px-4 py-1.5 text-sm font-medium rounded-full transition-all",
                      isActive
                        ? "bg-white text-gray-900 shadow-sm"
                        : "text-gray-600 hover:text-gray-900 hover:bg-white",
                    ].join(" ")}
                  >
                    {tab}
                  </Link>
                );
              })}
            </div>
          </div>

          {/* RIGHT */}
          <div className="flex items-center gap-4">
            {isAuthenticated && (
              <button
                onClick={() => router.push("/cart")}
                className="relative p-2 rounded-full hover:bg-gray-100 transition"
              >
                <ShoppingCart className="h-5 w-5 text-gray-700" />
                {itemCount > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px]
                                   rounded-full bg-blue-600 text-white text-xs
                                   flex items-center justify-center px-1">
                    {itemCount}
                  </span>
                )}
              </button>
            )}

            <div className="relative group">
              <button className="flex items-center justify-center w-9 h-9 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 text-white font-semibold shadow-sm">
                {isAuthenticated && userData?.profileUrl ? (
                  <img
                    src={process.env.NEXT_PUBLIC_IMAGE_GATEWAY_URL + userData.profileUrl}
                    alt="Profile"
                    className="h-full w-full rounded-full object-cover"
                  />
                ) : (
                  profileText
                )}
              </button>

              <div className="absolute right-0 mt-2 w-40 bg-white border border-gray-200 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                <div className="py-1 text-sm">
                  {isAuthenticated && (
                    <>
                      <button
                        onClick={() => router.push("/profile")}
                        className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                      >
                        Profile
                      </button>
                      <hr className="my-1" />
                    </>
                  )}
                  <button
                    onClick={handleAuthAction}
                    className="block w-full text-left px-4 py-2 text-red-600 hover:bg-red-50"
                  >
                    {isAuthenticated ? "Logout" : "Login"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
