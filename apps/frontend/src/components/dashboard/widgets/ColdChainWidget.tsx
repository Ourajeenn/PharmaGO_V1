import { Thermometer, AlertTriangle, CheckCircle, Smartphone } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'

export const ColdChainWidget = () => {
    return (
        <Card className="bg-white border-slate-200 shadow-sm relative overflow-hidden group hover:shadow-md transition-shadow">
            <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-cyan-100 rounded-xl flex items-center justify-center">
                            <Thermometer className="h-5 w-5 text-cyan-600" />
                        </div>
                        <div>
                            <h4 className="font-bold text-slate-800">Chaîne du Froid</h4>
                            <p className="text-xs text-muted-foreground">Monitoring Actif • Zone A</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-1.5 bg-green-100 px-2 py-1 rounded-lg border border-green-200">
                        <CheckCircle className="h-3 w-3 text-green-600" />
                        <span className="text-[10px] font-bold text-green-700 uppercase">Sécurisé</span>
                    </div>
                </div>

                <div className="space-y-4">
                    <div className="flex items-end justify-between">
                        <div>
                            <p className="text-3xl font-black text-slate-900">4.2°C</p>
                            <p className="text-xs font-medium text-slate-500">Cible: 2°C - 8°C</p>
                        </div>
                        <div className="h-10 w-[1px] bg-slate-100 mx-2"></div>
                        <div className="text-right">
                            <p className="text-xs text-slate-400 mb-0.5">Humidité</p>
                            <p className="text-lg font-bold text-slate-700">45%</p>
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <div className="flex justify-between text-[10px] font-bold uppercase text-slate-400">
                            <span>Min: 3.8°C</span>
                            <span>Max: 4.5°C</span>
                        </div>
                        <div className="relative h-2 bg-slate-100 rounded-full overflow-hidden">
                            <div className="absolute left-[30%] right-[30%] top-0 bottom-0 bg-green-500/20" /> {/* Safe zone visual */}
                            <div className="absolute left-[40%] top-0 bottom-0 w-2 bg-cyan-500 rounded-full shadow-[0_0_10px_rgba(6,182,212,0.5)]" /> {/* Current marker */}
                        </div>
                    </div>

                    <div className="bg-slate-50 rounded-lg p-3 flex items-start gap-3 border border-slate-100">
                        <Smartphone className="h-4 w-4 text-slate-400 mt-0.5" />
                        <div>
                            <p className="text-xs font-bold text-slate-700">Capteur IoT Connecté</p>
                            <p className="text-[10px] text-slate-500">Dernière synchro: il y a 2 min</p>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
