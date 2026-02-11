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
  Zap
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'

export const PatientDashboard = () => {
  const { user, profile } = useAuth()
  const navigate = useNavigate()

  interface DashboardStats {
    activeOrders: number
    savings: number
    pendingPrescriptions: number
    unreadMessages: number
  }

  const [stats, setStats] = useState<DashboardStats>({
    activeOrders: 0,
    savings: 45000,
    pendingPrescriptions: 0,
    unreadMessages: 0
  })

  const [isSettingsOpen, setIsSettingsOpen] = useState(false)

  // Mock data for UI preview
  const [orders] = useState([
    {
      id: 'CMD001',
      status: 'en_cours',
      total: 25500,
      pharmacy: 'Pharmacie Centrale',
      items: 3,
      estimatedTime: '25 min',
      driver: 'Kouassi Jean'
    }
  ])

  const [insurance] = useState({
    number: 'ASS123456789',
    coverage: 85,
    remaining: 250, // in thousands
    total: 500,
    provider: 'Gras Savoye'
  })

  useEffect(() => {
    if (user?.id) {
      fetchDashboardStats()
    }
  }, [user])

  const fetchDashboardStats = async () => {
    if (!user) return
    try {
      const supabaseClient = supabase as any

      const { count: ordersCount } = await supabaseClient
        .from('orders')
        .select('*', { count: 'exact', head: true })
        .eq('patient_id', user.id)
        .not('status', 'in', '("delivered","cancelled")')

      const { count: prescriptionsCount } = await supabaseClient
        .from('prescriptions')
        .select('*', { count: 'exact', head: true })
        .eq('patient_id', user.id)
        .eq('status', 'pending')

      const { count: messagesCount } = await supabaseClient
        .from('messages')
        .select('*', { count: 'exact', head: true })
        .eq('receiver_id', user.id)
        .eq('is_read', false)

      setStats({
        activeOrders: ordersCount || 0,
        savings: 45000,
        pendingPrescriptions: prescriptionsCount || 0,
        unreadMessages: messagesCount || 0
      })
    } catch (error) {
      console.error('Error fetching patient stats:', error)
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
        {/* Welcome Section */}
        <div className="flex justify-between items-end">
          <div className="space-y-1">
            <h2 className="text-3xl font-bold tracking-tight text-foreground/90">
              Bonjour, <span className="text-primary font-extrabold">{profile?.name || 'Patient'}</span>
            </h2>
            <p className="text-muted-foreground flex items-center gap-2">
              <Activity className="h-4 w-4 text-green-500" />
              Votre santé est notre priorité aujourd'hui.
            </p>
          </div>
          <Button
            className="rounded-xl px-6 py-6 bg-primary hover:bg-primary-hover shadow-lg shadow-primary/20 transition-all hover:scale-105"
            onClick={() => navigate('/medicaments')}
          >
            <Plus className="h-5 w-5 mr-2" />
            Nouvelle Commande
          </Button>
        </div>

        {/* Bento Grid Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="glass-card p-6 flex flex-col justify-between h-40">
            <div className="flex justify-between items-start">
              <div className="p-3 bg-blue-500/10 rounded-xl">
                <Package className="h-6 w-6 text-blue-600" />
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Commandes Actives</p>
              <h3 className="text-3xl font-bold">{stats.activeOrders}</h3>
            </div>
          </div>

          <div className="glass-card p-6 flex flex-col justify-between h-40">
            <div className="flex justify-between items-start">
              <div className="p-3 bg-green-500/10 rounded-xl">
                <CreditCard className="h-6 w-6 text-green-600" />
              </div>
              <span className="text-[10px] font-bold text-green-600 bg-green-100 px-2 py-1 rounded">+12%</span>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Économies (FCFA)</p>
              <h3 className="text-3xl font-bold">{stats.savings.toLocaleString()} F</h3>
            </div>
          </div>

          <div className="glass-card p-6 flex flex-col justify-between h-40 border-primary/20 bg-primary/5">
            <div className="flex justify-between items-start">
              <div className="p-3 bg-primary/10 rounded-xl">
                <FileText className="h-6 w-6 text-primary" />
              </div>
              <ChevronRight className="h-4 w-4 text-primary/50" />
            </div>
            <div>
              <p className="text-sm font-medium text-primary uppercase tracking-wider">Ordonnances</p>
              <h3 className="text-3xl font-bold text-primary">{stats.pendingPrescriptions}</h3>
            </div>
          </div>

          <div className="glass-card p-6 flex flex-col justify-between h-40">
            <div className="flex justify-between items-start">
              <div className="p-3 bg-purple-500/10 rounded-xl">
                <MessageCircle className="h-6 w-6 text-purple-600" />
              </div>
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-purple-500"></span>
              </span>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Messages</p>
              <h3 className="text-3xl font-bold">{stats.unreadMessages}</h3>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Dashboard Content */}
          <div className="lg:col-span-2 space-y-8">
            <Tabs defaultValue="orders" className="w-full">
              <TabsList className="bg-white/40 backdrop-blur-md p-1 rounded-2xl border border-white/40 mb-6 flex flex-wrap gap-1">
                <TabsTrigger value="orders" className="rounded-xl data-[state=active]:bg-white data-[state=active]:shadow-sm">Suivi</TabsTrigger>
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

              <TabsContent value="orders" className="space-y-4 outline-none">
                {orders.length > 0 ? orders.map((order) => (
                  <div key={order.id} className="glass-card glow-border overflow-hidden">
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

                      {order.status === 'en_cours' && (
                        <div className="space-y-4 bg-primary/5 p-4 rounded-2xl border border-primary/10">
                          <div className="flex justify-between items-center text-sm font-bold">
                            <span className="text-primary flex items-center gap-2">
                              <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                              Expédition en cours
                            </span>
                            <span className="text-primary">75%</span>
                          </div>
                          <Progress value={75} className="h-2 bg-blue-100" />
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
                )) : (
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

          <VoiceCommandControl />

          {/* Bottom Space for mobile navigation */}
          <div className="h-20 md:hidden" />

          {/* Sidebar Widgets */}
          <div className="space-y-8">
            <RefillWidget />
            <WeatherWidget />

            {/* Insurance Card - Premium Style */}
            <div className="relative group overflow-hidden rounded-[2rem] p-[1px]">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-indigo-700 to-purple-800" />
              <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-20" />
              <div className="relative p-6 glass-morphism border-0 h-full flex flex-col justify-between min-h-[220px]">
                <div className="flex justify-between items-start">
                  <div className="space-y-0.5">
                    <p className="text-[10px] text-white/60 uppercase font-black tracking-widest">Membre Privilège</p>
                    <h4 className="text-lg font-bold text-white tracking-tight">{insurance.provider}</h4>
                  </div>
                  <Shield className="h-8 w-8 text-white/40" />
                </div>

                <div className="space-y-4">
                  <div className="space-y-1">
                    <p className="text-[10px] text-white/50 uppercase font-bold tracking-widest">N° de police</p>
                    <p className="text-xl font-mono font-bold text-white tracking-widest">
                      {insurance.number.substring(0, 3)} {insurance.number.substring(3, 7)} {insurance.number.substring(7)}
                    </p>
                  </div>

                  <div className="pt-2">
                    <div className="flex justify-between text-[10px] text-white/70 font-bold mb-1.5 uppercase">
                      <span>Plafond restant</span>
                      <span>{insurance.coverage}%</span>
                    </div>
                    <Progress value={insurance.coverage} className="h-2 bg-white/20" />
                    <p className="text-xs text-white/80 mt-2 font-bold">
                      {insurance.remaining} 000 / {insurance.total} 000 F
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Health Pulse Card */}
            <div className="glass-card p-6 border-green-500/20">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-10 h-10 bg-green-500/10 rounded-xl flex items-center justify-center">
                  <Heart className="h-5 w-5 text-green-600 animate-pulse" />
                </div>
                <h4 className="font-bold">Mon Bien-être</h4>
              </div>
              <div className="space-y-4">
                <div className="p-3 bg-white/30 rounded-xl border border-white/20 hover:bg-white/50 transition-colors cursor-pointer group">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Calendar className="h-4 w-4 text-primary" />
                      <span className="text-sm font-medium">Prochain rappel</span>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:translate-x-1 transition-transform" />
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-1 ml-7">Demain à 08:30 - Vitamines</p>
                </div>
              </div>
              <Button className="w-full mt-6 rounded-xl glass-morphism border-white/40 hover:bg-white/60" variant="outline">
                Gérer les rappels
              </Button>
            </div>

            {/* Profile Selection / Correction (as seen in diagnostic) */}
            <div className="glass-card p-6 bg-orange-500/5 border-orange-500/20">
              <h4 className="font-bold mb-2 flex items-center gap-2">
                <Settings className="h-4 w-4 text-orange-600" />
                Gestion du profil
              </h4>
              <p className="text-xs text-muted-foreground mb-4">Besoin de modifier votre statut ou corriger vos informations ?</p>
              <Button
                onClick={() => setIsSettingsOpen(true)}
                variant="outline"
                className="w-full rounded-xl border-orange-200 text-orange-700 hover:bg-orange-100"
              >
                Paramètres complets
              </Button>
            </div>
          </div>
        </div>
      </div>

      <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
        <DialogContent className="max-w-4xl glass-morphism border-white/20 max-h-[90vh] overflow-y-auto rounded-3xl p-0">
          <div className="bg-gradient-to-br from-primary/10 to-purple-500/10 p-6 border-b border-white/20">
            <DialogHeader>
              <DialogTitle className="text-2xl font-black tracking-tight">Paramètres du Profil</DialogTitle>
              <CardDescription>Mettez à jour vos informations personnelles et de santé</CardDescription>
            </DialogHeader>
          </div>
          <div className="p-6">
            <EditablePatientProfile />
          </div>
        </DialogContent>
      </Dialog>
    </PremiumDashboardLayout>
  )
}