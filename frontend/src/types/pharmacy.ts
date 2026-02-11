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
}

export interface InventoryItem {
    medicationName: string
    genericName?: string
    quantity: number
    price: number
    inStock: boolean
}
