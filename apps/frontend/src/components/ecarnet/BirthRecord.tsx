import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/core/Header';
import Footer from '@/components/core/Footer';
import { useECarnet } from '@/contexts/ECarnetContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FileHeart, Save, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';

const BirthRecord = () => {
    const navigate = useNavigate();
    const { currentPatient, getBirthRecord, addBirthRecord, updateBirthRecord } = useECarnet();

    const [formData, setFormData] = useState({
        birthWeight: '',
        birthHeight: '',
        headCircumference: '',
        apgarScore1min: '',
        apgarScore5min: '',
        gestationalAge: '',
        deliveryType: 'Voie basse' as 'Voie basse' | 'Césarienne' | 'Assistée',
        complications: '',
        screeningDone: false,
        screeningDate: '',
        screeningResults: '',
        doctorNotes: '',
    });

    const existingRecord = currentPatient ? getBirthRecord(currentPatient.id) : undefined;

    useEffect(() => {
        if (existingRecord) {
            setFormData({
                birthWeight: existingRecord.birthWeight.toString(),
                birthHeight: existingRecord.birthHeight.toString(),
                headCircumference: existingRecord.headCircumference?.toString() || '',
                apgarScore1min: existingRecord.apgarScore1min?.toString() || '',
                apgarScore5min: existingRecord.apgarScore5min?.toString() || '',
                gestationalAge: existingRecord.gestationalAge?.toString() || '',
                deliveryType: existingRecord.deliveryType || 'Voie basse',
                complications: existingRecord.complications || '',
                screeningDone: existingRecord.neonatalScreening?.done || false,
                screeningDate: existingRecord.neonatalScreening?.date || '',
                screeningResults: existingRecord.neonatalScreening?.results || '',
                doctorNotes: existingRecord.doctorNotes || '',
            });
        }
    }, [existingRecord]);

    if (!currentPatient) {
        navigate('/ecarnet');
        return null;
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const recordData = {
            patientId: currentPatient.id,
            birthWeight: parseInt(formData.birthWeight),
            birthHeight: parseInt(formData.birthHeight),
            headCircumference: formData.headCircumference ? parseInt(formData.headCircumference) : undefined,
            apgarScore1min: formData.apgarScore1min ? parseInt(formData.apgarScore1min) : undefined,
            apgarScore5min: formData.apgarScore5min ? parseInt(formData.apgarScore5min) : undefined,
            gestationalAge: formData.gestationalAge ? parseInt(formData.gestationalAge) : undefined,
            deliveryType: formData.deliveryType,
            complications: formData.complications,
            neonatalScreening: formData.screeningDone ? {
                done: true,
                date: formData.screeningDate,
                results: formData.screeningResults,
            } : undefined,
            doctorNotes: formData.doctorNotes,
        };

        if (existingRecord) {
            updateBirthRecord(existingRecord.id, recordData);
            toast.success('Fiche de naissance mise à jour');
        } else {
            addBirthRecord(recordData);
            toast.success('Fiche de naissance créée');
        }
    };

    return (
        <div className="min-h-screen flex flex-col">
            <Header />

            <main className="flex-1 container mx-auto px-4 py-8">
                <div className="max-w-4xl mx-auto">
                    <Button
                        variant="ghost"
                        onClick={() => navigate('/ecarnet')}
                        className="mb-4"
                    >
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Retour au E-Carnet
                    </Button>

                    <Card>
                        <CardHeader>
                            <div className="flex items-center gap-3">
                                <FileHeart className="h-8 w-8 text-primary" />
                                <div>
                                    <CardTitle>Fiche de naissance</CardTitle>
                                    <p className="text-sm text-muted-foreground">
                                        Enregistrement des informations de naissance
                                    </p>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSubmit} className="space-y-6">
                                {/* Birth Measurements */}
                                <div className="space-y-4">
                                    <h3 className="font-semibold text-lg">Mesures à la naissance</h3>

                                    <div className="grid grid-cols-3 gap-4">
                                        <div>
                                            <Label>Poids (grammes) *</Label>
                                            <Input
                                                type="number"
                                                value={formData.birthWeight}
                                                onChange={(e) => setFormData(prev => ({ ...prev, birthWeight: e.target.value }))}
                                                placeholder="3200"
                                                required
                                            />
                                        </div>
                                        <div>
                                            <Label>Taille (cm) *</Label>
                                            <Input
                                                type="number"
                                                value={formData.birthHeight}
                                                onChange={(e) => setFormData(prev => ({ ...prev, birthHeight: e.target.value }))}
                                                placeholder="49"
                                                required
                                            />
                                        </div>
                                        <div>
                                            <Label>Périmètre crânien (cm)</Label>
                                            <Input
                                                type="number"
                                                value={formData.headCircumference}
                                                onChange={(e) => setFormData(prev => ({ ...prev, headCircumference: e.target.value }))}
                                                placeholder="34"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* APGAR Scores */}
                                <div className="space-y-4">
                                    <h3 className="font-semibold text-lg">Scores APGAR</h3>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <Label>Score à 1 minute (0-10)</Label>
                                            <Input
                                                type="number"
                                                min="0"
                                                max="10"
                                                value={formData.apgarScore1min}
                                                onChange={(e) => setFormData(prev => ({ ...prev, apgarScore1min: e.target.value }))}
                                            />
                                        </div>
                                        <div>
                                            <Label>Score à 5 minutes (0-10)</Label>
                                            <Input
                                                type="number"
                                                min="0"
                                                max="10"
                                                value={formData.apgarScore5min}
                                                onChange={(e) => setFormData(prev => ({ ...prev, apgarScore5min: e.target.value }))}
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Delivery Info */}
                                <div className="space-y-4">
                                    <h3 className="font-semibold text-lg">Informations d'accouchement</h3>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <Label>Âge gestationnel (semaines)</Label>
                                            <Input
                                                type="number"
                                                value={formData.gestationalAge}
                                                onChange={(e) => setFormData(prev => ({ ...prev, gestationalAge: e.target.value }))}
                                                placeholder="39"
                                            />
                                        </div>
                                        <div>
                                            <Label>Type d'accouchement</Label>
                                            <Select
                                                value={formData.deliveryType}
                                                onValueChange={(value: 'Voie basse' | 'Césarienne' | 'Assistée') => setFormData(prev => ({ ...prev, deliveryType: value }))}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="Voie basse">Voie basse</SelectItem>
                                                    <SelectItem value="Césarienne">Césarienne</SelectItem>
                                                    <SelectItem value="Assistée">Assistée</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>

                                    <div>
                                        <Label>Complications</Label>
                                        <Textarea
                                            value={formData.complications}
                                            onChange={(e) => setFormData(prev => ({ ...prev, complications: e.target.value }))}
                                            rows={3}
                                            placeholder="Décrire les complications éventuelles..."
                                        />
                                    </div>
                                </div>

                                {/* Neonatal Screening */}
                                <div className="space-y-4">
                                    <h3 className="font-semibold text-lg">Dépistage néonatal</h3>

                                    <div className="flex items-center gap-2 mb-4">
                                        <input
                                            type="checkbox"
                                            id="screeningDone"
                                            checked={formData.screeningDone}
                                            onChange={(e) => setFormData(prev => ({ ...prev, screeningDone: e.target.checked }))}
                                            className="h-4 w-4"
                                        />
                                        <Label htmlFor="screeningDone" className="cursor-pointer">
                                            Dépistage effectué
                                        </Label>
                                    </div>

                                    {formData.screeningDone && (
                                        <>
                                            <div>
                                                <Label>Date du dépistage</Label>
                                                <Input
                                                    type="date"
                                                    value={formData.screeningDate}
                                                    onChange={(e) => setFormData(prev => ({ ...prev, screeningDate: e.target.value }))}
                                                />
                                            </div>
                                            <div>
                                                <Label>Résultats</Label>
                                                <Textarea
                                                    value={formData.screeningResults}
                                                    onChange={(e) => setFormData(prev => ({ ...prev, screeningResults: e.target.value }))}
                                                    rows={3}
                                                    placeholder="Résultats du dépistage..."
                                                />
                                            </div>
                                        </>
                                    )}
                                </div>

                                {/* Doctor Notes */}
                                <div>
                                    <Label>Notes du médecin</Label>
                                    <Textarea
                                        value={formData.doctorNotes}
                                        onChange={(e) => setFormData(prev => ({ ...prev, doctorNotes: e.target.value }))}
                                        rows={4}
                                        placeholder="Observations du médecin..."
                                    />
                                </div>

                                <div className="flex justify-end gap-2 pt-4">
                                    <Button type="button" variant="outline" onClick={() => navigate('/ecarnet')}>
                                        Annuler
                                    </Button>
                                    <Button type="submit">
                                        <Save className="h-4 w-4 mr-2" />
                                        Enregistrer
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default BirthRecord;
