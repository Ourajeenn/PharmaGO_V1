import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Progress } from '@/components/ui/progress'
import { useAuth } from '@/hooks/useAuth'
import { supabase } from '@/integrations/supabase/client'
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
    Send,
    X,
    Check,
    Loader2
} from 'lucide-react'
import { toast } from 'sonner'

interface RedistributionRequest {
    id: string
    medicationName: string
    quantity: number
    fromPharmacyId: string
    fromPharmacyName: string
    toPharmacyId: string
    toPharmacyName: string
    status: 'pending' | 'accepted' | 'in_transit' | 'completed' | 'rejected'
    urgency: 'normal' | 'high' | 'critical'
    created_at: string
}

interface NearbyPharmacyStock {
    pharmacyId: string
    pharmacyName: string
    distance: string
    stock: number
    price: number
    medicineName: string
}

export const PharmacyRedistribution = () => {
    const { user } = useAuth()
    const [requests, setRequests] = useState<RedistributionRequest[]>([])
    const [searchMedication, setSearchMedication] = useState('')
    const [requestQuantity, setRequestQuantity] = useState('')
    const [selectedStock, setSelectedStock] = useState<NearbyPharmacyStock | null>(null)
    const [searchResults, setSearchResults] = useState<NearbyPharmacyStock[]>([])
    const [isSearching, setIsSearching] = useState(false)
    const [loading, setLoading] = useState(true)
    const [currentPharmacy, setCurrentPharmacy] = useState<{ id: string, name: string } | null>(null)

    useEffect(() => {
        if (user) {
            initializeComponent()
        }
    }, [user])

    const initializeComponent = async () => {
        try {
            if (!user) return
            // Get current pharmacy
            const { data: pharmacy, error } = await supabase
                .from('pharmacies')
                .select('id, name')
                .eq('user_id', user.id)
                .single()

            if (error || !pharmacy) {
                console.error('Error fetching pharmacy:', error)
                return
            }

            setCurrentPharmacy(pharmacy)
            fetchRequests(pharmacy.id)
        } catch (error) {
            console.error('Error initializing:', error)
        } finally {
            setLoading(false)
        }
    }

    const fetchRequests = async (pharmacyId: string) => {
        try {
            // Using 'as any' because stock_transfers type definition might be missing in local types.ts yet
            const { data, error } = await supabase
                .from('stock_transfers' as any)
                .select(`
                    id,
                    medication_name,
                    quantity,
                    status,
                    urgency,
                    created_at,
                    from_pharmacy:pharmacies!from_pharmacy_id(id, name),
                    to_pharmacy:pharmacies!to_pharmacy_id(id, name)
                `)
                .or(`from_pharmacy_id.eq.${pharmacyId},to_pharmacy_id.eq.${pharmacyId}`)
                .order('created_at', { ascending: false })

            if (error) throw error

            const formattedRequests: RedistributionRequest[] = data.map((item: any) => ({
                id: item.id,
                medicationName: item.medication_name,
                quantity: item.quantity,
                fromPharmacyId: item.from_pharmacy?.id,
                fromPharmacyName: item.from_pharmacy?.name || 'Inconnu',
                toPharmacyId: item.to_pharmacy?.id,
                toPharmacyName: item.to_pharmacy?.name || 'Inconnu',
                status: item.status,
                urgency: item.urgency,
                created_at: new Date(item.created_at).toLocaleDateString()
            }))

            setRequests(formattedRequests)
        } catch (error) {
            console.error('Error fetching requests:', error)
            // toast.error("Erreur chargement transferts")
        }
    }

    const handleSearch = async () => {
        if (!searchMedication.trim() || !currentPharmacy) return

        setIsSearching(true)
        setSelectedStock(null)
        try {
            // 1. Find medicines matching name
            const { data: medicines } = await supabase
                .from('medicines')
                .select('id, name')
                .ilike('name', `%${searchMedication}%`)
                .limit(5)

            if (!medicines?.length) {
                setSearchResults([])
                setIsSearching(false)
                return
            }

            const medicineIds = medicines.map(m => m.id)

            // 2. Find inventory in OTHER pharmacies
            const { data: inventory, error } = await supabase
                .from('pharmacy_inventory')
                .select(`
                    quantity,
                    price,
                    pharmacies (id, name, latitude, longitude),
                    medicines (name)
                `)
                .in('medicine_id', medicineIds)
                .neq('pharmacy_id', currentPharmacy.id)
                .gt('quantity', 0)
                .limit(20) as any

            if (error) throw error

            if (inventory) {
                const results: NearbyPharmacyStock[] = inventory.map((item: any) => ({
                    pharmacyId: item.pharmacies?.id,
                    pharmacyName: item.pharmacies?.name,
                    // Mock distance calculation
                    distance: `${(Math.random() * 10).toFixed(1)} km`,
                    stock: item.quantity,
                    price: item.price,
                    medicineName: item.medicines?.name
                }))
                setSearchResults(results)
            }
        } catch (error) {
            console.error('Search error:', error)
            toast.error("Erreur lors de la recherche")
        } finally {
            setIsSearching(false)
        }
    }

    const handleRequestTransfer = async () => {
        if (!selectedStock || !requestQuantity || !currentPharmacy) {
            toast.error('Veuillez sélectionner une pharmacie et une quantité')
            return
        }

        try {
            const qty = parseInt(requestQuantity)
            if (qty > selectedStock.stock) {
                toast.error(`Quantité non disponible (Max: ${selectedStock.stock})`)
                return
            }

            const { error } = await supabase
                .from('stock_transfers' as any)
                .insert({
                    medication_name: selectedStock.medicineName,
                    quantity: qty,
                    from_pharmacy_id: selectedStock.pharmacyId,
                    to_pharmacy_id: currentPharmacy.id,
                    status: 'pending',
                    urgency: 'normal'
                })

            if (error) throw error

            toast.success('Demande de transfert envoyée avec succès!')
            setSelectedStock(null)
            setRequestQuantity('')
            setSearchMedication('')
            setSearchResults([])
            fetchRequests(currentPharmacy.id)

        } catch (error) {
            console.error('Transfer request error:', error)
            toast.error("Échec de la demande")
        }
    }

    const updateStatus = async (id: string, newStatus: string) => {
        try {
            const { error } = await supabase
                .from('stock_transfers' as any)
                .update({ status: newStatus })
                .eq('id', id)

            if (error) throw error

            toast.success(`Statut mis à jour: ${newStatus}`)
            if (currentPharmacy) fetchRequests(currentPharmacy.id)
        } catch (error) {
            console.error('Update status error:', error)
            toast.error("Erreur mise à jour")
        }
    }

    const getStatusBadge = (status: RedistributionRequest['status']) => {
        const styles = {
            pending: 'bg-yellow-100 text-yellow-700 border-yellow-200',
            accepted: 'bg-blue-100 text-blue-700 border-blue-200',
            in_transit: 'bg-purple-100 text-purple-700 border-purple-200',
            completed: 'bg-green-100 text-green-700 border-green-200',
            rejected: 'bg-red-100 text-red-700 border-red-200'
        }
        const labels = {
            pending: 'En attente',
            accepted: 'Accepté',
            in_transit: 'En transit',
            completed: 'Terminé',
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
            normal: 'bg-slate-100 text-slate-600',
            high: 'bg-orange-100 text-orange-600',
            critical: 'bg-red-100 text-red-600'
        }
        const labels = {
            normal: 'Normal',
            high: 'Urgent',
            critical: 'Critique'
        }
        return (
            <Badge variant="outline" className={`${styles[urgency]} text-[9px] font-black`}>
                {labels[urgency]}
            </Badge>
        )
    }

    if (loading) return <div className="p-8"><Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" /></div>

    const activeCount = requests.filter(r => ['pending', 'accepted', 'in_transit'].includes(r.status)).length

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
                                <p className="text-2xl font-black">{activeCount}</p>
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
                                <p className="text-xs text-muted-foreground font-bold">Complétés</p>
                                <p className="text-2xl font-black">
                                    {requests.filter(r => r.status === 'completed').length}
                                </p>
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
                                <p className="text-xs text-muted-foreground font-bold">Ma Pharmacie</p>
                                <p className="text-sm font-bold truncate max-w-[120px]">{currentPharmacy?.name}</p>
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
                            Rechercher un médicament dans les pharmacies partenaires pour dépannage.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="relative flex gap-2">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Rechercher médicament..."
                                    value={searchMedication}
                                    onChange={(e) => setSearchMedication(e.target.value)}
                                    className="pl-10 rounded-xl"
                                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                                />
                            </div>
                            <Button onClick={handleSearch} disabled={isSearching} className="rounded-xl">
                                {isSearching ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Chercher'}
                            </Button>
                        </div>

                        {searchResults.length > 0 && (
                            <div className="space-y-2">
                                <p className="text-xs font-bold text-muted-foreground uppercase">Disponibilité ({searchResults.length})</p>
                                <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                                    {searchResults.map((result) => (
                                        <div
                                            key={result.pharmacyId}
                                            onClick={() => setSelectedStock(result)}
                                            className={`p-3 rounded-xl border cursor-pointer transition-all ${selectedStock?.pharmacyId === result.pharmacyId
                                                ? 'border-primary bg-primary/10'
                                                : 'border-white/20 hover:border-primary/50'
                                                }`}
                                        >
                                            <div className="flex justify-between items-center">
                                                <div>
                                                    <p className="font-bold text-sm">{result.pharmacyName}</p>
                                                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                                                        <Package className="h-3 w-3" /> {result.medicineName}
                                                        <span className="mx-1">•</span>
                                                        <MapPin className="h-3 w-3" /> {result.distance}
                                                    </p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="font-bold text-primary">{result.stock} unités</p>
                                                    <p className="text-xs text-muted-foreground">{result.price.toLocaleString()} F</p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className="flex gap-3">
                            <Input
                                type="number"
                                placeholder="Quantité demandée"
                                value={requestQuantity}
                                onChange={(e) => setRequestQuantity(e.target.value)}
                                className="rounded-xl w-40"
                            />
                            <Button
                                onClick={handleRequestTransfer}
                                className="flex-1 rounded-xl"
                                disabled={!selectedStock || !requestQuantity}
                            >
                                <Truck className="h-4 w-4 mr-2" />
                                Envoyer Demande
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Active Requests */}
                <Card className="glass-morphism border-white/20">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Package className="h-5 w-5 text-primary" />
                            Historique des Transferts
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4 max-h-[500px] overflow-y-auto pr-1">
                        {requests.length === 0 ? (
                            <div className="text-center py-8 text-muted-foreground">
                                Aucune demande de transfert.
                            </div>
                        ) : (
                            requests.map((request) => (
                                <div key={request.id} className="p-4 rounded-xl border border-white/20 bg-white/5 space-y-3">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h4 className="font-bold">{request.medicationName}</h4>
                                            <p className="text-xs text-muted-foreground">#{request.id.substring(0, 8)} • {request.quantity} unités</p>
                                        </div>
                                        <div className="flex gap-2">
                                            {getUrgencyBadge(request.urgency)}
                                            {getStatusBadge(request.status)}
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2 text-xs bg-black/5 p-2 rounded-lg">
                                        <div className="flex-1">
                                            <span className="text-muted-foreground block">De:</span>
                                            <span className="font-bold truncate">{request.fromPharmacyName}</span>
                                        </div>
                                        <ArrowRightLeft className="h-3 w-3 text-muted-foreground" />
                                        <div className="flex-1 text-right">
                                            <span className="text-muted-foreground block">Vers:</span>
                                            <span className="font-bold truncate">{request.toPharmacyName}</span>
                                        </div>
                                    </div>

                                    {request.toPharmacyId === currentPharmacy?.id && request.status === 'in_transit' && (
                                        <Button
                                            size="sm"
                                            className="w-full bg-green-600 hover:bg-green-700"
                                            onClick={() => updateStatus(request.id, 'completed')}
                                        >
                                            <Check className="h-4 w-4 mr-2" />
                                            Confirmer la réception
                                        </Button>
                                    )}

                                    {request.fromPharmacyId === currentPharmacy?.id && request.status === 'pending' && (
                                        <div className="flex gap-2">
                                            <Button
                                                size="sm"
                                                className="flex-1 bg-blue-600 hover:bg-blue-700"
                                                onClick={() => updateStatus(request.id, 'accepted')}
                                            >
                                                Accepter
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="destructive"
                                                className="flex-1"
                                                onClick={() => updateStatus(request.id, 'rejected')}
                                            >
                                                Refuser
                                            </Button>
                                        </div>
                                    )}

                                    {request.fromPharmacyId === currentPharmacy?.id && request.status === 'accepted' && (
                                        <Button
                                            size="sm"
                                            className="w-full bg-purple-600 hover:bg-purple-700"
                                            onClick={() => updateStatus(request.id, 'in_transit')}
                                        >
                                            <Truck className="h-4 w-4 mr-2" />
                                            Expédier (En transit)
                                        </Button>
                                    )}
                                </div>
                            ))
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
