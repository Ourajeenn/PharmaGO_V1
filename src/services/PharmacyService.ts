import { supabase } from "@/lib/supabase";
import { realPharmacies } from '../data/pharmacyData';
import { Pharmacy } from "@/types/pharmacy";
import { logger } from "@/utils/logger";

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
            // Fetch from local API
            const response = await fetch('http://localhost:5001/api/pharmacies?limit=1000');
            if (!response.ok) throw new Error('Network response was not ok');

            const data = await response.json();
            const pharmacies = data.pharmacies || [];

            if (!pharmacies || pharmacies.length === 0) {
                return realPharmacies.map(mapPharmacyData);
            }

            // Map API data to UI structure
            return pharmacies.map(mapPharmacyData);
        } catch (error) {
            console.error("Failed to fetch pharmacies from API, falling back to mock data", error);
            return realPharmacies.map(mapPharmacyData);
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
            // Helper to filter valid pharmacies if fetching from Supabase directly (legacy)
            // But we should probably use getAllPharmacies() and filter locally since API supports filtering
            const allPharmacies = await PharmacyService.getAllPharmacies();
            return allPharmacies.filter(p => p.commune === commune);
        } catch (error) {
            console.error("Failed to fetch pharmacies by commune, falling back to mock data", error);
            return realPharmacies.filter(p => p.commune === commune).map(mapPharmacyData);
        }
    },

    /**
     * Search nearby pharmacies (Mock/Simulation)
     */
    searchNearby: async (lat: number, lng: number, radius: number = 5000): Promise<Pharmacy[]> => {
        logger.log(`Searching near ${lat}, ${lng} within ${radius}m`);
        return PharmacyService.getAllPharmacies();
    }
};
