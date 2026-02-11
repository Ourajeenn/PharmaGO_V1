
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight, Download, Star } from "lucide-react";

export const MobileAppShowcase = () => {
    const [imageError, setImageError] = useState(false);
    return (
        <section className="py-24 relative overflow-hidden">


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
                    </div>

                    {/* Right Image (Mockup) */}
                    <div className="flex-1 relative animate-in slide-in-from-right duration-1000">
                        <div className="relative z-10 w-full max-w-[550px] mx-auto">
                            {/* Phone mockup with slow gentle float animation */}
                            <div className="relative z-10 w-full max-w-[550px] mx-auto">


                                {!imageError ? (
                                    <img
                                        src="/pharmago-mobile-transparent.png"
                                        alt="PharmaGo Mobile App"
                                        className="w-full h-auto drop-shadow-2xl"
                                        onError={() => setImageError(true)}
                                        style={{
                                            animation: 'float 6s ease-in-out infinite'
                                        }}
                                    />
                                ) : (
                                    <div className="aspect-[9/16] rounded-[3rem] bg-gray-900 border-8 border-gray-900 shadow-2xl overflow-hidden relative group">
                                        <div className="h-full w-full bg-gradient-to-br from-primary to-blue-600 flex flex-col items-center justify-center text-white p-8 text-center">
                                            <div className="text-4xl font-black mb-4 tracking-tighter">PharmaGo</div>
                                            <p className="text-sm font-medium opacity-80">Application Mobile</p>
                                        </div>
                                    </div>
                                )}
                            </div>


                        </div>


                    </div>

                </div>
            </div>
        </section>
    );
};

export default MobileAppShowcase;
