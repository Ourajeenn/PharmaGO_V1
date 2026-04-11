export interface Pharmacy {
    id: string
    name: string
    address: string
    commune: string
    latitude: number
    longitude: number
    phone?: string
    isOpen: boolean
    isOnDuty: boolean
    rating?: number
    distance?: number
    inventory?: InventoryItem[]
    acceptedInsurances?: string[]
}

export interface InventoryItem {
    medicationName: string
    genericName?: string
    quantity: number
    price: number
    inStock: boolean
}

export interface Medicine {
    id: string;
    name: string;
    price: number;
    category: string;
    image?: string;
    description?: string;
}
