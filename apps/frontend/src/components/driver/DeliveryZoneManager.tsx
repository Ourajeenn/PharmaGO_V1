import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import {
    MapPin,
    Navigation,
    Clock,
    Package,
    AlertTriangle,
    Settings,
    Plus,
    Trash2,
    ChevronRight,
    Check
} from 'lucide-react';
import { toast } from 'sonner';

interface DeliveryZone {
    id: string;
    name: string;
    communes: string[];
    maxDistance: number;
    enabled: boolean;
    priorityLevel: 'high' | 'medium' | 'low';
    estimatedTime: string;
    surcharge: number;
}

interface DeliveryZoneManagerProps {
    driverId?: string;
}

export function DeliveryZoneManager({ driverId }: DeliveryZoneManagerProps) {
    const [zones, setZones] = useState<DeliveryZone[]>([
        {
            id: '1',
            name: 'Cocody',
            communes: ['Riviera', 'Angré', 'Cocody Centre', 'II Plateaux'],
            maxDistance: 10,
            enabled: true,
            priorityLevel: 'high',
            estimatedTime: '15-25 min',
            surcharge: 0
        },
        {
            id: '2',
            name: 'Plateau',
            communes: ['Plateau', 'Adjamé', 'Attécoubé'],
            maxDistance: 8,
            enabled: true,
            priorityLevel: 'high',
            estimatedTime: '20-30 min',
            surcharge: 0
        },
        {
            id: '3',
            name: 'Marcory & Treichville',
            communes: ['Marcory', 'Treichville', 'Zone 4'],
            maxDistance: 12,
            enabled: true,
            priorityLevel: 'medium',
            estimatedTime: '25-40 min',
            surcharge: 500
        },
        {
            id: '4',
            name: 'Koumassi',
            communes: ['Koumassi', 'Port-Bouët'],
            maxDistance: 15,
            enabled: false,
            priorityLevel: 'low',
            estimatedTime: '35-50 min',
            surcharge: 1000
        },
        {
            id: '5',
            name: 'Yopougon',
            communes: ['Yopougon', 'Songon'],
            maxDistance: 20,
            enabled: false,
            priorityLevel: 'low',
            estimatedTime: '45-60 min',
            surcharge: 1500
        }
    ]);

    const [maxDailyDeliveries, setMaxDailyDeliveries] = useState(25);

    const toggleZone = (zoneId: string) => {
        setZones(prev => prev.map(z => {
            if (z.id === zoneId) {
                const newEnabled = !z.enabled;
                toast.success(
                    newEnabled
                        ? `Zone ${z.name} activée`
                        : `Zone ${z.name} désactivée`
                );
                return { ...z, enabled: newEnabled };
            }
            return z;
        }));
    };

    const getPriorityStyles = (priority: DeliveryZone['priorityLevel']) => {
        switch (priority) {
            case 'high':
                return {
                    bg: 'bg-green-100',
                    text: 'text-green-700',
                    border: 'border-green-200',
                    label: 'Priorité haute'
                };
            case 'medium':
                return {
                    bg: 'bg-amber-100',
                    text: 'text-amber-700',
                    border: 'border-amber-200',
                    label: 'Priorité moyenne'
                };
            case 'low':
                return {
                    bg: 'bg-slate-100',
                    text: 'text-slate-600',
                    border: 'border-slate-200',
                    label: 'Priorité basse'
                };
        }
    };

    const enabledZonesCount = zones.filter(z => z.enabled).length;
    const totalCommunes = zones.filter(z => z.enabled).reduce((sum, z) => sum + z.communes.length, 0);

    return (
        <Card className="bg-gradient-to-br from-orange-50/50 to-red-50/50 border-orange-200/50">
            <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="p-2 bg-orange-100 rounded-xl">
                            <MapPin className="h-5 w-5 text-orange-600" />
                        </div>
                        <div>
                            <CardTitle className="text-lg">Zones de Livraison</CardTitle>
                            <p className="text-xs text-muted-foreground">Gérez vos zones de couverture</p>
                        </div>
                    </div>
                    <Badge variant="outline" className="bg-orange-100 text-orange-700 border-orange-200">
                        {enabledZonesCount} zones actives
                    </Badge>
                </div>
            </CardHeader>

            <CardContent className="space-y-4">
                {/* Summary Stats */}
                <div className="grid grid-cols-3 gap-3">
                    <div className="bg-white p-3 rounded-lg border border-slate-200 text-center">
                        <div className="text-2xl font-bold text-orange-600">{enabledZonesCount}</div>
                        <p className="text-xs text-muted-foreground">Zones</p>
                    </div>
                    <div className="bg-white p-3 rounded-lg border border-slate-200 text-center">
                        <div className="text-2xl font-bold text-orange-600">{totalCommunes}</div>
                        <p className="text-xs text-muted-foreground">Communes</p>
                    </div>
                    <div className="bg-white p-3 rounded-lg border border-slate-200 text-center">
                        <div className="text-2xl font-bold text-orange-600">{maxDailyDeliveries}</div>
                        <p className="text-xs text-muted-foreground">Max/jour</p>
                    </div>
                </div>

                {/* Max Deliveries Slider */}
                <div className="bg-white p-4 rounded-lg border border-slate-200">
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-sm font-medium">Livraisons max par jour</span>
                        <Badge variant="outline" className="bg-slate-100">{maxDailyDeliveries}</Badge>
                    </div>
                    <Slider
                        value={[maxDailyDeliveries]}
                        onValueChange={([value]) => setMaxDailyDeliveries(value)}
                        max={50}
                        min={5}
                        step={5}
                        className="w-full"
                    />
                    <div className="flex justify-between text-[10px] text-muted-foreground mt-1">
                        <span>5</span>
                        <span>50</span>
                    </div>
                </div>

                {/* Zones List */}
                <div className="space-y-3">
                    {zones.map(zone => {
                        const priorityStyles = getPriorityStyles(zone.priorityLevel);

                        return (
                            <div
                                key={zone.id}
                                className={`p-4 rounded-xl border transition-all ${zone.enabled
                                        ? 'bg-white border-orange-200'
                                        : 'bg-slate-50 border-slate-200 opacity-60'
                                    }`}
                            >
                                <div className="flex items-start justify-between mb-3">
                                    <div className="flex items-center gap-3">
                                        <div className={`p-2 rounded-lg ${zone.enabled ? 'bg-orange-100' : 'bg-slate-100'}`}>
                                            <MapPin className={`h-5 w-5 ${zone.enabled ? 'text-orange-600' : 'text-slate-400'}`} />
                                        </div>
                                        <div>
                                            <h4 className="font-semibold text-slate-900">{zone.name}</h4>
                                            <div className="flex items-center gap-2 mt-1">
                                                <Badge
                                                    variant="outline"
                                                    className={`${priorityStyles.bg} ${priorityStyles.text} ${priorityStyles.border} text-[10px]`}
                                                >
                                                    {priorityStyles.label}
                                                </Badge>
                                                {zone.surcharge > 0 && (
                                                    <Badge variant="outline" className="bg-amber-50 text-amber-600 border-amber-200 text-[10px]">
                                                        +{zone.surcharge} F
                                                    </Badge>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    <Switch
                                        checked={zone.enabled}
                                        onCheckedChange={() => toggleZone(zone.id)}
                                        className="data-[state=checked]:bg-orange-600"
                                    />
                                </div>

                                {/* Communes */}
                                <div className="flex flex-wrap gap-1 mb-3">
                                    {zone.communes.map((commune, i) => (
                                        <Badge key={i} variant="secondary" className="text-[10px] bg-slate-100">
                                            {commune}
                                        </Badge>
                                    ))}
                                </div>

                                {/* Zone Details */}
                                <div className="grid grid-cols-3 gap-2 text-xs">
                                    <div className="flex items-center gap-1 text-muted-foreground">
                                        <Navigation className="h-3 w-3" />
                                        Max {zone.maxDistance} km
                                    </div>
                                    <div className="flex items-center gap-1 text-muted-foreground">
                                        <Clock className="h-3 w-3" />
                                        {zone.estimatedTime}
                                    </div>
                                    <div className="flex items-center gap-1 text-muted-foreground">
                                        <Package className="h-3 w-3" />
                                        {zone.communes.length} communes
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Add Zone Button */}
                <Button variant="outline" className="w-full border-dashed border-orange-300 text-orange-600 hover:bg-orange-50">
                    <Plus className="h-4 w-4 mr-2" />
                    Ajouter une zone
                </Button>

                {/* Warning */}
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 flex items-start gap-2">
                    <AlertTriangle className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
                    <p className="text-xs text-amber-800">
                        Les zones désactivées ne recevront pas de commandes. Activez au moins une zone pour recevoir des livraisons.
                    </p>
                </div>
            </CardContent>
        </Card>
    );
}
