import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, FileText, Clock, CheckCircle, XCircle, Package, Truck, Calendar } from "lucide-react";
import PrescriptionUpload from "@/components/medicine/PrescriptionUpload";
import { PrescriptionPhotoGuide } from "@/components/medicine/PrescriptionPhotoGuide";
import { mockPrescriptions, Prescription } from "@/data/prescriptionMockData";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

const PrescriptionsPage = () => {
    const navigate = useNavigate();
    const [prescriptions, setPrescriptions] = useState<Prescription[]>(mockPrescriptions);

    const handleUpload = (file: File) => {
        // Simulate adding a new prescription
        const newPrescription: Prescription = {
            id: `ord-${Date.now()}`,
            status: 'pending',
            date: new Date().toISOString(),
            image: URL.createObjectURL(file),
            notes: "Nouvelle ordonnance téléchargée"
        };
        setPrescriptions([newPrescription, ...prescriptions]);
    };

    const getStatusBadge = (status: Prescription['status']) => {
        switch (status) {
            case 'pending':
                return <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-200">En attente</Badge>;
            case 'validated':
                return <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-200">Validée</Badge>;
            case 'preparing':
                return <Badge variant="outline" className="bg-purple-100 text-purple-800 border-purple-200">En préparation</Badge>;
            case 'ready':
                return <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">Prête</Badge>;
            case 'delivered':
                return <Badge variant="outline" className="bg-gray-100 text-gray-800 border-gray-200">Livrée</Badge>;
            case 'rejected':
                return <Badge variant="destructive">Rejetée</Badge>;
            default:
                return <Badge variant="secondary">{status}</Badge>;
        }
    };

    const getStatusIcon = (status: Prescription['status']) => {
        switch (status) {
            case 'pending': return <Clock className="h-5 w-5 text-yellow-500" />;
            case 'validated': return <CheckCircle className="h-5 w-5 text-blue-500" />;
            case 'preparing': return <Package className="h-5 w-5 text-purple-500" />;
            case 'ready': return <CheckCircle className="h-5 w-5 text-green-500" />;
            case 'delivered': return <Truck className="h-5 w-5 text-gray-500" />;
            case 'rejected': return <XCircle className="h-5 w-5 text-red-500" />;
        }
    };

    return (
        <div className="min-h-screen bg-background pb-20">
            <div className="bg-gradient-to-r from-primary to-secondary text-white p-6 pb-12">
                <div className="container mx-auto">
                    <Button
                        variant="ghost"
                        onClick={() => navigate('/')}
                        className="flex items-center gap-2 mb-4 text-white hover:bg-white/20 transition-colors"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Retour à l'accueil
                    </Button>
                    <h1 className="text-3xl font-bold mb-2">Mes Ordonnances</h1>
                    <p className="opacity-90">Gérez vos ordonnances et suivez leur traitement en temps réel.</p>
                </div>
            </div>

            <div className="container mx-auto px-4 -mt-8">
                <PrescriptionPhotoGuide />

                <Card className="mb-8 shadow-lg border-0 bg-white/50 backdrop-blur-sm border-primary/10">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <span>📄</span>
                            Téléversez votre ordonnance
                        </CardTitle>
                        <CardDescription>
                            Formats acceptés : JPG, PNG, PDF (max 5MB).
                            <span className="block mt-1 text-green-600 font-medium flex items-center gap-1">
                                <span className="text-xs">🔒</span> Validation sécurisée • Chiffrement AES-256
                            </span>
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <PrescriptionUpload onUpload={handleUpload} />
                    </CardContent>
                </Card>

                <div className="mb-6">
                    <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                        <FileText className="h-5 w-5 text-primary" />
                        Historique
                    </h2>

                    <div className="grid gap-4">
                        {prescriptions.map((prescription) => (
                            <Card key={prescription.id} className="overflow-hidden hover:shadow-md transition-shadow">
                                <div className="flex flex-col md:flex-row">
                                    <div className="w-full md:w-32 h-32 bg-muted relative">
                                        <img
                                            src={prescription.image}
                                            alt="Ordonnance prévisualisation"
                                            className="w-full h-full object-cover"
                                        />
                                        <div className="absolute top-2 right-2 md:hidden">
                                            {getStatusBadge(prescription.status)}
                                        </div>
                                    </div>
                                    <div className="p-4 flex-1">
                                        <div className="flex justify-between items-start mb-2">
                                            <div>
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className="font-semibold text-lg">Ordonnance #{prescription.id.split('-')[1]}</span>
                                                    <span className="hidden md:inline-block">{getStatusBadge(prescription.status)}</span>
                                                </div>
                                                <div className="flex items-center text-sm text-muted-foreground gap-2">
                                                    <Calendar className="h-4 w-4" />
                                                    {format(new Date(prescription.date), "d MMMM yyyy 'à' HH:mm", { locale: fr })}
                                                </div>
                                            </div>
                                            <div className="hidden md:block">
                                                {getStatusIcon(prescription.status)}
                                            </div>
                                        </div>

                                        {prescription.notes && (
                                            <p className="text-sm text-muted-foreground mb-3 italic">"{prescription.notes}"</p>
                                        )}

                                        {prescription.items && (
                                            <div className="mb-3 bg-muted/30 p-2 rounded text-sm">
                                                <p className="font-medium mb-1">Médicaments identifiés :</p>
                                                <ul className="list-disc list-inside text-muted-foreground">
                                                    {prescription.items.map((item, idx) => (
                                                        <li key={idx}>{item.name} - {item.dosage}</li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}

                                        <div className="flex justify-between items-center mt-4">
                                            {prescription.totalPrice && (
                                                <div className="font-bold text-lg text-primary">
                                                    {prescription.totalPrice.toLocaleString('fr-FR')} FCFA
                                                </div>
                                            )}
                                            <div className="ml-auto flex gap-2">
                                                <Button variant="outline" size="sm">Voir détails</Button>
                                                {['validated', 'ready'].includes(prescription.status) && (
                                                    <Button size="sm">Commander</Button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </Card>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PrescriptionsPage;
