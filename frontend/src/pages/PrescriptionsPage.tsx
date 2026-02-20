import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
    ArrowLeft,
    FileText,
    Clock,
    CheckCircle,
    XCircle,
    Package,
    Truck,
    Calendar,
    Microscope,
    Sparkles,
    AlertTriangle,
    Zap,
} from "lucide-react";
import PrescriptionUpload from "@/components/medicine/PrescriptionUpload";
import { PrescriptionPhotoGuide } from "@/components/medicine/PrescriptionPhotoGuide";
import { mockPrescriptions, Prescription } from "@/data/prescriptionMockData";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { analyzeWithOCR, type PrescriptionAnalysis } from "@/lib/prescriptionOCR";
import { toast } from "sonner";

// Extended prescription with OCR results
interface PrescriptionWithOCR extends Prescription {
    ocrResult?: PrescriptionAnalysis;
    ocrEngine?: "tesseract" | "openai";
    analyzing?: boolean;
}

const PrescriptionsPage = () => {
    const navigate = useNavigate();
    const [prescriptions, setPrescriptions] = useState<PrescriptionWithOCR[]>(mockPrescriptions);
    const [ocrProgress, setOcrProgress] = useState(0);
    const [analyzingId, setAnalyzingId] = useState<string | null>(null);

    const handleUpload = async (file: File) => {
        const id = `ord-${Date.now()}`;
        const preview = URL.createObjectURL(file);

        // Insert placeholder with analyzing state
        const placeholder: PrescriptionWithOCR = {
            id,
            status: "pending",
            date: new Date().toISOString(),
            image: preview,
            notes: "Analyse OCR en cours…",
            analyzing: true,
        };
        setPrescriptions((prev) => [placeholder, ...prev]);
        setAnalyzingId(id);
        setOcrProgress(0);

        try {
            toast.info("🔬 Analyse de l'ordonnance en cours…");

            const result = await analyzeWithOCR(file, (p) => setOcrProgress(p));

            // Detect engine used (no API key = Tesseract)
            const hasApiKey = !!import.meta.env.VITE_OPENAI_API_KEY;
            const engine: "tesseract" | "openai" = hasApiKey ? "openai" : "tesseract";

            const updated: PrescriptionWithOCR = {
                id,
                status: "pending",
                date: new Date().toISOString(),
                image: preview,
                notes: result.doctorName ? `Dr. ${result.doctorName}` : "Ordonnance analysée",
                analyzing: false,
                ocrResult: result,
                ocrEngine: engine,
                // Map to existing field if any meds found
                items: result.medications.map((m) => ({
                    name: m.name,
                    dosage: m.dosage,
                    quantity: 1,
                    price: 0,
                })) as any,
            };

            setPrescriptions((prev) => prev.map((p) => (p.id === id ? updated : p)));

            if (result.medications.length > 0) {
                toast.success(`✅ ${result.medications.length} médicament(s) détecté(s)`);
            } else {
                toast.warning("⚠️ Aucun médicament reconnu — veuillez vérifier manuellement.");
            }
        } catch (err) {
            console.error("[OCR] Error:", err);
            setPrescriptions((prev) =>
                prev.map((p) =>
                    p.id === id
                        ? { ...p, analyzing: false, notes: "Analyse échouée — ajoutée manuellement" }
                        : p
                )
            );
            toast.error("Erreur lors de l'analyse OCR.");
        } finally {
            setAnalyzingId(null);
            setOcrProgress(0);
        }
    };

    const getStatusBadge = (status: Prescription["status"]) => {
        switch (status) {
            case "pending":
                return <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-200">En attente</Badge>;
            case "validated":
                return <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-200">Validée</Badge>;
            case "preparing":
                return <Badge variant="outline" className="bg-purple-100 text-purple-800 border-purple-200">En préparation</Badge>;
            case "ready":
                return <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">Prête</Badge>;
            case "delivered":
                return <Badge variant="outline" className="bg-gray-100 text-gray-800 border-gray-200">Livrée</Badge>;
            case "rejected":
                return <Badge variant="destructive">Rejetée</Badge>;
            default:
                return <Badge variant="secondary">{status}</Badge>;
        }
    };

    const getStatusIcon = (status: Prescription["status"]) => {
        switch (status) {
            case "pending": return <Clock className="h-5 w-5 text-yellow-500" />;
            case "validated": return <CheckCircle className="h-5 w-5 text-blue-500" />;
            case "preparing": return <Package className="h-5 w-5 text-purple-500" />;
            case "ready": return <CheckCircle className="h-5 w-5 text-green-500" />;
            case "delivered": return <Truck className="h-5 w-5 text-gray-500" />;
            case "rejected": return <XCircle className="h-5 w-5 text-red-500" />;
        }
    };

    return (
        <div className="min-h-screen bg-background pb-20">
            <div className="bg-gradient-to-r from-primary to-secondary text-white p-6 pb-12">
                <div className="container mx-auto">
                    <Button
                        variant="ghost"
                        onClick={() => navigate("/")}
                        className="flex items-center gap-2 mb-4 text-white hover:bg-white/20 transition-colors"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Retour à l'accueil
                    </Button>
                    <h1 className="text-3xl font-bold mb-2">Mes Ordonnances</h1>
                    <p className="opacity-90">
                        Gérez vos ordonnances — analyse automatique par OCR incluse.
                    </p>
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
                            <span className="block mt-1 text-blue-600 font-medium flex items-center gap-1">
                                <Microscope className="h-3 w-3" /> Analyse OCR automatique — fonctionne hors-ligne
                            </span>
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <PrescriptionUpload onUpload={handleUpload} />

                        {/* OCR Progress bar */}
                        {analyzingId && (
                            <div className="mt-4 space-y-2">
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <Zap className="h-4 w-4 animate-pulse text-blue-500" />
                                    <span>Analyse OCR en cours… {ocrProgress}%</span>
                                </div>
                                <Progress value={ocrProgress || 10} className="h-2" />
                            </div>
                        )}
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
                                        {/* Engine badge */}
                                        {prescription.ocrEngine && !prescription.analyzing && (
                                            <div className="absolute bottom-1 left-1">
                                                {prescription.ocrEngine === "tesseract" ? (
                                                    <Badge className="text-[9px] px-1 py-0 bg-blue-600 text-white gap-0.5">
                                                        <Microscope className="h-2.5 w-2.5" /> OCR
                                                    </Badge>
                                                ) : (
                                                    <Badge className="text-[9px] px-1 py-0 bg-purple-600 text-white gap-0.5">
                                                        <Sparkles className="h-2.5 w-2.5" /> IA
                                                    </Badge>
                                                )}
                                            </div>
                                        )}
                                    </div>

                                    <div className="p-4 flex-1">
                                        <div className="flex justify-between items-start mb-2">
                                            <div>
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className="font-semibold text-lg">
                                                        Ordonnance #{prescription.id.split("-")[1]}
                                                    </span>
                                                    <span className="hidden md:inline-block">{getStatusBadge(prescription.status)}</span>
                                                </div>
                                                <div className="flex items-center text-sm text-muted-foreground gap-2">
                                                    <Calendar className="h-4 w-4" />
                                                    {format(new Date(prescription.date), "d MMMM yyyy 'à' HH:mm", { locale: fr })}
                                                </div>
                                            </div>
                                            <div className="hidden md:block">
                                                {prescription.analyzing ? (
                                                    <Zap className="h-5 w-5 text-blue-500 animate-pulse" />
                                                ) : (
                                                    getStatusIcon(prescription.status)
                                                )}
                                            </div>
                                        </div>

                                        {prescription.analyzing && (
                                            <div className="mb-3 space-y-1">
                                                <p className="text-sm text-blue-600 font-medium flex items-center gap-1">
                                                    <Zap className="h-3 w-3 animate-pulse" /> Analyse OCR en cours…
                                                </p>
                                                <Progress value={ocrProgress || 10} className="h-1.5" />
                                            </div>
                                        )}

                                        {prescription.notes && !prescription.analyzing && (
                                            <p className="text-sm text-muted-foreground mb-3 italic">
                                                "{prescription.notes}"
                                            </p>
                                        )}

                                        {/* OCR Medications */}
                                        {prescription.ocrResult && prescription.ocrResult.medications.length > 0 && (
                                            <div className="mb-3 bg-blue-50 border border-blue-100 p-3 rounded-lg text-sm">
                                                <p className="font-semibold text-blue-800 mb-2 flex items-center gap-1">
                                                    <Microscope className="h-3.5 w-3.5" /> Médicaments détectés :
                                                </p>
                                                <ul className="space-y-1">
                                                    {prescription.ocrResult.medications.map((med, idx) => (
                                                        <li key={idx} className="flex items-center justify-between text-blue-700">
                                                            <span className="font-medium">{med.name}</span>
                                                            <span className="text-blue-500 text-xs">
                                                                {med.dosage !== "À préciser" ? med.dosage : ""}{" "}
                                                                {med.frequency !== "1 fois/jour" ? `• ${med.frequency}` : ""}
                                                            </span>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}

                                        {/* No meds found */}
                                        {prescription.ocrResult && prescription.ocrResult.medications.length === 0 && !prescription.analyzing && (
                                            <div className="mb-3 bg-yellow-50 border border-yellow-100 p-2 rounded text-sm text-yellow-700 flex items-center gap-2">
                                                <AlertTriangle className="h-4 w-4 flex-shrink-0" />
                                                Aucun médicament reconnu automatiquement — vérifiez manuellement.
                                            </div>
                                        )}

                                        {/* Warnings */}
                                        {prescription.ocrResult?.warnings && prescription.ocrResult.warnings.length > 0 && (
                                            <div className="mb-3 space-y-1">
                                                {prescription.ocrResult.warnings.filter(w => !w.includes("Aucun médicament")).map((w, i) => (
                                                    <p key={i} className="text-xs text-orange-600 flex items-center gap-1">
                                                        <AlertTriangle className="h-3 w-3 flex-shrink-0" /> {w}
                                                    </p>
                                                ))}
                                            </div>
                                        )}

                                        {/* Interactions */}
                                        {prescription.ocrResult?.interactions && prescription.ocrResult.interactions.length > 0 && (
                                            <div className="mb-3 space-y-1">
                                                {prescription.ocrResult.interactions.map((ia, i) => (
                                                    <p key={i} className="text-xs text-red-600 font-medium flex items-center gap-1">
                                                        <XCircle className="h-3 w-3 flex-shrink-0" /> {ia}
                                                    </p>
                                                ))}
                                            </div>
                                        )}

                                        {/* Legacy items (mock data) */}
                                        {prescription.items && !prescription.ocrResult && (
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
                                                    {prescription.totalPrice.toLocaleString("fr-FR")} FCFA
                                                </div>
                                            )}
                                            <div className="ml-auto flex gap-2">
                                                <Button variant="outline" size="sm">Voir détails</Button>
                                                {["validated", "ready"].includes(prescription.status) && (
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
