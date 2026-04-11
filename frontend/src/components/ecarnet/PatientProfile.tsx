import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/core/Header';
import Footer from '@/components/core/Footer';
import { useECarnet } from '@/contexts/ECarnetContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { User, Save, Plus, Trash2, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import type { Patient, Gender, BloodGroup } from '@/types/ecarnet';
import { auditService } from "@/services/AuditService";

const PatientProfile = () => {
    const navigate = useNavigate();
    const {
        currentPatient,
        updatePatient,
        addPatient,
        setCurrentPatient,
        getPatientEmergencyContacts,
        addEmergencyContact,
        deleteEmergencyContact
    } = useECarnet();

    const [realContacts, setRealContacts] = useState<any[]>([]);

    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        dateOfBirth: '',
        gender: 'M' as Gender,
        bloodGroup: 'O+' as BloodGroup,
        phone: '',
        email: '',
        address: '',
        city: '',
        relationship: 'Enfant' as string,
        emergencyContactName: '',
        emergencyContactPhone: '',
        emergencyContactRelationship: '',
        chronicDiseases: '',
        allergies: '',
        treatmentsSummary: '',
    });

    useEffect(() => {
        if (currentPatient) {
            setFormData({
                firstName: currentPatient.firstName,
                lastName: currentPatient.lastName,
                dateOfBirth: currentPatient.dateOfBirth,
                gender: currentPatient.gender,
                bloodGroup: currentPatient.bloodGroup,
                phone: currentPatient.phone || '',
                email: currentPatient.email || '',
                address: currentPatient.address || '',
                city: currentPatient.city || '',
                relationship: currentPatient.relationship || 'Moi',
                emergencyContactName: currentPatient.emergencyContacts[0]?.name || '',
                emergencyContactPhone: currentPatient.emergencyContacts[0]?.phone || '',
                emergencyContactRelationship: currentPatient.emergencyContacts[0]?.relationship || '',
                chronicDiseases: currentPatient.chronicDiseases?.join(', ') || '',
                allergies: currentPatient.allergies?.join(', ') || '',
                treatmentsSummary: currentPatient.treatmentsSummary?.join(', ') || '',
            });

            const contacts = getPatientEmergencyContacts(currentPatient.id);
            setRealContacts(contacts);
        }
    }, [currentPatient, getPatientEmergencyContacts]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const patientData = {
            firstName: formData.firstName,
            lastName: formData.lastName,
            dateOfBirth: formData.dateOfBirth,
            gender: formData.gender,
            bloodGroup: formData.bloodGroup,
            phone: formData.phone,
            email: formData.email,
            address: formData.address,
            city: formData.city,
            relationship: formData.relationship,
            chronicDiseases: formData.chronicDiseases ? formData.chronicDiseases.split(',').map(s => s.trim()).filter(s => s) : [],
            allergies: formData.allergies ? formData.allergies.split(',').map(s => s.trim()).filter(s => s) : [],
            treatmentsSummary: formData.treatmentsSummary ? formData.treatmentsSummary.split(',').map(s => s.trim()).filter(s => s) : [],
            emergencyContacts: [], // Handled separately now
        };

        if (currentPatient) {
            await updatePatient(currentPatient.id, patientData);
            auditService.log('PROFILE_UPDATE', currentPatient.id, {
                changes: Object.keys(patientData)
            });
            toast.success('Profil mis à jour');
        } else {
            const newPatient = await addPatient(patientData);
            if (newPatient) {
                auditService.log('PROFILE_UPDATE', newPatient.id, {
                    action: 'CREATE_PROFILE'
                });
                setCurrentPatient(newPatient);
                toast.success('Patient créé avec succès');

                // If we have emergency contact info in form, add it for the new patient
                if (formData.emergencyContactName) {
                    await addEmergencyContact({
                        patientId: newPatient.id,
                        name: formData.emergencyContactName,
                        phone: formData.emergencyContactPhone,
                        relationship: formData.emergencyContactRelationship,
                        isPrimary: true
                    });
                }

                navigate('/ecarnet');
            }
        }
    };

    const handleAddContact = async () => {
        if (!currentPatient) return;
        if (!formData.emergencyContactName || !formData.emergencyContactPhone) {
            toast.error("Nom et téléphone requis");
            return;
        }

        await addEmergencyContact({
            patientId: currentPatient.id,
            name: formData.emergencyContactName,
            phone: formData.emergencyContactPhone,
            relationship: formData.emergencyContactRelationship,
            isPrimary: false
        });

        // Clear sub-form
        setFormData(prev => ({
            ...prev,
            emergencyContactName: '',
            emergencyContactPhone: '',
            emergencyContactRelationship: ''
        }));
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
                                <User className="h-8 w-8 text-primary" />
                                <div>
                                    <CardTitle>Informations du patient</CardTitle>
                                    <p className="text-sm text-muted-foreground">
                                        Gérez les informations personnelles et de contact
                                    </p>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSubmit} className="space-y-6">
                                {/* Personal Info */}
                                <div className="space-y-4">
                                    <h3 className="font-semibold text-lg">Informations personnelles</h3>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <Label>Prénom *</Label>
                                            <Input
                                                value={formData.firstName}
                                                onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                                                required
                                            />
                                        </div>
                                        <div>
                                            <Label>Nom *</Label>
                                            <Input
                                                value={formData.lastName}
                                                onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-3 gap-4">
                                        <div>
                                            <Label>Date de naissance *</Label>
                                            <Input
                                                type="date"
                                                value={formData.dateOfBirth}
                                                onChange={(e) => setFormData(prev => ({ ...prev, dateOfBirth: e.target.value }))}
                                                required
                                            />
                                        </div>
                                        <div>
                                            <Label>Sexe *</Label>
                                            <Select
                                                value={formData.gender}
                                                onValueChange={(value: Gender) => setFormData(prev => ({ ...prev, gender: value }))}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="M">Masculin</SelectItem>
                                                    <SelectItem value="F">Féminin</SelectItem>
                                                    <SelectItem value="Autre">Autre</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div>
                                            <Label>Groupe sanguin *</Label>
                                            <Select
                                                value={formData.bloodGroup}
                                                onValueChange={(value: BloodGroup) => setFormData(prev => ({ ...prev, bloodGroup: value }))}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(group => (
                                                        <SelectItem key={group} value={group}>{group}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <Label>Lien de parenté *</Label>
                                            <Select
                                                value={formData.relationship}
                                                onValueChange={(value) => setFormData(prev => ({ ...prev, relationship: value }))}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Choisir le lien" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="Moi">Moi-même</SelectItem>
                                                    <SelectItem value="Enfant">Enfant</SelectItem>
                                                    <SelectItem value="Époux/se">Époux/se</SelectItem>
                                                    <SelectItem value="Parent">Parent</SelectItem>
                                                    <SelectItem value="Autre">Autre</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="flex items-end">
                                            <p className="text-xs text-muted-foreground pb-2">
                                                Indiquez la relation avec le titulaire du compte principal.
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Contact Info */}
                                <div className="space-y-4">
                                    <h3 className="font-semibold text-lg">Coordonnées</h3>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <Label>Téléphone</Label>
                                            <Input
                                                type="tel"
                                                value={formData.phone}
                                                onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                                                placeholder="+225 XX XX XX XX XX"
                                            />
                                        </div>
                                        <div>
                                            <Label>Email</Label>
                                            <Input
                                                type="email"
                                                value={formData.email}
                                                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                                                placeholder="email@example.com"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <Label>Adresse</Label>
                                            <Input
                                                value={formData.address}
                                                onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                                            />
                                        </div>
                                        <div>
                                            <Label>Ville</Label>
                                            <Input
                                                value={formData.city}
                                                onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Medical Info */}
                                <div className="space-y-4">
                                    <h3 className="font-semibold text-lg">Informations Médicales</h3>
                                    <div>
                                        <Label>Maladies Chroniques (séparées par des virgules)</Label>
                                        <Input
                                            value={formData.chronicDiseases}
                                            onChange={(e) => setFormData(prev => ({ ...prev, chronicDiseases: e.target.value }))}
                                            placeholder="Ex: Diabète, Hypertension, Asthme"
                                        />
                                    </div>
                                    <div>
                                        <Label>Allergies Connues (séparées par des virgules)</Label>
                                        <Input
                                            value={formData.allergies}
                                            onChange={(e) => setFormData(prev => ({ ...prev, allergies: e.target.value }))}
                                            placeholder="Ex: Arachides, Pénicilline"
                                        />
                                    </div>
                                    <div>
                                        <Label>Traitements en cours (séparés par des virgules)</Label>
                                        <Input
                                            value={formData.treatmentsSummary}
                                            onChange={(e) => setFormData(prev => ({ ...prev, treatmentsSummary: e.target.value }))}
                                            placeholder="Ex: Doliprane 1000mg, Amoxicilline"
                                        />
                                    </div>
                                </div>

                                {/* Emergency Contact */}
                                <div className="space-y-4">
                                    <h3 className="font-semibold text-lg">Contact d'urgence</h3>

                                    <div className="space-y-4">
                                        {realContacts.map((contact) => (
                                            <div key={contact.id} className="flex justify-between items-center p-3 bg-slate-50 rounded-xl border border-slate-100">
                                                <div>
                                                    <p className="font-bold">{contact.name} {contact.isPrimary && <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full ml-2">Principal</span>}</p>
                                                    <p className="text-xs text-muted-foreground">{contact.relationship} • {contact.phone}</p>
                                                </div>
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => deleteEmergencyContact(contact.id)}
                                                    className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="grid grid-cols-3 gap-4 p-4 border-2 border-dashed border-slate-200 rounded-2xl bg-white/50">
                                        <div className="col-span-3">
                                            <p className="text-xs font-bold text-muted-foreground uppercase mb-2">Ajouter un nouveau contact</p>
                                        </div>
                                        <div>
                                            <Label>Nom</Label>
                                            <Input
                                                value={formData.emergencyContactName}
                                                onChange={(e) => setFormData(prev => ({ ...prev, emergencyContactName: e.target.value }))}
                                                placeholder="Nom complet"
                                            />
                                        </div>
                                        <div>
                                            <Label>Téléphone</Label>
                                            <Input
                                                type="tel"
                                                value={formData.emergencyContactPhone}
                                                onChange={(e) => setFormData(prev => ({ ...prev, emergencyContactPhone: e.target.value }))}
                                                placeholder="+225..."
                                            />
                                        </div>
                                        <div className="flex gap-2 items-end">
                                            <div className="flex-1">
                                                <Label>Relation</Label>
                                                <Input
                                                    value={formData.emergencyContactRelationship}
                                                    onChange={(e) => setFormData(prev => ({ ...prev, emergencyContactRelationship: e.target.value }))}
                                                    placeholder="Lien"
                                                />
                                            </div>
                                            <Button type="button" size="icon" onClick={handleAddContact}>
                                                <Plus className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex justify-end gap-2 pt-4">
                                    <Button type="button" variant="outline" onClick={() => navigate('/ecarnet')}>
                                        Annuler
                                    </Button>
                                    <Button type="submit">
                                        <Save className="h-4 w-4 mr-2" />
                                        {currentPatient ? 'Enregistrer' : 'Créer le patient'}
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                </div>
            </main >

            <Footer />
        </div >
    );
};

export default PatientProfile;
