import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Switch } from '@/components/ui/switch'
import {
    AlertTriangle,
    Package,
    Bell,
    BellOff,
    TrendingDown,
    ShoppingCart,
    RefreshCw,
    Clock,
    Truck,
    CheckCircle,
    XCircle,
    ChevronRight,
    Settings
} from 'lucide-react'
import { toast } from 'sonner'

interface StockAlert {
    id: string
    medicationName: string
    currentStock: number
    minStock: number
    maxStock: number
    status: 'critical' | 'low' | 'normal' | 'excess'
    lastRestocked: string
    dailyConsumption: number
    daysUntilEmpty: number
    autoReorder: boolean
    supplier: string
    reorderQuantity: number
}

const mockAlerts: StockAlert[] = [
    {
        id: '1',
        medicationName: 'Insuline Lantus 100UI',
        currentStock: 5,
        minStock: 20,
        maxStock: 100,
        status: 'critical',
        lastRestocked: '2024-12-01',
        dailyConsumption: 3,
        daysUntilEmpty: 2,
        autoReorder: true,
        supplier: 'Pharma Distrib CI',
        reorderQuantity: 50
    },
    {
        id: '2',
        medicationName: 'Amoxicilline 500mg',
        currentStock: 45,
        minStock: 50,
        maxStock: 200,
        status: 'low',
        lastRestocked: '2024-12-05',
        dailyConsumption: 8,
        daysUntilEmpty: 6,
        autoReorder: true,
        supplier: 'Pharma Distrib CI',
        reorderQuantity: 100
    },
    {
        id: '3',
        medicationName: 'Doliprane 1000mg',
        currentStock: 180,
        minStock: 30,
        maxStock: 150,
        status: 'excess',
        lastRestocked: '2024-12-06',
        dailyConsumption: 5,
        daysUntilEmpty: 36,
        autoReorder: false,
        supplier: 'MediStock Afrique',
        reorderQuantity: 50
    },
    {
        id: '4',
        medicationName: 'Paracétamol Sirop',
        currentStock: 75,
        minStock: 40,
        maxStock: 120,
        status: 'normal',
        lastRestocked: '2024-12-04',
        dailyConsumption: 4,
        daysUntilEmpty: 19,
        autoReorder: true,
        supplier: 'Pharma Distrib CI',
        reorderQuantity: 60
    }
]

export const StockAlertsEnhanced = () => {
    const [alerts, setAlerts] = useState<StockAlert[]>(mockAlerts)
    const [notificationsEnabled, setNotificationsEnabled] = useState(true)
    const [isRefreshing, setIsRefreshing] = useState(false)

    const getStatusConfig = (status: StockAlert['status']) => {
        const configs = {
            critical: {
                color: 'bg-red-100 text-red-700 border-red-200',
                icon: XCircle,
                label: 'CRITIQUE',
                progressColor: 'bg-red-500'
            },
            low: {
                color: 'bg-orange-100 text-orange-700 border-orange-200',
                icon: AlertTriangle,
                label: 'BAS',
                progressColor: 'bg-orange-500'
            },
            normal: {
                color: 'bg-green-100 text-green-700 border-green-200',
                icon: CheckCircle,
                label: 'NORMAL',
                progressColor: 'bg-green-500'
            },
            excess: {
                color: 'bg-blue-100 text-blue-700 border-blue-200',
                icon: Package,
                label: 'EXCÈS',
                progressColor: 'bg-blue-500'
            }
        }
        return configs[status]
    }

    const handleReorder = (alert: StockAlert) => {
        toast.success(`Commande de ${alert.reorderQuantity} ${alert.medicationName} envoyée à ${alert.supplier}`)
    }

    const toggleAutoReorder = (id: string) => {
        setAlerts(prev => prev.map(a =>
            a.id === id ? { ...a, autoReorder: !a.autoReorder } : a
        ))
        toast.success('Paramètre de réapprovisionnement automatique mis à jour')
    }

    const refreshStock = async () => {
        setIsRefreshing(true)
        await new Promise(resolve => setTimeout(resolve, 1500))
        setIsRefreshing(false)
        toast.success('Stock actualisé')
    }

    const criticalCount = alerts.filter(a => a.status === 'critical').length
    const lowCount = alerts.filter(a => a.status === 'low').length

    return (
        <div className="space-y-6">
            {/* Alert Summary */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className={`glass-card ${criticalCount > 0 ? 'border-red-300 bg-red-50/50 animate-pulse' : 'border-white/20'}`}>
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className={`p-2 rounded-xl ${criticalCount > 0 ? 'bg-red-500' : 'bg-slate-200'} text-white`}>
                                    <XCircle className="h-5 w-5" />
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground font-bold">Critiques</p>
                                    <p className="text-2xl font-black text-red-600">{criticalCount}</p>
                                </div>
                            </div>
                            {criticalCount > 0 && (
                                <Badge className="bg-red-500 text-white animate-bounce">ACTION</Badge>
                            )}
                        </div>
                    </CardContent>
                </Card>

                <Card className="glass-card border-orange-200/50 bg-orange-50/30">
                    <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-orange-500/10 rounded-xl">
                                <AlertTriangle className="h-5 w-5 text-orange-600" />
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground font-bold">Stock Bas</p>
                                <p className="text-2xl font-black text-orange-600">{lowCount}</p>
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
                                <p className="text-xs text-muted-foreground font-bold">Stock OK</p>
                                <p className="text-2xl font-black text-green-600">
                                    {alerts.filter(a => a.status === 'normal').length}
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="glass-card border-blue-200/50 bg-blue-50/30">
                    <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-500/10 rounded-xl">
                                <Truck className="h-5 w-5 text-blue-600" />
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground font-bold">Auto-Réappro</p>
                                <p className="text-2xl font-black text-blue-600">
                                    {alerts.filter(a => a.autoReorder).length}
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Controls */}
            <Card className="glass-morphism border-white/20">
                <CardContent className="p-4">
                    <div className="flex flex-wrap justify-between items-center gap-4">
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2">
                                <Switch
                                    checked={notificationsEnabled}
                                    onCheckedChange={setNotificationsEnabled}
                                />
                                <label className="text-sm font-medium flex items-center gap-2">
                                    {notificationsEnabled ? (
                                        <><Bell className="h-4 w-4 text-primary" /> Alertes activées</>
                                    ) : (
                                        <><BellOff className="h-4 w-4 text-muted-foreground" /> Alertes désactivées</>
                                    )}
                                </label>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                className="rounded-xl"
                                onClick={refreshStock}
                                disabled={isRefreshing}
                            >
                                <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
                                Actualiser
                            </Button>
                            <Button variant="outline" className="rounded-xl">
                                <Settings className="h-4 w-4 mr-2" />
                                Seuils
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Alert List */}
            <div className="space-y-4">
                {alerts.sort((a, b) => {
                    const priority = { critical: 0, low: 1, excess: 2, normal: 3 }
                    return priority[a.status] - priority[b.status]
                }).map((alert) => {
                    const config = getStatusConfig(alert.status)
                    const Icon = config.icon
                    const stockPercentage = Math.min(100, (alert.currentStock / alert.maxStock) * 100)

                    return (
                        <Card key={alert.id} className={`glass-card border-l-4 ${alert.status === 'critical' ? 'border-l-red-500' :
                                alert.status === 'low' ? 'border-l-orange-500' :
                                    alert.status === 'excess' ? 'border-l-blue-500' :
                                        'border-l-green-500'
                            }`}>
                            <CardContent className="p-4">
                                <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                                    {/* Info */}
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <Badge className={`${config.color} border text-[10px] font-black`}>
                                                <Icon className="h-3 w-3 mr-1" />
                                                {config.label}
                                            </Badge>
                                            <h4 className="font-bold">{alert.medicationName}</h4>
                                        </div>

                                        <div className="space-y-2">
                                            <div className="flex items-center gap-2 text-sm">
                                                <span className="text-muted-foreground">Stock:</span>
                                                <span className="font-bold">{alert.currentStock}</span>
                                                <span className="text-muted-foreground">/ {alert.maxStock} (min: {alert.minStock})</span>
                                            </div>
                                            <Progress value={stockPercentage} className={`h-2 ${config.progressColor}`} />
                                        </div>

                                        <div className="flex flex-wrap gap-4 mt-3 text-xs text-muted-foreground">
                                            <span className="flex items-center gap-1">
                                                <TrendingDown className="h-3 w-3" />
                                                {alert.dailyConsumption}/jour
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <Clock className="h-3 w-3" />
                                                {alert.daysUntilEmpty} jours restants
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <Package className="h-3 w-3" />
                                                Dernier: {alert.lastRestocked}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex items-center gap-3">
                                        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/10 border border-white/20">
                                            <Switch
                                                checked={alert.autoReorder}
                                                onCheckedChange={() => toggleAutoReorder(alert.id)}
                                                className="scale-75"
                                            />
                                            <span className="text-xs font-medium">Auto</span>
                                        </div>

                                        <Button
                                            onClick={() => handleReorder(alert)}
                                            className="rounded-xl"
                                            variant={alert.status === 'critical' ? 'destructive' : 'default'}
                                        >
                                            <ShoppingCart className="h-4 w-4 mr-2" />
                                            Commander {alert.reorderQuantity}
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )
                })}
            </div>
        </div>
    )
}
