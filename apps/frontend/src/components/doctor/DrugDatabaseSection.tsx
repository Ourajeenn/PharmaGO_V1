import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import {
    Search, Pill, AlertTriangle, Info, ChevronRight,
    Zap, BookOpen, Heart, Baby, Droplets, Brain,
    Scale, Clock, Shield, ExternalLink, Plus
} from 'lucide-react'
import { toast } from 'sonner'

interface Medication {
    id: string
    name: string
    genericName: string
    category: string
    dosages: string[]
    forms: string[]
    indications: string[]
    contraindications: string[]
    interactions: DrugInteraction[]
    sideEffects: string[]
    posology: PosologyInfo
    pregnancy: string
    pediatric: string
}

interface DrugInteraction {
    drug: string
    severity: 'minor' | 'moderate' | 'major' | 'contraindicated'
    description: string
}

interface PosologyInfo {
    adult: string
    child: string
    elderly: string
    renal: string
    hepatic: string
}

export const DrugDatabaseSection = () => {
    const [searchQuery, setSearchQuery] = useState('')
    const [selectedMedication, setSelectedMedication] = useState<Medication | null>(null)
    const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false)
    const [selectedTab, setSelectedTab] = useState('info')

    // Mock data
    const [medications] = useState<Medication[]>([
        {
            id: '1',
            name: 'Amoxicilline',
            genericName: 'Amoxicilline',
            category: 'Antibiotique',
            dosages: ['250mg', '500mg', '1g'],
            forms: ['Comprimé', 'Gélule', 'Suspension'],
            indications: ['Infections ORL', 'Infections respiratoires', 'Infections urinaires', 'Infections cutanées'],
            contraindications: ['Allergie aux pénicillines', 'Mononucléose infectieuse'],
            interactions: [
                { drug: 'Méthotrexate', severity: 'major', description: 'Augmentation de la toxicité du méthotrexate' },
                { drug: 'Warfarine', severity: 'moderate', description: 'Peut augmenter l\'effet anticoagulant' },
                { drug: 'Probénécide', severity: 'minor', description: 'Augmentation des concentrations d\'amoxicilline' }
            ],
            sideEffects: ['Diarrhée', 'Nausées', 'Éruption cutanée', 'Candidose'],
            posology: {
                adult: '500mg à 1g x 3/jour',
                child: '25-50mg/kg/jour en 3 prises',
                elderly: 'Adapter selon fonction rénale',
                renal: 'Réduire la dose si ClCr < 30ml/min',
                hepatic: 'Pas d\'ajustement nécessaire'
            },
            pregnancy: 'Peut être utilisé si nécessaire (catégorie B)',
            pediatric: 'Utilisable dès la naissance, adapter la dose'
        },
        {
            id: '2',
            name: 'Amlodipine',
            genericName: 'Amlodipine',
            category: 'Antihypertenseur',
            dosages: ['5mg', '10mg'],
            forms: ['Comprimé'],
            indications: ['Hypertension artérielle', 'Angor stable', 'Angor de Prinzmetal'],
            contraindications: ['Hypotension sévère', 'Choc cardiogénique', 'Sténose aortique sévère'],
            interactions: [
                { drug: 'Simvastatine', severity: 'major', description: 'Ne pas dépasser 20mg de simvastatine' },
                { drug: 'Ciclosporine', severity: 'moderate', description: 'Augmentation des concentrations d\'amlodipine' },
                { drug: 'Diltiazem', severity: 'moderate', description: 'Effet hypotenseur accru' }
            ],
            sideEffects: ['Œdèmes des chevilles', 'Céphalées', 'Flush', 'Fatigue'],
            posology: {
                adult: '5-10mg x 1/jour',
                child: 'Non recommandé',
                elderly: 'Débuter à 2.5mg',
                renal: 'Pas d\'ajustement',
                hepatic: 'Débuter à 2.5mg'
            },
            pregnancy: 'Déconseillé (catégorie C)',
            pediatric: 'Sécurité non établie chez l\'enfant'
        },
        {
            id: '3',
            name: 'Metformine',
            genericName: 'Metformine',
            category: 'Antidiabétique',
            dosages: ['500mg', '850mg', '1000mg'],
            forms: ['Comprimé', 'Comprimé à libération prolongée'],
            indications: ['Diabète type 2', 'Prédiabète', 'Syndrome des ovaires polykystiques'],
            contraindications: ['Insuffisance rénale sévère', 'Acidose métabolique', 'Déshydratation'],
            interactions: [
                { drug: 'Produits de contraste iodés', severity: 'contraindicated', description: 'Arrêter 48h avant et après' },
                { drug: 'Alcool', severity: 'major', description: 'Risque d\'acidose lactique' },
                { drug: 'Diurétiques', severity: 'moderate', description: 'Risque d\'insuffisance rénale' }
            ],
            sideEffects: ['Troubles digestifs', 'Diarrhée', 'Goût métallique', 'Carence en B12'],
            posology: {
                adult: '500-1000mg x 2-3/jour avec repas',
                child: 'À partir de 10 ans: 500-2000mg/jour',
                elderly: 'Surveiller fonction rénale',
                renal: 'Contre-indiqué si ClCr < 30ml/min',
                hepatic: 'Éviter si insuffisance hépatique sévère'
            },
            pregnancy: 'À éviter au 1er trimestre',
            pediatric: 'Autorisé à partir de 10 ans'
        }
    ])

    const filteredMedications = medications.filter(med =>
        med.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        med.genericName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        med.category.toLowerCase().includes(searchQuery.toLowerCase())
    )

    const openDetail = (med: Medication) => {
        setSelectedMedication(med)
        setSelectedTab('info')
        setIsDetailDialogOpen(true)
    }

    const getSeverityBadge = (severity: string) => {
        const styles: Record<string, string> = {
            minor: 'bg-yellow-100 text-yellow-700 border-yellow-200',
            moderate: 'bg-orange-100 text-orange-700 border-orange-200',
            major: 'bg-red-100 text-red-700 border-red-200',
            contraindicated: 'bg-gray-800 text-white border-gray-900'
        }
        const labels: Record<string, string> = {
            minor: 'Mineure',
            moderate: 'Modérée',
            major: 'Majeure',
            contraindicated: 'Contre-indiqué'
        }
        return <Badge className={`${styles[severity]} border text-xs`}>{labels[severity]}</Badge>
    }

    const quickCategories = [
        { icon: Heart, label: 'Cardiologie', color: 'text-red-500 bg-red-100' },
        { icon: Brain, label: 'Neurologie', color: 'text-purple-500 bg-purple-100' },
        { icon: Droplets, label: 'Diabète', color: 'text-blue-500 bg-blue-100' },
        { icon: Shield, label: 'Infectiologie', color: 'text-green-500 bg-green-100' },
        { icon: Baby, label: 'Pédiatrie', color: 'text-pink-500 bg-pink-100' }
    ]

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-2xl font-black tracking-tight">Base Médicamenteuse</h3>
                    <p className="text-sm text-muted-foreground">Recherchez les interactions et posologies</p>
                </div>
                <Button variant="outline" className="rounded-xl">
                    <ExternalLink className="h-4 w-4 mr-2" /> Vidal en ligne
                </Button>
            </div>

            {/* Search */}
            <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                    placeholder="Rechercher un médicament, une molécule..."
                    className="pl-12 h-14 rounded-2xl bg-white/70 text-lg"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
            </div>

            {/* Quick Categories */}
            <div className="flex gap-3 overflow-x-auto pb-2">
                {quickCategories.map((cat) => {
                    const Icon = cat.icon
                    return (
                        <Button
                            key={cat.label}
                            variant="outline"
                            className={`rounded-xl flex-shrink-0 ${cat.color.split(' ')[1]}`}
                        >
                            <Icon className={`h-4 w-4 mr-2 ${cat.color.split(' ')[0]}`} />
                            {cat.label}
                        </Button>
                    )
                })}
            </div>

            {/* Results */}
            {searchQuery && (
                <div className="space-y-3">
                    <p className="text-sm text-muted-foreground">{filteredMedications.length} résultat(s)</p>
                    {filteredMedications.map((med) => (
                        <Card
                            key={med.id}
                            className="glass-card hover:shadow-lg transition-all cursor-pointer group"
                            onClick={() => openDetail(med)}
                        >
                            <CardContent className="p-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="p-3 bg-primary/10 rounded-xl">
                                            <Pill className="h-5 w-5 text-primary" />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-lg">{med.name}</h4>
                                            <p className="text-sm text-muted-foreground">
                                                {med.genericName} • {med.category}
                                            </p>
                                            <div className="flex gap-2 mt-1">
                                                {med.dosages.map((d) => (
                                                    <Badge key={d} variant="secondary" className="text-xs">{d}</Badge>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        {med.interactions.some(i => i.severity === 'major' || i.severity === 'contraindicated') && (
                                            <div className="flex items-center gap-1 text-red-600">
                                                <AlertTriangle className="h-4 w-4" />
                                                <span className="text-xs font-bold">Interactions</span>
                                            </div>
                                        )}
                                        <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:translate-x-1 transition-transform" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            {/* Empty State */}
            {!searchQuery && (
                <Card className="glass-card">
                    <CardContent className="p-8 text-center">
                        <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                        <p className="font-bold text-lg">Recherchez un médicament</p>
                        <p className="text-sm text-muted-foreground">
                            Consultez les interactions, posologies et contre-indications
                        </p>
                    </CardContent>
                </Card>
            )}

            {/* Detail Dialog */}
            <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
                <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Pill className="h-5 w-5 text-primary" />
                            {selectedMedication?.name}
                        </DialogTitle>
                    </DialogHeader>
                    {selectedMedication && (
                        <div className="space-y-4">
                            <div className="flex gap-2 flex-wrap">
                                <Badge variant="secondary">{selectedMedication.category}</Badge>
                                {selectedMedication.dosages.map((d) => (
                                    <Badge key={d} variant="outline">{d}</Badge>
                                ))}
                            </div>

                            <Tabs value={selectedTab} onValueChange={setSelectedTab}>
                                <TabsList className="bg-gray-100 p-1 rounded-xl w-full">
                                    <TabsTrigger value="info" className="flex-1 rounded-lg">Info</TabsTrigger>
                                    <TabsTrigger value="interactions" className="flex-1 rounded-lg">
                                        Interactions
                                        {selectedMedication.interactions.length > 0 && (
                                            <Badge className="ml-2 h-5 w-5 p-0 text-xs">{selectedMedication.interactions.length}</Badge>
                                        )}
                                    </TabsTrigger>
                                    <TabsTrigger value="posology" className="flex-1 rounded-lg">Posologie</TabsTrigger>
                                    <TabsTrigger value="safety" className="flex-1 rounded-lg">Sécurité</TabsTrigger>
                                </TabsList>

                                <TabsContent value="info" className="space-y-4 pt-4">
                                    <div>
                                        <p className="text-sm font-bold text-muted-foreground mb-2">Indications</p>
                                        <div className="flex flex-wrap gap-2">
                                            {selectedMedication.indications.map((ind) => (
                                                <Badge key={ind} className="bg-green-100 text-green-700">{ind}</Badge>
                                            ))}
                                        </div>
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-muted-foreground mb-2">Contre-indications</p>
                                        <div className="flex flex-wrap gap-2">
                                            {selectedMedication.contraindications.map((ci) => (
                                                <Badge key={ci} className="bg-red-100 text-red-700">{ci}</Badge>
                                            ))}
                                        </div>
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-muted-foreground mb-2">Effets indésirables</p>
                                        <div className="flex flex-wrap gap-2">
                                            {selectedMedication.sideEffects.map((se) => (
                                                <Badge key={se} variant="outline">{se}</Badge>
                                            ))}
                                        </div>
                                    </div>
                                </TabsContent>

                                <TabsContent value="interactions" className="space-y-3 pt-4">
                                    {selectedMedication.interactions.map((interaction, idx) => (
                                        <Card key={idx} className={`p-4 ${interaction.severity === 'contraindicated' ? 'bg-gray-900 text-white' :
                                            interaction.severity === 'major' ? 'bg-red-50 border-red-200' :
                                                interaction.severity === 'moderate' ? 'bg-orange-50 border-orange-200' :
                                                    'bg-yellow-50 border-yellow-200'
                                            }`}>
                                            <div className="flex items-center justify-between mb-2">
                                                <div className="flex items-center gap-2">
                                                    <Zap className={`h-4 w-4 ${interaction.severity === 'contraindicated' ? 'text-white' : 'text-current'
                                                        }`} />
                                                    <span className="font-bold">{interaction.drug}</span>
                                                </div>
                                                {getSeverityBadge(interaction.severity)}
                                            </div>
                                            <p className={`text-sm ${interaction.severity === 'contraindicated' ? 'text-gray-300' : 'text-muted-foreground'}`}>
                                                {interaction.description}
                                            </p>
                                        </Card>
                                    ))}
                                </TabsContent>

                                <TabsContent value="posology" className="space-y-4 pt-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <Card className="p-4">
                                            <div className="flex items-center gap-2 mb-2">
                                                <Scale className="h-4 w-4 text-primary" />
                                                <p className="font-bold">Adulte</p>
                                            </div>
                                            <p className="text-sm">{selectedMedication.posology.adult}</p>
                                        </Card>
                                        <Card className="p-4">
                                            <div className="flex items-center gap-2 mb-2">
                                                <Baby className="h-4 w-4 text-pink-500" />
                                                <p className="font-bold">Enfant</p>
                                            </div>
                                            <p className="text-sm">{selectedMedication.posology.child}</p>
                                        </Card>
                                        <Card className="p-4">
                                            <div className="flex items-center gap-2 mb-2">
                                                <Clock className="h-4 w-4 text-gray-500" />
                                                <p className="font-bold">Personne âgée</p>
                                            </div>
                                            <p className="text-sm">{selectedMedication.posology.elderly}</p>
                                        </Card>
                                        <Card className="p-4">
                                            <div className="flex items-center gap-2 mb-2">
                                                <Droplets className="h-4 w-4 text-blue-500" />
                                                <p className="font-bold">Insuffisance rénale</p>
                                            </div>
                                            <p className="text-sm">{selectedMedication.posology.renal}</p>
                                        </Card>
                                    </div>
                                </TabsContent>

                                <TabsContent value="safety" className="space-y-4 pt-4">
                                    <Card className="p-4 border-pink-200 bg-pink-50">
                                        <div className="flex items-center gap-2 mb-2">
                                            <Heart className="h-4 w-4 text-pink-500" />
                                            <p className="font-bold">Grossesse</p>
                                        </div>
                                        <p className="text-sm">{selectedMedication.pregnancy}</p>
                                    </Card>
                                    <Card className="p-4 border-blue-200 bg-blue-50">
                                        <div className="flex items-center gap-2 mb-2">
                                            <Baby className="h-4 w-4 text-blue-500" />
                                            <p className="font-bold">Usage pédiatrique</p>
                                        </div>
                                        <p className="text-sm">{selectedMedication.pediatric}</p>
                                    </Card>
                                </TabsContent>
                            </Tabs>
                        </div>
                    )}
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsDetailDialogOpen(false)}>Fermer</Button>
                        <Button>
                            <Plus className="h-4 w-4 mr-2" /> Ajouter à l'ordonnance
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}

export default DrugDatabaseSection
