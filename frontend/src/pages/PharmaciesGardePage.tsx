import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { realPharmacies, communes as communesList } from '@/data/pharmacyData';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
    MapPin,
    Search,
    AlertCircle,
    Phone,
    Clock,
    Building2,
    ArrowLeft,
    Navigation,
    Star,
    Truck,
    CreditCard,
    Verified
} from 'lucide-react';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import LeafletMap from '@/components/maps/LeafletMap';
import { toast } from 'sonner';

// Haversine formula for distance in KM
const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371; // Radius of the earth in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const d = R * c;
    return d;
};

export default function PharmaciesGardePage() {
    const navigate = useNavigate();
    const [selectedCommune, setSelectedCommune] = useState<string>('Toutes');
    const [searchQuery, setSearchQuery] = useState('');
    const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);

    // Get User Position
    useState(() => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (pos) => {
                    setUserLocation({
                        lat: pos.coords.latitude,
                        lng: pos.coords.longitude
                    });
                    toast.success("Position récupérée — Pharmacies triées par proximité");
                },
                () => {
                    console.warn("Geolocation blocked or failed");
                }
            );
        }
    });

    // Known Commune Centers for fallback/mock coords
    const communeCoords: { [key: string]: [number, number] } = {
        "Plateau": [5.3200, -4.0200],
        "Cocody": [5.3600, -3.9800],
        "Adjamé": [5.3500, -4.0300],
        "Marcory": [5.2900, -3.9900],
        "Treichville": [5.2800, -4.0100],
        "Yopougon": [5.3400, -4.0900],
        "Abobo": [5.4200, -4.0200],
        "Koumassi": [5.2900, -3.9500],
        "Port-Bouët": [5.2500, -3.9200],
        "Attécoubé": [5.3300, -4.0500],
        "Bingerville": [5.3600, -3.8900],
        "Anyama": [5.4900, -4.0500]
    };

    const getPharmacyCoords = (pharmacy: typeof realPharmacies[0]) => {
        const coords = communeCoords[pharmacy.commune] || [5.345317, -4.024429];
        const [lat, lng] = coords;
        return {
            lat: lat + (pharmacy.id * 0.0005), // unique offset
            lng: lng + ((pharmacy.id % 7) * 0.0005)
        };
    };

    // Filter pharmacies that are on guard or open 24h
    const gardePharmacies = useMemo(() => {
        return realPharmacies.filter(p => p.isOnGuard || p.hours.toLowerCase().includes("24h"));
    }, []);

    // Apply search and commune filters + DISTANCE SORT
    const filteredPharmacies = useMemo(() => {
        const filtered = gardePharmacies.filter(p => {
            const matchesSearch = !searchQuery ||
                p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                p.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
                p.commune.toLowerCase().includes(searchQuery.toLowerCase());

            const matchesCommune = selectedCommune === 'Toutes' || p.commune === selectedCommune;

            return matchesSearch && matchesCommune;
        });

        // Add calculated distances if userLocation available
        const withDistances = filtered.map(p => {
            const pCoords = getPharmacyCoords(p);
            const dist = userLocation
                ? calculateDistance(userLocation.lat, userLocation.lng, pCoords.lat, pCoords.lng)
                : parseFloat(p.distance.replace(' km', '').replace(',', '.')); // fallback to mock distance

            return { ...p, calculatedDistance: dist, coords: pCoords };
        });

        // Sort by distance
        return withDistances.sort((a, b) => a.calculatedDistance - b.calculatedDistance);
    }, [gardePharmacies, searchQuery, selectedCommune, userLocation]);

    const nearestPharmacyId = useMemo(() => {
        if (filteredPharmacies.length === 0) return null;
        return filteredPharmacies[0].id;
    }, [filteredPharmacies]);

    const mapMarkers = useMemo(() => {
        const markers: any[] = filteredPharmacies.map(p => ({
            lat: p.coords.lat,
            lng: p.coords.lng,
            label: p.name,
            description: `${p.address} • ${p.calculatedDistance.toFixed(1)} km`
        }));

        if (userLocation) {
            markers.push({
                ...userLocation,
                label: "Vous êtes ici",
                isUser: true
            });
        }
        return markers;
    }, [filteredPharmacies, userLocation]);

    const handleCall = (phone: string) => {
        window.location.href = `tel:${phone}`;
    };

    const handleGetDirections = (pharmacy: any) => {
        const { lat, lng } = pharmacy.coords;

        const mapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&destination_place_id=${encodeURIComponent(pharmacy.name)}`;
        window.open(mapsUrl, '_blank');
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
            {/* Header */}
            <div className="bg-gradient-to-r from-primary to-secondary text-white py-12">
                <div className="container mx-auto px-4">
                    <div className="flex items-center gap-4 mb-4">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => navigate('/')}
                            className="text-white hover:bg-white/10"
                        >
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Retour
                        </Button>
                    </div>
                    <div className="max-w-4xl mx-auto text-center">
                        <h1 className="text-4xl md:text-5xl font-bold mb-4">
                            🏥 Pharmacies de Garde
                        </h1>
                        <p className="text-xl text-white/90 mb-2">
                            Abidjan - Côte d'Ivoire
                        </p>
                        <p className="text-white/80">
                            Trouvez rapidement une pharmacie de garde près de chez vous
                        </p>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 py-8 -mt-8">
                {/* Map Integration */}
                <Card className="mb-8 overflow-hidden border-primary/20 shadow-xl">
                    <LeafletMap
                        position={userLocation}
                        markers={mapMarkers}
                        height="400px"
                        zoom={userLocation ? 14 : 12}
                    />
                </Card>

                {/* Search and Filters */}
                <Card className="mb-8">
                    <CardHeader>
                        <CardTitle>Rechercher une pharmacie</CardTitle>
                        <CardDescription>
                            Utilisez les filtres ci-dessous pour trouver une pharmacie de garde
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Search Input */}
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                <Input
                                    placeholder="Rechercher par nom, quartier, adresse..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pl-10"
                                />
                            </div>

                            {/* Commune Select */}
                            <Select value={selectedCommune} onValueChange={setSelectedCommune}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Toutes les communes" />
                                </SelectTrigger>
                                <SelectContent>
                                    {communesList.map((commune) => (
                                        <SelectItem key={commune} value={commune}>
                                            {commune === "Toutes" ? "Toutes les communes" : commune}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Active Filters */}
                        <div className="flex flex-wrap gap-2">
                            {selectedCommune !== "Toutes" && (
                                <Badge variant="secondary" className="cursor-pointer" onClick={() => setSelectedCommune('Toutes')}>
                                    {selectedCommune} ✕
                                </Badge>
                            )}
                            {searchQuery && (
                                <Badge variant="secondary" className="cursor-pointer" onClick={() => setSearchQuery('')}>
                                    "{searchQuery}" ✕
                                </Badge>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Results */}
                {filteredPharmacies.length === 0 ? (
                    <Card>
                        <CardContent className="pt-12 pb-12 text-center">
                            <Building2 className="h-16 w-16 text-slate-300 mx-auto mb-4" />
                            <h3 className="text-xl font-semibold text-slate-900 mb-2">
                                Aucune pharmacie trouvée
                            </h3>
                            <p className="text-slate-600 mb-4">
                                Essayez de modifier vos critères de recherche
                            </p>
                            <Button
                                onClick={() => {
                                    setSelectedCommune('Toutes');
                                    setSearchQuery('');
                                }}
                                variant="outline"
                            >
                                Réinitialiser les filtres
                            </Button>
                        </CardContent>
                    </Card>
                ) : (
                    <>
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-2xl font-bold text-slate-900">
                                Pharmacies de garde
                            </h2>
                            <Badge variant="outline" className="text-lg px-4 py-2">
                                {filteredPharmacies.length} résultat{filteredPharmacies.length > 1 ? 's' : ''}
                            </Badge>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filteredPharmacies.map((pharmacy) => (
                                <Card
                                    key={pharmacy.id}
                                    className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-secondary/30 bg-gradient-to-br from-card to-secondary/5"
                                >
                                    <CardHeader>
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <CardTitle className="text-lg group-hover:text-primary transition-colors">
                                                        {pharmacy.name}
                                                    </CardTitle>
                                                    {pharmacy.isPartner && (
                                                        <Verified className="h-5 w-5 text-primary" />
                                                    )}
                                                </div>

                                                <div className="flex flex-wrap gap-2">
                                                    <Badge className="bg-secondary/10 text-secondary border-secondary/20">
                                                        🟢 Ouverte 24h/24
                                                    </Badge>
                                                    {pharmacy.id === nearestPharmacyId && (
                                                        <Badge className="bg-orange-500 text-white border-none animate-pulse">
                                                            🚀 Plus proche
                                                        </Badge>
                                                    )}
                                                    {pharmacy.hasDelivery && (
                                                        <Badge className="bg-primary/10 text-primary border-primary/20">
                                                            <Truck className="h-3 w-3 mr-1" />
                                                            Livraison
                                                        </Badge>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-1">
                                                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                                                <span className="text-sm font-medium">{pharmacy.rating}</span>
                                            </div>
                                        </div>
                                    </CardHeader>

                                    <CardContent className="space-y-4">
                                        <div className="space-y-3">
                                            <div className="flex items-start gap-2">
                                                <MapPin className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                                                <div className="text-sm">
                                                    <div>{pharmacy.address}</div>
                                                    <div className="text-muted-foreground">
                                                        {pharmacy.commune} • {pharmacy.calculatedDistance.toFixed(1)} km
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-2 text-sm">
                                                <Phone className="h-4 w-4 text-secondary" />
                                                <span>{pharmacy.phone}</span>
                                            </div>

                                            <div className="flex items-center gap-2 text-sm">
                                                <Clock className="h-4 w-4 text-accent" />
                                                <span className="font-semibold text-secondary">{pharmacy.hours}</span>
                                            </div>
                                        </div>

                                        {pharmacy.specialties && pharmacy.specialties.length > 0 && (
                                            <div>
                                                <h4 className="text-sm font-semibold mb-2">Spécialités</h4>
                                                <div className="flex flex-wrap gap-1">
                                                    {pharmacy.specialties.map(specialty => (
                                                        <Badge key={specialty} variant="outline" className="text-xs">
                                                            {specialty}
                                                        </Badge>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        <div className="flex gap-2 pt-2">
                                            <Button
                                                size="sm"
                                                className="flex-1"
                                                onClick={() => handleCall(pharmacy.phone)}
                                            >
                                                <Phone className="h-4 w-4 mr-2" />
                                                Appeler
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="flex-1"
                                                onClick={() => handleGetDirections(pharmacy)}
                                            >
                                                <Navigation className="h-4 w-4 mr-2" />
                                                Itinéraire
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </>
                )}

                {/* Emergency Notice */}
                <Card className="mt-12 bg-accent/10 border-accent/20">
                    <CardContent className="pt-6">
                        <div className="flex items-start gap-3">
                            <AlertCircle className="h-6 w-6 text-accent flex-shrink-0 mt-0.5" />
                            <div>
                                <h3 className="font-semibold text-accent mb-2">Information importante</h3>
                                <p className="text-sm">
                                    En cas d'urgence médicale grave, contactez le <strong>SAMU au 185</strong> ou
                                    rendez-vous directement aux urgences de l'hôpital le plus proche.
                                    Les pharmacies de garde sont ouvertes pour les besoins pharmaceutiques urgents.
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
