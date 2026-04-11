import React, { createContext, useContext, useState, useEffect } from 'react';
import biometrics from '@/lib/biometrics';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';

interface BiometricsContextType {
    isAvailable: boolean;
    isEnabled: boolean;
    isAuthenticated: boolean;
    isLoading: boolean;
    enableBiometrics: () => Promise<boolean>;
    disableBiometrics: () => void;
    unlock: () => Promise<boolean>;
    lock: () => void;
}

const BiometricsContext = createContext<BiometricsContextType | undefined>(undefined);

export const BiometricsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { user, profile } = useAuth();
    const userId = user?.id;
    const userName = profile?.name;

    const [isAvailable, setIsAvailable] = useState(false);
    const [isEnabled, setIsEnabled] = useState(false);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const checkAvailability = async () => {
            if (!userId) {
                setIsLoading(false);
                return;
            }

            if (!window.PublicKeyCredential) {
                setIsAvailable(false);
                setIsLoading(false);
                return;
            }

            try {
                // Check if platform authenticator is available (FaceID/TouchID)
                const available = await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
                setIsAvailable(available);

                // Check if user has enabled it
                const storedEnabled = localStorage.getItem(`biometrics_enabled_${userId}`);
                const enabled = storedEnabled === 'true';
                setIsEnabled(enabled);

                // If enabled, we start locked (isAuthenticated = false)
                // If disabled, we are authenticated by default
                setIsAuthenticated(!enabled);

            } catch (error) {
                console.error('Error checking biometrics:', error);
                setIsAvailable(false);
            } finally {
                setIsLoading(false);
            }
        };

        checkAvailability();
    }, [userId]);

    const enableBiometrics = async () => {
        if (!userId || !userName) {
            toast.error("Utilisateur non identifié");
            return false;
        }

        try {
            // Verify ownership effectively by simulating authentication
            // We use registration to ensure it works and prompt the user
            await biometrics.register(userId, userName);

            localStorage.setItem(`biometrics_enabled_${userId}`, 'true');
            setIsEnabled(true);
            setIsAuthenticated(true); // Don't lock immediately after enabling
            toast.success('Authentification biométrique activée');
            return true;
        } catch (error: any) {
            console.error('Failed to enable biometrics:', error);

            // Fallback for demo/dev if real webauthn fails (e.g. no https/localhost issues)
            // In a real app we wouldn't do this, but for this demo environment:
            if (location.hostname === 'localhost') {
                localStorage.setItem(`biometrics_enabled_${userId}`, 'true');
                setIsEnabled(true);
                setIsAuthenticated(true);
                toast.success('Simulation: Biométrie activée (Dev Mode)');
                return true;
            }

            toast.error(error.message || "Erreur d'activation");
            return false;
        }
    };

    const disableBiometrics = () => {
        if (!userId) return;
        localStorage.removeItem(`biometrics_enabled_${userId}`);
        setIsEnabled(false);
        setIsAuthenticated(true); // Unlock if disabled
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

            // Fallback for demo/dev
            if (location.hostname === 'localhost') {
                setIsAuthenticated(true);
                toast.success('Simulation: Déverrouillé (Dev Mode)');
                return true;
            }

            toast.error(error.message || "Echec du déverrouillage");
            return false;
        }
    };

    const lock = () => {
        if (isEnabled) {
            setIsAuthenticated(false);
            toast.info('Application verrouillée');
        }
    };

    return (
        <BiometricsContext.Provider value={{
            isAvailable,
            isEnabled,
            isAuthenticated,
            isLoading,
            enableBiometrics,
            disableBiometrics,
            unlock,
            lock
        }}>
            {children}
        </BiometricsContext.Provider>
    );
};

export const useBiometricsContext = () => {
    const context = useContext(BiometricsContext);
    if (!context) {
        throw new Error('useBiometricsContext must be used within a BiometricsProvider');
    }
    return context;
};
