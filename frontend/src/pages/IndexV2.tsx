import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from "@/components/Header";
import Footer from "@/components/Footer";
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
    Mail,
    Star,
    Shield,
    Heart
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
            description: "Idéal pour les particuliers et le suivi personnel.",
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
            highlight: true,
            description: "Le choix parfait pour les familles et un suivi complet.",
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
            description: "Solutions pour entreprises et institutions.",
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
        <div className="min-h-screen mesh-gradient relative">
            <Header />

            <main className="relative pt-10">
                {/* Hero Section V2 - Added context */}
                <section className="py-20 px-4 container mx-auto text-center space-y-8 animate-in fade-in duration-1000">
                    <Badge variant="outline" className="px-4 py-1.5 border-primary/20 text-primary font-black uppercase tracking-widest bg-white/40 backdrop-blur-md">
                        ✨ Expérience Santé Premium
                    </Badge>
                    <h1 className="text-5xl md:text-7xl font-black tracking-tighter uppercase text-foreground/90 max-w-4xl mx-auto leading-[0.9]">
                        La Pharmacie de <span className="text-primary tracking-normal">Demain</span>, Aujourd'hui.
                    </h1>
                    <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto font-medium leading-relaxed">
                        Rejoignez des milliers d'utilisateurs qui font confiance à PharmaGo pour une santé simplifiée, connectée et humaine.
                    </p>
                    <div className="flex flex-wrap justify-center gap-4">
                        <Button
                            size="lg"
                            onClick={() => navigate('/auth')}
                            className="h-14 px-10 rounded-2xl bg-primary hover:bg-primary-hover text-white font-black uppercase tracking-widest shadow-xl shadow-primary/20 transition-all hover:scale-[1.02]"
                        >
                            Démarrer mon accès
                            <ArrowRight className="ml-2 h-5 w-5" />
                        </Button>
                        <Button
                            variant="outline"
                            size="lg"
                            onClick={() => navigate('/pharmacies')}
                            className="h-14 px-10 rounded-2xl glass-morphism border-white/40 font-black uppercase tracking-widest hover:bg-white/60 transition-all"
                        >
                            Explorer les pharmacies
                        </Button>
                    </div>
                </section>

                {/* Pricing Section */}
                <section className="py-24 px-4 bg-white/20 backdrop-blur-sm border-y border-white/30">
                    <div className="container mx-auto max-w-6xl">
                        <div className="text-center mb-16 space-y-4">
                            <h2 className="text-4xl md:text-5xl font-black tracking-tighter uppercase">
                                Choisissez Votre <span className="text-orange-500">Formule</span>
                            </h2>
                            <p className="text-muted-foreground text-lg max-w-2xl mx-auto font-medium">
                                Des solutions adaptées à chaque besoin, parce que votre santé mérite le meilleur.
                            </p>
                        </div>

                        <div className="grid md:grid-cols-3 gap-8">
                            {plans.map((plan, index) => {
                                const Icon = plan.icon;
                                const isHighlighted = plan.highlight;
                                return (
                                    <div
                                        key={plan.name}
                                        className={`group relative overflow-hidden rounded-[2.5rem] p-[1px] transition-all duration-500 hover:scale-[1.03] ${isHighlighted ? 'led-border-container' : ''}`}
                                    >
                                        {isHighlighted && <div className="led-border-spinner" />}
                                        <div className={`relative h-full bg-white/40 backdrop-blur-xl rounded-[2.4rem] p-10 border border-white/30 flex flex-col ${isHighlighted ? 'shadow-2xl' : 'shadow-xl'}`}>
                                            <div className="flex items-center justify-between mb-8">
                                                <div className={`p-4 rounded-2xl bg-${plan.color}-500/10 border border-${plan.color}-500/20 text-${plan.color}-500`}>
                                                    <Icon className="h-8 w-8" />
                                                </div>
                                                {isHighlighted && (
                                                    <Badge className="bg-primary text-white font-black uppercase tracking-widest rounded-full">Plus Populaire</Badge>
                                                )}
                                            </div>

                                            <div className="mb-8 space-y-2">
                                                <h3 className="text-2xl font-black uppercase tracking-tighter">{plan.name}</h3>
                                                <p className="text-sm text-muted-foreground font-medium leading-relaxed">{plan.description}</p>
                                            </div>

                                            <div className="mb-10">
                                                <div className="flex items-baseline gap-2">
                                                    {plan.price !== "Sur mesure" ? (
                                                        <>
                                                            <span className="text-5xl font-black tracking-tighter">{plan.price}</span>
                                                            <div className="flex flex-col">
                                                                <span className="text-sm font-bold opacity-60">FCFA</span>
                                                                <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">/ Mois</span>
                                                            </div>
                                                        </>
                                                    ) : (
                                                        <span className="text-4xl font-black tracking-tighter uppercase">{plan.price}</span>
                                                    )}
                                                </div>
                                            </div>

                                            <ul className="space-y-4 mb-10 flex-1">
                                                {plan.features.map((feature) => (
                                                    <li key={feature} className="flex items-center gap-3 text-sm font-bold text-foreground/70 group-hover:text-foreground transition-colors">
                                                        <div className="h-5 w-5 rounded-full bg-green-500/10 flex items-center justify-center text-green-600 flex-shrink-0">
                                                            <Check className="h-3 w-3" />
                                                        </div>
                                                        <span>{feature}</span>
                                                    </li>
                                                ))}
                                            </ul>

                                            <Button
                                                className={`w-full h-14 rounded-2xl font-black uppercase tracking-widest transition-all ${isHighlighted
                                                    ? 'bg-primary hover:bg-primary-hover text-white shadow-lg shadow-primary/20'
                                                    : 'glass-morphism border-white/40 hover:bg-white/60'
                                                    }`}
                                                size="lg"
                                            >
                                                Démarrer
                                                <ArrowRight className="ml-2 h-5 w-5" />
                                            </Button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </section>

                {/* Testimonials Section */}
                <section className="py-24 px-4 relative">
                    <div className="container mx-auto max-w-6xl">
                        <div className="flex flex-col md:flex-row items-center justify-between mb-20 gap-8">
                            <div className="text-center md:text-left space-y-4">
                                <h2 className="text-4xl md:text-5xl font-black tracking-tighter uppercase leading-tight">
                                    Impact Réel, <br />
                                    <span className="text-primary">Croissance Humaine</span>
                                </h2>
                                <p className="text-muted-foreground text-lg font-medium max-w-lg">
                                    Découvrez comment PharmaGo transforme le quotidien de nos utilisateurs à travers l'Afrique de l'Ouest.
                                </p>
                            </div>
                            <Button
                                size="lg"
                                className="h-16 px-10 rounded-[2rem] bg-foreground text-background font-black uppercase tracking-widest hover:scale-[1.05] transition-all"
                            >
                                Commencer Maintenant
                            </Button>
                        </div>

                        <div className="grid lg:grid-cols-2 gap-12 items-center">
                            <div className="space-y-8 animate-in slide-in-from-left duration-700">
                                <Card className="glass-card p-10 lg:p-14 border-white/50 bg-white/60">
                                    <CardContent className="p-0 space-y-8">
                                        <div className="flex gap-1">
                                            {[1, 2, 3, 4, 5].map(i => <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />)}
                                        </div>
                                        <blockquote className="text-2xl lg:text-3xl font-bold tracking-tight text-foreground/90 italic">
                                            "{testimonials[currentTestimonial].quote}"
                                        </blockquote>
                                        <div className="flex items-center gap-4">
                                            <div className="w-16 h-16 rounded-3xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
                                                <Heart className="h-8 w-8" />
                                            </div>
                                            <div>
                                                <div className="font-black text-xl tracking-tighter uppercase">{testimonials[currentTestimonial].author}</div>
                                                <div className="flex items-center gap-2 text-sm font-bold text-muted-foreground">
                                                    <span>{testimonials[currentTestimonial].role}</span>
                                                    <span className="opacity-40">•</span>
                                                    <span>{testimonials[currentTestimonial].flag}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                <div className="flex gap-4">
                                    <Button
                                        variant="outline"
                                        size="icon"
                                        onClick={prevTestimonial}
                                        className="h-14 w-14 rounded-2xl glass-morphism border-white/40 hover:bg-white/60"
                                    >
                                        <ChevronLeft className="h-6 w-6" />
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="icon"
                                        onClick={nextTestimonial}
                                        className="h-14 w-14 rounded-2xl glass-morphism border-white/40 hover:bg-white/60"
                                    >
                                        <ChevronRight className="h-6 w-6" />
                                    </Button>
                                </div>
                            </div>

                            <div className="relative h-[500px] rounded-[3rem] overflow-hidden group shadow-2xl animate-in slide-in-from-right duration-700">
                                <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary/80 to-blue-600" />
                                <div className="absolute inset-0 bg-[url('/pharmacy-hero.jpg')] bg-cover bg-center mix-blend-overlay opacity-30 group-hover:scale-110 transition-transform duration-1000" />

                                <div className="absolute top-10 right-10">
                                    <Badge className="h-10 px-6 bg-white/20 backdrop-blur-md text-white border-white/30 font-black uppercase tracking-widest text-[10px]">
                                        {testimonials[currentTestimonial].badge}
                                    </Badge>
                                </div>

                                <div className="absolute bottom-10 left-10 right-10 p-8 glass-morphism bg-white/20 border-white/30 rounded-3xl space-y-4">
                                    <div className="flex items-center gap-3">
                                        <Shield className="h-6 w-6 text-white" />
                                        <span className="text-white font-black uppercase tracking-widest text-xs">Vérifié par PharmaGo</span>
                                    </div>
                                    <p className="text-white/80 text-sm font-medium">L'authenticité et la qualité au service de votre bien-être.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Newsletter Section */}
                <section className="py-32 px-4">
                    <div className="container mx-auto max-w-4xl relative z-10 text-center space-y-8">
                        <div className="led-border-container rounded-[2.5rem] p-[1px]">
                            <div className="led-border-spinner" />
                            <div className="relative bg-white/40 backdrop-blur-2xl rounded-[2.4rem] p-12 lg:p-20 border border-white/40 space-y-10 shadow-2xl">
                                <div className="space-y-4">
                                    <h2 className="text-4xl md:text-6xl font-black tracking-tighter uppercase leading-none">
                                        Rejoignez Notre <br />
                                        <span className="text-primary tracking-normal">Newsletter</span>
                                    </h2>
                                    <p className="text-muted-foreground text-lg md:text-xl font-medium max-w-xl mx-auto leading-relaxed">
                                        Recevez en exclusivité nos conseils santé et actualités livrés directement dans votre boîte mail.
                                    </p>
                                </div>

                                <form className="flex flex-col sm:flex-row gap-4 max-w-lg mx-auto" onSubmit={(e) => e.preventDefault()}>
                                    <div className="relative flex-1">
                                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                                        <Input
                                            type="email"
                                            placeholder="votre@email.com"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            className="h-16 pl-12 rounded-2xl bg-white/60 border-white/40 focus:bg-white transition-all font-bold shadow-inner"
                                        />
                                    </div>
                                    <Button
                                        size="lg"
                                        className="h-16 px-10 rounded-2xl bg-primary hover:bg-primary-hover text-white font-black uppercase tracking-widest shadow-xl shadow-primary/20 transition-all hover:scale-[1.05]"
                                    >
                                        S'abonner
                                    </Button>
                                </form>
                                <p className="text-[10px] text-muted-foreground/60 font-bold uppercase tracking-widest">
                                    Pas de spam. Promis.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>
            </main>

            <Footer />
        </div>
    );
};

export default IndexV2;
