import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import {
    Shield,
    FileText,
    User,
    Calendar,
    Search,
    Filter,
    Download,
    Eye,
    Edit,
    Trash2,
    CheckCircle,
    XCircle,
    AlertTriangle,
    Clock,
    RefreshCw,
    ChevronLeft,
    ChevronRight
} from 'lucide-react'

export type AuditAction =
    | 'create'
    | 'read'
    | 'update'
    | 'delete'
    | 'approve'
    | 'reject'
    | 'login'
    | 'logout'
    | 'export'

export type AuditResource =
    | 'claim'
    | 'prescription'
    | 'order'
    | 'patient'
    | 'pharmacy'
    | 'user'
    | 'report'
    | 'payment'

interface AuditEntry {
    id: string
    timestamp: string
    userId: string
    userName: string
    userRole: string
    action: AuditAction
    resource: AuditResource
    resourceId: string
    description: string
    ipAddress: string
    userAgent: string
    status: 'success' | 'failure' | 'pending'
    metadata?: Record<string, any>
}

const mockAuditLogs: AuditEntry[] = [
    {
        id: 'AUD001',
        timestamp: '2024-12-08T10:30:45Z',
        userId: 'usr-001',
        userName: 'Dr. Konan Yves',
        userRole: 'doctor',
        action: 'approve',
        resource: 'prescription',
        resourceId: 'PRE-2024-1234',
        description: 'Ordonnance approuvée pour patient Kouassi Marie',
        ipAddress: '192.168.1.45',
        userAgent: 'Chrome/120.0 Windows',
        status: 'success'
    },
    {
        id: 'AUD002',
        timestamp: '2024-12-08T10:28:12Z',
        userId: 'usr-002',
        userName: 'Pharmacie Centrale',
        userRole: 'pharmacy',
        action: 'update',
        resource: 'order',
        resourceId: 'CMD-2024-5678',
        description: 'Statut commande mis à jour: en_livraison',
        ipAddress: '192.168.1.100',
        userAgent: 'Safari/17.0 macOS',
        status: 'success'
    },
    {
        id: 'AUD003',
        timestamp: '2024-12-08T10:25:33Z',
        userId: 'usr-003',
        userName: 'MUGEFCI Admin',
        userRole: 'insurer',
        action: 'reject',
        resource: 'claim',
        resourceId: 'CLM-2024-9012',
        description: 'Demande rejetée: documents manquants',
        ipAddress: '41.207.45.12',
        userAgent: 'Firefox/121.0 Ubuntu',
        status: 'success'
    },
    {
        id: 'AUD004',
        timestamp: '2024-12-08T10:20:00Z',
        userId: 'usr-004',
        userName: 'System',
        userRole: 'system',
        action: 'export',
        resource: 'report',
        resourceId: 'RPT-2024-3456',
        description: 'Export rapport mensuel généré',
        ipAddress: '127.0.0.1',
        userAgent: 'System/1.0',
        status: 'success'
    },
    {
        id: 'AUD005',
        timestamp: '2024-12-08T10:15:22Z',
        userId: 'usr-005',
        userName: 'Kouassi Jean',
        userRole: 'driver',
        action: 'update',
        resource: 'order',
        resourceId: 'CMD-2024-7890',
        description: 'Livraison confirmée avec preuve photo',
        ipAddress: '41.207.128.45',
        userAgent: 'PharmaGo-Mobile/2.1 Android',
        status: 'success'
    },
    {
        id: 'AUD006',
        timestamp: '2024-12-08T10:10:05Z',
        userId: 'usr-006',
        userName: 'Unknown',
        userRole: 'anonymous',
        action: 'login',
        resource: 'user',
        resourceId: 'usr-006',
        description: 'Tentative de connexion échouée (mot de passe incorrect)',
        ipAddress: '41.207.200.99',
        userAgent: 'Chrome/120.0 Windows',
        status: 'failure'
    }
]

interface AuditTrailProps {
    resourceType?: AuditResource
    resourceId?: string
}

export const AuditTrail = ({ resourceType, resourceId }: AuditTrailProps) => {
    const [logs] = useState<AuditEntry[]>(mockAuditLogs)
    const [searchQuery, setSearchQuery] = useState('')
    const [actionFilter, setActionFilter] = useState<string>('all')
    const [statusFilter, setStatusFilter] = useState<string>('all')
    const [currentPage, setCurrentPage] = useState(1)
    const itemsPerPage = 10

    const getActionIcon = (action: AuditAction) => {
        const icons = {
            create: <FileText className="h-4 w-4 text-green-600" />,
            read: <Eye className="h-4 w-4 text-blue-600" />,
            update: <Edit className="h-4 w-4 text-orange-600" />,
            delete: <Trash2 className="h-4 w-4 text-red-600" />,
            approve: <CheckCircle className="h-4 w-4 text-green-600" />,
            reject: <XCircle className="h-4 w-4 text-red-600" />,
            login: <User className="h-4 w-4 text-blue-600" />,
            logout: <User className="h-4 w-4 text-slate-600" />,
            export: <Download className="h-4 w-4 text-purple-600" />
        }
        return icons[action]
    }

    const getActionLabel = (action: AuditAction) => {
        const labels = {
            create: 'Création',
            read: 'Lecture',
            update: 'Modification',
            delete: 'Suppression',
            approve: 'Approbation',
            reject: 'Rejet',
            login: 'Connexion',
            logout: 'Déconnexion',
            export: 'Export'
        }
        return labels[action]
    }

    const getStatusBadge = (status: AuditEntry['status']) => {
        const configs = {
            success: { color: 'bg-green-100 text-green-700 border-green-200', label: 'Succès' },
            failure: { color: 'bg-red-100 text-red-700 border-red-200', label: 'Échec' },
            pending: { color: 'bg-yellow-100 text-yellow-700 border-yellow-200', label: 'En attente' }
        }
        const config = configs[status]
        return (
            <Badge className={`${config.color} border text-[10px] font-bold`}>
                {config.label}
            </Badge>
        )
    }

    const getRoleBadge = (role: string) => {
        const colors: Record<string, string> = {
            doctor: 'bg-blue-100 text-blue-700',
            pharmacy: 'bg-green-100 text-green-700',
            patient: 'bg-purple-100 text-purple-700',
            driver: 'bg-orange-100 text-orange-700',
            insurer: 'bg-indigo-100 text-indigo-700',
            admin: 'bg-red-100 text-red-700',
            system: 'bg-slate-100 text-slate-700',
            anonymous: 'bg-gray-100 text-gray-700'
        }
        return (
            <Badge variant="outline" className={`${colors[role] || 'bg-slate-100'} text-[9px] font-bold`}>
                {role.toUpperCase()}
            </Badge>
        )
    }

    const filteredLogs = logs.filter(log => {
        const matchesSearch = log.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
            log.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            log.resourceId.toLowerCase().includes(searchQuery.toLowerCase())
        const matchesAction = actionFilter === 'all' || log.action === actionFilter
        const matchesStatus = statusFilter === 'all' || log.status === statusFilter
        const matchesResource = !resourceType || log.resource === resourceType
        const matchesResourceId = !resourceId || log.resourceId === resourceId

        return matchesSearch && matchesAction && matchesStatus && matchesResource && matchesResourceId
    })

    const formatTimestamp = (ts: string) => {
        const date = new Date(ts)
        return date.toLocaleString('fr-FR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        })
    }

    return (
        <div className="space-y-6">
            <Card className="glass-morphism border-white/20">
                <CardHeader>
                    <div className="flex justify-between items-center">
                        <div>
                            <CardTitle className="flex items-center gap-2">
                                <Shield className="h-5 w-5 text-primary" />
                                Piste d'Audit
                            </CardTitle>
                            <CardDescription>
                                Historique complet de toutes les actions sur la plateforme
                            </CardDescription>
                        </div>
                        <div className="flex gap-2">
                            <Button variant="outline" className="rounded-xl">
                                <RefreshCw className="h-4 w-4 mr-2" />
                                Actualiser
                            </Button>
                            <Button variant="outline" className="rounded-xl">
                                <Download className="h-4 w-4 mr-2" />
                                Exporter
                            </Button>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                    {/* Filters */}
                    <div className="flex flex-wrap gap-3">
                        <div className="relative flex-1 min-w-[200px]">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Rechercher..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10 rounded-xl"
                            />
                        </div>
                        <Select value={actionFilter} onValueChange={setActionFilter}>
                            <SelectTrigger className="w-40 rounded-xl">
                                <SelectValue placeholder="Action" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Toutes actions</SelectItem>
                                <SelectItem value="create">Création</SelectItem>
                                <SelectItem value="read">Lecture</SelectItem>
                                <SelectItem value="update">Modification</SelectItem>
                                <SelectItem value="delete">Suppression</SelectItem>
                                <SelectItem value="approve">Approbation</SelectItem>
                                <SelectItem value="reject">Rejet</SelectItem>
                            </SelectContent>
                        </Select>
                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                            <SelectTrigger className="w-36 rounded-xl">
                                <SelectValue placeholder="Statut" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Tous statuts</SelectItem>
                                <SelectItem value="success">Succès</SelectItem>
                                <SelectItem value="failure">Échec</SelectItem>
                                <SelectItem value="pending">En attente</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Logs Table */}
                    <div className="space-y-2">
                        {filteredLogs.map((log) => (
                            <div
                                key={log.id}
                                className={`p-4 rounded-xl border transition-all hover:shadow-md ${log.status === 'failure'
                                        ? 'bg-red-50/50 border-red-200/50'
                                        : 'bg-white/5 border-white/20'
                                    }`}
                            >
                                <div className="flex items-start gap-4">
                                    <div className="p-2 bg-white/30 rounded-lg">
                                        {getActionIcon(log.action)}
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <div className="flex flex-wrap items-center gap-2 mb-1">
                                            <span className="font-bold text-sm">{log.userName}</span>
                                            {getRoleBadge(log.userRole)}
                                            <Badge variant="outline" className="text-[9px]">
                                                {getActionLabel(log.action)}
                                            </Badge>
                                            {getStatusBadge(log.status)}
                                        </div>

                                        <p className="text-sm text-muted-foreground mb-2">
                                            {log.description}
                                        </p>

                                        <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
                                            <span className="flex items-center gap-1">
                                                <Clock className="h-3 w-3" />
                                                {formatTimestamp(log.timestamp)}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <FileText className="h-3 w-3" />
                                                {log.resourceId}
                                            </span>
                                            <span className="font-mono">{log.ipAddress}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Pagination */}
                    <div className="flex justify-between items-center pt-4">
                        <p className="text-sm text-muted-foreground">
                            {filteredLogs.length} entrées trouvées
                        </p>
                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                className="rounded-lg"
                                disabled={currentPage === 1}
                                onClick={() => setCurrentPage(p => p - 1)}
                            >
                                <ChevronLeft className="h-4 w-4" />
                            </Button>
                            <span className="px-3 py-1 bg-white/20 rounded-lg text-sm font-medium">
                                Page {currentPage}
                            </span>
                            <Button
                                variant="outline"
                                size="sm"
                                className="rounded-lg"
                                onClick={() => setCurrentPage(p => p + 1)}
                            >
                                <ChevronRight className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
