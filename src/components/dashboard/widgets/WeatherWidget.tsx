import { CloudSun, Snowflake, ThermometerSun, Wind } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'

export const WeatherWidget = () => {
    return (
        <Card className="bg-gradient-to-br from-blue-400 to-blue-600 text-white border-none shadow-xl overflow-hidden relative">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-yellow-400/20 rounded-full -ml-12 -mb-12 blur-xl"></div>

            <CardContent className="p-6 relative z-10">
                <div className="flex justify-between items-start">
                    <div>
                        <p className="text-blue-100 font-medium text-xs uppercase tracking-wider mb-1">Météo Actuelle</p>
                        <h3 className="text-2xl font-bold flex items-center gap-2">
                            <span className="text-4xl">28°</span> Abidjan
                        </h3>
                        <p className="text-blue-100/80 text-sm mt-1">Partiellement nuageux</p>
                    </div>
                    <div className="bg-white/20 p-3 rounded-2xl backdrop-blur-sm">
                        <CloudSun className="h-8 w-8 text-yellow-300" />
                    </div>
                </div>

                <div className="mt-6 pt-4 border-t border-white/20 grid grid-cols-2 gap-4">
                    <div className="flex items-center gap-3">
                        <div className="bg-white/20 p-2 rounded-lg">
                            <ThermometerSun className="h-4 w-4 text-white" />
                        </div>
                        <div>
                            <p className="text-[10px] text-blue-100 uppercase font-bold">Ressenti</p>
                            <p className="font-bold">32°C</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="bg-white/20 p-2 rounded-lg">
                            <Wind className="h-4 w-4 text-white" />
                        </div>
                        <div>
                            <p className="text-[10px] text-blue-100 uppercase font-bold">Vent</p>
                            <p className="font-bold">12 km/h</p>
                        </div>
                    </div>
                </div>

                <div className="mt-4 bg-white/10 rounded-xl p-3 flex items-center gap-3 border border-white/20">
                    <Snowflake className="h-5 w-5 text-cyan-300 animate-pulse" />
                    <div className="flex-1">
                        <p className="text-[10px] font-bold text-cyan-200 uppercase">Chaîne du Froid</p>
                        <p className="text-xs font-semibold">Conditions optimales pour transport</p>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
