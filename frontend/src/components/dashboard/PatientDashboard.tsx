import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { supabase } from '@/integrations/supabase/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { EditablePatientProfile } from './profiles/EditablePatientProfile'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { OrderHistory } from '@/components/orders/OrderHistory'
import { PremiumDashboardLayout } from './PremiumDashboardLayout'
import { WeatherWidget } from './widgets/WeatherWidget'
import { RefillWidget } from './widgets/RefillWidget'
import { EWalletWidget } from './widgets/EWalletWidget'
import { MedicalRecordSection } from '@/components/patient/MedicalRecordSection'
import { MedicationRemindersSection } from '@/components/patient/MedicationRemindersSection'
import { HelpSupportSection } from '@/components/patient/HelpSupportSection'
import { PharmacyMapSection } from '@/components/maps/PharmacyMapSection'
import { LoyaltySection } from '@/components/dashboard/LoyaltySection'
import { AIHealthAssistant } from '@/components/assistant/AIHealthAssistant'
import { NotificationPermission } from '@/components/NotificationPermission'
import { VoiceCommandControl } from '@/components/assistant/VoiceCommandControl'
import { EWallet } from '@/components/wallet/EWallet'
import { PrescriptionRenewal } from '@/components/prescription/PrescriptionRenewal'
import { PatientRiskScore } from '@/components/health/PatientRiskScore'
import {
  ShoppingCart,
  MessageCircle,
  Calendar,
  ChevronRight,
  Plus,
  Activity,
  Heart,
  Settings,
  Package,
  CreditCard,
  FileText,
  Pill,
  Clock,
  User,
  MapPin,
  Shield,
  Sparkles,
  Zap,
  Droplet,
  Wind,
  LayoutDashboard
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { PatientProfileWidget } from '@/components/dashboard/widgets/medicore/PatientProfileWidget'
import { HealthMetricCard } from '@/components/dashboard/widgets/medicore/HealthMetricCard'
import { BodyMapWidget } from '@/components/dashboard/widgets/medicore/BodyMapWidget'
import { NeuroActivityWidget } from '@/components/dashboard/widgets/medicore/NeuroActivityWidget'
import { DoctorListWidget } from '@/components/dashboard/widgets/medicore/DoctorListWidget'
import { AppointmentsWidget } from '@/components/dashboard/widgets/medicore/AppointmentsWidget'

export const PatientDashboard = () => {
  const { user, profile } = useAuth()
  const navigate = useNavigate()
  const [apiStatus, setApiStatus] = useState<'checking' | 'online' | 'offline'>('checking')
  const [isSettingsOpen, setIsSettingsOpen] = useState(false) // State for settings dialog

  // Check API Health
  useEffect(() => {
    const checkApi = async () => {
      // Dynamic import to avoid circular dependencies if any, though likely fine here
      const { PharmacyService } = await import('@/services/PharmacyService');
      const isHealthy = await PharmacyService.checkHealth();
      setApiStatus(isHealthy ? 'online' : 'offline');
    };
    checkApi();
  }, []);

  interface DashboardOrder {
    id: string
    fullId: string
    status: string
    total: number
    pharmacy: string
    items: number
    estimatedTime: string
    driver: string
  }

  interface Metric {
    value: string
    unit: string
  }

  interface HealthMetrics {
    glucose: Metric
    blood_pressure: Metric
    spO2: Metric
  }

  interface DashboardStats {
    activeOrders: number
    savings: number
    pendingPrescriptions: number
    unreadMessages: number
  }

  const [stats, setStats] = useState<DashboardStats>({
    activeOrders: 0,
    savings: 0,
    pendingPrescriptions: 0,
    unreadMessages: 0
  })

  // Real data state
  const [orders, setOrders] = useState<DashboardOrder[]>([])
  const [loadingOrders, setLoadingOrders] = useState(true)
  const [metrics, setMetrics] = useState<HealthMetrics>({
    glucose: { value: 'N/A', unit: 'mg/dL' },
    blood_pressure: { value: 'N/A', unit: 'mmHg' },
    spO2: { value: 'N/A', unit: '%' }
  })

  useEffect(() => {
    if (user?.id) {
      fetchDashboardData()
    }
  }, [user])

  const fetchDashboardData = async () => {
    if (!user) return
    try {
      setLoadingOrders(true)

      // 1. Fetch Orders (Active)
      const { data: ordersData, error: ordersError } = await supabase
        .from('orders')
        .select(`
          *,
          pharmacy:pharmacies(name),
          driver:drivers(user_id)
        `)
        .eq('patient_id', user.id)
        .order('created_at', { ascending: false })

      if (ordersError) throw ordersError

      // Transform orders for UI
      const formattedOrders: DashboardOrder[] = (ordersData || []).map((order: any) => ({
        id: order.id.substring(0, 8).toUpperCase(), // Short ID
        fullId: order.id,
        status: order.status,
        total: order.total || 0,
        pharmacy: order.pharmacy?.name || 'Pharmacie inconnue',
        items: 1, // Placeholder as we'd need a join on order_items to get exact count
        estimatedTime: 'Unknown',
        driver: order.driver ? 'Livreur assigné' : 'En attente'
      }))

      setOrders(formattedOrders)

      // 2. Fetch Prescriptions Count
      const { count: prescriptionsCount } = await supabase
        .from('prescriptions')
        .select('*', { count: 'exact', head: true })
        .eq('patient_id', user.id)
        .eq('status', 'pending')

      // 3. Fetch Unread Messages
      const { count: messagesCount } = await supabase
        .from('messages')
        .select('*', { count: 'exact', head: true })
        .eq('recipient_id', user.id)
        .eq('is_read', false)

      // 4. Fetch Health Metrics
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: metricsData } = await (supabase as any)
        .from('health_metrics')
        .select('*')
        .eq('patient_id', user.id)
        .order('measured_at', { ascending: false })

      if (metricsData) {
        const latestMetrics = { ...metrics }

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const glucose = metricsData.find((m: any) => m.metric_type === 'glucose' || m.type === 'glucose')
        if (glucose) {
          latestMetrics.glucose = {
            value: glucose.value.value || glucose.value,
            unit: glucose.unit
          }
        }

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const bp = metricsData.find((m: any) => m.metric_type === 'blood_pressure' || m.type === 'blood_pressure')
        if (bp) {
          const val = bp.value
          latestMetrics.blood_pressure = {
            value: val.systolic && val.diastolic ? `${val.systolic}/${val.diastolic}` : (val.value || 'N/A'),
            unit: bp.unit || 'mmHg'
          }
        }

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const spo2 = metricsData.find((m: any) => m.metric_type === 'spO2' || m.type === 'spO2')
        if (spo2) {
          latestMetrics.spO2 = {
            value: spo2.value?.value || spo2.value || 'N/A',
            unit: spo2.unit || '%'
          }
        }
        setMetrics(latestMetrics)
      }


      setStats({
        activeOrders: formattedOrders.filter((o: any) => ['pending', 'processing', 'delivering'].includes(o.status)).length,
        savings: 45000, // Placeholder logic for savings
        pendingPrescriptions: prescriptionsCount || 0,
        unreadMessages: messagesCount || 0
      })

    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setLoadingOrders(false)
    }
  }

  const getStatusBadge = (status: string) => {
    const styles = {
      en_cours: 'bg-blue-500/10 text-blue-600 border-blue-200/50',
      livre: 'bg-green-500/10 text-green-600 border-green-200/50',
      annule: 'bg-red-500/10 text-red-600 border-red-200/50'
    }
    const labels = {
      en_cours: 'En cours',
      livre: 'Livrée',
      annule: 'Annulée'
    }
    return (
      <Badge className={`${styles[status as keyof typeof styles]} border px-3 py-1 rounded-full text-xs font-semibold`}>
        {labels[status as keyof typeof labels]}
      </Badge>
    )
  }

  return (
    <PremiumDashboardLayout activeTab="home" role="patient">
      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="grid grid-cols-1 lg:grid-cols-1 gap-8">
          <div className="col-span-1 space-y-8 h-full">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold tracking-tight text-slate-900">Tableau de Bord</h2>
                <p className="text-slate-500">Bienvenue sur votre espace santé</p>
              </div>
              <div className="flex items-center gap-2 bg-white/80 backdrop-blur-sm px-3 py-1.5 rounded-full border border-white/20 shadow-sm">
                <span className={`h-2.5 w-2.5 rounded-full ${apiStatus === 'online' ? 'bg-green-500' : apiStatus === 'checking' ? 'bg-yellow-500 animate-pulse' : 'bg-orange-500'}`}></span>
                <span className="text-xs font-medium text-slate-700">
                  {apiStatus === 'online' ? 'Système Connecté' : apiStatus === 'checking' ? 'Connexion...' : 'Mode Hors Ligne'}
                </span>
              </div>
            </div>

            <Tabs defaultValue="overview" className="w-full space-y-6">
              <TabsList className="bg-white/40 backdrop-blur-md p-1.5 rounded-2xl border border-white/40 mb-6 flex flex-wrap gap-2 h-auto">
                <TabsTrigger value="overview" className="rounded-xl px-4 py-2 data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-md transition-all"><LayoutDashboard className="h-4 w-4 mr-2" /> Vue d'ensemble</TabsTrigger>
                <TabsTrigger value="orders" className="rounded-xl px-4 py-2 data-[state=active]:bg-white data-[state=active]:shadow-sm">Suivi</TabsTrigger>
                <TabsTrigger value="pharmacies" className="rounded-xl data-[state=active]:bg-white data-[state=active]:shadow-sm">Pharmacies</TabsTrigger>
                <TabsTrigger value="history" className="rounded-xl data-[state=active]:bg-white data-[state=active]:shadow-sm">Historique</TabsTrigger>
                <TabsTrigger value="prescriptions" className="rounded-xl data-[state=active]:bg-white data-[state=active]:shadow-sm">Docs</TabsTrigger>
                <TabsTrigger value="medical" className="rounded-xl data-[state=active]:bg-white data-[state=active]:shadow-sm">Dossier</TabsTrigger>
                <TabsTrigger value="reminders" className="rounded-xl data-[state=active]:bg-white data-[state=active]:shadow-sm">Rappels</TabsTrigger>
                <TabsTrigger value="ewallet" className="rounded-xl data-[state=active]:bg-white data-[state=active]:shadow-sm bg-green-50/50 text-green-700">💳 Portefeuille</TabsTrigger>
                <TabsTrigger value="renewals" className="rounded-xl data-[state=active]:bg-white data-[state=active]:shadow-sm bg-purple-50/50 text-purple-700">🔄 Renouvellement</TabsTrigger>
                <TabsTrigger value="riskscore" className="rounded-xl data-[state=active]:bg-white data-[state=active]:shadow-sm bg-indigo-50/50 text-indigo-700">🧠 Score IA</TabsTrigger>
                <TabsTrigger value="loyalty" className="rounded-xl data-[state=active]:bg-white data-[state=active]:shadow-sm text-amber-700 data-[state=active]:text-amber-700 bg-amber-50/50">Fidélité</TabsTrigger>
                <TabsTrigger value="assistant" className="rounded-xl data-[state=active]:bg-white data-[state=active]:shadow-sm bg-blue-50/50 text-blue-700 data-[state=active]:text-blue-700 font-bold"><Sparkles className="h-3 w-3 mr-1" /> IA Assistant</TabsTrigger>
                <TabsTrigger value="help" className="rounded-xl data-[state=active]:bg-white data-[state=active]:shadow-sm">Aide</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-6 outline-none animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="grid grid-cols-12 gap-6">
                  {/* Left Column: Profile & MRI */}
                  <div className="col-span-12 lg:col-span-4 xl:col-span-3 space-y-6 flex flex-col">
                    <div className="h-[340px]">
                      <PatientProfileWidget />
                    </div>
                    <div className="h-[320px] flex-1">
                      <BodyMapWidget />
                    </div>
                  </div>

                  {/* Center Column: Metrics & Charts */}
                  <div className="col-span-12 lg:col-span-8 xl:col-span-6 space-y-6">
                    {/* Metrics Row */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <HealthMetricCard
                        title="Glycémie"
                        value={metrics.glucose.value}
                        unit={metrics.glucose.unit}
                        icon={Droplet}
                        chartType="wave"
                        chartColor="text-blue-400"
                      />
                      <HealthMetricCard
                        title="Tension"
                        value={metrics.blood_pressure.value}
                        unit={metrics.blood_pressure.unit}
                        subtitle="Systolique"
                        icon={Activity}
                        chartType="bar"
                        chartColor="text-indigo-400"
                      />
                      <HealthMetricCard
                        title="Oxygène"
                        value={metrics.spO2.value}
                        unit={metrics.spO2.unit}
                        icon={Wind}
                        chartType="wave"
                        chartColor="text-cyan-400"
                      />
                    </div>

                    {/* Neuro / Activity Chart */}
                    <div className="h-[300px]">
                      <NeuroActivityWidget />
                    </div>

                    {/* Doctors List */}
                    <div className="h-auto">
                      <DoctorListWidget />
                    </div>
                  </div>

                  {/* Right Column: Appointments */}
                  <div className="col-span-12 xl:col-span-3 h-auto xl:h-full">
                    <AppointmentsWidget />
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="orders" className="space-y-4 outline-none">
                {loadingOrders ? (
                  <div className="flex justify-center p-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  </div>
                ) : orders.length > 0 ? (
                  orders.map((order) => (
                    <div key={order.fullId} className="glass-card glow-border overflow-hidden">
                      <div className="p-6">
                        <div className="flex justify-between items-center mb-6">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg">
                              <Pill className="h-6 w-6" />
                            </div>
                            <div>
                              <h4 className="font-extrabold text-lg flex items-center gap-2">
                                {order.id}
                                {getStatusBadge(order.status)}
                              </h4>
                              <p className="text-sm text-muted-foreground">{order.pharmacy}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-2xl font-black text-foreground/80">{order.total.toLocaleString()} FCFA</p>
                            <p className="text-xs text-muted-foreground">Paiement : Mobile Money</p>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8 p-4 bg-white/30 rounded-2xl border border-white/20">
                          <div className="space-y-1">
                            <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-tighter">Articles</p>
                            <p className="text-sm font-bold flex items-center gap-2"><Pill className="h-3 w-3" /> {order.items}</p>
                          </div>
                          <div className="space-y-1 border-l border-white/20 pl-6">
                            <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-tighter">Estimation</p>
                            <p className="text-sm font-bold flex items-center gap-2"><Clock className="h-3 w-3 text-orange-500" /> {order.estimatedTime}</p>
                          </div>
                          <div className="space-y-1 border-l border-white/20 pl-6">
                            <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-tighter">Livreur</p>
                            <p className="text-sm font-bold flex items-center gap-2"><User className="h-3 w-3 text-purple-500" /> {order.driver}</p>
                          </div>
                          <div className="space-y-1 border-l border-white/20 pl-6">
                            <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-tighter">Destination</p>
                            <p className="text-sm font-bold flex items-center gap-2 truncate"><MapPin className="h-3 w-3 text-red-500" /> Plateau, Abidjan</p>
                          </div>
                        </div>

                        {['pending', 'processing', 'delivering'].includes(order.status) && (
                          <div className="space-y-4 bg-primary/5 p-4 rounded-2xl border border-primary/10">
                            <div className="flex justify-between items-center text-sm font-bold">
                              <span className="text-primary flex items-center gap-2">
                                <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                                Suivi en cours
                              </span>
                              <span className="text-primary">--</span>
                            </div>
                            <Progress value={30} className="h-2 bg-blue-100" />
                            <div className="flex gap-3 pt-2">
                              <Button className="flex-1 rounded-xl glass-morphism hover:bg-white/60 border-white/40 text-foreground" variant="outline">
                                <MapPin className="h-4 w-4 mr-2 text-red-500" /> Suivre sur la carte
                              </Button>
                              <Button className="flex-1 rounded-xl glass-morphism hover:bg-white/60 border-white/40 text-foreground" variant="outline">
                                <MessageCircle className="h-4 w-4 mr-2 text-blue-500" /> Contacter
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))) : (
                  <div className="glass-card p-12 text-center">
                    <ShoppingCart className="h-16 w-16 mx-auto text-muted-foreground mb-4 opacity-20" />
                    <h3 className="text-xl font-bold mb-2">Aucune commande active</h3>
                    <p className="text-muted-foreground mb-6">Prêt pour votre prochaine livraison de médicaments ?</p>
                    <Button onClick={() => navigate('/medicaments')} className="rounded-xl">Boutique</Button>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="pharmacies" className="outline-none">
                <PharmacyMapSection />
              </TabsContent>

              <TabsContent value="history" className="outline-none">
                <OrderHistory
                  userId={user?.id || ''}
                  userName={profile?.name || ''}
                  userEmail={user?.email || ''}
                />
              </TabsContent>

              <TabsContent value="prescriptions" className="outline-none">
                <Card className="glass-morphism border-white/20">
                  <CardHeader>
                    <CardTitle>Mes Ordonnances</CardTitle>
                    <CardDescription>Gérez vos prescriptions médicales en toute sécurité</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-12 bg-white/20 rounded-2xl border border-dashed border-white/40">
                      <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4 opacity-50" />
                      <h3 className="text-lg font-bold">Aucune ordonnance reçue</h3>
                      <p className="text-muted-foreground mb-6 text-sm">Uploadez ou recevez vos ordonnances de votre médecin</p>
                      <Button variant="outline" className="rounded-xl border-white/60 glass-morphism">
                        <Plus className="h-4 w-4 mr-2" /> Ajouter un document
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="appointments" className="outline-none">
                <Card className="glass-morphism border-white/20">
                  <CardHeader>
                    <CardTitle>Mes Rendez-vous</CardTitle>
                    <CardDescription>Gérez vos consultations médicales</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-4">
                      {/* Mock Appointment */}
                      <div className="flex items-center justify-between p-4 bg-white/40 rounded-xl border border-white/20">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center font-bold text-blue-600">DK</div>
                          <div>
                            <h4 className="font-bold">Dr. Konan Yves</h4>
                            <p className="text-xs text-muted-foreground">Cardiologue • Clinique Farah</p>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant="outline" className="text-[10px] bg-green-100 text-green-700 border-green-200">Confirmé</Badge>
                              <span className="text-xs font-medium">Demain, 14:30</span>
                            </div>
                          </div>
                        </div>
                        <Button variant="outline" size="sm" className="rounded-lg">Détails</Button>
                      </div>

                      <Button className="w-full py-6 rounded-xl border-dashed border-2 border-primary/20 bg-primary/5 hover:bg-primary/10 text-primary font-bold">
                        <Plus className="h-4 w-4 mr-2" /> Prendre un rendez-vous
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="wallet" className="outline-none">
                <EWalletWidget />
                <div className="mt-6">
                  <h3 className="text-lg font-bold mb-4">Historique des transactions</h3>
                  <div className="bg-white/40 rounded-xl border border-white/20 p-1">
                    <div className="p-4 flex justify-between items-center border-b border-white/10 last:border-0">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-red-100 rounded-lg text-red-600"><Pill className="h-4 w-4" /></div>
                        <div>
                          <p className="font-bold text-sm">Achat Médicaments</p>
                          <p className="text-xs text-muted-foreground">Pharmacie Centrale</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-red-600">- 12 500 F</p>
                        <p className="text-[10px] text-muted-foreground">Hier</p>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="medical" className="outline-none">
                <MedicalRecordSection />
              </TabsContent>

              <TabsContent value="reminders" className="outline-none">
                <MedicationRemindersSection />
              </TabsContent>

              <TabsContent value="help" className="outline-none">
                <HelpSupportSection />
              </TabsContent>

              <TabsContent value="loyalty" className="outline-none">
                <LoyaltySection />
              </TabsContent>

              <TabsContent value="assistant" className="outline-none">
                <AIHealthAssistant />
              </TabsContent>

              <TabsContent value="ewallet" className="outline-none">
                <EWallet userId={user?.id} />
              </TabsContent>

              <TabsContent value="renewals" className="outline-none">
                <PrescriptionRenewal patientId={user?.id} />
              </TabsContent>

              <TabsContent value="riskscore" className="outline-none">
                <PatientRiskScore patientId={user?.id} />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>

      <VoiceCommandControl />

      <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
        <DialogContent className="max-w-4xl glass-morphism border-white/20 max-h-[90vh] overflow-y-auto rounded-3xl p-0">
          <div className="bg-gradient-to-br from-primary/10 to-purple-500/10 p-6 border-b border-white/20">
            <DialogHeader>
              <DialogTitle className="text-2xl font-black tracking-tight">Paramètres du Profil</DialogTitle>
              <CardDescription>Mettez à jour vos informations personnelles et de santé</CardDescription>
            </DialogHeader>
          </div>
          <div className="p-6 space-y-6">
            <EditablePatientProfile />
            <NotificationPermission />
          </div>
        </DialogContent>
      </Dialog>
    </PremiumDashboardLayout>
  )
}