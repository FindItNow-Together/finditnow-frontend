export type Shop = {
    id: number;
    name: string;
    address: string;
    phone: string;
    ownerId: number;
    latitude: number;
    longitude: number;
    openHours: string;
    deliveryOption: DeliveryOption;
}

export type ShopRequest = {
    name: string;
    address: string;
    phone: string;
    latitude: number;
    longitude: number;
    openHours: string;
    deliveryOption: DeliveryOption;
    ownerId?: number;
}

export type DeliveryOption = 'NO_DELIVERY' | 'IN_HOUSE_DRIVER' | 'THIRD_PARTY_PARTNER';

