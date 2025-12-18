"use client";

import { useAuth } from "@/contexts/AuthContext";

type ApiAccess = "public" | "private";

interface ApiOptions extends Omit<RequestInit, "body"> {
  auth?: ApiAccess;
  body?: any;
}

function rewriteUrl(url: string): string {
  if (!url.length) throw new Error("URL cannot be empty");

  // Switch logic based on the path prefix
  // Example: /auth/login -> port 8081 | /api/v1/shops -> port 8084
  const segment = url.split("/")[1];

  switch (segment) {
    case "auth":
      return url.replace("/auth/", process.env.NEXT_PUBLIC_AUTH_APP_URL || "http://localhost:8080/");
    case "shop":
      // Directs all /api/ calls to the Shop/Product service
      return url.replace("/shop/", process.env.NEXT_PUBLIC_SHOP_APP_URL ||"http://localhost:8083/api/");
    default:
      return url;
  }
}

async function coreRequest(
  url: string,
  options: ApiOptions & { method: string },
  accessToken: string | null,
  setAccessToken: (t: string | null) => void,
  setAccessRole: (t: string | null) => void,
  logout: () => void
): Promise<Response> {
  const rewritten = rewriteUrl(url);

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as any),
  };

  if (options.auth === "private") {
    if (!accessToken) throw new Error("Unauthorized: No access token found.");
    headers["Authorization"] = `Bearer ${accessToken}`;
  }

  const response = await fetch(rewritten, {
    ...options,
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined,
    credentials: "include",
  });

  // 401 Handling & Token Refresh
  if (response.status === 401) {
    const errorBody = await response
      .clone()
      .json()
      .catch(() => null);

    if (
      rewritten.endsWith("logout") ||
      rewritten.endsWith("refresh") ||
      errorBody?.error !== "token_expired"
    ) {
      logout();
      return response;
    }

    // Refresh Attempt (pointing to Auth Service)
    const refreshRes = await fetch("http://localhost:8081/refresh", {
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
      register: (data: any) => requestJson("POST", "/shop/v1/shops", data),
      getMyShops: () => requestJson("GET", "/shop/v1/shops/mine"),
      getAllShops: () => requestJson("GET", "/shop/v1/shops"),
      getShop: (id: number) => requestJson("GET", `/shop/v1/shops/${id}`),
      delete: (id: number) => requestJson("DELETE", `/shop/v1/shops/${id}`),
      deleteMultiple: (ids: number[]) =>
        requestJson("DELETE", "/shop/v1/shops/bulk", ids),
    },
    productApi: {
      add: (shopId: number, data: any) =>
        requestJson("POST", `/shop/v1/shops/${shopId}/products`, data),
      getByShop: (shopId: number) =>
        requestJson("GET", `/shop/v1/shops/${shopId}/products`),
      update: (id: number, data: any) =>
        requestJson("PUT", `/shop/v1/products/${id}`, data),
      delete: (id: number) => requestJson("DELETE", `/shop/v1/products/${id}`),
      deleteMultiple: (ids: number[]) =>
        requestJson("DELETE", "/shop/v1/products/bulk", ids),
    },
  };
}
