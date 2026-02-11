export type PaymentMethod = 'ORANGE_MONEY' | 'WAVE' | 'MTN_MOMO' | 'CASH';

export interface MvpMedicine {
    id: string;
    name: string;
    molecule: string;
    category: string;
    isPrescriptionRequired: boolean;
    image: string;
    price: number;
    description: string;
}

export interface MvpStock {
    pharmacyId: string;
    medicineId: string;
    quantity: number;
    status: 'IN_STOCK' | 'OUT_OF_STOCK' | 'LOW_STOCK';
}

export interface MvpPharmacy {
    id: string;
    name: string;
    legalName: string;
    address: string;
    coordinates: {
        lat: number;
        lng: number;
    };
    phone: string;
    isOnGuard: boolean;
    openingHours: string; // e.g. "08:00 - 20:00"
}

export interface MvpOrderItem {
    medicineId: string;
    quantity: number;
    priceAtTime: number;
}

export interface MvpOrder {
    id: string;
    patientId: string;
    pharmacyId: string;
    items: MvpOrderItem[];
    totalAmount: number;
    status: 'PENDING' | 'PAID' | 'PREPARING' | 'SHIPPING' | 'DELIVERED' | 'CANCELLED';
    paymentMethod: PaymentMethod;
    paymentStatus: 'PENDING' | 'CONFIRMED' | 'FAILED';
    deliveryAddress: string;
    createdAt: string;
    requiresPrescription: boolean;
    prescriptionId?: string;
}

export interface MvpReview {
    id: string;
    orderId: string;
    targetId: string; // Pharmacy ID or Driver ID
    targetType: 'PHARMACY' | 'DRIVER';
    rating: number; // 1-5
    comment: string;
    createdAt: string;
}

export interface MvpDelivery {
    id: string;
    orderId: string;
    driverId?: string;
    status: 'SEARCHING_DRIVER' | 'ASSIGNED' | 'PICKED_UP' | 'DELIVERED';
    currentLocation?: {
        lat: number;
        lng: number;
    };
    proofOfDelivery?: string; // URL to image/signature
    estimatedTime?: string;
}
