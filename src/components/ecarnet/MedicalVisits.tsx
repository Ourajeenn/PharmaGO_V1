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
import { Calendar, Plus, Activity, Stethoscope, Pill, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import type { MedicalVisit } from '@/types/ecarnet';

const MedicalVisits = () => {
    const navigate = useNavigate();
    const {
        currentPatient,
        getPatientVisits,
        addMedicalVisit
    } = useECarnet();

    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [formData, setFormData] = useState({
        visitDate: '',
        visitType: 'Consultation' as MedicalVisit['visitType'],
        doctorName: '',
        specialty: '',
        reason: '',
        diagnosis: '',
        temperature: '',
        bloodPressure: '',
        recommendations: '',
        nextVisitDate: '',
    });

    if (!currentPatient) {
        navigate('/ecarnet');
        return null;
    }

    const visits = getPatientVisits(currentPatient.id);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        addMedicalVisit({
            patientId: currentPatient.id,
            visitDate: formData.visitDate,
            visitType: formData.visitType,
            doctorName: formData.doctorName,
            specialty: formData.specialty,
            reason: formData.reason,
            diagnosis: formData.diagnosis,
            vitalSigns: {
                temperature: formData.temperature ? parseFloat(formData.temperature) : undefined,
                bloodPressure: formData.bloodPressure || undefined,
            },
            recommendations: formData.recommendations,
            nextVisitDate: formData.nextVisitDate || undefined,
        });

        toast.success('Visite médicale ajoutée');
        setIsDialogOpen(false);
        setFormData({
            visitDate: '',
            visitType: 'Consultation',
            doctorName: '',
            specialty: '',
            reason: '',
            diagnosis: '',
            temperature: '',
            bloodPressure: '',
            recommendations: '',
            nextVisitDate: '',
        });
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
                            <Activity className="h-8 w-8 text-primary" />
                            <div>
                                <h1 className="text-3xl font-bold">Visites médicales</h1>
                                <p className="text-muted-foreground">
                                    Historique des consultations
                                </p>
                            </div>
                        </div>

                        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                            <DialogTrigger asChild>
                                <Button>
                                    <Plus className="h-5 w-5 mr-2" />
                                    Ajouter une visite
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                                <DialogHeader>
                                    <DialogTitle>Nouvelle visite médicale</DialogTitle>
                                </DialogHeader>
                                <form onSubmit={handleSubmit} className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <Label>Date de visite *</Label>
                                            <Input
                                                type="date"
                                                value={formData.visitDate}
                                                onChange={(e) => setFormData(prev => ({ ...prev, visitDate: e.target.value }))}
                                                required
                                            />
                                        </div>
                                        <div>
                                            <Label>Type de visite</Label>
                                            <Select
                                                value={formData.visitType}
                                                onValueChange={(value: MedicalVisit['visitType']) => setFormData(prev => ({ ...prev, visitType: value }))}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="Consultation">Consultation</SelectItem>
                                                    <SelectItem value="Contrôle">Contrôle</SelectItem>
                                                    <SelectItem value="Urgence">Urgence</SelectItem>
                                                    <SelectItem value="Vaccination">Vaccination</SelectItem>
                                                    <SelectItem value="Autre">Autre</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <Label>Médecin *</Label>
                                            <Input
                                                value={formData.doctorName}
                                                onChange={(e) => setFormData(prev => ({ ...prev, doctorName: e.target.value }))}
                                                placeholder="Dr. Nom"
                                                required
                                            />
                                        </div>
                                        <div>
                                            <Label>Spécialité</Label>
                                            <Input
                                                value={formData.specialty}
                                                onChange={(e) => setFormData(prev => ({ ...prev, specialty: e.target.value }))}
                                                placeholder="Pédiatrie, Généraliste..."
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <Label>Motif de consultation *</Label>
                                        <Input
                                            value={formData.reason}
                                            onChange={(e) => setFormData(prev => ({ ...prev, reason: e.target.value }))}
                                            placeholder="Ex: Fièvre, Contrôle de routine..."
                                            required
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <Label>Température (°C)</Label>
                                            <Input
                                                type="number"
                                                step="0.1"
                                                value={formData.temperature}
                                                onChange={(e) => setFormData(prev => ({ ...prev, temperature: e.target.value }))}
                                                placeholder="37.0"
                                            />
                                        </div>
                                        <div>
                                            <Label>Tension artérielle</Label>
                                            <Input
                                                value={formData.bloodPressure}
                                                onChange={(e) => setFormData(prev => ({ ...prev, bloodPressure: e.target.value }))}
                                                placeholder="120/80"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <Label>Diagnostic</Label>
                                        <Textarea
                                            value={formData.diagnosis}
                                            onChange={(e) => setFormData(prev => ({ ...prev, diagnosis: e.target.value }))}
                                            rows={3}
                                            placeholder="Diagnostic du médecin..."
                                        />
                                    </div>

                                    <div>
                                        <Label>Recommandations</Label>
                                        <Textarea
                                            value={formData.recommendations}
                                            onChange={(e) => setFormData(prev => ({ ...prev, recommendations: e.target.value }))}
                                            rows={3}
                                            placeholder="Conseils et recommandations..."
                                        />
                                    </div>

                                    <div>
                                        <Label>Prochaine visite</Label>
                                        <Input
                                            type="date"
                                            value={formData.nextVisitDate}
                                            onChange={(e) => setFormData(prev => ({ ...prev, nextVisitDate: e.target.value }))}
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
                                    <p className="text-sm text-muted-foreground">Total visites</p>
                                    <p className="text-3xl font-bold">{visits.length}</p>
                                </div>
                                <Activity className="h-10 w-10 text-primary" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-muted-foreground">Cette année</p>
                                    <p className="text-3xl font-bold">
                                        {visits.filter(v => new Date(v.visitDate).getFullYear() === new Date().getFullYear()).length}
                                    </p>
                                </div>
                                <Calendar className="h-10 w-10 text-blue-600" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-muted-foreground">Consultations</p>
                                    <p className="text-3xl font-bold">
                                        {visits.filter(v => v.visitType === 'Consultation').length}
                                    </p>
                                </div>
                                <Stethoscope className="h-10 w-10 text-green-600" />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Timeline des visites</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {visits.length === 0 ? (
                            <div className="text-center py-12">
                                <Activity className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                                <h3 className="text-xl font-semibold mb-2">Aucune visite enregistrée</h3>
                                <p className="text-muted-foreground mb-4">
                                    Commencez à enregistrer les consultations médicales
                                </p>
                                <Button onClick={() => setIsDialogOpen(true)}>
                                    <Plus className="h-4 w-4 mr-2" />
                                    Ajouter la première visite
                                </Button>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                {visits.map((visit, index) => (
                                    <div key={visit.id} className="relative">
                                        {index !== visits.length - 1 && (
                                            <div className="absolute left-6 top-12 bottom-0 w-0.5 bg-border" />
                                        )}

                                        <div className="flex gap-4">
                                            <div className="flex-shrink-0">
                                                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                                                    <Calendar className="h-6 w-6 text-primary" />
                                                </div>
                                            </div>

                                            <Card className="flex-1">
                                                <CardContent className="p-6">
                                                    <div className="flex items-start justify-between mb-4">
                                                        <div>
                                                            <h4 className="font-semibold text-lg">{visit.reason}</h4>
                                                            <p className="text-sm text-muted-foreground">
                                                                {format(new Date(visit.visitDate), 'dd MMMM yyyy', { locale: fr })}
                                                            </p>
                                                        </div>
                                                        <Badge>{visit.visitType}</Badge>
                                                    </div>

                                                    <div className="grid grid-cols-2 gap-4 mb-4">
                                                        <div>
                                                            <p className="text-sm font-medium">Médecin</p>
                                                            <p className="text-sm text-muted-foreground">{visit.doctorName}</p>
                                                        </div>
                                                        {visit.specialty && (
                                                            <div>
                                                                <p className="text-sm font-medium">Spécialité</p>
                                                                <p className="text-sm text-muted-foreground">{visit.specialty}</p>
                                                            </div>
                                                        )}
                                                    </div>

                                                    {visit.vitalSigns && (
                                                        <div className="flex gap-4 mb-4 p-3 bg-muted rounded-lg">
                                                            {visit.vitalSigns.temperature && (
                                                                <div>
                                                                    <p className="text-xs text-muted-foreground">Température</p>
                                                                    <p className="font-medium">{visit.vitalSigns.temperature}°C</p>
                                                                </div>
                                                            )}
                                                            {visit.vitalSigns.bloodPressure && (
                                                                <div>
                                                                    <p className="text-xs text-muted-foreground">Tension</p>
                                                                    <p className="font-medium">{visit.vitalSigns.bloodPressure}</p>
                                                                </div>
                                                            )}
                                                        </div>
                                                    )}

                                                    {visit.diagnosis && (
                                                        <div className="mb-4">
                                                            <p className="text-sm font-medium mb-1">Diagnostic</p>
                                                            <p className="text-sm text-muted-foreground">{visit.diagnosis}</p>
                                                        </div>
                                                    )}

                                                    {visit.prescriptions && visit.prescriptions.length > 0 && (
                                                        <div className="mb-4">
                                                            <p className="text-sm font-medium mb-2 flex items-center gap-2">
                                                                <Pill className="h-4 w-4" />
                                                                Prescriptions
                                                            </p>
                                                            <div className="space-y-2">
                                                                {visit.prescriptions.map((prescription, idx) => (
                                                                    <div key={idx} className="text-sm p-2 bg-muted rounded">
                                                                        <p className="font-medium">{prescription.medication}</p>
                                                                        <p className="text-muted-foreground">
                                                                            {prescription.dosage} - {prescription.duration}
                                                                        </p>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )}

                                                    {visit.recommendations && (
                                                        <div className="mb-4">
                                                            <p className="text-sm font-medium mb-1">Recommandations</p>
                                                            <p className="text-sm text-muted-foreground">{visit.recommendations}</p>
                                                        </div>
                                                    )}

                                                    {visit.nextVisitDate && (
                                                        <div className="flex items-center gap-2 text-sm text-primary">
                                                            <Calendar className="h-4 w-4" />
                                                            Prochaine visite: {format(new Date(visit.nextVisitDate), 'dd MMMM yyyy', { locale: fr })}
                                                        </div>
                                                    )}
                                                </CardContent>
                                            </Card>
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

export default MedicalVisits;
