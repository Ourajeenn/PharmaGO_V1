import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import {
    Shield,
    CreditCard,
    CheckCircle,
    XCircle,
    AlertCircle,
    Search,
    User,
    FileText,
    RefreshCw,
    Loader2,
    Wallet,
    ChevronRight
} from 'lucide-react';
import { toast } from 'sonner';

interface CMUPatient {
    id: string;
    cmuNumber: string;
    name: string;
    dateOfBirth: string;
    coverageType: 'basic' | 'extended' | 'premium';
    status: 'active' | 'expired' | 'suspended';
    validUntil: string;
    reimbursementRate: number;
    annualLimit: number;
    usedAmount: number;
}

interface CMUIntegrationProps {
    onPatientVerified?: (patient: CMUPatient) => void;
}

export function CMUIntegration({ onPatientVerified }: CMUIntegrationProps) {
    const [searchQuery, setSearchQuery] = useState('');
    const [isSearching, setIsSearching] = useState(false);
    const [verifiedPatient, setVerifiedPatient] = useState<CMUPatient | null>(null);
    const [recentVerifications, setRecentVerifications] = useState<CMUPatient[]>([
        {
            id: '1',
            cmuNumber: 'CMU-2026-001234',
            name: 'Kouassi Aya Marie',
            dateOfBirth: '1985-03-15',
            coverageType: 'extended',
            status: 'active',
            validUntil: '2026-12-31',
            reimbursementRate: 80,
            annualLimit: 500000,
            usedAmount: 125000
        },
        {
            id: '2',
            cmuNumber: 'CMU-2026-005678',
            name: 'Koné Moussa',
            dateOfBirth: '1990-07-22',
            coverageType: 'basic',
            status: 'active',
            validUntil: '2026-06-30',
            reimbursementRate: 70,
            annualLimit: 300000,
            usedAmount: 89000
        }
    ]);

    const verifyPatient = async () => {
        if (!searchQuery) {
            toast.error('Veuillez entrer un numéro CMU');
            return;
        }

        setIsSearching(true);

        // Simulate API call
        setTimeout(() => {
            if (searchQuery.includes('001234')) {
                const patient = recentVerifications[0];
                setVerifiedPatient(patient);
                onPatientVerified?.(patient);
                toast.success('Patient vérifié avec succès');
            } else if (searchQuery.includes('005678')) {
                const patient = recentVerifications[1];
                setVerifiedPatient(patient);
                onPatientVerified?.(patient);
                toast.success('Patient vérifié avec succès');
            } else {
                toast.error('Numéro CMU non trouvé');
                setVerifiedPatient(null);
            }
            setIsSearching(false);
        }, 1500);
    };

    const getStatusBadge = (status: CMUPatient['status']) => {
        const styles = {
            active: 'bg-green-100 text-green-700 border-green-200',
            expired: 'bg-red-100 text-red-700 border-red-200',
            suspended: 'bg-amber-100 text-amber-700 border-amber-200'
        };
        const labels = {
            active: 'Actif',
            expired: 'Expiré',
            suspended: 'Suspendu'
        };
        const icons = {
            active: <CheckCircle className="h-3 w-3 mr-1" />,
            expired: <XCircle className="h-3 w-3 mr-1" />,
            suspended: <AlertCircle className="h-3 w-3 mr-1" />
        };

        return (
            <Badge className={`${styles[status]} border text-xs font-semibold`}>
                {icons[status]}
                {labels[status]}
            </Badge>
        );
    };

    const getCoverageLabel = (type: CMUPatient['coverageType']) => {
        const labels = {
            basic: 'Basique',
            extended: 'Étendue',
            premium: 'Premium'
        };
        return labels[type];
    };

    const remainingBudget = verifiedPatient
        ? verifiedPatient.annualLimit - verifiedPatient.usedAmount
        : 0;

    const usedPercentage = verifiedPatient
        ? (verifiedPatient.usedAmount / verifiedPatient.annualLimit) * 100
        : 0;

    return (
        <Card className="bg-gradient-to-br from-emerald-50/50 to-teal-50/50 border-emerald-200/50">
            <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="p-2 bg-emerald-100 rounded-xl">
                            <Shield className="h-5 w-5 text-emerald-600" />
                        </div>
                        <div>
                            <CardTitle className="text-lg">Intégration CMU</CardTitle>
                            <p className="text-xs text-muted-foreground">Vérification couverture maladie universelle</p>
                        </div>
                    </div>
                    <Badge variant="outline" className="bg-emerald-100 text-emerald-700 border-emerald-200">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        API Connectée
                    </Badge>
                </div>
            </CardHeader>

            <CardContent className="space-y-4">
                {/* Search */}
                <div className="flex gap-2">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Numéro CMU (ex: CMU-2026-001234)"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10"
                            onKeyDown={(e) => e.key === 'Enter' && verifyPatient()}
                        />
                    </div>
                    <Button
                        onClick={verifyPatient}
                        disabled={isSearching}
                        className="bg-emerald-600 hover:bg-emerald-700"
                    >
                        {isSearching ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                            <>
                                <Search className="h-4 w-4 mr-2" />
                                Vérifier
                            </>
                        )}
                    </Button>
                </div>

                {/* Verified Patient Card */}
                {verifiedPatient && (
                    <div className="bg-white rounded-xl border border-emerald-200 overflow-hidden">
                        <div className="bg-emerald-50 p-4 border-b border-emerald-100">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 bg-emerald-200 rounded-full flex items-center justify-center">
                                        <User className="h-6 w-6 text-emerald-700" />
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-slate-900">{verifiedPatient.name}</h4>
                                        <p className="text-xs text-muted-foreground">{verifiedPatient.cmuNumber}</p>
                                    </div>
                                </div>
                                {getStatusBadge(verifiedPatient.status)}
                            </div>
                        </div>

                        <div className="p-4 space-y-4">
                            {/* Coverage Details */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-xs text-muted-foreground">Type de couverture</p>
                                    <p className="text-sm font-semibold">{getCoverageLabel(verifiedPatient.coverageType)}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground">Taux de remboursement</p>
                                    <p className="text-sm font-semibold text-emerald-600">{verifiedPatient.reimbursementRate}%</p>
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground">Date de naissance</p>
                                    <p className="text-sm font-semibold">{verifiedPatient.dateOfBirth}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground">Validité</p>
                                    <p className="text-sm font-semibold">{verifiedPatient.validUntil}</p>
                                </div>
                            </div>

                            {/* Budget Usage */}
                            <div className="bg-slate-50 rounded-lg p-3">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-xs font-medium text-muted-foreground">Plafond annuel utilisé</span>
                                    <span className="text-xs font-semibold">
                                        {verifiedPatient.usedAmount.toLocaleString()} / {verifiedPatient.annualLimit.toLocaleString()} FCFA
                                    </span>
                                </div>
                                <div className="h-3 bg-slate-200 rounded-full overflow-hidden">
                                    <div
                                        className={`h-full rounded-full transition-all ${usedPercentage >= 90 ? 'bg-red-500' :
                                                usedPercentage >= 70 ? 'bg-amber-500' : 'bg-emerald-500'
                                            }`}
                                        style={{ width: `${usedPercentage}%` }}
                                    />
                                </div>
                                <div className="flex items-center justify-between mt-2">
                                    <span className="text-xs text-muted-foreground">
                                        <Wallet className="h-3 w-3 inline mr-1" />
                                        Reste: {remainingBudget.toLocaleString()} FCFA
                                    </span>
                                    <span className="text-xs font-semibold text-emerald-600">
                                        {(100 - usedPercentage).toFixed(1)}% disponible
                                    </span>
                                </div>
                            </div>

                            <Button variant="outline" className="w-full">
                                <FileText className="h-4 w-4 mr-2" />
                                Voir l'historique des remboursements
                            </Button>
                        </div>
                    </div>
                )}

                {/* Recent Verifications */}
                <div>
                    <h4 className="text-sm font-semibold mb-2">Vérifications récentes</h4>
                    <div className="space-y-2">
                        {recentVerifications.map(patient => (
                            <div
                                key={patient.id}
                                className="flex items-center justify-between p-3 bg-white rounded-lg border border-slate-200 hover:border-emerald-200 cursor-pointer transition-colors"
                                onClick={() => {
                                    setSearchQuery(patient.cmuNumber);
                                    setVerifiedPatient(patient);
                                }}
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center">
                                        <User className="h-5 w-5 text-slate-500" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium">{patient.name}</p>
                                        <p className="text-xs text-muted-foreground">{patient.cmuNumber}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    {getStatusBadge(patient.status)}
                                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
