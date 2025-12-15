import { useState, useEffect } from 'react';

export interface GeolocationPosition {
    latitude: number;
    longitude: number;
    accuracy: number;
    altitude: number | null;
    altitudeAccuracy: number | null;
    heading: number | null;
    speed: number | null;
    timestamp: number;
}

export interface GeolocationError {
    code: number;
    message: string;
}

export interface UseGeolocationOptions {
    enableHighAccuracy?: boolean;
    timeout?: number;
    maximumAge?: number;
    watch?: boolean;
}

export const useGeolocation = (options: UseGeolocationOptions = {}) => {
    const {
        enableHighAccuracy = true,
        timeout = 10000,
        maximumAge = 0,
        watch = false,
    } = options;

    const [position, setPosition] = useState<GeolocationPosition | null>(null);
    const [error, setError] = useState<GeolocationError | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!navigator.geolocation) {
            setError({
                code: 0,
                message: 'La géolocalisation n\'est pas supportée par votre navigateur',
            });
            setLoading(false);
            return;
        }

        const handleSuccess = (pos: GeolocationPosition) => {
            setPosition({
                latitude: pos.coords.latitude,
                longitude: pos.coords.longitude,
                accuracy: pos.coords.accuracy,
                altitude: pos.coords.altitude,
                altitudeAccuracy: pos.coords.altitudeAccuracy,
                heading: pos.coords.heading,
                speed: pos.coords.speed,
                timestamp: pos.timestamp,
            });
            setError(null);
            setLoading(false);
        };

        const handleError = (err: GeolocationPositionError) => {
            setError({
                code: err.code,
                message: err.message,
            });
            setLoading(false);
        };

        const geoOptions: PositionOptions = {
            enableHighAccuracy,
            timeout,
            maximumAge,
        };

        let watchId: number | undefined;

        if (watch) {
            watchId = navigator.geolocation.watchPosition(
                handleSuccess,
                handleError,
                geoOptions
            );
        } else {
            navigator.geolocation.getCurrentPosition(
                handleSuccess,
                handleError,
                geoOptions
            );
        }

        return () => {
            if (watchId !== undefined) {
                navigator.geolocation.clearWatch(watchId);
            }
        };
    }, [enableHighAccuracy, timeout, maximumAge, watch]);

    return { position, error, loading };
};
