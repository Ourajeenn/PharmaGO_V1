import { useEffect, useRef, useState } from 'react';
import { useGeolocation } from '@/hooks/useGeolocation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MapPin, Navigation, Loader2 } from 'lucide-react';

interface LiveMapProps {
    driverLocation?: { lat: number; lng: number };
    destinationLocation: { lat: number; lng: number };
    onDirectionsClick?: () => void;
}

export const LiveMap = ({ driverLocation, destinationLocation, onDirectionsClick }: LiveMapProps) => {
    const mapRef = useRef<HTMLDivElement>(null);
    const googleMapRef = useRef<google.maps.Map | null>(null);
    const driverMarkerRef = useRef<google.maps.Marker | null>(null);
    const destinationMarkerRef = useRef<google.maps.Marker | null>(null);
    const directionsRendererRef = useRef<google.maps.DirectionsRenderer | null>(null);
    const [eta, setEta] = useState<string>('');
    const [distance, setDistance] = useState<string>('');
    const { position } = useGeolocation({ watch: true });

    useEffect(() => {
        if (!mapRef.current) return;

        // Initialize Google Map
        const initMap = () => {
            const map = new google.maps.Map(mapRef.current!, {
                center: driverLocation || destinationLocation,
                zoom: 14,
                disableDefaultUI: false,
                zoomControl: true,
                mapTypeControl: false,
                streetViewControl: false,
                fullscreenControl: true,
                styles: [
                    {
                        featureType: 'poi',
                        elementType: 'labels',
                        stylers: [{ visibility: 'off' }],
                    },
                ],
            });

            googleMapRef.current = map;

            // Add destination marker
            destinationMarkerRef.current = new google.maps.Marker({
                position: destinationLocation,
                map,
                icon: {
                    path: google.maps.SymbolPath.CIRCLE,
                    scale: 10,
                    fillColor: '#10B981',
                    fillOpacity: 1,
                    strokeColor: '#FFFFFF',
                    strokeWeight: 2,
                },
                title: 'Destination',
            });

            // Initialize directions renderer
            directionsRendererRef.current = new google.maps.DirectionsRenderer({
                map,
                suppressMarkers: true,
                polylineOptions: {
                    strokeColor: '#0EA5E9',
                    strokeWeight: 5,
                },
            });
        };

        // Load Google Maps script
        if (!window.google) {
            const script = document.createElement('script');
            script.src = `https://maps.googleapis.com/maps/api/js?key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY}&libraries=places,geometry`;
            script.async = true;
            script.defer = true;
            script.onload = initMap;
            document.head.appendChild(script);
        } else {
            initMap();
        }
    }, []);

    useEffect(() => {
        if (!googleMapRef.current || !driverLocation) return;

        // Update or create driver marker
        if (driverMarkerRef.current) {
            driverMarkerRef.current.setPosition(driverLocation);
        } else {
            driverMarkerRef.current = new google.maps.Marker({
                position: driverLocation,
                map: googleMapRef.current,
                icon: {
                    url: '/driver-icon.svg',
                    scaledSize: new google.maps.Size(40, 40),
                },
                title: 'Livreur',
                animation: google.maps.Animation.DROP,
            });
        }

        // Calculate and display route
        if (directionsRendererRef.current) {
            const directionsService = new google.maps.DirectionsService();
            directionsService.route(
                {
                    origin: driverLocation,
                    destination: destinationLocation,
                    travelMode: google.maps.TravelMode.DRIVING,
                    drivingOptions: {
                        departureTime: new Date(),
                        trafficModel: google.maps.TrafficModel.BEST_GUESS,
                    },
                },
                (result, status) => {
                    if (status === 'OK' && result) {
                        directionsRendererRef.current!.setDirections(result);

                        // Extract ETA and distance
                        const leg = result.routes[0].legs[0];
                        setEta(leg.duration?.text || '');
                        setDistance(leg.distance?.text || '');
                    }
                }
            );
        }

        // Center map to show both markers
        const bounds = new google.maps.LatLngBounds();
        bounds.extend(driverLocation);
        bounds.extend(destinationLocation);
        googleMapRef.current.fitBounds(bounds);
    }, [driverLocation, destinationLocation]);

    return (
        <Card className="w-full">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Navigation className="h-5 w-5" />
                    Suivi en temps réel
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div
                    ref={mapRef}
                    className="w-full h-[400px] rounded-lg overflow-hidden"
                />

                {driverLocation && (
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-primary/10 p-3 rounded-lg">
                            <p className="text-xs text-muted-foreground">Temps estimé</p>
                            <p className="text-lg font-bold text-primary">{eta || <Loader2 className="h-4 w-4 animate-spin" />}</p>
                        </div>
                        <div className="bg-secondary/10 p-3 rounded-lg">
                            <p className="text-xs text-muted-foreground">Distance</p>
                            <p className="text-lg font-bold text-secondary">{distance || <Loader2 className="h-4 w-4 animate-spin" />}</p>
                        </div>
                    </div>
                )}

                {!driverLocation && (
                    <div className="text-center py-8">
                        <MapPin className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
                        <p className="text-sm text-muted-foreground">
                            En attente d'attribution du livreur...
                        </p>
                    </div>
                )}

                {onDirectionsClick && (
                    <Button
                        onClick={onDirectionsClick}
                        className="w-full"
                        variant="outline"
                    >
                        <Navigation className="h-4 w-4 mr-2" />
                        Ouvrir dans Google Maps
                    </Button>
                )}
            </CardContent>
        </Card>
    );
};
