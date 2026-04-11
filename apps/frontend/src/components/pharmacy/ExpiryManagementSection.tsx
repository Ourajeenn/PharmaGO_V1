import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import {
    Calendar, AlertTriangle, Clock, Package, Trash2,
    Search, Filter, ArrowUpDown, Eye, RefreshCw,
    CheckCircle, XCircle, TrendingDown, Bell
} from 'lucide-react'
import { toast } from 'sonner'

interface ExpiringProduct {
    id: string
    name: string
    batch: string
    quantity: number
    expiryDate: string
    daysUntilExpiry: number
    value: number
    action: 'discount' | 'return' | 'destroy' | 'none'
}

export const ExpiryManagementSection = () => {
    const [searchQuery, setSearchQuery] = useState('')
    const [selectedTab, setSelectedTab] = useState('critical')

    // Mock data
    const [products] = useState<ExpiringProduct[]>([
        { id: '1', name: 'Amoxicilline 500mg', batch: 'LOT-2024-001', quantity: 45, expiryDate: '2026-02-20', daysUntilExpiry: 14, value: 67500, action: 'discount' },
        { id: '2', name: 'Doliprane 1000mg', batch: 'LOT-2024-015', quantity: 120, expiryDate: '2026-02-15', daysUntilExpiry: 9, value: 42000, action: 'discount' },
        { id: '3', name: 'Vitamine C 500mg', batch: 'LOT-2024-022', quantity: 80, expiryDate: '2026-02-28', daysUntilExpiry: 22, value: 32000, action: 'none' },
        { id: '4', name: 'Ibuprofène 400mg', batch: 'LOT-2024-008', quantity: 30, expiryDate: '2026-03-15', daysUntilExpiry: 37, value: 18000, action: 'none' },
        { id: '5', name: 'Oméprazole 20mg', batch: 'LOT-2023-156', quantity: 25, expiryDate: '2026-02-10', daysUntilExpiry: 4, value: 75000, action: 'return' },
        { id: '6', name: 'Insuline Lantus', batch: 'LOT-2024-003', quantity: 10, expiryDate: '2026-02-08', daysUntilExpiry: 2, value: 185000, action: 'return' },
        { id: '7', name: 'Sérum physiologique', batch: 'LOT-2023-089', quantity: 200, expiryDate: '2026-01-30', daysUntilExpiry: -7, value: 40000, action: 'destroy' }
    ])

    const criticalProducts = products.filter(p => p.daysUntilExpiry <= 14 && p.daysUntilExpiry > 0)
    const warningProducts = products.filter(p => p.daysUntilExpiry > 14 && p.daysUntilExpiry <= 60)
    const expiredProducts = products.filter(p => p.daysUntilExpiry <= 0)

    const stats = {
        totalAtRisk: criticalProducts.reduce((sum, p) => sum + p.value, 0),
        criticalCount: criticalProducts.length,
        expiredValue: expiredProducts.reduce((sum, p) => sum + p.value, 0),
        savedThisMonth: 125000
    }

    const getExpiryBadge = (days: number) => {
        if (days <= 0) {
            return <Badge className="bg-gray-800 text-white border-gray-900 text-xs">Expiré</Badge>
        } else if (days <= 7) {
            return <Badge className="bg-red-100 text-red-700 border-red-200 animate-pulse text-xs">{days}j</Badge>
        } else if (days <= 14) {
            return <Badge className="bg-orange-100 text-orange-700 border-orange-200 text-xs">{days}j</Badge>
        } else if (days <= 30) {
            return <Badge className="bg-yellow-100 text-yellow-700 border-yellow-200 text-xs">{days}j</Badge>
        } else {
            return <Badge className="bg-green-100 text-green-700 border-green-200 text-xs">{days}j</Badge>
        }
    }

    const getActionBadge = (action: string) => {
        const styles: Record<string, { bg: string; text: string; label: string }> = {
            discount: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Promotion' },
            return: { bg: 'bg-purple-100', text: 'text-purple-700', label: 'Retour fournisseur' },
            destroy: { bg: 'bg-gray-100', text: 'text-gray-700', label: 'À détruire' },
            none: { bg: 'bg-white', text: 'text-gray-500', label: 'Non défini' }
        }
        const style = styles[action] || styles.none
        return <Badge className={`${style.bg} ${style.text} border text-xs`}>{style.label}</Badge>
    }

    const handleAction = (productId: string, action: string) => {
        toast.success(`Action "${action}" appliquée`)
    }

    const filteredProducts = products.filter(p =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.batch.toLowerCase().includes(searchQuery.toLowerCase())
    )

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-2xl font-black tracking-tight">Gestion des Péremptions</h3>
                    <p className="text-sm text-muted-foreground">Surveillez et gérez les produits en fin de vie</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" className="rounded-xl">
                        <RefreshCw className="h-4 w-4 mr-2" /> Actualiser
                    </Button>
                    <Button variant="outline" className="rounded-xl">
                        <Bell className="h-4 w-4 mr-2" /> Alertes
                    </Button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="glass-card border-red-200 bg-gradient-to-br from-red-50 to-orange-50">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs text-muted-foreground font-bold uppercase">Valeur à risque</p>
                                <p className="text-2xl font-black text-red-700">{stats.totalAtRisk.toLocaleString()} F</p>
                            </div>
                            <AlertTriangle className="h-8 w-8 text-red-500" />
                        </div>
                    </CardContent>
                </Card>
                <Card className="glass-card border-orange-200 bg-orange-50">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs text-muted-foreground font-bold uppercase">Produits critiques</p>
                                <p className="text-3xl font-black text-orange-700">{stats.criticalCount}</p>
                            </div>
                            <Clock className="h-8 w-8 text-orange-500" />
                        </div>
                    </CardContent>
                </Card>
                <Card className="glass-card border-gray-300 bg-gray-50">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs text-muted-foreground font-bold uppercase">Produits expirés</p>
                                <p className="text-2xl font-black text-gray-700">{stats.expiredValue.toLocaleString()} F</p>
                            </div>
                            <XCircle className="h-8 w-8 text-gray-500" />
                        </div>
                    </CardContent>
                </Card>
                <Card className="glass-card border-green-200 bg-green-50">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs text-muted-foreground font-bold uppercase">Économies ce mois</p>
                                <p className="text-2xl font-black text-green-700">{stats.savedThisMonth.toLocaleString()} F</p>
                            </div>
                            <TrendingDown className="h-8 w-8 text-green-500" />
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Urgent Alert */}
            {expiredProducts.length > 0 && (
                <Card className="glass-card border-red-400 bg-red-50">
                    <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="p-3 bg-red-100 rounded-xl animate-pulse">
                                <AlertTriangle className="h-6 w-6 text-red-600" />
                            </div>
                            <div className="flex-1">
                                <p className="font-bold text-red-700">{expiredProducts.length} produit(s) expiré(s) à traiter</p>
                                <p className="text-sm text-red-600">Valeur totale: {stats.expiredValue.toLocaleString()} F</p>
                            </div>
                            <Button className="bg-red-600 hover:bg-red-700 rounded-xl">
                                <Trash2 className="h-4 w-4 mr-2" /> Traiter les expirés
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Search */}
            <div className="flex gap-2">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Rechercher produit ou lot..."
                        className="pl-9 rounded-xl"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <Button variant="outline" size="sm" className="rounded-xl">
                    <Filter className="h-4 w-4 mr-2" /> Filtrer
                </Button>
                <Button variant="outline" size="sm" className="rounded-xl">
                    <ArrowUpDown className="h-4 w-4 mr-2" /> Trier
                </Button>
            </div>

            <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-4">
                <TabsList className="bg-white/50 p-1 rounded-xl">
                    <TabsTrigger value="critical" className="rounded-lg">
                        Critique ({criticalProducts.length})
                    </TabsTrigger>
                    <TabsTrigger value="warning" className="rounded-lg">
                        Attention ({warningProducts.length})
                    </TabsTrigger>
                    <TabsTrigger value="expired" className="rounded-lg">
                        Expirés ({expiredProducts.length})
                    </TabsTrigger>
                    <TabsTrigger value="all" className="rounded-lg">
                        Tous
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="critical" className="space-y-3">
                    {criticalProducts.map((product) => (
                        <ProductCard key={product.id} product={product} getExpiryBadge={getExpiryBadge} getActionBadge={getActionBadge} onAction={handleAction} />
                    ))}
                </TabsContent>

                <TabsContent value="warning" className="space-y-3">
                    {warningProducts.map((product) => (
                        <ProductCard key={product.id} product={product} getExpiryBadge={getExpiryBadge} getActionBadge={getActionBadge} onAction={handleAction} />
                    ))}
                </TabsContent>

                <TabsContent value="expired" className="space-y-3">
                    {expiredProducts.map((product) => (
                        <ProductCard key={product.id} product={product} getExpiryBadge={getExpiryBadge} getActionBadge={getActionBadge} onAction={handleAction} />
                    ))}
                </TabsContent>

                <TabsContent value="all" className="space-y-3">
                    {filteredProducts.map((product) => (
                        <ProductCard key={product.id} product={product} getExpiryBadge={getExpiryBadge} getActionBadge={getActionBadge} onAction={handleAction} />
                    ))}
                </TabsContent>
            </Tabs>
        </div>
    )
}

const ProductCard = ({
    product,
    getExpiryBadge,
    getActionBadge,
    onAction
}: {
    product: ExpiringProduct
    getExpiryBadge: (days: number) => JSX.Element
    getActionBadge: (action: string) => JSX.Element
    onAction: (id: string, action: string) => void
}) => {
    const urgencyProgress = Math.max(0, Math.min(100, (30 - product.daysUntilExpiry) / 30 * 100))

    return (
        <Card className={`glass-card ${product.daysUntilExpiry <= 0 ? 'opacity-60 border-gray-300' : ''}`}>
            <CardContent className="p-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className={`p-3 rounded-xl ${product.daysUntilExpiry <= 7 ? 'bg-red-100' : product.daysUntilExpiry <= 14 ? 'bg-orange-100' : 'bg-yellow-100'}`}>
                            <Package className={`h-5 w-5 ${product.daysUntilExpiry <= 7 ? 'text-red-600' : product.daysUntilExpiry <= 14 ? 'text-orange-600' : 'text-yellow-600'}`} />
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h4 className="font-bold">{product.name}</h4>
                                {getExpiryBadge(product.daysUntilExpiry)}
                            </div>
                            <p className="text-sm text-muted-foreground">Lot: {product.batch} • {product.quantity} unités</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="text-right">
                            <p className="font-bold">{product.value.toLocaleString()} F</p>
                            <p className="text-xs text-muted-foreground">
                                Expire le {new Date(product.expiryDate).toLocaleDateString('fr-FR')}
                            </p>
                        </div>
                        {getActionBadge(product.action)}
                        <div className="flex gap-1">
                            <Button
                                variant="outline"
                                size="sm"
                                className="rounded-lg text-blue-600"
                                onClick={() => onAction(product.id, 'discount')}
                            >
                                Promo
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                className="rounded-lg text-purple-600"
                                onClick={() => onAction(product.id, 'return')}
                            >
                                Retour
                            </Button>
                        </div>
                    </div>
                </div>
                <div className="mt-3">
                    <Progress value={urgencyProgress} className={`h-1 ${product.daysUntilExpiry <= 7 ? 'bg-red-100' : 'bg-orange-100'}`} />
                </div>
            </CardContent>
        </Card>
    )
}

export default ExpiryManagementSection
