import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import {
    Map, Navigation, Clock, Package, CheckCircle, MapPin,
    Phone, Truck, RotateCcw, ArrowRight, Eye, AlertTriangle,
    Zap, TrendingUp, Timer, Fuel
} from 'lucide-react'
import { toast } from 'sonner'

interface Delivery {
    id: string
    orderId: string
    patient: string
    patientPhone: string
    address: string
    zone: string
    distance: number
    estimatedTime: number
    status: 'pending' | 'picked' | 'in_transit' | 'delivered'
    priority: 'normal' | 'urgent'
    pharmacy: string
}

interface RouteStats {
    totalDeliveries: number
    totalDistance: number
    estimatedTime: number
    fuelCost: number
}

export const RouteOptimizationSection = () => {
    const [selectedDelivery, setSelectedDelivery] = useState<Delivery | null>(null)
    const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false)
    const [isOptimizing, setIsOptimizing] = useState(false)

    // Mock data
    const [deliveries, setDeliveries] = useState<Delivery[]>([
        { id: '1', orderId: 'CMD-2456', patient: 'Kouamé Aya', patientPhone: '+225 07 07 07 07', address: 'Cocody, Riviera Palmeraie', zone: 'Cocody', distance: 3.2, estimatedTime: 12, status: 'pending', priority: 'normal', pharmacy: 'Pharmacie du Bonheur' },
        { id: '2', orderId: 'CMD-2455', patient: 'Traoré Ibrahim', patientPhone: '+225 05 05 05 05', address: 'Marcory Zone 4', zone: 'Marcory', distance: 5.8, estimatedTime: 20, status: 'pending', priority: 'urgent', pharmacy: 'Pharmacie du Bonheur' },
        { id: '3', orderId: 'CMD-2454', patient: 'Koné Fatou', patientPhone: '+225 01 01 01 01', address: 'Plateau, Av. Franchet d\'Esperey', zone: 'Plateau', distance: 2.1, estimatedTime: 8, status: 'picked', priority: 'normal', pharmacy: 'Pharmacie Centrale' },
        { id: '4', orderId: 'CMD-2453', patient: 'Bamba Moussa', patientPhone: '+225 77 77 77 77', address: 'Yopougon Siporex', zone: 'Yopougon', distance: 8.5, estimatedTime: 35, status: 'in_transit', priority: 'normal', pharmacy: 'Pharmacie du Bonheur' },
        { id: '5', orderId: 'CMD-2452', patient: 'Diallo Aminata', patientPhone: '+225 67 67 67 67', address: 'Treichville, Av. 10', zone: 'Treichville', distance: 4.0, estimatedTime: 15, status: 'delivered', priority: 'normal', pharmacy: 'Pharmacie du Port' }
    ])

    const pendingDeliveries = deliveries.filter(d => d.status === 'pending')
    const activeDeliveries = deliveries.filter(d => d.status === 'picked' || d.status === 'in_transit')
    const completedDeliveries = deliveries.filter(d => d.status === 'delivered')

    const routeStats: RouteStats = {
        totalDeliveries: pendingDeliveries.length + activeDeliveries.length,
        totalDistance: [...pendingDeliveries, ...activeDeliveries].reduce((sum, d) => sum + d.distance, 0),
        estimatedTime: [...pendingDeliveries, ...activeDeliveries].reduce((sum, d) => sum + d.estimatedTime, 0),
        fuelCost: [...pendingDeliveries, ...activeDeliveries].reduce((sum, d) => sum + d.distance, 0) * 150 // 150F/km
    }

    const handleOptimizeRoute = async () => {
        setIsOptimizing(true)
        await new Promise(resolve => setTimeout(resolve, 2000))

        // Simulate route optimization by reordering
        const optimized = [...pendingDeliveries].sort((a, b) => a.distance - b.distance)
        setDeliveries([...optimized, ...activeDeliveries, ...completedDeliveries])

        toast.success('Itinéraire optimisé!', { description: 'Économie estimée: 15min et 2.5km' })
        setIsOptimizing(false)
    }

    const getStatusBadge = (status: string) => {
        const styles: Record<string, string> = {
            pending: 'bg-yellow-100 text-yellow-700 border-yellow-200',
            picked: 'bg-blue-100 text-blue-700 border-blue-200',
            in_transit: 'bg-purple-100 text-purple-700 border-purple-200',
            delivered: 'bg-green-100 text-green-700 border-green-200'
        }
        const labels: Record<string, string> = {
            pending: 'À récupérer',
            picked: 'Récupéré',
            in_transit: 'En transit',
            delivered: 'Livré'
        }
        return <Badge className={`${styles[status]} border text-xs`}>{labels[status]}</Badge>
    }

    const startDelivery = (id: string) => {
        setDeliveries(deliveries.map(d =>
            d.id === id ? { ...d, status: 'picked' as const } : d
        ))
        toast.success('Livraison démarrée')
    }

    const completeDelivery = (id: string) => {
        setDeliveries(deliveries.map(d =>
            d.id === id ? { ...d, status: 'delivered' as const } : d
        ))
        toast.success('Livraison terminée!')
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-2xl font-black tracking-tight">Optimisation Itinéraire</h3>
                    <p className="text-sm text-muted-foreground">Planifiez vos livraisons efficacement</p>
                </div>
                <div className="flex gap-2">
                    <Button
                        variant="outline"
                        className="rounded-xl"
                        onClick={handleOptimizeRoute}
                        disabled={isOptimizing || pendingDeliveries.length === 0}
                    >
                        {isOptimizing ? (
                            <><RotateCcw className="h-4 w-4 mr-2 animate-spin" /> Optimisation...</>
                        ) : (
                            <><Zap className="h-4 w-4 mr-2" /> Optimiser</>
                        )}
                    </Button>
                    <Button className="rounded-xl">
                        <Navigation className="h-4 w-4 mr-2" /> Démarrer navigation
                    </Button>
                </div>
            </div>


            {/* Real-time Traffic Alerts (P2 Feature) */}
            <div className="bg-orange-50 border-l-4 border-orange-500 p-4 rounded-r-lg animate-in slide-in-from-top-2">
                <div className="flex items-start gap-3">
                    <AlertTriangle className="h-5 w-5 text-orange-600 mt-0.5" />
                    <div>
                        <h4 className="text-sm font-bold text-orange-800">Ralentissement détecté - Pont H.K.B</h4>
                        <p className="text-xs text-orange-700 mt-1">
                            Trafic dense signalé. Retard estimé : <span className="font-black">+15 min</span>.
                            L'optimisation a automatiquement ajusté votre itinéraire.
                        </p>
                    </div>
                    <Button size="sm" variant="ghost" className="ml-auto text-orange-800 hover:bg-orange-100 h-8">
                        Ignorer
                    </Button>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="glass-card border-primary/20 bg-primary/5">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs text-muted-foreground font-bold uppercase">Livraisons</p>
                                <p className="text-3xl font-black text-primary">{routeStats.totalDeliveries}</p>
                            </div>
                            <Package className="h-8 w-8 text-primary" />
                        </div>
                    </CardContent>
                </Card>
                <Card className="glass-card border-blue-200 bg-blue-50">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs text-muted-foreground font-bold uppercase">Distance totale</p>
                                <p className="text-3xl font-black text-blue-700">{routeStats.totalDistance.toFixed(1)} km</p>
                            </div>
                            <Map className="h-8 w-8 text-blue-500" />
                        </div>
                    </CardContent>
                </Card>
                <Card className="glass-card border-orange-200 bg-orange-50">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs text-muted-foreground font-bold uppercase">Temps estimé</p>
                                <p className="text-3xl font-black text-orange-700">{routeStats.estimatedTime} min</p>
                            </div>
                            <Timer className="h-8 w-8 text-orange-500" />
                        </div>
                    </CardContent>
                </Card>
                <Card className="glass-card border-green-200 bg-green-50">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs text-muted-foreground font-bold uppercase">Coût carburant</p>
                                <p className="text-2xl font-black text-green-700">{routeStats.fuelCost.toLocaleString()} F</p>
                            </div>
                            <Fuel className="h-8 w-8 text-green-500" />
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Map Placeholder */}
            <Card className="glass-card overflow-hidden">
                <div className="h-64 bg-gradient-to-br from-blue-100 to-green-100 flex items-center justify-center relative">
                    <div className="absolute inset-0 opacity-30">
                        {/* Simulated map grid */}
                        <div className="w-full h-full" style={{
                            backgroundImage: 'linear-gradient(to right, #ccc 1px, transparent 1px), linear-gradient(to bottom, #ccc 1px, transparent 1px)',
                            backgroundSize: '30px 30px'
                        }} />
                    </div>
                    <div className="text-center relative z-10">
                        <Map className="h-12 w-12 mx-auto text-primary mb-2" />
                        <p className="font-bold">Carte d'itinéraire</p>
                        <p className="text-sm text-muted-foreground">Intégration Google Maps</p>
                    </div>
                    {/* Simulated delivery points */}
                    <div className="absolute top-1/4 left-1/4 w-6 h-6 bg-yellow-500 rounded-full border-2 border-white shadow-lg flex items-center justify-center">
                        <span className="text-white text-xs font-bold">1</span>
                    </div>
                    <div className="absolute top-1/2 left-1/2 w-6 h-6 bg-blue-500 rounded-full border-2 border-white shadow-lg flex items-center justify-center">
                        <span className="text-white text-xs font-bold">2</span>
                    </div>
                    <div className="absolute bottom-1/4 right-1/4 w-6 h-6 bg-green-500 rounded-full border-2 border-white shadow-lg flex items-center justify-center">
                        <span className="text-white text-xs font-bold">3</span>
                    </div>
                </div>
            </Card>

            {/* Deliveries List */}
            <div className="space-y-4">
                <h4 className="font-bold">Livraisons du jour</h4>

                {/* Urgent Deliveries */}
                {deliveries.filter(d => d.priority === 'urgent' && d.status !== 'delivered').length > 0 && (
                    <Card className="glass-card border-red-300 bg-red-50">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-base flex items-center gap-2 text-red-700">
                                <AlertTriangle className="h-4 w-4" /> Livraisons urgentes
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            {deliveries.filter(d => d.priority === 'urgent' && d.status !== 'delivered').map((delivery) => (
                                <DeliveryCard
                                    key={delivery.id}
                                    delivery={delivery}
                                    getStatusBadge={getStatusBadge}
                                    onStart={() => startDelivery(delivery.id)}
                                    onComplete={() => completeDelivery(delivery.id)}
                                    onView={() => {
                                        setSelectedDelivery(delivery)
                                        setIsDetailDialogOpen(true)
                                    }}
                                />
                            ))}
                        </CardContent>
                    </Card>
                )}

                {/* Regular Deliveries */}
                <div className="space-y-3">
                    {deliveries.filter(d => d.priority !== 'urgent' || d.status === 'delivered').map((delivery, index) => (
                        <DeliveryCard
                            key={delivery.id}
                            delivery={delivery}
                            index={index + 1}
                            getStatusBadge={getStatusBadge}
                            onStart={() => startDelivery(delivery.id)}
                            onComplete={() => completeDelivery(delivery.id)}
                            onView={() => {
                                setSelectedDelivery(delivery)
                                setIsDetailDialogOpen(true)
                            }}
                        />
                    ))}
                </div>
            </div>

            {/* Detail Dialog */}
            <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Package className="h-5 w-5 text-primary" />
                            Livraison {selectedDelivery?.orderId}
                        </DialogTitle>
                    </DialogHeader>
                    {selectedDelivery && (
                        <div className="space-y-4 py-4">
                            <div className="bg-gray-50 p-4 rounded-xl">
                                <div className="flex items-center gap-2 mb-2">
                                    <MapPin className="h-4 w-4 text-primary" />
                                    <span className="font-bold">{selectedDelivery.patient}</span>
                                </div>
                                <p className="text-sm text-muted-foreground">{selectedDelivery.address}</p>
                                <a href={`tel:${selectedDelivery.patientPhone}`} className="text-sm text-primary flex items-center gap-1 mt-2">
                                    <Phone className="h-3 w-3" /> {selectedDelivery.patientPhone}
                                </a>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <Card className="p-3">
                                    <p className="text-xs text-muted-foreground">Distance</p>
                                    <p className="font-bold text-lg">{selectedDelivery.distance} km</p>
                                </Card>
                                <Card className="p-3">
                                    <p className="text-xs text-muted-foreground">Temps estimé</p>
                                    <p className="font-bold text-lg">{selectedDelivery.estimatedTime} min</p>
                                </Card>
                            </div>
                            <div className="bg-blue-50 p-3 rounded-lg text-sm">
                                <p className="font-bold text-blue-700">Pharmacie: {selectedDelivery.pharmacy}</p>
                            </div>
                        </div>
                    )}
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsDetailDialogOpen(false)}>Fermer</Button>
                        <Button>
                            <Navigation className="h-4 w-4 mr-2" /> Naviguer
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div >
    )
}

const DeliveryCard = ({
    delivery,
    index,
    getStatusBadge,
    onStart,
    onComplete,
    onView
}: {
    delivery: Delivery
    index?: number
    getStatusBadge: (status: string) => JSX.Element
    onStart: () => void
    onComplete: () => void
    onView: () => void
}) => {
    return (
        <Card className={`glass-card ${delivery.status === 'delivered' ? 'opacity-60' : ''}`}>
            <CardContent className="p-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        {index && delivery.status === 'pending' && (
                            <div className="w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center font-bold">
                                {index}
                            </div>
                        )}
                        {delivery.status !== 'pending' && (
                            <div className={`p-2 rounded-xl ${delivery.status === 'delivered' ? 'bg-green-100' : 'bg-blue-100'
                                }`}>
                                {delivery.status === 'delivered' ? (
                                    <CheckCircle className="h-5 w-5 text-green-600" />
                                ) : (
                                    <Truck className="h-5 w-5 text-blue-600" />
                                )}
                            </div>
                        )}
                        <div>
                            <div className="flex items-center gap-2">
                                <h4 className="font-bold">{delivery.patient}</h4>
                                {getStatusBadge(delivery.status)}
                                {delivery.priority === 'urgent' && (
                                    <Badge className="bg-red-100 text-red-700 text-xs">Urgent</Badge>
                                )}
                            </div>
                            <p className="text-sm text-muted-foreground">
                                <MapPin className="h-3 w-3 inline mr-1" />
                                {delivery.address}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="text-right">
                            <p className="font-bold">{delivery.distance} km</p>
                            <p className="text-xs text-muted-foreground">~{delivery.estimatedTime} min</p>
                        </div>
                        <div className="flex gap-2">
                            <Button variant="outline" size="icon" className="rounded-lg" onClick={onView}>
                                <Eye className="h-4 w-4" />
                            </Button>
                            {delivery.status === 'pending' && (
                                <Button size="sm" className="rounded-lg" onClick={onStart}>
                                    <ArrowRight className="h-4 w-4" />
                                </Button>
                            )}
                            {(delivery.status === 'picked' || delivery.status === 'in_transit') && (
                                <Button size="sm" className="rounded-lg bg-green-600 hover:bg-green-700" onClick={onComplete}>
                                    <CheckCircle className="h-4 w-4" />
                                </Button>
                            )}
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}

export default RouteOptimizationSection
