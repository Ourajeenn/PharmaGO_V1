import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { supabase } from '@/integrations/supabase/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { EditableDoctorProfile } from './EditableDoctorProfile'
import { PrescriptionForm } from './PrescriptionForm'
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table"
import {
  Stethoscope,
  Calendar as CalendarIcon,
  FileText,
  QrCode,
  Users,
  Clock,
  MessageCircle,
  Plus,
  Search,
  Edit,
  Eye,
  Loader2,
  Settings,
  Activity,
  ChevronRight,
  Zap,
  TrendingUp,
  Heart
} from 'lucide-react'
import { toast } from 'sonner'
import { PremiumDashboardLayout } from './PremiumDashboardLayout'

export const DoctorDashboard = () => {
  const { user, profile } = useAuth()
  const [loading, setLoading] = useState(true)
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)

  // Data States
  const [stats, setStats] = useState({
    todayPatients: 0,
    activePrescriptions: 0,
    appointmentsWeek: 0,
    consultationRate: 96
  })

  const [patients, setPatients] = useState<any[]>([])
  const [prescriptions, setPrescriptions] = useState<any[]>([])
  const [appointments, setAppointments] = useState<any[]>([])

  useEffect(() => {
    if (user?.id) {
      fetchDashboardData()
    }
  }, [user])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)

      const today = new Date().toISOString().split('T')[0]
      const nextWeek = new Date()
      nextWeek.setDate(nextWeek.getDate() + 7)
      const nextWeekIso = nextWeek.toISOString().split('T')[0]

      const { data: appointmentsData, error: approxError } = await supabase
        .from('appointments')
        .select(`
          *,
          patients (
            id,
            user_id,
            user_profiles:user_id (name, phone)
          )
        `)
        .eq('doctor_id', user!.id)
        .order('date', { ascending: true })

      if (approxError && approxError.code !== '42P01') {
        console.error('Error fetching appointments:', approxError)
      } else if (appointmentsData) {
        const formattedAppointments = appointmentsData.map((app: any) => ({
          id: app.id,
          patient: app.patients?.user_profiles?.name || 'Patient Inconnu',
          date: app.date,
          time: app.time,
          type: app.type || 'Consultation',
          status: app.status
        }))
        setAppointments(formattedAppointments)

        const todayCount = appointmentsData.filter((app: any) => app.date === today).length
        const weekCount = appointmentsData.filter((app: any) => app.date >= today && app.date <= nextWeekIso).length

        setStats(prev => ({
          ...prev,
          todayPatients: todayCount,
          appointmentsWeek: weekCount
        }))
      }

      const { data: presData, error: presError } = await supabase
        .from('prescriptions')
        .select(`
          *,
          patients (
            user_profiles:user_id (name)
          )
        `)
        .eq('doctor_id', user!.id)
        .order('created_at', { ascending: false })

      if (presError) console.error('Error fetching prescriptions:', presError)

      if (presData) {
        const formattedPrescriptions = presData.map((p: any) => ({
          id: p.id,
          patient: p.patients?.user_profiles?.name || 'Inconnu',
          date: new Date(p.created_at).toLocaleDateString(),
          status: p.status,
          medications: p.medications || [],
          diagnosis: p.diagnosis || 'Non spécifié',
          notes: p.notes
        }))
        setPrescriptions(formattedPrescriptions)

        setStats(prev => ({
          ...prev,
          activePrescriptions: presData.filter((p: any) => p.status === 'active' || p.status === 'pending').length
        }))

        const uniquePatientIds = Array.from(new Set(presData.map((p: any) => p.patient_id)))
        const derivedPatients = uniquePatientIds.map(pid => {
          const entry: any = presData.find((p: any) => p.patient_id === pid)
          return {
            id: pid,
            name: entry.patients?.user_profiles?.name,
            lastVisit: new Date(entry.created_at).toLocaleDateString(),
            status: 'suivi_regulier',
            condition: entry.diagnosis,
            prescribedMeds: entry.medications?.map((m: any) => m.name) || []
          }
        })
        setPatients(derivedPatients)
      }

    } catch (error) {
      console.error('Error loading doctor dashboard:', error)
      toast.error("Erreur lors du chargement des données")
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    const styles = {
      suivi_regulier: 'bg-green-500/10 text-green-600 border-green-200/50',
      nouveau_patient: 'bg-blue-500/10 text-blue-600 border-blue-200/50',
      active: 'bg-green-500/10 text-green-600 border-green-200/50',
      completed: 'bg-gray-500/10 text-gray-600 border-gray-200/50',
      confirmed: 'bg-green-500/10 text-green-600 border-green-200/50',
      pending: 'bg-orange-500/10 text-orange-600 border-orange-200/50'
    }
    const labels = {
      suivi_regulier: 'Suivi régulier',
      nouveau_patient: 'Nouveau',
      active: 'Active',
      completed: 'Terminée',
      confirmed: 'Confirmé',
      pending: 'Attente'
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
    <PremiumDashboardLayout activeTab="home" role="doctor">
      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
        {/* Medical Suite Header */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6">
          <div className="space-y-1">
            <h2 className="text-3xl font-black tracking-tighter text-foreground/90 uppercase">
              Medical <span className="text-primary tracking-normal">Suite</span>
            </h2>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 bg-white/40 px-3 py-1.5 rounded-full border border-white/40 shadow-sm">
                <div className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-pulse" />
                <span className="text-xs font-bold uppercase tracking-widest text-blue-700">Cabinet Ouvert</span>
              </div>
              <p className="text-xs text-muted-foreground font-medium flex items-center gap-1">
                <Stethoscope className="h-4 w-4 text-primary" /> Dr. {profile?.name || 'Médecin'}
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
            >
              <Plus className="h-4 w-4 mr-2" />
              Nouveau Patient
            </Button>
          </div>
        </div>

        {/* Bento Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="glass-card p-6 flex flex-col justify-between h-40 border-primary/20 bg-primary/5">
            <div className="flex justify-between items-start">
              <div className="p-3 bg-primary/10 rounded-xl">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <Activity className="h-4 w-4 text-primary animate-pulse" />
            </div>
            <div>
              <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Aujourd'hui</p>
              <h3 className="text-3xl font-black">{stats.todayPatients} <span className="text-sm font-normal text-muted-foreground tracking-tighter">RDVs</span></h3>
            </div>
          </div>

          <div className="glass-card p-6 flex flex-col justify-between h-40">
            <div className="flex justify-between items-start">
              <div className="p-3 bg-green-500/10 rounded-xl">
                <FileText className="h-6 w-6 text-green-600" />
              </div>
              <TrendingUp className="h-4 w-4 text-green-500" />
            </div>
            <div>
              <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Ordonnances</p>
              <h3 className="text-3xl font-black">{stats.activePrescriptions} <span className="text-sm text-green-600 font-bold">Actives</span></h3>
            </div>
          </div>

          <div className="glass-card p-6 flex flex-col justify-between h-40 border-purple-500/20">
            <div className="flex justify-between items-start">
              <div className="p-3 bg-purple-500/10 rounded-xl">
                <CalendarIcon className="h-6 w-6 text-purple-600" />
              </div>
              <Clock className="h-4 w-4 text-purple-500" />
            </div>
            <div>
              <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Cette Semaine</p>
              <h3 className="text-3xl font-black">{stats.appointmentsWeek} <span className="text-sm font-normal text-muted-foreground tracking-tighter">Planifiés</span></h3>
            </div>
          </div>

          <div className="glass-card p-6 flex flex-col justify-between h-40 border-red-500/20">
            <div className="flex justify-between items-start">
              <div className="p-3 bg-red-500/10 rounded-xl">
                <Heart className="h-6 w-6 text-red-600" />
              </div>
              <div className="text-[10px] font-black text-red-600/60 uppercase tracking-tighter">PERFORMANCE</div>
            </div>
            <div>
              <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Taux Consult.</p>
              <h3 className="text-3xl font-black">{stats.consultationRate}%</h3>
            </div>
          </div>
        </div>

        <Tabs defaultValue="patients" className="space-y-8">
          <TabsList className="bg-white/40 backdrop-blur-md p-1.5 rounded-[1.5rem] border border-white/40 flex w-full max-w-lg mb-4">
            <TabsTrigger value="patients" className="flex-1 rounded-[1.2rem] py-2 data-[state=active]:bg-white data-[state=active]:shadow-xl font-bold">Patients</TabsTrigger>
            <TabsTrigger value="history" className="flex-1 rounded-[1.2rem] py-2 data-[state=active]:bg-white data-[state=active]:shadow-xl font-bold">Historique</TabsTrigger>
            <TabsTrigger value="create" className="flex-1 rounded-[1.2rem] py-2 data-[state=active]:bg-white data-[state=active]:shadow-xl font-bold">Prescrire</TabsTrigger>
            <TabsTrigger value="appointments" className="flex-1 rounded-[1.2rem] py-2 data-[state=active]:bg-white data-[state=active]:shadow-xl font-bold">Agenda</TabsTrigger>
          </TabsList>

          <TabsContent value="patients" className="space-y-6 outline-none">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {patients.length > 0 ? patients.map((patient) => (
                <div key={patient.id} className="glass-card overflow-hidden glow-border group relative">
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-6">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform">
                          <Users className="h-6 w-6" />
                        </div>
                        <div>
                          <h4 className="font-extrabold text-lg tracking-tight">{patient.name || 'Nom Inconnu'}</h4>
                          <p className="text-xs text-muted-foreground font-bold uppercase tracking-widest">Dernière visite: {patient.lastVisit}</p>
                        </div>
                      </div>
                      {getStatusBadge(patient.status)}
                    </div>

                    <div className="bg-white/20 p-4 rounded-2xl border border-white/20 mb-6 group-hover:bg-white/40 transition-colors">
                      <p className="text-[10px] font-black text-primary uppercase tracking-widest mb-1">Observation</p>
                      <p className="text-sm font-bold leading-snug">{patient.condition || 'Aucune observation enregistrée'}</p>
                    </div>

                    <div className="flex gap-2">
                      <Button className="flex-1 rounded-xl bg-primary shadow-xl shadow-primary/20 font-bold text-xs" size="sm">
                        Consulter Dossier
                      </Button>
                      <Button variant="outline" className="rounded-xl glass-morphism border-white/40 px-4" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              )) : (
                <div className="col-span-full glass-card p-12 text-center border-dashed">
                  <Users className="h-16 w-16 mx-auto text-muted-foreground mb-4 opacity-20" />
                  <h3 className="text-xl font-bold">Aucun patient actif</h3>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="history" className="outline-none">
            <div className="glass-card overflow-hidden">
              <Table>
                <TableHeader className="bg-white/10">
                  <TableRow className="border-white/20">
                    <TableHead className="font-black uppercase text-[10px] tracking-widest">Date</TableHead>
                    <TableHead className="font-black uppercase text-[10px] tracking-widest">Patient</TableHead>
                    <TableHead className="font-black uppercase text-[10px] tracking-widest">Diagnostique</TableHead>
                    <TableHead className="font-black uppercase text-[10px] tracking-widest text-right">Statut</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {prescriptions.map((p) => (
                    <TableRow key={p.id} className="border-white/10 hover:bg-white/20 transition-colors">
                      <TableCell className="text-xs font-bold text-muted-foreground">{p.date}</TableCell>
                      <TableCell className="font-bold">{p.patient}</TableCell>
                      <TableCell className="text-sm font-medium">{p.diagnosis}</TableCell>
                      <TableCell className="text-right">{getStatusBadge(p.status)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </TabsContent>

          <TabsContent value="create" className="outline-none">
            <div className="glass-card p-0 overflow-hidden">
              <div className="bg-primary/5 p-6 border-b border-white/20 flex justify-between items-center">
                <div>
                  <h3 className="text-xl font-black uppercase tracking-tight">Nouvelle Prescription</h3>
                  <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest">Remplissez les détails avec soin</p>
                </div>
                <Zap className="h-6 w-6 text-primary animate-pulse" />
              </div>
              <div className="p-8">
                <PrescriptionForm onSuccess={() => {
                  fetchDashboardData()
                  toast.success('Prescription enregistrée')
                }} />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="appointments" className="outline-none">
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {appointments.length > 0 ? appointments.map((app) => (
                <div key={app.id} className="glass-card p-6 flex flex-col justify-between group">
                  <div className="flex justify-between items-start mb-4">
                    <p className="text-2xl font-black tracking-tighter">{app.time}</p>
                    <Badge variant="outline" className="bg-white/40 border-white/40 font-bold uppercase text-[9px]">{app.type}</Badge>
                  </div>
                  <div>
                    <h4 className="font-extrabold text-lg">{app.patient}</h4>
                    <p className="text-xs text-muted-foreground font-bold">{app.date}</p>
                  </div>
                  <div className="mt-6 flex justify-between items-center">
                    {getStatusBadge(app.status)}
                    <Button variant="ghost" size="icon" className="group-hover:translate-x-1 transition-transform">
                      <ChevronRight className="h-5 w-5 text-primary" />
                    </Button>
                  </div>
                </div>
              )) : (
                <div className="col-span-full glass-card p-12 text-center border-dashed">
                  <CalendarIcon className="h-16 w-16 mx-auto text-muted-foreground mb-4 opacity-20" />
                  <h3 className="text-xl font-bold">Agenda vide pour le moment</h3>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
        <DialogContent className="max-w-4xl glass-morphism border-white/20 max-h-[90vh] overflow-y-auto rounded-3xl p-0">
          <div className="bg-gradient-to-br from-primary/10 to-purple-500/10 p-6 border-b border-white/20">
            <DialogHeader>
              <DialogTitle className="text-2xl font-black tracking-tight uppercase">Mon Profil Médical</DialogTitle>
            </DialogHeader>
          </div>
          <div className="p-6">
            <EditableDoctorProfile />
          </div>
        </DialogContent>
      </Dialog>
    </PremiumDashboardLayout>
  )
}