import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import ConsultationMenu from "@/components/consultation/ConsultationMenu";
import Footer from "@/components/Footer";
import MedicalChatDialog from "@/components/consultation/MedicalChatDialog";
import AppointmentBookingDialog from "@/components/consultation/AppointmentBookingDialog";
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Video, MessageCircle, Verified, Shield } from "lucide-react";

const ConsultationPage = () => {
    const navigate = useNavigate();
    const [isChatOpen, setIsChatOpen] = useState(false);
    const [isAppointmentOpen, setIsAppointmentOpen] = useState(false);
    const [showScrollTop, setShowScrollTop] = useState(false);

    // Handle scroll for "Back to Top" button
    React.useEffect(() => {
        const handleScroll = () => {
            if (window.scrollY > 400) {
                setShowScrollTop(true);
            } else {
                setShowScrollTop(false);
            }
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
        <div className="min-h-screen bg-[#fcfcfd]">
            <main className="container mx-auto px-4 py-8">
                {/* Header Navigation */}
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

                {/* Main Heading */}
                <div className="text-center max-w-3xl mx-auto mb-12">
                    <h1 className="text-4xl md:text-6xl font-extrabold mb-4 text-black leading-tight">
                        Consultation Médicale <br />
                        <span className="bg-gradient-to-r from-[#0070c0] via-[#00b050] to-[#f97316] bg-clip-text text-transparent">
                            en Ligne
                        </span>
                    </h1>
                    <p className="text-xl text-gray-600 mb-2">
                        Consultez un médecin sans vous déplacer.
                    </p>
                    <p className="text-lg text-gray-400">
                        E-prescription, téléconsultation vidéo, conseils personnalisés.
                    </p>
                </div>

                {/* Two-Column Grid Section */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start mb-20">

                    {/* Left Column: Dark Circular Menu */}
                    <div className="lg:col-span-7 xl:col-span-8">
                        <div className="w-full bg-black rounded-[2.5rem] p-6 overflow-hidden relative min-h-[500px] md:min-h-[650px] flex items-center justify-center border border-white/5 shadow-2xl">
                            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,112,192,0.15)_0%,rgba(0,0,0,0)_70%)]" />
                            <div className="scale-90 md:scale-100 transition-transform">
                                <ConsultationMenu />
                            </div>
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

                            <h2 className="text-2xl font-bold mb-4 text-black">Prêt à consulter ?</h2>
                            <p className="text-gray-500 mb-8 text-sm leading-relaxed">
                                Nos médecins sont certifiés et disponibles immédiatement pour vous accompagner dans votre parcours de soin.
                            </p>

                            <div className="space-y-4">
                                <Card className="border-none bg-[#f1f7ff] shadow-none overflow-hidden group hover:ring-1 ring-[#0070c0]/20 transition-all">
                                    <CardContent className="p-5 flex items-center gap-4">
                                        <div className="bg-[#0070c0] p-3 rounded-2xl text-white shadow-lg shadow-[#0070c0]/20">
                                            <Video className="h-5 w-5" />
                                        </div>
                                        <div className="flex-1 text-left">
                                            <h3 className="font-bold text-black text-sm">Vidéo</h3>
                                            <p className="text-[11px] text-gray-400">Diagnostic complet</p>
                                        </div>
                                        <Button size="sm" className="h-9 bg-[#0070c0] hover:bg-[#005a9c]" onClick={() => setIsAppointmentOpen(true)}>
                                            5000 F
                                        </Button>
                                    </CardContent>
                                </Card>

                                <Card className="border-none bg-[#fcf5ff] shadow-none overflow-hidden group hover:ring-1 ring-purple-200 transition-all">
                                    <CardContent className="p-5 flex items-center gap-4">
                                        <div className="bg-purple-600 p-3 rounded-2xl text-white shadow-lg shadow-purple-100">
                                            <MessageCircle className="h-5 w-5" />
                                        </div>
                                        <div className="flex-1 text-left">
                                            <h3 className="font-bold text-black text-sm">Chat</h3>
                                            <p className="text-[11px] text-gray-400">Questions rapides</p>
                                        </div>
                                        <Button variant="outline" size="sm" className="h-9 border-purple-200 text-purple-600 hover:bg-purple-50" onClick={() => setIsChatOpen(true)}>
                                            2000 F
                                        </Button>
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
            />

            <Footer />
        </div>
    );
};

export default ConsultationPage;
