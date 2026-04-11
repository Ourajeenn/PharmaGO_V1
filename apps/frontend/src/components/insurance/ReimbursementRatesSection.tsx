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
import { Slider } from '@/components/ui/slider'
import {
    Percent, Search, Edit, Save, Plus, Pill,
    AlertTriangle, CheckCircle, Settings, Filter,
    TrendingUp, TrendingDown, DollarSign, FileText
} from 'lucide-react'
import { toast } from 'sonner'

interface MedicationRate {
    id: string
    name: string
    category: string
    genericName?: string
    baseRate: number
    cmuRate: number
    chronicRate: number
    isGeneric: boolean
    totalVolume: number
    lastUpdated: string
}

interface RateCategory {
    id: string
    name: string
    description: string
    defaultRate: number
    medications: number
}

export const ReimbursementRatesSection = () => {
    const [searchQuery, setSearchQuery] = useState('')
    const [selectedCategory, setSelectedCategory] = useState('all')
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
    const [selectedMedication, setSelectedMedication] = useState<MedicationRate | null>(null)
    const [editedRate, setEditedRate] = useState(0)

    // Mock data
    const [categories] = useState<RateCategory[]>([
        { id: 'chronic', name: 'Maladies Chroniques', description: 'Diabète, Hypertension, etc.', defaultRate: 100, medications: 156 },
        { id: 'prescription', name: 'Médicaments sur ordonnance', description: 'Antibiotiques, Anti-inflammatoires, etc.', defaultRate: 70, medications: 892 },
        { id: 'otc', name: 'Sans ordonnance (OTC)', description: 'Paracétamol, Vitamines, etc.', defaultRate: 35, medications: 423 },
        { id: 'specialized', name: 'Médicaments spécialisés', description: 'Anticancéreux, Immunosuppresseurs, etc.', defaultRate: 100, medications: 67 },
        { id: 'generics', name: 'Génériques', description: 'Version générique des médicaments', defaultRate: 80, medications: 654 }
    ])

    const [medications] = useState<MedicationRate[]>([
        { id: '1', name: 'Insuline Lantus', category: 'chronic', baseRate: 100, cmuRate: 100, chronicRate: 100, isGeneric: false, totalVolume: 15600000, lastUpdated: '2026-01-15' },
        { id: '2', name: 'Metformine 500mg', category: 'chronic', genericName: 'Glucophage', baseRate: 70, cmuRate: 80, chronicRate: 100, isGeneric: true, totalVolume: 8900000, lastUpdated: '2026-01-15' },
        { id: '3', name: 'Amoxicilline 500mg', category: 'prescription', baseRate: 70, cmuRate: 75, chronicRate: 70, isGeneric: true, totalVolume: 5400000, lastUpdated: '2026-02-01' },
        { id: '4', name: 'Augmentin 1g', category: 'prescription', genericName: 'Amoxicilline/Ac.Clav', baseRate: 65, cmuRate: 70, chronicRate: 65, isGeneric: false, totalVolume: 7200000, lastUpdated: '2026-01-20' },
        { id: '5', name: 'Paracétamol 1000mg', category: 'otc', baseRate: 35, cmuRate: 40, chronicRate: 35, isGeneric: true, totalVolume: 12300000, lastUpdated: '2026-02-01' },
        { id: '6', name: 'Ibuprofène 400mg', category: 'otc', baseRate: 35, cmuRate: 40, chronicRate: 35, isGeneric: true, totalVolume: 6700000, lastUpdated: '2026-01-25' },
        { id: '7', name: 'Herceptin', category: 'specialized', baseRate: 100, cmuRate: 100, chronicRate: 100, isGeneric: false, totalVolume: 45000000, lastUpdated: '2026-01-01' },
        { id: '8', name: 'Amlodipine 5mg', category: 'chronic', baseRate: 70, cmuRate: 80, chronicRate: 100, isGeneric: true, totalVolume: 4500000, lastUpdated: '2026-02-01' }
    ])

    const stats = {
        avgRate: 72,
        totalVolume: medications.reduce((sum, m) => sum + m.totalVolume, 0),
        chronicCoverage: 100,
        genericBonus: 10
    }

    const filteredMedications = medications.filter(med => {
        const matchesSearch = med.name.toLowerCase().includes(searchQuery.toLowerCase())
        const matchesCategory = selectedCategory === 'all' || med.category === selectedCategory
        return matchesSearch && matchesCategory
    })

    const openEditDialog = (med: MedicationRate) => {
        setSelectedMedication(med)
        setEditedRate(med.baseRate)
        setIsEditDialogOpen(true)
    }

    const handleSaveRate = () => {
        toast.success('Taux de remboursement mis à jour')
        setIsEditDialogOpen(false)
    }

    const getCategoryBadge = (category: string) => {
        const styles: Record<string, string> = {
            chronic: 'bg-purple-100 text-purple-700 border-purple-200',
            prescription: 'bg-blue-100 text-blue-700 border-blue-200',
            otc: 'bg-green-100 text-green-700 border-green-200',
            specialized: 'bg-red-100 text-red-700 border-red-200',
            generics: 'bg-orange-100 text-orange-700 border-orange-200'
        }
        const labels: Record<string, string> = {
            chronic: 'Chronique',
            prescription: 'Ordonnance',
            otc: 'OTC',
            specialized: 'Spécialisé',
            generics: 'Générique'
        }
        return <Badge className={`${styles[category]} border text-xs`}>{labels[category]}</Badge>
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-2xl font-black tracking-tight">Barèmes de Remboursement</h3>
                    <p className="text-sm text-muted-foreground">Configurez les taux de remboursement par médicament</p>
                </div>
                <Button className="rounded-xl">
                    <Plus className="h-4 w-4 mr-2" /> Ajouter un médicament
                </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="glass-card border-primary/20 bg-primary/5">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs text-muted-foreground font-bold uppercase">Taux moyen</p>
                                <p className="text-3xl font-black text-primary">{stats.avgRate}%</p>
                            </div>
                            <Percent className="h-8 w-8 text-primary" />
                        </div>
                    </CardContent>
                </Card>
                <Card className="glass-card border-green-200 bg-green-50">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs text-muted-foreground font-bold uppercase">Volume total</p>
                                <p className="text-2xl font-black text-green-700">{(stats.totalVolume / 1000000).toFixed(1)}M F</p>
                            </div>
                            <DollarSign className="h-8 w-8 text-green-500" />
                        </div>
                    </CardContent>
                </Card>
                <Card className="glass-card border-purple-200 bg-purple-50">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs text-muted-foreground font-bold uppercase">Maladies chroniques</p>
                                <p className="text-3xl font-black text-purple-700">{stats.chronicCoverage}%</p>
                            </div>
                            <CheckCircle className="h-8 w-8 text-purple-500" />
                        </div>
                    </CardContent>
                </Card>
                <Card className="glass-card border-orange-200 bg-orange-50">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs text-muted-foreground font-bold uppercase">Bonus générique</p>
                                <p className="text-3xl font-black text-orange-700">+{stats.genericBonus}%</p>
                            </div>
                            <TrendingUp className="h-8 w-8 text-orange-500" />
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Categories Overview */}
            <Card className="glass-card">
                <CardHeader>
                    <CardTitle className="text-lg">Catégories de remboursement</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                        {categories.map((cat) => (
                            <div
                                key={cat.id}
                                className={`p-4 rounded-xl border-2 cursor-pointer transition-all hover:shadow-md ${selectedCategory === cat.id ? 'border-primary bg-primary/5' : 'border-gray-200'
                                    }`}
                                onClick={() => setSelectedCategory(cat.id === selectedCategory ? 'all' : cat.id)}
                            >
                                <div className="flex justify-between items-start mb-2">
                                    <p className="font-bold text-sm">{cat.name}</p>
                                    <Badge className="bg-primary/10 text-primary">{cat.defaultRate}%</Badge>
                                </div>
                                <p className="text-xs text-muted-foreground">{cat.medications} médicaments</p>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Search */}
            <div className="flex gap-2">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Rechercher un médicament..."
                        className="pl-9 rounded-xl"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger className="w-48 rounded-xl">
                        <SelectValue placeholder="Catégorie" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Toutes les catégories</SelectItem>
                        {categories.map(cat => (
                            <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            {/* Medications List */}
            <div className="space-y-3">
                {filteredMedications.map((med) => (
                    <Card key={med.id} className="glass-card hover:shadow-lg transition-all">
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 bg-primary/10 rounded-xl">
                                        <Pill className="h-5 w-5 text-primary" />
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <h4 className="font-bold">{med.name}</h4>
                                            {getCategoryBadge(med.category)}
                                            {med.isGeneric && (
                                                <Badge className="bg-green-100 text-green-700 border-green-200 text-xs">Générique</Badge>
                                            )}
                                        </div>
                                        <p className="text-sm text-muted-foreground">
                                            Volume: {(med.totalVolume / 1000000).toFixed(1)}M F • Màj: {new Date(med.lastUpdated).toLocaleDateString('fr-FR')}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-6">
                                    <div className="text-center">
                                        <p className="text-2xl font-black text-primary">{med.baseRate}%</p>
                                        <p className="text-xs text-muted-foreground">Taux de base</p>
                                    </div>
                                    <div className="text-center border-l pl-6">
                                        <p className="text-lg font-bold text-blue-600">{med.cmuRate}%</p>
                                        <p className="text-xs text-muted-foreground">CMU</p>
                                    </div>
                                    <div className="text-center border-l pl-6">
                                        <p className="text-lg font-bold text-purple-600">{med.chronicRate}%</p>
                                        <p className="text-xs text-muted-foreground">Chronique</p>
                                    </div>
                                    <Button
                                        variant="outline"
                                        size="icon"
                                        className="rounded-lg"
                                        onClick={() => openEditDialog(med)}
                                    >
                                        <Edit className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Edit Dialog */}
            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Settings className="h-5 w-5 text-primary" />
                            Modifier le taux de remboursement
                        </DialogTitle>
                    </DialogHeader>
                    {selectedMedication && (
                        <div className="space-y-6 py-4">
                            <div className="bg-gray-50 p-4 rounded-xl">
                                <p className="font-bold">{selectedMedication.name}</p>
                                <p className="text-sm text-muted-foreground">{getCategoryBadge(selectedMedication.category)}</p>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <div className="flex justify-between mb-2">
                                        <Label>Taux de base</Label>
                                        <span className="font-bold text-primary">{editedRate}%</span>
                                    </div>
                                    <Slider
                                        value={[editedRate]}
                                        onValueChange={(v) => setEditedRate(v[0])}
                                        max={100}
                                        step={5}
                                        className="w-full"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label>Taux CMU</Label>
                                        <Input type="number" defaultValue={selectedMedication.cmuRate} className="mt-1" />
                                    </div>
                                    <div>
                                        <Label>Taux Chronique</Label>
                                        <Input type="number" defaultValue={selectedMedication.chronicRate} className="mt-1" />
                                    </div>
                                </div>
                            </div>

                            <div className="bg-blue-50 p-3 rounded-lg text-sm text-blue-700">
                                <AlertTriangle className="h-4 w-4 inline mr-2" />
                                Les modifications prendront effet immédiatement pour les nouvelles demandes.
                            </div>
                        </div>
                    )}
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>Annuler</Button>
                        <Button onClick={handleSaveRate}>
                            <Save className="h-4 w-4 mr-2" /> Enregistrer
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}

export default ReimbursementRatesSection
