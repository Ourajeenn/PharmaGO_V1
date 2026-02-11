import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { supabase } from '@/integrations/supabase/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Shield,
  FileText,
  CreditCard,
  Users,
  Clock,
  Loader2,
  AlertCircle,
  CheckCircle,
  Settings,
  TrendingUp,
  DollarSign,
  Zap,
  Activity,
  ArrowUpRight,
  ChevronRight,
  Eye,
  Filter
} from 'lucide-react'
import { toast } from 'sonner'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { EditableInsurerProfile } from './profiles/EditableInsurerProfile'
import { PremiumDashboardLayout } from './PremiumDashboardLayout'
import { PrescriptionValidationSection } from '@/components/insurance/PrescriptionValidationSection'
import { ReimbursementRatesSection } from '@/components/insurance/ReimbursementRatesSection'
import { CMUIntegration } from '@/components/insurance/CMUIntegration'
import { CoverageVerificationAPI } from '@/components/insurance/CoverageVerificationAPI'

export const InsurerDashboard = () => {
  const { user, profile } = useAuth()
  const [loading, setLoading] = useState(true)
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)

  // Data States
  const [claims, setClaims] = useState<any[]>([])
  const [stats, setStats] = useState({
    pendingClaims: 0,
    processedClaims: 0,
    totalReimbursed: 0,
    cmuCards: 1245
  })

  useEffect(() => {
    if (user?.id) {
      fetchDashboardData()
    }
  }, [user])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)

      const { data: claimsData, error } = await supabase
        .from('insurance_claims')
        .select(`
            *,
            patients:patient_id (
                user_profiles:user_id (name, phone)
            ),
            orders:order_id (
                id,
                pharmacies:pharmacy_id (name)
            )
        `)
        .eq('insurer_id', user!.id)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching claims:', error)
      } else if (claimsData) {
        const formattedClaims = claimsData.map((c: any) => ({
          id: c.id,
          patient: c.patients?.user_profiles?.name || 'Patient Inconnu',
          amount: c.claim_amount,
          status: c.status,
          date: new Date(c.created_at).toLocaleDateString(),
          pharmacy: c.orders?.pharmacies?.name || 'Pharmacie',
          coverage: c.coverage_percentage
        }))
        setClaims(formattedClaims)

        const pending = claimsData.filter((c: any) => c.status === 'pending').length
        const processed = claimsData.filter((c: any) => c.status === 'approved' || c.status === 'rejected').length
        const totalPaid = claimsData
          .filter((c: any) => c.status === 'approved')
          .reduce((sum: number, c: any) => sum + (c.approved_amount || 0), 0)

        setStats({
          pendingClaims: pending,
          processedClaims: processed,
          totalReimbursed: totalPaid,
          cmuCards: 1245
        })
      }

    } catch (error) {
      console.error('Error loading insurer dashboard:', error)
      toast.error("Erreur chargement données")
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    const styles = {
      pending: 'bg-orange-500/10 text-orange-600 border-orange-200/50',
      approved: 'bg-green-500/10 text-green-600 border-green-200/50',
      rejected: 'bg-red-500/10 text-red-600 border-red-200/50',
      paid: 'bg-blue-500/10 text-blue-600 border-blue-200/50'
    }
    const labels = {
      pending: 'En attente',
      approved: 'Approuvé',
      rejected: 'Rejeté',
      paid: 'Payé'
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

  return (
    <PremiumDashboardLayout activeTab="home" role="insurer">
      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
        {/* Financial Header */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6">
          <div className="space-y-1">
            <h2 className="text-3xl font-black tracking-tighter text-foreground/90 uppercase">
              Financial <span className="text-primary tracking-normal">Trust</span>
            </h2>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 bg-white/40 px-3 py-1.5 rounded-full border border-white/40 shadow-sm">
                <div className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-pulse" />
                <span className="text-xs font-bold uppercase tracking-widest text-blue-700">Flux Certifiés</span>
              </div>
              <p className="text-xs text-muted-foreground font-medium flex items-center gap-1">
                <Shield className="h-4 w-4 text-primary" /> {profile?.name || 'Assureur'}
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <Button
              variant="outline"
              className="rounded-xl glass-morphism border-white/60 hover:bg-white/60 font-bold"
              onClick={() => setIsSettingsOpen(true)}
            >
              <Settings className="h-4 w-4 mr-2" /> Paramètres
            </Button>
            <Button
              className="rounded-xl px-6 bg-primary hover:bg-primary-hover shadow-lg shadow-primary/20 transition-all hover:scale-105 font-bold"
            >
              <ArrowUpRight className="h-4 w-4 mr-2" />
              Nouveau Contrat
            </Button>
          </div>
        </div>

        {/* Bento Claims Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="glass-card p-6 flex flex-col justify-between h-40 border-orange-500/20 bg-orange-500/5">
            <div className="flex justify-between items-start">
              <div className="p-3 bg-orange-500/10 rounded-xl">
                <Clock className="h-6 w-6 text-orange-600" />
              </div>
              <div className="w-2 h-2 bg-orange-500 rounded-full animate-ping" />
            </div>
            <div>
              <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">En Attente</p>
              <h3 className="text-3xl font-black text-orange-600">{stats.pendingClaims} <span className="text-sm font-normal text-muted-foreground tracking-tighter text-foreground">DEMANDES</span></h3>
            </div>
          </div>

          <div className="glass-card p-6 flex flex-col justify-between h-40">
            <div className="flex justify-between items-start">
              <div className="p-3 bg-green-500/10 rounded-xl">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <TrendingUp className="h-4 w-4 text-green-500" />
            </div>
            <div>
              <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Traités</p>
              <h3 className="text-3xl font-black">{stats.processedClaims} <span className="text-sm font-normal text-muted-foreground">+5%</span></h3>
            </div>
          </div>

          <div className="glass-card p-6 flex flex-col justify-between h-40 border-primary/20 bg-primary/5">
            <div className="flex justify-between items-start">
              <div className="p-3 bg-primary/10 rounded-xl">
                <DollarSign className="h-6 w-6 text-primary" />
              </div>
              <div className="text-[10px] font-black text-primary uppercase">Volume</div>
            </div>
            <div>
              <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Remboursements</p>
              <h3 className="text-3xl font-black">{stats.totalReimbursed.toLocaleString()} <span className="text-sm font-normal text-muted-foreground tracking-tighter">F</span></h3>
            </div>
          </div>

          <div className="glass-card p-6 flex flex-col justify-between h-40 border-blue-500/20 bg-blue-500/5">
            <div className="flex justify-between items-start">
              <div className="p-3 bg-blue-500/10 rounded-xl">
                <CreditCard className="h-6 w-6 text-blue-600" />
              </div>
              <Activity className="h-4 w-4 text-blue-500" />
            </div>
            <div>
              <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Cartes CMU</p>
              <h3 className="text-3xl font-black text-blue-600">{stats.cmuCards} <span className="text-sm font-normal text-muted-foreground tracking-tighter text-foreground">ACTIVES</span></h3>
            </div>
          </div>
        </div>

        <Tabs defaultValue="claims" className="space-y-8">
          <TabsList className="bg-white/40 backdrop-blur-md p-1.5 rounded-[1.5rem] border border-white/40 flex flex-wrap w-full max-w-4xl mb-4 gap-1">
            <TabsTrigger value="claims" className="flex-1 rounded-[1.2rem] py-2 data-[state=active]:bg-white data-[state=active]:shadow-xl font-bold">Demandes</TabsTrigger>
            <TabsTrigger value="validation" className="flex-1 rounded-[1.2rem] py-2 data-[state=active]:bg-white data-[state=active]:shadow-xl font-bold">Validation</TabsTrigger>
            <TabsTrigger value="rates" className="flex-1 rounded-[1.2rem] py-2 data-[state=active]:bg-white data-[state=active]:shadow-xl font-bold">Barèmes</TabsTrigger>
            <TabsTrigger value="cmu" className="flex-1 rounded-[1.2rem] py-2 data-[state=active]:bg-white data-[state=active]:shadow-xl font-bold">Gestion CMU</TabsTrigger>
            <TabsTrigger value="verification" className="flex-1 rounded-[1.2rem] py-2 data-[state=active]:bg-white data-[state=active]:shadow-xl font-bold">Vérification</TabsTrigger>
            <TabsTrigger value="patients" className="flex-1 rounded-[1.2rem] py-2 data-[state=active]:bg-white data-[state=active]:shadow-xl font-bold">Assurés</TabsTrigger>
            <TabsTrigger value="reports" className="flex-1 rounded-[1.2rem] py-2 data-[state=active]:bg-white data-[state=active]:shadow-xl font-bold">Rapports</TabsTrigger>
            <TabsTrigger value="profile" className="flex-1 rounded-[1.2rem] py-2 data-[state=active]:bg-white data-[state=active]:shadow-xl font-bold">Profil</TabsTrigger>
          </TabsList>

          <TabsContent value="claims" className="space-y-6 outline-none">
            <div className="flex justify-between items-center bg-white/30 p-4 rounded-2xl border border-white/20">
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="rounded-xl glass-morphism border-white/60 font-bold text-xs"><Filter className="h-3 w-3 mr-2" /> Filtrer</Button>
                <Button variant="outline" size="sm" className="rounded-xl glass-morphism border-white/60 font-bold text-xs">Aujourd'hui</Button>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" className="h-8 rounded-xl bg-green-500/10 text-green-600 border-none font-bold text-xs hover:bg-green-500/20">Approuver Selection</Button>
                <Button variant="outline" className="h-8 rounded-xl bg-red-500/10 text-red-600 border-none font-bold text-xs hover:bg-red-500/20">Rejeter</Button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {claims.length > 0 ? claims.map((claim) => (
                <div key={claim.id} className="glass-card overflow-hidden glow-border group relative">
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-6">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-2xl flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform">
                          <FileText className="h-6 w-6" />
                        </div>
                        <div>
                          <h4 className="font-extrabold text-lg tracking-tight">#{claim.id.slice(0, 8)}</h4>
                          <p className="text-xs text-muted-foreground font-bold uppercase tracking-widest">{claim.date} • {claim.pharmacy}</p>
                        </div>
                      </div>
                      {getStatusBadge(claim.status)}
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-6">
                      <div className="glass-card bg-white/20 p-4 rounded-2xl border-white/20">
                        <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">Montant Réclamé</p>
                        <p className="text-xl font-black">{claim.amount.toLocaleString()} F</p>
                      </div>
                      <div className="glass-card bg-white/20 p-4 rounded-2xl border-white/20">
                        <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">Couverture</p>
                        <p className="text-xl font-black text-primary">{claim.coverage}%</p>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button className="flex-1 rounded-xl bg-primary shadow-xl shadow-primary/20 font-bold text-xs" size="sm">
                        Analyser Pièces Jointes
                      </Button>
                      <Button variant="outline" className="rounded-xl glass-morphism border-white/40 px-4" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              )) : (
                <div className="col-span-full glass-card p-12 text-center border-dashed">
                  <FileText className="h-16 w-16 mx-auto text-muted-foreground mb-4 opacity-20" />
                  <h3 className="text-xl font-bold">Aucune demande reçue</h3>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="cmu" className="outline-none">
            <div className="glass-card p-12 text-center border-dashed border-white/40">
              <CreditCard className="h-20 w-20 mx-auto text-muted-foreground mb-4 opacity-20" />
              <h3 className="text-xl font-black uppercase tracking-tight">Gestion Cartes CMU</h3>
              <p className="text-sm text-muted-foreground mt-2 font-medium">L'interconnexion avec le registre national est en cours.</p>
              <Button className="mt-8 rounded-xl bg-blue-600 text-white font-bold px-8">Sync. Base Nationale</Button>
            </div>
          </TabsContent>

          <TabsContent value="patients" className="outline-none">
            <div className="glass-card p-12 text-center border-dashed border-white/40">
              <Users className="h-20 w-20 mx-auto text-muted-foreground mb-4 opacity-20" />
              <h3 className="text-xl font-black uppercase tracking-tight">Portefeuille Assurés</h3>
              <p className="text-sm text-muted-foreground mt-2 font-medium">Base de données des assurés rattachés à votre institution.</p>
              <Button className="mt-8 rounded-xl bg-primary text-white font-bold px-8">Voir les Assurés</Button>
            </div>
          </TabsContent>

          <TabsContent value="reports" className="outline-none">
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="glass-card p-6 group">
                  <div className="flex justify-between items-start mb-6">
                    <div className="w-10 h-10 bg-indigo-500/10 rounded-xl flex items-center justify-center text-indigo-600">
                      <TrendingUp className="h-5 w-5" />
                    </div>
                    <Badge variant="outline" className="bg-white/40 border-white/40 text-[9px] font-black">PDF</Badge>
                  </div>
                  <h4 className="font-extrabold">Rapport Trimestriel Q{i}-2024</h4>
                  <p className="text-xs text-muted-foreground font-bold mt-1">Généré le 12/0{i}/2024</p>
                  <Button variant="ghost" className="w-full mt-6 rounded-xl border border-white/40 font-bold group-hover:bg-primary group-hover:text-white transition-all">Télécharger</Button>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="validation" className="outline-none">
            <PrescriptionValidationSection />
          </TabsContent>

          <TabsContent value="rates" className="outline-none">
            <ReimbursementRatesSection />
          </TabsContent>

          <TabsContent value="cmu" className="outline-none">
            <CMUIntegration />
          </TabsContent>

          <TabsContent value="verification" className="outline-none">
            <CoverageVerificationAPI />
          </TabsContent>

          <TabsContent value="profile" className="outline-none">
            <EditableInsurerProfile />
          </TabsContent>
        </Tabs>
      </div>

      <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
        <DialogContent className="max-w-4xl glass-morphism border-white/20 max-h-[90vh] overflow-y-auto rounded-3xl p-0">
          <div className="bg-gradient-to-br from-primary/10 to-indigo-500/10 p-6 border-b border-white/20">
            <DialogHeader>
              <DialogTitle className="text-2xl font-black tracking-tight uppercase">Config. Institutionnelle</DialogTitle>
            </DialogHeader>
          </div>
          <div className="p-6">
            <EditableInsurerProfile />
          </div>
        </DialogContent>
      </Dialog>
    </PremiumDashboardLayout>
  )
}