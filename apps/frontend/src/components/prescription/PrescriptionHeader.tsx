import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Sparkles, FileText, Clock, ShieldCheck, Truck } from "lucide-react";

interface PrescriptionHeaderProps {
    onBack: () => void;
    stats: {
        total: number;
        pending: number;
        validated: number;
        delivered: number;
    };
}

export const PrescriptionHeader = ({ onBack, stats }: PrescriptionHeaderProps) => {
    return (
        <section className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 border-b border-white/10 overflow-hidden">
            {/* Animated mesh gradients */}
            <div className="absolute top-0 right-0 -m-40 w-[700px] h-[700px] bg-indigo-500/15 rounded-full blur-[140px] pointer-events-none animate-pulse" />
            <div className="absolute bottom-0 left-0 -m-40 w-[500px] h-[500px] bg-violet-600/10 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[300px] h-[300px] bg-cyan-500/5 rounded-full blur-[100px] pointer-events-none" />
            {/* Noise texture */}
            <div className="absolute inset-0 opacity-[0.03] bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20viewBox%3D%220%200%20256%20256%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cfilter%20id%3D%22noise%22%3E%3CfeTurbulence%20baseFrequency%3D%220.65%22%2F%3E%3C%2Ffilter%3E%3Crect%20width%3D%22100%25%22%20height%3D%22100%25%22%20filter%3D%22url(%23noise)%22%2F%3E%3C%2Fsvg%3E')]" />

            <div className="container mx-auto relative z-10 py-16 pb-24 px-4 sm:px-6">
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                    className="flex flex-col items-center text-center gap-8"
                >
                    {/* Back button */}
                    <Button
                        variant="ghost"
                        onClick={onBack}
                        className="flex items-center gap-2 text-white/60 hover:text-white hover:bg-white/10 rounded-xl w-fit transition-all"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        <span className="font-semibold">Retour à l'accueil</span>
                    </Button>

                    {/* Title */}
                    <div className="max-w-3xl space-y-4">
                        <motion.div
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="flex items-center justify-center gap-3"
                        >
                            <Badge className="bg-indigo-500/20 text-indigo-300 border-indigo-400/30 text-[10px] uppercase font-black tracking-widest px-3 py-1">
                                <Sparkles className="h-3 w-3 mr-1" />
                                IA Powered
                            </Badge>
                        </motion.div>

                        <motion.h1
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.15 }}
                            className="text-5xl md:text-7xl font-black text-white tracking-tighter leading-[0.9]"
                        >
                            Mes <span className="bg-gradient-to-r from-indigo-400 via-violet-400 to-cyan-400 bg-clip-text text-transparent">Ordonnances</span>
                        </motion.h1>

                        <motion.p
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.25 }}
                            className="text-white/70 text-lg font-medium leading-relaxed max-w-xl mx-auto"
                        >
                            Téléversez, analysez par IA et commandez vos médicaments en quelques secondes.
                        </motion.p>
                    </div>

                    {/* ── Stats Glassmorphism Cards ────────── */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        transition={{ delay: 0.4, type: "spring", stiffness: 200 }}
                        className="grid grid-cols-2 md:grid-cols-4 gap-3 w-full max-w-3xl"
                    >
                        {[
                            { icon: FileText, value: stats.total, label: "Documents", gradient: "from-indigo-400 to-indigo-600", bgGlow: "bg-indigo-500/10" },
                            { icon: Clock, value: stats.pending, label: "En attente", gradient: "from-amber-400 to-orange-500", bgGlow: "bg-amber-500/10" },
                            { icon: ShieldCheck, value: stats.validated, label: "Validées", gradient: "from-emerald-400 to-green-600", bgGlow: "bg-emerald-500/10" },
                            { icon: Truck, value: stats.delivered, label: "Livrées", gradient: "from-slate-300 to-slate-500", bgGlow: "bg-slate-500/10" },
                        ].map((stat, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 15 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.45 + i * 0.08 }}
                                className={`relative group flex items-center gap-3 bg-white/[0.07] backdrop-blur-xl px-5 py-4 rounded-2xl border border-white/[0.12] hover:border-white/25 hover:bg-white/[0.12] transition-all duration-300 cursor-default`}
                            >
                                <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${stat.gradient} flex items-center justify-center shadow-lg`}>
                                    <stat.icon className="h-5 w-5 text-white" />
                                </div>
                                <div className="text-left">
                                    <p className="text-white font-black text-2xl leading-none">{stat.value}</p>
                                    <p className="text-white/50 text-[10px] uppercase font-bold tracking-widest mt-1">{stat.label}</p>
                                </div>
                            </motion.div>
                        ))}
                    </motion.div>
                </motion.div>
            </div>
        </section>
    );
};
