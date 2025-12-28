"use client";

import { useAuth } from "@/contexts/AuthContext";
import { URL } from "node:url";

type ApiAccess = "public" | "private";

interface ApiOptions extends Omit<RequestInit, "body"> {
  auth?: ApiAccess;
  body?: any;
}

function rewriteUrl(url: string): string {
  if (!url.length) throw new Error("URL cannot be empty");

  url = publicBaseUrl + url;

  return url;
}

export function getBaseUrl(envUrl?: string): string {
  const baseUrl = envUrl ?? "http://localhost";

  try {
    if (globalThis.URL?.canParse?.(baseUrl)) {
      return baseUrl;
    }
    throw new Error("Base url incorrect");
  } catch (err) {
    console.error("Invalid BASE_URL provided, falling back to localhost:", err);
    return "http://localhost";
  }
}

export const publicBaseUrl = getBaseUrl(process.env.NEXT_PUBLIC_APP_URL);

async function coreRequest(
  url: string,
  options: ApiOptions & { method: string },
  accessToken: string | null,
  setAccessToken: (t: string | null) => void,
  setAccessRole: (t: string | null) => void,
  logout: () => void
): Promise<Response> {
  const rewritten = rewriteUrl(url);

  const isFormData = options.body instanceof FormData;

  const headers: Record<string, string> = {
    ...(isFormData ? {} : { "Content-Type": "application/json" }),
    ...(options.headers as any),
  };

  if (options.auth === "private") {
    if (!accessToken) throw new Error("Unauthorized: No access token found.");
    headers["Authorization"] = `Bearer ${accessToken}`;
  }

  const response = await fetch(rewritten, {
    ...options,
    headers,
    body: options.body ? (isFormData ? options.body : JSON.stringify(options.body)) : undefined,
    credentials: "include",
  });

  // 401 Handling & Token Refresh
  if (response.status === 401) {
    const errorBody = await response
      .clone()
      .json()
      .catch(() => null);

    if (options.auth === "public") {
      return response;
    }

    if (
      rewritten.endsWith("logout") ||
      // rewritten.endsWith("refresh") ||
      errorBody?.error !== "token_expired"
    ) {
      logout();
      return response;
    }

    // Refresh Attempt (pointing to Auth Service)
    const refreshRes = await fetch(rewriteUrl("/api/auth/refresh"), {
      method: "POST",
      credentials: "include",
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

    setAccessToken(newAccessToken);
    setAccessRole(refreshData.profile);

    return fetch(rewritten, {
      ...options,
      headers: { ...headers, Authorization: `Bearer ${newAccessToken}` },
      body: options.body ? JSON.stringify(options.body) : undefined,
    });
  }

  return response;
}

export default function useApi() {
  const { accessToken, setAccessToken, logout, setAccessRole } = useAuth();

  // --- GENERIC METHODS (The ones you were looking for) ---

  const get = (url: string, options: ApiOptions = {}) =>
    coreRequest(
      url,
      { ...options, method: "GET" },
      accessToken,
      setAccessToken,
      setAccessRole,
      logout
    );

  const post = (url: string, body?: any, options: ApiOptions = {}) =>
    coreRequest(
      url,
      { ...options, method: "POST", body },
      accessToken,
      setAccessToken,
      setAccessRole,
      logout
    );

  const put = (url: string, body?: any, options: ApiOptions = {}) =>
    coreRequest(
      url,
      { ...options, method: "PUT", body },
      accessToken,
      setAccessToken,
      setAccessRole,
      logout
    );

  const del = (url: string, body?: any, options: ApiOptions = {}) =>
    coreRequest(
      url,
      { ...options, method: "DELETE", body },
      accessToken,
      setAccessToken,
      setAccessRole,
      logout
    );

  // Helper for JSON parsing to keep the domain APIs clean
  const requestJson = async <T>(
    method: string,
    url: string,
    body?: any,
    auth: ApiAccess = "private"
  ): Promise<T> => {
    const res = await coreRequest(
      url,
      { method, body, auth },
      accessToken,
      setAccessToken,
      setAccessRole,
      logout
    );
    if (!res.ok) throw new Error(`API Error: ${res.status}`);
    return res.json();
  };

  return {
    // Expose raw methods
    get,
    post,
    put,
    del,

    // Expose Domain Logic (from api.ts)
    shopApi: {
      register: (data: any) => requestJson("POST", "/api/shop/add", data),
      getMyShops: () => requestJson("GET", "/api/shop/mine"),
      getAllShops: () => requestJson("GET", "/api/shop/all"),
      getShop: (id: number) => requestJson("GET", `/api/shop/${id}`),
      delete: (id: number) => requestJson("DELETE", `/api/shop/${id}`),
      deleteMultiple: (ids: number[]) => requestJson("DELETE", "/api/shop/bulk", ids),
    },
    productApi: {
      add: (shopId: number, data: any) => requestJson("POST", `/api/shop/${shopId}/products`, data),
      getByShop: (shopId: number) => requestJson("GET", `/api/shop/${shopId}/products`),
      update: (id: number, data: any) => requestJson("PUT", `/api/shop/products/${id}`, data),
      delete: (id: number) => requestJson("DELETE", `/api/shop/products/${id}`),
      deleteMultiple: (ids: number[]) => requestJson("DELETE", "/api/shop/products/bulk", ids),
    },
  };
}
