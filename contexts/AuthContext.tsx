"use client";

import React, {createContext, useContext, useEffect, useMemo, useState,} from "react";
import {usePathname, useRouter} from "next/navigation";
import {ROLE_ROUTE_MAP} from "./authRules";

export type AuthContextType = {
    accessToken: string | null;
    setAccessToken: React.Dispatch<React.SetStateAction<string | null>>;
    isAuthenticated: boolean;
    accessRole: string | null;
    setAccessRole: React.Dispatch<React.SetStateAction<string | null>>;
    logout: (cb?: () => void) => void;
};

export const AuthContext = createContext<AuthContextType>({
    accessToken: null,
    accessRole: null,
    isAuthenticated: false,
    setAccessToken: () => {
    },
    setAccessRole: () => {
    },
    logout: () => {
    },
});

export function AuthProvider({children}: { children: React.ReactNode }) {
    const [accessToken, setAccessToken] = useState<string | null>(null);
    const [accessRole, setAccessRole] = useState<string | null>(null);
    const [authChecked, setAuthChecked] = useState(false);
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost";

    const router = useRouter();
    const pathname = usePathname();

    const isAuthenticated = useMemo(() => {
        return (
            accessToken != null &&
            accessToken.length > 0 &&
            accessRole != null &&
            ["ADMIN", "CUSTOMER", "SHOP", "DELIVERY"].includes(accessRole)
        );
    }, [accessToken, accessRole]);

    const logout = (cb?: () => void) => {
        fetch(baseUrl + "/api/auth/logout",
            {
                method: "POST", headers: accessToken
                    ? {Authorization: `Bearer ${accessToken}`}
                    : {}, credentials: "include"
            })
            .finally(() => {
                setAccessToken(null);
                setAccessRole(null);
                if (cb) cb();
            });
    };

    useEffect(() => {
        let cancelled = false;

        const bootstrapAuth = async () => {
            try {
                const res = await fetch(baseUrl + "/api/auth/refresh", {
                    method: "POST",
                    credentials: "include",
                });
                if (!res.ok) throw new Error("Not authenticated");

                const data = await res.json();
                if (cancelled) return;

                setAccessToken(data.accessToken);
                setAccessRole(data.profile);
            } catch {
                if (cancelled) return;
                setAccessToken(null);
                setAccessRole(null);
            } finally {
                if (!cancelled) setAuthChecked(true);
            }
        };

        bootstrapAuth();
        return () => {
            cancelled = true;
        };
    }, []);

    useEffect(() => {
        if (!authChecked) return;

        // Public landing page
        if (pathname === "/") return;

        const authRoutes = ["/login", "/sign_up", "/register"];

        // Logged-in users should not stay on auth pages
        if (isAuthenticated && authRoutes.includes(pathname)) {
            const targetRoute = Object.entries(ROLE_ROUTE_MAP).find(
                ([_, roles]) => roles.includes(accessRole!)
            )?.[0];

            router.replace(targetRoute || "/");
            return;
        }

        if (!isAuthenticated) return;

        const rule = Object.entries(ROLE_ROUTE_MAP).find(([prefix]) =>
            pathname.startsWith(prefix)
        );

        if (!rule) return;

        const [, allowedRoles] = rule;

        if (!allowedRoles.includes(accessRole!)) {
            router.replace("/forbidden");
        }
    }, [authChecked, pathname, isAuthenticated, accessRole]);

    if (!authChecked) {
        return (
            <div className="fixed inset-0 flex items-center justify-center bg-white">
                <div className="h-4 w-4 rounded-full bg-gray-900 animate-pulse"/>
            </div>
        );
    }

    return (
        <AuthContext.Provider
            value={{
                accessToken,
                setAccessToken,
                accessRole,
                setAccessRole,
                isAuthenticated,
                logout,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext);
}
