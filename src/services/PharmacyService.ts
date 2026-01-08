import { supabase } from "@/lib/supabase";
import { realPharmacies, Pharmacy } from '../data/pharmacyData';

// Simulating Google Maps Place Result Interface
export interface GooglePlaceResult {
    place_id: string;
    name: string;
    vicinity: string; // address
    geometry: {
        location: {
            lat: number;
            lng: number;
        }
    };
    opening_hours?: {
        open_now: boolean;
    };
    rating?: number;
    user_ratings_total?: number;
    formatted_phone_number?: string;
}

export const PharmacyService = {
    /**
     * Fetch all pharmacies from Supabase
     * @returns List of pharmacies mapped to the app's structure
     */
    getAllPharmacies: async (): Promise<Pharmacy[]> => {
        try {
            const { data, error } = await supabase
                .from('pharmacies')
                .select('*')
                .order('name', { ascending: true });

            if (error) throw error;

            if (!data || data.length === 0) return realPharmacies;

            // Map Supabase data to the UI Pharmacy interface
            return data.map((item) => ({
                id: (item as any).id,
                name: (item as any).name,
                address: (item as any).address,
                commune: (item as any).city || (item as any).commune || "Abidjan",
                phone: (item as any).phone || "+225 00 00 00 00 00",
                hours: (item as any).opening_hours?.normal || "08h00 - 20h00", // Defaulting if not present
                distance: "N/A", // Calculated in UI
                rating: 4.5, // Mocked as not in AIRP
                reviews: Math.floor(Math.random() * 200) + 50, // Mocked
                isOpen: item.is_on_duty || true, // Simplified
                isOnGuard: item.is_on_duty || false,
                hasDelivery: true, // Default for our platform
                acceptsCard: true,
                isPartner: item.airp_source ? false : true,
                specialties: ["Général"],
                services: ["Livraison", "Conseil"],
                estimatedDelivery: "30-45 min",
                deliveryFee: 1000,
                coordinates: item.latitude && item.longitude ? { lat: item.latitude, lng: item.longitude } : undefined
            }));
        } catch (error) {
            console.error("Failed to fetch pharmacies from Supabase, falling back to mock data", error);
            return realPharmacies;
        }
    },

    /**
     * Get pharmacies by commune
     * @param commune Commune name
     * @returns List of pharmacies in the commune
     */
    getByCommune: async (commune: string): Promise<Pharmacy[]> => {
        if (commune === 'Toutes') {
            return PharmacyService.getAllPharmacies();
        }

        try {
            const { data, error } = await supabase
                .from('pharmacies')
                .select('*')
                .eq('city', commune)
                .order('name', { ascending: true });

            if (error) throw error;

            if (!data || data.length === 0) {
                return realPharmacies.filter(p => p.commune === commune);
            }

            return data.map((item) => ({
                id: (item as any).id,
                name: (item as any).name,
                address: (item as any).address,
                commune: (item as any).city || (item as any).commune || commune,
                phone: (item as any).phone || "+225 00 00 00 00 00",
                hours: (item as any).opening_hours?.normal || "08h00 - 20h00",
                distance: "N/A",
                rating: 4.5,
                reviews: Math.floor(Math.random() * 200) + 50,
                isOpen: item.is_on_duty || true,
                isOnGuard: item.is_on_duty || false,
                hasDelivery: true,
                acceptsCard: true,
                isPartner: item.airp_source ? false : true,
                specialties: ["Général"],
                services: ["Livraison", "Conseil"],
                estimatedDelivery: "30-45 min",
                deliveryFee: 1000,
                coordinates: item.latitude && item.longitude ? { lat: item.latitude, lng: item.longitude } : undefined
            }));
        } catch (error) {
            console.error("Failed to fetch pharmacies by commune, falling back to mock data", error);
            return realPharmacies.filter(p => p.commune === commune);
        }
    },

    /**
     * Search nearby pharmacies (Mock/Simulation)
     */
    searchNearby: async (lat: number, lng: number, radius: number = 5000): Promise<Pharmacy[]> => {
        console.log(`Searching near ${lat}, ${lng} within ${radius}m`);
        return PharmacyService.getAllPharmacies();
    }
};
