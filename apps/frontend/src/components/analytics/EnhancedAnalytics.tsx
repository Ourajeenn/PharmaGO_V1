import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import {
    TrendingUp,
    TrendingDown,
    Users,
    ShoppingCart,
    DollarSign,
    Package,
    Truck,
    FileText,
    Calendar,
    Activity,
    BarChart3,
    PieChart,
    ArrowUpRight,
    ArrowDownRight,
    RefreshCw,
    Download
} from 'lucide-react'
import { useAnalytics } from '@/hooks/useAnalytics'

interface MetricCard {
    title: string
    value: string
    change: number
    changeType: 'increase' | 'decrease' | 'neutral'
    icon: React.ElementType
    color: string
    trend: number[]
}

interface TopItem {
    name: string
    value: number
    percentage: number
    trend: 'up' | 'down' | 'stable'
}

// Keep these for now as placeholders until we implement aggressive aggregations
const topMedications: TopItem[] = [
    { name: 'Doliprane 1000mg', value: 2450, percentage: 18.5, trend: 'up' },
    { name: 'Amoxicilline 500mg', value: 1820, percentage: 13.7, trend: 'up' },
    { name: 'Metformine 850mg', value: 1540, percentage: 11.6, trend: 'stable' },
    { name: 'Losartan 50mg', value: 1280, percentage: 9.6, trend: 'up' },
    { name: 'Oméprazole 20mg', value: 1120, percentage: 8.4, trend: 'down' }
]

const topPharmacies: TopItem[] = [
    { name: 'Pharmacie Centrale Cocody', value: 450000, percentage: 22.3, trend: 'up' },
    { name: 'Pharmacie du Plateau', value: 380000, percentage: 18.8, trend: 'up' },
    { name: 'Pharmacie Sainte Marie', value: 295000, percentage: 14.6, trend: 'stable' },
    { name: 'Pharmacie Moderne', value: 245000, percentage: 12.1, trend: 'down' },
    { name: 'Pharmacie du Commerce', value: 198000, percentage: 9.8, trend: 'up' }
]

export const EnhancedAnalytics = () => {
    const { metrics, loading, fetchAnalytics } = useAnalytics()
    const [timeRange, setTimeRange] = useState('7d')
    const [isRefreshing, setIsRefreshing] = useState(false)

    useEffect(() => {
        fetchAnalytics(timeRange)
    }, [timeRange, fetchAnalytics])

    const handleRefresh = async () => {
        setIsRefreshing(true)
        await fetchAnalytics(timeRange)
        setIsRefreshing(false)
    }

    const metricsData: MetricCard[] = [
        {
            title: 'Commandes Totales',
            value: metrics?.totalOrders.toString() || '0',
            change: 0, // Todo: Calculate change
            changeType: 'neutral',
            icon: ShoppingCart,
            color: 'blue',
            trend: [45, 52, 48, 61, 55, 67, 72] // Mock trend
        },
        {
            title: 'Revenus (FCFA)',
            value: metrics?.revenue.toLocaleString() || '0',
            change: 0,
            changeType: 'neutral',
            icon: DollarSign,
            color: 'green',
            trend: [32, 38, 35, 42, 48, 52, 58]
        },
        {
            title: 'Nouveaux Patients',
            value: metrics?.newPatients.toString() || '0',
            change: 0,
            changeType: 'neutral',
            icon: Users,
            color: 'purple',
            trend: [18, 22, 25, 28, 32, 38, 42]
        },
        {
            title: 'Ordonnances',
            value: metrics?.prescriptions.toString() || '0',
            change: 0,
            changeType: 'neutral',
            icon: FileText,
            color: 'orange',
            trend: [85, 82, 78, 80, 75, 72, 70]
        },
        {
            title: 'Livraisons',
            value: metrics?.deliveries.toString() || '0',
            change: 0,
            changeType: 'neutral',
            icon: Truck,
            color: 'cyan',
            trend: [120, 135, 142, 158, 165, 178, 190]
        },
        {
            title: 'Stock Critique',
            value: metrics?.criticalStock.toString() || '0',
            change: 0,
            changeType: 'neutral',
            icon: Package,
            color: 'red',
            trend: [28, 24, 22, 18, 16, 14, 12]
        }
    ]

    const getColorClasses = (color: string) => {
        const colors: Record<string, { bg: string; text: string; border: string }> = {
            blue: { bg: 'bg-blue-50', text: 'text-blue-600', border: 'border-blue-200' },
            green: { bg: 'bg-green-50', text: 'text-green-600', border: 'border-green-200' },
            purple: { bg: 'bg-purple-50', text: 'text-purple-600', border: 'border-purple-200' },
            orange: { bg: 'bg-orange-50', text: 'text-orange-600', border: 'border-orange-200' },
            cyan: { bg: 'bg-cyan-50', text: 'text-cyan-600', border: 'border-cyan-200' },
            red: { bg: 'bg-red-50', text: 'text-red-600', border: 'border-red-200' }
        }
        return colors[color] || colors.blue
    }

    const MiniSparkline = ({ data, color }: { data: number[]; color: string }) => {
        const max = Math.max(...data)
        const min = Math.min(...data)
        const range = max - min || 1
        const colorClass = getColorClasses(color)

        return (
            <div className="flex items-end gap-0.5 h-8">
                {data.map((value, idx) => (
                    <div
                        key={idx}
                        className={`w-1.5 rounded-t ${colorClass.text.replace('text', 'bg')}`}
                        style={{
                            height: `${((value - min) / range) * 100}%`,
                            minHeight: '4px',
                            opacity: 0.2 + (idx / data.length) * 0.8
                        }}
                    />
                ))}
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Header Controls */}
            <div className="flex flex-wrap justify-between items-center gap-4">
                <div>
                    <h2 className="text-2xl font-black tracking-tight">Tableau de Bord Analytique</h2>
                    <p className="text-sm text-muted-foreground">Vue d'ensemble des performances de la plateforme</p>
                </div>
                <div className="flex gap-2">
                    <Select value={timeRange} onValueChange={setTimeRange}>
                        <SelectTrigger className="w-36 rounded-xl">
                            <Calendar className="h-4 w-4 mr-2" />
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="24h">24 heures</SelectItem>
                            <SelectItem value="7d">7 jours</SelectItem>
                            <SelectItem value="30d">30 jours</SelectItem>
                            <SelectItem value="90d">90 jours</SelectItem>
                            <SelectItem value="1y">1 an</SelectItem>
                        </SelectContent>
                    </Select>
                    <Button variant="outline" className="rounded-xl" onClick={handleRefresh} disabled={loading || isRefreshing}>
                        <RefreshCw className={`h-4 w-4 mr-2 ${loading || isRefreshing ? 'animate-spin' : ''}`} />
                        Actualiser
                    </Button>
                    <Button variant="outline" className="rounded-xl">
                        <Download className="h-4 w-4 mr-2" />
                        Exporter
                    </Button>
                </div>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {metricsData.map((metric) => {
                    const Icon = metric.icon
                    const colors = getColorClasses(metric.color)

                    return (
                        <Card key={metric.title} className={`glass-card ${colors.border} border-l-4`}>
                            <CardContent className="p-5">
                                <div className="flex justify-between items-start">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-2">
                                            <div className={`p-2 rounded-lg ${colors.bg}`}>
                                                <Icon className={`h-4 w-4 ${colors.text}`} />
                                            </div>
                                            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                                                {metric.title}
                                            </span>
                                        </div>
                                        <div className="flex items-end gap-3">
                                            <span className="text-3xl font-black">{metric.value}</span>
                                            <Badge
                                                className={`mb-1 ${metric.changeType === 'increase'
                                                    ? 'bg-green-100 text-green-700'
                                                    : metric.changeType === 'decrease'
                                                        ? 'bg-red-100 text-red-700'
                                                        : 'bg-gray-100 text-gray-700'
                                                    }`}
                                            >
                                                {metric.changeType === 'increase' ? (
                                                    <ArrowUpRight className="h-3 w-3 mr-1" />
                                                ) : metric.changeType === 'decrease' ? (
                                                    <ArrowDownRight className="h-3 w-3 mr-1" />
                                                ) : null}
                                                {metric.change}%
                                            </Badge>
                                        </div>
                                    </div>
                                    <MiniSparkline data={metric.trend} color={metric.color} />
                                </div>
                            </CardContent>
                        </Card>
                    )
                })}
            </div>

            {/* Top Lists - Keeping Static for now as placeholder for future aggregation implementation */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Top Medications */}
                <Card className="glass-morphism border-white/20">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <BarChart3 className="h-5 w-5 text-primary" />
                            Top Médicaments Vendus
                        </CardTitle>
                        <CardDescription>Produits les plus commandés cette période</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {topMedications.map((item, idx) => (
                            <div key={item.name} className="space-y-2">
                                <div className="flex justify-between items-center">
                                    <div className="flex items-center gap-3">
                                        <span className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                                            {idx + 1}
                                        </span>
                                        <span className="font-medium text-sm">{item.name}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="font-bold">{item.value.toLocaleString()}</span>
                                        {item.trend === 'up' && <TrendingUp className="h-3 w-3 text-green-500" />}
                                        {item.trend === 'down' && <TrendingDown className="h-3 w-3 text-red-500" />}
                                    </div>
                                </div>
                                <Progress value={item.percentage * 5} className="h-2" />
                            </div>
                        ))}
                    </CardContent>
                </Card>

                {/* Top Pharmacies */}
                <Card className="glass-morphism border-white/20">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <PieChart className="h-5 w-5 text-primary" />
                            Top Pharmacies Partenaires
                        </CardTitle>
                        <CardDescription>Chiffre d'affaires généré par pharmacie</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {topPharmacies.map((item, idx) => (
                            <div key={item.name} className="space-y-2">
                                <div className="flex justify-between items-center">
                                    <div className="flex items-center gap-3">
                                        <span className="w-6 h-6 rounded-full bg-green-500/10 flex items-center justify-center text-xs font-bold text-green-600">
                                            {idx + 1}
                                        </span>
                                        <span className="font-medium text-sm">{item.name}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="font-bold">{(item.value / 1000).toFixed(0)}K F</span>
                                        {item.trend === 'up' && <TrendingUp className="h-3 w-3 text-green-500" />}
                                        {item.trend === 'down' && <TrendingDown className="h-3 w-3 text-red-500" />}
                                    </div>
                                </div>
                                <Progress value={item.percentage * 4} className="h-2" />
                            </div>
                        ))}
                    </CardContent>
                </Card>
            </div>

            {/* Activity Timeline */}
            <Card className="glass-morphism border-white/20">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Activity className="h-5 w-5 text-primary" />
                        Activité en Temps Réel
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center justify-center h-32 text-muted-foreground">
                        <div className="text-center">
                            <Activity className="h-8 w-8 mx-auto mb-2 animate-pulse" />
                            <p className="text-sm">Graphique d'activité en temps réel</p>
                            <p className="text-xs">Intégration ChartJS/Recharts recommandée</p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}


