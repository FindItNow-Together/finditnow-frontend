"use client";

import React, {createContext, useContext, useEffect, useMemo, useState} from "react";
import useApi from "@/hooks/useApi";
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
    const [accessToken, setAccessToken] = useState<string | null>("");
    const [accessRole, setAccessRole] = useState<string | null>("");
    const [authChecked, setAuthChecked] = useState(false);

    const isAuthenticated = useMemo(() => {
        return accessToken != null && accessToken.length != 0 && accessRole != null && ["ADMIN", "CUSTOMER", "SHOP", "DELIVERY"].includes(accessRole);
    }, [accessRole, accessToken])
    const api = useApi();

    const router = useRouter();
    const pathname = usePathname();

    const logout = (cb?: () => void) => {
        api.post("/auth/logout", {}, {headers: {"Authorization": "Bearer " + accessToken}}).then(res => {
            if (!res.ok) {
                throw new Error(`HTTP error: ${res.status}`);
            }
            return res.json();
        }).then(() => {
            setAccessToken("");
            setAccessRole("");
            if (cb) {
                cb();
            }
        }).catch(() => {
            fetch("/api/clear-cookie", {method: "POST"}).then(() => {
                if (cb) {
                    cb()
                }
            })
        })
    }

    useEffect(() => {
        let cancelled = false;

        const bootstrapAuth = async () => {
            try {
                const res = await api.post("/auth/refresh");

                if (!res.ok) throw new Error("Not authenticated");

                const data = await res.json();

                if (cancelled) return;

                setAccessToken(data.accessToken);
                setAccessRole(data.role);
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
        if (!authChecked || !accessRole) return;

        const rule = Object.entries(ROLE_ROUTE_MAP)
            .find(([prefix]) => pathname.startsWith(prefix));

        if (!rule) return;

        const [, allowedRoles] = rule;

        if (!allowedRoles.includes(accessRole)) {
            router.replace("/forbidden");
        }
    }, [authChecked, pathname, accessRole]);

    if (!authChecked) {
        return <div className="fixed inset-0 flex items-center justify-center bg-white">
            <div className="h-4 w-4 rounded-full bg-gray-900 animate-pulse"/>
        </div>;
    }

    return (
        <AuthContext.Provider value={{accessToken, setAccessToken, accessRole, setAccessRole, logout, isAuthenticated}}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext);
}
