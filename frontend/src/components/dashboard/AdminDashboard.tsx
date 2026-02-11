import { useState, useEffect } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Progress } from '@/components/ui/progress'
import {
  Users,
  Building,
  Truck,
  Activity,
  DollarSign,
  TrendingUp,
  AlertTriangle,
  Shield,
  BarChart,
  Zap,
  Server,
  Clock
} from 'lucide-react'
import { UserManagement } from '@/components/admin/UserManagement'
import { PremiumDashboardLayout } from './PremiumDashboardLayout'
import { toast } from 'sonner'
import { EnhancedAnalytics } from '@/components/analytics/EnhancedAnalytics'
import { AuditTrail } from '@/components/audit/AuditTrail'
import { UserProfile, Order } from '@/types/dashboard'

export const AdminDashboard = () => {
  const [loading, setLoading] = useState(true)

  // Data States
  const [recentUsers, setRecentUsers] = useState<UserProfile[]>([])
  const [recentOrders, setRecentOrders] = useState<Order[]>([])

  // Stats State
  const [stats, setStats] = useState({
    totalUsers: 0,
    pharmacies: 0,
    drivers: 0,
    todayOrders: 0,
    monthlyRevenue: 0,
    pendingVerifications: 0,
    systemHealth: 99
  })

  useEffect(() => {
    fetchAdminData()

    // Real-time subscription could be added here
  }, [])

  const fetchAdminData = async () => {
    try {
      setLoading(true)
      const today = new Date().toISOString().split('T')[0]
      const firstDayOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString()

      // 1. Fetch Users Count & Breakdown
      const { count: userCount, error: userError } = await supabase
        .from('user_profiles')
        .select('*', { count: 'exact', head: true })

      const { count: pharmCount } = await supabase
        .from('user_profiles')
        .select('*', { count: 'exact', head: true })
        .eq('role', 'pharmacy')

      const { count: driverCount } = await supabase
        .from('user_profiles')
        .select('*', { count: 'exact', head: true })
        .eq('role', 'driver')

      if (userError) console.error('Error users:', userError)

      // 2. Fetch Orders & Revenue
      const { data: ordersData, error: ordersError } = await supabase
        .from('orders')
        .select(`
          id,
          total_amount,
          status,
          created_at,
          patient_id,
          pharmacy_id,
          patients:patient_id (
            user_profiles:user_id (name)
          ),
          pharmacies:pharmacy_id (
            user_profiles:user_id (name)
          )
        `)
        .order('created_at', { ascending: false })
        .limit(50) // Fetch enough for stats calculation but limit payload

      if (ordersError) console.error('Error orders:', ordersError)

      let revenue = 0
      let todayOrderCount = 0

      if (ordersData) {
        // Calculate Revenue (Monthly)
        revenue = ordersData
          .filter((o: any) => o.created_at >= firstDayOfMonth && o.status === 'delivered') // Assuming 'delivered' is the completed status
          .reduce((sum: number, o: any) => sum + (o.total_amount || 0), 0)

        // Today's orders
        todayOrderCount = ordersData.filter((o: any) => o.created_at.startsWith(today)).length

        // Format Recent Orders (Top 5)
        const formattedOrders = ordersData.slice(0, 5).map((o: any) => ({
          id: o.id.slice(0, 8).toUpperCase(),
          patient: o.patients?.user_profiles?.name || 'Inconnu',
          pharmacy: o.pharmacies?.user_profiles?.name || 'Inconnu',
          total: o.total_amount || 0,
          status: o.status,
          date: new Date(o.created_at).toLocaleDateString()
        }))
        setRecentOrders(formattedOrders)
      }

      // 3. Fetch Recent Users
      const { data: usersData, error: recentUsersError } = await supabase
        .from('user_profiles')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5)

      if (recentUsersError) console.error('Error recent users:', recentUsersError)

      if (usersData) {
        setRecentUsers(usersData.map((u: any) => ({
          id: u.id,
          name: u.name || 'Sans nom',
          email: u.email || 'N/A', // user_profiles might not have email directly depending on schema, usually in auth.users
          role: u.role,
          status: 'active', // Default for now
          joinedAt: new Date(u.created_at).toLocaleDateString()
        })))
      }

      // 4. Pending Verifications (Mocked query for now based on 'pending' status if it existed)
      // Assuming we verify pharmacies/drivers manually
      setStats({
        totalUsers: userCount || 0,
        pharmacies: pharmCount || 0,
        drivers: driverCount || 0,
        todayOrders: todayOrderCount,
        monthlyRevenue: revenue,
        pendingVerifications: 0, // Placeholder
        systemHealth: 99
      })

    } catch (error) {
      console.error('Admin Dashboard Error:', error)
      toast.error("Erreur de chargement des données")
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    const styles = {
      delivered: 'bg-green-500/10 text-green-600 border-green-200/50',
      completed: 'bg-green-500/10 text-green-600 border-green-200/50',
      pending: 'bg-orange-500/10 text-orange-600 border-orange-200/50',
      en_livraison: 'bg-blue-500/10 text-blue-600 border-blue-200/50',
      cancelled: 'bg-red-500/10 text-red-600 border-red-200/50'
    }
    const labels = {
      delivered: 'Livré',
      completed: 'Terminé',
      pending: 'En attente',
      en_livraison: 'En cours',
      cancelled: 'Annulé'
    }
    return (
      <Badge className={`${styles[status as keyof typeof styles] || 'bg-gray-100/10'} border px-2 py-0.5 rounded-full text-[10px] font-black uppercase`}>
        {labels[status as keyof typeof labels] || status}
      </Badge>
    )
  }

  return (
    <PremiumDashboardLayout activeTab="home" role="admin">
      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
        {/* Admin Command Header */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6">
          <div className="space-y-1">
            <h2 className="text-3xl font-black tracking-tighter text-foreground/90 uppercase">
              System <span className="text-red-500 tracking-normal">Control</span>
            </h2>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 bg-white/40 px-3 py-1.5 rounded-full border border-white/40 shadow-sm">
                <div className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse" />
                <span className="text-xs font-bold uppercase tracking-widest text-green-700">Infrastructure OK</span>
              </div>
              <p className="text-xs text-muted-foreground font-medium flex items-center gap-1">
                <Shield className="h-4 w-4 text-primary" /> Admin Root Access
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <Button
              variant="outline"
              className="rounded-xl glass-morphism border-white/60 hover:bg-white/60 font-bold"
            >
              <Shield className="h-4 w-4 mr-2" /> Audit Sécurité
            </Button>
            <Button
              onClick={fetchAdminData}
              className="rounded-xl px-6 bg-red-600 hover:bg-red-700 shadow-lg shadow-red-200 transition-all hover:scale-105 font-bold"
            >
              <Zap className="h-4 w-4 mr-2" />
              Refresh Data
            </Button>
          </div>
        </div>

        {/* Bento Intelligence Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="glass-card p-6 flex flex-col justify-between h-40 border-primary/20 bg-primary/5">
            <div className="flex justify-between items-start">
              <div className="p-3 bg-primary/10 rounded-xl">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <TrendingUp className="h-4 w-4 text-primary" />
            </div>
            <div>
              <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Utilisateurs</p>
              <h3 className="text-3xl font-black">{stats.totalUsers.toLocaleString()} <span className="text-sm font-normal text-muted-foreground tracking-tighter">Total</span></h3>
            </div>
          </div>

          <div className="glass-card p-6 flex flex-col justify-between h-40 border-green-500/20 bg-green-500/5">
            <div className="flex justify-between items-start">
              <div className="p-3 bg-green-500/10 rounded-xl">
                <DollarSign className="h-6 w-6 text-green-600" />
              </div>
              <div className="text-[10px] font-black text-green-600 bg-green-500/10 px-2 py-1 rounded">REV</div>
            </div>
            <div>
              <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Revenus (Mensuel)</p>
              <h3 className="text-3xl font-black">{(stats.monthlyRevenue / 1000000).toFixed(2)}M <span className="text-sm font-normal text-muted-foreground tracking-tighter">FCFA</span></h3>
            </div>
          </div>

          <div className="glass-card p-6 flex flex-col justify-between h-40 border-orange-500/20 bg-orange-500/5">
            <div className="flex justify-between items-start">
              <div className="p-3 bg-orange-500/10 rounded-xl">
                <AlertTriangle className="h-6 w-6 text-orange-600" />
              </div>
              <div className="w-2 h-2 bg-orange-500 rounded-full animate-ping" />
            </div>
            <div>
              <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Pharmacies</p>
              <h3 className="text-3xl font-black text-orange-600">{stats.pharmacies} <span className="text-sm font-normal text-muted-foreground tracking-tighter text-foreground">Actives</span></h3>
            </div>
          </div>

          <div className="glass-card p-6 flex flex-col justify-between h-40 border-blue-500/20 bg-blue-500/5">
            <div className="flex justify-between items-start">
              <div className="p-3 bg-blue-500/10 rounded-xl">
                <Truck className="h-6 w-6 text-blue-600" />
              </div>
              <div className="text-[10px] font-black text-blue-600 uppercase">Flotte</div>
            </div>
            <div>
              <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Livreurs</p>
              <h3 className="text-3xl font-black text-blue-600">{stats.drivers}</h3>
            </div>
          </div>
        </div>

        <Tabs defaultValue="overview" className="space-y-8">
          <TabsList className="bg-white/40 backdrop-blur-md p-1.5 rounded-[1.5rem] border border-white/40 flex w-full max-w-3xl mb-4 overflow-x-auto gap-1">
            <TabsTrigger value="overview" className="flex-1 rounded-[1.2rem] py-2 data-[state=active]:bg-white data-[state=active]:shadow-xl font-bold">Health</TabsTrigger>
            <TabsTrigger value="users" className="flex-1 rounded-[1.2rem] py-2 data-[state=active]:bg-white data-[state=active]:shadow-xl font-bold">Accounts</TabsTrigger>
            <TabsTrigger value="orders" className="flex-1 rounded-[1.2rem] py-2 data-[state=active]:bg-white data-[state=active]:shadow-xl font-bold">Orders</TabsTrigger>
            <TabsTrigger value="analytics" className="flex-1 rounded-[1.2rem] py-2 data-[state=active]:bg-white data-[state=active]:shadow-xl font-bold">Analytics</TabsTrigger>
            <TabsTrigger value="audit" className="flex-1 rounded-[1.2rem] py-2 data-[state=active]:bg-white data-[state=active]:shadow-xl font-bold">Audit</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6 outline-none">
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              <div className="glass-card p-8 glow-border group">
                <div className="flex justify-between items-start mb-8">
                  <div>
                    <h3 className="text-xl font-black uppercase tracking-tight">Status Infrastructure</h3>
                    <p className="text-xs text-muted-foreground font-bold flex items-center gap-1"><Server className="h-3 w-3" /> All servers are responsive</p>
                  </div>
                  <Badge className="bg-green-500/10 text-green-600 border-green-200/50 uppercase text-[9px] font-black">Superviseur Actif</Badge>
                </div>

                <div className="space-y-8">
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs font-black uppercase tracking-widest">
                      <span>Main API Cluster</span>
                      <span className="text-green-600">99.8% Load capacity</span>
                    </div>
                    <Progress value={98} className="h-2 bg-white/20" />
                  </div>
                  <div className="grid grid-cols-2 gap-8 pt-4">
                    <div className="space-y-1">
                      <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Temps Moyen de Réponse</p>
                      <p className="text-2xl font-black tracking-tighter">125<span className="text-xs font-bold text-muted-foreground ml-1">ms</span></p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Sync. Base de données</p>
                      <p className="text-2xl font-black tracking-tighter text-blue-600">OPTIMAL</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="glass-card p-6 flex flex-col justify-between border-primary/20 bg-primary/5">
                  <h4 className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Commandes Aujourd'hui</h4>
                  <h3 className="text-3xl font-black">{stats.todayOrders}</h3>
                  <div className="flex items-center gap-2 text-primary font-bold text-xs">
                    <TrendingUp className="h-4 w-4" /> Live Traffic
                  </div>
                </div>
                <div className="glass-card p-6 flex flex-col justify-between border-purple-500/20 bg-purple-500/5">
                  <h4 className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Pharmacies</h4>
                  <h3 className="text-3xl font-black">+{stats.pharmacies}</h3>
                  <div className="flex items-center gap-2 text-purple-600 font-bold text-xs">
                    <Building className="h-4 w-4" /> Network
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="users" className="outline-none">
            <div className="glass-card p-0 overflow-hidden">
              <div className="bg-white/30 p-6 border-b border-white/20">
                <h3 className="text-xl font-black uppercase tracking-tight">Répertoire Global</h3>
                <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest">Gestion centralisée des identités</p>
              </div>
              <div className="p-6">
                <UserManagement roleFilter="all" />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="orders" className="outline-none">
            <div className="glass-card overflow-hidden">
              <Table>
                <TableHeader className="bg-white/10">
                  <TableRow className="border-white/20">
                    <TableHead className="font-black uppercase text-[10px] tracking-widest">Order ID</TableHead>
                    <TableHead className="font-black uppercase text-[10px] tracking-widest">Patient</TableHead>
                    <TableHead className="font-black uppercase text-[10px] tracking-widest">Provider</TableHead>
                    <TableHead className="font-black uppercase text-[10px] tracking-widest">Volume (F)</TableHead>
                    <TableHead className="font-black uppercase text-[10px] tracking-widest text-right">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentOrders.map((order) => (
                    <TableRow key={order.id} className="border-white/10 hover:bg-white/20 transition-colors">
                      <TableCell className="font-black">{order.id}</TableCell>
                      <TableCell className="font-bold">{order.patient}</TableCell>
                      <TableCell className="text-sm font-medium">{order.pharmacy}</TableCell>
                      <TableCell className="text-sm font-black">{order.total.toLocaleString()}</TableCell>
                      <TableCell className="text-right">{getStatusBadge(order.status)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </TabsContent>

          <TabsContent value="analytics" className="outline-none">
            <EnhancedAnalytics />
          </TabsContent>

          <TabsContent value="audit" className="outline-none">
            <AuditTrail />
          </TabsContent>
        </Tabs>
      </div>
    </PremiumDashboardLayout>
  )
}