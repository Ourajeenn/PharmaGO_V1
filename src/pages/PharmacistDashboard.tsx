import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, CheckCircle, XCircle, Eye, Clock, FileText } from "lucide-react";
import { toast } from "sonner";
import { mockPrescriptions, Prescription } from "@/data/prescriptionMockData";

const PharmacistDashboard = () => {
    const navigate = useNavigate();
    const [prescriptions, setPrescriptions] = useState<Prescription[]>(mockPrescriptions);
    const [selectedPrescription, setSelectedPrescription] = useState<Prescription | null>(null);
    const [validationPrice, setValidationPrice] = useState("");
    const [rejectionReason, setRejectionReason] = useState("");
    const [isValidateOpen, setIsValidateOpen] = useState(false);
    const [isRejectOpen, setIsRejectOpen] = useState(false);

    const pendingPrescriptions = prescriptions.filter(p => p.status === 'pending');
    const processedPrescriptions = prescriptions.filter(p => p.status !== 'pending');

    const handleValidate = () => {
        if (!selectedPrescription) return;

        const updated = prescriptions.map(p =>
            p.id === selectedPrescription.id
                ? { ...p, status: 'validated' as const, totalPrice: Number(validationPrice) }
                : p
        );

        setPrescriptions(updated);
        setIsValidateOpen(false);
        setSelectedPrescription(null);
        setValidationPrice("");
        toast.success(`Ordonnance #${selectedPrescription.id} validée pour ${validationPrice} FCFA`);
    };

    const handleReject = () => {
        if (!selectedPrescription) return;

        const updated = prescriptions.map(p =>
            p.id === selectedPrescription.id
                ? { ...p, status: 'rejected' as const, notes: rejectionReason }
                : p
        );

        setPrescriptions(updated);
        setIsRejectOpen(false);
        setSelectedPrescription(null);
        setRejectionReason("");
        toast.error(`Ordonnance #${selectedPrescription.id} rejetée.`);
    };

    return (
        <div className="min-h-screen flex flex-col bg-slate-50">
            <Header />

            <main className="flex-1 container mx-auto px-4 py-8">
                <Button
                    variant="ghost"
                    onClick={() => navigate('/')}
                    className="flex items-center gap-2 mb-6 hover:bg-primary/10 transition-colors"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Retour à l'accueil
                </Button>
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900">Tableau de Bord Pharmacien</h1>
                        <p className="text-muted-foreground">Gestion des ordonnances entrantes</p>
                    </div>
                </div>

                <Tabs defaultValue="pending">
                    <TabsList className="grid w-full grid-cols-2 max-w-md mb-6">
                        <TabsTrigger value="pending" className="flex items-center gap-2">
                            <Clock className="h-4 w-4" />
                            En attente ({pendingPrescriptions.length})
                        </TabsTrigger>
                        <TabsTrigger value="processed" className="flex items-center gap-2">
                            <FileText className="h-4 w-4" />
                            Traitées ({processedPrescriptions.length})
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="pending" className="space-y-4">
                        {pendingPrescriptions.length === 0 ? (
                            <div className="text-center py-12 bg-white rounded-lg shadow-sm border border-slate-100">
                                <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                                <h3 className="text-lg font-medium">Tout est à jour !</h3>
                                <p className="text-muted-foreground">Aucune ordonnance en attente de validation.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {pendingPrescriptions.map(p => (
                                    <div key={p.id} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition-shadow">
                                        <div className="aspect-[4/3] relative bg-slate-100 group">
                                            <img src={p.image} alt="Prescription" className="w-full h-full object-cover" />
                                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                <Button variant="secondary" size="sm" className="gap-2">
                                                    <Eye className="h-4 w-4" />
                                                    Voir en grand
                                                </Button>
                                            </div>
                                        </div>
                                        <div className="p-4">
                                            <div className="flex justify-between items-start mb-2">
                                                <h3 className="font-semibold text-lg">#{p.id}</h3>
                                                <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                                                    En attente
                                                </Badge>
                                            </div>
                                            <p className="text-sm text-slate-500 mb-4">Reçu le {new Date(p.date).toLocaleDateString()}</p>

                                            <div className="grid grid-cols-2 gap-2">
                                                <Button
                                                    variant="outline"
                                                    className="w-full border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
                                                    onClick={() => { setSelectedPrescription(p); setIsRejectOpen(true); }}
                                                >
                                                    Refuser
                                                </Button>
                                                <Button
                                                    className="w-full bg-blue-600 hover:bg-blue-700"
                                                    onClick={() => { setSelectedPrescription(p); setIsValidateOpen(true); }}
                                                >
                                                    Valider
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </TabsContent>

                    <TabsContent value="processed">
                        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                            <table className="w-full">
                                <thead className="bg-slate-50 border-b border-slate-200">
                                    <tr>
                                        <th className="text-left p-4 font-medium text-slate-500">ID</th>
                                        <th className="text-left p-4 font-medium text-slate-500">Date</th>
                                        <th className="text-left p-4 font-medium text-slate-500">Statut</th>
                                        <th className="text-right p-4 font-medium text-slate-500">Montant / Note</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {processedPrescriptions.map(p => (
                                        <tr key={p.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50">
                                            <td className="p-4 font-medium">#{p.id}</td>
                                            <td className="p-4 text-slate-500">{new Date(p.date).toLocaleDateString()}</td>
                                            <td className="p-4">
                                                {p.status === 'validated' && <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-green-200">Validée</Badge>}
                                                {p.status === 'rejected' && <Badge variant="destructive">Rejetée</Badge>}
                                            </td>
                                            <td className="p-4 text-right">
                                                {p.status === 'validated' ? (
                                                    <span className="font-bold text-slate-900">{p.totalPrice?.toLocaleString()} FCFA</span>
                                                ) : (
                                                    <span className="text-sm text-slate-500 italic truncate max-w-[200px] inline-block">{p.notes}</span>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </TabsContent>
                </Tabs>
            </main>

            {/* Validation Dialog */}
            <Dialog open={isValidateOpen} onOpenChange={setIsValidateOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Valider l'ordonnance #{selectedPrescription?.id}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="aspect-video bg-slate-100 rounded-lg overflow-hidden">
                            <img src={selectedPrescription?.image} alt="Prescription" className="w-full h-full object-contain" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Montant total estimé (FCFA)</label>
                            <Input
                                type="number"
                                placeholder="ex: 15000"
                                value={validationPrice}
                                onChange={(e) => setValidationPrice(e.target.value)}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsValidateOpen(false)}>Annuler</Button>
                        <Button onClick={handleValidate} disabled={!validationPrice}>Confirmer la validation</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Rejection Dialog */}
            <Dialog open={isRejectOpen} onOpenChange={setIsRejectOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Refuser l'ordonnance #{selectedPrescription?.id}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Motif du refus</label>
                            <Textarea
                                placeholder="ex: Image illisible, médicament non disponible..."
                                value={rejectionReason}
                                onChange={(e) => setRejectionReason(e.target.value)}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsRejectOpen(false)}>Annuler</Button>
                        <Button variant="destructive" onClick={handleReject} disabled={!rejectionReason}>Confirmer le refus</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Footer />
        </div>
    );
};

export default PharmacistDashboard;
