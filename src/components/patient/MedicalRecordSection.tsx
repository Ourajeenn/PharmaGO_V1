import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import {
    Heart, AlertTriangle, Syringe, Pill, Plus, Edit, Trash2,
    Calendar, Clock, Shield, Activity, FileText, ChevronRight,
    Bell, CheckCircle, X, Save, User
} from 'lucide-react'
import { toast } from 'sonner'

interface Allergy {
    id: string
    name: string
    severity: 'mild' | 'moderate' | 'severe'
    reaction: string
    dateDiscovered: string
}

interface Vaccination {
    id: string
    name: string
    date: string
    nextDue?: string
    provider: string
    lotNumber?: string
}

interface MedicalHistory {
    id: string
    condition: string
    diagnosisDate: string
    status: 'active' | 'resolved' | 'chronic'
    notes: string
}

interface CurrentTreatment {
    id: string
    medication: string
    dosage: string
    frequency: string
    startDate: string
    endDate?: string
    prescribedBy: string
}

export const MedicalRecordSection = () => {
    const [activeTab, setActiveTab] = useState('allergies')
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
    const [editingItem, setEditingItem] = useState<any>(null)
    const [dialogType, setDialogType] = useState<'allergy' | 'vaccination' | 'history' | 'treatment'>('allergy')

    // Mock data - would come from Supabase
    const [allergies, setAllergies] = useState<Allergy[]>([
        { id: '1', name: 'Pénicilline', severity: 'severe', reaction: 'Choc anaphylactique', dateDiscovered: '2020-03-15' },
        { id: '2', name: 'Arachides', severity: 'moderate', reaction: 'Urticaire, œdème', dateDiscovered: '2015-06-20' },
        { id: '3', name: 'Latex', severity: 'mild', reaction: 'Irritation cutanée', dateDiscovered: '2022-01-10' }
    ])

    const [vaccinations, setVaccinations] = useState<Vaccination[]>([
        { id: '1', name: 'COVID-19 (Pfizer)', date: '2024-01-15', provider: 'Centre Vaccination Abidjan', lotNumber: 'EJ1234' },
        { id: '2', name: 'Fièvre Jaune', date: '2023-05-20', nextDue: '2033-05-20', provider: 'Institut Pasteur' },
        { id: '3', name: 'Hépatite B', date: '2022-08-10', provider: 'CHU Treichville' },
        { id: '4', name: 'Tétanos', date: '2021-03-01', nextDue: '2031-03-01', provider: 'Clinique Avicenne' }
    ])

    const [medicalHistory, setMedicalHistory] = useState<MedicalHistory[]>([
        { id: '1', condition: 'Hypertension artérielle', diagnosisDate: '2019-06-15', status: 'chronic', notes: 'Sous traitement quotidien' },
        { id: '2', condition: 'Appendicectomie', diagnosisDate: '2015-02-20', status: 'resolved', notes: 'Chirurgie sans complications' },
        { id: '3', condition: 'Diabète Type 2', diagnosisDate: '2021-11-08', status: 'active', notes: 'Contrôle glycémique régulier' }
    ])

    const [treatments, setTreatments] = useState<CurrentTreatment[]>([
        { id: '1', medication: 'Amlodipine 5mg', dosage: '1 comprimé', frequency: '1x/jour (matin)', startDate: '2019-07-01', prescribedBy: 'Dr. Koné' },
        { id: '2', medication: 'Metformine 500mg', dosage: '1 comprimé', frequency: '2x/jour', startDate: '2021-12-01', prescribedBy: 'Dr. Touré' },
        { id: '3', medication: 'Aspirine 100mg', dosage: '1 comprimé', frequency: '1x/jour', startDate: '2020-01-15', prescribedBy: 'Dr. Koné' }
    ])

    const openAddDialog = (type: typeof dialogType) => {
        setDialogType(type)
        setEditingItem(null)
        setIsAddDialogOpen(true)
    }

    const getSeverityBadge = (severity: string) => {
        const styles = {
            mild: 'bg-yellow-100 text-yellow-700 border-yellow-200',
            moderate: 'bg-orange-100 text-orange-700 border-orange-200',
            severe: 'bg-red-100 text-red-700 border-red-200'
        }
        const labels = { mild: 'Légère', moderate: 'Modérée', severe: 'Sévère' }
        return (
            <Badge className={`${styles[severity as keyof typeof styles]} border text-xs`}>
                {labels[severity as keyof typeof labels]}
            </Badge>
        )
    }

    const getStatusBadge = (status: string) => {
        const styles = {
            active: 'bg-blue-100 text-blue-700 border-blue-200',
            resolved: 'bg-green-100 text-green-700 border-green-200',
            chronic: 'bg-purple-100 text-purple-700 border-purple-200'
        }
        const labels = { active: 'Actif', resolved: 'Résolu', chronic: 'Chronique' }
        return (
            <Badge className={`${styles[status as keyof typeof styles]} border text-xs`}>
                {labels[status as keyof typeof labels]}
            </Badge>
        )
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-2xl font-black tracking-tight">Mon Dossier Médical</h3>
                    <p className="text-sm text-muted-foreground">Gérez vos informations de santé en toute sécurité</p>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Shield className="h-4 w-4 text-green-500" />
                    <span>Données chiffrées</span>
                </div>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                <TabsList className="bg-white/50 p-1 rounded-xl border">
                    <TabsTrigger value="allergies" className="rounded-lg data-[state=active]:bg-red-50 data-[state=active]:text-red-700">
                        <AlertTriangle className="h-4 w-4 mr-2" /> Allergies
                    </TabsTrigger>
                    <TabsTrigger value="vaccinations" className="rounded-lg data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700">
                        <Syringe className="h-4 w-4 mr-2" /> Vaccinations
                    </TabsTrigger>
                    <TabsTrigger value="history" className="rounded-lg data-[state=active]:bg-purple-50 data-[state=active]:text-purple-700">
                        <FileText className="h-4 w-4 mr-2" /> Antécédents
                    </TabsTrigger>
                    <TabsTrigger value="treatments" className="rounded-lg data-[state=active]:bg-green-50 data-[state=active]:text-green-700">
                        <Pill className="h-4 w-4 mr-2" /> Traitements
                    </TabsTrigger>
                </TabsList>

                {/* Allergies Tab */}
                <TabsContent value="allergies" className="space-y-4">
                    <div className="flex justify-between items-center">
                        <p className="text-sm text-muted-foreground">{allergies.length} allergie(s) enregistrée(s)</p>
                        <Button onClick={() => openAddDialog('allergy')} size="sm" className="rounded-xl">
                            <Plus className="h-4 w-4 mr-2" /> Ajouter
                        </Button>
                    </div>
                    <div className="grid gap-4">
                        {allergies.map((allergy) => (
                            <Card key={allergy.id} className="glass-card border-red-100">
                                <CardContent className="p-4">
                                    <div className="flex justify-between items-start">
                                        <div className="flex items-start gap-3">
                                            <div className="p-2 bg-red-100 rounded-lg">
                                                <AlertTriangle className="h-5 w-5 text-red-600" />
                                            </div>
                                            <div>
                                                <h4 className="font-bold">{allergy.name}</h4>
                                                <p className="text-sm text-muted-foreground">{allergy.reaction}</p>
                                                <p className="text-xs text-muted-foreground mt-1">
                                                    Découvert le {new Date(allergy.dateDiscovered).toLocaleDateString('fr-FR')}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            {getSeverityBadge(allergy.severity)}
                                            <Button variant="ghost" size="icon" className="h-8 w-8">
                                                <Edit className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </TabsContent>

                {/* Vaccinations Tab */}
                <TabsContent value="vaccinations" className="space-y-4">
                    <div className="flex justify-between items-center">
                        <p className="text-sm text-muted-foreground">{vaccinations.length} vaccination(s) enregistrée(s)</p>
                        <Button onClick={() => openAddDialog('vaccination')} size="sm" className="rounded-xl">
                            <Plus className="h-4 w-4 mr-2" /> Ajouter
                        </Button>
                    </div>
                    <div className="grid gap-4">
                        {vaccinations.map((vax) => (
                            <Card key={vax.id} className="glass-card border-blue-100">
                                <CardContent className="p-4">
                                    <div className="flex justify-between items-start">
                                        <div className="flex items-start gap-3">
                                            <div className="p-2 bg-blue-100 rounded-lg">
                                                <Syringe className="h-5 w-5 text-blue-600" />
                                            </div>
                                            <div>
                                                <h4 className="font-bold">{vax.name}</h4>
                                                <p className="text-sm text-muted-foreground">{vax.provider}</p>
                                                <div className="flex gap-4 mt-1 text-xs text-muted-foreground">
                                                    <span className="flex items-center gap-1">
                                                        <Calendar className="h-3 w-3" />
                                                        {new Date(vax.date).toLocaleDateString('fr-FR')}
                                                    </span>
                                                    {vax.nextDue && (
                                                        <span className="flex items-center gap-1 text-orange-600">
                                                            <Clock className="h-3 w-3" />
                                                            Rappel: {new Date(vax.nextDue).toLocaleDateString('fr-FR')}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        <Button variant="ghost" size="icon" className="h-8 w-8">
                                            <Edit className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </TabsContent>

                {/* Medical History Tab */}
                <TabsContent value="history" className="space-y-4">
                    <div className="flex justify-between items-center">
                        <p className="text-sm text-muted-foreground">{medicalHistory.length} antécédent(s) enregistré(s)</p>
                        <Button onClick={() => openAddDialog('history')} size="sm" className="rounded-xl">
                            <Plus className="h-4 w-4 mr-2" /> Ajouter
                        </Button>
                    </div>
                    <div className="grid gap-4">
                        {medicalHistory.map((item) => (
                            <Card key={item.id} className="glass-card border-purple-100">
                                <CardContent className="p-4">
                                    <div className="flex justify-between items-start">
                                        <div className="flex items-start gap-3">
                                            <div className="p-2 bg-purple-100 rounded-lg">
                                                <Heart className="h-5 w-5 text-purple-600" />
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <h4 className="font-bold">{item.condition}</h4>
                                                    {getStatusBadge(item.status)}
                                                </div>
                                                <p className="text-sm text-muted-foreground">{item.notes}</p>
                                                <p className="text-xs text-muted-foreground mt-1">
                                                    Diagnostiqué le {new Date(item.diagnosisDate).toLocaleDateString('fr-FR')}
                                                </p>
                                            </div>
                                        </div>
                                        <Button variant="ghost" size="icon" className="h-8 w-8">
                                            <Edit className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </TabsContent>

                {/* Current Treatments Tab */}
                <TabsContent value="treatments" className="space-y-4">
                    <div className="flex justify-between items-center">
                        <p className="text-sm text-muted-foreground">{treatments.length} traitement(s) en cours</p>
                        <Button onClick={() => openAddDialog('treatment')} size="sm" className="rounded-xl">
                            <Plus className="h-4 w-4 mr-2" /> Ajouter
                        </Button>
                    </div>
                    <div className="grid gap-4">
                        {treatments.map((treatment) => (
                            <Card key={treatment.id} className="glass-card border-green-100">
                                <CardContent className="p-4">
                                    <div className="flex justify-between items-start">
                                        <div className="flex items-start gap-3">
                                            <div className="p-2 bg-green-100 rounded-lg">
                                                <Pill className="h-5 w-5 text-green-600" />
                                            </div>
                                            <div>
                                                <h4 className="font-bold">{treatment.medication}</h4>
                                                <p className="text-sm text-muted-foreground">
                                                    {treatment.dosage} • {treatment.frequency}
                                                </p>
                                                <div className="flex gap-4 mt-1 text-xs text-muted-foreground">
                                                    <span>Depuis {new Date(treatment.startDate).toLocaleDateString('fr-FR')}</span>
                                                    <span className="flex items-center gap-1">
                                                        <User className="h-3 w-3" />
                                                        {treatment.prescribedBy}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        <Button variant="ghost" size="icon" className="h-8 w-8">
                                            <Edit className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </TabsContent>
            </Tabs>

            {/* Add/Edit Dialog */}
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>
                            {dialogType === 'allergy' && 'Ajouter une allergie'}
                            {dialogType === 'vaccination' && 'Ajouter une vaccination'}
                            {dialogType === 'history' && 'Ajouter un antécédent'}
                            {dialogType === 'treatment' && 'Ajouter un traitement'}
                        </DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        {dialogType === 'allergy' && (
                            <>
                                <div className="space-y-2">
                                    <Label>Nom de l'allergie</Label>
                                    <Input placeholder="Ex: Pénicilline, Arachides..." />
                                </div>
                                <div className="space-y-2">
                                    <Label>Sévérité</Label>
                                    <Select defaultValue="moderate">
                                        <SelectTrigger><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="mild">Légère</SelectItem>
                                            <SelectItem value="moderate">Modérée</SelectItem>
                                            <SelectItem value="severe">Sévère</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label>Réaction</Label>
                                    <Textarea placeholder="Décrivez la réaction allergique..." />
                                </div>
                            </>
                        )}
                        {dialogType === 'vaccination' && (
                            <>
                                <div className="space-y-2">
                                    <Label>Nom du vaccin</Label>
                                    <Input placeholder="Ex: COVID-19, Fièvre Jaune..." />
                                </div>
                                <div className="space-y-2">
                                    <Label>Date de vaccination</Label>
                                    <Input type="date" />
                                </div>
                                <div className="space-y-2">
                                    <Label>Établissement</Label>
                                    <Input placeholder="Ex: CHU Treichville..." />
                                </div>
                                <div className="space-y-2">
                                    <Label>Numéro de lot (optionnel)</Label>
                                    <Input placeholder="Ex: EJ1234" />
                                </div>
                            </>
                        )}
                        {dialogType === 'history' && (
                            <>
                                <div className="space-y-2">
                                    <Label>Condition / Pathologie</Label>
                                    <Input placeholder="Ex: Hypertension, Chirurgie..." />
                                </div>
                                <div className="space-y-2">
                                    <Label>Date de diagnostic</Label>
                                    <Input type="date" />
                                </div>
                                <div className="space-y-2">
                                    <Label>Statut</Label>
                                    <Select defaultValue="active">
                                        <SelectTrigger><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="active">Actif</SelectItem>
                                            <SelectItem value="resolved">Résolu</SelectItem>
                                            <SelectItem value="chronic">Chronique</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label>Notes</Label>
                                    <Textarea placeholder="Informations complémentaires..." />
                                </div>
                            </>
                        )}
                        {dialogType === 'treatment' && (
                            <>
                                <div className="space-y-2">
                                    <Label>Médicament</Label>
                                    <Input placeholder="Ex: Amlodipine 5mg..." />
                                </div>
                                <div className="space-y-2">
                                    <Label>Dosage</Label>
                                    <Input placeholder="Ex: 1 comprimé" />
                                </div>
                                <div className="space-y-2">
                                    <Label>Fréquence</Label>
                                    <Input placeholder="Ex: 2x/jour" />
                                </div>
                                <div className="space-y-2">
                                    <Label>Prescrit par</Label>
                                    <Input placeholder="Ex: Dr. Koné" />
                                </div>
                            </>
                        )}
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>Annuler</Button>
                        <Button onClick={() => {
                            toast.success('Élément ajouté avec succès')
                            setIsAddDialogOpen(false)
                        }}>
                            <Save className="h-4 w-4 mr-2" /> Enregistrer
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}

export default MedicalRecordSection
