/**
 * Hook personnalisé pour gérer les pharmacies de garde
 */

import { useState, useEffect } from 'react';
import { PharmacieGardeService, PharmacieGarde } from '@/services/PharmacieGardeService';
import { toast } from 'sonner';

export function usePharmaciesGarde(commune?: string) {
    const [pharmacies, setPharmacies] = useState<PharmacieGarde[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const loadPharmacies = async (selectedCommune?: string) => {
        setLoading(true);
        setError(null);

        try {
            const data = selectedCommune
                ? await PharmacieGardeService.getPharmaciesByCommune(selectedCommune)
                : await PharmacieGardeService.getAllPharmacies();

            setPharmacies(data.pharmacies || []);
        } catch (err: any) {
            const errorMessage = err.message || 'Erreur lors du chargement des pharmacies';
            setError(errorMessage);
            toast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadPharmacies(commune);
    }, [commune]);

    return { pharmacies, loading, error, loadPharmacies, setPharmacies };
}

export function useNearestPharmacies() {
    const [pharmacies, setPharmacies] = useState<PharmacieGarde[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const findNearest = async (limit: number = 5) => {
        setLoading(true);
        setError(null);

        if (!navigator.geolocation) {
            const errorMsg = 'La géolocalisation n\'est pas supportée par votre navigateur';
            setError(errorMsg);
            toast.error(errorMsg);
            setLoading(false);
            return;
        }

        navigator.geolocation.getCurrentPosition(
            async (position) => {
                try {
                    const data = await PharmacieGardeService.getNearestPharmacies(
                        position.coords.latitude,
                        position.coords.longitude,
                        limit
                    );
                    setPharmacies(data.pharmacies || []);
                    toast.success(`${data.pharmacies.length} pharmacie(s) trouvée(s) près de vous`);
                } catch (err: any) {
                    const errorMessage = err.message || 'Erreur lors de la recherche';
                    setError(errorMessage);
                    toast.error(errorMessage);
                } finally {
                    setLoading(false);
                }
            },
            (err) => {
                const errorMsg = 'Impossible d\'obtenir votre position. Veuillez autoriser la géolocalisation.';
                setError(errorMsg);
                toast.error(errorMsg);
                setLoading(false);
            }
        );
    };

    return { pharmacies, loading, error, findNearest };
}

export function useCommunes() {
    const [communes, setCommunes] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const loadCommunes = async () => {
            setLoading(true);
            try {
                const data = await PharmacieGardeService.getCommunes();
                setCommunes(data.communes || []);
            } catch (err: any) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        loadCommunes();
    }, []);

    return { communes, loading, error };
}

export function usePharmacieStats() {
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const loadStats = async () => {
        setLoading(true);
        setError(null);

        try {
            const data = await PharmacieGardeService.getStats();
            setStats(data);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadStats();
    }, []);

    return { stats, loading, error, refresh: loadStats };
}
