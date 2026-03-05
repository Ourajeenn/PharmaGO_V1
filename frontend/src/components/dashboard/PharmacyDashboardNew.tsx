import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { supabase } from '@/integrations/supabase/client'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
    LayoutDashboard,
    Package,
    Grid3x3,
    ShoppingCart,
    TrendingUp,
    Users,
    CreditCard,
    FileText,
    Settings,
    Search,
    Bell,
    Globe,
    ChevronDown,
    MoreHorizontal,
    Edit,
    Trash2,
    Eye,
    Filter,
    ArrowUpDown,
    Loader2,
    Pill,
    CheckCircle,
    XCircle,
    Thermometer,
    Menu,
    X
} from 'lucide-react'
import { toast } from 'sonner'
import { useNavigate } from 'react-router-dom'
import { WeatherWidget } from './widgets/WeatherWidget'
import { ColdChainWidget } from './widgets/ColdChainWidget'
import {
    ResponsiveContainer,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    PieChart,
    Pie,
    Cell,
    CartesianGrid,
    AreaChart,
    Area
} from 'recharts'
import { Truck } from 'lucide-react'

interface SaleData {
    id: string
    name: string
    medicine: string
    userEmail: string
    quantity: number
    totalPrice: number
    date: string
    avatar?: string
}

interface StatsData {
    todaySales: number
    salesGrowth: number
    availableCategories: number
    categoriesGrowth: number
    expiredMedicines: number
    expiredGrowth: number
    systemUsers: number
    usersGrowth: number
}

interface GraphData {
    purchases: number
    suppliers: number
    sales: number
    noSales: number
}

interface WeeklySales {
    Mon: number
    Tue: number
    Wed: number
    Thu: number
    Fri: number
    Sat: number
}

export const PharmacyDashboardNew = () => {
    const { user } = useAuth()
    const navigate = useNavigate()
    const [loading, setLoading] = useState(true)
    const [activeMenu, setActiveMenu] = useState('Dashboard')
    const [searchQuery, setSearchQuery] = useState('')
    const [filterBy, setFilterBy] = useState('all')
    const [sortBy, setSortBy] = useState('date')
    const [currentPage, setCurrentPage] = useState(2)
    const [profileCompletion, setProfileCompletion] = useState(70)
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

    // Data States
    const [stats, setStats] = useState<StatsData>({
        todaySales: 95.00,
        salesGrowth: 2.5,
        availableCategories: 1.457,
        categoriesGrowth: 2.5,
        expiredMedicines: 0.00,
        expiredGrowth: 2.5,
        systemUsers: 255000,
        usersGrowth: 2.5
    })

    const [graphData, setGraphData] = useState<GraphData>({
        purchases: 28,
        suppliers: 18,
        sales: 12,
        noSales: 42
    })

    const [weeklySales, setWeeklySales] = useState<WeeklySales>({
        Mon: 25000,
        Tue: 35000,
        Wed: 45000,
        Thu: 40000,
        Fri: 38000,
        Sat: 32000
    })

    const [inventory, setInventory] = useState<any[]>([])
    const [pendingOrders, setPendingOrders] = useState<any[]>([])
    const [availableDrivers, setAvailableDrivers] = useState<any[]>([])
    const [expiringSoon, setExpiringSoon] = useState<any[]>([])
    const [predictiveSuggestions, setPredictiveSuggestions] = useState<any[]>([
        { id: 1, name: "Paracétamol Pro", currentStock: 5, suggestedOrder: 50, reason: "Haute demande saisonnière (+20%)", priority: "high" },
        { id: 2, name: "Sérum Physiologique", currentStock: 12, suggestedOrder: 30, reason: "Stock critique détecté", priority: "medium" },
        { id: 3, name: "Masques FFP2", currentStock: 100, suggestedOrder: 200, reason: "Pic de pollution prévu (IA Insight)", priority: "low" }
    ])
    const [salesData, setSalesData] = useState<SaleData[]>([
        {
            id: '1',
            name: 'Susan Williams',
            medicine: 'Medicine Two',
            userEmail: 'guest@wvchertz.com',
            quantity: 1,
            totalPrice: 152.00,
            date: 'Apr 22, 2015 12:00 AM',
            avatar: ''
        }
    ])

    useEffect(() => {
        if (user?.id) {
            fetchDashboardData()
        }
    }, [user])

    const fetchDashboardData = async () => {
        try {
            setLoading(true)
            const today = new Date().toISOString().split('T')[0]

            // Fetch pharmacy details
            const { data: pharmacy, error: pharmacyError } = await supabase
                .from('pharmacies')
                .select('id')
                .eq('user_id', user!.id)
                .single()

            if (pharmacyError) {
                console.error('Error fetching pharmacy details:', pharmacyError)
                setLoading(false)
                return
            }

            if (!pharmacy) {
                setLoading(false)
                return
            }

            // Fetch orders for today's sales
            const { data: ordersData, error: ordersError } = await supabase
                .from('orders')
                .select(`
          *,
          patients:patient_id (
            user_profiles:user_id (name, phone, email)
          )
        `)
                .eq('pharmacy_id', pharmacy.id)
                .order('created_at', { ascending: false })
                .limit(100)

            if (!ordersError && ordersData) {
                // Calculate today's sales
                const todayOrders = ordersData.filter((o: any) => o.created_at.startsWith(today))
                const todaySalesAmount = todayOrders.reduce((sum: number, o: any) => sum + (o.total_amount || 0), 0)

                // Format sales data for table
                const formattedSales: SaleData[] = ordersData.slice(0, 10).map((o: any) => ({
                    id: o.id,
                    name: o.patients?.user_profiles?.name || 'Patient Inconnu',
                    medicine: o.medicines?.[0]?.name || 'Médicament',
                    userEmail: o.patients?.user_profiles?.email || 'guest@pharmago.com',
                    quantity: o.medicines?.length || 1,
                    totalPrice: o.total_amount || 0,
                    date: new Date(o.created_at).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                    }),
                    avatar: ''
                }))

                setSalesData(formattedSales)
                setStats(prev => ({
                    ...prev,
                    todaySales: todaySalesAmount
                }))
            }

            // Fetch inventory for categories and expired medicines
            const { data: inventoryData, error: invError } = await supabase
                .from('pharmacy_inventory')
                .select(`
          quantity,
          expiry_date,
          medicines (
            id,
            name,
            category
          )
        `)
                .eq('pharmacy_id', pharmacy.id)

            if (!invError && inventoryData) {
                setInventory(inventoryData)
                // Count unique categories
                const categories = new Set(inventoryData.map((item: any) => item.medicines?.category).filter(Boolean))

                // Count expired medicines and expiring soon
                const today = new Date()
                const oneMonthFromNow = new Date()
                oneMonthFromNow.setMonth(today.getMonth() + 1)

                const expiredCount = inventoryData.filter((item: any) => {
                    if (!item.expiry_date) return false
                    return new Date(item.expiry_date) < today
                }).length

                const upcomingExpirations = inventoryData.filter((item: any) => {
                    if (!item.expiry_date) return false
                    const expiry = new Date(item.expiry_date)
                    return expiry >= today && expiry <= oneMonthFromNow
                })

                setExpiringSoon(upcomingExpirations)
                setStats(prev => ({
                    ...prev,
                    availableCategories: categories.size,
                    expiredMedicines: expiredCount
                }))
            }

            // Fetch Pending Orders for the specific tab
            const { data: pendingData } = await supabase
                .from('orders')
                .select(`
                    *,
                    patients:patient_id (
                        user_profiles:user_id (name)
                    )
                `)
                .eq('pharmacy_id', pharmacy.id)
                .in('status', ['pending', 'preparing', 'ready'])
                .order('created_at', { ascending: false })

            if (pendingData) {
                setPendingOrders(pendingData)
            }

            // Fetch Drivers
            const { DriverService } = await import('@/services/DriverService')
            const drivers = await DriverService.getAvailableDrivers()
            setAvailableDrivers(drivers)

        } catch (error) {
            console.error('Error loading pharmacy dashboard:', error)
            toast.error("Erreur de chargement des données")
        } finally {
            setLoading(false)
        }
    }

    const handleSearch = (query: string) => {
        setSearchQuery(query)
        // Filter sales data based on search query
        // Implementation here
    }

    const handleAssignDriver = async (orderId: string, driverId: string) => {
        try {
            const { DriverService } = await import('@/services/DriverService')
            await DriverService.assignDriverToOrder(orderId, driverId)
            toast.success("Livreur assigné !")
            fetchDashboardData()
        } catch (error) {
            toast.error("Erreur d'assignation")
        }
    }

    const handleUpdateOrderStatus = async (orderId: string, newStatus: string) => {
        try {
            const { error } = await supabase
                .from('orders')
                .update({ status: newStatus })
                .eq('id', orderId)

            if (error) throw error

            setPendingOrders(prev => prev.map(order =>
                order.id === orderId ? { ...order, status: newStatus } : order
            ))

            toast.success(`Statut mis à jour: ${newStatus}`)

            // Also refresh stats if needed
            fetchDashboardData()
        } catch (error) {
            console.error('Error updating status:', error)
            toast.error("Erreur lors de la mise à jour")
        }
    }

    const handleUpdateStock = async (id: string, newQuantity: number) => {
        try {
            const { error } = await supabase
                .from('pharmacy_inventory')
                .update({ quantity: newQuantity })
                .eq('id', id)

            if (error) throw error

            setInventory(prev => prev.map(item =>
                item.id === id ? { ...item, quantity: newQuantity } : item
            ))
            toast.success("Stock mis à jour")
        } catch (error) {
            console.error('Error updating stock:', error)
            toast.error("Échec de la mise à jour du stock")
        }
    }

    const handleB2BOrder = (wholesalerName: string, product: string, quantity: number) => {
        toast.promise(
            new Promise((resolve) => setTimeout(resolve, 2000)),
            {
                loading: `Envoi de la commande bulk vers ${wholesalerName}...`,
                success: `Commande massive de ${quantity} unités de ${product} confirmée !`,
                error: "Erreur lors de la liaison B2B",
            }
        )
    }

    const handleDelete = (id: string) => {
        toast.success('Vente supprimée')
        setSalesData(prev => prev.filter(sale => sale.id !== id))
    }

    const handleEdit = (id: string) => {
        toast.info('Modification de la vente')
    }

    const handleView = (id: string) => {
        toast.info('Détails de la vente')
    }

    const menuItems = [
        { icon: LayoutDashboard, label: 'Dashboard', active: true },
        { icon: Package, label: 'Products', active: false },
        { icon: Grid3x3, label: 'Categories', active: false }
    ]

    const leadsItems = [
        { icon: ShoppingCart, label: 'Orders', active: false },
        { icon: TrendingUp, label: 'Sales', active: false },
        { icon: Users, label: 'Customers', active: false }
    ]

    const commsItems = [
        { icon: Bell, label: 'Chat', active: false },
        { icon: CreditCard, label: 'Payments', active: false },
        { icon: FileText, label: 'Reports', active: false },
        { icon: Settings, label: 'Settings', active: false }
    ]

    const totalSales = Object.values(weeklySales).reduce((a, b) => a + b, 0)
    const maxSales = Math.max(...Object.values(weeklySales))

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen bg-gradient-to-br from-slate-50 to-slate-100">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
            </div>
        )
    }

    return (
        <div className="flex h-screen bg-gradient-to-br from-slate-50 to-slate-100 overflow-hidden relative">
            {/* Mobile Menu Overlay */}
            {isMobileMenuOpen && (
                <div
                    className="fixed inset-0 bg-slate-900/50 z-40 md:hidden"
                    onClick={() => setIsMobileMenuOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside className={`fixed inset-y-0 left-0 z-50 w-56 bg-white/95 md:bg-white/80 backdrop-blur-md border-r border-slate-200/60 flex flex-col transform transition-transform duration-200 ease-in-out md:relative md:translate-x-0 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                {/* Logo */}
                <div className="p-6 border-b border-slate-200/60 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-slate-900 rounded-full flex items-center justify-center">
                            <Pill className="h-5 w-5 text-white" />
                        </div>
                        <span className="font-bold text-lg text-slate-900">Pharmacy</span>
                    </div>
                    <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setIsMobileMenuOpen(false)}>
                        <X className="h-5 w-5 text-slate-500" />
                    </Button>
                </div>

                {/* Main Menu */}
                <div className="flex-1 overflow-y-auto py-6 px-3">
                    <div className="mb-6">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-3 mb-2">Main Menu</p>
                        <nav className="space-y-1">
                            {menuItems.map((item) => (
                                <button
                                    key={item.label}
                                    onClick={() => setActiveMenu(item.label)}
                                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${activeMenu === item.label
                                        ? 'bg-slate-900 text-white shadow-lg'
                                        : 'text-slate-600 hover:bg-slate-100'
                                        }`}
                                >
                                    <item.icon className="h-4 w-4" />
                                    <span>{item.label}</span>
                                </button>
                            ))}
                        </nav>
                    </div>

                    <div className="mb-6">
                        <div className="flex items-center justify-between px-3 mb-2">
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Leads</p>
                            <ChevronDown className="h-3 w-3 text-slate-400" />
                        </div>
                        <nav className="space-y-1">
                            {leadsItems.map((item) => (
                                <button
                                    key={item.label}
                                    onClick={() => setActiveMenu(item.label)}
                                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-100 transition-all"
                                >
                                    <item.icon className="h-4 w-4" />
                                    <span>{item.label}</span>
                                </button>
                            ))}
                        </nav>
                    </div>

                    <div>
                        <div className="flex items-center justify-between px-3 mb-2">
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Comms</p>
                            <ChevronDown className="h-3 w-3 text-slate-400" />
                        </div>
                        <nav className="space-y-1">
                            {commsItems.map((item) => (
                                <button
                                    key={item.label}
                                    onClick={() => setActiveMenu(item.label)}
                                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-100 transition-all"
                                >
                                    <item.icon className="h-4 w-4" />
                                    <span>{item.label}</span>
                                </button>
                            ))}
                        </nav>
                    </div>
                </div>

                {/* Profile Completion */}
                <div className="p-4 m-3 bg-gradient-to-br from-cyan-50 to-cyan-100 rounded-2xl border border-cyan-200/50">
                    <div className="flex items-center gap-2 mb-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                            {profileCompletion}%
                        </div>
                        <div className="flex-1">
                            <p className="text-xs font-bold text-slate-900">Complete Profile</p>
                            <p className="text-[10px] text-slate-600">Complete Your Profile to unlock all features</p>
                        </div>
                    </div>
                    <Button className="w-full bg-slate-900 hover:bg-slate-800 text-white text-xs py-2 rounded-lg font-semibold">
                        Verify Identity
                    </Button>
                </div>

                <div className="px-3 pb-6 space-y-4">
                    <WeatherWidget />
                    <ColdChainWidget />
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto">
                {/* Header */}
                <header className="bg-white/80 backdrop-blur-md border-b border-slate-200/60 px-4 lg:px-8 py-4 sticky top-0 z-30">
                    <div className="flex items-center justify-between gap-4">
                        <Button variant="ghost" size="icon" className="md:hidden shrink-0" onClick={() => setIsMobileMenuOpen(true)}>
                            <Menu className="h-5 w-5 text-slate-700" />
                        </Button>

                        {/* Search */}
                        <div className="flex items-center gap-2 flex-1 max-w-md hidden sm:flex">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                <Input
                                    placeholder="Search"
                                    value={searchQuery}
                                    onChange={(e) => handleSearch(e.target.value)}
                                    className="pl-10 bg-slate-50 border-slate-200 rounded-lg h-9 w-full"
                                />
                            </div>
                            <Button variant="ghost" size="icon" className="h-9 w-9 rounded-lg shrink-0">
                                <Settings className="h-4 w-4 text-slate-600" />
                            </Button>
                        </div>

                        {/* Right Section */}
                        <div className="flex items-center gap-2 md:gap-4 shrink-0">
                            <Button variant="ghost" size="icon" className="hidden sm:inline-flex h-9 w-9 rounded-lg relative">
                                <Bell className="h-4 w-4 text-slate-600" />
                                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                            </Button>

                            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-slate-50 rounded-lg border border-slate-200">
                                <Globe className="h-4 w-4 text-slate-600" />
                                <span className="text-sm font-medium text-slate-700">EN</span>
                                <ChevronDown className="h-3 w-3 text-slate-400" />
                            </div>

                            <div className="flex items-center gap-3 md:pl-4 md:border-l border-slate-200">
                                <div className="hidden lg:block text-right">
                                    <p className="text-sm font-semibold text-slate-900">Budiono Siregar</p>
                                    <p className="text-xs text-slate-500">budionosiregar@gmail.com</p>
                                </div>
                                <Avatar className="h-9 w-9">
                                    <AvatarImage src="" />
                                    <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-500 text-white font-semibold">
                                        BS
                                    </AvatarFallback>
                                </Avatar>
                                <ChevronDown className="hidden lg:block h-4 w-4 text-slate-400" />
                            </div>

                            <Button className="hidden xl:inline-flex bg-slate-900 hover:bg-slate-800 text-white text-xs px-4 py-2 rounded-lg font-semibold">
                                Team Member
                            </Button>
                        </div>
                    </div>
                </header>

                {/* Content */}
                {activeMenu === 'Dashboard' && (
                    <div className="p-8 space-y-6">
                        {/* Welcome */}
                        <div>
                            <h1 className="text-3xl font-bold text-slate-900 mb-1">Welcome Code Astro!</h1>
                        </div>

                        {/* Pharmacy Sales Results */}
                        <div>
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                                <h2 className="text-lg font-bold text-slate-900">Pharmacy Sales Results</h2>
                                <div className="flex items-center gap-3">
                                    <Select defaultValue="month">
                                        <SelectTrigger className="w-32 h-9 bg-white border-slate-200 rounded-lg">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="month">This Month</SelectItem>
                                            <SelectItem value="week">This Week</SelectItem>
                                            <SelectItem value="today">Today</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <Button variant="ghost" size="icon" className="h-9 w-9 rounded-lg">
                                        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                            <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" strokeWidth="2" strokeLinecap="round" />
                                        </svg>
                                    </Button>
                                </div>
                            </div>

                            {/* Stats Cards */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                                {/* Today's Sales */}
                                <Card className="bg-gradient-to-br from-green-100 to-green-50 border-green-200/50 overflow-hidden">
                                    <CardContent className="p-5">
                                        <div className="flex items-start justify-between mb-8">
                                            <div className="w-10 h-10 bg-green-900 rounded-xl flex items-center justify-center">
                                                <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                </svg>
                                            </div>
                                            <Button variant="ghost" size="icon" className="h-6 w-6 -mr-2">
                                                <MoreHorizontal className="h-4 w-4 text-slate-600" />
                                            </Button>
                                        </div>
                                        <div>
                                            <p className="text-xs font-semibold text-green-700 mb-1">Todays Sales</p>
                                            <div className="flex items-end gap-2">
                                                <h3 className="text-2xl font-bold text-slate-900">$ {stats.todaySales.toFixed(2)}</h3>
                                                <span className="text-xs font-semibold text-green-600 mb-1">+{stats.salesGrowth}% This Month</span>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Available Categories */}
                                <Card className="bg-gradient-to-br from-cyan-100 to-cyan-50 border-cyan-200/50 overflow-hidden">
                                    <CardContent className="p-5">
                                        <div className="flex items-start justify-between mb-8">
                                            <div className="w-10 h-10 bg-cyan-900 rounded-xl flex items-center justify-center">
                                                <Grid3x3 className="h-5 w-5 text-white" />
                                            </div>
                                            <Button variant="ghost" size="icon" className="h-6 w-6 -mr-2">
                                                <MoreHorizontal className="h-4 w-4 text-slate-600" />
                                            </Button>
                                        </div>
                                        <div>
                                            <p className="text-xs font-semibold text-cyan-700 mb-1">Available Categories</p>
                                            <div className="flex items-end gap-2">
                                                <h3 className="text-2xl font-bold text-slate-900">{stats.availableCategories}%</h3>
                                                <span className="text-xs font-semibold text-cyan-600 mb-1">+{stats.categoriesGrowth}% This Month</span>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Expired Medicines */}
                                <Card className="bg-gradient-to-br from-pink-100 to-pink-50 border-pink-200/50 overflow-hidden">
                                    <CardContent className="p-5">
                                        <div className="flex items-start justify-between mb-8">
                                            <div className="w-10 h-10 bg-pink-900 rounded-xl flex items-center justify-center">
                                                <Package className="h-5 w-5 text-white" />
                                            </div>
                                            <Button variant="ghost" size="icon" className="h-6 w-6 -mr-2">
                                                <MoreHorizontal className="h-4 w-4 text-slate-600" />
                                            </Button>
                                        </div>
                                        <div>
                                            <p className="text-xs font-semibold text-pink-700 mb-1">Expired Medicines</p>
                                            <div className="flex items-end gap-2">
                                                <h3 className="text-2xl font-bold text-slate-900">{stats.expiredMedicines.toFixed(2)}%</h3>
                                                <span className="text-xs font-semibold text-pink-600 mb-1">+{stats.expiredGrowth}% This Month</span>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* System Users */}
                                <Card className="bg-gradient-to-br from-purple-100 to-purple-50 border-purple-200/50 overflow-hidden">
                                    <CardContent className="p-5">
                                        <div className="flex items-start justify-between mb-8">
                                            <div className="w-10 h-10 bg-purple-900 rounded-xl flex items-center justify-center">
                                                <Users className="h-5 w-5 text-white" />
                                            </div>
                                            <Button variant="ghost" size="icon" className="h-6 w-6 -mr-2">
                                                <MoreHorizontal className="h-4 w-4 text-slate-600" />
                                            </Button>
                                        </div>
                                        <div>
                                            <p className="text-xs font-semibold text-purple-700 mb-1">System Users</p>
                                            <div className="flex items-end gap-2">
                                                <h3 className="text-2xl font-bold text-slate-900">{(stats.systemUsers / 1000).toFixed(0)}K</h3>
                                                <span className="text-xs font-semibold text-purple-600 mb-1">+{stats.usersGrowth}% This Month</span>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>

                            {/* Charts Row */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                                {/* Graph Report */}
                                <Card className="bg-white border-slate-200">
                                    <CardContent className="p-6">
                                        <div className="flex items-center justify-between mb-6">
                                            <h3 className="text-base font-bold text-slate-900">Graph Report</h3>
                                            <Button variant="ghost" size="icon" className="h-6 w-6">
                                                <MoreHorizontal className="h-4 w-4 text-slate-600" />
                                            </Button>
                                        </div>

                                        {/* Donut Chart with Recharts */}
                                        <div className="h-48 mb-6">
                                            <ResponsiveContainer width="100%" height="100%">
                                                <PieChart>
                                                    <Pie
                                                        data={[
                                                            { name: 'Purchases', value: graphData.purchases, color: '#86efac' },
                                                            { name: 'Suppliers', value: graphData.suppliers, color: '#fda4af' },
                                                            { name: 'Sales', value: graphData.sales, color: '#d1d5db' },
                                                            { name: 'No Sales', value: graphData.noSales, color: '#bef264' }
                                                        ]}
                                                        cx="50%"
                                                        cy="50%"
                                                        innerRadius={60}
                                                        outerRadius={80}
                                                        paddingAngle={5}
                                                        dataKey="value"
                                                    >
                                                        {[
                                                            { color: '#86efac' },
                                                            { color: '#fda4af' },
                                                            { color: '#d1d5db' },
                                                            { color: '#bef264' }
                                                        ].map((entry, index) => (
                                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                                        ))}
                                                    </Pie>
                                                    <Tooltip />
                                                </PieChart>
                                            </ResponsiveContainer>
                                            <div className="absolute top-[55%] left-[50%] -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
                                                <p className="text-[10px] font-semibold text-slate-500">Total</p>
                                                <p className="text-xl font-bold text-slate-900">755K</p>
                                            </div>
                                        </div>

                                        {/* Legend */}
                                        <div className="grid grid-cols-2 gap-3">
                                            <div className="flex items-center gap-2">
                                                <div className="w-3 h-3 rounded-full bg-green-300"></div>
                                                <span className="text-xs text-slate-600">Purchases</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <div className="w-3 h-3 rounded-full bg-pink-300"></div>
                                                <span className="text-xs text-slate-600">Suppliers</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <div className="w-3 h-3 rounded-full bg-gray-300"></div>
                                                <span className="text-xs text-slate-600">Sales</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <div className="w-3 h-3 rounded-full bg-lime-300"></div>
                                                <span className="text-xs text-slate-600">No Sales</span>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Total Sales Overview */}
                                <Card className="bg-white border-slate-200">
                                    <CardContent className="p-6">
                                        <div className="flex items-center justify-between mb-6">
                                            <h3 className="text-base font-bold text-slate-900">Total Sales Overview</h3>
                                            <Button variant="ghost" size="icon" className="h-6 w-6">
                                                <MoreHorizontal className="h-4 w-4 text-slate-600" />
                                            </Button>
                                        </div>

                                        {/* Bar Chart with Recharts */}
                                        <div className="h-48 relative">
                                            <ResponsiveContainer width="100%" height="100%">
                                                <BarChart data={Object.entries(weeklySales).map(([day, value]) => ({ day, value }))}>
                                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                                    <XAxis
                                                        dataKey="day"
                                                        axisLine={false}
                                                        tickLine={false}
                                                        tick={{ fontSize: 10, fill: '#94a3b8' }}
                                                    />
                                                    <YAxis hide />
                                                    <Tooltip
                                                        cursor={{ fill: '#f8fafc' }}
                                                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                                                    />
                                                    <Bar
                                                        dataKey="value"
                                                        radius={[4, 4, 0, 0]}
                                                        fill="url(#barGradient)"
                                                    >
                                                        {Object.entries(weeklySales).map((entry, index) => {
                                                            const colors = ['#fdba74', '#fda4af', '#bef264', '#67e8f9', '#fca5a5', '#d8b4fe']
                                                            return <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                                                        })}
                                                    </Bar>
                                                    <defs>
                                                        <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                                                            <stop offset="0%" stopColor="currentColor" stopOpacity={0.8} />
                                                            <stop offset="100%" stopColor="currentColor" stopOpacity={0.5} />
                                                        </linearGradient>
                                                    </defs>
                                                </BarChart>
                                            </ResponsiveContainer>

                                            {/* Current value badge */}
                                            <div className="absolute top-0 right-4 bg-slate-900 text-white px-3 py-1.5 rounded-lg text-xs font-bold shadow-xl">
                                                <div className="text-[10px] text-slate-400 mb-0.5">Apr, 2025</div>
                                                <div>${(totalSales / 1000).toFixed(2)}K</div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>

                            {/* Recent Sales List */}
                            <Card className="bg-white border-slate-200">
                                <CardContent className="p-6">
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="text-base font-bold text-slate-900">Recent Sales List</h3>
                                        <div className="flex items-center gap-2">
                                            <div className="relative">
                                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                                                <Input
                                                    placeholder="Search..."
                                                    className="pl-9 pr-3 h-8 w-48 bg-slate-50 border-slate-200 rounded-lg text-xs"
                                                />
                                            </div>
                                            <Select defaultValue="all">
                                                <SelectTrigger className="w-24 h-8 bg-white border-slate-200 rounded-lg text-xs">
                                                    <Filter className="h-3 w-3 mr-1" />
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="all">Filter</SelectItem>
                                                    <SelectItem value="today">Today</SelectItem>
                                                    <SelectItem value="week">This Week</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <Select defaultValue="date">
                                                <SelectTrigger className="w-28 h-8 bg-white border-slate-200 rounded-lg text-xs">
                                                    <ArrowUpDown className="h-3 w-3 mr-1" />
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="date">Sort By</SelectItem>
                                                    <SelectItem value="price">Price</SelectItem>
                                                    <SelectItem value="name">Name</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <Button variant="ghost" size="icon" className="h-8 w-8">
                                                <MoreHorizontal className="h-4 w-4 text-slate-600" />
                                            </Button>
                                        </div>
                                    </div>

                                    {/* Table */}
                                    <div className="border border-slate-200 rounded-lg overflow-x-auto">
                                        <div className="min-w-[800px]">
                                            <Table>
                                                <TableHeader>
                                                    <TableRow className="bg-slate-50 hover:bg-slate-50">
                                                        <TableHead className="w-12">
                                                            <input type="checkbox" className="rounded border-slate-300" />
                                                        </TableHead>
                                                        <TableHead className="font-semibold text-slate-700 text-xs">Name</TableHead>
                                                        <TableHead className="font-semibold text-slate-700 text-xs">Medicine</TableHead>
                                                        <TableHead className="font-semibold text-slate-700 text-xs">User Email</TableHead>
                                                        <TableHead className="font-semibold text-slate-700 text-xs">Quantity</TableHead>
                                                        <TableHead className="font-semibold text-slate-700 text-xs">Total Price</TableHead>
                                                        <TableHead className="font-semibold text-slate-700 text-xs">
                                                            <div className="flex items-center gap-1">
                                                                Date
                                                                <ArrowUpDown className="h-3 w-3" />
                                                            </div>
                                                        </TableHead>
                                                        <TableHead className="font-semibold text-slate-700 text-xs text-right">Actions</TableHead>
                                                    </TableRow>
                                                </TableHeader>
                                                <TableBody>
                                                    {salesData.map((sale) => (
                                                        <TableRow key={sale.id} className="hover:bg-slate-50">
                                                            <TableCell>
                                                                <input type="checkbox" className="rounded border-slate-300" />
                                                            </TableCell>
                                                            <TableCell>
                                                                <div className="flex items-center gap-2">
                                                                    <Avatar className="h-7 w-7">
                                                                        <AvatarImage src={sale.avatar} />
                                                                        <AvatarFallback className="bg-gradient-to-br from-blue-400 to-purple-400 text-white text-xs">
                                                                            {sale.name.split(' ').map(n => n[0]).join('')}
                                                                        </AvatarFallback>
                                                                    </Avatar>
                                                                    <span className="text-sm font-medium text-slate-900">{sale.name}</span>
                                                                </div>
                                                            </TableCell>
                                                            <TableCell className="text-sm text-slate-600">{sale.medicine}</TableCell>
                                                            <TableCell className="text-sm text-slate-600">{sale.userEmail}</TableCell>
                                                            <TableCell>
                                                                <div className="flex items-center gap-1">
                                                                    <div className="w-6 h-6 bg-slate-100 rounded flex items-center justify-center">
                                                                        <span className="text-xs font-semibold text-slate-700">{sale.quantity}</span>
                                                                    </div>
                                                                    <div className="w-5 h-5 bg-slate-900 rounded-full flex items-center justify-center">
                                                                        <span className="text-[10px] font-bold text-white">i</span>
                                                                    </div>
                                                                </div>
                                                            </TableCell>
                                                            <TableCell className="text-sm font-semibold text-slate-900">$ {sale.totalPrice.toFixed(2)}</TableCell>
                                                            <TableCell className="text-sm text-slate-600">{sale.date}</TableCell>
                                                            <TableCell>
                                                                <div className="flex items-center justify-end gap-1">
                                                                    <Button
                                                                        variant="ghost"
                                                                        size="icon"
                                                                        className="h-7 w-7 hover:bg-blue-50"
                                                                        onClick={() => handleEdit(sale.id)}
                                                                    >
                                                                        <Edit className="h-3.5 w-3.5 text-blue-600" />
                                                                    </Button>
                                                                    <Button
                                                                        variant="ghost"
                                                                        size="icon"
                                                                        className="h-7 w-7 hover:bg-green-50"
                                                                        onClick={() => handleView(sale.id)}
                                                                    >
                                                                        <Eye className="h-3.5 w-3.5 text-green-600" />
                                                                    </Button>
                                                                    <Button
                                                                        variant="ghost"
                                                                        size="icon"
                                                                        className="h-7 w-7 hover:bg-red-50"
                                                                        onClick={() => handleDelete(sale.id)}
                                                                    >
                                                                        <Trash2 className="h-3.5 w-3.5 text-red-600" />
                                                                    </Button>
                                                                    <Button variant="ghost" size="icon" className="h-7 w-7">
                                                                        <MoreHorizontal className="h-3.5 w-3.5 text-slate-600" />
                                                                    </Button>
                                                                </div>
                                                            </TableCell>
                                                        </TableRow>
                                                    ))}
                                                </TableBody>
                                            </Table>
                                        </div>
                                    </div>

                                    {/* Pagination */}
                                    <div className="flex items-center justify-between mt-4">
                                        <p className="text-xs text-slate-600">Showing of 121 Entries</p>
                                        <div className="flex items-center gap-1">
                                            <Button variant="ghost" size="sm" className="h-8 px-3 text-xs">
                                                Prev
                                            </Button>
                                            <Button variant="ghost" size="sm" className="h-8 w-8 text-xs">
                                                1
                                            </Button>
                                            <Button variant="default" size="sm" className="h-8 w-8 text-xs bg-slate-900">
                                                2
                                            </Button>
                                            <Button variant="ghost" size="sm" className="h-8 px-2 text-xs">
                                                ...
                                            </Button>
                                            <Button variant="ghost" size="sm" className="h-8 w-8 text-xs">
                                                8
                                            </Button>
                                            <Button variant="ghost" size="sm" className="h-8 w-8 text-xs">
                                                9
                                            </Button>
                                            <Button variant="ghost" size="sm" className="h-8 px-3 text-xs">
                                                Next
                                            </Button>
                                        </div>
                                        <Select defaultValue="3">
                                            <SelectTrigger className="w-24 h-8 bg-white border-slate-200 rounded-lg text-xs">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="3">Show: 3</SelectItem>
                                                <SelectItem value="5">Show: 5</SelectItem>
                                                <SelectItem value="10">Show: 10</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Smart Inventory Section (Sprint 35) */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                {/* Expiration Alerts */}
                                <Card className="bg-white border-slate-200">
                                    <CardContent className="p-6">
                                        <div className="flex items-center justify-between mb-4">
                                            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                                                <Bell className="h-4 w-4 text-rose-500" />
                                                Alertes Péremption (Prochains 30j)
                                            </h3>
                                            <Badge variant="outline" className="bg-rose-50 text-rose-600 border-rose-200">
                                                {expiringSoon.length} produits
                                            </Badge>
                                        </div>
                                        <div className="space-y-3">
                                            {expiringSoon.map((item, idx) => (
                                                <div key={idx} className="flex items-center justify-between p-3 bg-rose-50/50 rounded-xl border border-rose-100">
                                                    <div className="flex items-center gap-3">
                                                        <div className="p-2 bg-white rounded-lg shadow-sm">
                                                            <Thermometer className="h-4 w-4 text-rose-500" />
                                                        </div>
                                                        <div>
                                                            <p className="text-sm font-bold text-slate-900">{item.medicines?.name}</p>
                                                            <p className="text-[10px] text-slate-500">Expire le : {new Date(item.expiry_date).toLocaleDateString()}</p>
                                                        </div>
                                                    </div>
                                                    <Button size="sm" variant="ghost" className="text-rose-600 hover:bg-rose-100 text-xs">
                                                        Soldes ?
                                                    </Button>
                                                </div>
                                            ))}
                                            {expiringSoon.length === 0 && (
                                                <div className="text-center py-6 text-slate-400 italic text-sm">
                                                    Aucun produit à péremption imminente
                                                </div>
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Predictive Stock Reorder */}
                                <Card className="bg-slate-900 border-slate-800 text-white overflow-hidden relative">
                                    <div className="absolute top-0 right-0 p-4 opacity-10">
                                        <TrendingUp className="h-24 w-24" />
                                    </div>
                                    <CardContent className="p-6 relative z-10">
                                        <div className="flex items-center justify-between mb-6">
                                            <h3 className="text-base font-bold flex items-center gap-2 text-cyan-400">
                                                <Globe className="h-4 w-4" />
                                                Réapprovisionnement IA (SmartStock)
                                            </h3>
                                            <Badge className="bg-cyan-500/20 text-cyan-400 border-cyan-500/30">
                                                IA Insights
                                            </Badge>
                                        </div>
                                        <div className="space-y-4">
                                            {predictiveSuggestions.map((item) => (
                                                <div key={item.id} className="p-4 bg-white/5 backdrop-blur-md rounded-xl border border-white/10 hover:bg-white/10 transition-colors">
                                                    <div className="flex justify-between items-start mb-2">
                                                        <div>
                                                            <p className="font-bold text-sm">{item.name}</p>
                                                            <p className="text-[10px] text-slate-400 flex items-center gap-1">
                                                                <Loader2 className="h-3 w-3 animate-spin" /> {item.reason}
                                                            </p>
                                                        </div>
                                                        <Badge className={`${item.priority === 'high' ? 'bg-rose-500' :
                                                            item.priority === 'medium' ? 'bg-orange-500' : 'bg-blue-500'
                                                            } text-[10px]`}>
                                                            {item.priority.toUpperCase()}
                                                        </Badge>
                                                    </div>
                                                    <div className="flex items-center justify-between mt-4">
                                                        <div className="flex gap-4">
                                                            <div>
                                                                <p className="text-[10px] text-slate-500">Actuel</p>
                                                                <p className="text-sm font-bold">{item.currentStock}</p>
                                                            </div>
                                                            <div>
                                                                <p className="text-[10px] text-cyan-400">Suggéré</p>
                                                                <p className="text-sm font-bold text-cyan-400">+{item.suggestedOrder}</p>
                                                            </div>
                                                        </div>
                                                        <Button
                                                            size="sm"
                                                            className="bg-cyan-500 hover:bg-cyan-600 text-slate-900 h-8 font-bold text-xs"
                                                            onClick={() => handleB2BOrder("Grossiste-CI Premium", item.name, item.suggestedOrder)}
                                                        >
                                                            Commander
                                                        </Button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        </div>
                    </div>
                )}

                {
                    activeMenu === 'Products' && (
                        <div className="p-8 space-y-6">
                            <div className="flex justify-between items-center">
                                <h2 className="text-2xl font-bold text-slate-900">Inventory Management</h2>
                                <Button className="bg-slate-900 text-white">
                                    <Package className="h-4 w-4 mr-2" /> Add Product
                                </Button>
                            </div>
                            <Card className="border-slate-200">
                                <CardContent className="p-0">
                                    <Table>
                                        <TableHeader>
                                            <TableRow className="bg-slate-50">
                                                <TableHead>Product Name</TableHead>
                                                <TableHead>Category</TableHead>
                                                <TableHead>Stock</TableHead>
                                                <TableHead>Status</TableHead>
                                                <TableHead className="text-right">Actions</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {inventory.map((item) => (
                                                <TableRow key={item.id}>
                                                    <TableCell className="font-medium">{item.medicines?.name}</TableCell>
                                                    <TableCell>{item.medicines?.category}</TableCell>
                                                    <TableCell>
                                                        <div className="flex items-center gap-2">
                                                            <Input
                                                                type="number"
                                                                className="w-20 h-8"
                                                                defaultValue={item.quantity}
                                                                onBlur={(e) => handleUpdateStock(item.id, parseInt(e.target.value))}
                                                            />
                                                            <span className="text-xs text-slate-500">boîtes</span>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        {item.quantity > 10 ? (
                                                            <Badge className="bg-green-100 text-green-700 hover:bg-green-100">En Stock</Badge>
                                                        ) : item.quantity > 0 ? (
                                                            <Badge className="bg-orange-100 text-orange-700 hover:bg-orange-100">Stock Faible</Badge>
                                                        ) : (
                                                            <Badge className="bg-red-100 text-red-700 hover:bg-red-100">Rupture</Badge>
                                                        )}
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        <Button variant="ghost" size="sm">Edit</Button>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                            {inventory.length === 0 && (
                                                <TableRow>
                                                    <TableCell colSpan={5} className="text-center py-8 text-slate-400">
                                                        Aucun produit dans l'inventaire
                                                    </TableCell>
                                                </TableRow>
                                            )}
                                        </TableBody>
                                    </Table>
                                </CardContent>
                            </Card>
                        </div>
                    )
                }

                {
                    activeMenu === 'Chat' && (
                        <div className="p-8 h-full flex flex-col">
                            <h2 className="text-2xl font-bold text-slate-900 mb-6">Messages Clients</h2>
                            <div className="flex-1 bg-white rounded-2xl border border-slate-200 overflow-hidden flex flex-col shadow-sm">
                                <div className="p-4 border-b bg-slate-50 flex items-center gap-3">
                                    <Avatar className="h-10 w-10">
                                        <AvatarFallback className="bg-primary text-white">JD</AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <h4 className="font-bold">John Doe</h4>
                                        <p className="text-xs text-green-600">En ligne</p>
                                    </div>
                                </div>
                                <div className="flex-1 p-6 space-y-4 overflow-y-auto bg-slate-50/30">
                                    <div className="flex gap-3 max-w-[80%]">
                                        <Avatar className="h-8 w-8 mt-1">
                                            <AvatarFallback>JD</AvatarFallback>
                                        </Avatar>
                                        <div className="bg-white p-3 rounded-2xl rounded-tl-none border shadow-sm">
                                            <p className="text-sm">Bonjour, ma commande #CMD-123 est-elle prête ?</p>
                                            <span className="text-[10px] text-slate-400">10:20</span>
                                        </div>
                                    </div>
                                    <div className="flex gap-3 max-w-[80%] ml-auto flex-row-reverse">
                                        <div className="bg-slate-900 text-white p-3 rounded-2xl rounded-tr-none shadow-md">
                                            <p className="text-sm">Bonjour John, oui nous la préparons. Le livreur arrive dans 5 min.</p>
                                            <span className="text-[10px] text-slate-300">10:22</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="p-4 bg-white border-t flex gap-3">
                                    <Input placeholder="Votre message..." className="flex-1 bg-slate-50" />
                                    <Button className="bg-slate-900">Envoyer</Button>
                                </div>
                            </div>
                        </div>
                    )
                }

                {
                    activeMenu === 'Orders' && (
                        <div className="p-8 space-y-6">
                            <div className="flex justify-between items-center">
                                <h2 className="text-2xl font-bold text-slate-900">Gestion des Commandes</h2>
                                <Button variant="outline" size="sm" onClick={fetchDashboardData}>
                                    Actualiser
                                </Button>
                            </div>
                            <div className="space-y-4">
                                {pendingOrders.map((order) => (
                                    <Card key={order.id} className="border-slate-200 hover:shadow-md transition-shadow">
                                        <CardContent className="p-6 flex items-center justify-between">
                                            <div className="flex items-center gap-4">
                                                <div className={`h-12 w-12 rounded-full flex items-center justify-center font-bold
                                                    ${order.status === 'pending' ? 'bg-orange-100 text-orange-600' : 'bg-blue-100 text-blue-600'}`}>
                                                    {order.id.substring(0, 3).toUpperCase()}
                                                </div>
                                                <div>
                                                    <h4 className="font-bold text-lg">Commande #{order.id.substring(0, 8).toUpperCase()}</h4>
                                                    <p className="text-sm text-slate-500">
                                                        Patient: {order.patients?.user_profiles?.name || 'Anonyme'} • {order.payment_method}
                                                    </p>
                                                    <Badge className="mt-1" variant="outline">{order.status}</Badge>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <div className="text-right mr-4">
                                                    <p className="font-bold text-lg">{order.total?.toLocaleString()} FCFA</p>
                                                    <p className="text-xs text-slate-500">{new Date(order.created_at).toLocaleTimeString()}</p>
                                                </div>

                                                {order.status === 'pending' && (
                                                    <Button
                                                        className="bg-green-600 hover:bg-green-700 text-white"
                                                        onClick={() => handleUpdateOrderStatus(order.id, 'preparing')}
                                                    >
                                                        <CheckCircle className="h-4 w-4 mr-2" /> Préparer
                                                    </Button>
                                                )}

                                                {order.status === 'preparing' && (
                                                    <Button
                                                        className="bg-blue-600 hover:bg-blue-700 text-white"
                                                        onClick={() => handleUpdateOrderStatus(order.id, 'ready')}
                                                    >
                                                        <Package className="h-4 w-4 mr-2" /> Prête
                                                    </Button>
                                                )}

                                                {order.status === 'ready' && (
                                                    <div className="flex gap-2">
                                                        <Select onValueChange={(v) => handleAssignDriver(order.id, v)}>
                                                            <SelectTrigger className="w-40 bg-slate-900 text-white border-0">
                                                                <Truck className="h-4 w-4 mr-2" />
                                                                <SelectValue placeholder="Assigner Livreur" />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                {availableDrivers.map(d => (
                                                                    <SelectItem key={d.id} value={d.id}>
                                                                        {d.name} ({d.rating}⭐)
                                                                    </SelectItem>
                                                                ))}
                                                            </SelectContent>
                                                        </Select>
                                                    </div>
                                                )}

                                                <Button variant="ghost" size="icon" className="text-red-600 hover:bg-red-50">
                                                    <XCircle className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                                {pendingOrders.length === 0 && (
                                    <div className="text-center py-12 text-slate-400 bg-white rounded-2xl border border-dashed">
                                        Aucune commande en cours
                                    </div>
                                )}
                            </div>
                        </div>
                    )
                }

            </main >
        </div >
    )
}
