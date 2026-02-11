import { MvpMedicine, MvpPharmacy, MvpStock } from "@/types/mvpSchema";

export const mvpMedicines: MvpMedicine[] = [
    {
        id: "med-1",
        name: "Doliprane 1000mg",
        molecule: "Paracétamol",
        category: "Antalgique",
        isPrescriptionRequired: false,
        image: "/meds/doliprane.jpg",
        price: 2500,
        description: "Traitement des douleurs et de la fièvre."
    },
    {
        id: "med-2",
        name: "Amoxicilline 500mg",
        molecule: "Amoxicilline",
        category: "Antibiotique",
        isPrescriptionRequired: true,
        image: "/meds/amoxi.jpg",
        price: 3200,
        description: "Antibiotique à large spectre."
    },
    {
        id: "med-3",
        name: "Vitamines C Upsa",
        molecule: "Acide Ascorbique",
        category: "Vitalité",
        isPrescriptionRequired: false,
        image: "/meds/vitc.jpg",
        price: 1800,
        description: "Pour la fatigue passagère."
    }
];

export const mvpPharmacies: MvpPharmacy[] = [
    {
        id: "pharma-1",
        name: "Pharmacie des Arts",
        legalName: "SARL Pharmacie des Arts - Cocody",
        address: "Cocody Centre, Rue des Jardins",
        coordinates: { lat: 5.356, lng: -4.008 },
        phone: "+225 01020304",
        isOnGuard: true,
        openingHours: "24h/24"
    },
    {
        id: "pharma-2",
        name: "Pharmacie du Lycée",
        legalName: "Pharmacie du Lycée Technique",
        address: "Adjamé, 220 Logements",
        coordinates: { lat: 5.362, lng: -4.020 },
        phone: "+225 05060708",
        isOnGuard: false,
        openingHours: "08:00 - 21:00"
    }
];

// Stock logic: Pharma 1 has everything, Pharma 2 is missing Amoxicilline
export const mvpStocks: MvpStock[] = [
    { pharmacyId: "pharma-1", medicineId: "med-1", quantity: 50, status: 'IN_STOCK' },
    { pharmacyId: "pharma-1", medicineId: "med-2", quantity: 20, status: 'IN_STOCK' },
    { pharmacyId: "pharma-1", medicineId: "med-3", quantity: 15, status: 'IN_STOCK' },
    { pharmacyId: "pharma-2", medicineId: "med-1", quantity: 30, status: 'IN_STOCK' },
    { pharmacyId: "pharma-2", medicineId: "med-2", quantity: 0, status: 'OUT_OF_STOCK' },
    { pharmacyId: "pharma-2", medicineId: "med-3", quantity: 5, status: 'LOW_STOCK' }
];
