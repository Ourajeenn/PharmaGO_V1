import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import ConsultationMenu from "@/components/consultation/ConsultationMenu";
import Footer from "@/components/Footer";
import MedicalChatDialog from "@/components/consultation/MedicalChatDialog";
import AppointmentBookingDialog from "@/components/consultation/AppointmentBookingDialog";
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Video, MessageCircle, Verified, Shield, Stethoscope, Baby, Heart, Sun } from "lucide-react";

const ConsultationPage = () => {
    const navigate = useNavigate();
    const [isChatOpen, setIsChatOpen] = useState(false);
    const [isAppointmentOpen, setIsAppointmentOpen] = useState(false);
    const [selectedSpecialty, setSelectedSpecialty] = useState("Généraliste");
    const [showScrollTop, setShowScrollTop] = useState(false);

    const specialties = [
        { id: "Généraliste", label: "Médecin Généraliste", icon: Stethoscope },
        { id: "Pédiatre", label: "Pédiatre", icon: Baby },
        { id: "Gynécologue", label: "Gynécologue", icon: Heart }, // Lucide icon placeholder
        { id: "Dermatologue", label: "Dermatologue", icon: Sun }, // Lucide icon placeholder
    ];

    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // Show/Hide Scroll Button
    React.useEffect(() => {
        const toggleVisibility = () => {
            if (window.scrollY > 300) {
                setShowScrollTop(true);
            } else {
                setShowScrollTop(false);
            }
        };

        window.addEventListener("scroll", toggleVisibility);
        return () => window.removeEventListener("scroll", toggleVisibility);
    }, []);

    return (
        <div className="min-h-screen bg-[#fcfcfd]">
            {/* ... (main structure remains) */}
            <main className="container mx-auto px-4 py-8">
                {/* ... (Header remains) */}
                <div className="flex items-center justify-between mb-8">
                    <Button
                        variant="ghost"
                        onClick={() => navigate('/')}
                        className="flex items-center gap-2 hover:bg-primary/5 text-slate-600 transition-colors"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Retour à l'accueil
                    </Button>
                </div>

                {/* ... (Title remains) */}
                <div className="text-center max-w-3xl mx-auto mb-12">
                    {/* ... */}
                </div>

                {/* Two-Column Grid Section */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start mb-20">

                    {/* Left Column: Dark Circular Menu */}
                    <div className="lg:col-span-7 xl:col-span-8">
                        <div className="mb-8 pl-4 animate-in slide-in-from-left-4 duration-700">
                            <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4 leading-tight">
                                Consultez un médecin <br />
                                <span className="text-[#0070c0]">sans vous déplacer.</span>
                            </h1>
                            <p className="text-lg text-slate-500 max-w-xl">
                                E-prescription, téléconsultation vidéo, conseils personnalisés.
                                <span className="block mt-2 font-medium text-slate-700">Tout ça, depuis votre canapé. 🛋️</span>
                            </p>
                        </div>

                        <div className="bg-black rounded-[3rem] p-4 md:p-12 relative overflow-hidden shadow-2xl shadow-slate-200 min-h-[600px] flex items-center justify-center animate-in zoom-in-95 duration-700 delay-150">
                            {/* Decorative Background Elements */}
                            <div className="absolute top-0 right-0 w-96 h-96 bg-[#0070c0]/20 rounded-full blur-[100px] pointer-events-none" />
                            <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/10 rounded-full blur-[80px] pointer-events-none" />

                            <ConsultationMenu />
                        </div>
                    </div>

                    {/* Right Column: Information & CTA */}
                    <div className="lg:col-span-5 xl:col-span-4 space-y-8">
                        {/* CTA Segment */}
                        <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm relative overflow-hidden">
                            <div className="absolute top-4 right-4 bg-green-50 text-green-700 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                                <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></span>
                                En ligne
                            </div>

                            {/* Specialty Filter */}
                            <div className="mb-6">
                                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-3">Spécialité</h3>
                                <div className="flex flex-wrap gap-2">
                                    {specialties.map((spec) => (
                                        <button
                                            key={spec.id}
                                            onClick={() => setSelectedSpecialty(spec.id)}
                                            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${selectedSpecialty === spec.id
                                                ? "bg-primary text-white shadow-lg shadow-primary/20 scale-105"
                                                : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                                                }`}
                                        >
                                            {spec.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Network Warning */}
                            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 mb-6 animate-in slide-in-from-top-2">

                                <div className="flex items-start gap-3">
                                    <div className="bg-amber-100 p-1.5 rounded-full mt-0.5">
                                        <div className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
                                    </div>
                                    <div>
                                        <h4 className="text-xs font-bold text-amber-900 uppercase tracking-wide mb-1">Qualité Réseau</h4>
                                        <p className="text-xs text-amber-700 leading-relaxed">
                                            Votre connexion semble instable ? Privilégiez le <span className="font-bold">Chat Médical (2000 FCFA)</span> pour une expérience fluide.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <h2 className="text-2xl font-bold mb-4 text-black">Prêt à consulter ?</h2>
                            <p className="text-gray-500 mb-6 text-sm leading-relaxed">
                                Nos médecins sont certifiés et disponibles immédiatement.
                                <span className="block mt-2 text-primary font-medium bg-primary/5 p-2 rounded-lg border border-primary/10 text-xs">
                                    🎁 <span className="font-bold">Offre Découverte :</span> -50% sur votre première consultation vidéo !
                                </span>
                            </p>

                            <div className="space-y-4">
                                <Card className="border-none bg-[#f1f7ff] shadow-none overflow-hidden group hover:ring-1 ring-[#0070c0]/20 transition-all cursor-pointer relative" onClick={() => setIsAppointmentOpen(true)}>
                                    <div className="absolute top-0 right-0 bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-bl-lg">
                                        -50%
                                    </div>
                                    <CardContent className="p-5 flex items-center gap-4">
                                        <div className="bg-[#0070c0] p-3 rounded-2xl text-white shadow-lg shadow-[#0070c0]/20">
                                            <Video className="h-5 w-5" />
                                        </div>
                                        <div className="flex-1 text-left">
                                            <h3 className="font-bold text-black text-sm">Vidéo</h3>
                                            <p className="text-[11px] text-gray-400">Diagnostic complet</p>
                                        </div>
                                        <div className="text-right">
                                            <span className="block text-[10px] text-gray-400 line-through">5000 F</span>
                                            <Button size="sm" className="h-8 bg-[#0070c0] hover:bg-[#005a9c]">
                                                2000 F
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card className="border-none bg-[#fcf5ff] shadow-none overflow-hidden group hover:ring-1 ring-purple-200 transition-all cursor-pointer" onClick={() => setIsChatOpen(true)}>
                                    <CardContent className="p-5 flex items-center gap-4">
                                        <div className="bg-purple-600 p-3 rounded-2xl text-white shadow-lg shadow-purple-100">
                                            <MessageCircle className="h-5 w-5" />
                                        </div>
                                        <div className="flex-1 text-left">
                                            <h3 className="font-bold text-black text-sm">Chat</h3>
                                            <p className="text-[11px] text-gray-400">Questions rapides</p>
                                        </div>
                                        <Button variant="outline" size="sm" className="h-8 border-purple-200 text-purple-600 hover:bg-purple-50">
                                            1000 F
                                        </Button>
                                    </CardContent>
                                </Card>

                                {/* Pack 3 Consultations */}
                                <Card className="border-dashed border-2 border-green-200 bg-green-50/50 shadow-none overflow-hidden group hover:border-green-400 transition-all cursor-pointer">
                                    <CardContent className="p-4 flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="bg-green-100 p-2 rounded-xl text-green-700">
                                                <Verified className="h-4 w-4" />
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-green-900 text-xs">Pack Santé (3 Consultations)</h3>
                                                <p className="text-[10px] text-green-700">Valable 1 an • Famille incluse</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <span className="block text-[10px] text-gray-400 line-through">15 000 F</span>
                                            <span className="font-bold text-green-700 text-sm">12 000 F</span>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        </div>

                        {/* How it works Segment */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-bold text-black px-2">Comment ça marche ?</h3>
                            <div className="grid grid-cols-1 gap-3">
                                {[
                                    { step: 1, title: "Médecin", desc: "Choisissez votre spécialiste" },
                                    { step: 2, title: "Créneau", desc: "Réservez votre heure" },
                                    { step: 3, title: "Consultez", desc: "Vidéo ou chat" },
                                    { step: 4, title: "Ordonnance", desc: "Reçue instantanément" }
                                ].map((item) => (
                                    <div key={item.step} className="flex items-center gap-4 bg-white p-4 rounded-2xl border border-gray-50 shadow-sm">
                                        <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-500">
                                            {item.step}
                                        </div>
                                        <div className="text-left">
                                            <h4 className="font-bold text-sm text-black">{item.title}</h4>
                                            <p className="text-[11px] text-gray-400">{item.desc}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Certifications */}
                        <div className="flex items-center justify-between px-2 pt-4">
                            <span className="flex items-center gap-1.5 text-[10px] font-bold text-gray-400 uppercase tracking-tighter">
                                <Verified className="h-3.5 w-3.5 text-[#0070c0]" />
                                Certifié
                            </span>
                            <span className="flex items-center gap-1.5 text-[10px] font-bold text-gray-400 uppercase tracking-tighter">
                                <Shield className="h-3.5 w-3.5 text-[#0070c0]" />
                                Sécurisé
                            </span>
                        </div>
                    </div>
                </div>
            </main>

            {/* Back to Top Button */}
            {showScrollTop && (
                <Button
                    onClick={scrollToTop}
                    className="fixed bottom-8 right-8 rounded-full w-12 h-12 shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-300 z-50 bg-primary hover:scale-110"
                    size="icon"
                >
                    <ArrowLeft className="h-5 w-5 rotate-90" />
                </Button>
            )}

            <MedicalChatDialog
                isOpen={isChatOpen}
                onClose={() => setIsChatOpen(false)}
            />

            <AppointmentBookingDialog
                isOpen={isAppointmentOpen}
                onClose={() => setIsAppointmentOpen(false)}
                specialty={selectedSpecialty}
            />

            <Footer />
        </div>
    );
};

export default ConsultationPage;
