export const ROLE_ROUTE_MAP: Record<string, string[]> = {
  "/admin/dashboard": ["ADMIN"],
  "/dashboard": ["SHOP"],
  "/register-shop": ["ADMIN", "SHOP"],
  "/shop": ["SHOP", "ADMIN", "CUSTOMER"],
  "/profile": ["CUSTOMER", "SHOP", "DELIVERY_AGENT", "UNASSIGNED"],
  "/discover": ["CUSTOMER", "SHOP", "ADMIN", "UNASSIGNED"],
  "/delivery": ["DELIVERY_AGENT"],
};

export const ROLE_DEFAULT_ROUTE: Record<string, string> = {
  ADMIN: "/admin/dashboard",
  SHOP: "/discover",
  CUSTOMER: "/discover",
  DELIVERY_AGENT: "/delivery",
  UNASSIGNED: "/discover",
};
