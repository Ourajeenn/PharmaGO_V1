import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
    LayoutDashboard,
    Package,
    ShoppingCart,
    TrendingUp,
    Users,
    Settings,
    Search,
    Bell,
    Globe,
    ChevronDown,
    Truck,
    BarChart3,
    ArrowUpRight,
    ArrowDownRight,
    Clock,
    CheckCircle2,
    AlertCircle,
    Building2,
    DollarSign,
    Box
} from 'lucide-react'
import {
    ResponsiveContainer,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    CartesianGrid,
    LineChart,
    Line
} from 'recharts'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

export const WholesalerDashboard = () => {
    const [activeMenu, setActiveMenu] = useState('Tableau de bord')
    const [searchQuery, setSearchQuery] = useState('')

    const stats = [
        { label: 'Ventes du mois', value: '45.2M CFA', change: '+12.5%', trend: 'up', icon: DollarSign, color: 'text-emerald-600', bg: 'bg-emerald-100' },
        { label: 'Commandes en attente', value: '24', change: '+3', trend: 'up', icon: Clock, color: 'text-amber-600', bg: 'bg-amber-100' },
        { label: 'Pharmacies clientes', value: '142', change: '+8', trend: 'up', icon: Building2, color: 'text-blue-600', bg: 'bg-blue-100' },
        { label: 'Produits en rupture', value: '12', change: '-2', trend: 'down', icon: Box, color: 'text-rose-600', bg: 'bg-rose-100' },
    ]

    const bulkOrders = [
        { id: 'BLK-9021', pharmacy: 'Pharmacie de Lagune', items: 120, total: '1.2M CFA', status: 'pending', date: '2h ago' },
        { id: 'BLK-9022', pharmacy: 'Grande Pharmacie de Marcory', items: 450, total: '4.8M CFA', status: 'preparing', date: '4h ago' },
        { id: 'BLK-9023', pharmacy: 'Pharmacie St. Jean', items: 85, total: '850K CFA', status: 'shipped', date: 'Yesterday' },
        { id: 'BLK-9024', pharmacy: 'Pharmacie d\'Anyama', items: 200, total: '2.1M CFA', status: 'delivered', date: 'Yesterday' },
    ]

    const inventoryData = [
        { name: 'Augmentin 1g', stock: 1200, price: '4500', demand: 'high' },
        { name: 'Paracétamol 500mg', stock: 5000, price: '500', demand: 'very high' },
        { name: 'Dolirhane', stock: 800, price: '2100', demand: 'medium' },
        { name: 'Spasfon', stock: 450, price: '3200', demand: 'high' },
    ]

    const sideMenuItems = [
        { icon: LayoutDashboard, label: 'Tableau de bord' },
        { icon: ShoppingCart, label: 'Commandes B2B' },
        { icon: Package, label: 'Catalogue Bulk' },
        { icon: Building2, label: 'Pharmacies Partenaires' },
        { icon: TrendingUp, label: 'Analyses de Marché' },
        { icon: Settings, label: 'Paramètres' },
    ]

    return (
        <div className="flex h-screen bg-slate-50 overflow-hidden font-sans">
            {/* Sidebar B2B */}
            <aside className="w-64 bg-slate-900 text-white flex flex-col">
                <div className="p-6 border-b border-white/10 flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
                        <Building2 className="h-6 w-6 text-white" />
                    </div>
                    <div>
                        <h1 className="font-bold text-lg leading-tight text-white">Hub Grossiste</h1>
                        <p className="text-[10px] text-blue-400 font-bold uppercase tracking-widest">B2B Marketplace</p>
                    </div>
                </div>

                <nav className="flex-1 p-4 space-y-1">
                    {sideMenuItems.map((item) => (
                        <button
                            key={item.label}
                            onClick={() => setActiveMenu(item.label)}
                            className={cn(
                                "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all group",
                                activeMenu === item.label
                                    ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20"
                                    : "text-slate-400 hover:bg-white/5 hover:text-white"
                            )}
                        >
                            <item.icon className={cn("h-4 w-4 transition-colors", activeMenu === item.label ? "text-white" : "text-slate-500 group-hover:text-blue-400")} />
                            {item.label}
                        </button>
                    ))}
                </nav>

                <div className="p-4 m-4 bg-white/5 rounded-2xl border border-white/10">
                    <p className="text-[10px] text-slate-500 font-bold uppercase mb-2">Statut Entrepôt</p>
                    <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-slate-300">Capacité utilisée</span>
                        <span className="text-xs font-bold text-blue-400">82%</span>
                    </div>
                    <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                        <div className="bg-blue-600 h-full w-[82%] rounded-full shadow-[0_0_10px_rgba(37,99,235,0.5)]"></div>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto">
                <header className="h-20 bg-white border-b border-slate-200 flex items-center justify-between px-8 sticky top-0 z-20">
                    <div className="relative w-96">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <Input
                            placeholder="Rechercher une commande, une pharmacie..."
                            className="pl-10 bg-slate-100 border-none rounded-xl h-11 focus-visible:ring-blue-600"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>

                    <div className="flex items-center gap-6">
                        <div className="flex items-center gap-4">
                            <Button variant="ghost" size="icon" className="relative text-slate-500 hover:bg-slate-100 rounded-xl">
                                <Bell className="h-5 w-5" />
                                <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full border-2 border-white"></span>
                            </Button>
                            <Button variant="ghost" size="icon" className="text-slate-500 hover:bg-slate-100 rounded-xl">
                                <Globe className="h-5 w-5" />
                            </Button>
                        </div>

                        <div className="h-8 w-px bg-slate-200"></div>

                        <div className="flex items-center gap-3">
                            <div className="text-right hidden sm:block">
                                <p className="text-sm font-bold text-slate-900">Grossiste CI</p>
                                <p className="text-[10px] text-emerald-500 font-bold">VÉRIFIÉ</p>
                            </div>
                            <Avatar className="h-10 w-10 border-2 border-slate-100 shadow-sm">
                                <AvatarImage src="https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=100&h=100&fit=crop" />
                                <AvatarFallback>GC</AvatarFallback>
                            </Avatar>
                        </div>
                    </div>
                </header>

                <div className="p-8 space-y-8">
                    {/* Welcome Header */}
                    <div className="flex items-end justify-between">
                        <div>
                            <h2 className="text-3xl font-black text-slate-900 tracking-tight">Tableau de bord B2B</h2>
                            <p className="text-slate-500 font-medium">Gestion des stocks et commandes pour les pharmacies partenaires.</p>
                        </div>
                        <Button className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl px-6 h-11 shadow-lg shadow-blue-600/20 font-bold">
                            <Package className="h-4 w-4 mr-2" /> Nouveau Arrivage
                        </Button>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {stats.map((stat, idx) => (
                            <Card key={idx} className="border-none shadow-sm hover:shadow-md transition-shadow rounded-2xl overflow-hidden group">
                                <CardContent className="p-6">
                                    <div className="flex items-start justify-between">
                                        <div className={cn("p-3 rounded-xl transition-colors", stat.bg)}>
                                            <stat.icon className={cn("h-6 w-6", stat.color)} />
                                        </div>
                                        <div className={cn(
                                            "flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full",
                                            stat.trend === 'up' ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"
                                        )}>
                                            {stat.trend === 'up' ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                                            {stat.change}
                                        </div>
                                    </div>
                                    <div className="mt-4">
                                        <p className="text-sm font-bold text-slate-500 mb-1">{stat.label}</p>
                                        <h3 className="text-2xl font-black text-slate-900 tracking-tight">{stat.value}</h3>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Orders List */}
                        <Card className="lg:col-span-2 border-none shadow-sm rounded-2xl overflow-hidden">
                            <CardHeader className="bg-white border-b border-slate-100 flex flex-row items-center justify-between px-6 py-5">
                                <CardTitle className="text-lg font-black text-slate-900 tracking-tight">Commandes de Pharmacie Récentes</CardTitle>
                                <Button variant="ghost" size="sm" className="text-blue-600 hover:bg-blue-50 font-bold">Voir tout</Button>
                            </CardHeader>
                            <CardContent className="p-0">
                                <Table>
                                    <TableHeader>
                                        <TableRow className="bg-slate-50/50">
                                            <TableHead className="font-bold text-slate-400 uppercase text-[10px] pl-6">Commande</TableHead>
                                            <TableHead className="font-bold text-slate-400 uppercase text-[10px]">Pharmacie</TableHead>
                                            <TableHead className="font-bold text-slate-400 uppercase text-[10px]">Items</TableHead>
                                            <TableHead className="font-bold text-slate-400 uppercase text-[10px]">Total</TableHead>
                                            <TableHead className="font-bold text-slate-400 uppercase text-[10px]">Statut</TableHead>
                                            <TableHead className="text-right pr-6 font-bold text-slate-400 uppercase text-[10px]">Action</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {bulkOrders.map((order) => (
                                            <TableRow key={order.id} className="hover:bg-slate-50/80 transition-colors border-b border-slate-50">
                                                <TableCell className="font-bold text-slate-900 pl-6">{order.id}</TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-2 font-bold text-slate-700">
                                                        <Building2 className="h-3.5 w-3.5 text-slate-400" />
                                                        {order.pharmacy}
                                                    </div>
                                                </TableCell>
                                                <TableCell className="font-medium text-slate-600">{order.items} unités</TableCell>
                                                <TableCell className="font-black text-slate-900">{order.total}</TableCell>
                                                <TableCell>
                                                    <Badge className={cn(
                                                        "rounded-lg px-2.5 py-1 text-[10px] font-bold border-none",
                                                        order.status === 'pending' ? "bg-amber-100 text-amber-600" :
                                                            order.status === 'preparing' ? "bg-blue-100 text-blue-600" :
                                                                order.status === 'shipped' ? "bg-purple-100 text-purple-600" : "bg-emerald-100 text-emerald-600"
                                                    )}>
                                                        {order.status.toUpperCase()}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="text-right pr-6">
                                                    <Button size="sm" variant="outline" className="h-8 rounded-lg font-bold text-xs border-slate-200">Détails</Button>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>

                        {/* Market Analysis / Top Sellers */}
                        <Card className="border-none shadow-sm rounded-2xl overflow-hidden flex flex-col">
                            <CardHeader className="bg-white border-b border-slate-100 px-6 py-5">
                                <CardTitle className="text-lg font-black text-slate-900 tracking-tight">Analyse des Stocks</CardTitle>
                            </CardHeader>
                            <CardContent className="p-6 flex-1 space-y-6">
                                <div className="h-48">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={inventoryData}>
                                            <XAxis dataKey="name" hide />
                                            <Tooltip
                                                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                                            />
                                            <Bar dataKey="stock" radius={[4, 4, 0, 0]} fill="#2563eb" />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>

                                <div className="space-y-4">
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Produits Stratégiques</p>
                                    {inventoryData.map((item, idx) => (
                                        <div key={idx} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                                            <div>
                                                <p className="font-bold text-sm text-slate-900">{item.name}</p>
                                                <p className="text-[10px] text-slate-500 font-medium">Prix Bulk: {item.price} CFA</p>
                                            </div>
                                            <Badge className={cn(
                                                "rounded-lg px-2 text-[10px] font-bold",
                                                item.demand === 'high' || item.demand === 'very high' ? "bg-amber-100 text-amber-600" : "bg-blue-100 text-blue-600"
                                            )}>
                                                {item.demand === 'very high' ? 'RUPTURE IMMINENTE' : item.demand.toUpperCase()}
                                            </Badge>
                                        </div>
                                    ))}
                                </div>

                                <Button className="w-full bg-slate-900 text-white rounded-xl h-11 font-bold">
                                    Générer Rapport IA
                                </Button>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Quick Fleet Tracking */}
                    <Card className="border-none shadow-sm rounded-2xl overflow-hidden bg-gradient-to-br from-blue-600 to-blue-700 text-white relative">
                        <div className="absolute top-0 right-0 p-8 opacity-10">
                            <Truck className="h-40 w-40" />
                        </div>
                        <CardContent className="p-8 relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
                            <div className="text-center md:text-left">
                                <h3 className="text-2xl font-black tracking-tight mb-2">Suivi Flotte Logistique</h3>
                                <p className="text-blue-100 font-medium max-w-md">Synchronisez vos camions de livraison avec les pharmacies clientes pour un ETA temps réel ultra-précis.</p>
                                <div className="flex flex-wrap gap-4 mt-6 justify-center md:justify-start">
                                    <div className="bg-white/10 backdrop-blur-md px-4 py-2 rounded-xl border border-white/10">
                                        <span className="text-xs font-bold block text-blue-200 uppercase">En route</span>
                                        <span className="text-xl font-black">12 camions</span>
                                    </div>
                                    <div className="bg-white/10 backdrop-blur-md px-4 py-2 rounded-xl border border-white/10">
                                        <span className="text-xs font-bold block text-blue-200 uppercase">Livré aujourd'hui</span>
                                        <span className="text-xl font-black">42 tonnes</span>
                                    </div>
                                </div>
                            </div>
                            <Button className="bg-white text-blue-600 hover:bg-blue-50 rounded-xl px-8 h-12 font-bold shadow-xl">
                                Activer le Hub Logistique
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </main>
        </div>
    )
}
