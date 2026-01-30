"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useCallback, useMemo } from "react";

type ApiAccess = "public" | "private";

interface ApiOptions extends Omit<RequestInit, "body"> {
  auth?: ApiAccess;
  body?: any;
}

export function getBaseUrl(envUrl?: string): string {
  const baseUrl = envUrl ?? process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost";

  try {
    if (globalThis.URL?.canParse?.(baseUrl)) {
      // Ensure trailing slash so URL resolution behaves consistently
      return baseUrl;
    }
    throw new Error("Base url incorrect");
  } catch (err) {
    console.error("Invalid BASE_URL provided, falling back to localhost:", err);
    return "http://localhost/";
  }
}

function rewriteUrl(baseUrl: string, url: string): string {
  if (!url.length) throw new Error("URL cannot be empty");
  return new URL(url, baseUrl).toString();
}

// Base URLs (service-aware)
export const appBaseUrl = getBaseUrl(process.env.NEXT_PUBLIC_APP_URL);
export const authBaseUrl = getBaseUrl(process.env.NEXT_PUBLIC_AUTH_APP_URL ?? appBaseUrl);
export const shopBaseUrl = getBaseUrl(process.env.NEXT_PUBLIC_SHOP_APP_URL ?? appBaseUrl);
// Back-compat for existing imports
export const publicBaseUrl = authBaseUrl;

function pickBaseUrl(url: string): string {
  // Auth service routes
  if (url.startsWith("/api/auth/") || url === "/api/auth") return authBaseUrl;
  if (url.startsWith("/api/user/") || url === "/api/user") return authBaseUrl;

  // Shop service routes
  if (url.startsWith("/api/v1/")) return shopBaseUrl;
  if (url.startsWith("/api/categories")) return shopBaseUrl;
  if (url.startsWith("/api/cart")) return shopBaseUrl;

  // Fallback (app proxy / next routes)
  return appBaseUrl;
}

async function coreRequest(
  baseUrl: string,
  url: string,
  options: ApiOptions & { method: string },
  accessToken: string | null,
  setAccessToken: (t: string | null) => void,
  setAccessRole: (t: string | null) => void,
  logout: () => void
): Promise<Response> {
  const rewritten = rewriteUrl(baseUrl, url);

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
    const refreshRes = await fetch(rewriteUrl(authBaseUrl, "/api/auth/refresh"), {
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

  const get = useCallback(
    (url: string, options: ApiOptions = {}) =>
      coreRequest(
        pickBaseUrl(url),
        url,
        { ...options, method: "GET" },
        accessToken,
        setAccessToken,
        setAccessRole,
        logout
      ),
    [accessToken, setAccessToken, setAccessRole, logout]
  );

  const post = useCallback(
    (url: string, body?: any, options: ApiOptions = {}) =>
      coreRequest(
        pickBaseUrl(url),
        url,
        { ...options, method: "POST", body },
        accessToken,
        setAccessToken,
        setAccessRole,
        logout
      ),
    [accessToken, setAccessToken, setAccessRole, logout]
  );

  const put = useCallback(
    (url: string, body?: any, options: ApiOptions = {}) =>
      coreRequest(
        pickBaseUrl(url),
        url,
        { ...options, method: "PUT", body },
        accessToken,
        setAccessToken,
        setAccessRole,
        logout
      ),
    [accessToken, setAccessToken, setAccessRole, logout]
  );

  const del = useCallback(
    (url: string, body?: any, options: ApiOptions = {}) =>
      coreRequest(
        pickBaseUrl(url),
        url,
        { ...options, method: "DELETE", body },
        accessToken,
        setAccessToken,
        setAccessRole,
        logout
      ),
    [accessToken, setAccessToken, setAccessRole, logout]
  );

  // Helper for JSON parsing to keep the domain APIs clean
  const requestJson = useCallback(
    async <T>(
      baseUrl: string,
      method: string,
      url: string,
      body?: any,
      auth: ApiAccess = "private"
    ): Promise<T> => {
      const res = await coreRequest(
        baseUrl,
        url,
        { method, body, auth },
        accessToken,
        setAccessToken,
        setAccessRole,
        logout
      );
      if (!res.ok) {
        const errBody = await res
          .clone()
          .json()
          .catch(async () => ({
            raw: await res
              .clone()
              .text()
              .catch(() => ""),
          }));
        throw new Error(`API Error: ${res.status} ${JSON.stringify(errBody)}`);
      }
      return res.json();
    },
    [accessToken, setAccessToken, setAccessRole, logout]
  );

  const api = useMemo(
    () => ({
      // Expose raw methods
      get,
      post,
      put,
      del,

      // Expose Domain Logic (from api.ts)
      shopApi: {
        register: (data: any) => requestJson(shopBaseUrl, "POST", "/api/shop/add", data),
        getMyShops: (page = 0, size = 10) =>
          requestJson(shopBaseUrl, "GET", `/api/shop/mine?page=${page}&size=${size}`),
        getAllShops: (page = 0, size = 10) =>
          requestJson(shopBaseUrl, "GET", `/api/shop/all?page=${page}&size=${size}`),
        getShop: (id: number) => requestJson(shopBaseUrl, "GET", `/api/shop/${id}`),
        updateShop: (id: number, data: any) =>
          requestJson(shopBaseUrl, "PUT", `/api/shop/${id}`, data),
        delete: (id: number) => requestJson(shopBaseUrl, "DELETE", `/api/shop/${id}`),
        deleteMultiple: (ids: number[]) =>
          requestJson(shopBaseUrl, "DELETE", "/api/shop/bulk", ids),
        search: (params: {
          name?: string;
          deliveryOption?: string;
          lat?: number;
          lng?: number;
          page?: number;
          size?: number;
        }) => {
          const queryParams = new URLSearchParams();
          if (params.name) queryParams.append("name", params.name);
          if (params.deliveryOption) queryParams.append("deliveryOption", params.deliveryOption);
          if (params.lat) queryParams.append("lat", params.lat.toString());
          if (params.lng) queryParams.append("lng", params.lng.toString());
          queryParams.append("page", (params.page || 0).toString());
          queryParams.append("size", (params.size || 10).toString());
          return requestJson(shopBaseUrl, "GET", `/api/shop/search?${queryParams.toString()}`);
        },
      },
      inventoryApi: {
        getShopInventory: (shopId: number) =>
          requestJson(shopBaseUrl, "GET", `/api/shop/${shopId}/inventory`),
        getInventory: (id: number) => requestJson(shopBaseUrl, "GET", `/api/shop/inventory/${id}`),
        addInventory: (shopId: number, data: any) =>
          requestJson(shopBaseUrl, "POST", `/api/shop/${shopId}/inventory/add`, data),
        updateInventory: (id: number, data: any) =>
          requestJson(shopBaseUrl, "PUT", `/api/shop/inventory/${id}`, data),
        deleteInventory: (id: number) => requestJson(shopBaseUrl, "DELETE", `/api/inventory/${id}`),
        reserveStock: (id: number, quantity: number) =>
          requestJson(shopBaseUrl, "POST", `/api/inventory/${id}/reserve?quantity=${quantity}`),
        releaseStock: (id: number, quantity: number) =>
          requestJson(shopBaseUrl, "POST", `/api/inventory/${id}/release?quantity=${quantity}`),
      },
      cartApi: {
        // Use the recommended /me endpoint that doesn't require userId in path
        getCart: () => requestJson(shopBaseUrl, "GET", `/api/cart/user/me`),

        addItem: (data: any) => requestJson(shopBaseUrl, "POST", "/api/cart/add", data),

        updateItem: (itemId: string, data: any) =>
          requestJson(shopBaseUrl, "PUT", `/api/cart/item/${itemId}`, data),

        removeItem: (itemId: string) =>
          requestJson(shopBaseUrl, "DELETE", `/api/cart/item/${itemId}`),

        clearCart: (cartId: string) =>
          requestJson(shopBaseUrl, "DELETE", `/api/cart/${cartId}/clear`),
      },
      categoryApi: {
        create: (data: any) => requestJson(shopBaseUrl, "POST", "/api/categories", data),
        getByType: (type: string) =>
          requestJson(shopBaseUrl, "GET", `/api/categories?type=${type}`),
      },
      productApi: {
        add: (data: any) => requestJson(shopBaseUrl, "POST", "/api/product/add", data),
        getAll: (page = 0, size = 10) =>
          requestJson(shopBaseUrl, "GET", `/api/product?page=${page}&size=${size}`),
        search: (query: string) =>
          requestJson(shopBaseUrl, "GET", `/api/product/search?query=${encodeURIComponent(query)}`),
        getById: (id: number) => requestJson(shopBaseUrl, "GET", `/api/product/${id}`),
        update: (id: number, data: any) =>
          requestJson(shopBaseUrl, "PUT", `/api/product/${id}`, data),
        delete: (id: number) => requestJson(shopBaseUrl, "DELETE", `/api/product/${id}`),
        deleteMultiple: (ids: number[]) =>
          requestJson(shopBaseUrl, "DELETE", "/api/product/bulk", ids),
      },
    }),
    [get, post, put, del, requestJson]
  );

  return api;
}
