import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import {
    FileText, CheckCircle, XCircle, Clock, Search, Filter,
    Eye, AlertTriangle, Shield, User, Calendar, Pill,
    ThumbsUp, ThumbsDown, MessageSquare, Download
} from 'lucide-react'
import { toast } from 'sonner'

interface PrescriptionValidation {
    id: string
    orderId: string
    patientName: string
    patientCMU: string
    doctorName: string
    doctorRPPS: string
    prescriptionDate: string
    medications: {
        name: string
        quantity: number
        dosage: string
        covered: boolean
        rate: number
    }[]
    totalAmount: number
    coveredAmount: number
    status: 'pending' | 'approved' | 'rejected' | 'info_needed'
    submittedAt: string
    notes?: string
    rejectionReason?: string
}

export const PrescriptionValidationSection = () => {
    const [selectedTab, setSelectedTab] = useState('pending')
    const [searchQuery, setSearchQuery] = useState('')
    const [selectedPrescription, setSelectedPrescription] = useState<PrescriptionValidation | null>(null)
    const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false)
    const [rejectionReason, setRejectionReason] = useState('')

    // Mock data
    const [prescriptions] = useState<PrescriptionValidation[]>([
        {
            id: 'RX-001',
            orderId: 'CMD-2456',
            patientName: 'Kouamé Aya',
            patientCMU: 'CMU-2024-00456',
            doctorName: 'Dr. Koné Amadou',
            doctorRPPS: 'RPPS-123456',
            prescriptionDate: '2026-02-05',
            medications: [
                { name: 'Amoxicilline 500mg', quantity: 24, dosage: '3x/jour', covered: true, rate: 70 },
                { name: 'Paracétamol 1000mg', quantity: 16, dosage: '3x/jour', covered: true, rate: 35 }
            ],
            totalAmount: 18500,
            coveredAmount: 12950,
            status: 'pending',
            submittedAt: '2026-02-06T10:30:00'
        },
        {
            id: 'RX-002',
            orderId: 'CMD-2455',
            patientName: 'Traoré Ibrahim',
            patientCMU: 'CMU-2023-01234',
            doctorName: 'Dr. Bamba Fatou',
            doctorRPPS: 'RPPS-789012',
            prescriptionDate: '2026-02-04',
            medications: [
                { name: 'Insuline Lantus', quantity: 5, dosage: '1x/jour', covered: true, rate: 100 },
                { name: 'Metformine 500mg', quantity: 60, dosage: '2x/jour', covered: true, rate: 70 }
            ],
            totalAmount: 95000,
            coveredAmount: 85000,
            status: 'pending',
            submittedAt: '2026-02-06T09:15:00'
        },
        {
            id: 'RX-003',
            orderId: 'CMD-2454',
            patientName: 'Koné Fatou',
            patientCMU: 'CMU-2024-00789',
            doctorName: 'Dr. Diallo Moussa',
            doctorRPPS: 'RPPS-345678',
            prescriptionDate: '2026-02-03',
            medications: [
                { name: 'Vitamine C 500mg', quantity: 30, dosage: '1x/jour', covered: false, rate: 0 }
            ],
            totalAmount: 4500,
            coveredAmount: 0,
            status: 'rejected',
            submittedAt: '2026-02-05T14:00:00',
            rejectionReason: 'Produit non remboursable (complément alimentaire)'
        },
        {
            id: 'RX-004',
            orderId: 'CMD-2453',
            patientName: 'Bamba Moussa',
            patientCMU: 'CMU-2023-05678',
            doctorName: 'Dr. Koné Amadou',
            doctorRPPS: 'RPPS-123456',
            prescriptionDate: '2026-02-02',
            medications: [
                { name: 'Amlodipine 5mg', quantity: 30, dosage: '1x/jour', covered: true, rate: 70 }
            ],
            totalAmount: 8500,
            coveredAmount: 5950,
            status: 'approved',
            submittedAt: '2026-02-04T11:00:00'
        }
    ])

    const stats = {
        pending: prescriptions.filter(p => p.status === 'pending').length,
        approved: prescriptions.filter(p => p.status === 'approved').length,
        rejected: prescriptions.filter(p => p.status === 'rejected').length,
        totalVolume: prescriptions.filter(p => p.status === 'approved').reduce((sum, p) => sum + p.coveredAmount, 0)
    }

    const getStatusBadge = (status: string) => {
        const styles: Record<string, string> = {
            pending: 'bg-yellow-100 text-yellow-700 border-yellow-200',
            approved: 'bg-green-100 text-green-700 border-green-200',
            rejected: 'bg-red-100 text-red-700 border-red-200',
            info_needed: 'bg-blue-100 text-blue-700 border-blue-200'
        }
        const labels: Record<string, string> = {
            pending: 'En attente',
            approved: 'Approuvé',
            rejected: 'Rejeté',
            info_needed: 'Info requise'
        }
        return <Badge className={`${styles[status]} border text-xs`}>{labels[status]}</Badge>
    }

    const openDetail = (prescription: PrescriptionValidation) => {
        setSelectedPrescription(prescription)
        setIsDetailDialogOpen(true)
    }

    const handleApprove = (id: string) => {
        toast.success('Ordonnance approuvée', { description: 'Le remboursement sera traité' })
        setIsDetailDialogOpen(false)
    }

    const handleReject = (id: string) => {
        if (!rejectionReason) {
            toast.error('Veuillez spécifier un motif de rejet')
            return
        }
        toast.success('Ordonnance rejetée', { description: rejectionReason })
        setRejectionReason('')
        setIsDetailDialogOpen(false)
    }

    const filteredPrescriptions = prescriptions.filter(p => {
        const matchesSearch = p.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            p.id.toLowerCase().includes(searchQuery.toLowerCase())
        const matchesTab = selectedTab === 'all' || p.status === selectedTab
        return matchesSearch && matchesTab
    })

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-2xl font-black tracking-tight">Validation Ordonnances</h3>
                    <p className="text-sm text-muted-foreground">Vérifiez et approuvez les demandes de remboursement</p>
                </div>
                <Button variant="outline" className="rounded-xl">
                    <Download className="h-4 w-4 mr-2" /> Export
                </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="glass-card border-yellow-200 bg-yellow-50">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs text-muted-foreground font-bold uppercase">En attente</p>
                                <p className="text-3xl font-black text-yellow-700">{stats.pending}</p>
                            </div>
                            <Clock className="h-8 w-8 text-yellow-500" />
                        </div>
                    </CardContent>
                </Card>
                <Card className="glass-card border-green-200 bg-green-50">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs text-muted-foreground font-bold uppercase">Approuvées</p>
                                <p className="text-3xl font-black text-green-700">{stats.approved}</p>
                            </div>
                            <CheckCircle className="h-8 w-8 text-green-500" />
                        </div>
                    </CardContent>
                </Card>
                <Card className="glass-card border-red-200 bg-red-50">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs text-muted-foreground font-bold uppercase">Rejetées</p>
                                <p className="text-3xl font-black text-red-700">{stats.rejected}</p>
                            </div>
                            <XCircle className="h-8 w-8 text-red-500" />
                        </div>
                    </CardContent>
                </Card>
                <Card className="glass-card border-primary/20 bg-primary/5">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs text-muted-foreground font-bold uppercase">Volume approuvé</p>
                                <p className="text-2xl font-black text-primary">{stats.totalVolume.toLocaleString()} F</p>
                            </div>
                            <Shield className="h-8 w-8 text-primary" />
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Search */}
            <div className="flex gap-2">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Rechercher par patient ou référence..."
                        className="pl-9 rounded-xl"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <Button variant="outline" size="sm" className="rounded-xl">
                    <Filter className="h-4 w-4 mr-2" /> Filtrer
                </Button>
            </div>

            <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-4">
                <TabsList className="bg-white/50 p-1 rounded-xl">
                    <TabsTrigger value="pending" className="rounded-lg">En attente ({stats.pending})</TabsTrigger>
                    <TabsTrigger value="approved" className="rounded-lg">Approuvées ({stats.approved})</TabsTrigger>
                    <TabsTrigger value="rejected" className="rounded-lg">Rejetées ({stats.rejected})</TabsTrigger>
                    <TabsTrigger value="all" className="rounded-lg">Toutes</TabsTrigger>
                </TabsList>

                <TabsContent value={selectedTab} className="space-y-3">
                    {filteredPrescriptions.map((rx) => (
                        <Card key={rx.id} className="glass-card hover:shadow-lg transition-all cursor-pointer" onClick={() => openDetail(rx)}>
                            <CardContent className="p-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className={`p-3 rounded-xl ${rx.status === 'pending' ? 'bg-yellow-100' : rx.status === 'approved' ? 'bg-green-100' : 'bg-red-100'}`}>
                                            <FileText className={`h-5 w-5 ${rx.status === 'pending' ? 'text-yellow-600' : rx.status === 'approved' ? 'text-green-600' : 'text-red-600'}`} />
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <h4 className="font-bold">{rx.patientName}</h4>
                                                {getStatusBadge(rx.status)}
                                            </div>
                                            <p className="text-sm text-muted-foreground">
                                                {rx.id} • {rx.medications.length} médicament(s) • Dr. {rx.doctorName.split(' ').pop()}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-6">
                                        <div className="text-right">
                                            <p className="text-sm text-muted-foreground">Montant total</p>
                                            <p className="font-bold">{rx.totalAmount.toLocaleString()} F</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm text-muted-foreground">Part assurance</p>
                                            <p className="font-bold text-primary">{rx.coveredAmount.toLocaleString()} F</p>
                                        </div>
                                        <Eye className="h-5 w-5 text-muted-foreground" />
                                    </div>
                                </div>
                                {rx.rejectionReason && (
                                    <div className="mt-3 p-2 bg-red-50 rounded-lg text-sm text-red-600 flex items-center gap-2">
                                        <AlertTriangle className="h-4 w-4" />
                                        {rx.rejectionReason}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    ))}
                </TabsContent>
            </Tabs>

            {/* Detail Dialog */}
            <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <FileText className="h-5 w-5 text-primary" />
                            Validation Ordonnance {selectedPrescription?.id}
                        </DialogTitle>
                    </DialogHeader>
                    {selectedPrescription && (
                        <div className="space-y-6 py-4">
                            {/* Patient & Doctor Info */}
                            <div className="grid grid-cols-2 gap-4">
                                <Card className="p-4">
                                    <p className="text-xs text-muted-foreground uppercase font-bold mb-2">Patient</p>
                                    <div className="flex items-center gap-2">
                                        <User className="h-4 w-4 text-primary" />
                                        <span className="font-bold">{selectedPrescription.patientName}</span>
                                    </div>
                                    <p className="text-sm text-muted-foreground mt-1">CMU: {selectedPrescription.patientCMU}</p>
                                </Card>
                                <Card className="p-4">
                                    <p className="text-xs text-muted-foreground uppercase font-bold mb-2">Prescripteur</p>
                                    <div className="flex items-center gap-2">
                                        <Shield className="h-4 w-4 text-blue-600" />
                                        <span className="font-bold">{selectedPrescription.doctorName}</span>
                                    </div>
                                    <p className="text-sm text-muted-foreground mt-1">RPPS: {selectedPrescription.doctorRPPS}</p>
                                </Card>
                            </div>

                            {/* Medications */}
                            <div>
                                <p className="text-sm font-bold mb-3">Médicaments prescrits</p>
                                <div className="space-y-2">
                                    {selectedPrescription.medications.map((med, idx) => (
                                        <div key={idx} className="bg-gray-50 p-3 rounded-xl flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <Pill className="h-4 w-4 text-primary" />
                                                <div>
                                                    <p className="font-medium">{med.name}</p>
                                                    <p className="text-xs text-muted-foreground">{med.quantity} unités • {med.dosage}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                {med.covered ? (
                                                    <Badge className="bg-green-100 text-green-700">{med.rate}% couvert</Badge>
                                                ) : (
                                                    <Badge className="bg-gray-100 text-gray-700">Non couvert</Badge>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Totals */}
                            <div className="bg-primary/5 p-4 rounded-xl">
                                <div className="flex justify-between items-center mb-2">
                                    <span>Montant total</span>
                                    <span className="font-bold">{selectedPrescription.totalAmount.toLocaleString()} F</span>
                                </div>
                                <div className="flex justify-between items-center text-primary font-bold text-lg">
                                    <span>Part assurance</span>
                                    <span>{selectedPrescription.coveredAmount.toLocaleString()} F</span>
                                </div>
                            </div>

                            {/* Rejection Reason Input (for pending) */}
                            {selectedPrescription.status === 'pending' && (
                                <div className="space-y-2">
                                    <Label>Motif de rejet (si applicable)</Label>
                                    <Textarea
                                        placeholder="Saisissez le motif de rejet..."
                                        value={rejectionReason}
                                        onChange={(e) => setRejectionReason(e.target.value)}
                                    />
                                </div>
                            )}
                        </div>
                    )}
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsDetailDialogOpen(false)}>Fermer</Button>
                        {selectedPrescription?.status === 'pending' && (
                            <>
                                <Button
                                    variant="outline"
                                    className="text-red-600 hover:bg-red-50"
                                    onClick={() => handleReject(selectedPrescription.id)}
                                >
                                    <ThumbsDown className="h-4 w-4 mr-2" /> Rejeter
                                </Button>
                                <Button
                                    className="bg-green-600 hover:bg-green-700"
                                    onClick={() => handleApprove(selectedPrescription.id)}
                                >
                                    <ThumbsUp className="h-4 w-4 mr-2" /> Approuver
                                </Button>
                            </>
                        )}
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}

export default PrescriptionValidationSection
