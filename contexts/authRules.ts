export const ROLE_ROUTE_MAP: Record<string, string[]> = {
    "/admin/dashboard": ["ADMIN"],
    "/dashboard": ["SHOP"],
    "/register-shop": ["ADMIN", "SHOP"],
    "/shop": ["SHOP", "ADMIN"],
    "/home": ["CUSTOMER", "SHOP", "ADMIN"],
    "/delivery": ["DELIVERY"],
};