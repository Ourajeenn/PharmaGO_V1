import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Progress } from '@/components/ui/progress'
import {
    Package,
    ArrowRightLeft,
    MapPin,
    Clock,
    CheckCircle,
    AlertTriangle,
    Truck,
    Building2,
    Search,
    Filter,
    Phone,
    Send
} from 'lucide-react'
import { toast } from 'sonner'

interface RedistributionRequest {
    id: string
    medicationName: string
    quantity: number
    fromPharmacy: string
    toPharmacy: string
    status: 'pending' | 'approved' | 'in_transit' | 'delivered' | 'rejected'
    urgency: 'low' | 'medium' | 'high'
    requestDate: string
    estimatedArrival?: string
}

interface NearbyPharmacy {
    id: string
    name: string
    distance: string
    stock: number
    price: number
    available: boolean
}

const mockRequests: RedistributionRequest[] = [
    {
        id: 'RD001',
        medicationName: 'Insuline Lantus 100UI',
        quantity: 50,
        fromPharmacy: 'Pharmacie Centrale Cocody',
        toPharmacy: 'Pharmacie du Plateau',
        status: 'in_transit',
        urgency: 'high',
        requestDate: '2024-12-08',
        estimatedArrival: '14:30'
    },
    {
        id: 'RD002',
        medicationName: 'Amoxicilline 500mg',
        quantity: 200,
        fromPharmacy: 'Pharmacie Sainte Marie',
        toPharmacy: 'Pharmacie du Plateau',
        status: 'pending',
        urgency: 'medium',
        requestDate: '2024-12-08'
    },
    {
        id: 'RD003',
        medicationName: 'Doliprane 1000mg',
        quantity: 100,
        fromPharmacy: 'Pharmacie Moderne',
        toPharmacy: 'Pharmacie du Plateau',
        status: 'delivered',
        urgency: 'low',
        requestDate: '2024-12-07'
    }
]

const mockNearbyPharmacies: NearbyPharmacy[] = [
    { id: '1', name: 'Pharmacie Centrale Cocody', distance: '2.3 km', stock: 150, price: 12500, available: true },
    { id: '2', name: 'Pharmacie Sainte Marie', distance: '3.8 km', stock: 80, price: 12000, available: true },
    { id: '3', name: 'Pharmacie Moderne', distance: '5.1 km', stock: 0, price: 13000, available: false },
    { id: '4', name: 'Pharmacie du Commerce', distance: '6.2 km', stock: 45, price: 11800, available: true }
]

export const PharmacyRedistribution = () => {
    const [requests] = useState<RedistributionRequest[]>(mockRequests)
    const [searchMedication, setSearchMedication] = useState('')
    const [requestQuantity, setRequestQuantity] = useState('')
    const [selectedPharmacy, setSelectedPharmacy] = useState<string | null>(null)

    const getStatusBadge = (status: RedistributionRequest['status']) => {
        const styles = {
            pending: 'bg-yellow-100 text-yellow-700 border-yellow-200',
            approved: 'bg-blue-100 text-blue-700 border-blue-200',
            in_transit: 'bg-purple-100 text-purple-700 border-purple-200',
            delivered: 'bg-green-100 text-green-700 border-green-200',
            rejected: 'bg-red-100 text-red-700 border-red-200'
        }
        const labels = {
            pending: 'En attente',
            approved: 'Approuvé',
            in_transit: 'En transit',
            delivered: 'Livré',
            rejected: 'Rejeté'
        }
        return (
            <Badge className={`${styles[status]} border text-[10px] font-bold`}>
                {labels[status]}
            </Badge>
        )
    }

    const getUrgencyBadge = (urgency: RedistributionRequest['urgency']) => {
        const styles = {
            low: 'bg-slate-100 text-slate-600',
            medium: 'bg-orange-100 text-orange-600',
            high: 'bg-red-100 text-red-600'
        }
        const labels = {
            low: 'Faible',
            medium: 'Moyen',
            high: 'Urgent'
        }
        return (
            <Badge variant="outline" className={`${styles[urgency]} text-[9px] font-black`}>
                {labels[urgency]}
            </Badge>
        )
    }

    const handleRequestTransfer = () => {
        if (!selectedPharmacy || !requestQuantity) {
            toast.error('Veuillez sélectionner une pharmacie et une quantité')
            return
        }
        toast.success('Demande de transfert envoyée avec succès!')
        setSelectedPharmacy(null)
        setRequestQuantity('')
        setSearchMedication('')
    }

    return (
        <div className="space-y-6">
            {/* Header Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="glass-card border-purple-200/50 bg-purple-50/30">
                    <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-purple-500/10 rounded-xl">
                                <ArrowRightLeft className="h-5 w-5 text-purple-600" />
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground font-bold">Transferts Actifs</p>
                                <p className="text-2xl font-black">3</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="glass-card border-green-200/50 bg-green-50/30">
                    <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-green-500/10 rounded-xl">
                                <CheckCircle className="h-5 w-5 text-green-600" />
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground font-bold">Complétés (mois)</p>
                                <p className="text-2xl font-black">47</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="glass-card border-blue-200/50 bg-blue-50/30">
                    <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-500/10 rounded-xl">
                                <Building2 className="h-5 w-5 text-blue-600" />
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground font-bold">Pharmacies Partenaires</p>
                                <p className="text-2xl font-black">12</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="glass-card border-orange-200/50 bg-orange-50/30">
                    <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-orange-500/10 rounded-xl">
                                <Clock className="h-5 w-5 text-orange-600" />
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground font-bold">Délai Moyen</p>
                                <p className="text-2xl font-black">2.5h</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Request New Transfer */}
                <Card className="glass-morphism border-white/20">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Send className="h-5 w-5 text-primary" />
                            Demander un Transfert
                        </CardTitle>
                        <CardDescription>
                            Rechercher un médicament dans les pharmacies partenaires
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Rechercher un médicament..."
                                value={searchMedication}
                                onChange={(e) => setSearchMedication(e.target.value)}
                                className="pl-10 rounded-xl"
                            />
                        </div>

                        <div className="space-y-2">
                            <p className="text-xs font-bold text-muted-foreground uppercase">Pharmacies avec stock disponible</p>
                            <div className="space-y-2 max-h-60 overflow-y-auto">
                                {mockNearbyPharmacies.filter(p => p.available).map((pharmacy) => (
                                    <div
                                        key={pharmacy.id}
                                        onClick={() => setSelectedPharmacy(pharmacy.id)}
                                        className={`p-3 rounded-xl border cursor-pointer transition-all ${selectedPharmacy === pharmacy.id
                                                ? 'border-primary bg-primary/10'
                                                : 'border-white/20 hover:border-primary/50'
                                            }`}
                                    >
                                        <div className="flex justify-between items-center">
                                            <div>
                                                <p className="font-bold text-sm">{pharmacy.name}</p>
                                                <p className="text-xs text-muted-foreground flex items-center gap-1">
                                                    <MapPin className="h-3 w-3" /> {pharmacy.distance}
                                                </p>
                                            </div>
                                            <div className="text-right">
                                                <p className="font-bold text-primary">{pharmacy.stock} unités</p>
                                                <p className="text-xs text-muted-foreground">{pharmacy.price.toLocaleString()} F/u</p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <Input
                                type="number"
                                placeholder="Quantité"
                                value={requestQuantity}
                                onChange={(e) => setRequestQuantity(e.target.value)}
                                className="rounded-xl w-32"
                            />
                            <Button
                                onClick={handleRequestTransfer}
                                className="flex-1 rounded-xl"
                                disabled={!selectedPharmacy || !requestQuantity}
                            >
                                <Truck className="h-4 w-4 mr-2" />
                                Demander Transfert
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Active Requests */}
                <Card className="glass-morphism border-white/20">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Package className="h-5 w-5 text-primary" />
                            Transferts en Cours
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {requests.map((request) => (
                            <div key={request.id} className="p-4 rounded-xl border border-white/20 bg-white/5 space-y-3">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h4 className="font-bold">{request.medicationName}</h4>
                                        <p className="text-xs text-muted-foreground">#{request.id} • {request.quantity} unités</p>
                                    </div>
                                    <div className="flex gap-2">
                                        {getUrgencyBadge(request.urgency)}
                                        {getStatusBadge(request.status)}
                                    </div>
                                </div>

                                <div className="flex items-center gap-2 text-xs">
                                    <span className="text-muted-foreground">De:</span>
                                    <span className="font-medium">{request.fromPharmacy}</span>
                                </div>

                                {request.status === 'in_transit' && (
                                    <div className="space-y-2">
                                        <div className="flex justify-between text-xs">
                                            <span className="text-muted-foreground">En route...</span>
                                            <span className="font-bold text-primary">Arrivée prévue: {request.estimatedArrival}</span>
                                        </div>
                                        <Progress value={65} className="h-2" />
                                    </div>
                                )}

                                {request.status === 'pending' && (
                                    <div className="flex gap-2">
                                        <Button size="sm" variant="outline" className="flex-1 rounded-lg text-xs">
                                            <Phone className="h-3 w-3 mr-1" />
                                            Contacter
                                        </Button>
                                        <Button size="sm" variant="destructive" className="rounded-lg text-xs">
                                            Annuler
                                        </Button>
                                    </div>
                                )}
                            </div>
                        ))}
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
