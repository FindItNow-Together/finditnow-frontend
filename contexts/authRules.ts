export const ROLE_ROUTE_MAP: Record<string, string[]> = {
    "/admin/dashboard": ["ADMIN"],
    "/dashboard": ["SHOP"],
    "/register-shop": ["ADMIN", "SHOP"],
    "/shop": ["SHOP", "ADMIN"],
    "/profile":["CUSTOMER", "SHOP", "DELIVERY_AGENT", "UNASSIGNED"],
    "/Discover": ["CUSTOMER", "SHOP", "ADMIN", "UNASSIGNED"],
    "/delivery": ["DELIVERY_AGENT"],
};