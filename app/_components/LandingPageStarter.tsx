"use client";

import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";

export default function LandingPageStarter() {
  const { isAuthenticated } = useAuth();

  if (isAuthenticated) {
    return null;
  }

  return (
    <div className="flex gap-4">
      <Link
        href="/login"
        className="bg-blue-500 hover:bg-blue-600 text-white font-bold px-8 py-3 rounded-lg shadow-lg hover:shadow-xl transition-all"
      >
        Get Started
      </Link>
      <Link
        href="/sign_up"
        className="bg-white hover:bg-gray-50 text-gray-800 font-bold px-8 py-3 rounded-lg shadow-lg hover:shadow-xl border-2 border-gray-200 transition-all"
      >
        Sign Up
      </Link>
    </div>
  );
}
