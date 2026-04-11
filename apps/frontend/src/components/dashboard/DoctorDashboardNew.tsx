import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { supabase } from '@/integrations/supabase/client'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
    LayoutDashboard,
    Calendar as CalendarIcon,
    Users,
    FileText,
    CreditCard,
    Settings,
    HelpCircle,
    Search,
    Bell,
    ChevronDown,
    Plus,
    TrendingUp,
    TrendingDown,
    Loader2,
    CheckCircle,
    Clock,
    Star,
    ChevronLeft,
    ChevronRight,
    Stethoscope,
    Video,
    Phone,
    FileInput,
    Mic,
    MicOff,
    Sparkles,
    ClipboardCheck,
    MessageCircle,
    LogOut,
    Menu,
    X
} from 'lucide-react'
import { toast } from 'sonner'
import { VideoConsultation, VideoAppointmentCard } from '@/components/consultation/VideoConsultation'
import { AIMedicationRecommender } from '@/components/doctor/AIMedicationRecommender'
import { cn } from '@/lib/utils'

interface Appointment {
    id: string
    patientName: string
    patientAvatar?: string
    condition: string
    time: string
    date: string
}

interface Task {
    id: string
    time: string
    title: string
    completed: boolean
    priority: 'high' | 'medium' | 'low'
}

interface Stats {
    totalPatients: number
    patientsGrowth: number
    pendingPrescriptions: number
    prescriptionsGrowth: number
    activeAppointments: number
    appointmentsChange: number
    tasksCompleted: number
    tasksTotal: number
}

interface WeeklyData {
    newPatients: number[]
    visits: number[]
    receipts: number[]
    missedVisits: number[]
    labels: string[]
}

export const DoctorDashboardNew = () => {
    const { user, profile } = useAuth()
    const [loading, setLoading] = useState(true)
    const [currentDate] = useState(new Date())
    const [timeFilter, setTimeFilter] = useState('weekly')
    const [selectedDoctor, setSelectedDoctor] = useState('Dr. Jonathan Brown')
    const [currentWeekStart, setCurrentWeekStart] = useState(0)
    const [activeTab, setActiveTab] = useState('dashboard')
    const [isRecording, setIsRecording] = useState(false)
    const [scribeText, setScribeText] = useState('')
    const [isScribeProcessing, setIsScribeProcessing] = useState(false)
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

    const [stats, setStats] = useState<Stats>({
        totalPatients: 1235,
        patientsGrowth: 2,
        pendingPrescriptions: 45,
        prescriptionsGrowth: 12,
        activeAppointments: 30,
        appointmentsChange: -3,
        tasksCompleted: 6,
        tasksTotal: 10
    })

    const [weeklyData, setWeeklyData] = useState<WeeklyData>({
        newPatients: [120, 180, 250, 380, 220, 180, 150, 200, 240, 190, 160, 140, 180, 220],
        visits: [200, 240, 180, 220, 260, 300, 280, 240, 260, 220, 200, 180, 240, 280],
        receipts: [150, 160, 200, 180, 190, 220, 240, 200, 180, 160, 140, 120, 160, 200],
        missedVisits: [80, 100, 120, 140, 100, 80, 60, 80, 100, 120, 140, 160, 120, 100],
        labels: ['Jan 15', 'Jan 22', 'Jan 29', 'Feb 5', 'Feb 12', 'Feb 19', 'Feb 26', 'Mar 5', 'Mar 12', 'Mar 19', 'Mar 26', 'Apr 2', 'Apr 9', 'Apr 16']
    })

    const [todayTasks, setTodayTasks] = useState<Task[]>([
        { id: '1', time: '10 am', title: 'Remind Mr. Smith about the visit', completed: true, priority: 'medium' },
        { id: '2', time: '11 am', title: 'Call Sandra', completed: true, priority: 'low' },
        { id: '3', time: '12 am', title: 'Make fancial report about earnings', completed: true, priority: 'medium' },
        { id: '4', time: '1 pm', title: 'Meeting with doctors from the USA', completed: false, priority: 'high' },
        { id: '5', time: '2 pm', title: 'Choose cards for receipes', completed: false, priority: 'low' },
        { id: '6', time: '3 pm', title: 'Remind Mr. Lewis about the visit', completed: false, priority: 'high' }
    ])

    const [upcomingAppointments, setUpcomingAppointments] = useState<Appointment[]>([
        { id: '1', patientName: 'Laura Schmidt', condition: 'Palpitations in the right hypochondrium', time: '9 am', date: 'Tue, 21' },
        { id: '2', patientName: 'Paole Green', condition: 'Fatigue or extreme tiredness', time: '9 am', date: 'Wed, 22' },
        { id: '3', patientName: 'Paola Green', condition: 'Fatigue or extreme tiredness', time: '9 am', date: 'Thu, 23' },
        { id: '4', patientName: 'Rachel Hopkins', condition: 'Acute pain in the right hypochondrium', time: '9 am', date: 'Fri, 24' },
        { id: '5', patientName: 'Tod Twist', condition: 'High blood pressure', time: '9 am', date: 'Sat, 25' },
        { id: '6', patientName: 'Billy White', condition: 'Unexplained weight loss', time: '10 am', date: 'Tue, 21' },
        { id: '7', patientName: 'Bill Orey', condition: 'Unexplained weight loss', time: '10 am', date: 'Wed, 22' },
        { id: '8', patientName: 'Rachel Hopkins', condition: 'Acute pain in the right hypochondrium', time: '10 am', date: 'Fri, 24' },
        { id: '9', patientName: 'Tod Twist', condition: 'High blood pressure', time: '10 am', date: 'Sat, 25' },
        { id: '10', patientName: 'Bill Grey', condition: 'Unexplained weight loss', time: '10 am', date: 'Tue, 21' },
        { id: '11', patientName: 'Mark Spensar', condition: 'Palpitations and irregular heartbeat', time: '10 am', date: 'Wed, 22' },
        { id: '12', patientName: 'Mark Spensar', condition: 'Palpitations and irregular heartbeat', time: '10 am', date: 'Thu, 23' },
        { id: '13', patientName: 'Rachel Hopkins', condition: 'Acute pain in the right hypochondrium', time: '10 am', date: 'Sat, 25' }
    ])

    useEffect(() => {
        if (user?.id) {
            fetchDashboardData()
        }
    }, [user])

    const fetchDashboardData = async () => {
        try {
            setLoading(true)

            // Fetch appointments
            const { data: appointmentsData, error: appoError } = await supabase
                .from('appointments')
                .select(`
          *,
          patients (
            user_profiles:user_id (name)
          )
        `)
                .eq('doctor_id', user!.id)
                .order('date', { ascending: true })

            if (!appoError && appointmentsData) {
                const formattedAppointments: Appointment[] = appointmentsData.map((app: any) => ({
                    id: app.id,
                    patientName: app.patients?.user_profiles?.name || 'Patient',
                    condition: app.notes || 'Consultation générale',
                    time: app.time || '9 am',
                    date: new Date(app.date).toLocaleDateString('en-US', { weekday: 'short', day: 'numeric' })
                }))

                if (formattedAppointments.length > 0) {
                    setUpcomingAppointments(formattedAppointments)
                }

                setStats(prev => ({
                    ...prev,
                    activeAppointments: appointmentsData.length
                }))
            }

            // Fetch prescriptions
            const { data: presData, error: presError } = await supabase
                .from('prescriptions')
                .select('*')
                .eq('doctor_id', user!.id)

            if (!presError && presData) {
                const pendingCount = presData.filter((p: any) => p.status === 'pending' || p.status === 'active').length
                setStats(prev => ({
                    ...prev,
                    pendingPrescriptions: pendingCount
                }))
            }

            // Fetch patients count
            const { count: patientCount } = await supabase
                .from('patients')
                .select('*', { count: 'exact', head: true })

            if (patientCount !== null) {
                setStats(prev => ({
                    ...prev,
                    totalPatients: patientCount
                }))
            }

        } catch (error) {
            console.error('Error loading doctor dashboard:', error)
            toast.error("Erreur de chargement des données")
        } finally {
            setLoading(false)
        }
    }

    const toggleTask = (taskId: string) => {
        setTodayTasks(prev => prev.map(task =>
            task.id === taskId ? { ...task, completed: !task.completed } : task
        ))
        toast.success('Tâche mise à jour')
    }

    const getVisibleWeekData = () => {
        const start = currentWeekStart
        const end = start + 7
        return {
            newPatients: weeklyData.newPatients.slice(start, end),
            visits: weeklyData.visits.slice(start, end),
            receipts: weeklyData.receipts.slice(start, end),
            missedVisits: weeklyData.missedVisits.slice(start, end),
            labels: weeklyData.labels.slice(start, end)
        }
    }

    const navigateWeek = (direction: 'prev' | 'next') => {
        if (direction === 'prev' && currentWeekStart > 0) {
            setCurrentWeekStart(prev => Math.max(0, prev - 1))
        } else if (direction === 'next' && currentWeekStart < weeklyData.labels.length - 7) {
            setCurrentWeekStart(prev => Math.min(weeklyData.labels.length - 7, prev + 1))
        }
    }

    const startRecording = () => {
        setIsRecording(true)
        setScribeText("")
        toast.info("Enregistrement en cours... Parlez maintenant.")
    }

    const stopRecording = () => {
        setIsRecording(false)
        setIsScribeProcessing(true)
        setTimeout(() => {
            setScribeText("Patient de 45 ans présentant des maux de tête persistants depuis 3 jours. Pas de fièvre. Tension artérielle 135/85. Prescription suggérée : Paracétamol 1g, 3 fois par jour pendant 4 jours.")
            setIsScribeProcessing(false)
            toast.success("Transcription terminée par l'IA")
        }, 2000)
    }

    const createPrescriptionFromScribe = () => {
        toast.success("Ordonnance structurée générée à partir des notes de l'IA")
        // En prod : ouvrirait un formulaire pré-rempli
    }

    const visibleData = getVisibleWeekData()
    const maxValue = Math.max(...visibleData.newPatients, ...visibleData.visits, ...visibleData.receipts, ...visibleData.missedVisits)
    const totalReports = visibleData.newPatients.reduce((a, b) => a + b, 0) +
        visibleData.visits.reduce((a, b) => a + b, 0) +
        visibleData.receipts.reduce((a, b) => a + b, 0) +
        visibleData.missedVisits.reduce((a, b) => a + b, 0)

    const menuItems = [
        { icon: LayoutDashboard, id: 'dashboard', label: 'Dashboard' },
        { icon: CalendarIcon, id: 'schedule', label: 'Availability' },
        { icon: Users, id: 'patients', label: 'Patients' },
        { icon: FileText, id: 'appointments', label: 'Appointments' },
        { icon: Video, id: 'teleconsult', label: '🎞️ Téléconsult' },
        { icon: Stethoscope, id: 'aiassist', label: '🧪 IA Prescripteur' }
    ]

    const documentsItems = [
        { icon: CreditCard, label: 'Billing', active: false },
        { icon: FileText, label: 'Reports', active: false }
    ]

    const supportItems = [
        { icon: HelpCircle, label: 'Help Center', active: false },
        { icon: Settings, label: 'Settings', active: false }
    ]

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen bg-gradient-to-br from-purple-50 to-blue-50">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
            </div>
        )
    }

    return (
        <div className="flex h-screen bg-gradient-to-br from-purple-50 to-blue-50 overflow-hidden relative">
            {/* Mobile Menu Overlay */}
            {isMobileMenuOpen && (
                <div
                    className="fixed inset-0 bg-slate-900/50 z-40 md:hidden"
                    onClick={() => setIsMobileMenuOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside className={`fixed inset-y-0 left-0 z-50 w-56 bg-white/95 md:bg-white/90 backdrop-blur-md border-r border-slate-200/60 flex flex-col transform transition-transform duration-200 ease-in-out md:relative md:translate-x-0 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                {/* Logo */}
                <div className="p-6 border-b border-slate-200/60 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                            <Stethoscope className="h-5 w-5 text-white" />
                        </div>
                        <span className="font-bold text-base text-slate-900">Hero Medical</span>
                    </div>
                    <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setIsMobileMenuOpen(false)}>
                        <X className="h-5 w-5 text-slate-500" />
                    </Button>
                </div>

                {/* Main Menu */}
                <div className="flex-1 overflow-y-auto py-6 px-3">
                    <div className="mb-6">
                        <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider px-3 mb-2">Main</p>
                        <nav className="space-y-1">
                            {menuItems.map((item) => (
                                <button
                                    key={item.label}
                                    onClick={() => setActiveTab(item.id)}
                                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${activeTab === item.id
                                        ? 'bg-blue-500 text-white shadow-lg'
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
                        <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider px-3 mb-2">Documents</p>
                        <nav className="space-y-1">
                            {documentsItems.map((item) => (
                                <button
                                    key={item.label}
                                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-100 transition-all"
                                >
                                    <item.icon className="h-4 w-4" />
                                    <span>{item.label}</span>
                                </button>
                            ))}
                        </nav>
                    </div>

                    <div>
                        <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider px-3 mb-2">Support</p>
                        <nav className="space-y-1">
                            {supportItems.map((item) => (
                                <button
                                    key={item.label}
                                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-100 transition-all"
                                >
                                    <item.icon className="h-4 w-4" />
                                    <span>{item.label}</span>
                                </button>
                            ))}
                        </nav>
                    </div>
                </div>

                {/* Bottom Actions */}
                <div className="p-4 border-t border-slate-200/60 space-y-2">
                    <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-100 transition-all">
                        <MessageCircle className="h-4 w-4" />
                        <span>Chat</span>
                    </button>
                    <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-100 transition-all">
                        <LogOut className="h-4 w-4" />
                        <span>Log out</span>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto w-full">
                {/* Header */}
                <header className="bg-white/80 backdrop-blur-md border-b border-slate-200/60 px-4 md:px-8 py-4 sticky top-0 z-30">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex flex-wrap items-center gap-4 md:gap-6">
                            <Button variant="ghost" size="icon" className="md:hidden shrink-0" onClick={() => setIsMobileMenuOpen(true)}>
                                <Menu className="h-5 w-5 text-slate-700" />
                            </Button>
                            <div>
                                <h1 className="text-xl font-bold text-slate-900">Hello, Mr. Smith</h1>
                            </div>

                            <div className="flex items-center gap-3">
                                <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 rounded-lg">
                                    <CalendarIcon className="h-4 w-4 text-slate-600" />
                                    <span className="text-sm font-medium text-slate-700">
                                        {currentDate.toLocaleDateString('en-US', { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' })}
                                    </span>
                                </div>

                                <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 rounded-lg">
                                    <Clock className="h-4 w-4 text-slate-600" />
                                    <span className="text-sm font-medium text-slate-700">24 h</span>
                                </div>

                                <Select defaultValue="weekly">
                                    <SelectTrigger className="w-28 h-9 bg-slate-900 text-white border-none rounded-lg">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="daily">Daily</SelectItem>
                                        <SelectItem value="weekly">Weekly</SelectItem>
                                        <SelectItem value="monthly">Monthly</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="flex items-center gap-2 md:gap-4 ml-auto md:ml-0">
                            <div className="relative hidden sm:block">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                <Input
                                    placeholder="Search"
                                    className="pl-10 w-48 lg:w-64 bg-slate-50 border-slate-200 rounded-lg h-9"
                                />
                            </div>

                            <Button variant="ghost" size="icon" className="h-9 w-9 rounded-lg relative">
                                <Bell className="h-4 w-4 text-slate-600" />
                                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                            </Button>

                            <Button variant="ghost" size="icon" className="h-9 w-9 rounded-lg hidden sm:inline-flex">
                                <Settings className="h-4 w-4 text-slate-600" />
                            </Button>

                            <Avatar className="h-9 w-9 shrink-0">
                                <AvatarImage src="" />
                                <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-500 text-white font-semibold text-xs">
                                    MS
                                </AvatarFallback>
                            </Avatar>
                        </div>
                    </div>
                </header>

                {/* Content */}
                {activeTab === 'dashboard' && (
                    <div className="p-4 md:p-8 space-y-6">
                        {/* AIScribe Widget (Sprint 33) */}
                        <Card className="bg-gradient-to-br from-slate-900 to-slate-800 text-white border-none shadow-xl overflow-hidden relative group">
                            <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
                                <Sparkles className="h-32 w-32" />
                            </div>
                            <CardContent className="p-6 relative z-10">
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                                    <div className="space-y-2 max-w-xl">
                                        <div className="flex items-center gap-2">
                                            <Badge className="bg-blue-500 hover:bg-blue-600 text-white border-none">AI Scribe v1</Badge>
                                            <span className="text-xs text-slate-400 font-medium tracking-wider uppercase">Sprint 33 Optimization</span>
                                        </div>
                                        <h2 className="text-2xl font-black tracking-tight">Transcription Vocale Intelligente</h2>
                                        <p className="text-slate-400 text-sm leading-relaxed">
                                            Parlez naturellement pendant l'auscultation. Leslie transcrit vos notes et génère automatiquement une ébauche d'ordonnance structurée ou un compte-rendu.
                                        </p>
                                    </div>

                                    <div className="flex flex-col items-center gap-3">
                                        <Button
                                            size="lg"
                                            onClick={isRecording ? stopRecording : startRecording}
                                            className={cn(
                                                "h-20 w-20 rounded-full shadow-2xl transition-all duration-500 scale-100 hover:scale-105",
                                                isRecording
                                                    ? "bg-red-500 hover:bg-red-600 animate-pulse ring-4 ring-red-500/20"
                                                    : "bg-blue-600 hover:bg-blue-700"
                                            )}
                                        >
                                            {isRecording ? <MicOff className="h-8 w-8" /> : <Mic className="h-8 w-8" />}
                                        </Button>
                                        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
                                            {isRecording ? "Enregistrement..." : "Appuyer pour dicter"}
                                        </span>
                                    </div>
                                </div>

                                {(scribeText || isScribeProcessing) && (
                                    <div className="mt-8 pt-6 border-t border-white/10 animate-in fade-in slide-in-from-top-4 duration-500">
                                        <div className="bg-white/5 rounded-2xl p-5 border border-white/10">
                                            <div className="flex items-center justify-between mb-4">
                                                <div className="flex items-center gap-2">
                                                    <div className="h-2 w-2 rounded-full bg-blue-500" />
                                                    <span className="text-xs font-bold uppercase text-slate-400">Notes Transcrites</span>
                                                </div>
                                                {isScribeProcessing && (
                                                    <div className="flex items-center gap-2 text-blue-400 text-xs font-medium">
                                                        <Loader2 className="h-3 w-3 animate-spin" /> Analyse des notes...
                                                    </div>
                                                )}
                                            </div>

                                            {isScribeProcessing ? (
                                                <div className="space-y-2">
                                                    <div className="h-4 bg-white/5 rounded-md animate-pulse w-full" />
                                                    <div className="h-4 bg-white/5 rounded-md animate-pulse w-3/4" />
                                                </div>
                                            ) : (
                                                <div className="space-y-4">
                                                    <p className="text-slate-200 text-sm leading-relaxed italic">"{scribeText}"</p>
                                                    <div className="flex gap-2 justify-end">
                                                        <Button variant="ghost" size="sm" className="text-slate-400 hover:text-white hover:bg-white/10" onClick={() => setScribeText("")}>Initialiser</Button>
                                                        <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-xs font-bold" onClick={createPrescriptionFromScribe}>
                                                            <ClipboardCheck className="h-3.5 w-3.5 mr-2" /> Créer Ordonnance
                                                        </Button>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Stats Row */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            {/* Total Patients */}
                            <Card className="bg-white border-slate-200 shadow-sm">
                                <CardContent className="p-5">
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                                            <Users className="h-5 w-5 text-blue-600" />
                                        </div>
                                        <Button variant="ghost" size="icon" className="h-6 w-6 -mr-2">
                                            <Plus className="h-4 w-4 text-blue-600" />
                                        </Button>
                                    </div>
                                    <div>
                                        <p className="text-xs font-medium text-slate-500 mb-1">Total Patients</p>
                                        <div className="flex items-end gap-2">
                                            <h3 className="text-2xl font-bold text-slate-900">{stats.totalPatients}</h3>
                                            <div className="flex items-center gap-1 text-green-600 mb-1">
                                                <TrendingUp className="h-3 w-3" />
                                                <span className="text-xs font-semibold">+{stats.patientsGrowth}%</span>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Pending Prescriptions */}
                            <Card className="bg-white border-slate-200 shadow-sm">
                                <CardContent className="p-5">
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                                            <FileText className="h-5 w-5 text-purple-600" />
                                        </div>
                                        <Button variant="ghost" size="icon" className="h-6 w-6 -mr-2">
                                            <Plus className="h-4 w-4 text-purple-600" />
                                        </Button>
                                    </div>
                                    <div>
                                        <p className="text-xs font-medium text-slate-500 mb-1">Pending Prescriptions</p>
                                        <div className="flex items-end gap-2">
                                            <h3 className="text-2xl font-bold text-slate-900">{stats.pendingPrescriptions}</h3>
                                            <div className="flex items-center gap-1 text-green-600 mb-1">
                                                <TrendingUp className="h-3 w-3" />
                                                <span className="text-xs font-semibold">+{stats.prescriptionsGrowth}%</span>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Active Appointments */}
                            <Card className="bg-white border-slate-200 shadow-sm">
                                <CardContent className="p-5">
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="w-10 h-10 bg-cyan-100 rounded-xl flex items-center justify-center">
                                            <CalendarIcon className="h-5 w-5 text-cyan-600" />
                                        </div>
                                        <Button variant="ghost" size="icon" className="h-6 w-6 -mr-2">
                                            <Plus className="h-4 w-4 text-cyan-600" />
                                        </Button>
                                    </div>
                                    <div>
                                        <p className="text-xs font-medium text-slate-500 mb-1">Active Appointments</p>
                                        <div className="flex items-end gap-2">
                                            <h3 className="text-2xl font-bold text-slate-900">{stats.activeAppointments}</h3>
                                            <div className="flex items-center gap-1 text-red-600 mb-1">
                                                <TrendingDown className="h-3 w-3" />
                                                <span className="text-xs font-semibold">{stats.appointmentsChange}%</span>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Today's Tasks */}
                            <Card className="bg-white border-slate-200 shadow-sm">
                                <CardContent className="p-5">
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                                            <CheckCircle className="h-5 w-5 text-green-600" />
                                        </div>
                                        <Button variant="ghost" size="icon" className="h-6 w-6 -mr-2 bg-blue-600 hover:bg-blue-700 text-white rounded-full">
                                            <Plus className="h-4 w-4" />
                                        </Button>
                                    </div>
                                    <div>
                                        <p className="text-xs font-medium text-slate-500 mb-1">Today's Tasks</p>
                                        <div className="flex items-center gap-2">
                                            <h3 className="text-2xl font-bold text-slate-900">{stats.tasksCompleted}/{stats.tasksTotal}</h3>
                                        </div>
                                        <div className="mt-3 space-y-1.5">
                                            {todayTasks.slice(0, 3).map((task) => (
                                                <div key={task.id} className="flex items-center gap-2 text-xs">
                                                    <span className="text-slate-500 font-medium w-12">{task.time}</span>
                                                    <div className="flex items-center gap-2 flex-1">
                                                        <span className={`truncate ${task.completed ? 'text-slate-400 line-through' : 'text-slate-700'}`}>
                                                            {task.title}
                                                        </span>
                                                        {task.completed && <CheckCircle className="h-3 w-3 text-green-600 flex-shrink-0" />}
                                                        {task.priority === 'high' && !task.completed && <Star className="h-3 w-3 text-yellow-500 flex-shrink-0" />}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Charts and Appointments Row */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Patients Reports Chart */}
                            <Card className="bg-white border-slate-200">
                                <CardContent className="p-6">
                                    <div className="flex items-center justify-between mb-6">
                                        <div className="flex items-center gap-2">
                                            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                                                <Users className="h-4 w-4 text-blue-600" />
                                            </div>
                                            <div>
                                                <h3 className="text-sm font-bold text-slate-900">Patients Reports</h3>
                                                <p className="text-2xl font-bold text-slate-900">{totalReports.toLocaleString()}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-1 text-green-600">
                                            <TrendingUp className="h-4 w-4" />
                                            <span className="text-sm font-semibold">+2%</span>
                                        </div>
                                    </div>

                                    {/* Bar Chart */}
                                    <div className="relative h-48 flex items-end justify-between gap-1 mb-4">
                                        {visibleData.labels.map((label, index) => {
                                            const newPatientsHeight = (visibleData.newPatients[index] / maxValue) * 100
                                            const visitsHeight = (visibleData.visits[index] / maxValue) * 100
                                            const receiptsHeight = (visibleData.receipts[index] / maxValue) * 100
                                            const missedHeight = (visibleData.missedVisits[index] / maxValue) * 100

                                            return (
                                                <div key={label} className="flex-1 flex flex-col items-center gap-2">
                                                    <div className="w-full relative flex gap-0.5" style={{ height: '160px' }}>
                                                        <div
                                                            className="flex-1 bg-blue-300 rounded-t transition-all hover:opacity-80"
                                                            style={{ height: `${newPatientsHeight}%`, alignSelf: 'flex-end' }}
                                                        />
                                                        <div
                                                            className="flex-1 bg-purple-300 rounded-t transition-all hover:opacity-80"
                                                            style={{ height: `${visitsHeight}%`, alignSelf: 'flex-end' }}
                                                        />
                                                        <div
                                                            className="flex-1 bg-lime-300 rounded-t transition-all hover:opacity-80"
                                                            style={{ height: `${receiptsHeight}%`, alignSelf: 'flex-end' }}
                                                        />
                                                        <div
                                                            className="flex-1 bg-pink-300 rounded-t transition-all hover:opacity-80"
                                                            style={{ height: `${missedHeight}%`, alignSelf: 'flex-end' }}
                                                        />
                                                    </div>
                                                    <span className="text-[10px] font-medium text-slate-500">{label}</span>
                                                </div>
                                            )
                                        })}
                                    </div>

                                    {/* Legend */}
                                    <div className="flex items-center justify-center gap-4 text-xs">
                                        <div className="flex items-center gap-1.5">
                                            <div className="w-2 h-2 rounded-full bg-blue-300" />
                                            <span className="text-slate-600">New Patients</span>
                                        </div>
                                        <div className="flex items-center gap-1.5">
                                            <div className="w-2 h-2 rounded-full bg-purple-300" />
                                            <span className="text-slate-600">Visits</span>
                                        </div>
                                        <div className="flex items-center gap-1.5">
                                            <div className="w-2 h-2 rounded-full bg-lime-300" />
                                            <span className="text-slate-600">Receipts</span>
                                        </div>
                                        <div className="flex items-center gap-1.5">
                                            <div className="w-2 h-2 rounded-full bg-pink-300" />
                                            <span className="text-slate-600">Missed visits</span>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Today's Tasks Full List */}
                            <Card className="bg-white border-slate-200">
                                <CardContent className="p-6">
                                    <div className="flex items-center justify-between mb-6">
                                        <h3 className="text-sm font-bold text-slate-900">Today's Tasks</h3>
                                        <Button variant="ghost" size="icon" className="h-6 w-6 bg-blue-600 hover:bg-blue-700 text-white rounded-full">
                                            <Plus className="h-3 w-3" />
                                        </Button>
                                    </div>

                                    <div className="space-y-3">
                                        {todayTasks.map((task) => (
                                            <div
                                                key={task.id}
                                                className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer"
                                                onClick={() => toggleTask(task.id)}
                                            >
                                                <span className="text-xs font-medium text-slate-500 w-12">{task.time}</span>
                                                <div className="flex-1">
                                                    <p className={`text-sm ${task.completed ? 'text-slate-400 line-through' : 'text-slate-700'}`}>
                                                        {task.title}
                                                    </p>
                                                </div>
                                                {task.completed ? (
                                                    <CheckCircle className="h-4 w-4 text-green-600" />
                                                ) : task.priority === 'high' ? (
                                                    <Star className="h-4 w-4 text-yellow-500" />
                                                ) : null}
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Upcoming Appointments */}
                        <Card className="bg-white border-slate-200">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between mb-6">
                                    <h3 className="text-base font-bold text-slate-900">Upcoming Appointments</h3>
                                    <div className="flex items-center gap-3">
                                        <div className="flex items-center gap-2">
                                            <Avatar className="h-7 w-7">
                                                <AvatarFallback className="bg-blue-100 text-blue-700 text-xs font-semibold">
                                                    JB
                                                </AvatarFallback>
                                            </Avatar>
                                            <span className="text-sm font-medium text-slate-700">{selectedDoctor}</span>
                                        </div>
                                        <Button className="bg-blue-600 hover:bg-blue-700 text-white text-xs px-4 py-2 rounded-lg font-semibold h-8">
                                            Filter
                                        </Button>
                                    </div>
                                </div>

                                {/* Calendar Grid */}
                                <div className="relative overflow-x-auto pb-4">
                                    <div className="grid grid-cols-6 gap-4 min-w-[700px]">
                                        {/* Time Column */}
                                        <div className="space-y-16 pt-12">
                                            <div className="text-xs font-medium text-slate-500">9 am</div>
                                            <div className="text-xs font-medium text-slate-500">10 am</div>
                                            <div className="text-xs font-medium text-slate-500">10 am</div>
                                        </div>

                                        {/* Days */}
                                        {['Tue, 21', 'Wed, 22', 'Thu, 23', 'Fri, 24', 'Sat, 25'].map((day, dayIndex) => (
                                            <div key={day} className="space-y-2">
                                                <div className="text-xs font-semibold text-slate-600 text-center mb-3">{day}</div>
                                                <div className="space-y-2">
                                                    {upcomingAppointments
                                                        .filter(app => app.date === day)
                                                        .map((appointment) => (
                                                            <div
                                                                key={appointment.id}
                                                                className="bg-slate-50 hover:bg-slate-100 p-3 rounded-lg border border-slate-200 transition-all cursor-pointer group"
                                                            >
                                                                <div className="flex items-start gap-2">
                                                                    <Avatar className="h-8 w-8 flex-shrink-0">
                                                                        <AvatarImage src={appointment.patientAvatar} />
                                                                        <AvatarFallback className="bg-gradient-to-br from-blue-400 to-purple-400 text-white text-xs font-semibold">
                                                                            {appointment.patientName.split(' ').map(n => n[0]).join('')}
                                                                        </AvatarFallback>
                                                                    </Avatar>
                                                                    <div className="flex-1 min-w-0">
                                                                        <p className="text-xs font-semibold text-slate-900 truncate">{appointment.patientName}</p>
                                                                        <p className="text-[10px] text-slate-500 line-clamp-2">{appointment.condition}</p>
                                                                        <div className="flex gap-2 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                                            <Button size="sm" className="h-6 text-[10px] px-2 bg-blue-600 hover:bg-blue-700">
                                                                                <Video className="h-3 w-3 mr-1" /> Call
                                                                            </Button>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        ))}
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Navigation Arrows */}
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="absolute -right-12 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-blue-600 hover:bg-blue-700 text-white"
                                        onClick={() => navigateWeek('next')}
                                    >
                                        <ChevronRight className="h-4 w-4" />
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                )}

                {activeTab === 'patients' && (
                    <div className="p-8">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-bold text-slate-900">Patient Management</h2>
                            <Button className="bg-blue-600 hover:bg-blue-700">
                                <Plus className="h-4 w-4 mr-2" /> Add Patient
                            </Button>
                        </div>
                        <Card className="border-slate-200 shadow-sm">
                            <CardContent className="p-0">
                                <div className="p-4 border-b border-slate-200 flex gap-4">
                                    <Input placeholder="Search patients..." className="max-w-sm" />
                                </div>
                                <div className="divide-y divide-slate-100">
                                    {[1, 2, 3, 4, 5].map((i) => (
                                        <div key={i} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                                            <div className="flex items-center gap-4">
                                                <Avatar>
                                                    <AvatarFallback className="bg-blue-100 text-blue-700">P{i}</AvatarFallback>
                                                </Avatar>
                                                <div>
                                                    <h4 className="font-bold text-slate-900">Patient Demo {i}</h4>
                                                    <p className="text-xs text-slate-500">ID: #8392{i}</p>
                                                </div>
                                            </div>
                                            <div className="flex gap-2">
                                                <Button variant="outline" size="sm" className="text-blue-600 border-blue-200 hover:bg-blue-50">
                                                    <FileInput className="h-4 w-4 mr-2" /> E-Carnet
                                                </Button>
                                                <Button variant="outline" size="sm">History</Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                )}

                {activeTab === 'schedule' && (
                    <div className="p-8">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-bold text-slate-900">Weekly Schedule</h2>
                            <div className="flex gap-2">
                                <Button variant="outline">Previous Week</Button>
                                <Button variant="outline">Next Week</Button>
                            </div>
                        </div>
                        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 overflow-x-auto">
                            <div className="grid grid-cols-8 gap-4 min-w-[800px]">
                                <div className="col-span-1 pt-12 space-y-8 text-xs text-slate-400 font-medium text-right pr-4">
                                    <div>09:00 AM</div>
                                    <div>10:00 AM</div>
                                    <div>11:00 AM</div>
                                    <div>12:00 PM</div>
                                    <div>01:00 PM</div>
                                    <div>02:00 PM</div>
                                </div>
                                {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
                                    <div key={day} className="col-span-1 space-y-4">
                                        <div className="text-center font-bold text-slate-700 pb-4 border-b border-slate-100">{day}</div>
                                        <div className="space-y-4 pt-2">
                                            <div className="bg-blue-50 border border-blue-100 p-2 rounded-lg text-xs cursor-pointer hover:bg-blue-100 transition-colors">
                                                <div className="font-bold text-blue-700">Consultation</div>
                                                <div className="text-blue-500">9:00 - 9:30</div>
                                            </div>
                                            {day === 'Wed' && (
                                                <div className="bg-purple-50 border border-purple-100 p-2 rounded-lg text-xs cursor-pointer hover:bg-purple-100 transition-colors mt-12">
                                                    <div className="font-bold text-purple-700">Surgery</div>
                                                    <div className="text-purple-500">11:00 - 13:00</div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'teleconsult' && (
                    <div className="p-8 space-y-6">
                        <div className="flex justify-between items-center">
                            <div>
                                <h2 className="text-2xl font-bold text-slate-900">Téléconsultations</h2>
                                <p className="text-sm text-muted-foreground">Consultations vidéo avec vos patients</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Video Consultation Area */}
                            <VideoConsultation
                                patient={{
                                    id: '1',
                                    name: 'Kouassi Aya Marie',
                                    condition: 'Suivi diabète type 2'
                                }}
                            />

                            {/* Upcoming Video Appointments */}
                            <Card className="bg-white border-slate-200 shadow-sm">
                                <CardContent className="p-6">
                                    <h3 className="text-lg font-bold mb-4">Téléconsultations du jour</h3>
                                    <div className="space-y-3">
                                        <VideoAppointmentCard
                                            patient={{ id: '1', name: 'Kouassi Aya Marie' }}
                                            time="14:00"
                                            onJoin={() => { }}
                                        />
                                        <VideoAppointmentCard
                                            patient={{ id: '2', name: 'Koné Moussa' }}
                                            time="15:30"
                                            onJoin={() => { }}
                                        />
                                        <VideoAppointmentCard
                                            patient={{ id: '3', name: 'Bamba Fatou' }}
                                            time="16:45"
                                            onJoin={() => { }}
                                        />
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                )}

                {activeTab === 'aiassist' && (
                    <div className="p-8 space-y-6">
                        <div className="flex justify-between items-center">
                            <div>
                                <h2 className="text-2xl font-bold text-slate-900">IA Prescripteur</h2>
                                <p className="text-sm text-muted-foreground">Recommandations de médicaments basées sur l'IA</p>
                            </div>
                        </div>

                        <AIMedicationRecommender diagnosis="Diabète type 2" />
                    </div>
                )}
            </main>
        </div>
    )
}
