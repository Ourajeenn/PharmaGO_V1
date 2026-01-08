import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { supabase } from '@/integrations/supabase/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Progress } from '@/components/ui/progress'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Switch } from '@/components/ui/switch'
import {
  Package,
  ShoppingCart,
  AlertTriangle,
  TrendingUp,
  Users,
  Plus,
  Search,
  Clock,
  MapPin,
  CheckCircle,
  XCircle,
  Eye,
  Edit,
  DollarSign,
  Star,
  Calendar as CalendarIcon,
  Pill,
  CreditCard,
  Loader2,
  Settings,
  ChevronRight,
  Activity,
  Zap
} from 'lucide-react'
import { toast } from 'sonner'
import { useNavigate } from 'react-router-dom'
import { EditablePharmacyProfile } from './EditablePharmacyProfile'
import { AddMedicineDialog } from './AddMedicineDialog'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { PremiumDashboardLayout } from './PremiumDashboardLayout'

export const PharmacyDashboard = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [isOpen, setIsOpen] = useState(true)
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [isAddMedicineOpen, setIsAddMedicineOpen] = useState(false)

  // Data States
  const [orders, setOrders] = useState<any[]>([])
  const [inventory, setInventory] = useState<any[]>([])
  const [stats, setStats] = useState({
    todayOrders: 0,
    weeklyRevenue: 0,
    averageRating: 4.8,
    lowStockItems: 0
  })

  useEffect(() => {
    if (user?.id) {
      fetchDashboardData()
    }
  }, [user])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      const today = new Date().toISOString().split('T')[0]

      const { data: pharmacy, error: pharmacyError } = await supabase
        .from('pharmacies')
        .select('id')
        .eq('user_id', user!.id)
        .single()

      if (pharmacyError) {
        console.error('Error fetching pharmacy details:', pharmacyError)
        return
      }

      if (!pharmacy) return

      const { data: ordersData, error: ordersError } = await supabase
        .from('orders')
        .select(`
            *,
            patients:patient_id (
                user_profiles:user_id (name, phone)
            )
        `)
        .eq('pharmacy_id', pharmacy.id)
        .order('created_at', { ascending: false })
        .limit(20)

      if (ordersError) console.error('Error fetching orders:', ordersError)

      if (ordersData) {
        const formattedOrders = ordersData.map((o: any) => ({
          id: o.id,
          patient: o.patients?.user_profiles?.name || 'Patient Inconnu',
          status: o.status,
          total: o.total_amount,
          items: o.medicines?.length || 0,
          time: new Date(o.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          address: o.delivery_address,
          phone: o.patients?.user_profiles?.phone || '',
          driver: null
        }))
        setOrders(formattedOrders)

        const todayCount = ordersData.filter((o: any) => o.created_at.startsWith(today)).length
        const revenue = ordersData
          .filter((o: any) => o.created_at.startsWith(today) && o.status === 'delivered')
          .reduce((sum: number, o: any) => sum + (o.total_amount || 0), 0)

        setStats(prev => ({
          ...prev,
          todayOrders: todayCount,
          weeklyRevenue: revenue
        }))
      }

      const { data: inventoryData, error: invError } = await supabase
        .from('pharmacy_inventory')
        .select(`
              quantity,
              price,
              expiry_date,
              medicines (
                  id,
                  name,
                  category
              )
          `)
        .eq('pharmacy_id', pharmacy.id)

      if (invError) console.error('Error fetching inventory:', invError)

      if (inventoryData) {
        setInventory(inventoryData.map((item: any) => ({
          id: item.medicines?.id,
          name: item.medicines?.name,
          stock: item.quantity,
          minStock: 10,
          price: item.price,
          category: item.medicines?.category,
          expiry: item.expiry_date
        })))

        setStats(prev => ({
          ...prev,
          lowStockItems: inventoryData.filter((i: any) => i.quantity <= 10).length
        }))
      }

    } catch (error) {
      console.error('Error loading pharmacy dashboard:', error)
      toast.error("Erreur de chargement")
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    const styles = {
      en_preparation: 'bg-orange-500/10 text-orange-600 border-orange-200/50',
      pret: 'bg-blue-500/10 text-blue-600 border-blue-200/50',
      en_livraison: 'bg-purple-500/10 text-purple-600 border-purple-200/50',
      livre: 'bg-green-500/10 text-green-600 border-green-200/50',
      annule: 'bg-red-500/10 text-red-600 border-red-200/50'
    }
    const labels = {
      en_preparation: 'En préparation',
      pret: 'Prêt',
      en_livraison: 'En livraison',
      livre: 'Livré',
      annule: 'Annulé'
    }
    return (
      <Badge className={`${styles[status as keyof typeof styles]} border px-3 py-1 rounded-full text-[10px] font-bold uppercase`}>
        {labels[status as keyof typeof labels]}
      </Badge>
    )
  }

  const getStockStatus = (current: number, min: number) => {
    if (current <= min) return 'text-red-600 font-black'
    if (current <= min * 1.5) return 'text-orange-600 font-bold'
    return 'text-green-600 font-bold'
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen mesh-gradient">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <PremiumDashboardLayout activeTab="home">
      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
        {/* Command Header */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6">
          <div className="space-y-1">
            <h2 className="text-3xl font-black tracking-tighter text-foreground/90 uppercase">
              Command Center <span className="text-primary tracking-normal">Pharmacie</span>
            </h2>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 bg-white/40 px-3 py-1.5 rounded-full border border-white/40 shadow-sm">
                <div className={`w-2.5 h-2.5 rounded-full ${isOpen ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
                <span className="text-xs font-bold uppercase tracking-widest">{isOpen ? 'Opérationnel' : 'Hors-ligne'}</span>
                <Switch
                  checked={isOpen}
                  onCheckedChange={setIsOpen}
                  className="scale-75"
                />
              </div>
              <p className="text-xs text-muted-foreground font-medium flex items-center gap-1">
                <Clock className="h-3 w-3" /> Mis à jour en temps réel
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <Button
              variant="outline"
              className="rounded-xl glass-morphism border-white/60 hover:bg-white/60"
              onClick={() => setIsSettingsOpen(true)}
            >
              <Settings className="h-4 w-4 mr-2" /> Paramètres
            </Button>
            <Button
              className="rounded-xl px-6 bg-primary hover:bg-primary-hover shadow-lg shadow-primary/20 transition-all hover:scale-105"
              onClick={() => setIsAddMedicineOpen(true)}
            >
              <Plus className="h-4 w-4 mr-2" />
              Ajouter Stock
            </Button>
          </div>
        </div>

        {/* Bento Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="glass-card p-6 flex flex-col justify-between h-40 border-primary/20 bg-primary/5">
            <div className="flex justify-between items-start">
              <div className="p-3 bg-primary/10 rounded-xl">
                <ShoppingCart className="h-6 w-6 text-primary" />
              </div>
              <div className="flex flex-col items-end">
                <span className="text-[10px] font-black text-primary bg-primary/10 px-2 py-1 rounded">LIVE</span>
              </div>
            </div>
            <div>
              <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Aujourd'hui</p>
              <h3 className="text-3xl font-black">{stats.todayOrders} <span className="text-sm font-normal text-muted-foreground tracking-tighter">Commandes</span></h3>
            </div>
          </div>

          <div className="glass-card p-6 flex flex-col justify-between h-40">
            <div className="flex justify-between items-start">
              <div className="p-3 bg-green-500/10 rounded-xl">
                <DollarSign className="h-6 w-6 text-green-600" />
              </div>
              <TrendingUp className="h-4 w-4 text-green-500" />
            </div>
            <div>
              <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Revenue (FCFA)</p>
              <h3 className="text-3xl font-black">{stats.weeklyRevenue.toLocaleString()} <span className="text-sm text-green-600">+15%</span></h3>
            </div>
          </div>

          <div className="glass-card p-6 flex flex-col justify-between h-40">
            <div className="flex justify-between items-start">
              <div className="p-3 bg-orange-500/10 rounded-xl">
                <AlertTriangle className="h-6 w-6 text-orange-600" />
              </div>
              {stats.lowStockItems > 0 && <div className="w-2 h-2 bg-orange-500 rounded-full animate-ping" />}
            </div>
            <div>
              <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Stock Faible</p>
              <h3 className={`text-3xl font-black ${stats.lowStockItems > 0 ? 'text-orange-600' : ''}`}>{stats.lowStockItems} <span className="text-sm font-normal text-muted-foreground tracking-tighter">Alertes</span></h3>
            </div>
          </div>

          <div className="glass-card p-6 flex flex-col justify-between h-40">
            <div className="flex justify-between items-start">
              <div className="p-3 bg-yellow-500/10 rounded-xl">
                <Star className="h-6 w-6 text-yellow-600 shadow-sm shadow-yellow-200" />
              </div>
              <Users className="h-4 w-4 text-muted-foreground" />
            </div>
            <div>
              <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Satisfaction</p>
              <h3 className="text-3xl font-black">{stats.averageRating} <span className="text-sm text-yellow-600 font-bold">/ 5</span></h3>
            </div>
          </div>
        </div>

        <Tabs defaultValue="orders" className="space-y-8">
          <TabsList className="bg-white/40 backdrop-blur-md p-1.5 rounded-[1.5rem] border border-white/40 flex w-full max-w-lg mb-4">
            <TabsTrigger value="orders" className="flex-1 rounded-[1.2rem] py-2 data-[state=active]:bg-white data-[state=active]:shadow-xl font-bold">Monitor</TabsTrigger>
            <TabsTrigger value="inventory" className="flex-1 rounded-[1.2rem] py-2 data-[state=active]:bg-white data-[state=active]:shadow-xl font-bold">Inventory</TabsTrigger>
            <TabsTrigger value="patients" className="flex-1 rounded-[1.2rem] py-2 data-[state=active]:bg-white data-[state=active]:shadow-xl font-bold">Patients</TabsTrigger>
            <TabsTrigger value="profile" className="flex-1 rounded-[1.2rem] py-2 data-[state=active]:bg-white data-[state=active]:shadow-xl font-bold">Compte</TabsTrigger>
          </TabsList>

          <TabsContent value="orders" className="space-y-6 outline-none">
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              {orders.length > 0 ? orders.map((order) => (
                <div key={order.id} className="glass-card overflow-hidden glow-border group">
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                          <Zap className="h-5 w-5" />
                        </div>
                        <div>
                          <h4 className="font-extrabold text-base tracking-tight">{order.id}</h4>
                          <p className="text-xs text-muted-foreground font-bold">{order.time} • {order.patient}</p>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-1.5">
                        {getStatusBadge(order.status)}
                        <p className="text-lg font-black text-foreground/80 tracking-tighter">{order.total.toLocaleString()} F</p>
                      </div>
                    </div>

                    <div className="space-y-3 mb-6">
                      <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground/80">
                        <MapPin className="h-3.5 w-3.5 text-red-500" />
                        <span className="truncate">{order.address}</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground/80">
                        <Pill className="h-3.5 w-3.5 text-blue-500" />
                        <span>{order.items} Médicaments vus</span>
                      </div>
                    </div>

                    <div className="flex gap-2 pt-2 border-t border-white/20 mt-4">
                      {order.status === 'en_preparation' && (
                        <Button className="flex-1 rounded-xl bg-primary shadow-md shadow-primary/20 font-bold text-xs" size="sm">
                          Prêt pour expédition
                        </Button>
                      )}
                      <Button variant="ghost" className="rounded-xl glass-morphism border-white/40 px-4" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              )) : (
                <div className="col-span-full glass-card p-12 text-center border-dashed">
                  <Clock className="h-16 w-16 mx-auto text-muted-foreground mb-4 opacity-20" />
                  <h3 className="text-xl font-bold">Aucune commande active</h3>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="inventory" className="outline-none">
            <div className="glass-card overflow-hidden">
              <div className="p-6 border-b border-white/20 flex justify-between items-center bg-white/30">
                <div>
                  <h3 className="text-xl font-black uppercase tracking-tight">Stock & Inventaire</h3>
                  <p className="text-xs text-muted-foreground font-bold">{inventory.length} produits référencés</p>
                </div>
                <div className="flex gap-2">
                  <div className="relative w-64 h-10">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input placeholder="Rechercher..." className="pl-10 h-full rounded-xl bg-white/50 border-white/20" />
                  </div>
                  <Button onClick={() => setIsAddMedicineOpen(true)} className="rounded-xl font-bold bg-primary shadow-lg shadow-primary/20">
                    + Add Item
                  </Button>
                </div>
              </div>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader className="bg-white/10">
                    <TableRow className="border-white/20 hover:bg-transparent">
                      <TableHead className="font-black uppercase text-[10px] tracking-widest">Produit</TableHead>
                      <TableHead className="font-black uppercase text-[10px] tracking-widest">Catégorie</TableHead>
                      <TableHead className="font-black uppercase text-[10px] tracking-widest">Stock</TableHead>
                      <TableHead className="font-black uppercase text-[10px] tracking-widest">Prix (F)</TableHead>
                      <TableHead className="font-black uppercase text-[10px] tracking-widest text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {inventory.map((item) => (
                      <TableRow key={item.id} className="border-white/10 hover:bg-white/20 transition-colors group">
                        <TableCell className="py-4">
                          <span className="font-bold text-foreground/80 group-hover:text-primary transition-colors">{item.name}</span>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="bg-white/40 border-white/40 text-[10px] font-bold">{item.category}</Badge>
                        </TableCell>
                        <TableCell>
                          <div className={`text-sm ${getStockStatus(item.stock, item.minStock)}`}>
                            {item.stock} <span className="text-[10px] text-muted-foreground font-normal">unités</span>
                          </div>
                        </TableCell>
                        <TableCell className="font-black text-sm">
                          {item.price.toLocaleString()}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1.5 translate-x-2 opacity-0 group-hover:opacity-100 group-hover:translate-x-0 transition-all">
                            <Button variant="ghost" size="icon" className="h-8 w-8 glass-card border-0"><Edit className="h-4 w-4 text-blue-500" /></Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8 glass-card border-0"><Eye className="h-4 w-4 text-purple-500" /></Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="patients" className="outline-none">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="glass-card p-8 text-center space-y-4">
                <Users className="h-12 w-12 mx-auto text-primary" />
                <h4 className="text-3xl font-black tracking-tighter">1,248</h4>
                <p className="text-xs text-muted-foreground font-bold uppercase tracking-widest">Patients Fidélisés</p>
              </div>
              <div className="glass-card p-8 text-center space-y-4">
                <CheckCircle className="h-12 w-12 mx-auto text-green-500" />
                <h4 className="text-3xl font-black tracking-tighter">98.2%</h4>
                <p className="text-xs text-muted-foreground font-bold uppercase tracking-widest">Satisfaction Client</p>
              </div>
              <div className="glass-card p-8 text-center space-y-4">
                <CreditCard className="h-12 w-12 mx-auto text-orange-500" />
                <h4 className="text-3xl font-black tracking-tighter">456</h4>
                <p className="text-xs text-muted-foreground font-bold uppercase tracking-widest">Cartes CMU / Assurés</p>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="profile" className="outline-none">
            <EditablePharmacyProfile />
          </TabsContent>
        </Tabs>
      </div>

      {/* Dialogs */}
      <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
        <DialogContent className="max-w-4xl glass-morphism border-white/20 max-h-[90vh] overflow-y-auto rounded-3xl p-0">
          <div className="bg-gradient-to-br from-primary/10 to-purple-500/10 p-6 border-b border-white/20 flex justify-between items-center">
            <DialogHeader>
              <DialogTitle className="text-2xl font-black tracking-tight uppercase">Config. Pharmacie</DialogTitle>
            </DialogHeader>
          </div>
          <div className="p-6">
            <EditablePharmacyProfile />
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isAddMedicineOpen} onOpenChange={setIsAddMedicineOpen}>
        <DialogContent className="sm:max-w-[500px] glass-morphism border-white/20 rounded-[2rem] p-0 overflow-hidden">
          <div className="bg-primary/10 p-6 border-b border-white/20">
            <DialogHeader>
              <DialogTitle className="text-xl font-black uppercase tracking-tight">Nouvel Inventaire</DialogTitle>
            </DialogHeader>
          </div>
          <div className="p-6">
            <AddMedicineDialog
              onSuccess={() => {
                setIsAddMedicineOpen(false)
                fetchDashboardData()
                toast.success("Stock mis à jour")
              }}
              onCancel={() => setIsAddMedicineOpen(false)}
            />
          </div>
        </DialogContent>
      </Dialog>
    </PremiumDashboardLayout>
  )
}