import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MapPin, Navigation, Crosshair, Compass } from 'lucide-react';
import { useGeolocation } from '@/hooks/useGeolocation';
import { useDeviceOrientation } from '@/hooks/useDeviceOrientation';

interface Pharmacy {
    id: string;
    name: string;
    address: string;
    lat: number;
    lng: number;
    distance: number;
    isOnDuty: boolean;
}

interface ARPharmacyFinderProps {
    pharmacies: Pharmacy[];
}

export const ARPharmacyFinder = ({ pharmacies }: ARPharmacyFinderProps) => {
    const [isARMode, setIsARMode] = useState(false);
    const [selectedPharmacy, setSelectedPharmacy] = useState<Pharmacy | null>(null);
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const { position } = useGeolocation({ watch: true });
    const { compassHeading, permission } = useDeviceOrientation();

    useEffect(() => {
        if (isARMode) {
            startCamera();
        } else {
            stopCamera();
        }

        return () => stopCamera();
    }, [isARMode]);

    const startCamera = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: {
                    facingMode: 'environment',
                    width: { ideal: 1280 },
                    height: { ideal: 720 },
                },
            });

            if (videoRef.current) {
                videoRef.current.srcObject = stream;
            }
        } catch (error) {
            console.error('Camera access denied:', error);
        }
    };

    const stopCamera = () => {
        if (videoRef.current && videoRef.current.srcObject) {
            const stream = videoRef.current.srcObject as MediaStream;
            stream.getTracks().forEach((track) => track.stop());
            videoRef.current.srcObject = null;
        }
    };

    const calculateBearing = (lat1: number, lon1: number, lat2: number, lon2: number) => {
        const toRad = (deg: number) => (deg * Math.PI) / 180;
        const toDeg = (rad: number) => (rad * 180) / Math.PI;

        const dLon = toRad(lon2 - lon1);
        const y = Math.sin(dLon) * Math.cos(toRad(lat2));
        const x =
            Math.cos(toRad(lat1)) * Math.sin(toRad(lat2)) -
            Math.sin(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.cos(dLon);

        let bearing = toDeg(Math.atan2(y, x));
        bearing = (bearing + 360) % 360;
        return bearing;
    };

    const renderAROverlay = () => {
        if (!canvasRef.current || !position) return;

        const ctx = canvasRef.current.getContext('2d');
        if (!ctx) return;

        // Clear canvas
        ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);

        // Set canvas size to match video
        if (videoRef.current) {
            canvasRef.current.width = videoRef.current.videoWidth;
            canvasRef.current.height = videoRef.current.videoHeight;
        }

        // Draw pharmacy markers
        pharmacies.forEach((pharmacy) => {
            const bearing = calculateBearing(
                position.latitude,
                position.longitude,
                pharmacy.lat,
                pharmacy.lng
            );

            // Calculate relative bearing to compass heading
            const relativeBearing = (bearing - compassHeading + 360) % 360;

            // Only show pharmacies in front (±45 degrees)
            if (relativeBearing > 315 || relativeBearing < 45) {
                const centerX = canvasRef.current!.width / 2;
                const horizontalOffset = ((relativeBearing - 360) % 360) * 5;

                // Draw marker
                ctx.save();
                ctx.translate(centerX + horizontalOffset, 150);

                // Draw arrow
                ctx.fillStyle = pharmacy.isOnDuty ? '#10B981' : '#3B82F6';
                ctx.beginPath();
                ctx.moveTo(0, 0);
                ctx.lineTo(-15, 30);
                ctx.lineTo(15, 30);
                ctx.closePath();
                ctx.fill();

                // Draw pharmacy info
                ctx.fillStyle = 'white';
                ctx.fillRect(-80, 35, 160, 60);

                ctx.fillStyle = 'black';
                ctx.font = 'bold 14px Arial';
                ctx.textAlign = 'center';
                ctx.fillText(pharmacy.name, 0, 52);

                ctx.font = '12px Arial';
                ctx.fillText(`${pharmacy.distance.toFixed(0)}m`, 0, 70);

                if (pharmacy.isOnDuty) {
                    ctx.fillStyle = '#10B981';
                    ctx.fillText('🏥 De garde', 0, 88);
                }

                ctx.restore();
            }
        });
    };

    useEffect(() => {
        if (isARMode) {
            const interval = setInterval(renderAROverlay, 100);
            return () => clearInterval(interval);
        }
    }, [isARMode, position, compassHeading, pharmacies]);

    if (permission === 'denied') {
        return (
            <Card className="border-destructive/50">
                <CardContent className="pt-6">
                    <p className="text-sm text-destructive text-center">
                        L'accès à la caméra et aux capteurs est requis pour le mode AR
                    </p>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Compass className="h-5 w-5" />
                    Mode Réalité Augmentée
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                {!isARMode ? (
                    <div className="space-y-4">
                        <p className="text-sm text-muted-foreground">
                            Utilisez la caméra de votre appareil pour voir les pharmacies autour de vous en réalité augmentée.
                        </p>
                        <Button onClick={() => setIsARMode(true)} className="w-full">
                            <Crosshair className="h-4 w-4 mr-2" />
                            Activer le mode AR
                        </Button>
                    </div>
                ) : (
                    <div className="space-y-4">
                        <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
                            <video
                                ref={videoRef}
                                autoPlay
                                playsInline
                                className="w-full h-full object-cover"
                            />
                            <canvas
                                ref={canvasRef}
                                className="absolute top-0 left-0 w-full h-full"
                            />

                            {/* Compass indicator */}
                            <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
                                <Compass className="inline h-4 w-4 mr-1" />
                                {compassHeading.toFixed(0)}°
                            </div>

                            {/* Distance to selected pharmacy */}
                            {selectedPharmacy && (
                                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-primary text-white px-4 py-2 rounded-lg">
                                    <p className="font-bold">{selectedPharmacy.name}</p>
                                    <p className="text-sm">{selectedPharmacy.distance.toFixed(0)}m</p>
                                </div>
                            )}
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                            <Button
                                onClick={() => setIsARMode(false)}
                                variant="outline"
                            >
                                Quitter AR
                            </Button>
                            <Button variant="outline">
                                <Navigation className="h-4 w-4 mr-2" />
                                Itinéraire
                            </Button>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
};
