import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
    FolderHeart,
    Eye,
    Clock,
    User,
    Shield,
    AlertTriangle,
    Lock,
    Unlock,
    MapPin,
    FileText,
    CheckCircle,
    RefreshCw,
    Download,
    Settings
} from 'lucide-react'

interface AccessLogEntry {
    id: string
    timestamp: string
    accessorId: string
    accessorName: string
    accessorRole: 'doctor' | 'pharmacy' | 'insurer' | 'patient' | 'admin'
    accessorAvatar?: string
    patientId: string
    patientName: string
    sectionAccessed: 'prescriptions' | 'allergies' | 'history' | 'vaccinations' | 'lab_results' | 'notes'
    accessReason: string
    duration: number // seconds
    location: string
    authorized: boolean
}

const mockAccessLogs: AccessLogEntry[] = [
    {
        id: 'ECL001',
        timestamp: '2024-12-08T10:45:00Z',
        accessorId: 'doc-001',
        accessorName: 'Dr. Konan Yves',
        accessorRole: 'doctor',
        patientId: 'pat-001',
        patientName: 'Kouassi Aya Marie',
        sectionAccessed: 'prescriptions',
        accessReason: 'Consultation programmée',
        duration: 180,
        location: 'Clinique Farah, Cocody',
        authorized: true
    },
    {
        id: 'ECL002',
        timestamp: '2024-12-08T10:30:00Z',
        accessorId: 'pharm-001',
        accessorName: 'Pharmacie Centrale',
        accessorRole: 'pharmacy',
        patientId: 'pat-001',
        patientName: 'Kouassi Aya Marie',
        sectionAccessed: 'allergies',
        accessReason: 'Vérification allergies avant dispensation',
        duration: 45,
        location: 'Pharmacie Centrale, Plateau',
        authorized: true
    },
    {
        id: 'ECL003',
        timestamp: '2024-12-08T09:15:00Z',
        accessorId: 'ins-001',
        accessorName: 'MUGEFCI',
        accessorRole: 'insurer',
        patientId: 'pat-002',
        patientName: 'Bamba Moussa',
        sectionAccessed: 'history',
        accessReason: 'Validation remboursement',
        duration: 120,
        location: 'Siège MUGEFCI, Abidjan',
        authorized: true
    },
    {
        id: 'ECL004',
        timestamp: '2024-12-08T08:00:00Z',
        accessorId: 'doc-002',
        accessorName: 'Dr. Diallo Fatou',
        accessorRole: 'doctor',
        patientId: 'pat-003',
        patientName: 'Touré Ibrahim',
        sectionAccessed: 'lab_results',
        accessReason: 'Suivi post-opératoire',
        duration: 240,
        location: 'CHU Cocody',
        authorized: true
    },
    {
        id: 'ECL005',
        timestamp: '2024-12-07T16:30:00Z',
        accessorId: 'unknown',
        accessorName: 'Tentative non autorisée',
        accessorRole: 'patient',
        patientId: 'pat-004',
        patientName: 'Koné Aminata',
        sectionAccessed: 'notes',
        accessReason: 'Accès refusé - profil non lié',
        duration: 0,
        location: 'IP: 41.207.xxx.xxx',
        authorized: false
    }
]

const sectionLabels: Record<string, { label: string; icon: React.ElementType }> = {
    prescriptions: { label: 'Ordonnances', icon: FileText },
    allergies: { label: 'Allergies', icon: AlertTriangle },
    history: { label: 'Historique médical', icon: Clock },
    vaccinations: { label: 'Vaccinations', icon: Shield },
    lab_results: { label: 'Résultats labo', icon: FileText },
    notes: { label: 'Notes cliniques', icon: FileText }
}

const roleColors: Record<string, string> = {
    doctor: 'bg-blue-100 text-blue-700',
    pharmacy: 'bg-green-100 text-green-700',
    insurer: 'bg-indigo-100 text-indigo-700',
    patient: 'bg-purple-100 text-purple-700',
    admin: 'bg-red-100 text-red-700'
}

interface ECarnetAccessLogProps {
    patientId?: string
    showStats?: boolean
}

export const ECarnetAccessLog = ({ patientId, showStats = true }: ECarnetAccessLogProps) => {
    const [logs] = useState<AccessLogEntry[]>(
        patientId
            ? mockAccessLogs.filter(l => l.patientId === patientId)
            : mockAccessLogs
    )

    const formatDuration = (seconds: number) => {
        if (seconds === 0) return '-'
        if (seconds < 60) return `${seconds}s`
        const mins = Math.floor(seconds / 60)
        const secs = seconds % 60
        return secs > 0 ? `${mins}m ${secs}s` : `${mins}m`
    }

    const formatTimestamp = (ts: string) => {
        const date = new Date(ts)
        return date.toLocaleString('fr-FR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        })
    }

    const totalAccesses = logs.length
    const authorizedAccesses = logs.filter(l => l.authorized).length
    const uniqueAccessors = new Set(logs.map(l => l.accessorId)).size

    return (
        <div className="space-y-6">
            {showStats && (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Card className="glass-card border-blue-200/50 bg-blue-50/30">
                        <CardContent className="p-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-blue-500/10 rounded-xl">
                                    <Eye className="h-5 w-5 text-blue-600" />
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground font-bold">Total Accès</p>
                                    <p className="text-2xl font-black">{totalAccesses}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="glass-card border-green-200/50 bg-green-50/30">
                        <CardContent className="p-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-green-500/10 rounded-xl">
                                    <CheckCircle className="h-5 w-5 text-green-600" />
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground font-bold">Autorisés</p>
                                    <p className="text-2xl font-black">{authorizedAccesses}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="glass-card border-red-200/50 bg-red-50/30">
                        <CardContent className="p-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-red-500/10 rounded-xl">
                                    <Lock className="h-5 w-5 text-red-600" />
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground font-bold">Refusés</p>
                                    <p className="text-2xl font-black">{totalAccesses - authorizedAccesses}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="glass-card border-purple-200/50 bg-purple-50/30">
                        <CardContent className="p-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-purple-500/10 rounded-xl">
                                    <User className="h-5 w-5 text-purple-600" />
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground font-bold">Accédants</p>
                                    <p className="text-2xl font-black">{uniqueAccessors}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}

            <Card className="glass-morphism border-white/20">
                <CardHeader>
                    <div className="flex justify-between items-center">
                        <div>
                            <CardTitle className="flex items-center gap-2">
                                <FolderHeart className="h-5 w-5 text-primary" />
                                Journal d'accès E-Carnet
                            </CardTitle>
                            <CardDescription>
                                Traçabilité complète des consultations de dossiers médicaux
                            </CardDescription>
                        </div>
                        <div className="flex gap-2">
                            <Button variant="outline" size="sm" className="rounded-xl">
                                <RefreshCw className="h-4 w-4 mr-2" />
                                Actualiser
                            </Button>
                            <Button variant="outline" size="sm" className="rounded-xl">
                                <Download className="h-4 w-4 mr-2" />
                                Exporter
                            </Button>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="space-y-3">
                    {logs.map((log) => {
                        const SectionIcon = sectionLabels[log.sectionAccessed]?.icon || FileText

                        return (
                            <div
                                key={log.id}
                                className={`p-4 rounded-xl border transition-all ${log.authorized
                                        ? 'bg-white/5 border-white/20 hover:shadow-md'
                                        : 'bg-red-50/50 border-red-200/50'
                                    }`}
                            >
                                <div className="flex items-start gap-4">
                                    <Avatar className="h-10 w-10 border-2 border-white/40">
                                        <AvatarImage src={log.accessorAvatar} />
                                        <AvatarFallback className={`${roleColors[log.accessorRole]} font-bold text-xs`}>
                                            {log.accessorName.slice(0, 2).toUpperCase()}
                                        </AvatarFallback>
                                    </Avatar>

                                    <div className="flex-1 min-w-0">
                                        <div className="flex flex-wrap items-center gap-2 mb-1">
                                            <span className="font-bold text-sm">{log.accessorName}</span>
                                            <Badge className={`${roleColors[log.accessorRole]} text-[9px] font-bold`}>
                                                {log.accessorRole.toUpperCase()}
                                            </Badge>
                                            {log.authorized ? (
                                                <Badge className="bg-green-100 text-green-700 text-[9px]">
                                                    <Unlock className="h-3 w-3 mr-1" />
                                                    AUTORISÉ
                                                </Badge>
                                            ) : (
                                                <Badge className="bg-red-100 text-red-700 text-[9px]">
                                                    <Lock className="h-3 w-3 mr-1" />
                                                    REFUSÉ
                                                </Badge>
                                            )}
                                        </div>

                                        <div className="flex items-center gap-2 text-sm mb-2">
                                            <span className="text-muted-foreground">A consulté</span>
                                            <Badge variant="outline" className="font-medium">
                                                <SectionIcon className="h-3 w-3 mr-1" />
                                                {sectionLabels[log.sectionAccessed]?.label}
                                            </Badge>
                                            <span className="text-muted-foreground">de</span>
                                            <span className="font-medium text-primary">{log.patientName}</span>
                                        </div>

                                        <p className="text-xs text-muted-foreground italic mb-2">
                                            Motif: {log.accessReason}
                                        </p>

                                        <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
                                            <span className="flex items-center gap-1">
                                                <Clock className="h-3 w-3" />
                                                {formatTimestamp(log.timestamp)}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <Eye className="h-3 w-3" />
                                                Durée: {formatDuration(log.duration)}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <MapPin className="h-3 w-3" />
                                                {log.location}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )
                    })}
                </CardContent>
            </Card>
        </div>
    )
}
