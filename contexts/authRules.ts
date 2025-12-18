export const ROLE_ROUTE_MAP: Record<string, string[]> = {
    "/admin": ["ADMIN"],
    "/dashboard": ["SHOP"],
    "/register-shop": ["ADMIN", "SHOP"],
    "/shop": ["SHOP", "ADMIN"],
    "/orders": ["CUSTOMER", "SHOP", "ADMIN"],
    "/delivery": ["DELIVERY"],
};