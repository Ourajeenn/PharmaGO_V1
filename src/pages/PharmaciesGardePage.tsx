import { useState } from 'react';
import { usePharmaciesGarde, useNearestPharmacies, useCommunes } from '@/hooks/usePharmaciesGarde';
import { PharmacieCard } from '@/components/pharmacie-garde/PharmacieCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
    MapPin,
    Search,
    Loader2,
    AlertCircle,
    Navigation,
    Phone,
    Clock,
    Building2
} from 'lucide-react';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

export default function PharmaciesGardePage() {
    const [selectedCommune, setSelectedCommune] = useState<string>('');
    const [searchQuery, setSearchQuery] = useState('');

    const { communes } = useCommunes();
    const { pharmacies, loading, error } = usePharmaciesGarde(selectedCommune);
    const {
        pharmacies: nearestPharmacies,
        loading: loadingNearest,
        findNearest
    } = useNearestPharmacies();

    // Filtrer les pharmacies par recherche
    const filteredPharmacies = pharmacies.filter(p => {
        if (!searchQuery) return true;
        const query = searchQuery.toLowerCase();
        return (
            p.nom.toLowerCase().includes(query) ||
            p.quartier?.toLowerCase().includes(query) ||
            p.adresse?.toLowerCase().includes(query)
        );
    });

    const displayPharmacies = nearestPharmacies.length > 0 ? nearestPharmacies : filteredPharmacies;

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-green-600 text-white py-12">
                <div className="container mx-auto px-4">
                    <div className="max-w-4xl mx-auto text-center">
                        <h1 className="text-4xl md:text-5xl font-bold mb-4">
                            🏥 Pharmacies de Garde
                        </h1>
                        <p className="text-xl text-blue-100 mb-2">
                            Abidjan - Côte d'Ivoire
                        </p>
                        <p className="text-blue-100">
                            Trouvez rapidement une pharmacie de garde près de chez vous
                        </p>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 py-8">
                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center gap-3">
                                <div className="p-3 bg-blue-100 rounded-lg">
                                    <Building2 className="h-6 w-6 text-blue-600" />
                                </div>
                                <div>
                                    <p className="text-sm text-slate-600">Total</p>
                                    <p className="text-2xl font-bold">{pharmacies.length}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center gap-3">
                                <div className="p-3 bg-green-100 rounded-lg">
                                    <MapPin className="h-6 w-6 text-green-600" />
                                </div>
                                <div>
                                    <p className="text-sm text-slate-600">Communes</p>
                                    <p className="text-2xl font-bold">{communes.length}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center gap-3">
                                <div className="p-3 bg-orange-100 rounded-lg">
                                    <Clock className="h-6 w-6 text-orange-600" />
                                </div>
                                <div>
                                    <p className="text-sm text-slate-600">Service</p>
                                    <p className="text-lg font-bold">24h/24</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center gap-3">
                                <div className="p-3 bg-purple-100 rounded-lg">
                                    <Phone className="h-6 w-6 text-purple-600" />
                                </div>
                                <div>
                                    <p className="text-sm text-slate-600">Disponible</p>
                                    <p className="text-lg font-bold">Maintenant</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Search and Filters */}
                <Card className="mb-8">
                    <CardHeader>
                        <CardTitle>Rechercher une pharmacie</CardTitle>
                        <CardDescription>
                            Utilisez les filtres ci-dessous pour trouver une pharmacie de garde
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {/* Geolocation Button */}
                        <Button
                            onClick={() => findNearest(5)}
                            disabled={loadingNearest}
                            className="w-full bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 text-white h-12"
                            size="lg"
                        >
                            {loadingNearest ? (
                                <>
                                    <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                                    Recherche en cours...
                                </>
                            ) : (
                                <>
                                    <Navigation className="h-5 w-5 mr-2" />
                                    Trouver les pharmacies les plus proches
                                </>
                            )}
                        </Button>

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
                                    <SelectItem value="">Toutes les communes</SelectItem>
                                    {communes.map((commune) => (
                                        <SelectItem key={commune} value={commune}>
                                            {commune}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Active Filters */}
                        <div className="flex flex-wrap gap-2">
                            {selectedCommune && (
                                <Badge variant="secondary" className="cursor-pointer" onClick={() => setSelectedCommune('')}>
                                    {selectedCommune} ✕
                                </Badge>
                            )}
                            {searchQuery && (
                                <Badge variant="secondary" className="cursor-pointer" onClick={() => setSearchQuery('')}>
                                    "{searchQuery}" ✕
                                </Badge>
                            )}
                            {nearestPharmacies.length > 0 && (
                                <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                                    📍 Près de vous
                                </Badge>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Results */}
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-12">
                        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
                        <p className="text-slate-600">Chargement des pharmacies...</p>
                    </div>
                ) : error ? (
                    <Card className="border-red-200 bg-red-50">
                        <CardContent className="pt-6">
                            <div className="flex items-center gap-3 text-red-700">
                                <AlertCircle className="h-6 w-6" />
                                <div>
                                    <p className="font-semibold">Erreur de chargement</p>
                                    <p className="text-sm">{error}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ) : displayPharmacies.length === 0 ? (
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
                                    setSelectedCommune('');
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
                                {nearestPharmacies.length > 0 ? 'Pharmacies près de vous' : 'Pharmacies de garde'}
                            </h2>
                            <Badge variant="outline" className="text-lg px-4 py-2">
                                {displayPharmacies.length} résultat{displayPharmacies.length > 1 ? 's' : ''}
                            </Badge>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {displayPharmacies.map((pharmacie) => (
                                <PharmacieCard key={pharmacie.id} pharmacie={pharmacie} />
                            ))}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
