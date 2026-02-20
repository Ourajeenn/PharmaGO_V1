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
    Thermometer
} from 'lucide-react'
import { toast } from 'sonner'
import { useNavigate } from 'react-router-dom'
import { WeatherWidget } from './widgets/WeatherWidget'
import { ColdChainWidget } from './widgets/ColdChainWidget'

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

                // Count expired medicines
                const today = new Date()
                const expiredCount = inventoryData.filter((item: any) => {
                    if (!item.expiry_date) return false
                    return new Date(item.expiry_date) < today
                }).length

                setStats(prev => ({
                    ...prev,
                    availableCategories: categories.size,
                    expiredMedicines: expiredCount
                }))
            }

            // Fetch user count (system users)
            const { count: userCount } = await supabase
                .from('user_profiles')
                .select('*', { count: 'exact', head: true })

            if (userCount !== null) {
                setStats(prev => ({
                    ...prev,
                    systemUsers: userCount
                }))
            }

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
        <div className="flex h-screen bg-gradient-to-br from-slate-50 to-slate-100 overflow-hidden">
            {/* Sidebar */}
            <aside className="w-56 bg-white/80 backdrop-blur-md border-r border-slate-200/60 flex flex-col">
                {/* Logo */}
                <div className="p-6 border-b border-slate-200/60">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-slate-900 rounded-full flex items-center justify-center">
                            <Pill className="h-5 w-5 text-white" />
                        </div>
                        <span className="font-bold text-lg text-slate-900">Pharmacy</span>
                    </div>
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
                <header className="bg-white/80 backdrop-blur-md border-b border-slate-200/60 px-8 py-4">
                    <div className="flex items-center justify-between">
                        {/* Search */}
                        <div className="flex items-center gap-4 flex-1 max-w-md">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                <Input
                                    placeholder="Search"
                                    value={searchQuery}
                                    onChange={(e) => handleSearch(e.target.value)}
                                    className="pl-10 bg-slate-50 border-slate-200 rounded-lg h-9"
                                />
                            </div>
                            <Button variant="ghost" size="icon" className="h-9 w-9 rounded-lg">
                                <Settings className="h-4 w-4 text-slate-600" />
                            </Button>
                        </div>

                        {/* Right Section */}
                        <div className="flex items-center gap-4">
                            <Button variant="ghost" size="icon" className="h-9 w-9 rounded-lg relative">
                                <Bell className="h-4 w-4 text-slate-600" />
                                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                            </Button>

                            <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 rounded-lg border border-slate-200">
                                <Globe className="h-4 w-4 text-slate-600" />
                                <span className="text-sm font-medium text-slate-700">EN</span>
                                <ChevronDown className="h-3 w-3 text-slate-400" />
                            </div>

                            <div className="flex items-center gap-3 pl-4 border-l border-slate-200">
                                <div className="text-right">
                                    <p className="text-sm font-semibold text-slate-900">Budiono Siregar</p>
                                    <p className="text-xs text-slate-500">budionosiregar@gmail.com</p>
                                </div>
                                <Avatar className="h-9 w-9">
                                    <AvatarImage src="" />
                                    <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-500 text-white font-semibold">
                                        BS
                                    </AvatarFallback>
                                </Avatar>
                                <ChevronDown className="h-4 w-4 text-slate-400" />
                            </div>

                            <Button className="bg-slate-900 hover:bg-slate-800 text-white text-xs px-4 py-2 rounded-lg font-semibold">
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
                            <div className="flex items-center justify-between mb-4">
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
                            <div className="grid grid-cols-4 gap-4 mb-6">
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
                            <div className="grid grid-cols-2 gap-6 mb-6">
                                {/* Graph Report */}
                                <Card className="bg-white border-slate-200">
                                    <CardContent className="p-6">
                                        <div className="flex items-center justify-between mb-6">
                                            <h3 className="text-base font-bold text-slate-900">Graph Report</h3>
                                            <Button variant="ghost" size="icon" className="h-6 w-6">
                                                <MoreHorizontal className="h-4 w-4 text-slate-600" />
                                            </Button>
                                        </div>

                                        {/* Donut Chart */}
                                        <div className="flex items-center justify-center mb-6">
                                            <div className="relative w-48 h-48">
                                                <svg viewBox="0 0 200 200" className="transform -rotate-90">
                                                    {/* Purchases - 28% */}
                                                    <circle
                                                        cx="100"
                                                        cy="100"
                                                        r="70"
                                                        fill="none"
                                                        stroke="#86efac"
                                                        strokeWidth="30"
                                                        strokeDasharray={`${28 * 4.4} 440`}
                                                        strokeDashoffset="0"
                                                    />
                                                    {/* Suppliers - 18% */}
                                                    <circle
                                                        cx="100"
                                                        cy="100"
                                                        r="70"
                                                        fill="none"
                                                        stroke="#fda4af"
                                                        strokeWidth="30"
                                                        strokeDasharray={`${18 * 4.4} 440`}
                                                        strokeDashoffset={`-${28 * 4.4}`}
                                                    />
                                                    {/* Sales - 12% */}
                                                    <circle
                                                        cx="100"
                                                        cy="100"
                                                        r="70"
                                                        fill="none"
                                                        stroke="#d1d5db"
                                                        strokeWidth="30"
                                                        strokeDasharray={`${12 * 4.4} 440`}
                                                        strokeDashoffset={`-${(28 + 18) * 4.4}`}
                                                    />
                                                    {/* No Sales - 42% */}
                                                    <circle
                                                        cx="100"
                                                        cy="100"
                                                        r="70"
                                                        fill="none"
                                                        stroke="#bef264"
                                                        strokeWidth="30"
                                                        strokeDasharray={`${42 * 4.4} 440`}
                                                        strokeDashoffset={`-${(28 + 18 + 12) * 4.4}`}
                                                    />
                                                </svg>
                                                <div className="absolute inset-0 flex flex-col items-center justify-center">
                                                    <p className="text-xs font-semibold text-slate-500">Total</p>
                                                    <p className="text-3xl font-bold text-slate-900">755K</p>
                                                </div>
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

                                        {/* Bar Chart */}
                                        <div className="relative h-48 flex items-end justify-between gap-3 mb-4">
                                            {/* Y-axis labels */}
                                            <div className="absolute left-0 top-0 bottom-0 flex flex-col justify-between text-[10px] text-slate-400 -ml-8">
                                                <span>45K</span>
                                                <span>30K</span>
                                                <span>15K</span>
                                                <span>5K</span>
                                                <span>0K</span>
                                            </div>

                                            {/* Bars */}
                                            {Object.entries(weeklySales).map(([day, value], index) => {
                                                const height = (value / maxSales) * 100
                                                const colors = [
                                                    'from-orange-300 to-orange-200',
                                                    'from-pink-300 to-pink-200',
                                                    'from-lime-300 to-lime-200',
                                                    'from-cyan-300 to-cyan-200',
                                                    'from-red-300 to-red-200',
                                                    'from-purple-300 to-purple-200'
                                                ]

                                                return (
                                                    <div key={day} className="flex-1 flex flex-col items-center gap-2">
                                                        <div className="w-full relative" style={{ height: '160px' }}>
                                                            <div
                                                                className={`absolute bottom-0 w-full bg-gradient-to-t ${colors[index]} rounded-t-lg transition-all hover:opacity-80 cursor-pointer`}
                                                                style={{ height: `${height}%` }}
                                                            >
                                                                {/* Diagonal stripes pattern */}
                                                                <div className="absolute inset-0 opacity-30" style={{
                                                                    backgroundImage: `repeating-linear-gradient(45deg, transparent, transparent 4px, rgba(255,255,255,0.5) 4px, rgba(255,255,255,0.5) 8px)`
                                                                }}></div>
                                                            </div>
                                                        </div>
                                                        <span className="text-xs font-medium text-slate-600">{day}</span>
                                                    </div>
                                                )
                                            })}

                                            {/* Current value badge */}
                                            <div className="absolute top-0 right-12 bg-slate-900 text-white px-3 py-1.5 rounded-lg text-xs font-bold">
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
                                    <div className="border border-slate-200 rounded-lg overflow-hidden">
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
                                <h2 className="text-2xl font-bold text-slate-900">Order Validation</h2>
                            </div>
                            <div className="space-y-4">
                                {[1, 2, 3].map((i) => (
                                    <Card key={i} className="border-slate-200">
                                        <CardContent className="p-6 flex items-center justify-between">
                                            <div className="flex items-center gap-4">
                                                <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold">
                                                    ORD
                                                </div>
                                                <div>
                                                    <h4 className="font-bold text-lg">Order #{2390 + i}</h4>
                                                    <p className="text-sm text-slate-500">Patient: John Doe • 3 items</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <div className="text-right mr-4">
                                                    <p className="font-bold text-lg">$ 45.00</p>
                                                    <p className="text-xs text-slate-500">Pending Validation</p>
                                                </div>
                                                <Button className="bg-green-600 hover:bg-green-700 text-white">
                                                    <CheckCircle className="h-4 w-4 mr-2" /> Validate
                                                </Button>
                                                <Button variant="outline" className="border-red-200 text-red-600 hover:bg-red-50">
                                                    <XCircle className="h-4 w-4 mr-2" /> Reject
                                                </Button>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        </div>
                    )
                }
            </main >
        </div >
    )
}
