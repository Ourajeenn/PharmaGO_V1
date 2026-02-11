import { Button } from "@/components/ui/button";
import { Rocket, Shield, Heart, ArrowRight } from "lucide-react";
import ScrollReveal from "./ScrollReveal";

const GetStartedSection = () => {
    return (
        <section className="py-24 relative overflow-hidden bg-slate-950">
            {/* Background purely for aesthetic */}
            <div className="absolute inset-0 opacity-10">
                <div className="absolute top-0 left-0 w-96 h-96 bg-primary rounded-full blur-[120px] -translate-x-1/2 -translate-y-1/2" />
                <div className="absolute bottom-0 right-0 w-96 h-96 bg-secondary rounded-full blur-[120px] translate-x-1/2 translate-y-1/2" />
            </div>

            <div className="container mx-auto px-4 relative z-10">
                <div className="max-w-4xl mx-auto text-center">
                    <ScrollReveal animation="fade-up">
                        <h2 className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight">
                            Prêt à transformer votre <br />
                            <span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                                expérience santé ?
                            </span>
                        </h2>
                    </ScrollReveal>

                    <ScrollReveal animation="fade-up" delay={0.2}>
                        <p className="text-xl text-slate-300 mb-10 leading-relaxed max-w-2xl mx-auto">
                            Rejoignez des milliers d'utilisateurs qui font confiance à PharmaGo pour leurs besoins de santé au quotidien. Simple, rapide et sécurisé.
                        </p>
                    </ScrollReveal>

                    <ScrollReveal animation="fade-up" delay={0.4}>
                        <div className="grid md:grid-cols-3 gap-8 mb-12 text-left">
                            <div className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
                                <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center mb-4 text-primary">
                                    <Shield className="h-6 w-6" />
                                </div>
                                <h3 className="text-xl font-bold text-white mb-2">Sécurisé</h3>
                                <p className="text-slate-400">Vos données et ordonnances sont protégées avec les plus hauts standards.</p>
                            </div>
                            <div className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
                                <div className="w-12 h-12 rounded-xl bg-secondary/20 flex items-center justify-center mb-4 text-secondary">
                                    <Heart className="h-6 w-6" />
                                </div>
                                <h3 className="text-xl font-bold text-white mb-2">Humain</h3>
                                <p className="text-slate-400">Une équipe à votre écoute 24h/24 pour vous accompagner partout.</p>
                            </div>
                            <div className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
                                <div className="w-12 h-12 rounded-xl bg-accent/20 flex items-center justify-center mb-4 text-accent">
                                    <ArrowRight className="h-6 w-6" />
                                </div>
                                <h3 className="text-xl font-bold text-white mb-2">Rapide</h3>
                                <p className="text-slate-400">Livraison en moins de 30 minutes dans tout Abidjan par nos experts.</p>
                            </div>
                        </div>
                    </ScrollReveal>

                    <ScrollReveal animation="fade-up" delay={0.6}>
                        <div className="flex flex-col sm:flex-row gap-6 justify-center">
                            <Button
                                size="lg"
                                className="text-xl px-12 py-8 bg-gradient-to-r from-primary to-secondary hover:shadow-[0_0_30px_rgba(234,88,12,0.5)] transition-all duration-300 transform hover:scale-105"
                                onClick={() => window.location.href = '/auth'}
                            >
                                <Rocket className="h-6 w-6 mr-3" />
                                Commencer maintenant
                            </Button>
                            <Button
                                variant="outline"
                                size="lg"
                                className="text-xl px-12 py-8 border-white/20 text-white hover:bg-white/10 transition-all duration-300"
                                onClick={() => window.location.href = '/medicaments'}
                            >
                                Voir le catalogue
                            </Button>
                        </div>
                    </ScrollReveal>
                </div>
            </div>
        </section>
    );
};

export default GetStartedSection;
