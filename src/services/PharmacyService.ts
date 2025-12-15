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
    // Simulate an API call to fetch pharmacies
    getAllPharmacies: async (): Promise<Pharmacy[]> => {
        // Simulate network latency
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve(realPharmacies);
            }, 500);
        });
    },

    // Get pharmacies by commune
    getByCommune: async (commune: string): Promise<Pharmacy[]> => {
        return new Promise((resolve) => {
            setTimeout(() => {
                if (commune === 'Toutes') {
                    resolve(realPharmacies);
                } else {
                    resolve(realPharmacies.filter(p => p.commune === commune));
                }
            }, 300);
        });
    },

    // Future integration: Search using Google Places API (Mock)
    searchNearby: async (lat: number, lng: number, radius: number = 5000): Promise<Pharmacy[]> => {
        console.log(`Searching near ${lat}, ${lng} within ${radius}m`);
        // In a real implementation, this would call:
        // https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lng}&radius=${radius}&type=pharmacy&key=YOUR_API_KEY
        return PharmacyService.getAllPharmacies();
    }
};
