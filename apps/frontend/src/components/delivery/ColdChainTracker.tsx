import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
    Thermometer,
    Snowflake,
    AlertTriangle,
    CheckCircle,
    Clock,
    Package,
    TrendingUp,
    TrendingDown,
    Activity,
    RefreshCw,
    MapPin,
    Truck
} from 'lucide-react';
import { toast } from 'sonner';

interface ColdChainData {
    id: string;
    medicationName: string;
    orderId: string;
    currentTemp: number;
    minTemp: number;
    maxTemp: number;
    status: 'normal' | 'warning' | 'critical';
    lastUpdate: string;
    location: string;
    history: { time: string; temp: number }[];
}

interface ColdChainTrackerProps {
    deliveryId?: string;
    role?: 'driver' | 'pharmacy';
}

export function ColdChainTracker({ deliveryId, role = 'driver' }: ColdChainTrackerProps) {
    const [coldChainItems, setColdChainItems] = useState<ColdChainData[]>([
        {
            id: '1',
            medicationName: 'Insuline Lantus',
            orderId: 'PG-2486',
            currentTemp: 4.2,
            minTemp: 2,
            maxTemp: 8,
            status: 'normal',
            lastUpdate: '2 min',
            location: 'En transit - Cocody',
            history: [
                { time: '10:00', temp: 4.1 },
                { time: '10:15', temp: 4.3 },
                { time: '10:30', temp: 4.2 },
                { time: '10:45', temp: 4.5 },
                { time: '11:00', temp: 4.2 }
            ]
        },
        {
            id: '2',
            medicationName: 'Vaccin Pfizer',
            orderId: 'PG-2487',
            currentTemp: 6.8,
            minTemp: 2,
            maxTemp: 8,
            status: 'warning',
            lastUpdate: '5 min',
            location: 'En transit - Plateau',
            history: [
                { time: '10:00', temp: 5.5 },
                { time: '10:15', temp: 6.0 },
                { time: '10:30', temp: 6.5 },
                { time: '10:45', temp: 6.8 },
                { time: '11:00', temp: 6.8 }
            ]
        },
        {
            id: '3',
            medicationName: 'Sérum physiologique',
            orderId: 'PG-2488',
            currentTemp: 22,
            minTemp: 15,
            maxTemp: 25,
            status: 'normal',
            lastUpdate: '1 min',
            location: 'En transit - Marcory',
            history: [
                { time: '10:00', temp: 21 },
                { time: '10:15', temp: 22 },
                { time: '10:30', temp: 22 },
                { time: '10:45', temp: 21 },
                { time: '11:00', temp: 22 }
            ]
        }
    ]);

    const [isRefreshing, setIsRefreshing] = useState(false);

    const refreshData = () => {
        setIsRefreshing(true);
        setTimeout(() => {
            setIsRefreshing(false);
            toast.success('Données de température mises à jour');
        }, 1000);
    };

    const getStatusStyles = (status: ColdChainData['status']) => {
        switch (status) {
            case 'normal':
                return {
                    bg: 'bg-green-100',
                    border: 'border-green-200',
                    text: 'text-green-700',
                    icon: <CheckCircle className="h-4 w-4" />
                };
            case 'warning':
                return {
                    bg: 'bg-amber-100',
                    border: 'border-amber-200',
                    text: 'text-amber-700',
                    icon: <AlertTriangle className="h-4 w-4" />
                };
            case 'critical':
                return {
                    bg: 'bg-red-100',
                    border: 'border-red-200',
                    text: 'text-red-700',
                    icon: <AlertTriangle className="h-4 w-4" />
                };
        }
    };

    const getTempPercentage = (current: number, min: number, max: number) => {
        const range = max - min;
        const position = current - min;
        return Math.min(100, Math.max(0, (position / range) * 100));
    };

    const criticalCount = coldChainItems.filter(item => item.status === 'critical').length;
    const warningCount = coldChainItems.filter(item => item.status === 'warning').length;

    return (
        <Card className="bg-gradient-to-br from-cyan-50/50 to-blue-50/50 border-cyan-200/50">
            <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="p-2 bg-cyan-100 rounded-xl">
                            <Snowflake className="h-5 w-5 text-cyan-600" />
                        </div>
                        <div>
                            <CardTitle className="text-lg">Chaîne du Froid</CardTitle>
                            <p className="text-xs text-muted-foreground">Surveillance température en temps réel</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        {(criticalCount > 0 || warningCount > 0) && (
                            <Badge variant="destructive" className="animate-pulse">
                                <AlertTriangle className="h-3 w-3 mr-1" />
                                {criticalCount + warningCount} alerte(s)
                            </Badge>
                        )}
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={refreshData}
                            disabled={isRefreshing}
                            aria-label="Rafraîchir les données de température"
                        >
                            <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                        </Button>
                    </div>
                </div>
            </CardHeader>

            <CardContent className="space-y-4">
                {/* Summary Stats */}
                <div className="grid grid-cols-3 gap-3">
                    <div className="bg-white p-3 rounded-lg border border-slate-200 text-center">
                        <div className="text-2xl font-bold text-green-600">{coldChainItems.filter(i => i.status === 'normal').length}</div>
                        <p className="text-xs text-muted-foreground">Normal</p>
                    </div>
                    <div className="bg-white p-3 rounded-lg border border-slate-200 text-center">
                        <div className="text-2xl font-bold text-amber-600">{warningCount}</div>
                        <p className="text-xs text-muted-foreground">Attention</p>
                    </div>
                    <div className="bg-white p-3 rounded-lg border border-slate-200 text-center">
                        <div className="text-2xl font-bold text-red-600">{criticalCount}</div>
                        <p className="text-xs text-muted-foreground">Critique</p>
                    </div>
                </div>

                {/* Items */}
                {coldChainItems.map(item => {
                    const styles = getStatusStyles(item.status);
                    const tempPercent = getTempPercentage(item.currentTemp, item.minTemp, item.maxTemp);

                    return (
                        <div
                            key={item.id}
                            className={`p-4 rounded-xl border ${styles.border} ${styles.bg} transition-all`}
                        >
                            <div className="flex items-start justify-between mb-3">
                                <div className="flex items-center gap-3">
                                    <div className={`p-2 rounded-lg ${styles.bg}`}>
                                        <Thermometer className={`h-5 w-5 ${styles.text}`} />
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-slate-900">{item.medicationName}</h4>
                                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                            <Package className="h-3 w-3" />
                                            {item.orderId}
                                            <span>•</span>
                                            <MapPin className="h-3 w-3" />
                                            {item.location}
                                        </div>
                                    </div>
                                </div>

                                <Badge className={`${styles.bg} ${styles.text} border ${styles.border}`}>
                                    {styles.icon}
                                    <span className="ml-1">{item.status === 'normal' ? 'OK' : item.status === 'warning' ? 'Attention' : 'Critique'}</span>
                                </Badge>
                            </div>

                            {/* Temperature Display */}
                            <div className="bg-white/80 rounded-lg p-3 mb-3">
                                <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center gap-2">
                                        <span className={`text-3xl font-bold ${styles.text}`}>{item.currentTemp}°C</span>
                                        {item.history.length > 1 && (
                                            item.history[item.history.length - 1].temp > item.history[item.history.length - 2].temp
                                                ? <TrendingUp className="h-4 w-4 text-amber-500" />
                                                : <TrendingDown className="h-4 w-4 text-green-500" />
                                        )}
                                    </div>
                                    <div className="text-right text-xs text-muted-foreground">
                                        <p>Plage: {item.minTemp}°C - {item.maxTemp}°C</p>
                                        <p className="flex items-center gap-1 justify-end">
                                            <Clock className="h-3 w-3" />
                                            Mis à jour: {item.lastUpdate}
                                        </p>
                                    </div>
                                </div>

                                {/* Temperature Bar */}
                                <div className="relative h-3 bg-gradient-to-r from-blue-200 via-green-200 to-red-200 rounded-full overflow-hidden">
                                    <div
                                        className="absolute top-0 h-full w-1 bg-slate-800 rounded-full"
                                        style={{ left: `${tempPercent}%` }}
                                    />
                                </div>
                                <div className="flex justify-between text-[10px] text-muted-foreground mt-1">
                                    <span>{item.minTemp}°C</span>
                                    <span>{item.maxTemp}°C</span>
                                </div>
                            </div>

                            {/* Mini Graph */}
                            <div className="flex items-end gap-1 h-12 bg-white/50 rounded-lg p-2">
                                {item.history.map((h, i) => {
                                    const height = ((h.temp - item.minTemp) / (item.maxTemp - item.minTemp)) * 100;
                                    return (
                                        <div
                                            key={i}
                                            className={`flex-1 rounded-t ${h.temp >= item.maxTemp * 0.9
                                                ? 'bg-amber-400'
                                                : h.temp <= item.minTemp * 1.1
                                                    ? 'bg-blue-400'
                                                    : 'bg-green-400'
                                                } transition-all`}
                                            style={{ height: `${Math.max(10, height)}%` }}
                                            title={`${h.time}: ${h.temp}°C`}
                                        />
                                    );
                                })}
                            </div>

                            {/* Alert Action */}
                            {item.status !== 'normal' && (
                                <div className="mt-3 pt-3 border-t border-slate-200">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className={`w-full ${styles.text} ${styles.border} hover:${styles.bg}`}
                                        onClick={() => toast.warning(`Alerte température signalée pour ${item.medicationName}`)}
                                    >
                                        <AlertTriangle className="h-4 w-4 mr-2" />
                                        Signaler le problème
                                    </Button>
                                </div>
                            )}
                        </div>
                    );
                })}
            </CardContent>
        </Card>
    );
}
