import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Eye, Calendar, Microscope, TrendingUp, Loader2, Inbox, FileText } from "lucide-react";
import { Prescription } from "@/data/prescriptionMockData";
import { PrescriptionAnalysis } from "@/lib/prescriptionOCR";

export interface PrescriptionWithOCR extends Prescription {
    ocrResult?: PrescriptionAnalysis;
    ocrEngine?: "tesseract" | "openai";
    analyzing?: boolean;
}

export type StatusFilter = "all" | "pending" | "validated" | "preparing" | "ready" | "delivered" | "rejected";

interface PrescriptionHistoryGridProps {
    loading: boolean;
    prescriptions: PrescriptionWithOCR[];
    statusFilter: StatusFilter;
    onStatusFilterChange: (v: StatusFilter) => void;
    filterTabs: { value: StatusFilter; label: string; count?: number }[];
    getStatusConfig: (status: string) => any;
    ocrProgress: number;
    onOrder: (prescription: PrescriptionWithOCR) => void;
    onViewDetails: (id: string) => void;
}

const containerVariants = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: { staggerChildren: 0.07, delayChildren: 0.1 }
    }
};

const itemVariants: any = {
    hidden: { opacity: 0, y: 20, scale: 0.97 },
    show: { opacity: 1, y: 0, scale: 1, transition: { type: "spring", stiffness: 400, damping: 30 } }
};

export const PrescriptionHistoryGrid = ({
    loading,
    prescriptions,
    statusFilter,
    onStatusFilterChange,
    filterTabs,
    getStatusConfig,
    ocrProgress,
    onOrder,
    onViewDetails
}: PrescriptionHistoryGridProps) => {

    const filteredPrescriptions = statusFilter === "all"
        ? prescriptions
        : prescriptions.filter(p => p.status === statusFilter);

    return (
        <motion.section
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mb-12"
        >
            {/* Header + Filters */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
                <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                    <div className="w-1.5 h-8 bg-gradient-to-b from-indigo-600 to-violet-600 rounded-full" />
                    Historique des dépôts
                </h2>

                <Tabs value={statusFilter} onValueChange={(v) => onStatusFilterChange(v as StatusFilter)}>
                    <TabsList className="bg-white border border-slate-200 rounded-2xl p-1.5 shadow-sm">
                        {filterTabs.map(tab => (
                            <TabsTrigger
                                key={tab.value}
                                value={tab.value}
                                className="rounded-xl text-xs font-bold px-4 py-2 text-slate-600 data-[state=active]:bg-slate-900 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all"
                            >
                                {tab.label}
                                {tab.count !== undefined && tab.count > 0 && (
                                    <span className="ml-1.5 text-[9px] font-black opacity-60">({tab.count})</span>
                                )}
                            </TabsTrigger>
                        ))}
                    </TabsList>
                </Tabs>
            </div>

            {/* Loading */}
            {loading ? (
                <div className="flex flex-col items-center justify-center py-28 gap-5">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-xl">
                        <Loader2 className="h-8 w-8 text-white animate-spin" />
                    </div>
                    <p className="text-sm font-bold text-slate-500">Chargement des ordonnances...</p>
                </div>
            ) : filteredPrescriptions.length === 0 ? (
                /* Empty State */
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex flex-col items-center justify-center py-24 gap-8"
                >
                    <div className="relative">
                        <div className="w-32 h-32 rounded-[2.5rem] bg-gradient-to-br from-indigo-50 via-violet-50 to-slate-50 flex items-center justify-center border-2 border-indigo-100/80 shadow-inner">
                            <Inbox className="h-16 w-16 text-indigo-300" />
                        </div>
                        <div className="absolute -bottom-3 -right-3 w-12 h-12 rounded-2xl bg-white shadow-xl border border-indigo-100 flex items-center justify-center">
                            <FileText className="h-6 w-6 text-indigo-500" />
                        </div>
                    </div>
                    <div className="text-center max-w-md">
                        <h3 className="text-2xl font-black text-slate-900 tracking-tight mb-3">
                            {statusFilter === "all" ? "Aucune ordonnance" : `Aucune ordonnance "${filterTabs.find(t => t.value === statusFilter)?.label}"`}
                        </h3>
                        <p className="text-base text-slate-500 font-medium leading-relaxed">
                            {statusFilter === "all"
                                ? "Importez votre première ordonnance ci-dessus. L'IA de Leslie la scannera et détectera vos médicaments automatiquement."
                                : "Aucune ordonnance ne correspond à ce filtre. Essayez un autre onglet."
                            }
                        </p>
                    </div>
                    {statusFilter !== "all" && (
                        <Button
                            variant="outline"
                            className="rounded-2xl border-2 border-indigo-200 text-indigo-700 font-bold px-6 h-11 hover:bg-indigo-50 transition-all"
                            onClick={() => onStatusFilterChange("all")}
                        >
                            Voir toutes les ordonnances
                        </Button>
                    )}
                </motion.div>
            ) : (
                /* Grid */
                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="show"
                    className="grid grid-cols-1 xl:grid-cols-2 gap-6"
                >
                    <AnimatePresence mode="popLayout">
                        {filteredPrescriptions.map((prescription) => {
                            const statusCfg = getStatusConfig(prescription.status);
                            return (
                                <motion.div
                                    key={prescription.id}
                                    variants={itemVariants as any}
                                    layout
                                    exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
                                >
                                    <Card className="group overflow-hidden border border-slate-200/80 bg-white hover:border-indigo-300 hover:shadow-2xl hover:shadow-indigo-100/40 transition-all duration-500 rounded-[2rem]">
                                        <div className="flex flex-col sm:flex-row h-full">
                                            {/* Image */}
                                            <div className="w-full sm:w-44 h-48 sm:h-auto bg-slate-100 relative overflow-hidden">
                                                <img
                                                    src={prescription.image}
                                                    alt="Ordonnance"
                                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                                                />
                                                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-end p-4">
                                                    <Button
                                                        size="sm"
                                                        variant="secondary"
                                                        className="w-full rounded-xl bg-white/30 backdrop-blur-md border-white/40 text-white font-bold text-xs hover:bg-white/50 gap-2"
                                                        onClick={() => window.open(prescription.image, '_blank')}
                                                    >
                                                        <Eye className="h-3.5 w-3.5" />
                                                        Voir l'original
                                                    </Button>
                                                </div>
                                                <div className="absolute top-3 left-3 sm:hidden">
                                                    <Badge variant="outline" className={`${statusCfg.bg} ${statusCfg.text} ${statusCfg.border} text-[10px] font-bold shadow-sm`}>
                                                        {statusCfg.label}
                                                    </Badge>
                                                </div>
                                            </div>

                                            {/* Content */}
                                            <div className="p-6 flex-1 flex flex-col">
                                                <div className="flex justify-between items-start mb-4">
                                                    <div>
                                                        <h4 className="font-black text-slate-900 text-lg tracking-tight">
                                                            Ordonnance #{prescription.id.split("-")[1]}
                                                        </h4>
                                                        <div className="flex items-center text-xs font-semibold text-slate-500 gap-2 mt-1.5">
                                                            <Calendar className="h-3.5 w-3.5 text-slate-400" />
                                                            {format(new Date(prescription.date), "d MMMM yyyy 'à' HH:mm", { locale: fr })}
                                                        </div>
                                                    </div>
                                                    <div className="hidden sm:flex items-center gap-2">
                                                        {statusCfg.icon}
                                                        <Badge variant="outline" className={`${statusCfg.bg} ${statusCfg.text} ${statusCfg.border} text-[10px] font-bold`}>
                                                            {statusCfg.label}
                                                        </Badge>
                                                    </div>
                                                </div>

                                                <div className="flex-1">
                                                    {prescription.analyzing ? (
                                                        <div className="space-y-3 py-2">
                                                            <div className="flex justify-between items-center text-xs font-black text-indigo-700 uppercase tracking-widest">
                                                                <span className="flex items-center gap-2">
                                                                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                                                    Analyse Leslie en cours
                                                                </span>
                                                                <span>{ocrProgress}%</span>
                                                            </div>
                                                            <Progress value={ocrProgress || 10} className="h-2 bg-indigo-50" />
                                                        </div>
                                                    ) : (
                                                        <>
                                                            {prescription.ocrResult && prescription.ocrResult.medications.length > 0 ? (
                                                                <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/60 mb-4 group-hover:bg-indigo-50/40 transition-colors">
                                                                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.12em] mb-2.5 flex items-center gap-1.5">
                                                                        <Microscope className="h-3 w-3 text-indigo-600" />
                                                                        Détections Leslie
                                                                        <Badge className="ml-auto text-[8px] bg-indigo-100 text-indigo-700 border-none h-4 px-1.5 font-black">
                                                                            {prescription.ocrResult.medications.length} trouvé(s)
                                                                        </Badge>
                                                                    </p>
                                                                    <div className="flex flex-wrap gap-2">
                                                                        {prescription.ocrResult.medications.slice(0, 4).map((med: any, idx: number) => (
                                                                            <Badge key={idx} variant="secondary" className="bg-white border border-slate-200 text-slate-800 text-[11px] rounded-lg shadow-sm font-semibold">
                                                                                💊 {med.name}
                                                                            </Badge>
                                                                        ))}
                                                                        {prescription.ocrResult.medications.length > 4 && (
                                                                            <span className="text-xs font-bold text-indigo-600 self-center">
                                                                                +{prescription.ocrResult.medications.length - 4} autres
                                                                            </span>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            ) : (
                                                                <div className="h-12 flex items-center gap-2 text-slate-500 text-sm">
                                                                    <p className="line-clamp-2 italic">"{prescription.notes || "Aucun détail détecté"}"</p>
                                                                </div>
                                                            )}
                                                        </>
                                                    )}
                                                </div>

                                                {/* Card footer */}
                                                <div className="pt-4 border-t border-slate-100 flex items-center justify-between mt-auto">
                                                    {prescription.totalPrice ? (
                                                        <div>
                                                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Total Estimé</p>
                                                            <p className="text-xl font-black text-indigo-700">{prescription.totalPrice.toLocaleString("fr-FR")} F</p>
                                                        </div>
                                                    ) : (
                                                        <div className="w-10" />
                                                    )}
                                                    <div className="flex gap-2">
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            className="rounded-xl text-slate-700 font-bold text-xs h-10 px-4 hover:bg-slate-100"
                                                            onClick={() => onViewDetails(prescription.id)}
                                                        >
                                                            Détails
                                                        </Button>
                                                        {["validated", "ready"].includes(prescription.status) && (
                                                            <Button
                                                                size="sm"
                                                                className="rounded-xl bg-slate-900 hover:bg-indigo-700 font-bold text-xs h-10 px-6 shadow-xl shadow-slate-200 gap-2 transition-all"
                                                                onClick={() => onOrder(prescription)}
                                                            >
                                                                <TrendingUp className="h-3.5 w-3.5" />
                                                                Commander
                                                            </Button>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </Card>
                                </motion.div>
                            );
                        })}
                    </AnimatePresence>
                </motion.div>
            )}
        </motion.section>
    );
};
