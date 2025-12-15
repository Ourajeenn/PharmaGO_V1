import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useECarnet } from '@/contexts/ECarnetContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertCircle, Plus, Trash2, AlertTriangle, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import type { Allergy, AllergySeverity, AllergyType } from '@/types/ecarnet';

const AllergyManager = () => {
    const navigate = useNavigate();
    const {
        currentPatient,
        getPatientAllergies,
        addAllergy,
        deleteAllergy
    } = useECarnet();

    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [formData, setFormData] = useState({
        allergyType: 'Alimentaire' as AllergyType,
        allergen: '',
        severity: 'Modérée' as AllergySeverity,
        symptoms: '',
        diagnosedDate: '',
        emergencyProtocol: '',
        medication: '',
    });

    if (!currentPatient) {
        navigate('/ecarnet');
        return null;
    }

    const allergies = getPatientAllergies(currentPatient.id);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const symptomsArray = formData.symptoms
            .split(',')
            .map(s => s.trim())
            .filter(s => s.length > 0);

        addAllergy({
            patientId: currentPatient.id,
            allergyType: formData.allergyType,
            allergen: formData.allergen,
            severity: formData.severity,
            symptoms: symptomsArray,
            diagnosedDate: formData.diagnosedDate,
            emergencyProtocol: formData.emergencyProtocol,
            medication: formData.medication,
            isActive: true,
        });

        toast.success('Allergie ajoutée avec succès');
        setIsDialogOpen(false);
        setFormData({
            allergyType: 'Alimentaire',
            allergen: '',
            severity: 'Modérée',
            symptoms: '',
            diagnosedDate: '',
            emergencyProtocol: '',
            medication: '',
        });
    };

    const handleDelete = (id: string) => {
        if (window.confirm('Êtes-vous sûr de vouloir supprimer cette allergie ?')) {
            deleteAllergy(id);
            toast.success('Allergie supprimée');
        }
    };

    const getSeverityColor = (severity: AllergySeverity) => {
        switch (severity) {
            case 'Critique': return 'destructive';
            case 'Sévère': return 'default';
            case 'Modérée': return 'secondary';
            case 'Légère': return 'outline';
        }
    };

    const getTypeIcon = (type: AllergyType) => {
        return <AlertCircle className="h-5 w-5" />;
    };

    return (
        <div className="min-h-screen flex flex-col">
            <Header />

            <main className="flex-1 container mx-auto px-4 py-8">
                <div className="mb-6">
                    <Button
                        variant="ghost"
                        onClick={() => navigate('/ecarnet')}
                        className="mb-4"
                    >
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Retour au E-Carnet
                    </Button>

                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <AlertCircle className="h-8 w-8 text-primary" />
                            <div>
                                <h1 className="text-3xl font-bold">Gestion des allergies</h1>
                                <p className="text-muted-foreground">
                                    Gérez les allergies et sensibilités
                                </p>
                            </div>
                        </div>

                        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                            <DialogTrigger asChild>
                                <Button>
                                    <Plus className="h-5 w-5 mr-2" />
                                    Ajouter une allergie
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl">
                                <DialogHeader>
                                    <DialogTitle>Ajouter une allergie</DialogTitle>
                                </DialogHeader>
                                <form onSubmit={handleSubmit} className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <Label htmlFor="allergyType">Type d'allergie *</Label>
                                            <Select
                                                value={formData.allergyType}
                                                onValueChange={(value: AllergyType) =>
                                                    setFormData(prev => ({ ...prev, allergyType: value }))
                                                }
                                            >
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="Alimentaire">Alimentaire</SelectItem>
                                                    <SelectItem value="Médicamenteuse">Médicamenteuse</SelectItem>
                                                    <SelectItem value="Environnementale">Environnementale</SelectItem>
                                                    <SelectItem value="Autre">Autre</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        <div>
                                            <Label htmlFor="allergen">Allergène *</Label>
                                            <Input
                                                id="allergen"
                                                value={formData.allergen}
                                                onChange={(e) => setFormData(prev => ({ ...prev, allergen: e.target.value }))}
                                                placeholder="Ex: Arachides, Pénicilline..."
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <Label htmlFor="severity">Sévérité *</Label>
                                            <Select
                                                value={formData.severity}
                                                onValueChange={(value: AllergySeverity) =>
                                                    setFormData(prev => ({ ...prev, severity: value }))
                                                }
                                            >
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="Légère">Légère</SelectItem>
                                                    <SelectItem value="Modérée">Modérée</SelectItem>
                                                    <SelectItem value="Sévère">Sévère</SelectItem>
                                                    <SelectItem value="Critique">Critique</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        <div>
                                            <Label htmlFor="diagnosedDate">Date de diagnostic</Label>
                                            <Input
                                                id="diagnosedDate"
                                                type="date"
                                                value={formData.diagnosedDate}
                                                onChange={(e) => setFormData(prev => ({ ...prev, diagnosedDate: e.target.value }))}
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <Label htmlFor="symptoms">Symptômes (séparés par des virgules)</Label>
                                        <Input
                                            id="symptoms"
                                            value={formData.symptoms}
                                            onChange={(e) => setFormData(prev => ({ ...prev, symptoms: e.target.value }))}
                                            placeholder="Ex: Éruption cutanée, Démangeaisons, Gonflement"
                                        />
                                    </div>

                                    <div>
                                        <Label htmlFor="medication">Médicament d'urgence</Label>
                                        <Input
                                            id="medication"
                                            value={formData.medication}
                                            onChange={(e) => setFormData(prev => ({ ...prev, medication: e.target.value }))}
                                            placeholder="Ex: EpiPen, Antihistaminique"
                                        />
                                    </div>

                                    <div>
                                        <Label htmlFor="emergencyProtocol">Protocole d'urgence</Label>
                                        <Textarea
                                            id="emergencyProtocol"
                                            value={formData.emergencyProtocol}
                                            onChange={(e) => setFormData(prev => ({ ...prev, emergencyProtocol: e.target.value }))}
                                            rows={4}
                                            placeholder="Décrivez les mesures à prendre en cas de réaction..."
                                        />
                                    </div>

                                    <div className="flex justify-end gap-2">
                                        <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                                            Annuler
                                        </Button>
                                        <Button type="submit">Enregistrer</Button>
                                    </div>
                                </form>
                            </DialogContent>
                        </Dialog>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                    <Card>
                        <CardContent className="p-6">
                            <div className="text-center">
                                <p className="text-sm text-muted-foreground mb-1">Total</p>
                                <p className="text-3xl font-bold">{allergies.length}</p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-6">
                            <div className="text-center">
                                <p className="text-sm text-muted-foreground mb-1">Critiques</p>
                                <p className="text-3xl font-bold text-red-600">
                                    {allergies.filter(a => a.severity === 'Critique').length}
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-6">
                            <div className="text-center">
                                <p className="text-sm text-muted-foreground mb-1">Sévères</p>
                                <p className="text-3xl font-bold text-orange-600">
                                    {allergies.filter(a => a.severity === 'Sévère').length}
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-6">
                            <div className="text-center">
                                <p className="text-sm text-muted-foreground mb-1">Alimentaires</p>
                                <p className="text-3xl font-bold text-blue-600">
                                    {allergies.filter(a => a.allergyType === 'Alimentaire').length}
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Liste des allergies</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {allergies.length === 0 ? (
                            <div className="text-center py-12">
                                <AlertCircle className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                                <h3 className="text-xl font-semibold mb-2">Aucune allergie enregistrée</h3>
                                <p className="text-muted-foreground mb-4">
                                    Commencez à enregistrer les allergies du patient
                                </p>
                                <Button onClick={() => setIsDialogOpen(true)}>
                                    <Plus className="h-4 w-4 mr-2" />
                                    Ajouter la première allergie
                                </Button>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {allergies.map((allergy) => (
                                    <div
                                        key={allergy.id}
                                        className="border rounded-lg p-6 hover:bg-muted/50 transition-colors"
                                    >
                                        <div className="flex items-start justify-between mb-4">
                                            <div className="flex items-center gap-4">
                                                {getTypeIcon(allergy.allergyType)}
                                                <div>
                                                    <h4 className="font-semibold text-lg">{allergy.allergen}</h4>
                                                    <p className="text-sm text-muted-foreground">{allergy.allergyType}</p>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-2">
                                                <Badge variant={getSeverityColor(allergy.severity) as any}>
                                                    {allergy.severity}
                                                </Badge>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleDelete(allergy.id)}
                                                >
                                                    <Trash2 className="h-4 w-4 text-destructive" />
                                                </Button>
                                            </div>
                                        </div>

                                        {allergy.symptoms.length > 0 && (
                                            <div className="mb-3">
                                                <p className="text-sm font-medium mb-1">Symptômes:</p>
                                                <div className="flex flex-wrap gap-2">
                                                    {allergy.symptoms.map((symptom, idx) => (
                                                        <Badge key={idx} variant="outline">{symptom}</Badge>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {allergy.emergencyProtocol && (
                                            <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-3">
                                                <div className="flex items-start gap-2">
                                                    <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5" />
                                                    <div>
                                                        <p className="font-medium text-red-900 dark:text-red-100 mb-1">
                                                            Protocole d'urgence
                                                        </p>
                                                        <p className="text-sm text-red-800 dark:text-red-200">
                                                            {allergy.emergencyProtocol}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {allergy.medication && (
                                            <div className="text-sm">
                                                <span className="font-medium">Médicament d'urgence:</span> {allergy.medication}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </main>

            <Footer />
        </div>
    );
};

export default AllergyManager;
