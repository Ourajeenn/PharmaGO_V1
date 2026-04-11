import { CloudSun, Snowflake, ThermometerSun, Wind, Cloud, Sun, CloudRain, Loader2 } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { useWeather } from '@/hooks/useWeather'

export const WeatherWidget = () => {
    const { weather, loading } = useWeather('Abidjan')

    const getWeatherIcon = (condition: string) => {
        switch (condition?.toLowerCase()) {
            case 'clear':
                return <Sun className="h-8 w-8 text-yellow-300" />
            case 'clouds':
                return <CloudSun className="h-8 w-8 text-yellow-300" />
            case 'rain':
            case 'drizzle':
                return <CloudRain className="h-8 w-8 text-blue-300" />
            default:
                return <CloudSun className="h-8 w-8 text-yellow-300" />
        }
    }

    // Cold chain status based on temperature
    const getColdChainStatus = (temp: number) => {
        if (temp <= 8) return { text: 'Excellent pour transport', color: 'text-cyan-300' }
        if (temp <= 25) return { text: 'Conditions optimales pour transport', color: 'text-cyan-200' }
        if (temp <= 32) return { text: 'Attention - Surveiller la température', color: 'text-yellow-300' }
        return { text: 'Risque élevé - Utiliser glacière', color: 'text-orange-300' }
    }

    if (loading || !weather) {
        return (
            <Card className="bg-gradient-to-br from-blue-400 to-blue-600 text-white border-none shadow-xl overflow-hidden relative">
                <CardContent className="p-6 flex items-center justify-center h-48">
                    <Loader2 className="h-8 w-8 animate-spin" />
                </CardContent>
            </Card>
        )
    }

    const coldChainStatus = getColdChainStatus(weather.temperature)

    return (
        <Card className="bg-gradient-to-br from-blue-400 to-blue-600 text-white border-none shadow-xl overflow-hidden relative">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-yellow-400/20 rounded-full -ml-12 -mb-12 blur-xl"></div>

            <CardContent className="p-6 relative z-10">
                <div className="flex justify-between items-start">
                    <div>
                        <p className="text-blue-100 font-medium text-xs uppercase tracking-wider mb-1">Météo Actuelle</p>
                        <h3 className="text-2xl font-bold flex items-center gap-2">
                            <span className="text-4xl">{weather.temperature}°</span> {weather.city}
                        </h3>
                        <p className="text-blue-100/80 text-sm mt-1 capitalize">{weather.description}</p>
                    </div>
                    <div className="bg-white/20 p-3 rounded-2xl backdrop-blur-sm">
                        {getWeatherIcon(weather.condition)}
                    </div>
                </div>

                <div className="mt-6 pt-4 border-t border-white/20 grid grid-cols-2 gap-4">
                    <div className="flex items-center gap-3">
                        <div className="bg-white/20 p-2 rounded-lg">
                            <ThermometerSun className="h-4 w-4 text-white" />
                        </div>
                        <div>
                            <p className="text-[10px] text-blue-100 uppercase font-bold">Ressenti</p>
                            <p className="font-bold">{weather.feelsLike}°C</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="bg-white/20 p-2 rounded-lg">
                            <Wind className="h-4 w-4 text-white" />
                        </div>
                        <div>
                            <p className="text-[10px] text-blue-100 uppercase font-bold">Vent</p>
                            <p className="font-bold">{weather.windSpeed} km/h</p>
                        </div>
                    </div>
                </div>

                <div className="mt-4 bg-white/10 rounded-xl p-3 flex items-center gap-3 border border-white/20">
                    <Snowflake className={`h-5 w-5 ${coldChainStatus.color} animate-pulse`} />
                    <div className="flex-1">
                        <p className="text-[10px] font-bold text-cyan-200 uppercase">Chaîne du Froid</p>
                        <p className="text-xs font-semibold">{coldChainStatus.text}</p>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
