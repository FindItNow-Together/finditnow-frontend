"use client";

import { useAuth } from "@/contexts/AuthContext";

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

    // Handle 204 No Content and other empty responses
    if (res.status === 204 || res.headers.get("content-length") === "0") {
      return {} as T;
    }

    // Check if response has JSON content
    const contentType = res.headers.get("content-type");
    if (!contentType?.includes("application/json")) {
      console.warn(`API: ${url} ::METHOD: ${method} - Non-JSON response: ${res.status}`);
      return {} as T;
    }

    try {
      return await res.json();
    } catch (err) {
      console.error(`API: ${url} ::METHOD: ${method} - Failed to parse JSON:`, err);
      return {} as T;
    }
  };

  const api = {
    // Expose raw methods
    get,
    post,
    put,
    del,

    // Expose Domain Logic (from api.ts)
    shopApi: {
      register: (data: any) => requestJson("POST", "/api/shop/add", data),
      getMyShops: (page = 0, size = 10) =>
        requestJson("GET", `/api/shop/mine?page=${page}&size=${size}`),
      getAllShops: (page = 0, size = 10) =>
        requestJson("GET", `/api/shop/all?page=${page}&size=${size}`),
      getShop: (id: number) => requestJson("GET", `/api/shop/${id}`),
      updateShop: (id: number, data: any) => requestJson("PUT", `/api/shop/${id}`, data),
      delete: (id: number) => requestJson("DELETE", `/api/shop/${id}`),
      deleteMultiple: (ids: number[]) => requestJson("DELETE", "/api/shop/bulk", ids),
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
        return requestJson("GET", `/api/shop/search?${queryParams.toString()}`);
      },
    },
    inventoryApi: {
      getShopInventory: (shopId: number) => requestJson("GET", `/api/shop/${shopId}/inventory`),
      getInventory: (id: number) => requestJson("GET", `/api/shop/inventory/${id}`),
      addInventory: (shopId: number, data: any) =>
        requestJson("POST", `/api/shop/${shopId}/inventory/add`, data),
      updateInventory: (id: number, data: any) =>
        requestJson("PUT", `/api/shop/inventory/${id}`, data),
      deleteInventory: (id: number) => requestJson("DELETE", `/api/inventory/${id}`),
      reserveStock: (id: number, quantity: number) =>
        requestJson("POST", `/api/inventory/${id}/reserve?quantity=${quantity}`),
      releaseStock: (id: number, quantity: number) =>
        requestJson("POST", `/api/inventory/${id}/release?quantity=${quantity}`),
    },
    cartApi: {
      // Use the recommended /me endpoint that doesn't require userId in path
      getCart: () => requestJson("GET", `/api/cart/user/me`),

      addItem: (data: any) => requestJson("POST", "/api/cart/add", data),

      updateItem: (itemId: string, data: any) =>
        requestJson("PUT", `/api/cart/item/${itemId}`, data),

      removeItem: (itemId: string) => requestJson("DELETE", `/api/cart/item/${itemId}`),

      clearCart: (cartId: string) => requestJson("DELETE", `/api/cart/${cartId}/clear`),
    },
    categoryApi: {
      create: (data: any) => requestJson("POST", "/api/categories", data),
      getByType: (type: string) => requestJson("GET", `/api/categories?type=${type}`),
    },
    productApi: {
      add: (data: any) => requestJson("POST", "/api/product/add", data),
      getAll: (page = 0, size = 10) => requestJson("GET", `/api/product?page=${page}&size=${size}`),
      search: (query: string) =>
        requestJson("GET", `/api/product/search?query=${encodeURIComponent(query)}`),
      getById: (id: number) => requestJson("GET", `/api/product/${id}`),
      update: (id: number, data: any) => requestJson("PUT", `/api/product/${id}`, data),
      delete: (id: number) => requestJson("DELETE", `/api/product/${id}`),
      deleteMultiple: (ids: number[]) => requestJson("DELETE", "/api/product/bulk", ids),
    },
    deliveryApi: {
      getMyDeliveries: (status?: string, page = 0, limit = 10) => {
        const params = new URLSearchParams({ page: page.toString(), limit: limit.toString() });
        if (status) params.append("status", status);
        return requestJson("GET", `/api/deliveries/mine?${params.toString()}`);
      },
      complete: (deliveryId: string) =>
        requestJson("PUT", `/api/deliveries/${deliveryId}/complete`),
      cancel: (deliveryId: string) => requestJson("PUT", `/api/deliveries/${deliveryId}/cancel`),
      optOut: (deliveryId: string) => requestJson("PUT", `/api/deliveries/${deliveryId}/opt-out`),
      accept: (deliveryId: string) => requestJson("PUT", `/api/deliveries/${deliveryId}/accept`),
    },
  };

  return api;
}
