
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight, Download, Star } from "lucide-react";
import { PhoneMockup } from "@/components/ui/PhoneMockup";

export const MobileAppShowcase = () => {
    return (
        <section className="py-24 relative overflow-hidden bg-transparent">
            <div className="container mx-auto px-4 relative z-10">
                <div className="flex flex-col lg:flex-row items-center gap-16 lg:gap-24">

                    {/* Left Content */}
                    <div className="flex-1 space-y-8 animate-in slide-in-from-left duration-700">
                        <div className="space-y-4">
                            <h2 className="text-4xl lg:text-7xl font-black tracking-tighter text-slate-900 leading-[1] mb-6">
                                Votre <span className="text-primary italic">Pharmacie</span> <br />
                                dans votre poche
                            </h2>

                            <p className="text-xl text-slate-600 max-w-xl leading-relaxed">
                                Téléchargez l'application PharmaGo pour commander vos médicaments,
                                trouver les pharmacies de garde et consulter un médecin depuis votre mobile.
                            </p>
                        </div>

                        <div className="grid sm:grid-cols-2 gap-8 py-4">
                            <div className="flex items-start gap-4 p-4 rounded-3xl bg-white/50 backdrop-blur-xl border border-white/40 shadow-sm">
                                <div className="w-12 h-12 rounded-2xl bg-emerald-100 flex items-center justify-center flex-shrink-0">
                                    <span className="text-2xl">⚡</span>
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg text-slate-900">Commande Express</h3>
                                    <p className="text-sm text-slate-500">Scannez votre ordonnance et livraison en 30 min.</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-4 p-4 rounded-3xl bg-white/50 backdrop-blur-xl border border-white/40 shadow-sm">
                                <div className="w-12 h-12 rounded-2xl bg-blue-100 flex items-center justify-center flex-shrink-0">
                                    <span className="text-2xl">📍</span>
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg text-slate-900">Géolocalisation</h3>
                                    <p className="text-sm text-slate-500">Pharmacies ouvertes instantanément autour de vous.</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Image (Mockup) */}
                    <div className="flex-1 relative">
                        <div className="relative z-10 w-full max-w-[700px] mx-auto scale-100 lg:scale-110">
                            <PhoneMockup />
                        </div>
                    </div>

                </div>
            </div>
        </section>
    );
};

export default MobileAppShowcase;
