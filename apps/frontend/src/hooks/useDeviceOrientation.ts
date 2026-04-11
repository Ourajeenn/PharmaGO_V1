import { useState, useEffect } from 'react';

export interface DeviceOrientation {
    alpha: number | null; // Z-axis rotation (0-360)
    beta: number | null;  // X-axis rotation (-180 to 180)
    gamma: number | null; // Y-axis rotation (-90 to 90)
    absolute: boolean;
}

export const useDeviceOrientation = () => {
    const [orientation, setOrientation] = useState<DeviceOrientation>({
        alpha: null,
        beta: null,
        gamma: null,
        absolute: false,
    });
    const [error, setError] = useState<string | null>(null);
    const [permission, setPermission] = useState<'granted' | 'denied' | 'prompt'>('prompt');

    useEffect(() => {
        // Check if DeviceOrientation API is supported
        if (!window.DeviceOrientationEvent) {
            setError('L\'orientation de l\'appareil n\'est pas supportée');
            return;
        }

        const handleOrientation = (event: DeviceOrientationEvent) => {
            setOrientation({
                alpha: event.alpha,
                beta: event.beta,
                gamma: event.gamma,
                absolute: event.absolute,
            });
        };

        // Request permission for iOS 13+
        const requestPermission = async () => {
            if (typeof (DeviceOrientationEvent as any).requestPermission === 'function') {
                try {
                    const perm = await (DeviceOrientationEvent as any).requestPermission();
                    setPermission(perm);
                    if (perm === 'granted') {
                        window.addEventListener('deviceorientation', handleOrientation);
                    } else {
                        setError('Permission refusée pour l\'orientation de l\'appareil');
                    }
                } catch (err) {
                    setError('Erreur lors de la demande de permission');
                    console.error(err);
                }
            } else {
                // For non-iOS devices or older iOS versions
                setPermission('granted');
                window.addEventListener('deviceorientation', handleOrientation);
            }
        };

        requestPermission();

        return () => {
            window.removeEventListener('deviceorientation', handleOrientation);
        };
    }, []);

    const calculateCompassHeading = (): number => {
        if (orientation.alpha === null) return 0;

        // Adjust for device orientation
        let heading = orientation.alpha;

        // Adjust based on screen orientation
        if (window.screen && (window.screen as any).orientation) {
            const screenOrientation = (window.screen as any).orientation.angle || 0;
            heading = (heading - screenOrientation + 360) % 360;
        }

        return heading;
    };

    return {
        orientation,
        error,
        permission,
        compassHeading: calculateCompassHeading(),
    };
};
