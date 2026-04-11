import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Cloud,
    Sun,
    CloudRain,
    CloudLightning,
    Wind,
    Droplets,
    Thermometer,
    AlertTriangle,
    Navigation,
    Clock,
    MapPin,
    RefreshCw
} from 'lucide-react';
import { toast } from 'sonner';

interface WeatherData {
    location: string;
    temperature: number;
    humidity: number;
    windSpeed: number;
    condition: 'sunny' | 'cloudy' | 'rainy' | 'stormy';
    description: string;
    forecast: {
        time: string;
        temp: number;
        condition: string;
    }[];
    alerts: {
        type: 'flood' | 'storm' | 'heat' | 'traffic';
        message: string;
        severity: 'low' | 'medium' | 'high';
    }[];
}

interface WeatherIntegrationProps {
    onRouteImpact?: (impact: string) => void;
}

export function WeatherIntegration({ onRouteImpact }: WeatherIntegrationProps) {
    const [weather, setWeather] = useState<WeatherData>({
        location: 'Abidjan, Cocody',
        temperature: 32,
        humidity: 78,
        windSpeed: 12,
        condition: 'cloudy',
        description: 'Partiellement nuageux',
        forecast: [
            { time: '12:00', temp: 33, condition: 'sunny' },
            { time: '14:00', temp: 31, condition: 'cloudy' },
            { time: '16:00', temp: 29, condition: 'rainy' },
            { time: '18:00', temp: 27, condition: 'cloudy' },
            { time: '20:00', temp: 25, condition: 'cloudy' }
        ],
        alerts: [
            {
                type: 'flood',
                message: 'Risque d\'inondation à Koumassi - Éviter la zone',
                severity: 'high'
            },
            {
                type: 'traffic',
                message: 'Ralentissement sur Boulevard Latrille',
                severity: 'medium'
            }
        ]
    });

    const [isRefreshing, setIsRefreshing] = useState(false);
    const [lastUpdate, setLastUpdate] = useState(new Date());

    const refreshWeather = async () => {
        setIsRefreshing(true);
        // Simulate API call
        setTimeout(() => {
            setLastUpdate(new Date());
            setIsRefreshing(false);
            toast.success('Données météo actualisées');
        }, 1000);
    };

    const getWeatherIcon = (condition: string, size = 'h-8 w-8') => {
        switch (condition) {
            case 'sunny':
                return <Sun className={`${size} text-amber-500`} />;
            case 'cloudy':
                return <Cloud className={`${size} text-slate-500`} />;
            case 'rainy':
                return <CloudRain className={`${size} text-blue-500`} />;
            case 'stormy':
                return <CloudLightning className={`${size} text-purple-500`} />;
            default:
                return <Sun className={`${size} text-amber-500`} />;
        }
    };

    const getAlertStyles = (severity: string) => {
        switch (severity) {
            case 'high':
                return 'bg-red-100 border-red-300 text-red-800';
            case 'medium':
                return 'bg-amber-100 border-amber-300 text-amber-800';
            default:
                return 'bg-blue-100 border-blue-300 text-blue-800';
        }
    };

    const deliveryImpact = weather.condition === 'rainy' || weather.condition === 'stormy'
        ? '+15-30 min'
        : 'Normal';

    return (
        <Card className="bg-gradient-to-br from-sky-50/50 to-blue-50/50 border-sky-200/50">
            <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="p-2 bg-sky-100 rounded-xl">
                            <Cloud className="h-5 w-5 text-sky-600" />
                        </div>
                        <div>
                            <CardTitle className="text-lg">Météo & Conditions</CardTitle>
                            <p className="text-xs text-muted-foreground flex items-center gap-1">
                                <MapPin className="h-3 w-3" />
                                {weather.location}
                            </p>
                        </div>
                    </div>

                    <Button
                        variant="outline"
                        size="sm"
                        onClick={refreshWeather}
                        disabled={isRefreshing}
                    >
                        <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                    </Button>
                </div>
            </CardHeader>

            <CardContent className="space-y-4">
                {/* Current Weather */}
                <div className="bg-gradient-to-r from-sky-500 to-blue-600 rounded-xl p-4 text-white">
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="flex items-baseline gap-2">
                                <span className="text-5xl font-bold">{weather.temperature}°</span>
                                <span className="text-lg opacity-80">C</span>
                            </div>
                            <p className="text-sm opacity-90 mt-1">{weather.description}</p>
                        </div>
                        {getWeatherIcon(weather.condition, 'h-16 w-16')}
                    </div>

                    <div className="flex items-center gap-6 mt-4 pt-3 border-t border-white/20">
                        <div className="flex items-center gap-2">
                            <Droplets className="h-4 w-4 opacity-80" />
                            <span className="text-sm">{weather.humidity}%</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Wind className="h-4 w-4 opacity-80" />
                            <span className="text-sm">{weather.windSpeed} km/h</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 opacity-80" />
                            <span className="text-sm">{lastUpdate.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                    </div>
                </div>

                {/* Delivery Impact */}
                <div className={`p-3 rounded-lg flex items-center justify-between ${deliveryImpact !== 'Normal'
                        ? 'bg-amber-100 border border-amber-200'
                        : 'bg-green-100 border border-green-200'
                    }`}>
                    <div className="flex items-center gap-2">
                        <Navigation className={`h-5 w-5 ${deliveryImpact !== 'Normal' ? 'text-amber-600' : 'text-green-600'}`} />
                        <div>
                            <p className="text-sm font-semibold">Impact sur les livraisons</p>
                            <p className="text-xs text-muted-foreground">Estimation temps supplémentaire</p>
                        </div>
                    </div>
                    <Badge className={deliveryImpact !== 'Normal' ? 'bg-amber-500' : 'bg-green-500'}>
                        {deliveryImpact}
                    </Badge>
                </div>

                {/* Hourly Forecast */}
                <div>
                    <h4 className="text-sm font-semibold mb-2">Prévisions horaires</h4>
                    <div className="flex gap-2 overflow-x-auto pb-2">
                        {weather.forecast.map((f, i) => (
                            <div
                                key={i}
                                className="flex-shrink-0 bg-white p-3 rounded-lg border border-slate-200 text-center min-w-[70px]"
                            >
                                <p className="text-xs text-muted-foreground">{f.time}</p>
                                <div className="my-2 flex justify-center">
                                    {getWeatherIcon(f.condition, 'h-6 w-6')}
                                </div>
                                <p className="text-sm font-semibold">{f.temp}°</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Weather Alerts */}
                {weather.alerts.length > 0 && (
                    <div>
                        <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                            <AlertTriangle className="h-4 w-4 text-amber-500" />
                            Alertes actives
                        </h4>
                        <div className="space-y-2">
                            {weather.alerts.map((alert, i) => (
                                <div
                                    key={i}
                                    className={`p-3 rounded-lg border ${getAlertStyles(alert.severity)}`}
                                >
                                    <div className="flex items-start gap-2">
                                        <AlertTriangle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                                        <div>
                                            <p className="text-sm font-medium">{alert.message}</p>
                                            <Badge
                                                variant="outline"
                                                className="mt-1 text-[10px]"
                                            >
                                                {alert.type === 'flood' ? 'Inondation' :
                                                    alert.type === 'storm' ? 'Tempête' :
                                                        alert.type === 'heat' ? 'Chaleur' : 'Trafic'}
                                            </Badge>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
