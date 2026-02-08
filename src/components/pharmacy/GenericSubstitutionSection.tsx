import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import {
    Pill, ArrowRightLeft, Search, CheckCircle, XCircle,
    DollarSign, TrendingDown, Info, AlertTriangle, Filter,
    RefreshCw, Eye, ChevronRight, Sparkles
} from 'lucide-react'
import { toast } from 'sonner'

interface Medication {
    id: string
    brandName: string
    genericName: string
    dosage: string
    form: string
    brandPrice: number
    genericPrice: number
    savings: number
    savingsPercent: number
    inStock: boolean
    prescriptionRequired: boolean
}

interface SubstitutionRequest {
    id: string
    orderId: string
    patient: string
    originalMed: string
    suggestedGeneric: string
    brandPrice: number
    genericPrice: number
    status: 'pending' | 'accepted' | 'rejected'
    date: string
}

export const GenericSubstitutionSection = () => {
    const [searchQuery, setSearchQuery] = useState('')
    const [isSubstitutionDialogOpen, setIsSubstitutionDialogOpen] = useState(false)
    const [selectedMed, setSelectedMed] = useState<Medication | null>(null)
    const [autoSubstitute, setAutoSubstitute] = useState(true)

    // Mock data
    const [medications] = useState<Medication[]>([
        { id: '1', brandName: 'Doliprane', genericName: 'Paracétamol', dosage: '1000mg', form: 'Comprimé', brandPrice: 3500, genericPrice: 1200, savings: 2300, savingsPercent: 66, inStock: true, prescriptionRequired: false },
        { id: '2', brandName: 'Augmentin', genericName: 'Amoxicilline + Acide clavulanique', dosage: '1g/125mg', form: 'Comprimé', brandPrice: 12500, genericPrice: 6800, savings: 5700, savingsPercent: 46, inStock: true, prescriptionRequired: true },
        { id: '3', brandName: 'Advil', genericName: 'Ibuprofène', dosage: '400mg', form: 'Comprimé', brandPrice: 4200, genericPrice: 1800, savings: 2400, savingsPercent: 57, inStock: true, prescriptionRequired: false },
        { id: '4', brandName: 'Spasfon', genericName: 'Phloroglucinol', dosage: '80mg', form: 'Comprimé', brandPrice: 5800, genericPrice: 2500, savings: 3300, savingsPercent: 57, inStock: false, prescriptionRequired: false },
        { id: '5', brandName: 'Voltarène', genericName: 'Diclofénac', dosage: '50mg', form: 'Comprimé', brandPrice: 6500, genericPrice: 2200, savings: 4300, savingsPercent: 66, inStock: true, prescriptionRequired: true },
        { id: '6', brandName: 'Inexium', genericName: 'Esoméprazole', dosage: '20mg', form: 'Gélule', brandPrice: 18500, genericPrice: 7500, savings: 11000, savingsPercent: 59, inStock: true, prescriptionRequired: true }
    ])

    const [substitutionRequests] = useState<SubstitutionRequest[]>([
        { id: 'S001', orderId: 'CMD-2456', patient: 'Kouamé Aya', originalMed: 'Doliprane 1000mg', suggestedGeneric: 'Paracétamol 1000mg', brandPrice: 3500, genericPrice: 1200, status: 'pending', date: '2026-02-06' },
        { id: 'S002', orderId: 'CMD-2455', patient: 'Traoré Ibrahim', originalMed: 'Augmentin 1g', suggestedGeneric: 'Amoxicilline/Ac.Clav 1g', brandPrice: 12500, genericPrice: 6800, status: 'accepted', date: '2026-02-06' },
        { id: 'S003', orderId: 'CMD-2454', patient: 'Koné Fatou', originalMed: 'Voltarène 50mg', suggestedGeneric: 'Diclofénac 50mg', brandPrice: 6500, genericPrice: 2200, status: 'rejected', date: '2026-02-05' }
    ])

    const stats = {
        totalSavingsThisMonth: 285000,
        substitutionsCount: 45,
        acceptanceRate: 78,
        avgSavingsPercent: 55
    }

    const filteredMedications = medications.filter(med =>
        med.brandName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        med.genericName.toLowerCase().includes(searchQuery.toLowerCase())
    )

    const openSubstitutionDialog = (med: Medication) => {
        setSelectedMed(med)
        setIsSubstitutionDialogOpen(true)
    }

    const handleSubstitution = (request: SubstitutionRequest, accept: boolean) => {
        toast.success(accept ? 'Substitution acceptée' : 'Substitution refusée')
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-2xl font-black tracking-tight">Substitution Générique</h3>
                    <p className="text-sm text-muted-foreground">Proposez des alternatives économiques à vos patients</p>
                </div>
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 bg-white/50 px-4 py-2 rounded-xl">
                        <Label htmlFor="auto-sub" className="text-sm">Substitution auto</Label>
                        <Switch
                            id="auto-sub"
                            checked={autoSubstitute}
                            onCheckedChange={setAutoSubstitute}
                        />
                    </div>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="glass-card border-green-200 bg-gradient-to-br from-green-50 to-emerald-50">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs text-muted-foreground font-bold uppercase">Économies ce mois</p>
                                <p className="text-2xl font-black text-green-700">{stats.totalSavingsThisMonth.toLocaleString()} F</p>
                            </div>
                            <DollarSign className="h-8 w-8 text-green-500" />
                        </div>
                    </CardContent>
                </Card>
                <Card className="glass-card border-blue-200 bg-blue-50">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs text-muted-foreground font-bold uppercase">Substitutions</p>
                                <p className="text-3xl font-black text-blue-700">{stats.substitutionsCount}</p>
                            </div>
                            <ArrowRightLeft className="h-8 w-8 text-blue-500" />
                        </div>
                    </CardContent>
                </Card>
                <Card className="glass-card border-purple-200 bg-purple-50">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs text-muted-foreground font-bold uppercase">Taux acceptation</p>
                                <p className="text-3xl font-black text-purple-700">{stats.acceptanceRate}%</p>
                            </div>
                            <CheckCircle className="h-8 w-8 text-purple-500" />
                        </div>
                    </CardContent>
                </Card>
                <Card className="glass-card border-orange-200 bg-orange-50">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs text-muted-foreground font-bold uppercase">Économie moyenne</p>
                                <p className="text-3xl font-black text-orange-700">{stats.avgSavingsPercent}%</p>
                            </div>
                            <TrendingDown className="h-8 w-8 text-orange-500" />
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Pending Substitution Requests */}
            {substitutionRequests.filter(r => r.status === 'pending').length > 0 && (
                <Card className="glass-card border-yellow-300 bg-yellow-50">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-lg flex items-center gap-2">
                            <Sparkles className="h-5 w-5 text-yellow-600" />
                            Demandes de substitution en attente
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        {substitutionRequests.filter(r => r.status === 'pending').map((request) => (
                            <div key={request.id} className="bg-white p-4 rounded-xl flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="p-2 bg-yellow-100 rounded-lg">
                                        <ArrowRightLeft className="h-5 w-5 text-yellow-600" />
                                    </div>
                                    <div>
                                        <p className="font-bold">{request.patient}</p>
                                        <p className="text-sm text-muted-foreground">
                                            {request.originalMed} → {request.suggestedGeneric}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="text-right">
                                        <p className="text-sm line-through text-muted-foreground">{request.brandPrice.toLocaleString()} F</p>
                                        <p className="font-bold text-green-600">{request.genericPrice.toLocaleString()} F</p>
                                    </div>
                                    <Badge className="bg-green-100 text-green-700 border-green-200">
                                        -{Math.round((1 - request.genericPrice / request.brandPrice) * 100)}%
                                    </Badge>
                                    <div className="flex gap-2">
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            className="rounded-lg text-red-600 hover:bg-red-50"
                                            onClick={() => handleSubstitution(request, false)}
                                        >
                                            <XCircle className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            size="sm"
                                            className="rounded-lg bg-green-600 hover:bg-green-700"
                                            onClick={() => handleSubstitution(request, true)}
                                        >
                                            <CheckCircle className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </CardContent>
                </Card>
            )}

            {/* Search */}
            <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                    placeholder="Rechercher un médicament..."
                    className="pl-10 h-12 rounded-xl bg-white/50"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
            </div>

            {/* Medications List */}
            <div className="grid gap-3">
                {filteredMedications.map((med) => (
                    <Card key={med.id} className="glass-card hover:shadow-lg transition-all cursor-pointer group" onClick={() => openSubstitutionDialog(med)}>
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className={`p-3 rounded-xl ${med.inStock ? 'bg-primary/10' : 'bg-gray-100'}`}>
                                        <Pill className={`h-5 w-5 ${med.inStock ? 'text-primary' : 'text-gray-400'}`} />
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <h4 className="font-bold">{med.brandName}</h4>
                                            {med.prescriptionRequired && (
                                                <Badge variant="outline" className="text-xs">Ordonnance</Badge>
                                            )}
                                            {!med.inStock && (
                                                <Badge className="bg-red-100 text-red-700 border-red-200 text-xs">Rupture</Badge>
                                            )}
                                        </div>
                                        <p className="text-sm text-muted-foreground">{med.dosage} • {med.form}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-6">
                                    <div className="text-center">
                                        <p className="text-sm line-through text-muted-foreground">{med.brandPrice.toLocaleString()} F</p>
                                        <p className="text-xs text-muted-foreground">Marque</p>
                                    </div>
                                    <div className="text-center border-l pl-6">
                                        <p className="font-bold text-green-600">{med.genericPrice.toLocaleString()} F</p>
                                        <p className="text-xs text-muted-foreground">Générique</p>
                                    </div>
                                    <Badge className="bg-green-100 text-green-700 border-green-200">
                                        -{med.savingsPercent}%
                                    </Badge>
                                    <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:translate-x-1 transition-transform" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Substitution Dialog */}
            <Dialog open={isSubstitutionDialogOpen} onOpenChange={setIsSubstitutionDialogOpen}>
                <DialogContent className="max-w-lg">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <ArrowRightLeft className="h-5 w-5 text-primary" />
                            Détails de substitution
                        </DialogTitle>
                    </DialogHeader>
                    {selectedMed && (
                        <div className="py-4 space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <Card className="p-4 border-2 border-muted">
                                    <p className="text-xs text-muted-foreground uppercase font-bold mb-2">Médicament de marque</p>
                                    <p className="font-bold">{selectedMed.brandName}</p>
                                    <p className="text-sm text-muted-foreground">{selectedMed.dosage} • {selectedMed.form}</p>
                                    <p className="text-xl font-black mt-2">{selectedMed.brandPrice.toLocaleString()} F</p>
                                </Card>
                                <Card className="p-4 border-2 border-green-500 bg-green-50">
                                    <p className="text-xs text-green-600 uppercase font-bold mb-2">Générique équivalent</p>
                                    <p className="font-bold">{selectedMed.genericName}</p>
                                    <p className="text-sm text-muted-foreground">{selectedMed.dosage} • {selectedMed.form}</p>
                                    <p className="text-xl font-black mt-2 text-green-600">{selectedMed.genericPrice.toLocaleString()} F</p>
                                </Card>
                            </div>
                            <div className="bg-green-100 p-4 rounded-xl text-center">
                                <p className="text-sm text-green-700">Économie pour le patient</p>
                                <p className="text-3xl font-black text-green-700">{selectedMed.savings.toLocaleString()} F</p>
                                <p className="text-sm text-green-600">soit {selectedMed.savingsPercent}% d'économie</p>
                            </div>
                            <div className="bg-blue-50 p-4 rounded-xl text-sm text-blue-700 flex items-start gap-2">
                                <Info className="h-5 w-5 flex-shrink-0 mt-0.5" />
                                <p>Les génériques ont la même composition, efficacité et sécurité que les médicaments de marque. Ils sont autorisés par l'ANSM après des tests rigoureux.</p>
                            </div>
                        </div>
                    )}
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsSubstitutionDialogOpen(false)}>Fermer</Button>
                        <Button className="bg-green-600 hover:bg-green-700">
                            <CheckCircle className="h-4 w-4 mr-2" /> Proposer au patient
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}

export default GenericSubstitutionSection
