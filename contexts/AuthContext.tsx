"use client";

import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { ROLE_ROUTE_MAP } from "./authRules";
import { User } from "@/types/user";
import { AuthInfo } from "@/app/layout";
import { publicBaseUrl } from "@/hooks/useApi";

export type AuthContextType = {
  accessToken: string | null;
  setAccessToken: React.Dispatch<React.SetStateAction<string | null>>;
  isAuthenticated: boolean;
  accessRole: string | null;
  setAccessRole: React.Dispatch<React.SetStateAction<string | null>>;
  userData?: User;
  setUserData: React.Dispatch<React.SetStateAction<User | undefined>>;
  logout: (cb?: () => void) => void;
  setAuth: (accessToken: string, role: string) => Promise<void>;
};

export const AuthContext = createContext<AuthContextType>({
  accessToken: null,
  accessRole: null,
  isAuthenticated: false,
  setAccessToken: () => {},
  setAccessRole: () => {},
  setUserData: () => {},
  logout: () => {},
  setAuth: async () => {},
});

export function AuthProvider({
  auth,
  children,
}: {
  auth: AuthInfo | null;
  children: React.ReactNode;
}) {
  const [accessToken, setAccessToken] = useState<string | null>(auth?.accessToken ?? null);
  const [accessRole, setAccessRole] = useState<string | null>(auth?.accessRole ?? null);
  const [userData, setUserData] = useState<User | undefined>(auth?.user);

  const router = useRouter();
  const pathname = usePathname();

  const isAuthenticated = useMemo(() => {
    return (
      accessToken != null &&
      accessToken.length > 0 &&
      accessRole != null &&
      ["ADMIN", "CUSTOMER", "SHOP", "DELIVERY", "UNASSIGNED"].includes(accessRole)
    );
  }, [accessToken, accessRole]);

  const logout = (cb?: () => void) => {
    fetch(publicBaseUrl + "/api/auth/logout", {
      method: "POST",
      headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {},
      credentials: "include",
    }).finally(() => {
      setAccessToken(null);
      setAccessRole(null);
      if (cb) cb();
    });
  };

  const setAuthenticationDetails = async (token: string, role: string) => {
    const userRes = await fetch(publicBaseUrl + "/api/user/me", {
      method: "GET",
      headers: {
        Authorization: "Bearer " + token,
      },
    });

    const userResJson = await userRes.json();

    if (userResJson.error) {
      throw new Error("Error in fetching the user::", userResJson.error);
    }

    setAccessToken(token);
    setAccessRole(role);
    setUserData(userResJson.data as User);
    let route;

    switch (role) {
      case "CUSTOMER":
        route = "/Discover";
        break;
      case "ADMIN":
        route = "/admin/dashboard";
        break;
      case "SHOP":
        route = "/dashboard";
        break;
      case "DELIVERY_AGENT":
        route = "/delivery";
        break;
      case "UNASSIGNED":
        route = "/Discover";
        break;
      default:
        route = "/Discover";
    }
    router.replace(route);
  };

  useEffect(() => {
    // Public landing page
    if (pathname === "/") return;

    const authRoutes = ["/login", "/sign_up", "/register"];

    // Logged-in users should not stay on auth pages
    if (isAuthenticated && authRoutes.includes(pathname)) {
      const targetRoute = Object.entries(ROLE_ROUTE_MAP).find(([_, roles]) =>
        roles.includes(accessRole!)
      )?.[0];

      router.replace(targetRoute || "/");
      return;
    }

    if (!isAuthenticated) return;

    const rule = Object.entries(ROLE_ROUTE_MAP).find(([prefix]) => pathname.startsWith(prefix));

    if (!rule) return;

    const [, allowedRoles] = rule;

    if (!allowedRoles.includes(accessRole!)) {
      router.replace("/forbidden");
    }
  }, [pathname, isAuthenticated, accessRole]);

  return (
    <AuthContext.Provider
      value={{
        accessToken,
        setAccessToken,
        accessRole,
        setAccessRole,
        userData,
        setUserData,
        isAuthenticated,
        logout,
        setAuth: setAuthenticationDetails,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
