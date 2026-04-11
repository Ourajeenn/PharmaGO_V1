import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    FileText,
    CheckCircle,
    XCircle,
    Package,
    Calendar,
    Microscope,
    AlertTriangle,
    Zap,
    FileImage,
    Loader2,
    Inbox,
    TrendingUp,
    Eye,
    ScanLine,
    Upload,
    Clock,
    Truck,
} from "lucide-react";
import PrescriptionUpload from "@/components/medicine/PrescriptionUpload";
import { PrescriptionHeader } from "@/components/prescription/PrescriptionHeader";
import { PrescriptionHistoryGrid } from "@/components/prescription/PrescriptionHistoryGrid";
import { PrescriptionPhotoGuide } from "@/components/medicine/PrescriptionPhotoGuide";
import { Prescription } from "@/data/prescriptionMockData";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { analyzeWithOCR, type PrescriptionAnalysis } from "@/lib/prescriptionOCR";
import { toast } from "sonner";
import Header from "@/components/core/Header";
import Footer from "@/components/core/Footer";
import { useCart } from "@/contexts/CartContext";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/useAuth";

import { PrescriptionWithOCR, StatusFilter } from "@/components/prescription/PrescriptionHistoryGrid";

// ── Page Component ───────────────────────────────────────────
const PrescriptionsPage = () => {
    const navigate = useNavigate();
    const { addToCart } = useCart();
    const { user } = useAuth();
    const [prescriptions, setPrescriptions] = useState<PrescriptionWithOCR[]>([]);
    const [ocrProgress, setOcrProgress] = useState(0);
    const [analyzingId, setAnalyzingId] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");

    useEffect(() => {
        if (user) {
            fetchPrescriptions();
        } else {
            setLoading(false);
        }
    }, [user]);

    const fetchPrescriptions = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('prescriptions')
                .select('*')
                .eq('patient_id', user?.id)
                .order('created_at', { ascending: false });

            if (error) throw error;

            if (data) {
                const mapped: PrescriptionWithOCR[] = data.map((p: any) => ({
                    id: p.id,
                    status: p.status as any,
                    date: p.created_at,
                    image: p.image_url || '/placeholder.svg',
                    notes: p.notes || '',
                    totalPrice: p.total_price || 0,
                    ocrResult: p.ocr_result,
                    items: (p.medications || []) as any
                }));
                setPrescriptions(mapped);
            }
        } catch (error) {
            console.error("Error fetching prescriptions:", error);
            toast.error("Impossible de charger les ordonnances");
        } finally {
            setLoading(false);
        }
    };

    // ── Computed ──────────────────────────────────────────────
    const filteredPrescriptions = useMemo(() => {
        if (statusFilter === "all") return prescriptions;
        return prescriptions.filter(p => p.status === statusFilter);
    }, [prescriptions, statusFilter]);

    const stats = useMemo(() => ({
        total: prescriptions.length,
        pending: prescriptions.filter(p => p.status === "pending").length,
        validated: prescriptions.filter(p => ["validated", "ready"].includes(p.status)).length,
        delivered: prescriptions.filter(p => p.status === "delivered").length,
    }), [prescriptions]);

    // ── Upload handler ───────────────────────────────────────
    const handleUpload = async (file: File) => {
        const id = `ord-${Date.now()}`;
        const preview = URL.createObjectURL(file);

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
            const engine: "tesseract" | "openai" = "openai"; // Routé via Supabase Edge Function

            const updated: PrescriptionWithOCR = {
                id,
                status: "pending",
                date: new Date().toISOString(),
                image: preview,
                notes: result.doctorName ? `Dr. ${result.doctorName}` : "Ordonnance analysée",
                analyzing: false,
                ocrResult: result,
                ocrEngine: engine,
                items: result.medications.map((m) => ({
                    name: m.name, dosage: m.dosage, quantity: 1, price: 0,
                })) as any,
            };

            setPrescriptions((prev) => prev.map((p) => (p.id === id ? updated : p)));

            if (user) {
                await supabase.from('prescriptions').insert({
                    id, patient_id: user.id, doctor_id: user.id,
                    prescription_text: result.rawText || "Upload patient",
                    status: 'pending', image_url: preview,
                    notes: updated.notes, medications: result.medications as any,
                    ocr_result: result as any
                } as any);
            }

            if (result.medications.length > 0) {
                toast.success(`✅ ${result.medications.length} médicament(s) détecté(s)`);
            } else {
                toast.warning("⚠️ Aucun médicament reconnu — veuillez vérifier manuellement.");
            }
        } catch (err) {
            console.error("[OCR] Error:", err);
            setPrescriptions((prev) =>
                prev.map((p) =>
                    p.id === id ? { ...p, analyzing: false, notes: "Analyse échouée — ajoutée manuellement" } : p
                )
            );
            toast.error("Erreur lors de l'analyse OCR.");
        } finally {
            setAnalyzingId(null);
            setOcrProgress(0);
        }
    };

    const handleOrder = (prescription: PrescriptionWithOCR) => {
        if (!prescription.items || prescription.items.length === 0) {
            toast.error("Aucun médicament détecté sur cette ordonnance.");
            return;
        }
        prescription.items.forEach((item: any) => {
            addToCart({
                medicine: {
                    id: `ord-${prescription.id}-${item.name}`, name: item.name,
                    description: `Issu de l'ordonnance #${prescription.id.split("-")[1]}`,
                    category: 'Ordonnance', requires_prescription: true,
                    manufacturer: 'Analysé', generic_name: item.name,
                    dosage: item.dosage || 'À confirmer', form: 'Comprimé',
                    created_at: new Date().toISOString(), updated_at: new Date().toISOString()
                },
                quantity: item.quantity || 1,
                pharmacy_id: 'auto-select', pharmacy_name: 'Pharmacie la plus proche',
                price: item.price || 2500
            });
        });
        toast.success(`${prescription.items.length} médicament(s) ajoutés au panier.`);
    };

    const getStatusConfig = (status: Prescription["status"]) => {
        const configs: Record<string, { label: string; bg: string; text: string; border: string; icon: React.ReactNode; ring: string }> = {
            pending: { label: "En attente", bg: "bg-amber-50", text: "text-amber-800", border: "border-amber-200", icon: <Clock className="h-4 w-4 text-amber-600" />, ring: "ring-amber-200" },
            validated: { label: "Validée", bg: "bg-blue-50", text: "text-blue-800", border: "border-blue-200", icon: <CheckCircle className="h-4 w-4 text-blue-600" />, ring: "ring-blue-200" },
            preparing: { label: "En préparation", bg: "bg-violet-50", text: "text-violet-800", border: "border-violet-200", icon: <Package className="h-4 w-4 text-violet-600" />, ring: "ring-violet-200" },
            ready: { label: "Prête", bg: "bg-emerald-50", text: "text-emerald-800", border: "border-emerald-200", icon: <CheckCircle className="h-4 w-4 text-emerald-600" />, ring: "ring-emerald-200" },
            delivered: { label: "Livrée", bg: "bg-slate-100", text: "text-slate-700", border: "border-slate-200", icon: <Truck className="h-4 w-4 text-slate-600" />, ring: "ring-slate-200" },
            rejected: { label: "Rejetée", bg: "bg-red-50", text: "text-red-800", border: "border-red-200", icon: <XCircle className="h-4 w-4 text-red-600" />, ring: "ring-red-200" },
        };
        return configs[status] || configs.pending;
    };

    const filterTabs: { value: StatusFilter; label: string; count?: number }[] = [
        { value: "all", label: "Toutes", count: stats.total },
        { value: "pending", label: "En attente", count: stats.pending },
        { value: "validated", label: "Validées", count: stats.validated },
        { value: "delivered", label: "Livrées", count: stats.delivered },
    ];

    // ══════════════════════════════════════════════════════════
    // ── RENDER ────────────────────────────────────────────────
    // ══════════════════════════════════════════════════════════
    return (
        <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50 font-sans">
            <Header />

            {/* ═══════════════════════════════════════════════════
                ── HERO SECTION — Premium Glass ──────────────────
                ═══════════════════════════════════════════════════ */}
            <PrescriptionHeader onBack={() => navigate("/")} stats={stats} />

            {/* ═══════════════════════════════════════════════════
                ── MAIN CONTENT ──────────────────────────────────
                ═══════════════════════════════════════════════════ */}
            <main className="container mx-auto px-4 sm:px-6 -mt-10 pb-20 relative z-10">
                {/* ── Photo Guide ─────────────────────────────── */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                >
                    <PrescriptionPhotoGuide />
                </motion.div>

                {/* ── Upload Section — Premium Card ────────────── */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                >
                    <Card className="mb-12 shadow-2xl shadow-indigo-200/40 border border-white/60 bg-white/80 backdrop-blur-2xl rounded-[2rem] overflow-hidden">
                        <CardHeader className="p-8 pb-2">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                <div className="flex items-start gap-4">
                                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-xl shadow-indigo-200/50 shrink-0">
                                        <Upload className="h-6 w-6 text-white" />
                                    </div>
                                    <div>
                                        <CardTitle className="text-2xl font-black text-slate-900 tracking-tight">
                                            Nouveau document
                                        </CardTitle>
                                        <CardDescription className="text-slate-600 font-medium mt-1 text-sm">
                                            Formats acceptés : JPG, PNG, PDF (max 5MB). L'IA analyse automatiquement votre ordonnance.
                                        </CardDescription>
                                    </div>
                                </div>
                                <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px] uppercase font-black tracking-widest px-3 py-1 w-fit">
                                    <ScanLine className="h-3 w-3 mr-1" />
                                    Scan IA
                                </Badge>
                            </div>
                        </CardHeader>
                        <CardContent className="p-8 pt-4">
                            <PrescriptionUpload onUpload={handleUpload} />

                            {/* OCR Progress */}
                            <AnimatePresence>
                                {analyzingId && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: "auto" }}
                                        exit={{ opacity: 0, height: 0 }}
                                        className="mt-6 space-y-3"
                                    >
                                        <div className="flex items-center gap-4 bg-gradient-to-r from-indigo-50 to-violet-50 rounded-2xl px-5 py-4 border border-indigo-100">
                                            <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center shadow-lg">
                                                <Zap className="h-5 w-5 text-white animate-pulse" />
                                            </div>
                                            <div className="flex-1">
                                                <p className="text-sm font-black text-indigo-900">Analyse OCR en cours…</p>
                                                <p className="text-xs text-indigo-600 font-medium">Leslie identifie vos médicaments</p>
                                            </div>
                                            <span className="text-2xl font-black text-indigo-600">{ocrProgress}%</span>
                                        </div>
                                        <Progress value={ocrProgress || 10} className="h-2.5 rounded-full" />
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </CardContent>
                    </Card>
                </motion.div>

                {/* ═══════════════════════════════════════════════
                    ── HISTORY SECTION ───────────────────────────
                    ═══════════════════════════════════════════════ */}
                <PrescriptionHistoryGrid
                    loading={loading}
                    prescriptions={prescriptions as any}
                    statusFilter={statusFilter as any}
                    onStatusFilterChange={(v) => setStatusFilter(v as any)}
                    filterTabs={filterTabs as any}
                    getStatusConfig={getStatusConfig as any}
                    ocrProgress={ocrProgress}
                    onOrder={(p) => handleOrder(p as any)}
                    onViewDetails={(id) => toast.info(`Détails de l'ordonnance #${id.split("-")[1]}`)}
                />
            </main>

            <Footer />
        </div>
    );
};

export default PrescriptionsPage;
