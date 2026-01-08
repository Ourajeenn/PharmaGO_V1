import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import { useECarnet } from '@/contexts/ECarnetContext';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import {
    ArrowLeft, ArrowRight, User, FileText, Syringe, TrendingUp, AlertCircle,
    Calendar as CalendarIcon, FileHeart, Plus, Activity, Bell, Settings, MoreHorizontal, CheckCircle, Heart, Zap, Shield
} from 'lucide-react';
import ScrollReveal from '@/components/ScrollReveal';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import OrderHistory from '@/components/ecarnet/OrderHistory';

const ECarnetDashboard = () => {
    const navigate = useNavigate();
    const {
        currentPatient,
        patients,
        setCurrentPatient,
        getPatientSummary,
        getPatientAlerts
    } = useECarnet();

    const [summary, setSummary] = useState<ReturnType<typeof getPatientSummary>>(null);
    const [alerts, setAlerts] = useState<ReturnType<typeof getPatientAlerts>>([]);

    // Calculate health score based on patient type
    const calculateHealthScore = () => {
        if (!currentPatient) return { score: 75, status: 'Moyenne', color: 'yellow' };

        const patientType = currentPatient.insuranceType || 'standard';

        // Base score factors
        const ageScore = currentPatient.dateOfBirth ?
            Math.max(50, 100 - (new Date().getFullYear() - new Date(currentPatient.dateOfBirth).getFullYear()) * 0.5) : 80;

        const vaccineScore = currentPatient.vaccinations ?
            (currentPatient.vaccinations.filter(v => v.status === 'À jour').length / currentPatient.vaccinations.length) * 100 : 70;

        const treatmentScore = currentPatient.treatments ?
            (currentPatient.treatments.filter(t => t.compliance > 70).length / Math.max(1, currentPatient.treatments.length)) * 100 : 80;

        // Type-specific modifiers
        let typeModifier = 1.0;
        let bonusPoints = 0;

        switch (patientType) {
            case 'cmu':
                typeModifier = 1.05;
                bonusPoints = 5;
                break;
            case 'insured':
                typeModifier = 1.1;
                bonusPoints = 8;
                break;
            case 'premium':
                typeModifier = 1.15;
                bonusPoints = 12;
                break;
            default:
                typeModifier = 1.0;
                bonusPoints = 0;
        }

        const baseScore = (ageScore * 0.3 + vaccineScore * 0.3 + treatmentScore * 0.4);
        const finalScore = Math.min(100, Math.round((baseScore * typeModifier) + bonusPoints));

        let status, color;
        if (finalScore >= 85) {
            status = 'Excellente';
            color = 'emerald';
        } else if (finalScore >= 70) {
            status = 'Bonne';
            color = 'blue';
        } else if (finalScore >= 50) {
            status = 'Moyenne';
            color = 'orange';
        } else {
            status = 'Attention';
            color = 'red';
        }

        return { score: finalScore, status, color };
    };

    const healthScore = calculateHealthScore();

    useEffect(() => {
        if (currentPatient) {
            const patientSummary = getPatientSummary(currentPatient.id);
            setSummary(patientSummary);
            const patientAlerts = getPatientAlerts(currentPatient.id);
            setAlerts(patientAlerts);
        }
    }, [currentPatient, getPatientSummary, getPatientAlerts]);

    useEffect(() => {
        if (!currentPatient && patients.length > 0) {
            setCurrentPatient(patients[0]);
        }
    }, [currentPatient, patients, setCurrentPatient]);

    if (!currentPatient && patients.length === 0) {
        return (
            <div className="min-h-screen mesh-gradient flex flex-col">
                <Header />
                <main className="flex-1 flex items-center justify-center p-4">
                    <Card className="glass-card max-w-md w-full p-12 text-center border-white/40">
                        <CardContent className="p-0 space-y-8">
                            <div className="w-24 h-24 bg-primary/10 rounded-3xl flex items-center justify-center mx-auto border border-primary/20">
                                <FileHeart className="h-12 w-12 text-primary" />
                            </div>
                            <div className="space-y-2">
                                <h3 className="text-3xl font-black tracking-tighter uppercase text-foreground/90">Bienvenue</h3>
                                <p className="text-muted-foreground font-medium">
                                    Créez votre premier dossier médical pour commencer à suivre votre santé.
                                </p>
                            </div>
                            <Button
                                size="lg"
                                className="h-14 rounded-2xl w-full bg-primary hover:bg-primary-hover text-white font-black uppercase tracking-widest shadow-xl shadow-primary/20 transition-all hover:scale-[1.02]"
                                onClick={() => navigate('/ecarnet/new-patient')}
                            >
                                <Plus className="h-5 w-5 mr-2" />
                                Créer un profil
                            </Button>
                        </CardContent>
                    </Card>
                </main>
            </div>
        )
    }

    return (
        <div className="min-h-screen mesh-gradient relative">
            <Header />

            <main className="py-10 pb-24">
                <div className="container mx-auto px-4 max-w-6xl">
                    <Button
                        variant="ghost"
                        onClick={() => navigate('/')}
                        className="flex items-center gap-2 mb-10 hover:bg-white/40 transition-all rounded-xl font-black uppercase tracking-widest text-xs"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Retour Système
                    </Button>

                    <ScrollReveal animation="fade-down" delay={0.1}>
                        <div className="flex flex-col md:flex-row items-center justify-between mb-12 gap-6 bg-white/40 backdrop-blur-xl rounded-[2.5rem] p-8 border border-white/40 shadow-xl">
                            <div className="flex items-center gap-6">
                                <div className="relative group">
                                    <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-green-500 rounded-full blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
                                    {currentPatient?.photo ? (
                                        <img
                                            src={currentPatient.photo}
                                            alt="Profile"
                                            className="relative w-20 h-20 rounded-full object-cover border-4 border-white shadow-2xl"
                                        />
                                    ) : (
                                        <div className="relative w-20 h-20 rounded-full bg-white flex items-center justify-center border-4 border-white shadow-2xl">
                                            <User className="h-10 w-10 text-primary" />
                                        </div>
                                    )}
                                </div>
                                <div className="text-center md:text-left">
                                    <h2 className="text-3xl font-black uppercase tracking-tighter text-foreground/90 leading-tight">
                                        {currentPatient ? `${currentPatient.firstName} ${currentPatient.lastName}` : 'Patient'}
                                    </h2>
                                    <div className="flex items-center gap-2 justify-center md:justify-start">
                                        <Badge className="bg-primary/10 text-primary border-primary/20 font-black uppercase tracking-widest text-[10px]">
                                            {currentPatient ? `Dossier #${currentPatient.id.slice(0, 6)}` : 'Chargement...'}
                                        </Badge>
                                        <Badge className="bg-green-500/10 text-green-600 border-green-500/20 font-black uppercase tracking-widest text-[10px]">Vérifié</Badge>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button className="h-14 w-14 rounded-2xl glass-morphism border-white/50 bg-white/60 hover:bg-white/80 transition-all relative">
                                            <Bell className="h-6 w-6 text-foreground/70" />
                                            {alerts.length > 0 && <span className="absolute top-4 right-4 w-3 h-3 bg-red-500 rounded-full border-2 border-white animate-pulse" />}
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end" className="w-80 p-4 border-white/40 bg-white/90 backdrop-blur-2xl rounded-3xl shadow-2xl z-50">
                                        <DropdownMenuLabel className="flex items-center justify-between mb-4">
                                            <span className="font-black uppercase tracking-widest text-xs">Alertes Santé</span>
                                            <Badge className="bg-red-500 text-white font-black">{alerts.length}</Badge>
                                        </DropdownMenuLabel>
                                        <DropdownMenuSeparator className="bg-foreground/5" />
                                        {alerts.length > 0 ? (
                                            <div className="space-y-2 mt-4">
                                                {alerts.map((alert, idx) => (
                                                    <DropdownMenuItem key={idx} className="flex flex-col items-start gap-1 p-4 cursor-pointer hover:bg-foreground/5 rounded-2xl transition-all">
                                                        <div className="flex items-center gap-2 w-full">
                                                            <div className={`w-2.5 h-2.5 rounded-full ${alert.priority === 'Haute' ? 'bg-red-500' : 'bg-orange-500'}`} />
                                                            <span className="font-black uppercase tracking-widest text-[10px]">{alert.title}</span>
                                                            <span className="text-[10px] text-muted-foreground ml-auto">{format(new Date(alert.createdAt), 'dd MMM', { locale: fr })}</span>
                                                        </div>
                                                        <p className="text-xs font-medium text-muted-foreground ml-4">{alert.message}</p>
                                                    </DropdownMenuItem>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="py-10 text-center space-y-4 opacity-40">
                                                <Bell className="h-12 w-12 mx-auto" />
                                                <p className="text-xs font-black uppercase tracking-widest">Saine & Sauf</p>
                                            </div>
                                        )}
                                    </DropdownMenuContent>
                                </DropdownMenu>
                                <Button className="h-14 w-14 rounded-2xl glass-morphism border-white/50 bg-white/60 hover:bg-white/80 transition-all" onClick={() => navigate('/ecarnet/profile')}>
                                    <Settings className="h-6 w-6 text-foreground/70" />
                                </Button>
                                <Button className="h-14 px-8 rounded-2xl bg-foreground text-background font-black uppercase tracking-widest hover:scale-[1.02] transition-all">
                                    <Plus className="h-4 w-4 mr-2" />
                                    Nouveau Rapport
                                </Button>
                            </div>
                        </div>
                    </ScrollReveal>

                    <div className="grid lg:grid-cols-3 gap-10">
                        <div className="lg:col-span-2 space-y-10">
                            <ScrollReveal animation="fade-up" delay={0.2}>
                                <div className="glass-card p-10 border-white/50 bg-white/60">
                                    <div className="flex justify-between items-start mb-10">
                                        <div className="space-y-1">
                                            <h3 className="text-2xl font-black uppercase tracking-tighter">Santé Globale</h3>
                                            <p className="text-xs font-black uppercase tracking-widest text-muted-foreground">Monitoring Temps Réel</p>
                                        </div>
                                        <div className={`p-4 rounded-2xl bg-${healthScore.color}-500/10 border border-${healthScore.color}-500/20 text-${healthScore.color}-600`}>
                                            <Activity className="h-6 w-6" />
                                        </div>
                                    </div>

                                    <div className="grid md:grid-cols-2 gap-12 items-center">
                                        <div className="relative w-48 h-48 mx-auto md:mx-0 flex items-center justify-center">
                                            <svg className="w-full h-full transform -rotate-90">
                                                <circle cx="96" cy="96" r="80" stroke="currentColor" strokeWidth="16" fill="transparent" className="text-foreground/5" />
                                                <circle cx="96" cy="96" r="80" stroke="currentColor" strokeWidth="16" fill="transparent" strokeDasharray={502} strokeDashoffset={502 - (502 * (healthScore.score / 100))} className={`text-${healthScore.color}-500 drop-shadow-2xl`} strokeLinecap="round" />
                                            </svg>
                                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                                <span className={`text-5xl font-black tracking-tighter text-${healthScore.color}-600`}>{healthScore.score}%</span>
                                                <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Index</span>
                                            </div>
                                        </div>

                                        <div className="space-y-6">
                                            <div className="space-y-1">
                                                <p className="text-3xl font-black uppercase tracking-tighter text-foreground/80">{healthScore.status}</p>
                                                <p className="text-sm font-medium text-muted-foreground">Votre score de santé est optimal ce mois-ci.</p>
                                            </div>
                                            <div className="flex gap-4">
                                                <div className="flex-1 p-4 rounded-3xl bg-white/40 border border-white/60">
                                                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">Tendence</p>
                                                    <div className="flex items-center gap-2 text-green-600 font-black">
                                                        <TrendingUp className="h-4 w-4" />
                                                        +12%
                                                    </div>
                                                </div>
                                                <div className="flex-1 p-4 rounded-3xl bg-white/40 border border-white/60">
                                                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">Confiance</p>
                                                    <div className="flex items-center gap-2 text-primary font-black">
                                                        <Shield className="h-4 w-4" />
                                                        98%
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </ScrollReveal>

                            <ScrollReveal animation="fade-up" delay={0.3}>
                                <div className="grid md:grid-cols-2 gap-8">
                                    <div className="glass-card p-8 bg-white/40 border-white/40 hover:bg-white/60 transition-all cursor-pointer group">
                                        <div className="flex items-center justify-between mb-6">
                                            <div className="h-12 w-12 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-600">
                                                <Heart className="h-6 w-6" />
                                            </div>
                                            <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
                                        </div>
                                        <h4 className="text-xl font-black uppercase tracking-tighter mb-1">Constantes</h4>
                                        <p className="text-xs font-bold text-muted-foreground mb-6 uppercase tracking-widest leading-none">Vitals & Biométrie</p>
                                        <div className="space-y-4">
                                            <div className="flex justify-between items-center bg-white/60 p-3 rounded-2xl">
                                                <span className="text-xs font-black uppercase text-muted-foreground">Tension</span>
                                                <span className="font-bold">120/80</span>
                                            </div>
                                            <div className="flex justify-between items-center bg-white/60 p-3 rounded-2xl">
                                                <span className="text-xs font-black uppercase text-muted-foreground">Poids</span>
                                                <span className="font-bold">75.4 kg</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="glass-card p-8 bg-white/40 border-white/40 hover:bg-white/60 transition-all cursor-pointer group">
                                        <div className="flex items-center justify-between mb-6">
                                            <div className="h-12 w-12 rounded-2xl bg-orange-500/10 flex items-center justify-center text-orange-600">
                                                <Zap className="h-6 w-6" />
                                            </div>
                                            <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-orange-600 group-hover:translate-x-1 transition-all" />
                                        </div>
                                        <h4 className="text-xl font-black uppercase tracking-tighter mb-1">Rapports</h4>
                                        <p className="text-xs font-bold text-muted-foreground mb-6 uppercase tracking-widest leading-none">Analyses & Documents</p>
                                        <div className="flex items-center gap-3">
                                            <div className="flex -space-x-3">
                                                {[1, 2, 3].map(i => <div key={i} className="h-10 w-10 rounded-full border-2 border-white bg-slate-100 flex items-center justify-center"><FileText className="h-4 w-4 text-slate-400" /></div>)}
                                            </div>
                                            <span className="text-xs font-black uppercase tracking-widest text-primary">+8 NOUVEAUX</span>
                                        </div>
                                    </div>
                                </div>
                            </ScrollReveal>

                            <ScrollReveal animation="fade-up" delay={0.4}>
                                <OrderHistory />
                            </ScrollReveal>
                        </div>

                        <div className="space-y-10">
                            <ScrollReveal animation="fade-up" delay={0.2}>
                                <div className="glass-card p-8 bg-white/60 border-white/60">
                                    <div className="flex justify-between items-center mb-8">
                                        <div className="space-y-1">
                                            <h3 className="text-xl font-black uppercase tracking-tighter">Calendrier</h3>
                                            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{format(new Date(), 'MMMM yyyy', { locale: fr })}</p>
                                        </div>
                                        <CalendarIcon className="h-5 w-5 text-primary" />
                                    </div>
                                    <div className="flex justify-between gap-2">
                                        {['L', 'M', 'M', 'J', 'V', 'S', 'D'].map((day, i) => {
                                            const isSelected = i === 2;
                                            return (
                                                <div key={i} className={`flex-1 flex flex-col items-center gap-2 p-3 rounded-2xl transition-all cursor-pointer ${isSelected ? 'bg-primary text-white shadow-xl shadow-primary/20 scale-110' : 'bg-white/40 hover:bg-white/80'}`}>
                                                    <span className="text-[10px] font-black">{day}</span>
                                                    <span className="text-sm font-black">{14 + i}</span>
                                                </div>
                                            )
                                        })}
                                    </div>
                                </div>
                            </ScrollReveal>

                            <ScrollReveal animation="fade-up" delay={0.3}>
                                <div className="glass-card p-10 bg-foreground text-background space-y-8">
                                    <div className="flex justify-between items-center">
                                        <h3 className="text-xl font-black uppercase tracking-tighter">Traitements</h3>
                                        <Badge className="bg-primary text-white font-black uppercase tracking-widest text-[10px]">3 Actifs</Badge>
                                    </div>
                                    <div className="space-y-6">
                                        <div className="space-y-4">
                                            <div className="flex items-center gap-4">
                                                <div className="h-12 w-12 bg-white/10 rounded-2xl flex items-center justify-center text-primary">
                                                    <Syringe className="h-6 w-6" />
                                                </div>
                                                <div>
                                                    <p className="font-black uppercase tracking-tighter">Amoxicilline</p>
                                                    <p className="text-[10px] font-bold opacity-60 uppercase">Antibiotique • J-3</p>
                                                </div>
                                            </div>
                                            <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
                                                <div className="h-full bg-primary w-[70%]" />
                                            </div>
                                        </div>

                                        <div className="space-y-4">
                                            <div className="flex items-center gap-4 opacity-40">
                                                <div className="h-12 w-12 bg-white/10 rounded-2xl flex items-center justify-center">
                                                    <CheckCircle className="h-6 w-6" />
                                                </div>
                                                <div>
                                                    <p className="font-black uppercase tracking-tighter">Vaccin Grippe</p>
                                                    <p className="text-[10px] font-bold uppercase">Terminé</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <Button variant="outline" className="w-full h-12 rounded-2xl bg-white/10 border-white/20 hover:bg-white/20 text-white font-black uppercase tracking-widest">Voir le carnet complet</Button>
                                </div>
                            </ScrollReveal>

                            <ScrollReveal animation="fade-up" delay={0.4}>
                                <div className="led-border-container rounded-[2.5rem] p-[1px] group">
                                    <div className="led-border-spinner group-hover:opacity-100 opacity-40" />
                                    <div className="relative glass-card p-8 bg-white/60 border-white/40 space-y-6">
                                        <div className="flex items-center gap-4">
                                            <div className="h-14 w-14 bg-emerald-500/10 rounded-[1.5rem] flex items-center justify-center text-emerald-600 border border-emerald-500/20">
                                                <CalendarIcon className="h-6 w-6" />
                                            </div>
                                            <div>
                                                <h4 className="font-black uppercase tracking-tighter text-lg">Prochaine Visite</h4>
                                                <p className="text-xs font-black uppercase tracking-widest text-muted-foreground">Cardiologue</p>
                                            </div>
                                        </div>
                                        <div className="p-6 bg-emerald-500/5 border border-emerald-500/10 rounded-3xl space-y-4">
                                            <div className="flex justify-between items-center text-xs font-black uppercase">
                                                <span className="opacity-40">Mercredi, 12 Juin</span>
                                                <span className="text-emerald-600">14:30</span>
                                            </div>
                                        </div>
                                        <Button className="w-full h-14 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white font-black uppercase tracking-widest shadow-xl shadow-emerald-500/20 transition-all">Confirmer Présence</Button>
                                    </div>
                                </div>
                            </ScrollReveal>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default ECarnetDashboard;
