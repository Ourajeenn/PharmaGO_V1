import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Progress } from '@/components/ui/progress'
import {
    Shield,
    CheckCircle,
    XCircle,
    AlertTriangle,
    Search,
    User,
    Calendar,
    CreditCard,
    FileText,
    RefreshCw,
    Eye,
    Clock,
    Building2
} from 'lucide-react'
import { toast } from 'sonner'

interface CoverageDetails {
    patientId: string
    patientName: string
    cmuNumber: string
    coverageType: 'basic' | 'extended' | 'premium'
    status: 'active' | 'expired' | 'suspended' | 'pending'
    validFrom: string
    validUntil: string
    reimbursementRate: number
    annualBudget: number
    usedBudget: number
    remainingBudget: number
    lastVerification: string
    insurerName: string
    policyNumber: string
}

interface VerificationResult {
    verified: boolean
    timestamp: string
    details?: CoverageDetails
    error?: string
}

interface CoverageVerificationProps {
    patientId?: string
    onVerified?: (result: VerificationResult) => void
}

export const CoverageVerificationAPI = ({ patientId, onVerified }: CoverageVerificationProps) => {
    const [cmuNumber, setCmuNumber] = useState('')
    const [isVerifying, setIsVerifying] = useState(false)
    const [verificationResult, setVerificationResult] = useState<VerificationResult | null>(null)
    const [recentVerifications, setRecentVerifications] = useState<VerificationResult[]>([])

    // Simulated API call
    const verifyCoverage = async () => {
        if (!cmuNumber.trim()) {
            toast.error('Veuillez entrer un numéro CMU')
            return
        }

        setIsVerifying(true)

        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1500))

        // Mock verification result
        const mockResult: VerificationResult = {
            verified: cmuNumber.startsWith('CMU'),
            timestamp: new Date().toISOString(),
            details: cmuNumber.startsWith('CMU') ? {
                patientId: 'pat-' + Math.random().toString(36).substr(2, 9),
                patientName: 'Kouassi Aya Marie',
                cmuNumber: cmuNumber,
                coverageType: 'extended',
                status: 'active',
                validFrom: '2024-01-01',
                validUntil: '2024-12-31',
                reimbursementRate: 80,
                annualBudget: 500000,
                usedBudget: 125000,
                remainingBudget: 375000,
                lastVerification: new Date().toISOString(),
                insurerName: 'MUGEFCI',
                policyNumber: 'POL-2024-' + Math.random().toString().substr(2, 6)
            } : undefined,
            error: !cmuNumber.startsWith('CMU') ? 'Numéro CMU non reconnu dans le système' : undefined
        }

        setVerificationResult(mockResult)
        setRecentVerifications(prev => [mockResult, ...prev.slice(0, 4)])
        onVerified?.(mockResult)

        if (mockResult.verified) {
            toast.success('Couverture vérifiée avec succès')
        } else {
            toast.error('Vérification échouée: ' + mockResult.error)
        }

        setIsVerifying(false)
    }

    const getStatusBadge = (status: CoverageDetails['status']) => {
        const configs = {
            active: { color: 'bg-green-100 text-green-700 border-green-200', icon: CheckCircle, label: 'Actif' },
            expired: { color: 'bg-red-100 text-red-700 border-red-200', icon: XCircle, label: 'Expiré' },
            suspended: { color: 'bg-orange-100 text-orange-700 border-orange-200', icon: AlertTriangle, label: 'Suspendu' },
            pending: { color: 'bg-yellow-100 text-yellow-700 border-yellow-200', icon: Clock, label: 'En attente' }
        }
        const config = configs[status]
        const Icon = config.icon
        return (
            <Badge className={`${config.color} border font-bold`}>
                <Icon className="h-3 w-3 mr-1" />
                {config.label}
            </Badge>
        )
    }

    const getCoverageTypeBadge = (type: CoverageDetails['coverageType']) => {
        const configs = {
            basic: { color: 'bg-slate-100 text-slate-700', label: 'Basique' },
            extended: { color: 'bg-blue-100 text-blue-700', label: 'Étendue' },
            premium: { color: 'bg-purple-100 text-purple-700', label: 'Premium' }
        }
        const config = configs[type]
        return (
            <Badge className={`${config.color} text-xs font-bold`}>
                {config.label}
            </Badge>
        )
    }

    return (
        <div className="space-y-6">
            {/* Verification Card */}
            <Card className="glass-morphism border-white/20">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Shield className="h-5 w-5 text-primary" />
                        Vérification de Couverture
                    </CardTitle>
                    <CardDescription>
                        Vérifiez l'éligibilité et les détails de couverture d'un patient
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex gap-3">
                        <div className="relative flex-1">
                            <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Numéro CMU (ex: CMU123456789)"
                                value={cmuNumber}
                                onChange={(e) => setCmuNumber(e.target.value.toUpperCase())}
                                className="pl-10 rounded-xl font-mono"
                            />
                        </div>
                        <Button
                            onClick={verifyCoverage}
                            disabled={isVerifying}
                            className="rounded-xl px-6"
                        >
                            {isVerifying ? (
                                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                            ) : (
                                <Search className="h-4 w-4 mr-2" />
                            )}
                            Vérifier
                        </Button>
                    </div>

                    {/* Verification Result */}
                    {verificationResult && (
                        <div className={`p-4 rounded-xl border ${verificationResult.verified
                                ? 'bg-green-50/50 border-green-200'
                                : 'bg-red-50/50 border-red-200'
                            }`}>
                            {verificationResult.verified && verificationResult.details ? (
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-green-500 rounded-full">
                                                <CheckCircle className="h-5 w-5 text-white" />
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-lg">{verificationResult.details.patientName}</h4>
                                                <p className="text-sm text-muted-foreground font-mono">{verificationResult.details.cmuNumber}</p>
                                            </div>
                                        </div>
                                        <div className="flex gap-2">
                                            {getCoverageTypeBadge(verificationResult.details.coverageType)}
                                            {getStatusBadge(verificationResult.details.status)}
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                        <div className="p-3 bg-white/50 rounded-xl">
                                            <p className="text-[10px] font-bold text-muted-foreground uppercase">Taux Remboursement</p>
                                            <p className="text-xl font-black text-primary">{verificationResult.details.reimbursementRate}%</p>
                                        </div>
                                        <div className="p-3 bg-white/50 rounded-xl">
                                            <p className="text-[10px] font-bold text-muted-foreground uppercase">Budget Restant</p>
                                            <p className="text-xl font-black text-green-600">{verificationResult.details.remainingBudget.toLocaleString()} F</p>
                                        </div>
                                        <div className="p-3 bg-white/50 rounded-xl">
                                            <p className="text-[10px] font-bold text-muted-foreground uppercase">Validité</p>
                                            <p className="text-sm font-bold">{verificationResult.details.validUntil}</p>
                                        </div>
                                        <div className="p-3 bg-white/50 rounded-xl">
                                            <p className="text-[10px] font-bold text-muted-foreground uppercase">Assureur</p>
                                            <p className="text-sm font-bold">{verificationResult.details.insurerName}</p>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <div className="flex justify-between text-sm">
                                            <span>Budget annuel utilisé</span>
                                            <span className="font-bold">
                                                {verificationResult.details.usedBudget.toLocaleString()} / {verificationResult.details.annualBudget.toLocaleString()} F
                                            </span>
                                        </div>
                                        <Progress
                                            value={(verificationResult.details.usedBudget / verificationResult.details.annualBudget) * 100}
                                            className="h-3"
                                        />
                                    </div>
                                </div>
                            ) : (
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-red-500 rounded-full">
                                        <XCircle className="h-5 w-5 text-white" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-red-700">Vérification Échouée</h4>
                                        <p className="text-sm text-red-600">{verificationResult.error}</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Recent Verifications */}
            {recentVerifications.length > 0 && (
                <Card className="glass-morphism border-white/20">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-lg">
                            <Clock className="h-4 w-4" />
                            Vérifications Récentes
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        {recentVerifications.map((result, idx) => (
                            <div
                                key={idx}
                                className={`flex items-center justify-between p-3 rounded-xl border ${result.verified ? 'border-green-200/50' : 'border-red-200/50'
                                    }`}
                            >
                                <div className="flex items-center gap-3">
                                    {result.verified ? (
                                        <CheckCircle className="h-4 w-4 text-green-600" />
                                    ) : (
                                        <XCircle className="h-4 w-4 text-red-600" />
                                    )}
                                    <div>
                                        <p className="font-medium text-sm">
                                            {result.details?.cmuNumber || 'N/A'}
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            {new Date(result.timestamp).toLocaleString('fr-FR')}
                                        </p>
                                    </div>
                                </div>
                                {result.details && (
                                    <Badge variant="outline" className="text-xs">
                                        {result.details.patientName}
                                    </Badge>
                                )}
                            </div>
                        ))}
                    </CardContent>
                </Card>
            )}
        </div>
    )
}
