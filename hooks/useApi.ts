"use client";

import {useAuth} from "@/contexts/AuthContext"; // adjust import to your path

type ApiMethod = "public" | "private";

interface ApiOptions extends Omit<RequestInit, "method"> {
    auth?: ApiMethod;          // "private" or "public"
    method?: RequestInit["method"];
}

function rewriteUrl(url: string): string {
    if (!url.length) {
        throw new Error("URL cannot be empty");
    }

    // Rewrite internal API paths to backend
    if (url.startsWith("/api/")) {
        return url.replace("/api/", "http://localhost:8081/");
    }

    return url;
}

async function coreRequest(
    url: string,
    options: ApiOptions,
    accessToken: string | null,
    setAccessToken: (t: string | null) => void,
    logout: () => void
) {
    const rewritten = rewriteUrl(url);

    const headers: Record<string, string> = {
        "Content-Type": "application/json",
        ...(options.headers as any),
    };

    if (options.auth === "private") {
        if (!accessToken) {
            throw new Error("Missing access token for private API call");
        }

        headers["Authorization"] = "Bearer " + accessToken;
    }

    const response = await fetch(rewritten, {
        ...options,
        headers,
    });

    if (response.status !== 401) {
        return response;
    }

    // Attempt reading error
    const errorBody = await response.clone().json().catch(() => null);

    if (!errorBody || errorBody.error !== "token_expired") {
        return response;
    }

    // Try refresh token
    const refreshRes = await fetch("/api/refresh", {
        method: "POST",
        credentials: "include"
    });

    if (!refreshRes.ok) {
        logout();
        return response;
    }

    const refreshData = await refreshRes.json();
    const newAccessToken = refreshData.accessToken;

    if (!newAccessToken) {
        logout();
        return response;
    }

    // Update memory token
    setAccessToken(newAccessToken);

    // Retry original with new token
    const retryHeaders = {
        ...headers,
        Authorization: "Bearer " + newAccessToken,
    };

    return fetch(rewritten, {
        ...options,
        headers: retryHeaders,
    });
}


export default function useApi() {
    const {accessToken, setAccessToken, logout} = useAuth();

    const get = (url: string, options: ApiOptions = {}) =>
        coreRequest(url, {...options, method: "GET"}, accessToken, setAccessToken, logout);

    const post = (url: string, body: any, options: ApiOptions = {}) =>
        coreRequest(url, {
                ...options,
                method: "POST",
                body: JSON.stringify(body),
            },
            accessToken,
            setAccessToken,
            logout
        );

    return {get, post};
}
