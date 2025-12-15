import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useECarnet } from '@/contexts/ECarnetContext';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    User, FileText, Syringe, TrendingUp, AlertCircle,
    Calendar as CalendarIcon, FileHeart, Plus, Activity, Bell, Settings, MoreHorizontal, CheckCircle
} from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import ScrollReveal from '@/components/ScrollReveal';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

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
        const ageScore = currentPatient.birthDate ?
            Math.max(50, 100 - (new Date().getFullYear() - new Date(currentPatient.birthDate).getFullYear()) * 0.5) : 80;

        const vaccineScore = currentPatient.vaccinations ?
            (currentPatient.vaccinations.filter(v => v.status === 'complete').length / currentPatient.vaccinations.length) * 100 : 70;

        const treatmentScore = currentPatient.treatments ?
            (currentPatient.treatments.filter(t => t.compliance > 70).length / Math.max(1, currentPatient.treatments.length)) * 100 : 80;

        // Type-specific modifiers
        let typeModifier = 1.0;
        let bonusPoints = 0;

        switch (patientType) {
            case 'cmu':
                // CMU patients have access to free care, may have better compliance
                typeModifier = 1.05; // 5% bonus
                bonusPoints = 5;
                break;
            case 'insured':
                // Insured patients have regular checkups and preventive care
                typeModifier = 1.1; // 10% bonus
                bonusPoints = 8;
                break;
            case 'premium':
                // Premium insurance provides comprehensive care
                typeModifier = 1.15; // 15% bonus
                bonusPoints = 12;
                break;
            default:
                // Standard patients
                typeModifier = 1.0;
                bonusPoints = 0;
        }

        // Calculate final score
        const baseScore = (ageScore * 0.3 + vaccineScore * 0.3 + treatmentScore * 0.4);
        const finalScore = Math.min(100, Math.round((baseScore * typeModifier) + bonusPoints));

        // Determine status and color
        let status, color;
        if (finalScore >= 85) {
            status = 'Excellente';
            color = 'green';
        } else if (finalScore >= 70) {
            status = 'Bonne';
            color = 'blue';
        } else if (finalScore >= 50) {
            status = 'Moyenne';
            color = 'yellow';
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

    // Auto-select first patient
    useEffect(() => {
        if (!currentPatient && patients.length > 0) {
            setCurrentPatient(patients[0]);
        }
    }, [currentPatient, patients, setCurrentPatient]);

    const calculateAge = (birthDate: string) => {
        const birth = new Date(birthDate);
        const today = new Date();
        const years = today.getFullYear() - birth.getFullYear();
        if (years < 2) {
            const months = today.getMonth() - birth.getMonth();
            return `${months} mois`;
        }
        return `${years} ans`;
    };

    if (!currentPatient && patients.length === 0) {
        return (
            <div className="min-h-screen bg-slate-50 flex flex-col">
                <Header />
                <main className="flex-1 flex items-center justify-center p-4">
                    <Card className="max-w-md w-full shadow-xl border-none rounded-3xl">
                        <CardContent className="p-12 text-center">
                            <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                <FileHeart className="h-10 w-10 text-blue-600" />
                            </div>
                            <h3 className="text-2xl font-bold mb-2 text-slate-800">Bienvenue</h3>
                            <p className="text-slate-500 mb-8">
                                Créez votre premier dossier médical pour commencer à suivre votre santé.
                            </p>
                            <Button size="lg" className="rounded-full w-full bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-200" onClick={() => navigate('/ecarnet/new-patient')}>
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
        <div className="min-h-screen bg-[#F0F2F5]">
            <Header />

            <main className="py-8 pb-24">
                <div className="container mx-auto px-4 max-w-5xl">

                    {/* Top Profile Bar matching reference */}
                    <ScrollReveal animation="fade-down" delay={0.1}>
                        <div className="flex items-center justify-between mb-8">
                            <div className="flex items-center gap-4">
                                {currentPatient?.photo ? (
                                    <img
                                        src={currentPatient.photo}
                                        alt="Profile"
                                        className="w-14 h-14 rounded-full object-cover border-2 border-white shadow-md"
                                    />
                                ) : (
                                    <div className="w-14 h-14 rounded-full bg-blue-100 flex items-center justify-center border-2 border-white shadow-md">
                                        <User className="h-7 w-7 text-blue-600" />
                                    </div>
                                )}
                                <div>
                                    <h2 className="text-xl font-bold text-slate-800">
                                        {currentPatient ? `${currentPatient.firstName} ${currentPatient.lastName}` : 'Patient'}
                                    </h2>
                                    <p className="text-sm text-slate-500 font-medium">
                                        {currentPatient ? `Dossier #${currentPatient.id.slice(0, 6)}` : 'Chargement...'}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <Button variant="outline" size="icon" className="rounded-full bg-white border-none shadow-sm h-12 w-12 text-slate-600 hover:text-blue-600">
                                    <Bell className="h-5 w-5" />
                                    {alerts.length > 0 && <span className="absolute top-3 right-3 w-2 h-2 bg-red-500 rounded-full" />}
                                </Button>
                                <Button variant="outline" size="icon" className="rounded-full bg-white border-none shadow-sm h-12 w-12 text-slate-600 hover:text-blue-600" onClick={() => navigate('/ecarnet/profile')}>
                                    <Settings className="h-5 w-5" />
                                </Button>
                            </div>
                        </div>
                    </ScrollReveal>

                    <div className="grid lg:grid-cols-2 gap-8">
                        {/* LEFT COLUMN */}
                        <div className="space-y-8">

                            {/* Global Health Score (Revenue Style) */}
                            <ScrollReveal animation="fade-up" delay={0.2}>
                                <Card className="rounded-[2rem] border-none shadow-lg shadow-slate-200/50 overflow-hidden bg-white relative">
                                    <CardContent className="p-8">
                                        <div className="flex justify-between items-start mb-6">
                                            <div>
                                                <h3 className="text-xl font-bold text-slate-800">Santé Globale</h3>
                                                <p className="text-slate-400 text-sm">Ce mois-ci</p>
                                            </div>
                                            <Button variant="ghost" size="icon" className="rounded-full h-8 w-8">
                                                <MoreHorizontal className="h-5 w-5 text-slate-300" />
                                            </Button>
                                        </div>

                                        <div className="flex items-center gap-8">
                                            {/* Circular Progress Simulation */}
                                            <div className="relative w-32 h-32 flex items-center justify-center">
                                                <svg className="w-full h-full transform -rotate-90">
                                                    <circle cx="64" cy="64" r="56" stroke="currentColor" strokeWidth="12" fill="transparent" className="text-slate-100" />
                                                    <circle cx="64" cy="64" r="56" stroke="currentColor" strokeWidth="12" fill="transparent" strokeDasharray={351} strokeDashoffset={351 - (351 * (healthScore.score / 100))} className={`text-${healthScore.color}-600 drop-shadow-lg`} strokeLinecap="round" />
                                                </svg>
                                                <div className="absolute inset-0 flex flex-col items-center justify-center">
                                                    <span className={`text-3xl font-bold text-${healthScore.color}-600`}>{healthScore.score}%</span>
                                                    <span className="text-xs text-slate-400 font-medium tracking-wide">SCORE</span>
                                                </div>
                                            </div>

                                            <div className="space-y-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-3 h-3 rounded-full bg-blue-500" />
                                                    <div>
                                                        <p className="text-lg font-bold text-slate-700">{healthScore.status}</p>
                                                        <p className="text-xs text-slate-400">État général</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <div className="w-3 h-3 rounded-full bg-green-500" />
                                                    <div>
                                                        <p className="text-lg font-bold text-slate-700">Stable</p>
                                                        <p className="text-xs text-slate-400">Constantes</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="mt-8 flex items-center gap-6 text-sm">
                                            <div className="text-green-500 font-bold bg-green-50 px-3 py-1 rounded-full text-xs">+12.5%</div>
                                            <div className="text-slate-400">vs mois dernier</div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </ScrollReveal>

                            {/* Vitals / Performance Card */}
                            <ScrollReveal animation="fade-up" delay={0.3}>
                                <Card className="rounded-[2rem] border-none shadow-lg shadow-slate-200/50 bg-white">
                                    <CardContent className="p-8">
                                        <div className="flex justify-between items-center mb-8">
                                            <div>
                                                <h3 className="text-xl font-bold text-slate-800">Constantes</h3>
                                                <p className="text-slate-400 text-sm">Aperçu hebdomadaire</p>
                                            </div>
                                            <div className="h-10 w-10 bg-green-50 rounded-full flex items-center justify-center text-green-600 shadow-sm">
                                                <Activity className="h-5 w-5" />
                                            </div>
                                        </div>

                                        <div className="space-y-6">
                                            <div className="flex items-center justify-between p-4 rounded-2xl bg-blue-50/50 hover:bg-blue-50 transition-colors cursor-pointer group">
                                                <div className="flex items-center gap-4">
                                                    <div className="h-10 w-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
                                                        <User className="h-5 w-5" />
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-slate-700 group-hover:text-blue-700 transition-colors">Poids</p>
                                                        <p className="text-xs text-slate-400">Dernière pesée</p>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <span className="text-green-500 text-xs font-bold block mb-1">+0.2%</span>
                                                    <div className="h-1.5 w-24 bg-slate-100 rounded-full overflow-hidden">
                                                        <div className="h-full bg-blue-500 w-[75%]" />
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex items-center justify-between p-4 rounded-2xl bg-purple-50/50 hover:bg-purple-50 transition-colors cursor-pointer group">
                                                <div className="flex items-center gap-4">
                                                    <div className="h-10 w-10 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center">
                                                        <FileHeart className="h-5 w-5" />
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-slate-700 group-hover:text-purple-700 transition-colors">Tension</p>
                                                        <p className="text-xs text-slate-400">120/80 mmHg</p>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <span className="text-green-500 text-xs font-bold block mb-1">Normal</span>
                                                    <div className="h-1.5 w-24 bg-slate-100 rounded-full overflow-hidden">
                                                        <div className="h-full bg-purple-500 w-[90%]" />
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex items-center justify-between p-4 rounded-2xl bg-orange-50/50 hover:bg-orange-50 transition-colors cursor-pointer group">
                                                <div className="flex items-center gap-4">
                                                    <div className="h-10 w-10 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center">
                                                        <Activity className="h-5 w-5" />
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-slate-700 group-hover:text-orange-700 transition-colors">Sommeil</p>
                                                        <p className="text-xs text-slate-400">7h 30m moy.</p>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <span className="text-orange-500 text-xs font-bold block mb-1">-1.5%</span>
                                                    <div className="h-1.5 w-24 bg-slate-100 rounded-full overflow-hidden">
                                                        <div className="h-full bg-orange-400 w-[60%]" />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </ScrollReveal>
                        </div>

                        {/* RIGHT COLUMN */}
                        <div className="space-y-8">

                            {/* Calendar / This Week */}
                            <ScrollReveal animation="fade-up" delay={0.2}>
                                <Card className="rounded-[2rem] border-none shadow-lg shadow-slate-200/50 bg-white">
                                    <CardContent className="p-8">
                                        <div className="flex justify-between items-center mb-6">
                                            <div>
                                                <h3 className="text-xl font-bold text-slate-800">Cette Semaine</h3>
                                                <p className="text-slate-400 text-sm text-capitalize">{format(new Date(), 'dd MMMM yyyy', { locale: fr })}</p>
                                            </div>
                                            <Button size="sm" variant="ghost" className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 font-medium">
                                                Voir tout
                                            </Button>
                                        </div>

                                        {/* Calendar Strip simulation */}
                                        <div className="flex justify-between items-center bg-slate-50 p-4 rounded-2xl mb-8">
                                            {['L', 'M', 'M', 'J', 'V', 'S', 'D'].map((day, i) => {
                                                const isSelected = i === 2; // Simulate selection
                                                return (
                                                    <div key={i} className={`flex flex-col items-center gap-2 p-3 rounded-2xl w-12 transition-all cursor-pointer ${isSelected ? 'bg-blue-600 text-white shadow-lg shadow-blue-300 scale-110' : 'text-slate-400 hover:bg-white hover:text-slate-600'}`}>
                                                        <span className="text-xs font-medium">{day}</span>
                                                        <span className={`text-sm font-bold ${isSelected ? 'text-white' : 'text-slate-700'}`}>{14 + i}</span>
                                                    </div>
                                                )
                                            })}
                                        </div>
                                    </CardContent>
                                </Card>
                            </ScrollReveal>

                            {/* Active Treatments / Projects */}
                            <ScrollReveal animation="fade-up" delay={0.3}>
                                <Card className="rounded-[2rem] border-none shadow-lg shadow-slate-200/50 bg-white">
                                    <CardContent className="p-8">
                                        <div className="flex justify-between items-center mb-6">
                                            <div>
                                                <h3 className="text-xl font-bold text-slate-800">Traitements Actifs</h3>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <span className="w-2 h-2 rounded-full bg-orange-400 animate-pulse" />
                                                    <p className="text-orange-400 text-sm font-medium">En cours (3)</p>
                                                </div>
                                            </div>
                                            <Button size="sm" variant="ghost" className="text-slate-400 hover:text-slate-600">
                                                Voir tout (12)
                                            </Button>
                                        </div>

                                        <div className="space-y-6">
                                            <div className="p-5 bg-blue-50 rounded-3xl group cursor-pointer hover:shadow-md transition-all">
                                                <div className="flex justify-between items-start mb-4">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-12 h-12 bg-blue-600 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-blue-300">
                                                            <Syringe className="h-6 w-6" />
                                                        </div>
                                                        <div>
                                                            <h4 className="font-bold text-slate-800 text-lg">Amoxicilline</h4>
                                                            <p className="text-slate-500 text-sm">Antibiotique • 500mg</p>
                                                        </div>
                                                    </div>
                                                    <div className="bg-white px-3 py-1 rounded-full text-xs font-bold text-orange-500 border border-orange-100 shadow-sm">
                                                        Matin & Soir
                                                    </div>
                                                </div>
                                                <p className="text-slate-600 text-sm mb-4 leading-relaxed">
                                                    Prendre pendant les repas. Fin du traitement dans 3 jours.
                                                </p>
                                                <div className="flex items-center gap-4">
                                                    <div className="h-2 flex-1 bg-white rounded-full overflow-hidden">
                                                        <div className="h-full bg-blue-500 w-[68%]" />
                                                    </div>
                                                    <span className="text-blue-600 font-bold text-sm">68%</span>
                                                </div>
                                                <div className="flex items-center gap--2 mt-4 pl-2">
                                                    <div className="w-8 h-8 rounded-full bg-slate-200 border-2 border-white -ml-2" />
                                                    <div className="w-8 h-8 rounded-full bg-slate-300 border-2 border-white -ml-2" />
                                                    <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 border-2 border-white -ml-2 flex items-center justify-center text-xs font-bold">+2</div>
                                                </div>
                                            </div>

                                            <div className="p-5 bg-white border border-slate-100 rounded-3xl group cursor-pointer hover:shadow-md transition-all">
                                                <div className="flex justify-between items-center mb-3">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-12 h-12 bg-green-500 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-green-200">
                                                            <CheckCircle className="h-6 w-6" />
                                                        </div>
                                                        <div>
                                                            <h4 className="font-bold text-slate-800">Vaccin Grippe</h4>
                                                            <p className="text-green-500 text-sm font-medium flex items-center gap-1">
                                                                <TrendingUp className="h-3 w-3" /> Effectué
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <Badge className="bg-green-100 text-green-600 hover:bg-green-200 border-none">
                                                        Validé
                                                    </Badge>
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </ScrollReveal>

                            {/* Next Appointment */}
                            <ScrollReveal animation="fade-up" delay={0.4}>
                                <Card className="rounded-[2rem] border-none shadow-lg shadow-slate-200/50 bg-white">
                                    <CardContent className="p-0">
                                        <div className="p-8 pb-4">
                                            <div className="flex items-center gap-4 mb-2">
                                                <div className="w-12 h-12 bg-emerald-500 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-200">
                                                    <CalendarIcon className="h-6 w-6" />
                                                </div>
                                                <div>
                                                    <h4 className="font-bold text-slate-800 text-lg">Prochaine Visite</h4>
                                                    <p className="text-slate-500 text-sm">Cardiologue</p>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="px-8 pb-6">
                                            <div className="flex items-center justify-between text-sm">
                                                <span className="text-slate-400">Date</span>
                                                <span className="font-bold text-slate-700">Mercredi, 12 Juin</span>
                                            </div>
                                            <div className="my-2 border-t border-slate-50" />
                                            <div className="flex items-center justify-between text-sm">
                                                <span className="text-slate-400">Heure</span>
                                                <span className="font-bold text-emerald-500">14:30</span>
                                            </div>
                                        </div>
                                        <div className="bg-emerald-50 p-4 flex items-center gap-2 justify-center cursor-pointer hover:bg-emerald-100 transition-colors">
                                            <CheckCircle className="h-4 w-4 text-emerald-600" />
                                            <span className="text-emerald-700 font-bold text-sm">Confirmer la présence</span>
                                        </div>
                                    </CardContent>
                                </Card>
                            </ScrollReveal>

                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default ECarnetDashboard;
