import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
    Truck,
    Navigation,
    Map as MapIcon,
    Activity,
    ChevronRight,
    Search,
    Filter,
    Clock,
    CheckCircle2,
    AlertTriangle,
    Zap,
    Users,
    TrendingUp
} from 'lucide-react'
import {
    ResponsiveContainer,
    AreaChart,
    Area,
    XAxis,
    YAxis,
    Tooltip,
    CartesianGrid
} from 'recharts'
import { autoDispatch, Driver, DeliveryMission } from '@/services/AutoDispatchService'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

export const LogisticsHub = () => {
    const [fleet, setFleet] = useState<Driver[]>(autoDispatch.getLiveFleetStatus())
    const [activeMissions, setActiveMissions] = useState<DeliveryMission[]>([
        { id: 'MS-101', priority: 'urgent', pickupLocation: 'Pharmacie Centrale', deliveryLocation: 'Plateau, 12 Ave', status: 'pending' },
        { id: 'MS-102', priority: 'high', pickupLocation: 'Pharmacie de Marcory', deliveryLocation: 'Zone 4, Rue des Orangers', status: 'assigned' },
        { id: 'MS-103', priority: 'medium', pickupLocation: 'Hub PharmaGO', deliveryLocation: 'Anyama, Qrt 5', status: 'in_transit' },
    ])
    const [isDispatching, setIsDispatching] = useState(false)

    const deliverystats = [
        { label: 'ETA Moyen', value: '18 min', icon: Clock, color: 'text-blue-500' },
        { label: 'Taux de Succès', value: '99.2%', icon: CheckCircle2, color: 'text-emerald-500' },
        { label: 'Congestion', value: 'Modérée', icon: Activity, color: 'text-orange-500' },
        { label: 'Chauffeurs Actifs', value: '4/6', icon: Users, color: 'text-purple-500' },
    ]

    const handleAutoDispatch = async (missionId: string) => {
        setIsDispatching(true)
        toast.info(`Analyse d'assignation IA pour ${missionId}...`, {
            icon: <Zap className="h-4 w-4 animate-pulse text-blue-500" />
        })

        const result: any = await autoDispatch.simulateDispatchUpdate(missionId)

        if (result.assignedDriver) {
            setActiveMissions(prev => prev.map(m => m.id === missionId ? { ...m, status: 'assigned' } : m))
            toast.success(`Mission ${missionId} assignée à ${result.assignedDriver.name} (${result.optimizationMethod})`, {
                description: "Le trajet le plus court a été calculé via RouteOptimizer API."
            })
        }
        setIsDispatching(false)
    }

    return (
        <div className="min-h-screen bg-[#0f172a] text-slate-200 p-8 font-sans selection:bg-blue-500/30">
            {/* Header Control Panel */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center shadow-[0_0_20px_rgba(37,99,235,0.4)] animate-pulse">
                            <Truck className="h-7 w-7 text-white" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-black tracking-tight text-white uppercase italic">Logistics Hub <span className="text-blue-500 text-sm align-super not-italic">v2.4</span></h1>
                            <div className="flex items-center gap-2">
                                <span className="flex h-2 w-2 rounded-full bg-emerald-500"></span>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Contrôle Aérien Fleet Live</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <div className="bg-slate-800/50 backdrop-blur-xl border border-white/10 p-1.5 rounded-2xl flex gap-1">
                        <Button variant="ghost" className="rounded-xl px-4 py-2 bg-blue-600/10 text-blue-400 font-bold text-xs border border-blue-500/20">Live Map</Button>
                        <Button variant="ghost" className="rounded-xl px-4 py-2 text-slate-400 font-bold text-xs hover:text-white">Analytics</Button>
                    </div>
                    <Button className="bg-blue-600 hover:bg-blue-700 text-white rounded-2xl px-6 h-12 font-black shadow-xl shadow-blue-600/20 flex items-center gap-2 group">
                        <Navigation className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                        AUTO-OPTIMIZE
                    </Button>
                </div>
            </div>

            {/* Top Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                {deliverystats.map((stat, idx) => (
                    <Card key={idx} className="bg-slate-800/30 border-white/5 backdrop-blur-xl group hover:bg-slate-800/50 transition-all cursor-default">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between mb-4">
                                <div className={cn("p-2.5 rounded-xl bg-slate-900", stat.color)}>
                                    <stat.icon className="h-5 w-5" />
                                </div>
                                <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Real-time</div>
                            </div>
                            <p className="text-xs font-bold text-slate-400 mb-1">{stat.label}</p>
                            <h3 className="text-2xl font-black text-white">{stat.value}</h3>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Left: Interactive Map Simulation */}
                <Card className="lg:col-span-8 bg-slate-900 border-white/10 rounded-[2rem] overflow-hidden relative border shadow-2xl min-h-[500px]">
                    <div className="absolute inset-0 opacity-20 pointer-events-none" style={{
                        backgroundImage: `radial-gradient(#1e293b 1px, transparent 1px)`,
                        backgroundSize: '24px 24px'
                    }}></div>

                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="relative w-full h-full p-12">
                            {/* Map Simulation Artifacts */}
                            <div className="absolute top-1/4 left-1/3 w-3 h-3 bg-blue-500 rounded-full animate-ping"></div>
                            <div className="absolute top-1/2 left-2/3 w-3 h-3 bg-emerald-500 rounded-full animate-ping"></div>
                            <div className="absolute bottom-1/3 left-1/4 w-3 h-3 bg-rose-500 rounded-full animate-ping"></div>

                            {/* Connection Lines (Paths) */}
                            <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-40">
                                <path d="M 300 200 Q 450 350 600 250" fill="none" stroke="#3b82f6" strokeWidth="2" strokeDasharray="5,5" className="animate-[dash_2s_linear_infinite]" />
                                <path d="M 200 500 Q 500 400 700 300" fill="none" stroke="#10b981" strokeWidth="2" strokeDasharray="5,5" />
                            </svg>

                            {/* Driver Floating Cards */}
                            {fleet.map((driver, i) => (
                                <div key={driver.id} className="absolute p-3 bg-slate-900/90 backdrop-blur-md rounded-2xl border border-white/10 shadow-2xl flex items-center gap-3 transition-all hover:-translate-y-1 hover:border-blue-500"
                                    style={{ top: `${20 + i * 20}%`, left: `${10 + i * 15}%` }}>
                                    <div className="relative">
                                        <Avatar className="h-10 w-10 border-2 border-blue-500/50">
                                            <AvatarFallback className="bg-slate-800 text-blue-500 font-black">{driver.name[0]}</AvatarFallback>
                                        </Avatar>
                                        <span className={cn("absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-slate-900",
                                            driver.status === 'idle' ? 'bg-emerald-500' : 'bg-amber-500')}></span>
                                    </div>
                                    <div>
                                        <p className="text-xs font-black text-white">{driver.name}</p>
                                        <p className="text-[9px] text-slate-500 font-bold uppercase tracking-tighter">
                                            {driver.status === 'idle' ? 'En attente' : `${driver.currentLoads} Livraison(s)`}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="absolute bottom-8 left-8 right-8 flex items-center justify-between bg-slate-900/80 backdrop-blur-xl p-4 rounded-3xl border border-white/10">
                        <div className="flex gap-4">
                            <Badge className="bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded-lg">4 Livraisons en cours</Badge>
                            <Badge className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-lg">Optimal</Badge>
                        </div>
                        <div className="flex items-center gap-2 text-[10px] font-black text-slate-500 uppercase">
                            <MapIcon className="h-3 w-3" /> Abidjan Multi-Zone View
                        </div>
                    </div>
                </Card>

                {/* Right: Mission Control & Auto-Dispatch */}
                <div className="lg:col-span-4 space-y-8">
                    <Card className="bg-slate-800/30 border-white/10 rounded-[2rem] overflow-hidden backdrop-blur-xl">
                        <CardHeader className="p-6 border-b border-white/5">
                            <CardTitle className="text-lg font-black text-white flex items-center gap-2 lowercase italic">
                                <Zap className="h-5 w-5 text-amber-500" /> Auto-Dispatching
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-6 space-y-4">
                            {activeMissions.map((mission) => (
                                <div key={mission.id} className="p-4 bg-slate-900/50 rounded-2xl border border-white/5 group hover:border-blue-500/50 transition-colors">
                                    <div className="flex justify-between items-start mb-3">
                                        <div>
                                            <p className="font-black text-white mb-0.5">{mission.id}</p>
                                            <Badge className={cn(
                                                "text-[9px] font-black uppercase rounded-[4px]",
                                                mission.priority === 'urgent' ? 'bg-rose-500' : 'bg-amber-500'
                                            )}>
                                                {mission.priority}
                                            </Badge>
                                        </div>
                                        <Badge variant="outline" className="border-slate-700 text-slate-500 text-[10px]">{mission.status}</Badge>
                                    </div>
                                    <div className="space-y-2 mb-4">
                                        <div className="flex items-center gap-2 text-xs font-medium text-slate-400">
                                            <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
                                            {mission.pickupLocation}
                                        </div>
                                        <div className="flex items-center gap-2 text-xs font-medium text-slate-400">
                                            <div className="w-1.5 h-1.5 rounded-full bg-rose-500"></div>
                                            {mission.deliveryLocation}
                                        </div>
                                    </div>
                                    {mission.status === 'pending' && (
                                        <Button
                                            className="w-full bg-blue-600 hover:bg-blue-700 h-9 rounded-xl font-black text-xs transition-all active:scale-95"
                                            onClick={() => handleAutoDispatch(mission.id)}
                                            disabled={isDispatching}
                                        >
                                            PROPOSER RÉSOLUTION IA
                                        </Button>
                                    )}
                                </div>
                            ))}
                        </CardContent>
                    </Card>

                    <Card className="bg-gradient-to-br from-indigo-900/40 to-slate-900 border-white/10 rounded-[2rem] overflow-hidden">
                        <CardContent className="p-8">
                            <div className="flex flex-col items-center text-center space-y-4">
                                <div className="w-16 h-16 bg-blue-600/20 rounded-full flex items-center justify-center border border-blue-500/30">
                                    <TrendingUp className="h-8 w-8 text-blue-400" />
                                </div>
                                <div>
                                    <h4 className="text-xl font-black text-white">Prédicteur de Congestion</h4>
                                    <p className="text-xs text-slate-500 font-medium">L'IA analyse les flux de trafic pour ajuster les ETA en temps réel.</p>
                                </div>
                                <div className="h-24 w-full">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <AreaChart data={[
                                            { t: 1, v: 40 }, { t: 2, v: 55 }, { t: 3, v: 48 }, { t: 4, v: 70 }, { t: 5, v: 85 }, { t: 6, v: 60 }
                                        ]}>
                                            <defs>
                                                <linearGradient id="colorVal" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                                                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                                </linearGradient>
                                            </defs>
                                            <Area type="monotone" dataKey="v" stroke="#3b82f6" fillOpacity={1} fill="url(#colorVal)" />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
