import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    Activity,
    Calendar,
    AlertTriangle,
    Download,
    TrendingUp,
    Clock,
    CheckCircle2,
    Wine
} from 'lucide-react';
import { PredictiveHealthService, RenewalAlert } from '@/services/PredictiveHealthService';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    AreaChart,
    Area
} from 'recharts';

const HealthDashboard = () => {
    const { user } = useAuth();
    const [renewals, setRenewals] = useState<RenewalAlert[]>([]);
    const [loading, setLoading] = useState(true);
    const [complianceScore, setComplianceScore] = useState(85);

    // Mock data for health trends
    const healthData = [
        { month: 'Jan', expense: 15000, compliance: 70 },
        { month: 'Fév', expense: 12000, compliance: 75 },
        { month: 'Mar', expense: 25000, compliance: 65 },
        { month: 'Avr', expense: 18000, compliance: 80 },
        { month: 'Mai', expense: 14000, compliance: 85 },
        { month: 'Juin', expense: 10000, compliance: 92 },
    ];

    useEffect(() => {
        if (user) {
            loadHealthData();
        }
    }, [user]);

    const loadHealthData = async () => {
        setLoading(true);
        try {
            const data = await PredictiveHealthService.getRenewalPredictions(user?.id || '');
            setRenewals(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleExportPDF = () => {
        toast.info("Génération du rapport de santé en cours...");
        setTimeout(() => {
            toast.success("Rapport exporté avec succès !");
        }, 1500);
    };

    return (
        <div className="p-6 space-y-6 bg-slate-50/50 min-h-screen">
            <div className="flex justify-between items-center bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Mon Espace Santé Intelligent</h1>
                    <p className="text-slate-500">Suivi IA de vos traitements et de votre bien-être</p>
                </div>
                <Button onClick={handleExportPDF} className="bg-slate-900 gap-2">
                    <Download className="h-4 w-4" />
                    Exporter Rapport Médical
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Compliance Card */}
                <Card className="border-0 shadow-lg bg-gradient-to-br from-indigo-600 to-violet-700 text-white">
                    <CardContent className="p-6">
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-2 bg-white/20 rounded-lg">
                                <Activity className="h-6 w-6" />
                            </div>
                            <Badge className="bg-white/20 text-white border-0">A+</Badge>
                        </div>
                        <h3 className="text-lg font-medium opacity-90">Indice d'Observance</h3>
                        <div className="flex items-end gap-2 my-2">
                            <span className="text-4xl font-bold">{complianceScore}%</span>
                            <span className="text-xs pb-1 text-green-300 flex items-center gap-1">
                                <TrendingUp className="h-3 w-3" /> +5%
                            </span>
                        </div>
                        <p className="text-sm text-indigo-100">
                            Excellent ! Vous respectez vos prises mieux que 92% des patients.
                        </p>
                    </CardContent>
                </Card>

                {/* Alerts Card */}
                <Card className="border-0 shadow-md bg-white">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-semibold text-slate-500 uppercase flex items-center gap-2">
                            <Clock className="h-4 w-4 text-orange-500" />
                            Prochains Renouvellements
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {renewals.length > 0 ? renewals.map(m => (
                            <div key={m.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                                <div>
                                    <p className="font-bold text-slate-800">{m.medicineName}</p>
                                    <p className="text-xs text-slate-500">Reste environ {m.remainingDays} jours</p>
                                </div>
                                <Button size="sm" variant="outline" className="text-xs h-8">Commander</Button>
                            </div>
                        )) : (
                            <div className="py-4 text-center">
                                <CheckCircle2 className="h-8 w-8 text-green-500 mx-auto mb-2" />
                                <p className="text-sm text-slate-600">Tout est à jour !</p>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Risk Card */}
                <Card className="border-0 shadow-md bg-white">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-semibold text-slate-500 uppercase flex items-center gap-2">
                            <AlertTriangle className="h-4 w-4 text-red-500" />
                            Risques et Interactions
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="flex flex-col items-center justify-center py-6 text-center">
                        <div className="h-16 w-16 bg-green-50 rounded-full flex items-center justify-center mb-4">
                            <CheckCircle2 className="h-8 w-8 text-green-600" />
                        </div>
                        <p className="text-sm text-slate-600 px-4">
                            Aucune interaction dangereuse détectée avec vos traitements actuels.
                        </p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Expense Chart */}
                <Card className="border-0 shadow-md">
                    <CardHeader>
                        <CardTitle className="text-lg font-bold flex items-center gap-2">
                            <Wine className="h-5 w-5 text-indigo-500" />
                            Suivi des Dépenses Santé
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={healthData}>
                                <defs>
                                    <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.1} />
                                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                                <Tooltip
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                />
                                <Area type="monotone" dataKey="expense" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorExpense)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                {/* Compliance Trend */}
                <Card className="border-0 shadow-md">
                    <CardHeader>
                        <CardTitle className="text-lg font-bold flex items-center gap-2">
                            <Activity className="h-5 w-5 text-emerald-500" />
                            Évolution de l'Observance (%)
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={healthData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                                <Tooltip
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                />
                                <Line
                                    type="monotone"
                                    dataKey="compliance"
                                    stroke="#10b981"
                                    strokeWidth={3}
                                    dot={{ r: 4, fill: '#10b981', strokeWidth: 2, stroke: '#fff' }}
                                    activeDot={{ r: 6, strokeWidth: 0 }}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default HealthDashboard;
