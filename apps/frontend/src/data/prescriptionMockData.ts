
export interface Prescription {
    id: string;
    status: 'pending' | 'validated' | 'preparing' | 'ready' | 'rejected' | 'delivered';
    date: string;
    doctorName?: string;
    pharmacyId?: string;
    pharmacyName?: string;
    image: string; // URL or base64
    notes?: string;
    items?: { name: string; dosage: string; quantity: number }[];
    totalPrice?: number;
}

export const mockPrescriptions: Prescription[] = [
    {
        id: 'ord-001',
        status: 'pending',
        date: new Date().toISOString(),
        image: '/placeholder.svg',
        notes: 'Ordonnance pour fièvre et toux'
    },
    {
        id: 'ord-002',
        status: 'validated',
        date: new Date(Date.now() - 86400000 * 2).toISOString(), // 2 days ago
        image: '/placeholder.svg',
        doctorName: 'Dr. Kouassi',
        pharmacyName: 'Pharmacie des Finances',
        items: [
            { name: 'Doliprane 1000mg', dosage: '1 cp 3x/jour', quantity: 1 },
            { name: 'Sirop Toux', dosage: '3 cuillères/jour', quantity: 1 }
        ]
    },
    {
        id: 'ord-003',
        status: 'delivered',
        date: new Date(Date.now() - 86400000 * 10).toISOString(),
        image: '/placeholder.svg',
        pharmacyName: 'Pharmacie de Cocody',
        totalPrice: 15500
    }
];
