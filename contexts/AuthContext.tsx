"use client";

import React, {createContext, useContext, useState} from "react";
import useApi from "@/hooks/useApi";

export type AuthContextType = {
    accessToken: string | null;
    setAccessToken: React.Dispatch<React.SetStateAction<string | null>>;
    logout: (cb?: () => void) => void;
};

export const AuthContext = createContext<AuthContextType>({
    accessToken: null,
    setAccessToken: () => {
    },
    logout: () => {
    },
});

export function AuthProvider({children}: { children: React.ReactNode }) {
    const [accessToken, setAccessToken] = useState<string | null>("");
    const api = useApi();

    const logout = (cb?: () => void) => {
        api.post("/api/logout", {}, {headers: {"Authorization": "Bearer " + accessToken}}).then(res => {
            if (!res.ok) {
                throw new Error(`HTTP error: ${res.status}`);
            }
            return res.json();
        }).then(() => {
            setAccessToken("");
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

    return (
        <AuthContext.Provider value={{accessToken, setAccessToken, logout}}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext);
}
