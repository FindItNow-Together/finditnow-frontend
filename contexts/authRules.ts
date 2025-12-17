export const ROLE_ROUTE_MAP: Record<string, string[]> = {
    "/admin": ["ADMIN"],
    "/register-shop": ["ADMIN", "SHOP"],
    "/shop": ["SHOP", "ADMIN"],
    "/orders": ["CUSTOMER", "SHOP", "ADMIN"],
    "/delivery": ["DELIVERY"],
};