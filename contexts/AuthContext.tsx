"use client";

import React, { createContext, useContext, useEffect, useMemo, useState, } from "react";
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
    fetchAndSetUser: (accessToken?: string) => Promise<void>
};

export const AuthContext = createContext<AuthContextType>({
    accessToken: null,
    accessRole: null,
    isAuthenticated: false,
    setAccessToken: () => {
    },
    setAccessRole: () => {
    },
    setUserData: () => {
    },
    logout: () => {
    },
    fetchAndSetUser: async () => { }
});

export function AuthProvider({ auth, children }: { auth: AuthInfo | null,  children: React.ReactNode }) {
    const [accessToken, setAccessToken] = useState<string | null>(auth?.accessToken ?? null);
    const [accessRole, setAccessRole] = useState<string | null>(auth?.accessRole ?? null);
    const [userData, setUserData] = useState<User | undefined>(auth?.user);

    const [authChecked, setAuthChecked] = useState(false);

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
        fetch(publicBaseUrl + "/api/auth/logout",
            {
                method: "POST", headers: accessToken
                    ? { Authorization: `Bearer ${accessToken}` }
                    : {}, credentials: "include"
            })
            .finally(() => {
                setAccessToken(null);
                setAccessRole(null);
                if (cb) cb();
            });
    };

    const fetchAndSetUser = async (token?: string) => {
        if (!token && !accessToken) {
            throw new Error("No token to fetch user")
        }

        const userRes = await fetch(publicBaseUrl + "/api/user/me", {
            method: "GET",
            headers: {
                "Authorization": "Bearer " + (token ? token : accessToken)
            }
        })

        const userResJson = await userRes.json();

        if (userResJson.error) {
            throw new Error("Error in fetching the user::", userResJson.error)
        }

        setUserData(userResJson.data as User)
    }

    useEffect(() => {
        let cancelled = false;

        const bootstrapAuth = async () => {
            try {
                const res = await fetch(publicBaseUrl + "/api/auth/refresh", {
                    method: "POST",
                    credentials: "include",
                });
                if (!res.ok) throw new Error("Not authenticated");

                const data = await res.json();
                if (cancelled) return;

                setAccessToken(data.accessToken);
                setAccessRole(data.profile);

                await fetchAndSetUser(data.accessToken)
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
                <div className="h-4 w-4 rounded-full bg-gray-900 animate-pulse" />
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
                userData,
                setUserData,
                isAuthenticated,
                logout,
                fetchAndSetUser,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext);
}
