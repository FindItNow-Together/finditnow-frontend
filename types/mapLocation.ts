export type MapLocation<T = unknown> = {
    id: string;
    lat: number;
    lng: number;
    data: T; // arbitrary payload (shop, warehouse, user, anything)
};