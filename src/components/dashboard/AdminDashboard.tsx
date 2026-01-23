import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Progress } from '@/components/ui/progress'
import { Input } from '@/components/ui/input'
import {
  Users,
  Building,
  Truck,
  Activity,
  ShoppingCart,
  DollarSign,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  Search,
  Eye,
  Edit,
  Shield,
  BarChart,
  Zap,
  ChevronRight,
  Server,
  Globe,
  Database
} from 'lucide-react'
import { UserManagement } from '@/components/admin/UserManagement'
import { PremiumDashboardLayout } from './PremiumDashboardLayout'

export const AdminDashboard = () => {
  const [recentUsers] = useState([
    {
      id: 'USR001',
      name: 'Marie Kouassi',
      email: 'marie@example.com',
      role: 'patient',
      status: 'active',
      joinedAt: '2024-01-15'
    },
    {
      id: 'USR002',
      name: 'Pharmacie Centrale',
      email: 'contact@pharma-centrale.ci',
      role: 'pharmacy',
      status: 'pending',
      joinedAt: '2024-01-14'
    }
  ])

  const [recentOrders] = useState([
    {
      id: 'CMD001',
      patient: 'Aya Traoré',
      pharmacy: 'Pharmacie du Plateau',
      total: 25500,
      status: 'completed',
      date: '2024-01-15'
    },
    {
      id: 'CMD002',
      patient: 'Koffi Yao',
      pharmacy: 'Pharmacie Centrale',
      total: 18750,
      status: 'in_progress',
      date: '2024-01-15'
    }
  ])

  const stats = {
    totalUsers: 1247,
    pharmacies: 45,
    drivers: 89,
    todayOrders: 156,
    monthlyRevenue: 15750000,
    pendingVerifications: 12,
    systemHealth: 98
  }

  const getStatusBadge = (status: string) => {
    const styles = {
      active: 'bg-green-500/10 text-green-600 border-green-200/50',
      pending: 'bg-orange-500/10 text-orange-600 border-orange-200/50',
      suspended: 'bg-red-500/10 text-red-600 border-red-200/50',
      completed: 'bg-green-500/10 text-green-600 border-green-200/50',
      in_progress: 'bg-blue-500/10 text-blue-600 border-blue-200/50',
      cancelled: 'bg-red-500/10 text-red-600 border-red-200/50'
    }
    return (
      <Badge className={`${styles[status as keyof typeof styles] || 'bg-gray-100/10'} border px-2 py-0.5 rounded-full text-[10px] font-black uppercase`}>
        {status}
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
              className="rounded-xl px-6 bg-red-600 hover:bg-red-700 shadow-lg shadow-red-200 transition-all hover:scale-105 font-bold"
            >
              <Zap className="h-4 w-4 mr-2" />
              Monitoring Live
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
              <h3 className="text-3xl font-black">{stats.totalUsers.toLocaleString()} <span className="text-sm font-normal text-muted-foreground tracking-tighter">+47 NEW</span></h3>
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
              <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Revenus Brut</p>
              <h3 className="text-3xl font-black">{(stats.monthlyRevenue / 1000000).toFixed(1)}M <span className="text-sm font-normal text-muted-foreground tracking-tighter">FCFA</span></h3>
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
              <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Vérifications</p>
              <h3 className="text-3xl font-black text-orange-600">{stats.pendingVerifications} <span className="text-sm font-normal text-muted-foreground tracking-tighter text-foreground">PENDING</span></h3>
            </div>
          </div>

          <div className="glass-card p-6 flex flex-col justify-between h-40 border-blue-500/20 bg-blue-500/5">
            <div className="flex justify-between items-start">
              <div className="p-3 bg-blue-500/10 rounded-xl">
                <Activity className="h-6 w-6 text-blue-600" />
              </div>
              <div className="text-[10px] font-black text-blue-600 uppercase">System Health</div>
            </div>
            <div>
              <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Uptime</p>
              <h3 className="text-3xl font-black text-blue-600">{stats.systemHealth}%</h3>
            </div>
          </div>
        </div>

        <Tabs defaultValue="overview" className="space-y-8">
          <TabsList className="bg-white/40 backdrop-blur-md p-1.5 rounded-[1.5rem] border border-white/40 flex w-full max-w-2xl mb-4 overflow-x-auto">
            <TabsTrigger value="overview" className="flex-1 rounded-[1.2rem] py-2 data-[state=active]:bg-white data-[state=active]:shadow-xl font-bold">Health</TabsTrigger>
            <TabsTrigger value="users" className="flex-1 rounded-[1.2rem] py-2 data-[state=active]:bg-white data-[state=active]:shadow-xl font-bold">Accounts</TabsTrigger>
            <TabsTrigger value="orders" className="flex-1 rounded-[1.2rem] py-2 data-[state=active]:bg-white data-[state=active]:shadow-xl font-bold">Orders</TabsTrigger>
            <TabsTrigger value="analytics" className="flex-1 rounded-[1.2rem] py-2 data-[state=active]:bg-white data-[state=active]:shadow-xl font-bold">Metrics</TabsTrigger>
            <TabsTrigger value="settings" className="flex-1 rounded-[1.2rem] py-2 data-[state=active]:bg-white data-[state=active]:shadow-xl font-bold">Config</TabsTrigger>
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
                  <h4 className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Nouveaux Inscrits</h4>
                  <h3 className="text-3xl font-black">+47</h3>
                  <div className="flex items-center gap-2 text-primary font-bold text-xs">
                    <TrendingUp className="h-4 w-4" /> 12% growth
                  </div>
                </div>
                <div className="glass-card p-6 flex flex-col justify-between border-purple-500/20 bg-purple-500/5">
                  <h4 className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Validations Pharm.</h4>
                  <h3 className="text-3xl font-black">+8</h3>
                  <div className="flex items-center gap-2 text-purple-600 font-bold text-xs">
                    <Building className="h-4 w-4" /> Ready for audit
                  </div>
                </div>
                <div className="glass-card p-6 flex flex-col justify-between border-blue-500/20 bg-blue-500/5">
                  <h4 className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Flotte Livreurs</h4>
                  <h3 className="text-3xl font-black">+12</h3>
                  <div className="flex items-center gap-2 text-blue-600 font-bold text-xs">
                    <Truck className="h-4 w-4" /> Active on-boarding
                  </div>
                </div>
                <div className="glass-card p-6 flex flex-col justify-between border-green-500/20 bg-green-500/5">
                  <h4 className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Service Level</h4>
                  <h3 className="text-3xl font-black">99%</h3>
                  <div className="flex items-center gap-2 text-green-600 font-bold text-xs">
                    <Shield className="h-4 w-4" /> Compliance OK
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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="glass-card p-8 text-center space-y-4 glow-border">
                <div className="bg-red-500/10 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto text-red-600">
                  <BarChart className="h-8 w-8" />
                </div>
                <div>
                  <h4 className="text-3xl font-black">{(stats.monthlyRevenue / 1000000).toFixed(1)}M</h4>
                  <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Revenus Mensuels</p>
                </div>
                <Badge className="bg-green-500/10 text-green-600 border-none font-bold text-[9px]">+15% vs MoM</Badge>
              </div>

              <div className="glass-card p-8 text-center space-y-4 glow-border">
                <div className="bg-primary/10 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto text-primary">
                  <TrendingUp className="h-8 w-8" />
                </div>
                <div>
                  <h4 className="text-3xl font-black">+23%</h4>
                  <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Retention Rate</p>
                </div>
                <Badge className="bg-blue-500/10 text-blue-600 border-none font-bold text-[9px]">Excellent growth</Badge>
              </div>

              <div className="glass-card p-8 text-center space-y-4 glow-border">
                <div className="bg-blue-500/10 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto text-blue-600">
                  <Clock className="h-8 w-8" />
                </div>
                <div>
                  <h4 className="text-3xl font-black">22<span className="text-sm">min</span></h4>
                  <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">SLA Livraison</p>
                </div>
                <Badge className="bg-green-500/10 text-green-600 border-none font-bold text-[9px]">Stable performance</Badge>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="settings" className="outline-none">
            <div className="glass-card p-12 text-center border-dashed border-white/40">
              <Shield className="h-20 w-20 mx-auto text-muted-foreground mb-4 opacity-20" />
              <h3 className="text-xl font-black uppercase tracking-tight">System Core Config</h3>
              <p className="text-sm text-muted-foreground mt-2 font-medium">Access restricted to Root Administrators only.</p>
              <Button className="mt-8 rounded-xl bg-foreground text-background font-bold px-8">Authenticate Root Access</Button>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </PremiumDashboardLayout>
  )
}