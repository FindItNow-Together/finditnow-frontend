//positioning of keys matter as first matching startsWith key will be used in auth context
export const ROLE_ROUTE_MAP: Record<string, string[]> = {
  "/admin/dashboard": ["ADMIN"],
  "/dashboard": ["SHOP"],
  "/register-shop": ["ADMIN", "SHOP"],
  "/shops": ["SHOP", "ADMIN", "CUSTOMER", "DELIVERY_AGENT", "UNASSIGNED"],
  "/shop": ["SHOP", "ADMIN"],
  "/profile": ["CUSTOMER", "SHOP", "DELIVERY_AGENT", "UNASSIGNED"],
  "/discover": ["CUSTOMER", "SHOP", "ADMIN", "UNASSIGNED"],
  "/deliveries": ["DELIVERY_AGENT"],
};

export const ROLE_DEFAULT_ROUTE: Record<string, string> = {
  ADMIN: "/admin/dashboard",
  SHOP: "/discover",
  CUSTOMER: "/discover",
  DELIVERY_AGENT: "/deliveries",
  UNASSIGNED: "/discover",
};
