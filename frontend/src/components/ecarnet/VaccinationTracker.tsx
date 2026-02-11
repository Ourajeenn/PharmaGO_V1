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
import { Syringe, Plus, Calendar, AlertCircle, CheckCircle, Clock, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { VACCINE_SCHEDULE } from '@/lib/ecarnet/vaccineCalculator';
import type { Vaccination } from '@/types/ecarnet';

const VaccinationTracker = () => {
    const navigate = useNavigate();
    const {
        currentPatient,
        getPatientVaccinations,
        addVaccination,
        updateVaccination
    } = useECarnet();

    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [formData, setFormData] = useState({
        vaccineName: '',
        disease: '',
        administrationDate: '',
        batchNumber: '',
        administeredBy: '',
        notes: '',
    });

    if (!currentPatient) {
        navigate('/ecarnet');
        return null;
    }

    const vaccinations = getPatientVaccinations(currentPatient.id);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        addVaccination({
            patientId: currentPatient.id,
            vaccineName: formData.vaccineName,
            disease: formData.disease,
            isRequired: true,
            administrationDate: formData.administrationDate,
            batchNumber: formData.batchNumber,
            administeredBy: formData.administeredBy,
            notes: formData.notes,
            status: 'À jour',
        });

        toast.success('Vaccin ajouté avec succès');
        setIsDialogOpen(false);
        setFormData({
            vaccineName: '',
            disease: '',
            administrationDate: '',
            batchNumber: '',
            administeredBy: '',
            notes: '',
        });
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'À jour':
                return <CheckCircle className="h-5 w-5 text-green-600" />;
            case 'En retard':
                return <AlertCircle className="h-5 w-5 text-red-600" />;
            case 'À venir':
                return <Clock className="h-5 w-5 text-blue-600" />;
            default:
                return <AlertCircle className="h-5 w-5 text-gray-400" />;
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'À jour':
                return <Badge className="bg-green-100 text-green-800">À jour</Badge>;
            case 'En retard':
                return <Badge variant="destructive">En retard</Badge>;
            case 'À venir':
                return <Badge variant="secondary">À venir</Badge>;
            default:
                return <Badge variant="outline">Non fait</Badge>;
        }
    };

    const completionRate = vaccinations.length > 0
        ? Math.round((vaccinations.filter(v => v.status === 'À jour').length / vaccinations.length) * 100)
        : 0;

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
                            <Syringe className="h-8 w-8 text-primary" />
                            <div>
                                <h1 className="text-3xl font-bold">Carnet de vaccination</h1>
                                <p className="text-muted-foreground">
                                    Suivi des vaccinations
                                </p>
                            </div>
                        </div>

                        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                            <DialogTrigger asChild>
                                <Button>
                                    <Plus className="h-5 w-5 mr-2" />
                                    Ajouter un vaccin
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl">
                                <DialogHeader>
                                    <DialogTitle>Ajouter un vaccin</DialogTitle>
                                </DialogHeader>
                                <form onSubmit={handleSubmit} className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <Label htmlFor="vaccineName">Nom du vaccin *</Label>
                                            <Select
                                                value={formData.vaccineName}
                                                onValueChange={(value) => {
                                                    const vaccine = VACCINE_SCHEDULE.find(v => v.vaccineName === value);
                                                    setFormData(prev => ({
                                                        ...prev,
                                                        vaccineName: value,
                                                        disease: vaccine?.disease || '',
                                                    }));
                                                }}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Sélectionner" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {VACCINE_SCHEDULE.map(vaccine => (
                                                        <SelectItem key={vaccine.vaccineName} value={vaccine.vaccineName}>
                                                            {vaccine.vaccineName}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        <div>
                                            <Label htmlFor="administrationDate">Date d'administration *</Label>
                                            <Input
                                                id="administrationDate"
                                                type="date"
                                                value={formData.administrationDate}
                                                onChange={(e) => setFormData(prev => ({ ...prev, administrationDate: e.target.value }))}
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <Label htmlFor="disease">Maladie ciblée</Label>
                                        <Input
                                            id="disease"
                                            value={formData.disease}
                                            onChange={(e) => setFormData(prev => ({ ...prev, disease: e.target.value }))}
                                            readOnly
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <Label htmlFor="batchNumber">Numéro de lot</Label>
                                            <Input
                                                id="batchNumber"
                                                value={formData.batchNumber}
                                                onChange={(e) => setFormData(prev => ({ ...prev, batchNumber: e.target.value }))}
                                            />
                                        </div>

                                        <div>
                                            <Label htmlFor="administeredBy">Administré par</Label>
                                            <Input
                                                id="administeredBy"
                                                value={formData.administeredBy}
                                                onChange={(e) => setFormData(prev => ({ ...prev, administeredBy: e.target.value }))}
                                                placeholder="Dr. Nom"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <Label htmlFor="notes">Notes</Label>
                                        <Textarea
                                            id="notes"
                                            value={formData.notes}
                                            onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                                            rows={3}
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

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-muted-foreground">Taux de complétion</p>
                                    <p className="text-3xl font-bold">{completionRate}%</p>
                                </div>
                                <Syringe className="h-10 w-10 text-primary" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-muted-foreground">Vaccins à jour</p>
                                    <p className="text-3xl font-bold text-green-600">
                                        {vaccinations.filter(v => v.status === 'À jour').length}
                                    </p>
                                </div>
                                <CheckCircle className="h-10 w-10 text-green-600" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-muted-foreground">En retard</p>
                                    <p className="text-3xl font-bold text-red-600">
                                        {vaccinations.filter(v => v.status === 'En retard').length}
                                    </p>
                                </div>
                                <AlertCircle className="h-10 w-10 text-red-600" />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Liste des vaccinations</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {vaccinations.length === 0 ? (
                            <div className="text-center py-12">
                                <Syringe className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                                <h3 className="text-xl font-semibold mb-2">Aucun vaccin enregistré</h3>
                                <p className="text-muted-foreground mb-4">
                                    Commencez à suivre les vaccinations
                                </p>
                                <Button onClick={() => setIsDialogOpen(true)}>
                                    <Plus className="h-4 w-4 mr-2" />
                                    Ajouter le premier vaccin
                                </Button>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {vaccinations.map((vaccination) => (
                                    <div
                                        key={vaccination.id}
                                        className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                                    >
                                        <div className="flex items-center gap-4">
                                            {getStatusIcon(vaccination.status)}
                                            <div>
                                                <h4 className="font-semibold">{vaccination.vaccineName}</h4>
                                                <p className="text-sm text-muted-foreground">{vaccination.disease}</p>
                                                {vaccination.administrationDate && (
                                                    <p className="text-sm text-muted-foreground mt-1">
                                                        <Calendar className="h-3 w-3 inline mr-1" />
                                                        {format(new Date(vaccination.administrationDate), 'dd MMMM yyyy', { locale: fr })}
                                                    </p>
                                                )}
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-4">
                                            {getStatusBadge(vaccination.status)}
                                            {vaccination.isRequired && (
                                                <Badge variant="outline">Obligatoire</Badge>
                                            )}
                                        </div>
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

export default VaccinationTracker;
