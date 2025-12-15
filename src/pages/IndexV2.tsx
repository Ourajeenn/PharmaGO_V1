import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from "@/components/Header";
import FooterV2 from "@/components/FooterV2";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
    Zap,
    Rocket,
    Building2,
    Check,
    ChevronLeft,
    ChevronRight,
    ArrowRight,
    Mail
} from "lucide-react";

const IndexV2 = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [currentTestimonial, setCurrentTestimonial] = useState(0);

    const plans = [
        {
            name: "Creator",
            price: "15,000",
            icon: Zap,
            color: "orange",
            features: [
                "Livraison en 24h",
                "Suivi en temps réel",
                "3 Pharmacies partenaires",
                "Rapport hebdomadaire",
                "Alerte disponibilité"
            ]
        },
        {
            name: "Pro Growth",
            price: "45,000",
            icon: Rocket,
            color: "blue",
            features: [
                "Livraison express (2h)",
                "Toutes les pharmacies",
                "Support prioritaire",
                "Ordonnances illimitées",
                "Remises exclusives"
            ]
        },
        {
            name: "Agency",
            price: "Sur mesure",
            icon: Building2,
            color: "purple",
            features: [
                "Solution entreprise",
                "API personnalisée",
                "Gestionnaire dédié",
                "Facturation groupée",
                "Support 24/7"
            ]
        }
    ];

    const testimonials = [
        {
            quote: "J'ai commandé mes médicaments en quelques clics et ils sont arrivés en moins d'une heure. Service exceptionnel !",
            author: "Marie Kouadio",
            role: "Patiente",
            flag: "🇨🇮",
            badge: "Active Patient"
        },
        {
            quote: "PharmaGo a révolutionné ma façon de gérer mes prescriptions. Plus besoin de faire la queue à la pharmacie.",
            author: "Jean Koné",
            role: "Utilisateur Premium",
            flag: "🇨🇮",
            badge: "Premium Member"
        },
        {
            quote: "Le suivi en temps réel est incroyable. Je peux voir exactement où se trouve ma commande à tout moment.",
            author: "Aminata Diallo",
            role: "Cliente",
            flag: "🇨🇮",
            badge: "Verified User"
        }
    ];

    const nextTestimonial = () => {
        setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
    };

    const prevTestimonial = () => {
        setCurrentTestimonial((prev) => (prev - 1 + testimonials.length) % testimonials.length);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
            <Header />

            <main className="relative">
                {/* Pricing Section */}
                <section className="py-20 px-4">
                    <div className="container mx-auto max-w-6xl">
                        <div className="flex items-start justify-between mb-12">
                            <div>
                                <div className="text-8xl font-bold text-orange-500/20 mb-4">03</div>
                                <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
                                    Choisissez Votre Formule
                                </h2>
                                <p className="text-slate-400 text-lg max-w-2xl">
                                    Automatisez vos commandes de médicaments, suivez vos livraisons en temps réel,
                                    et bénéficiez de notre réseau de pharmacies partenaires.
                                </p>
                            </div>
                        </div>

                        <div className="grid md:grid-cols-3 gap-6">
                            {plans.map((plan, index) => {
                                const Icon = plan.icon;
                                return (
                                    <Card
                                        key={plan.name}
                                        className={`relative overflow-hidden border-2 transition-all duration-300 hover:scale-105 hover:shadow-2xl ${index === 0
                                                ? 'bg-gradient-to-br from-orange-500/10 to-orange-600/5 border-orange-500/30'
                                                : 'bg-slate-900/50 border-slate-800 hover:border-slate-700'
                                            }`}
                                    >
                                        <CardContent className="p-8">
                                            <div className="flex items-center justify-between mb-6">
                                                <h3 className="text-2xl font-bold text-white">{plan.name}</h3>
                                                <div className={`p-3 rounded-full bg-${plan.color}-500/20`}>
                                                    <Icon className={`h-6 w-6 text-${plan.color}-500`} />
                                                </div>
                                            </div>

                                            <div className="mb-6">
                                                <div className="flex items-baseline gap-1">
                                                    {plan.price !== "Sur mesure" ? (
                                                        <>
                                                            <span className="text-4xl font-bold text-white">{plan.price}</span>
                                                            <span className="text-slate-400">FCFA</span>
                                                            <span className="text-sm text-slate-500">/mois</span>
                                                        </>
                                                    ) : (
                                                        <span className="text-3xl font-bold text-white">{plan.price}</span>
                                                    )}
                                                </div>
                                                {index === 0 && (
                                                    <p className="text-sm text-slate-400 mt-2">
                                                        Idéal pour les particuliers
                                                    </p>
                                                )}
                                            </div>

                                            <ul className="space-y-3 mb-8">
                                                {plan.features.map((feature) => (
                                                    <li key={feature} className="flex items-start gap-2 text-slate-300">
                                                        <Check className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                                                        <span>{feature}</span>
                                                    </li>
                                                ))}
                                            </ul>

                                            <Button
                                                className={`w-full ${index === 0
                                                        ? 'bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700'
                                                        : 'bg-slate-800 hover:bg-slate-700'
                                                    }`}
                                                size="lg"
                                            >
                                                Démarrer
                                                <ArrowRight className="ml-2 h-4 w-4" />
                                            </Button>
                                        </CardContent>
                                    </Card>
                                );
                            })}
                        </div>
                    </div>
                </section>

                {/* Testimonials Section */}
                <section className="py-20 px-4 bg-slate-950/50">
                    <div className="container mx-auto max-w-6xl">
                        <div className="flex items-start justify-between mb-12">
                            <div>
                                <div className="text-8xl font-bold text-orange-500/20 mb-4">02</div>
                                <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
                                    Résultats Réels. Croissance Réelle.
                                </h2>
                                <p className="text-slate-400 text-lg">
                                    Découvrez les témoignages de nos utilisateurs qui ont transformé
                                    leur expérience santé avec PharmaGo.
                                </p>
                            </div>
                            <Button
                                className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700"
                                size="lg"
                            >
                                Commencer Maintenant
                            </Button>
                        </div>

                        <div className="relative">
                            <div className="grid md:grid-cols-2 gap-8 items-center">
                                <Card className="bg-gradient-to-br from-slate-900 to-slate-800 border-2 border-slate-700 p-8">
                                    <CardContent className="p-0">
                                        <div className="text-orange-500 mb-6">
                                            <svg width="40" height="40" viewBox="0 0 40 40" fill="currentColor">
                                                <path d="M8 16c0-4.4 3.6-8 8-8s8 3.6 8 8c0 4.4-3.6 8-8 8v8l-8-8zm16 0c0-4.4 3.6-8 8-8s8 3.6 8 8c0 4.4-3.6 8-8 8v8l-8-8z" />
                                            </svg>
                                        </div>
                                        <blockquote className="text-xl text-white mb-6 leading-relaxed">
                                            "{testimonials[currentTestimonial].quote}"
                                        </blockquote>
                                        <div>
                                            <div className="font-bold text-white">{testimonials[currentTestimonial].author}</div>
                                            <div className="flex items-center gap-2 text-sm text-slate-400">
                                                <span>{testimonials[currentTestimonial].role}</span>
                                                <span>{testimonials[currentTestimonial].flag}</span>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                <div className="relative h-96 rounded-3xl overflow-hidden">
                                    <div className="absolute inset-0 bg-gradient-to-br from-orange-500 via-orange-400 to-amber-500" />
                                    <div className="absolute top-4 right-4">
                                        <Badge className="bg-orange-700/80 text-white border-none">
                                            {testimonials[currentTestimonial].badge}
                                        </Badge>
                                    </div>
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <div className="w-48 h-48 rounded-full bg-black/20 backdrop-blur-sm" />
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-center gap-4 mt-8">
                                <Button
                                    variant="outline"
                                    size="icon"
                                    onClick={prevTestimonial}
                                    className="rounded-full bg-slate-800 border-slate-700 hover:bg-slate-700"
                                >
                                    <ChevronLeft className="h-5 w-5 text-white" />
                                </Button>
                                <Button
                                    variant="outline"
                                    size="icon"
                                    onClick={nextTestimonial}
                                    className="rounded-full bg-slate-800 border-slate-700 hover:bg-slate-700"
                                >
                                    <ChevronRight className="h-5 w-5 text-white" />
                                </Button>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Newsletter Section */}
                <section className="py-32 px-4 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-orange-600 via-orange-500 to-amber-400 opacity-90" />
                    <div className="absolute inset-0 bg-gradient-to-tl from-blue-900/40 via-transparent to-green-900/40" />

                    <div className="container mx-auto max-w-2xl relative z-10 text-center">
                        <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
                            Rejoignez Notre Newsletter
                        </h2>
                        <p className="text-white/90 text-lg mb-8">
                            Recevez en exclusivité nos offres spéciales, conseils santé,
                            et actualités livrés directement dans votre boîte mail.
                        </p>

                        <div className="flex gap-2 max-w-md mx-auto">
                            <div className="relative flex-1">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                                <Input
                                    type="email"
                                    placeholder="Entrez votre email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="pl-10 bg-black/30 border-white/30 text-white placeholder:text-white/60 h-12"
                                />
                            </div>
                            <Button
                                size="lg"
                                className="bg-white text-orange-600 hover:bg-white/90 font-semibold px-8"
                            >
                                S'abonner
                            </Button>
                        </div>
                    </div>
                </section>
            </main>

            <FooterV2 />
        </div>
    );
};

export default IndexV2;
