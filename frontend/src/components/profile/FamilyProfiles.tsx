import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { UserPlus, Bell, AlertTriangle, Pill, Activity, ShieldAlert } from 'lucide-react';
import { familyService, FamilyMember } from '@/services/familyService';
import { useToast } from '@/components/ui/use-toast';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';

const FamilyProfiles = () => {
    const [profiles, setProfiles] = useState<FamilyMember[]>([]);
    const [selectedProfile, setSelectedProfile] = useState<FamilyMember | null>(null);
    const { toast } = useToast();

    useEffect(() => {
        const loadProfiles = async () => {
            const data = await familyService.getFamilyProfiles('user-1');
            setProfiles(data);
            if (data.length > 0) setSelectedProfile(data[0]);
        };
        loadProfiles();
    }, []);

    const handleAcknowledgeReminder = (medName: string, personName: string) => {
        toast({
            title: "Rappel programmé",
            description: `Renouvellement automatique configuré pour ${medName} (${personName}) ✓`,
        });
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Header / Avatars */}
            <div className="flex items-center gap-4 overflow-x-auto pb-4 hide-scrollbar">
                {profiles.map(profile => (
                    <div
                        key={profile.id}
                        className={`flex flex-col items-center gap-2 cursor-pointer transition-all ${selectedProfile?.id === profile.id ? 'scale-110' : 'opacity-70 hover:opacity-100'}`}
                        onClick={() => setSelectedProfile(profile)}
                    >
                        <Avatar className={`h-16 w-16 border-4 ${selectedProfile?.id === profile.id ? 'border-primary shadow-lg' : 'border-slate-200'}`}>
                            <AvatarFallback className="bg-primary/10 text-primary text-xl font-bold">
                                {profile.firstName.charAt(0)}
                            </AvatarFallback>
                        </Avatar>
                        <span className="text-sm font-semibold">{profile.firstName}</span>
                    </div>
                ))}
                <div className="flex flex-col items-center gap-2 cursor-pointer opacity-70 hover:opacity-100 group">
                    <Avatar className="h-16 w-16 border-2 border-dashed border-slate-300 bg-slate-50 group-hover:bg-slate-100">
                        <UserPlus className="h-6 w-6 text-slate-400 group-hover:text-primary transition-colors" />
                    </Avatar>
                    <span className="text-sm font-semibold text-slate-500">Ajouter</span>
                </div>
            </div>

            {/* Profile Details */}
            {selectedProfile && (
                <div className="grid md:grid-cols-2 gap-6">
                    {/* Basic Info & Health Data */}
                    <Card className="shadow-md border-slate-100">
                        <CardHeader className="pb-3 border-b border-slate-50">
                            <CardTitle className="text-xl flex items-center justify-between">
                                {selectedProfile.firstName}
                                <Badge variant="secondary" className="font-normal capitalize">{selectedProfile.relation}</Badge>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-6 space-y-6">
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                    <p className="text-muted-foreground font-medium mb-1">Âge</p>
                                    <p className="font-bold">{new Date().getFullYear() - parseInt(selectedProfile.birthDate.split('-')[0])} ans</p>
                                </div>
                                <div>
                                    <p className="text-muted-foreground font-medium mb-1">Poids</p>
                                    <p className="font-bold">{selectedProfile.weightKg} kg</p>
                                </div>
                            </div>

                            <div>
                                <h4 className="flex items-center gap-2 font-bold mb-3 text-slate-700">
                                    <ShieldAlert className="h-4 w-4 text-rose-500" /> Allergies
                                </h4>
                                <div className="flex flex-wrap gap-2">
                                    {selectedProfile.knownAllergies.length > 0 ? (
                                        selectedProfile.knownAllergies.map(a => <Badge key={a} variant="destructive" className="bg-rose-100 text-rose-700 border-none hover:bg-rose-200">{a}</Badge>)
                                    ) : (
                                        <p className="text-sm text-slate-400 italic">Aucune allergie connue</p>
                                    )}
                                </div>
                            </div>

                            <div>
                                <h4 className="flex items-center gap-2 font-bold mb-3 text-slate-700">
                                    <Activity className="h-4 w-4 text-indigo-500" /> Pathologies
                                </h4>
                                <div className="flex flex-wrap gap-2">
                                    {selectedProfile.chronicConditions.length > 0 ? (
                                        selectedProfile.chronicConditions.map(c => <Badge key={c} variant="outline" className="border-indigo-200 text-indigo-700 bg-indigo-50">{c}</Badge>)
                                    ) : (
                                        <p className="text-sm text-slate-400 italic">Aucune de déclarée</p>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Treatments & Reminders */}
                    <Card className="shadow-md border-slate-100">
                        <CardHeader className="pb-3 border-b border-slate-50">
                            <CardTitle className="text-xl flex items-center gap-2">
                                <Pill className="h-5 w-5 text-primary" />
                                Traitements Actuels
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-6 space-y-4">
                            {selectedProfile.currentMedications.length === 0 && (
                                <p className="text-sm text-muted-foreground italic text-center py-8">Aucun traitement en cours.</p>
                            )}

                            {selectedProfile.currentMedications.map((med, idx) => {
                                const needsRefill = med.remainingDays <= 7;
                                return (
                                    <div key={idx} className={`p-4 rounded-xl border ${needsRefill ? 'bg-orange-50/50 border-orange-200' : 'bg-slate-50 border-slate-100'}`}>
                                        <div className="flex justify-between items-start mb-2">
                                            <div>
                                                <h4 className="font-bold text-slate-900">{med.name}</h4>
                                                <p className="text-sm text-slate-600">{med.frequency}</p>
                                            </div>
                                            {needsRefill && (
                                                <Bell className="h-5 w-5 text-orange-500 animate-pulse" />
                                            )}
                                        </div>

                                        <div className="flex items-center justify-between mt-4">
                                            <div className="text-sm">
                                                <span className={`font-black ${needsRefill ? 'text-orange-600' : 'text-slate-700'}`}>
                                                    {med.remainingDays} jours
                                                </span>
                                                <span className="text-muted-foreground"> restants</span>
                                            </div>
                                            {needsRefill && (
                                                <Button
                                                    size="sm"
                                                    className="bg-orange-500 hover:bg-orange-600"
                                                    onClick={() => handleAcknowledgeReminder(med.name, selectedProfile.firstName)}
                                                >
                                                    Renouveler auto
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                )
                            })}
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    );
};

export default FamilyProfiles;
