import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/integrations/supabase/client';
import {
    RefreshCw,
    Calendar,
    Clock,
    Pill,
    AlertCircle,
    CheckCircle,
    Bell,
    Settings,
    ChevronRight,
    Plus
} from 'lucide-react';
import { toast } from 'sonner';

interface Prescription {
    id: string;
    medicationName: string;
    dosage: string;
    frequency: string;
    startDate: string;
    endDate: string;
    refillsRemaining: number;
    totalRefills: number;
    autoRenew: boolean;
    lastRefillDate?: string;
    nextRefillDate?: string;
    prescribedBy: string;
    status: 'active' | 'expiring' | 'expired' | 'pending_renewal';
}

interface PrescriptionRenewalProps {
    patientId?: string;
}

export function PrescriptionRenewal({ patientId }: PrescriptionRenewalProps) {
    const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (patientId) {
            fetchPrescriptions();
        }
    }, [patientId]);

    const fetchPrescriptions = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('prescriptions')
                .select(`
                    *,
                    doctor:doctors(user_id, user_profiles(name))
                `)
                .eq('patient_id', patientId);

            if (error) throw error;

            if (data && data.length > 0) {
                const formatted: Prescription[] = data.map((p: any) => {
                    // Extract medications from JSON
                    const meds = Array.isArray(p.medications) ? p.medications[0] : (p.medications || {});

                    // Logic to determine status based on date
                    const expiry = new Date(p.expires_at || p.created_at);
                    const now = new Date();
                    const daysToExpiry = Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

                    let status: Prescription['status'] = 'active';
                    if (p.status === 'pending_renewal') status = 'pending_renewal';
                    else if (daysToExpiry < 0) status = 'expired';
                    else if (daysToExpiry < 15) status = 'expiring';

                    return {
                        id: p.id,
                        medicationName: meds.name || p.prescription_text.substring(0, 20) || 'Médicament',
                        dosage: meds.dosage || 'N/A',
                        frequency: meds.frequency || 'N/A',
                        startDate: new Date(p.created_at).toISOString().split('T')[0],
                        endDate: p.expires_at ? new Date(p.expires_at).toISOString().split('T')[0] : 'Inconnu',
                        refillsRemaining: meds.refills_remaining ?? 2,
                        totalRefills: meds.total_refills ?? 6,
                        autoRenew: localStorage.getItem(`autorenew_${p.id}`) === 'true',
                        prescribedBy: p.doctor?.user_profiles?.name || 'Dr. PharmaGo',
                        status: status
                    };
                });
                setPrescriptions(formatted);
            } else {
                // Fallback to mock if empty for demo
                setPrescriptions(MOCK_PRESCRIPTIONS);
            }
        } catch (err) {
            console.error('Error fetching prescriptions:', err);
            setPrescriptions(MOCK_PRESCRIPTIONS);
        } finally {
            setLoading(false);
        }
    };

    const toggleAutoRenew = (prescriptionId: string) => {
        setPrescriptions(prev => prev.map(p => {
            if (p.id === prescriptionId) {
                const newAutoRenew = !p.autoRenew;
                localStorage.setItem(`autorenew_${p.id}`, String(newAutoRenew));
                toast.success(
                    newAutoRenew
                        ? 'Renouvellement automatique activé'
                        : 'Renouvellement automatique désactivé'
                );
                return { ...p, autoRenew: newAutoRenew };
            }
            return p;
        }));
    };

    const requestRenewal = async (prescription: Prescription) => {
        try {
            const { error } = await supabase
                .from('prescriptions')
                .update({ status: 'pending_renewal' })
                .eq('id', prescription.id);

            if (error) throw error;

            setPrescriptions(prev => prev.map(p => {
                if (p.id === prescription.id) {
                    return { ...p, status: 'pending_renewal' as const };
                }
                return p;
            }));
            toast.success(`Demande de renouvellement envoyée pour ${prescription.medicationName}`);
        } catch (err) {
            toast.error('Erreur lors de la demande');
        }
    };

    // Keep MOCK_PRESCRIPTIONS at the bottom as a constant
    const MOCK_PRESCRIPTIONS: Prescription[] = [
        {
            id: 'mock-1',
            medicationName: 'Metformine 500mg',
            dosage: '500mg',
            frequency: '2x/jour',
            startDate: '2026-01-01',
            endDate: '2026-03-01',
            refillsRemaining: 2,
            totalRefills: 6,
            autoRenew: true,
            prescribedBy: 'Dr. Kouassi',
            status: 'active'
        }
    ];


    const getStatusBadge = (status: Prescription['status']) => {
        const styles = {
            active: 'bg-green-100 text-green-700 border-green-200',
            expiring: 'bg-amber-100 text-amber-700 border-amber-200',
            expired: 'bg-red-100 text-red-700 border-red-200',
            pending_renewal: 'bg-blue-100 text-blue-700 border-blue-200'
        };
        const labels = {
            active: 'Actif',
            expiring: 'Expire bientôt',
            expired: 'Expiré',
            pending_renewal: 'En attente'
        };
        const icons = {
            active: <CheckCircle className="h-3 w-3 mr-1" />,
            expiring: <AlertCircle className="h-3 w-3 mr-1" />,
            expired: <AlertCircle className="h-3 w-3 mr-1" />,
            pending_renewal: <Clock className="h-3 w-3 mr-1" />
        };

        return (
            <Badge className={`${styles[status]} border text-xs font-semibold`}>
                {icons[status]}
                {labels[status]}
            </Badge>
        );
    };

    const expiringCount = prescriptions.filter(p => p.status === 'expiring' || p.status === 'expired').length;

    return (
        <Card className="bg-gradient-to-br from-purple-50/50 to-indigo-50/50 border-purple-200/50">
            <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="p-2 bg-purple-100 rounded-xl">
                            <RefreshCw className="h-5 w-5 text-purple-600" />
                        </div>
                        <div>
                            <CardTitle className="text-lg">Renouvellement d'ordonnances</CardTitle>
                            <p className="text-xs text-muted-foreground">Gérez vos prescriptions récurrentes</p>
                        </div>
                    </div>
                    {expiringCount > 0 && (
                        <Badge variant="destructive" className="animate-pulse">
                            <Bell className="h-3 w-3 mr-1" />
                            {expiringCount} à renouveler
                        </Badge>
                    )}
                </div>
            </CardHeader>

            <CardContent className="space-y-4">
                {prescriptions.map(prescription => (
                    <div
                        key={prescription.id}
                        className={`p-4 rounded-xl border transition-all hover:shadow-md ${prescription.status === 'expiring'
                            ? 'bg-amber-50/50 border-amber-200'
                            : prescription.status === 'expired'
                                ? 'bg-red-50/50 border-red-200'
                                : 'bg-white border-slate-200'
                            }`}
                    >
                        <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-3">
                                <div className={`p-2 rounded-lg ${prescription.status === 'expiring' || prescription.status === 'expired'
                                    ? 'bg-amber-100'
                                    : 'bg-purple-100'
                                    }`}>
                                    <Pill className={`h-5 w-5 ${prescription.status === 'expiring' || prescription.status === 'expired'
                                        ? 'text-amber-600'
                                        : 'text-purple-600'
                                        }`} />
                                </div>
                                <div>
                                    <h4 className="font-semibold text-slate-900">{prescription.medicationName}</h4>
                                    <p className="text-sm text-muted-foreground">
                                        {prescription.dosage} • {prescription.frequency}
                                    </p>
                                </div>
                            </div>
                            {getStatusBadge(prescription.status)}
                        </div>

                        {/* Refills Progress */}
                        <div className="mb-3">
                            <div className="flex items-center justify-between text-xs mb-1">
                                <span className="text-muted-foreground">Renouvellements restants</span>
                                <span className="font-semibold">{prescription.refillsRemaining}/{prescription.totalRefills}</span>
                            </div>
                            <Progress
                                value={(prescription.refillsRemaining / prescription.totalRefills) * 100}
                                className="h-2"
                            />
                        </div>

                        {/* Info Row */}
                        <div className="flex items-center gap-4 text-xs text-muted-foreground mb-3">
                            <div className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                Expire: {prescription.endDate}
                            </div>
                            {prescription.nextRefillDate && (
                                <div className="flex items-center gap-1">
                                    <Clock className="h-3 w-3" />
                                    Prochain: {prescription.nextRefillDate}
                                </div>
                            )}
                        </div>

                        {/* Actions */}
                        <div className="flex items-center justify-between pt-3 border-t border-slate-200">
                            <div className="flex items-center gap-2">
                                <Switch
                                    checked={prescription.autoRenew}
                                    onCheckedChange={() => toggleAutoRenew(prescription.id)}
                                    className="data-[state=checked]:bg-purple-600"
                                />
                                <span className="text-xs font-medium text-slate-600">Auto-renouvellement</span>
                            </div>

                            {(prescription.status === 'expiring' || prescription.refillsRemaining === 0) && (
                                <Button
                                    size="sm"
                                    onClick={() => requestRenewal(prescription)}
                                    disabled={prescription.status === 'pending_renewal'}
                                    className="bg-purple-600 hover:bg-purple-700"
                                >
                                    <RefreshCw className="h-3 w-3 mr-1" />
                                    {prescription.status === 'pending_renewal' ? 'En attente...' : 'Renouveler'}
                                </Button>
                            )}
                        </div>
                    </div>
                ))}

                {/* Add New Prescription Button */}
                <Button variant="outline" className="w-full border-dashed border-purple-300 text-purple-600 hover:bg-purple-50">
                    <Plus className="h-4 w-4 mr-2" />
                    Ajouter une ordonnance
                </Button>
            </CardContent>
        </Card>
    );
}
