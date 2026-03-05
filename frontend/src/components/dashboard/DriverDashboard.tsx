import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { supabase } from '@/integrations/supabase/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Switch } from '@/components/ui/switch'
import { Progress } from '@/components/ui/progress'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import {
  Bike,
  MapPin,
  Clock,
  CheckCircle,
  XCircle,
  Navigation,
  Phone,
  Package,
  DollarSign,
  Calendar,
  Loader2,
  TrendingUp,
  Star,
  Route,
  MessageCircle,
  Eye,
  Settings,
  ChevronRight,
  Zap
} from 'lucide-react'
import { toast } from 'sonner'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { EditableDriverProfile } from './profiles/EditableDriverProfile'
import { PremiumDashboardLayout } from './PremiumDashboardLayout'
import { DeliveryProofModal } from './DeliveryProofModal'
import { RouteOptimizationSection } from '@/components/driver/RouteOptimizationSection'
import { DriverCompensationModal } from '@/components/driver/DriverCompensationModal'
import { ColdChainTracker } from '@/components/delivery/ColdChainTracker'
import { WeatherIntegration } from '@/components/weather/WeatherIntegration'
import { DeliveryZoneManager } from '@/components/driver/DeliveryZoneManager'
import { useSearchParams } from 'react-router-dom'

export const DriverDashboard = () => {
  const { user, profile } = useAuth()
  const [loading, setLoading] = useState(true)
  const [isAvailable, setIsAvailable] = useState(true)
  const [driverId, setDriverId] = useState<string | null>(null)
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [selectedDeliveryForProof, setSelectedDeliveryForProof] = useState<any>(null)
  const [isCompensationOpen, setIsCompensationOpen] = useState(false)
  const [dataSaverMode, setDataSaverMode] = useState(false)

  // Get tab from URL query params
  const [searchParams] = useSearchParams()
  const tabParam = searchParams.get('tab')
  const [activeTab, setActiveTab] = useState(tabParam || 'active')

  // Fetch initial availability
  useEffect(() => {
    const fetchAvailability = async () => {
      if (!user) return
      const { data, error } = await supabase
        .from('drivers')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle()

      if (data) {
        setIsAvailable(data.available ?? false)
        setDriverId(data.user_id) // user_id is the primary key in 'drivers' table
      }
    }
    fetchAvailability()
  }, [user])

  const toggleAvailability = async (checked: boolean) => {
    setIsAvailable(checked) // Optimistic update
    try {
      const { error } = await supabase
        .from('drivers')
        .update({ available: checked })
        .eq('user_id', user!.id)

      if (error) {
        throw error
      }
      toast.success(checked ? 'Vous êtes maintenant EN LIGNE' : 'Vous êtes HORS LIGNE')
    } catch (error) {
      console.error('Error updating availability:', error)
      toast.error('Erreur mise à jour statut')
      setIsAvailable(!checked) // Revert
    }
  }

  // Data States
  const [deliveries, setDeliveries] = useState<any[]>([])
  const [stats, setStats] = useState({
    todayDeliveries: 0,
    earnings: 0,
    rating: 4.9,
    kms: 45.2,
    weeklyEarnings: 95500,
    totalDistance: 45.2
  })

  useEffect(() => {
    if (user?.id) {
      fetchDashboardData()

      // Real-time listener for NEW and UPDATED orders (Sprint 39)
      const channel = supabase
        .channel('driver-missions')
        .on(
          'postgres_changes',
          { event: '*', table: 'orders' },
          () => {
            console.log('Real-time order update detected, refreshing...')
            fetchDashboardData()
          }
        )
        .subscribe()

      return () => {
        supabase.removeChannel(channel)
      }
    }
  }, [user])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      const today = new Date().toISOString().split('T')[0]

      const { data: deliveryData, error } = await supabase
        .from('orders')
        .select(`
            *,
            patients:patient_id (
                user_profiles:user_id (name, phone)
            ),
            pharmacies:pharmacy_id (
                user_profiles:user_id (name, phone, address)
            )
        `)
        .in('status', ['ready', 'picked_up', 'in_transit', 'delivered'])
        .order('created_at', { ascending: false })
        .limit(20)

      if (error) console.error('Error fetching deliveries:', error)

      if (deliveryData) {
        const formattedDeliveries = deliveryData.map((d: any) => ({
          id: d.id,
          orderId: d.id.slice(0, 8).toUpperCase(),
          pickup: d.pharmacies?.user_profiles?.name || 'Pharmacie',
          pickupAddress: d.pharmacies?.user_profiles?.address || 'Adresse Pharmacie',
          dropoff: d.delivery_address || 'Adresse Client',
          distance: '3.5 km',
          fee: 1500,
          status: d.status,
          customer: d.patients?.user_profiles?.name || 'Client',
          phone: d.patients?.user_profiles?.phone || '',
          time: new Date(d.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          date: new Date(d.created_at).toLocaleDateString(),
          medications: [],
          customerNotes: 'Sonnez à l\'interphone'
        }))
        setDeliveries(formattedDeliveries)

        const todayFinished = deliveryData.filter((d: any) => d.created_at.startsWith(today) && (d.status === 'delivered' || d.status === 'livre'))

        setStats(prev => ({
          ...prev,
          todayDeliveries: todayFinished.length,
          earnings: todayFinished.length * 1500,
          weeklyEarnings: prev.weeklyEarnings + (todayFinished.length * 1500)
        }))
      }

    } catch (error) {
      console.error(error)
      toast.error("Erreur chargement livraisons")
    } finally {
      setLoading(false)
    }
  }

  // ── Real-time GPS Tracking Logic ────────────────────────
  const [activeDeliveryId, setActiveDeliveryId] = useState<string | null>(null)

  useEffect(() => {
    // Detect the single active delivery for tracking
    const active = deliveries.find(d => ['picked_up', 'in_transit'].includes(d.status))
    setActiveDeliveryId(active?.id || null)
  }, [deliveries])

  useEffect(() => {
    if (!activeDeliveryId || !isAvailable) return

    let watchId: number | null = null

    if ("geolocation" in navigator) {
      watchId = navigator.geolocation.watchPosition(
        async (pos) => {
          const { latitude, longitude } = pos.coords

          // Upsert to delivery_tracking table
          await supabase
            .from('delivery_tracking')
            .upsert({
              order_id: activeDeliveryId,
              driver_id: driverId,
              status: deliveries.find(d => d.id === activeDeliveryId)?.status || 'in_transit',
              current_latitude: latitude,
              current_longitude: longitude,
              updated_at: new Date().toISOString()
            }, { onConflict: 'order_id' })
        },
        (err) => console.error("GPS Watch Error:", err),
        { enableHighAccuracy: true, maximumAge: 5000, timeout: 15000 }
      )
    }

    return () => {
      if (watchId !== null) navigator.geolocation.clearWatch(watchId)
    }
  }, [activeDeliveryId, isAvailable])

  const handleStatusUpdate = async (orderId: string, newStatus: string, customerPhone: string, customerName: string) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status: newStatus })
        .eq('id', orderId)

      if (error) throw error

      toast.success(`Statut mis à jour: ${newStatus}`)

      // Update local state
      setDeliveries(prev => prev.map(d => d.id === orderId ? { ...d, status: newStatus } : d))

      // Send SMS Notification
      if (customerPhone) {
        let message = ''
        if (newStatus === 'in_transit') {
          message = `Bonjour ${customerName}, votre livreur PharmaGo est en route ! Votre commande arrive bientôt.`
        } else if (newStatus === 'delivered') {
          message = `Bonjour ${customerName}, votre commande PharmaGo a été livrée avec succès. Merci de nous avoir fait confiance !`
        }

        if (message) {
          await supabase.functions.invoke('send-sms', {
            body: { to: customerPhone, message }
          })
        }
      }

      if (newStatus === 'picked_up' && driverId) {
        // Initialize tracking entry
        await (supabase as any)
          .from('delivery_tracking')
          .upsert({
            order_id: orderId,
            driver_id: driverId,
            status: 'picked_up',
            updated_at: new Date().toISOString()
          }, { onConflict: 'order_id' })
      }

      fetchDashboardData() // Refresh everything
    } catch (error: any) {
      console.error('Error updating status:', error)
      toast.error("Échec de la mise à jour")
    }
  }

  const getStatusBadge = (status: string) => {
    const styles = {
      pending: 'bg-yellow-500/10 text-yellow-600 border-yellow-200/50',
      preparing: 'bg-orange-500/10 text-orange-600 border-orange-200/50',
      ready: 'bg-purple-500/10 text-purple-600 border-purple-200/50',
      picked_up: 'bg-blue-500/10 text-blue-600 border-blue-200/50',
      in_transit: 'bg-indigo-500/10 text-indigo-600 border-indigo-200/50',
      delivered: 'bg-green-500/10 text-green-600 border-green-200/50',
    }
    const labels = {
      pending: 'Attente',
      preparing: 'Préparation',
      ready: 'À ramasser',
      picked_up: 'Récupérée',
      in_transit: 'En route',
      delivered: 'Livré',
    }
    return (
      <Badge className={`${styles[status as keyof typeof styles] || 'bg-gray-100/10'} border px-2 py-0.5 rounded-full text-[10px] font-black uppercase`}>
        {labels[status as keyof typeof labels] || status}
      </Badge>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen mesh-gradient">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    )
  }

  const activeDeliveries = deliveries.filter(d => ['ready', 'picked_up', 'in_transit'].includes(d.status))
  const historyDeliveries = deliveries.filter(d => d.status === 'delivered')

  return (
    <PremiumDashboardLayout activeTab="home" role="driver">
      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
        {/* Delivery Header */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6">
          <div className="space-y-1">
            <h2 className="text-3xl font-black tracking-tighter text-foreground/90 uppercase">
              Route <span className="text-primary tracking-normal">Master</span>
            </h2>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 bg-white/40 px-3 py-1.5 rounded-full border border-white/40 shadow-sm">
                <div className={`w-2.5 h-2.5 rounded-full ${isAvailable ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
                <span className="text-xs font-bold uppercase tracking-widest">{isAvailable ? 'En Service' : 'Hors Service'}</span>
                <Switch
                  checked={isAvailable}
                  onCheckedChange={toggleAvailability}
                  className="scale-75"
                />
              </div>
              <p className="text-xs text-muted-foreground font-medium flex items-center gap-1">
                <Bike className="h-4 w-4 text-primary" /> {profile?.name || 'Livreur'}
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <Button
              variant="outline"
              className="rounded-xl glass-morphism border-white/60 hover:bg-white/60"
              onClick={() => setIsSettingsOpen(true)}
            >
              <Settings className="h-4 w-4 mr-2" /> Profil
            </Button>
            <Button
              className="rounded-xl px-6 bg-primary hover:bg-primary-hover shadow-lg shadow-primary/20 transition-all hover:scale-105"
            >
              <Route className="h-4 w-4 mr-2" />
              Mode Navigation
            </Button>
          </div>
        </div>

        {/* Data Saver Mode (P2 Feature) */}
        {dataSaverMode && (
          <div className="bg-blue-50 text-blue-800 px-4 py-2 rounded-lg flex items-center justify-between text-xs font-bold border border-blue-100">
            <span className="flex items-center gap-2"><Zap className="h-4 w-4" /> Mode Économie de Données : ACTIF</span>
            <Button size="sm" variant="ghost" onClick={() => setDataSaverMode(false)} className="h-6 hover:bg-blue-100">Désactiver</Button>
          </div>
        )}

        {/* Bento Performance Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="glass-card p-6 flex flex-col justify-between h-40 border-primary/20 bg-primary/5">
            <div className="flex justify-between items-start">
              <div className="p-3 bg-primary/10 rounded-xl">
                <Package className="h-6 w-6 text-primary" />
              </div>
              <div className="flex flex-col items-end">
                <span className="text-[10px] font-black text-primary bg-primary/10 px-2 py-1 rounded">JOUR</span>
              </div>
            </div>
            <div>
              <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Courses</p>
              <h3 className="text-3xl font-black">{stats.todayDeliveries} <span className="text-sm font-normal text-muted-foreground tracking-tighter">Livraisons</span></h3>
            </div>
          </div>



          <div
            className="glass-card p-6 flex flex-col justify-between h-40 cursor-pointer hover:border-green-400 transition-colors group relative overflow-hidden"
            onClick={() => setIsCompensationOpen(true)}
          >
            <div className="absolute inset-0 bg-green-500/5 group-hover:bg-green-500/10 transition-colors" />
            <div className="flex justify-between items-start relative z-10">
              <div className="p-3 bg-green-500/10 rounded-xl">
                <DollarSign className="h-6 w-6 text-green-600" />
              </div>
              <Badge className="bg-green-100 text-green-700 hover:bg-green-200 border-green-200 text-[10px]">DÉTAILS &rsaquo;</Badge>
            </div>
            <div className="relative z-10">
              <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Gains (FCFA)</p>
              <h3 className="text-3xl font-black">{stats.earnings.toLocaleString()} <span className="text-sm text-green-600">F</span></h3>
            </div>
          </div>

          <div className="glass-card p-6 flex flex-col justify-between h-40">
            <div className="flex justify-between items-start">
              <div className="p-3 bg-blue-500/10 rounded-xl">
                <Route className="h-6 w-6 text-blue-600" />
              </div>
              <MapPin className="h-4 w-4 text-blue-500" />
            </div>
            <div>
              <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Distance</p>
              <h3 className="text-3xl font-black">{stats.totalDistance} <span className="text-sm font-normal text-muted-foreground tracking-tighter">km</span></h3>
            </div>
          </div>

          <div className="glass-card p-6 flex flex-col justify-between h-40">
            <div className="flex justify-between items-start">
              <div className="p-3 bg-yellow-500/10 rounded-xl">
                <Star className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="text-[10px] font-black">EXCELLENT</div>
            </div>
            <div>
              <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Note Client</p>
              <h3 className="text-3xl font-black">{stats.rating} <span className="text-sm text-yellow-600 font-bold">/ 5</span></h3>
            </div>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
          <TabsList className="bg-white/40 backdrop-blur-md p-1.5 rounded-[1.5rem] border border-white/40 flex flex-wrap w-full max-w-2xl mb-4 gap-1">
            <TabsTrigger value="active" className="flex-1 rounded-[1.2rem] py-2 data-[state=active]:bg-white data-[state=active]:shadow-xl font-bold">Missions</TabsTrigger>
            <TabsTrigger value="route" className="flex-1 rounded-[1.2rem] py-2 data-[state=active]:bg-white data-[state=active]:shadow-xl font-bold">Itinéraire</TabsTrigger>
            <TabsTrigger value="coldchain" className="flex-1 rounded-[1.2rem] py-2 data-[state=active]:bg-white data-[state=active]:shadow-xl font-bold text-cyan-700 bg-cyan-50/50">❄️ Froid</TabsTrigger>
            <TabsTrigger value="weather" className="flex-1 rounded-[1.2rem] py-2 data-[state=active]:bg-white data-[state=active]:shadow-xl font-bold text-sky-700 bg-sky-50/50">🌤️ Météo</TabsTrigger>
            <TabsTrigger value="zones" className="flex-1 rounded-[1.2rem] py-2 data-[state=active]:bg-white data-[state=active]:shadow-xl font-bold text-orange-700 bg-orange-50/50">📍 Zones</TabsTrigger>
            <TabsTrigger value="history" className="flex-1 rounded-[1.2rem] py-2 data-[state=active]:bg-white data-[state=active]:shadow-xl font-bold">Historique</TabsTrigger>
          </TabsList>

          <TabsContent value="active" className="space-y-6 outline-none">
            {activeDeliveries.length > 0 ? (
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                {activeDeliveries.map((delivery) => (
                  <div key={delivery.id} className="glass-card overflow-hidden glow-border group relative">
                    <div className="absolute top-0 right-0 p-4">
                      <span className="text-[10px] font-black bg-white/60 px-2 py-1 rounded-full border border-white/40">{delivery.distance}</span>
                    </div>
                    <div className="p-6">
                      <div className="flex items-center gap-4 mb-6">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform">
                          <Package className="h-6 w-6" />
                        </div>
                        <div>
                          <h4 className="font-extrabold text-lg tracking-tight">#{delivery.orderId}</h4>
                          <p className="text-xs text-muted-foreground font-bold uppercase">{delivery.time} • COURSE RAPIDE</p>
                        </div>
                      </div>

                      <div className="space-y-6 mb-8 relative">
                        <div className="absolute left-[7px] top-2 bottom-2 w-[2px] bg-gradient-to-b from-primary via-purple-400 to-red-500 opacity-20" />

                        <div className="flex gap-4 items-start">
                          <div className="w-4 h-4 rounded-full bg-primary/20 flex items-center justify-center z-10 mt-1">
                            <div className="w-2 h-2 rounded-full bg-primary" />
                          </div>
                          <div className="flex-1">
                            <p className="text-[10px] font-black text-primary uppercase tracking-widest">Point de retrait</p>
                            <p className="font-bold text-sm">{delivery.pickup}</p>
                            <p className="text-xs text-muted-foreground truncate">{delivery.pickupAddress}</p>
                          </div>
                        </div>

                        <div className="flex gap-4 items-start">
                          <div className="w-4 h-4 rounded-full bg-red-500/20 flex items-center justify-center z-10 mt-1">
                            <div className="w-2 h-2 rounded-full bg-red-500" />
                          </div>
                          <div className="flex-1">
                            <p className="text-[10px] font-black text-red-500 uppercase tracking-widest">Point de livraison</p>
                            <p className="font-bold text-sm">{delivery.customer}</p>
                            <p className="text-xs text-muted-foreground truncate">{delivery.dropoff}</p>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4 mb-6">
                        <div className="glass-card bg-white/20 p-3 rounded-xl border-white/20">
                          <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">Gain Garanti</p>
                          <p className="text-xl font-black">{delivery.fee.toLocaleString()} F</p>
                        </div>
                        <div className="glass-card bg-white/20 p-3 rounded-xl border-white/20">
                          <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">Status</p>
                          {getStatusBadge(delivery.status)}
                        </div>
                      </div>

                      <div className="flex gap-3">
                        {delivery.status === 'ready' && (
                          <Button
                            className="flex-1 rounded-xl bg-primary shadow-xl shadow-primary/20 font-bold group-hover:translate-y-[-2px] transition-all"
                            onClick={() => handleStatusUpdate(delivery.id, 'picked_up', delivery.phone, delivery.customer)}
                          >
                            <CheckCircle className="h-4 w-4 mr-2" /> Récupérer
                          </Button>
                        )}
                        {delivery.status === 'picked_up' && (
                          <Button
                            className="flex-1 rounded-xl bg-orange-600 shadow-xl shadow-orange-200 font-bold group-hover:translate-y-[-2px] transition-all text-white"
                            onClick={() => handleStatusUpdate(delivery.id, 'in_transit', delivery.phone, delivery.customer)}
                          >
                            <Navigation className="h-4 w-4 mr-2" /> Commencer Livraison
                          </Button>
                        )}
                        {delivery.status === 'in_transit' && (
                          <Button
                            className="flex-1 rounded-xl bg-green-600 shadow-xl shadow-green-200 font-bold group-hover:translate-y-[-2px] transition-all text-white"
                            onClick={() => setSelectedDeliveryForProof(delivery)}
                          >
                            <Zap className="h-4 w-4 mr-2" /> Valider Livraison
                          </Button>
                        )}
                        <Button variant="outline" className="rounded-xl glass-morphism border-white/40 w-12 px-0">
                          <Navigation className="h-4 w-4 text-blue-500" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="glass-card p-12 text-center border-dashed">
                <Package className="h-16 w-16 mx-auto text-muted-foreground mb-4 opacity-20" />
                <h3 className="text-xl font-bold">En attente de missions...</h3>
                <p className="text-sm text-muted-foreground mt-2">Dès qu'une commande sera prête, elle apparaîtra ici.</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="route" className="outline-none">
            <RouteOptimizationSection />
          </TabsContent>

          <TabsContent value="history" className="outline-none">
            <div className="glass-card overflow-hidden">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader className="bg-white/10">
                    <TableRow className="border-white/20">
                      <TableHead className="font-black uppercase text-[10px] tracking-widest whitespace-nowrap">Date</TableHead>
                      <TableHead className="font-black uppercase text-[10px] tracking-widest whitespace-nowrap">ID</TableHead>
                      <TableHead className="font-black uppercase text-[10px] tracking-widest whitespace-nowrap">Client</TableHead>
                      <TableHead className="font-black uppercase text-[10px] tracking-widest text-right whitespace-nowrap">Gain</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {historyDeliveries.map((d) => (
                      <TableRow key={d.id} className="border-white/10 hover:bg-white/20 transition-colors">
                        <TableCell className="text-xs font-bold text-muted-foreground whitespace-nowrap">{d.date}</TableCell>
                        <TableCell className="font-bold whitespace-nowrap">{d.orderId}</TableCell>
                        <TableCell className="text-sm font-medium whitespace-nowrap">{d.customer}</TableCell>
                        <TableCell className="text-right font-black text-green-600 whitespace-nowrap">{d.fee} F</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="coldchain" className="outline-none">
            <ColdChainTracker role="driver" />
          </TabsContent>

          <TabsContent value="weather" className="outline-none">
            <WeatherIntegration />
          </TabsContent>

          <TabsContent value="zones" className="outline-none">
            <DeliveryZoneManager driverId={user?.id} />
          </TabsContent>
        </Tabs>
      </div>

      <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
        <DialogContent className="max-w-4xl glass-morphism border-white/20 max-h-[90vh] overflow-y-auto rounded-3xl p-0">
          <div className="bg-gradient-to-br from-primary/10 to-purple-500/10 p-6 border-b border-white/20">
            <DialogHeader>
              <DialogTitle className="text-2xl font-black tracking-tight uppercase">Mon Profil Livreur</DialogTitle>
            </DialogHeader>
          </div>
          <div className="p-6">
            <EditableDriverProfile />
          </div>
        </DialogContent>
      </Dialog>

      {/* Delivery Proof Modal */}
      {
        selectedDeliveryForProof && (
          <DeliveryProofModal
            orderId={selectedDeliveryForProof.id}
            customerName={selectedDeliveryForProof.customer}
            customerPhone={selectedDeliveryForProof.phone || ''}
            customerAddress={selectedDeliveryForProof.dropoff}
            items={[{ name: 'Commande médicaments', quantity: 1 }]}
            onComplete={async (proofData) => {
              // Update order status
              await handleStatusUpdate(
                selectedDeliveryForProof.id,
                'delivered',
                selectedDeliveryForProof.phone,
                selectedDeliveryForProof.customer
              )
              setSelectedDeliveryForProof(null)
            }}
            onCancel={() => setSelectedDeliveryForProof(null)}
          />
        )
      }
      <DriverCompensationModal
        isOpen={isCompensationOpen}
        onClose={() => setIsCompensationOpen(false)}
        weeklyEarnings={stats.weeklyEarnings}
      />
    </PremiumDashboardLayout >
  )
}