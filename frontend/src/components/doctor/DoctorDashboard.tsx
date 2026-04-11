```javascript
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    Plus,
    Search,
    QrCode,
    Users,
    FileText,
    ShieldCheck,
    Stethoscope,
    Printer,
    Send,
    CheckCircle2,
    Clock
} from 'lucide-react';
import { toast } from 'sonner';

const DoctorDashboard = () => {
    const [selectedPatient, setSelectedPatient] = useState<any>(null);
    const [prescriptionSuccess, setPrescriptionSuccess] = useState(false);
    const [qrCodeGenerated, setQrCodeGenerated] = useState(false);

    const patients = [
        { id: '1', name: 'Jean Dupont', lastVisit: '2024-03-01', status: 'Stable' },
        { id: '2', name: 'Marie Koné', lastVisit: '2024-03-05', status: 'Suivi Chronique' },
        { id: '3', name: 'Alassane Touré', lastVisit: '2024-03-08', status: 'Nouveau' },
    ];

    const handlePrescribe = () => {
        setPrescriptionSuccess(true);
        setQrCodeGenerated(true);
        toast.success("e-Prescription créée et sécurisée !");
    };

    return (
        <div className="p-6 bg-slate-50 min-h-screen">
            <div className="max-w-7xl mx-auto space-y-6">
                <header className="flex justify-between items-center mb-8">
                    <div className="flex items-center gap-3">
                        <div className="h-12 w-12 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-indigo-100 shadow-lg">
                            <Stethoscope className="h-7 w-7" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-slate-900">Portail Praticien PharmaGo</h1>
                            <p className="text-slate-500 text-sm flex items-center gap-1">
                                <ShieldCheck className="h-3 w-3 text-emerald-500" /> Espace Sécurisé Professionnel
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="text-right hidden sm:block">
                            <p className="font-bold text-slate-800">Dr. Ibrahim Traoré</p>
                            <p className="text-xs text-slate-500">Cardiologue • ID: 77412</p>
                        </div>
                        <div className="h-10 w-10 rounded-full bg-slate-200 border-2 border-white shadow-sm overflow-hidden">
                            <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=doctor" alt="Dr Profile" />
                        </div>
                    </div>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    {/* Patient Sidebar */}
                    <div className="lg:col-span-1 space-y-6">
                        <Card className="border-0 shadow-sm overflow-hidden">
                            <div className="p-4 bg-slate-900 text-white flex justify-between items-center">
                                <span className="font-bold text-sm flex items-center gap-2">
                                    <Users className="h-4 w-4" /> Patients
                                </span>
                                <Button size="icon" variant="ghost" className="h-8 w-8 text-white/70 hover:text-white">
                                    <Plus className="h-4 w-4" />
                                </Button>
                            </div>
                            <div className="p-3">
                                <div className="relative mb-4">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                    <Input placeholder="Rechercher..." className="pl-9 bg-slate-50 border-slate-100 text-sm h-9" />
                                </div>
                                <div className="space-y-1">
                                    {patients.map(p => (
                                        <button
                                            key={p.id}
                                            onClick={() => setSelectedPatient(p)}
                                            className={`w - full text - left p - 3 rounded - xl transition - all ${ selectedPatient?.id === p.id ? 'bg-indigo-50 border-indigo-100 shadow-sm' : 'hover:bg-slate-50 text-slate-600' } `}
                                        >
                                            <p className="font-bold text-sm text-slate-900">{p.name}</p>
                                            <p className="text-[10px] opacity-70">Dernière visite : {p.lastVisit}</p>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </Card>
                    </div>

                    {/* Main Content Area */}
                    <div className="lg:col-span-3">
                        <Tabs defaultValue="prescription" className="space-y-6">
                            <TabsList className="bg-white p-1 border border-slate-200 w-full justify-start rounded-xl h-12">
                                <TabsTrigger value="prescription" className="rounded-lg h-10 px-6 gap-2">
                                    <FileText className="h-4 w-4" /> Nouvelle Ordonnance
                                </TabsTrigger>
                                <TabsTrigger value="history" className="rounded-lg h-10 px-6 gap-2">
                                    <Clock className="h-4 w-4" /> Historique
                                </TabsTrigger>
                            </TabsList>

                            <TabsContent value="prescription" className="mt-0">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <Card className="md:col-span-2 border-0 shadow-sm">
                                        <CardHeader>
                                            <CardTitle>Rédiger une e-Prescription</CardTitle>
                                            <CardDescription>
                                                Les ordonnances numériques sont cryptées et envoyées directement à la pharmacie.
                                            </CardDescription>
                                        </CardHeader>
                                        <CardContent className="space-y-6">
                                            <div className="p-4 bg-indigo-50/50 rounded-xl border border-indigo-100 flex items-center justify-between">
                                                <div>
                                                    <p className="text-xs text-indigo-700 font-bold uppercase tracking-wider">Patient Sélectionné</p>
                                                    <p className="font-bold text-slate-800">{selectedPatient?.name || "Veuillez choisir un patient"}</p>
                                                </div>
                                                <Badge className="bg-white text-indigo-600 border-indigo-100">Dossier #99201</Badge>
                                            </div>

                                            <div className="space-y-4">
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div className="space-y-2">
                                                        <label className="text-xs font-bold text-slate-500 uppercase">Médicament</label>
                                                        <Input placeholder="Ex: Amoxicilline 500mg" />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <label className="text-xs font-bold text-slate-500 uppercase">Posologie</label>
                                                        <Input placeholder="Ex: 3 fois / jour" />
                                                    </div>
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-xs font-bold text-slate-500 uppercase">Instructions Particulières</label>
                                                    <Input placeholder="Note à l'attention du pharmacien..." />
                                                </div>
                                                <Button
                                                    onClick={handlePrescribe}
                                                    disabled={!selectedPatient}
                                                    className="w-full h-12 bg-indigo-600 hover:bg-indigo-700 text-lg gap-2"
                                                >
                                                    <Send className="h-5 w-5" /> Générer & Envoyer
                                                </Button>
                                            </div>
                                        </CardContent>
                                    </Card>

                                    {/* Sidebar actions: QR Code / Info */}
                                    <div className="space-y-6">
                                        <Card className="border-0 shadow-sm bg-slate-900 text-white overflow-hidden relative">
                                            <div className="absolute top-0 right-0 p-4 opacity-10">
                                                <QrCode className="h-24 w-24" />
                                            </div>
                                            <CardHeader>
                                                <CardTitle className="text-white">QR Code Unique</CardTitle>
                                            </CardHeader>
                                            <CardContent className="flex flex-col items-center py-6">
                                                {qrCodeGenerated ? (
                                                    <div className="bg-white p-4 rounded-xl mb-4 animate-in zoom-in duration-500">
                                                        <img
                                                            src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=prescription_${selectedPatient?.id}`}
alt = "QR Code"
className = "h-32 w-32"
    />
                                                    </div >
                                                ) : (
    <div className="h-32 w-32 bg-white/5 border-2 border-dashed border-white/20 rounded-xl flex items-center justify-center mb-4">
        <QrCode className="h-12 w-12 text-white/20" />
    </div>
)}
<p className="text-xs text-center text-white/60 px-4">
    Le patient pourra scanner ce code pour charger instantanément sa commande.
</p>
{
    qrCodeGenerated && (
        <Button variant="outline" className="mt-6 w-full gap-2 text-slate-900 bg-white">
            <Printer className="h-4 w-4" /> Imprimer Ticket
        </Button>
    )
}
                                            </CardContent >
                                        </Card >

    { prescriptionSuccess && (
        <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-100 flex items-center gap-3 animate-in slide-in-from-right duration-500">
            <CheckCircle2 className="h-6 w-6 text-emerald-600" />
            <p className="text-xs font-medium text-emerald-800">
                Ordonnance envoyée au réseau PharmaGo avec succès.
            </p>
        </div>
    )}
                                    </div >
                                </div >
                            </TabsContent >
                        </Tabs >
                    </div >
                </div >
            </div >
        </div >
    );
};

export default DoctorDashboard;
```
