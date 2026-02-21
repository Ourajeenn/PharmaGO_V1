import { supabase } from "@/lib/supabase";
import { realPharmacies } from '../data/pharmacyData';
import { Pharmacy } from "@/types/pharmacy";
import { Medicine } from "@/lib/supabase";
import { logger } from "@/utils/logger";
import { User } from '@supabase/supabase-js';

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

const mapPharmacyData = (item: any): Pharmacy => ({
    id: item.id ? String(item.id) : Math.random().toString(36).substr(2, 9),
    name: item.name || item.nom,
    address: item.address || item.adresse || item.localisation || "Abidjan",
    commune: item.commune || "Abidjan",
    phone: item.phone || item.telephone || "Non disponible",

    // Map coordinates to flat lat/long
    latitude: item.latitude || item.coordinates?.lat || 0,
    longitude: item.longitude || item.coordinates?.lng || 0,

    // Status
    isOpen: item.isOpen !== undefined ? item.isOpen : true,
    isOnDuty: item.isOnDuty !== undefined ? item.isOnDuty : (item.is_on_duty || false),

    // Additional fields
    rating: item.rating || 4.5,
    distance: item.distance ? parseFloat(item.distance) : undefined,
    inventory: item.inventory || [],
});

export const PharmacyService = {
    /**
     * Fetch all pharmacies from Supabase
     * @returns List of pharmacies mapped to the app's structure
     */
    getAllPharmacies: async (): Promise<Pharmacy[]> => {
        try {
            const { data, error } = await supabase
                .from('pharmacies')
                .select(`
                    *,
                    pharmacy_inventory (
                        price,
                        quantity,
                        medicine:medicines (
                            name,
                            generic_name,
                            category
                        )
                    )
                `);

            if (error) throw error;
            if (!data) return [];

            const COMMUNES = ['Cocody', 'Yopougon', 'Abobo', 'Plateau', 'Treichville', 'Marcory', 'Koumassi', 'Port-Bouët', 'Adjamé', 'Attécoubé', 'Bingerville', 'Songon', 'Anyama'];

            return data.map((item: any) => {
                // Extract commune from address if possible
                let derivedCommune = "Abidjan";
                const addressUpper = (item.address || "").toUpperCase();
                for (const c of COMMUNES) {
                    if (addressUpper.includes(c.toUpperCase())) {
                        derivedCommune = c;
                        break;
                    }
                }

                return {
                    id: item.id,
                    name: item.name,
                    address: item.address || "Abidjan",
                    commune: derivedCommune,
                    phone: item.phone || "Non disponible",
                    latitude: item.latitude || 0,
                    longitude: item.longitude || 0,
                    isOpen: true,
                    isOnDuty: item.is_on_duty || false,
                    rating: 4.5,
                    distance: undefined,
                    inventory: item.pharmacy_inventory?.map((inv: any) => ({
                        medicationName: inv.medicine?.name,
                        genericName: inv.medicine?.generic_name,
                        quantity: inv.quantity,
                        price: inv.price,
                        inStock: inv.quantity > 0
                    })) || []
                };
            });
        } catch (error) {
            console.error("Failed to fetch pharmacies from Supabase, falling back to mock data", error);
            // Fallback for demo if Supabase fails (e.g. network)
            return realPharmacies.map(mapPharmacyData);
        }
    },

    /**
     * Get pharmacies by commune
     */
    getByCommune: async (commune: string): Promise<Pharmacy[]> => {
        if (commune === 'Toutes') {
            return PharmacyService.getAllPharmacies();
        }

        try {
            const { data, error } = await supabase
                .from('pharmacies')
                .select('*')
                .ilike('commune', `%${commune}%`); // Assuming 'commune' column exists or is part of address

            if (error) throw error;
            if (!data) return [];

            return data.map((item: any) => ({
                id: item.id,
                name: item.name,
                address: item.address || "Abidjan",
                commune: item.commune || commune,
                phone: item.phone || "Non disponible",
                latitude: item.latitude || 0,
                longitude: item.longitude || 0,
                isOpen: true,
                isOnDuty: item.is_on_duty || false,
                rating: 4.5,
                distance: undefined,
                inventory: []
            }));
        } catch (error) {
            console.error("Failed to fetch from Supabase:", error);
            return [];
        }
    },

    /**
     * Search nearby pharmacies (Client-side filter for now or PostGIS later)
     */
    searchNearby: async (lat: number, lng: number, radius: number = 5000): Promise<Pharmacy[]> => {
        // For now, fetch all and filter client side as we don't have PostGIS enabled/configured here
        const all = await PharmacyService.getAllPharmacies();
        return all
            .map(p => {
                const R = 6371e3; // metres
                const φ1 = lat * Math.PI / 180;
                const φ2 = p.latitude * Math.PI / 180;
                const Δφ = (p.latitude - lat) * Math.PI / 180;
                const Δλ = (p.longitude - lng) * Math.PI / 180;

                const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
                    Math.cos(φ1) * Math.cos(φ2) *
                    Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
                const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
                const d = R * c;

                return { ...p, distance: d / 1000 };
            })
            .filter(p => (p.distance || 0) <= radius / 1000)
            .sort((a, b) => (a.distance || 0) - (b.distance || 0))
            .slice(0, 10);
    },

    checkHealth: async (): Promise<boolean> => {
        const { error } = await supabase.from('pharmacies').select('id').limit(1);
        return !error;
    },

    /**
     * Get all medicines categorized as parapharmacy (no prescription required)
     */
    getParapharmacyProducts: async (): Promise<Medicine[]> => {
        try {
            const { data, error } = await supabase
                .from('medicines')
                .select('*')
                .eq('requires_prescription', false);

            if (error) throw error;
            return data || [];
        } catch (error) {
            console.error("Error fetching parapharmacy products:", error);
            return [];
        }
    },

    /**
     * Get personalized recommendations for a user
     * @param userId User ID
     */
    getRecommendations: async (userId: string): Promise<Medicine[]> => {
        try {
            // Fetch inventory items that are in stock
            // We use 'medicine:medicines' to alias the join relation
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const { data, error } = await (supabase as any)
                .from('pharmacy_inventory')
                .select(`
                    price,
                    medicine:medicines (
                        id,
                        name,
                        category,
                        description
                    )
                `)
                .gt('quantity', 0)
                .limit(20);

            if (error) throw error;

            if (!data || data.length === 0) {
                // Return empty if no data found
                return [];
            }

            // Deduplicate medicines (same medicine available in multiple pharmacies)
            const uniqueMedicines = new Map<string, Medicine>();

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            data.forEach((item: any) => {
                if (item.medicine && !uniqueMedicines.has(item.medicine.id)) {
                    uniqueMedicines.set(item.medicine.id, {
                        ...item.medicine,
                        price: item.price
                    } as unknown as Medicine);
                }
            });

            // Return top 4 unique recommendations
            return Array.from(uniqueMedicines.values()).slice(0, 4);

        } catch (error) {
            console.error("Error fetching real recommendations:", error);
            return []; // Fail gracefully
        }
    }
};
