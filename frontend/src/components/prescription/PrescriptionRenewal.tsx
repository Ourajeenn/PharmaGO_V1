import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Progress } from '@/components/ui/progress';
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
    const [prescriptions, setPrescriptions] = useState<Prescription[]>([
        {
            id: '1',
            medicationName: 'Metformine 500mg',
            dosage: '500mg',
            frequency: '2x/jour',
            startDate: '2026-01-01',
            endDate: '2026-03-01',
            refillsRemaining: 2,
            totalRefills: 6,
            autoRenew: true,
            lastRefillDate: '2026-02-01',
            nextRefillDate: '2026-02-15',
            prescribedBy: 'Dr. Kouassi',
            status: 'active'
        },
        {
            id: '2',
            medicationName: 'Amlodipine 5mg',
            dosage: '5mg',
            frequency: '1x/jour',
            startDate: '2025-12-15',
            endDate: '2026-02-15',
            refillsRemaining: 0,
            totalRefills: 3,
            autoRenew: false,
            lastRefillDate: '2026-01-15',
            nextRefillDate: '2026-02-10',
            prescribedBy: 'Dr. Kouamé',
            status: 'expiring'
        },
        {
            id: '3',
            medicationName: 'Oméprazole 20mg',
            dosage: '20mg',
            frequency: '1x/jour (matin)',
            startDate: '2026-01-20',
            endDate: '2026-04-20',
            refillsRemaining: 4,
            totalRefills: 4,
            autoRenew: true,
            prescribedBy: 'Dr. Bamba',
            status: 'active'
        }
    ]);

    const toggleAutoRenew = (prescriptionId: string) => {
        setPrescriptions(prev => prev.map(p => {
            if (p.id === prescriptionId) {
                const newAutoRenew = !p.autoRenew;
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

    const requestRenewal = (prescription: Prescription) => {
        setPrescriptions(prev => prev.map(p => {
            if (p.id === prescription.id) {
                return { ...p, status: 'pending_renewal' as const };
            }
            return p;
        }));
        toast.success(`Demande de renouvellement envoyée pour ${prescription.medicationName}`);
    };

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
