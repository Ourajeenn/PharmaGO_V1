import { useState, useEffect } from 'react';
import biometrics from '@/lib/biometrics';
import { toast } from 'sonner';

export const useBiometrics = (userId: string | undefined, userName: string | undefined) => {
    const [isAvailable, setIsAvailable] = useState(false);
    const [isEnabled, setIsEnabled] = useState(false);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const checkAvailability = async () => {
            if (!window.PublicKeyCredential) {
                setIsAvailable(false);
                setIsLoading(false);
                return;
            }

            try {
                // Check availability
                // If localhost, force available for simulation
                const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
                const platformAuth = await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();

                setIsAvailable(platformAuth || isLocal);

                // Check if user has enabled it previously
                const storedEnabled = localStorage.getItem(`biometrics_enabled_${userId}`);
                setIsEnabled(storedEnabled === 'true');

                // If enabled, we start as NOT authenticated (locked)
                // If disabled, we are considered authenticated by default (no lock)
                setIsAuthenticated(storedEnabled !== 'true');

            } catch (error) {
                console.error('Error checking biometrics:', error);
                setIsAvailable(false);
            } finally {
                setIsLoading(false);
            }
        };

        if (userId) {
            checkAvailability();
        }
    }, [userId]);

    const enableBiometrics = async () => {
        if (!userId || !userName) return false;

        try {
            // If already has credential, just enable flag? 
            // Better to re-register or verify to confirm ownership now.
            // Let's force verify or register.

            // Try to register new credential to ensure it works
            await biometrics.register(userId, userName);

            localStorage.setItem(`biometrics_enabled_${userId}`, 'true');
            setIsEnabled(true);
            toast.success('Authentification biométrique activée');
            return true;
        } catch (error: any) {
            console.error('Failed to enable biometrics:', error);
            toast.error(error.message || "Erreur d'activation");
            return false;
        }
    };

    const disableBiometrics = () => {
        if (!userId) return;
        localStorage.removeItem(`biometrics_enabled_${userId}`);
        setIsEnabled(false);
        setIsAuthenticated(true); // Disabling lock obviously unlocks app
        toast.info('Authentification biométrique désactivée');
    };

    const unlock = async () => {
        if (!userId) return false;

        try {
            const success = await biometrics.authenticate(userId);
            if (success) {
                setIsAuthenticated(true);
                toast.success('Déverrouillé');
            }
            return success;
        } catch (error: any) {
            console.error('Unlock failed:', error);
            toast.error(error.message || "Echec du déverrouillage");
            return false;
        }
    };

    const lock = () => {
        setIsAuthenticated(false);
    };

    return {
        isAvailable,
        isEnabled,
        isAuthenticated,
        isLoading,
        enableBiometrics,
        disableBiometrics,
        unlock,
        lock
    };
};
