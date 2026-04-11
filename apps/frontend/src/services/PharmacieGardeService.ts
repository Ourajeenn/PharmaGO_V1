/**
 * Service pour les pharmacies de garde d'Abidjan
 * Intégration avec l'API Python des pharmacies de garde
 */

import axios from 'axios';

// Configuration de l'API
const API_BASE_URL = process.env.VITE_PHARMACIE_GARDE_API_URL || 'http://localhost:5000/api';

// Instance axios avec configuration
const apiClient = axios.create({
    baseURL: API_BASE_URL,
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    }
});

// Types
export interface PharmacieGarde {
    id: number;
    nom: string;
    commune: string;
    quartier: string;
    adresse: string;
    telephone: string;
    date_garde?: string;
    horaires?: string;
    latitude?: number;
    longitude?: number;
    distance_km?: number;
    derniere_maj?: string;
}

export interface PharmacieResponse {
    success: boolean;
    count: number;
    pharmacies: PharmacieGarde[];
    timestamp?: string;
}

export interface CommunesResponse {
    success: boolean;
    count: number;
    communes: string[];
}

export interface StatsResponse {
    success: boolean;
    total_pharmacies: number;
    repartition_par_commune: Array<{ commune: string; count: number }>;
    derniere_synchronisation: {
        date: string | null;
        nb_pharmacies: number;
        statut: string | null;
    };
    timestamp: string;
}

// Service des pharmacies de garde
export const PharmacieGardeService = {

    /**
     * Récupère toutes les pharmacies de garde
     */
    async getAllPharmacies(options?: { date?: string; limit?: number }): Promise<PharmacieResponse> {
        try {
            const params = new URLSearchParams();
            if (options?.date) params.append('date', options.date);
            if (options?.limit) params.append('limit', options.limit.toString());

            const response = await apiClient.get<PharmacieResponse>(`/pharmacies?${params}`);
            return response.data;
        } catch (error) {
            console.error('Erreur getAllPharmacies:', error);
            throw error;
        }
    },

    /**
     * Récupère les pharmacies d'une commune
     */
    async getPharmaciesByCommune(commune: string): Promise<PharmacieResponse> {
        try {
            const response = await apiClient.get<PharmacieResponse>(`/pharmacies/${commune}`);
            return response.data;
        } catch (error) {
            console.error('Erreur getPharmaciesByCommune:', error);
            throw error;
        }
    },

    /**
     * Recherche de pharmacies
     */
    async searchPharmacies(query: string, commune?: string): Promise<PharmacieResponse> {
        try {
            const params = new URLSearchParams({ q: query });
            if (commune) params.append('commune', commune);

            const response = await apiClient.get<PharmacieResponse>(`/pharmacies/search?${params}`);
            return response.data;
        } catch (error) {
            console.error('Erreur searchPharmacies:', error);
            throw error;
        }
    },

    /**
     * Trouve les pharmacies les plus proches
     */
    async getNearestPharmacies(
        latitude: number,
        longitude: number,
        limit: number = 5
    ): Promise<PharmacieResponse> {
        try {
            const response = await apiClient.post<PharmacieResponse>('/pharmacies/nearest', {
                latitude,
                longitude,
                limit
            });
            return response.data;
        } catch (error) {
            console.error('Erreur getNearestPharmacies:', error);
            throw error;
        }
    },

    /**
     * Récupère la liste des communes disponibles
     */
    async getCommunes(): Promise<CommunesResponse> {
        try {
            const response = await apiClient.get<CommunesResponse>('/communes');
            return response.data;
        } catch (error) {
            console.error('Erreur getCommunes:', error);
            throw error;
        }
    },

    /**
     * Force une synchronisation
     */
    async forceSync(method: 'auto' | 'selenium' | 'requests' | 'api' = 'auto'): Promise<any> {
        try {
            const response = await apiClient.post('/sync', { method });
            return response.data;
        } catch (error) {
            console.error('Erreur forceSync:', error);
            throw error;
        }
    },

    /**
     * Récupère les statistiques
     */
    async getStats(): Promise<StatsResponse> {
        try {
            const response = await apiClient.get<StatsResponse>('/stats');
            return response.data;
        } catch (error) {
            console.error('Erreur getStats:', error);
            throw error;
        }
    },

    /**
     * Vérifie l'état du service
     */
    async checkHealth(): Promise<{ status: string; timestamp: string; database: string }> {
        try {
            const response = await apiClient.get('/health');
            return response.data;
        } catch (error) {
            console.error('Erreur checkHealth:', error);
            throw error;
        }
    }
};

export default PharmacieGardeService;
