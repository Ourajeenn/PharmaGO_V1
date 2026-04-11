import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/core/Header';
import Footer from '@/components/core/Footer';
import { useECarnet } from '@/contexts/ECarnetContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { TrendingUp, Plus, Weight, Ruler, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { calculateAgeInMonths, calculateBMI } from '@/lib/ecarnet/growthCalculator';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

const GrowthCharts = () => {
    const navigate = useNavigate();
    const {
        currentPatient,
        getPatientGrowthRecords,
        addGrowthRecord
    } = useECarnet();

    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [formData, setFormData] = useState({
        measurementDate: '',
        weight: '',
        height: '',
        headCircumference: '',
        notes: '',
    });

    if (!currentPatient) {
        navigate('/ecarnet');
        return null;
    }

    const growthRecords = getPatientGrowthRecords(currentPatient.id);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const weight = parseFloat(formData.weight);
        const height = parseFloat(formData.height);
        const ageInMonths = calculateAgeInMonths(currentPatient.dateOfBirth, formData.measurementDate);
        const bmi = calculateBMI(weight, height);

        addGrowthRecord({
            patientId: currentPatient.id,
            measurementDate: formData.measurementDate,
            ageInMonths,
            weight,
            height,
            headCircumference: formData.headCircumference ? parseFloat(formData.headCircumference) : undefined,
            bmi,
            notes: formData.notes,
        });

        toast.success('Mesure ajoutée avec succès');
        setIsDialogOpen(false);
        setFormData({
            measurementDate: '',
            weight: '',
            height: '',
            headCircumference: '',
            notes: '',
        });
    };

    const latestRecord = growthRecords[growthRecords.length - 1];

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
                            <TrendingUp className="h-8 w-8 text-primary" />
                            <div>
                                <h1 className="text-3xl font-bold">Courbes de croissance</h1>
                                <p className="text-muted-foreground">
                                    Suivi de la croissance
                                </p>
                            </div>
                        </div>

                        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                            <DialogTrigger asChild>
                                <Button>
                                    <Plus className="h-5 w-5 mr-2" />
                                    Ajouter une mesure
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl">
                                <DialogHeader>
                                    <DialogTitle>Nouvelle mesure de croissance</DialogTitle>
                                </DialogHeader>
                                <form onSubmit={handleSubmit} className="space-y-4">
                                    <div>
                                        <Label>Date de mesure *</Label>
                                        <Input
                                            type="date"
                                            value={formData.measurementDate}
                                            onChange={(e) => setFormData(prev => ({ ...prev, measurementDate: e.target.value }))}
                                            required
                                        />
                                    </div>

                                    <div className="grid grid-cols-3 gap-4">
                                        <div>
                                            <Label>Poids (kg) *</Label>
                                            <Input
                                                type="number"
                                                step="0.1"
                                                value={formData.weight}
                                                onChange={(e) => setFormData(prev => ({ ...prev, weight: e.target.value }))}
                                                placeholder="12.5"
                                                required
                                            />
                                        </div>
                                        <div>
                                            <Label>Taille (cm) *</Label>
                                            <Input
                                                type="number"
                                                step="0.1"
                                                value={formData.height}
                                                onChange={(e) => setFormData(prev => ({ ...prev, height: e.target.value }))}
                                                placeholder="87.5"
                                                required
                                            />
                                        </div>
                                        <div>
                                            <Label>Périmètre crânien (cm)</Label>
                                            <Input
                                                type="number"
                                                step="0.1"
                                                value={formData.headCircumference}
                                                onChange={(e) => setFormData(prev => ({ ...prev, headCircumference: e.target.value }))}
                                                placeholder="48.0"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <Label>Notes</Label>
                                        <Input
                                            value={formData.notes}
                                            onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                                            placeholder="Observations..."
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

                {latestRecord && (
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                        <Card>
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-muted-foreground">Poids actuel</p>
                                        <p className="text-3xl font-bold">{latestRecord.weight} kg</p>
                                    </div>
                                    <Weight className="h-10 w-10 text-blue-600" />
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-muted-foreground">Taille actuelle</p>
                                        <p className="text-3xl font-bold">{latestRecord.height} cm</p>
                                    </div>
                                    <Ruler className="h-10 w-10 text-green-600" />
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-muted-foreground">IMC</p>
                                        <p className="text-3xl font-bold">{latestRecord.bmi?.toFixed(1)}</p>
                                    </div>
                                    <TrendingUp className="h-10 w-10 text-purple-600" />
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-muted-foreground">Âge</p>
                                        <p className="text-3xl font-bold">{latestRecord.ageInMonths} mois</p>
                                    </div>
                                    <TrendingUp className="h-10 w-10 text-orange-600" />
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                )}

                <Card>
                    <CardHeader>
                        <CardTitle>Historique des mesures</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {growthRecords.length === 0 ? (
                            <div className="text-center py-12">
                                <TrendingUp className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                                <h3 className="text-xl font-semibold mb-2">Aucune mesure enregistrée</h3>
                                <p className="text-muted-foreground mb-4">
                                    Commencez à suivre la croissance
                                </p>
                                <Button onClick={() => setIsDialogOpen(true)}>
                                    <Plus className="h-4 w-4 mr-2" />
                                    Ajouter la première mesure
                                </Button>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b">
                                            <th className="text-left p-3">Date</th>
                                            <th className="text-left p-3">Âge</th>
                                            <th className="text-left p-3">Poids (kg)</th>
                                            <th className="text-left p-3">Taille (cm)</th>
                                            <th className="text-left p-3">PC (cm)</th>
                                            <th className="text-left p-3">IMC</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {growthRecords.map((record) => (
                                            <tr key={record.id} className="border-b hover:bg-muted/50">
                                                <td className="p-3">
                                                    {format(new Date(record.measurementDate), 'dd MMM yyyy', { locale: fr })}
                                                </td>
                                                <td className="p-3">{record.ageInMonths} mois</td>
                                                <td className="p-3 font-semibold">{record.weight}</td>
                                                <td className="p-3 font-semibold">{record.height}</td>
                                                <td className="p-3">{record.headCircumference || '-'}</td>
                                                <td className="p-3">{record.bmi?.toFixed(1) || '-'}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {growthRecords.length > 1 && (
                    <Card className="mt-8">
                        <CardHeader>
                            <CardTitle>Évolution du poids</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="h-64 flex items-end justify-around gap-2 border-b border-l p-4">
                                {growthRecords.map((record, index) => {
                                    const maxWeight = Math.max(...growthRecords.map(r => r.weight));
                                    const height = (record.weight / maxWeight) * 100;

                                    return (
                                        <div key={record.id} className="flex flex-col items-center flex-1">
                                            <div className="text-xs font-semibold mb-1">{record.weight}kg</div>
                                            <div
                                                className="w-full bg-primary rounded-t transition-all hover:bg-primary/80"
                                                style={{ height: `${height}%`, minHeight: '20px' }}
                                            />
                                            <div className="text-xs mt-2 text-muted-foreground">
                                                {record.ageInMonths}m
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </CardContent>
                    </Card>
                )}
            </main>

            <Footer />
        </div>
    );
};

export default GrowthCharts;
