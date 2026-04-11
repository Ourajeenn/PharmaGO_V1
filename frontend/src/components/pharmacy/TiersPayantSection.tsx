import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Progress } from '@/components/ui/progress'
import {
    CreditCard, Building, FileText, Send, CheckCircle, XCircle,
    Clock, DollarSign, TrendingUp, Filter, Download, Search,
    AlertTriangle, RefreshCw, Eye, ArrowUpRight, Loader2
} from 'lucide-react'
import { toast } from 'sonner'

interface PartnerInsurance {
    id: string
    name: string
    type: 'public' | 'private'
    conventionNumber: string
    status: 'active' | 'pending' | 'expired'
    reimbursementRate: number
    pendingClaims: number
    totalVolume: number
}

interface TierPayantTransaction {
    id: string
    date: string
    patient: string
    insuranceId: string
    insuranceName: string
    totalAmount: number
    patientPart: number
    insurancePart: number
    status: 'pending' | 'transmitted' | 'accepted' | 'rejected' | 'paid'
    rejectionReason?: string
}

export const TiersPayantSection = () => {
    const [activeTab, setActiveTab] = useState('dashboard')
    const [isTransmitDialogOpen, setIsTransmitDialogOpen] = useState(false)
    const [selectedTransactions, setSelectedTransactions] = useState<string[]>([])
    const [isTransmitting, setIsTransmitting] = useState(false)

    // Mock data
    const [partners] = useState<PartnerInsurance[]>([
        { id: '1', name: 'CMU (Assurance Maladie Universelle)', type: 'public', conventionNumber: 'CMU-2024-001', status: 'active', reimbursementRate: 70, pendingClaims: 12, totalVolume: 2450000 },
        { id: '2', name: 'NSIA Assurances', type: 'private', conventionNumber: 'NSIA-2023-456', status: 'active', reimbursementRate: 80, pendingClaims: 5, totalVolume: 1800000 },
        { id: '3', name: 'Allianz Côte d\'Ivoire', type: 'private', conventionNumber: 'ALZ-2024-123', status: 'active', reimbursementRate: 75, pendingClaims: 8, totalVolume: 950000 },
        { id: '4', name: 'SAHAM Assurance', type: 'private', conventionNumber: 'SAH-2023-789', status: 'pending', reimbursementRate: 65, pendingClaims: 0, totalVolume: 0 }
    ])

    const [transactions] = useState<TierPayantTransaction[]>([
        { id: 'TP001', date: '2026-02-06', patient: 'Kouamé Aya', insuranceId: '1', insuranceName: 'CMU', totalAmount: 45000, patientPart: 13500, insurancePart: 31500, status: 'pending' },
        { id: 'TP002', date: '2026-02-06', patient: 'Traoré Ibrahim', insuranceId: '2', insuranceName: 'NSIA', totalAmount: 78000, patientPart: 15600, insurancePart: 62400, status: 'transmitted' },
        { id: 'TP003', date: '2026-02-05', patient: 'Koné Fatou', insuranceId: '1', insuranceName: 'CMU', totalAmount: 32000, patientPart: 9600, insurancePart: 22400, status: 'accepted' },
        { id: 'TP004', date: '2026-02-05', patient: 'Bamba Moussa', insuranceId: '3', insuranceName: 'Allianz', totalAmount: 125000, patientPart: 31250, insurancePart: 93750, status: 'paid' },
        { id: 'TP005', date: '2026-02-04', patient: 'Diallo Aminata', insuranceId: '2', insuranceName: 'NSIA', totalAmount: 55000, patientPart: 11000, insurancePart: 44000, status: 'rejected', rejectionReason: 'Ordonnance expirée' }
    ])

    const stats = {
        pendingTransmission: transactions.filter(t => t.status === 'pending').length,
        transmitted: transactions.filter(t => t.status === 'transmitted').length,
        pendingPayment: transactions.filter(t => t.status === 'accepted').reduce((sum, t) => sum + t.insurancePart, 0),
        paidThisMonth: transactions.filter(t => t.status === 'paid').reduce((sum, t) => sum + t.insurancePart, 0)
    }

    const getStatusBadge = (status: string) => {
        const styles: Record<string, string> = {
            pending: 'bg-yellow-100 text-yellow-700 border-yellow-200',
            transmitted: 'bg-blue-100 text-blue-700 border-blue-200',
            accepted: 'bg-green-100 text-green-700 border-green-200',
            rejected: 'bg-red-100 text-red-700 border-red-200',
            paid: 'bg-emerald-100 text-emerald-700 border-emerald-200',
            active: 'bg-green-100 text-green-700 border-green-200',
            expired: 'bg-red-100 text-red-700 border-red-200'
        }
        const labels: Record<string, string> = {
            pending: 'En attente',
            transmitted: 'Transmis',
            accepted: 'Accepté',
            rejected: 'Rejeté',
            paid: 'Payé',
            active: 'Actif',
            expired: 'Expiré'
        }
        return <Badge className={`${styles[status]} border text-xs`}>{labels[status]}</Badge>
    }

    const handleTransmit = async () => {
        setIsTransmitting(true)
        await new Promise(resolve => setTimeout(resolve, 2000))
        setIsTransmitting(false)
        setIsTransmitDialogOpen(false)
        toast.success('Télétransmission effectuée', { description: `${selectedTransactions.length} facture(s) envoyée(s)` })
        setSelectedTransactions([])
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-2xl font-black tracking-tight">Tiers Payant</h3>
                    <p className="text-sm text-muted-foreground">Gestion des conventions et télétransmission</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" className="rounded-xl">
                        <Download className="h-4 w-4 mr-2" /> Export
                    </Button>
                    <Button
                        className="rounded-xl"
                        onClick={() => setIsTransmitDialogOpen(true)}
                        disabled={transactions.filter(t => t.status === 'pending').length === 0}
                    >
                        <Send className="h-4 w-4 mr-2" /> Télétransmettre
                    </Button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="glass-card border-yellow-200 bg-yellow-50">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs text-muted-foreground font-bold uppercase">À transmettre</p>
                                <p className="text-3xl font-black text-yellow-700">{stats.pendingTransmission}</p>
                            </div>
                            <Clock className="h-8 w-8 text-yellow-500" />
                        </div>
                    </CardContent>
                </Card>
                <Card className="glass-card border-blue-200 bg-blue-50">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs text-muted-foreground font-bold uppercase">En traitement</p>
                                <p className="text-3xl font-black text-blue-700">{stats.transmitted}</p>
                            </div>
                            <RefreshCw className="h-8 w-8 text-blue-500" />
                        </div>
                    </CardContent>
                </Card>
                <Card className="glass-card border-orange-200 bg-orange-50">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs text-muted-foreground font-bold uppercase">À encaisser</p>
                                <p className="text-2xl font-black text-orange-700">{stats.pendingPayment.toLocaleString()} F</p>
                            </div>
                            <DollarSign className="h-8 w-8 text-orange-500" />
                        </div>
                    </CardContent>
                </Card>
                <Card className="glass-card border-green-200 bg-green-50">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs text-muted-foreground font-bold uppercase">Encaissé ce mois</p>
                                <p className="text-2xl font-black text-green-700">{stats.paidThisMonth.toLocaleString()} F</p>
                            </div>
                            <TrendingUp className="h-8 w-8 text-green-500" />
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                <TabsList className="bg-white/50 p-1 rounded-xl">
                    <TabsTrigger value="dashboard" className="rounded-lg">Tableau de bord</TabsTrigger>
                    <TabsTrigger value="transactions" className="rounded-lg">Transactions</TabsTrigger>
                    <TabsTrigger value="partners" className="rounded-lg">Partenaires</TabsTrigger>
                    <TabsTrigger value="rejections" className="rounded-lg">Rejets</TabsTrigger>
                </TabsList>

                {/* Transactions Tab */}
                <TabsContent value="transactions" className="space-y-4">
                    <div className="flex gap-2 items-center">
                        <div className="relative flex-1 max-w-sm">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input placeholder="Rechercher..." className="pl-9 rounded-xl" />
                        </div>
                        <Button variant="outline" size="sm" className="rounded-xl">
                            <Filter className="h-4 w-4 mr-2" /> Filtrer
                        </Button>
                    </div>
                    <div className="space-y-3">
                        {transactions.map((tx) => (
                            <Card key={tx.id} className="glass-card">
                                <CardContent className="p-4">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <input
                                                type="checkbox"
                                                className="rounded"
                                                checked={selectedTransactions.includes(tx.id)}
                                                onChange={(e) => {
                                                    if (e.target.checked) {
                                                        setSelectedTransactions([...selectedTransactions, tx.id])
                                                    } else {
                                                        setSelectedTransactions(selectedTransactions.filter(id => id !== tx.id))
                                                    }
                                                }}
                                                disabled={tx.status !== 'pending'}
                                            />
                                            <div>
                                                <p className="font-bold">{tx.patient}</p>
                                                <p className="text-sm text-muted-foreground">{tx.insuranceName} • {tx.date}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-6">
                                            <div className="text-right">
                                                <p className="text-sm text-muted-foreground">Total</p>
                                                <p className="font-bold">{tx.totalAmount.toLocaleString()} F</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-sm text-muted-foreground">Part assurance</p>
                                                <p className="font-bold text-primary">{tx.insurancePart.toLocaleString()} F</p>
                                            </div>
                                            {getStatusBadge(tx.status)}
                                        </div>
                                    </div>
                                    {tx.rejectionReason && (
                                        <div className="mt-3 p-2 bg-red-50 rounded-lg text-sm text-red-600 flex items-center gap-2">
                                            <AlertTriangle className="h-4 w-4" />
                                            {tx.rejectionReason}
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </TabsContent>

                {/* Partners Tab */}
                <TabsContent value="partners" className="space-y-4">
                    <div className="grid gap-4">
                        {partners.map((partner) => (
                            <Card key={partner.id} className="glass-card">
                                <CardContent className="p-4">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className={`p-3 rounded-xl ${partner.type === 'public' ? 'bg-blue-100' : 'bg-purple-100'}`}>
                                                <Building className={`h-5 w-5 ${partner.type === 'public' ? 'text-blue-600' : 'text-purple-600'}`} />
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <h4 className="font-bold">{partner.name}</h4>
                                                    {getStatusBadge(partner.status)}
                                                </div>
                                                <p className="text-sm text-muted-foreground">Convention: {partner.conventionNumber}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-6">
                                            <div className="text-center">
                                                <p className="text-2xl font-black text-primary">{partner.reimbursementRate}%</p>
                                                <p className="text-xs text-muted-foreground">Taux remb.</p>
                                            </div>
                                            <div className="text-center">
                                                <p className="text-2xl font-black">{partner.pendingClaims}</p>
                                                <p className="text-xs text-muted-foreground">En attente</p>
                                            </div>
                                            <div className="text-center">
                                                <p className="text-lg font-bold">{(partner.totalVolume / 1000000).toFixed(1)}M F</p>
                                                <p className="text-xs text-muted-foreground">Volume total</p>
                                            </div>
                                            <Button variant="ghost" size="icon">
                                                <Eye className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </TabsContent>

                {/* Dashboard Tab */}
                <TabsContent value="dashboard" className="space-y-4">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <Card className="glass-card">
                            <CardHeader>
                                <CardTitle className="text-lg">Répartition par assurance</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {partners.filter(p => p.status === 'active').map((partner) => (
                                    <div key={partner.id} className="space-y-2">
                                        <div className="flex justify-between text-sm">
                                            <span className="font-medium">{partner.name}</span>
                                            <span className="text-muted-foreground">{(partner.totalVolume / 1000).toFixed(0)}K F</span>
                                        </div>
                                        <Progress value={(partner.totalVolume / 2500000) * 100} className="h-2" />
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                        <Card className="glass-card">
                            <CardHeader>
                                <CardTitle className="text-lg">Actions rapides</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <Button variant="outline" className="w-full justify-between rounded-xl">
                                    <span className="flex items-center gap-2">
                                        <FileText className="h-4 w-4" /> Générer bordereau
                                    </span>
                                    <ArrowUpRight className="h-4 w-4" />
                                </Button>
                                <Button variant="outline" className="w-full justify-between rounded-xl">
                                    <span className="flex items-center gap-2">
                                        <Download className="h-4 w-4" /> Télécharger relevé
                                    </span>
                                    <ArrowUpRight className="h-4 w-4" />
                                </Button>
                                <Button variant="outline" className="w-full justify-between rounded-xl">
                                    <span className="flex items-center gap-2">
                                        <RefreshCw className="h-4 w-4" /> Synchroniser statuts
                                    </span>
                                    <ArrowUpRight className="h-4 w-4" />
                                </Button>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                {/* Rejections Tab */}
                <TabsContent value="rejections" className="space-y-4">
                    {transactions.filter(t => t.status === 'rejected').length === 0 ? (
                        <Card className="glass-card">
                            <CardContent className="p-8 text-center">
                                <CheckCircle className="h-12 w-12 mx-auto text-green-500 mb-4" />
                                <p className="font-bold">Aucun rejet en attente</p>
                                <p className="text-sm text-muted-foreground">Toutes vos factures ont été acceptées</p>
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="space-y-3">
                            {transactions.filter(t => t.status === 'rejected').map((tx) => (
                                <Card key={tx.id} className="glass-card border-red-200">
                                    <CardContent className="p-4">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="font-bold">{tx.patient}</p>
                                                <p className="text-sm text-muted-foreground">{tx.insuranceName} • {tx.totalAmount.toLocaleString()} F</p>
                                                <p className="text-sm text-red-600 mt-1 flex items-center gap-1">
                                                    <AlertTriangle className="h-3 w-3" />
                                                    {tx.rejectionReason}
                                                </p>
                                            </div>
                                            <Button variant="outline" className="rounded-xl">
                                                Corriger et renvoyer
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}
                </TabsContent>
            </Tabs>

            {/* Transmit Dialog */}
            <Dialog open={isTransmitDialogOpen} onOpenChange={setIsTransmitDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Send className="h-5 w-5 text-primary" />
                            Télétransmission
                        </DialogTitle>
                    </DialogHeader>
                    <div className="py-4">
                        <p className="text-sm text-muted-foreground mb-4">
                            {transactions.filter(t => t.status === 'pending').length} facture(s) prête(s) à être transmise(s).
                        </p>
                        <div className="bg-blue-50 p-4 rounded-xl">
                            <p className="font-bold text-blue-700">
                                Montant total: {transactions.filter(t => t.status === 'pending').reduce((sum, t) => sum + t.insurancePart, 0).toLocaleString()} F
                            </p>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsTransmitDialogOpen(false)}>Annuler</Button>
                        <Button onClick={handleTransmit} disabled={isTransmitting}>
                            {isTransmitting ? (
                                <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Envoi en cours...</>
                            ) : (
                                <><Send className="h-4 w-4 mr-2" /> Transmettre</>
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}

export default TiersPayantSection
