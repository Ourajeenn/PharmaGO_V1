
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight, Download, Star } from "lucide-react";

export const MobileAppShowcase = () => {
    const [imageError, setImageError] = useState(false);
    return (
        <section className="py-24 relative overflow-hidden">
            {/* Background Elements */}
            <div className="absolute top-0 right-0 w-1/2 h-full bg-primary/5 -skew-x-12 translate-x-1/4 -z-10" />
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-green-500/10 rounded-full blur-3xl -z-10" />

            <div className="container mx-auto px-4">
                <div className="flex flex-col lg:flex-row items-center gap-16 lg:gap-24">

                    {/* Left Content */}
                    <div className="flex-1 space-y-8 animate-in slide-in-from-left duration-700">
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary border border-primary/20">
                            <Star className="h-4 w-4 fill-primary" />
                            <span className="text-sm font-bold">L'application n°1 en Côte d'Ivoire</span>
                        </div>

                        <h2 className="text-4xl lg:text-6xl font-black tracking-tighter text-foreground leading-[1.1]">
                            Votre <span className="text-primary italic">Pharmacie</span> <br />
                            dans votre poche
                        </h2>

                        <p className="text-lg text-muted-foreground max-w-xl leading-relaxed">
                            Téléchargez l'application PharmaGo pour commander vos médicaments,
                            trouver les pharmacies de garde et consulter un médecin depuis votre mobile.
                        </p>

                        <div className="space-y-4">
                            <div className="flex items-start gap-4">
                                <div className="w-12 h-12 rounded-2xl bg-green-100 flex items-center justify-center flex-shrink-0">
                                    <span className="text-2xl">⚡</span>
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg">Commande Express</h3>
                                    <p className="text-muted-foreground">Scannez votre ordonnance et faites-vous livrer en 30 min.</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-4">
                                <div className="w-12 h-12 rounded-2xl bg-blue-100 flex items-center justify-center flex-shrink-0">
                                    <span className="text-2xl">📍</span>
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg">Géolocalisation</h3>
                                    <p className="text-muted-foreground">Trouvez instantanément les pharmacies ouvertes autour de vous.</p>
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-4 pt-4">
                            <Button className="h-14 px-8 rounded-2xl bg-black text-white hover:bg-gray-800 transition-all shadow-xl hover:-translate-y-1">
                                <Download className="mr-2 h-5 w-5" />
                                <div className="text-left">
                                    <div className="text-[10px] uppercase font-bold text-gray-400">Disponible sur</div>
                                    <div className="text-base font-bold leading-none">App Store</div>
                                </div>
                            </Button>

                            <Button className="h-14 px-8 rounded-2xl bg-black text-white hover:bg-gray-800 transition-all shadow-xl hover:-translate-y-1">
                                <Download className="mr-2 h-5 w-5" />
                                <div className="text-left">
                                    <div className="text-[10px] uppercase font-bold text-gray-400">Disponible sur</div>
                                    <div className="text-base font-bold leading-none">Google Play</div>
                                </div>
                            </Button>
                        </div>
                    </div>

                    {/* Right Image (Mockup) */}
                    <div className="flex-1 relative animate-in slide-in-from-right duration-1000">
                        <div className="relative z-10 w-full max-w-[400px] mx-auto perspective-1000">
                            {/* Placeholder for the generated image - will be replaced */}
                            {/* Placeholder for the generated image - will be replaced */}
                            <div className="aspect-[9/16] rounded-[3rem] bg-gray-900 border-8 border-gray-900 shadow-2xl overflow-hidden relative group">
                                {/* Screen Content Simulation */}
                                {!imageError ? (
                                    <img
                                        src="/src/assets/pharmago_mobile_app_mockup.png"
                                        alt="PharmaGo Mobile App"
                                        className="w-full h-full object-cover"
                                        onError={() => setImageError(true)}
                                    />
                                ) : (
                                    <div className="h-full w-full bg-gradient-to-br from-primary to-blue-600 flex flex-col items-center justify-center text-white p-8 text-center">
                                        <div className="text-4xl font-black mb-4 tracking-tighter">PharmaGo</div>
                                        <p className="text-sm font-medium opacity-80">Application Mobile</p>
                                        <div className="mt-8 grid grid-cols-2 gap-4 w-full">
                                            <div className="bg-white/20 backdrop-blur-sm p-4 rounded-2xl">
                                                <div className="text-2xl font-bold">30m</div>
                                                <div className="text-[10px] uppercase">Livraison</div>
                                            </div>
                                            <div className="bg-white/20 backdrop-blur-sm p-4 rounded-2xl">
                                                <div className="text-2xl font-bold">24/7</div>
                                                <div className="text-[10px] uppercase">Service</div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Glare effect */}
                                <div className="absolute top-0 right-0 w-2/3 h-full bg-gradient-to-l from-white/10 to-transparent pointer-events-none" />
                            </div>

                            {/* Floating Elements */}
                            <div className="absolute -top-12 -right-12 bg-white/80 backdrop-blur-xl p-4 rounded-2xl shadow-xl animate-float">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center text-white font-bold">✓</div>
                                    <div>
                                        <p className="text-xs font-bold text-muted-foreground">Commande livrée</p>
                                        <p className="font-bold text-foreground">14:30</p>
                                    </div>
                                </div>
                            </div>

                            <div className="absolute -bottom-8 -left-8 bg-white/80 backdrop-blur-xl p-4 rounded-2xl shadow-xl animate-float" style={{ animationDelay: '1.5s' }}>
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold">
                                        <Star className="h-5 w-5 fill-white" />
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-muted-foreground">Avis Client</p>
                                        <p className="font-bold text-foreground">5.0/5 Excellent</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Ambient Background Glow behind phone */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-gradient-to-tr from-primary/20 to-blue-500/20 blur-3xl rounded-full -z-10" />
                    </div>

                </div>
            </div>
        </section>
    );
};

export default MobileAppShowcase;
