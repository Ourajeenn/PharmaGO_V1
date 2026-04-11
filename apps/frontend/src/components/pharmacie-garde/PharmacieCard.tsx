import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { PharmacieGarde } from '@/services/PharmacieGardeService';
import { MapPin, Phone, Clock, Navigation } from 'lucide-react';
import { toast } from 'sonner';

interface PharmacieCardProps {
    pharmacie: PharmacieGarde;
}

export function PharmacieCard({ pharmacie }: PharmacieCardProps) {
    const handleCall = () => {
        if (pharmacie.telephone) {
            window.location.href = `tel:${pharmacie.telephone}`;
            toast.success(`Appel vers ${pharmacie.nom}`);
        } else {
            toast.error('Numéro de téléphone non disponible');
        }
    };

    const handleNavigate = () => {
        if (pharmacie.latitude && pharmacie.longitude) {
            const url = `https://www.google.com/maps/dir/?api=1&destination=${pharmacie.latitude},${pharmacie.longitude}`;
            window.open(url, '_blank');
            toast.success('Ouverture de Google Maps');
        } else {
            toast.error('Coordonnées GPS non disponibles');
        }
    };

    const getCommuneColor = (commune: string) => {
        const colors: Record<string, string> = {
            'Cocody': 'bg-blue-100 text-blue-700',
            'Plateau': 'bg-purple-100 text-purple-700',
            'Marcory': 'bg-green-100 text-green-700',
            'Yopougon': 'bg-orange-100 text-orange-700',
            'Abobo': 'bg-red-100 text-red-700',
            'Adjamé': 'bg-yellow-100 text-yellow-700',
            'Treichville': 'bg-pink-100 text-pink-700',
            'Koumassi': 'bg-indigo-100 text-indigo-700',
            'Port-Bouët': 'bg-cyan-100 text-cyan-700',
            'Attécoubé': 'bg-teal-100 text-teal-700',
            'Bingerville': 'bg-lime-100 text-lime-700',
            'Anyama': 'bg-amber-100 text-amber-700',
            'Songon': 'bg-rose-100 text-rose-700',
        };
        return colors[commune] || 'bg-gray-100 text-gray-700';
    };

    return (
        <Card className="hover:shadow-lg transition-all duration-300 border-l-4 border-l-primary">
            <CardHeader className="pb-3">
                <div className="flex justify-between items-start gap-2">
                    <CardTitle className="text-lg font-bold text-slate-900 line-clamp-2">
                        {pharmacie.nom}
                    </CardTitle>
                    <Badge className={`${getCommuneColor(pharmacie.commune)} text-xs font-semibold shrink-0`}>
                        {pharmacie.commune}
                    </Badge>
                </div>
            </CardHeader>

            <CardContent className="space-y-3">
                {/* Quartier */}
                {pharmacie.quartier && (
                    <div className="flex items-start gap-2 text-sm">
                        <MapPin className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                        <span className="text-slate-600 font-medium">{pharmacie.quartier}</span>
                    </div>
                )}

                {/* Adresse */}
                {pharmacie.adresse && (
                    <p className="text-sm text-slate-500 pl-6">{pharmacie.adresse}</p>
                )}

                {/* Téléphone */}
                {pharmacie.telephone && (
                    <div className="flex items-center gap-2 text-sm">
                        <Phone className="h-4 w-4 text-green-600 shrink-0" />
                        <a
                            href={`tel:${pharmacie.telephone}`}
                            className="text-green-600 font-semibold hover:underline"
                        >
                            {pharmacie.telephone}
                        </a>
                    </div>
                )}

                {/* Horaires */}
                {pharmacie.horaires && (
                    <div className="flex items-center gap-2 text-sm">
                        <Clock className="h-4 w-4 text-orange-600 shrink-0" />
                        <span className="text-orange-600 font-semibold">{pharmacie.horaires}</span>
                    </div>
                )}

                {/* Distance */}
                {pharmacie.distance_km !== undefined && (
                    <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                            📏 À {pharmacie.distance_km} km
                        </Badge>
                    </div>
                )}

                {/* Actions */}
                <div className="flex gap-2 pt-2">
                    <Button
                        onClick={handleCall}
                        className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                        size="sm"
                    >
                        <Phone className="h-4 w-4 mr-2" />
                        Appeler
                    </Button>
                    {pharmacie.latitude && pharmacie.longitude && (
                        <Button
                            onClick={handleNavigate}
                            variant="outline"
                            className="flex-1"
                            size="sm"
                        >
                            <Navigation className="h-4 w-4 mr-2" />
                            Itinéraire
                        </Button>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
