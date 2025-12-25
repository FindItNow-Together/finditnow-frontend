export type UserRole = "CUSTOMER" | "SHOP" | "DELIVERY_AGENT" | "ADMIN" | "UNASSIGNED";

export interface User {
    id: string;
    firstName: string;
    lastName?: string | null;

    email: string;
    role: UserRole;
    profileUrl?: string | null;
    addresses: UserAddress[];
}

export interface UserAddress {
    id: string;
    city?: string | null;
    country?: string | null;
    postalCode?: string | null;
    fullAddress?: string | null;
    isPrimary?: boolean
    userId: string
}