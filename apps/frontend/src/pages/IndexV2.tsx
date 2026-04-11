import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Header from "@/components/core/Header";
import Footer from "@/components/core/Footer";
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

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.2, delayChildren: 0.3 }
        }
    };

    const itemVariants = {
        hidden: { y: 40, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1,
            transition: { type: "spring", stiffness: 100 } as any
        }
    };

    return (
        <div className="min-h-screen mesh-gradient relative overflow-x-hidden">
            <Header />

            <main className="relative pt-10">
                {/* Hero Section V2 */}
                <section className="py-24 px-4 container mx-auto text-center space-y-10">
                    <motion.div
                        initial={{ scale: 0.5, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ type: "spring", stiffness: 200, damping: 10 }}
                    >
                        <Badge variant="outline" className="px-5 py-2 border-primary/20 text-primary font-black uppercase tracking-widest bg-white/40 backdrop-blur-md shadow-lg">
                            ✨ Expérience Santé Premium
                        </Badge>
                    </motion.div>

                    <motion.h1
                        initial={{ y: 50, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        className="text-6xl md:text-8xl font-black tracking-tighter uppercase text-foreground/90 max-w-5xl mx-auto leading-[0.85]"
                    >
                        La Pharmacie de <motion.span
                            animate={{ color: ["#0EA5E9", "#6366F1", "#0EA5E9"] }}
                            transition={{ duration: 3, repeat: Infinity }}
                            className="text-primary tracking-normal inline-block"
                        >Demain</motion.span>, Aujourd'hui.
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.5, duration: 1 }}
                        className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto font-medium leading-relaxed"
                    >
                        Rejoignez des milliers d'utilisateurs qui font confiance à PharmaGo pour une santé simplifiée, connectée et humaine.
                    </motion.p>

                    <motion.div
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                        className="flex flex-wrap justify-center gap-6"
                    >
                        <motion.div variants={itemVariants} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                            <Button
                                size="lg"
                                onClick={() => navigate('/auth/patient')}
                                className="h-16 px-12 rounded-2xl bg-primary hover:bg-primary-hover text-white font-black uppercase tracking-widest shadow-2xl shadow-primary/30 transition-shadow relative overflow-hidden group"
                            >
                                <span className="relative z-10 flex items-center">
                                    Démarrer mon accès
                                    <ArrowRight className="ml-2 h-6 w-6 group-hover:translate-x-2 transition-transform" />
                                </span>
                                <motion.div
                                    className="absolute inset-0 bg-white/20"
                                    initial={{ x: "-100%" }}
                                    whileHover={{ x: "100%" }}
                                    transition={{ duration: 0.6 }}
                                />
                            </Button>
                        </motion.div>

                        <motion.div variants={itemVariants} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                            <Button
                                variant="outline"
                                size="lg"
                                onClick={() => navigate('/pharmacies')}
                                className="h-16 px-12 rounded-2xl glass-morphism border-white/40 font-black uppercase tracking-widest hover:bg-white/60 transition-all shadow-xl"
                            >
                                Explorer les pharmacies
                            </Button>
                        </motion.div>
                    </motion.div>
                </section>

                {/* Pricing Section */}
                <section className="py-24 px-4 bg-white/5 backdrop-blur-sm border-y border-white/20 overflow-hidden">
                    <div className="container mx-auto max-w-6xl">
                        <motion.div
                            initial={{ opacity: 0, x: -100 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            className="text-center mb-20 space-y-6"
                        >
                            <h2 className="text-5xl md:text-7xl font-black tracking-tighter uppercase">
                                Choisissez Votre <span className="text-orange-500">Formule</span>
                            </h2>
                            <p className="text-muted-foreground text-xl max-w-3xl mx-auto font-medium">
                                Des solutions adaptées à chaque besoin, parce que votre santé mérite le meilleur.
                            </p>
                        </motion.div>

                        <div className="grid md:grid-cols-3 gap-10">
                            {plans.map((plan, index) => {
                                const Icon = plan.icon;
                                const isHighlighted = plan.highlight;
                                return (
                                    <motion.div
                                        key={plan.name}
                                        initial={{ opacity: 0, y: 100 }}
                                        whileInView={{ opacity: 1, y: 0 }}
                                        viewport={{ once: true }}
                                        transition={{ delay: index * 0.2, duration: 0.6 }}
                                        whileHover={{ y: -20, scale: 1.02 }}
                                        className={`group relative overflow-hidden rounded-[3rem] p-[2px] transition-all duration-500 ${isHighlighted ? 'led-border-container' : 'bg-white/20'}`}
                                    >
                                        {isHighlighted && <div className="led-border-spinner" />}
                                        <div className={`relative h-full bg-white/40 backdrop-blur-2xl rounded-[2.9rem] p-12 border border-white/40 flex flex-col ${isHighlighted ? 'shadow-[0_0_50px_rgba(14,165,233,0.1)]' : 'shadow-2xl'}`}>
                                            <div className="flex items-center justify-between mb-10">
                                                <motion.div
                                                    animate={{ rotate: [0, 10, -10, 0] }}
                                                    transition={{ duration: 4, repeat: Infinity }}
                                                    className={`p-5 rounded-3xl bg-${plan.color}-500/10 border border-${plan.color}-500/20 text-${plan.color}-500`}
                                                >
                                                    <Icon className="h-10 w-10" />
                                                </motion.div>
                                                {isHighlighted && (
                                                    <Badge className="bg-primary px-4 py-1.5 text-[10px] text-white font-black uppercase tracking-widest rounded-full shadow-lg shadow-primary/20">Plus Populaire</Badge>
                                                )}
                                            </div>

                                            <div className="mb-10 space-y-3">
                                                <h3 className="text-3xl font-black uppercase tracking-tighter">{plan.name}</h3>
                                                <p className="text-base text-muted-foreground font-medium leading-relaxed">{plan.description}</p>
                                            </div>

                                            <div className="mb-12">
                                                <div className="flex items-baseline gap-2">
                                                    {plan.price !== "Sur mesure" ? (
                                                        <>
                                                            <span className="text-6xl font-black tracking-tighter">{plan.price}</span>
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

                                            <ul className="space-y-5 mb-12 flex-1">
                                                {plan.features.map((feature) => (
                                                    <motion.li
                                                        key={feature}
                                                        whileHover={{ x: 10 }}
                                                        className="flex items-center gap-4 text-base font-bold text-foreground/70 group-hover:text-foreground transition-colors"
                                                    >
                                                        <div className="h-6 w-6 rounded-full bg-green-500/10 flex items-center justify-center text-green-600 flex-shrink-0 border border-green-500/20">
                                                            <Check className="h-4 w-4" />
                                                        </div>
                                                        <span>{feature}</span>
                                                    </motion.li>
                                                ))}
                                            </ul>

                                            <Button
                                                className={`w-full h-16 rounded-[2rem] font-black uppercase tracking-widest transition-all ${isHighlighted
                                                    ? 'bg-primary hover:bg-primary-hover text-white shadow-2xl shadow-primary/30'
                                                    : 'glass-morphism border-white/40 hover:bg-primary hover:text-white'
                                                    }`}
                                                size="lg"
                                            >
                                                Démarrer
                                                <ArrowRight className="ml-2 h-6 w-6" />
                                            </Button>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </div>
                    </div>
                </section>

                {/* Testimonials Section */}
                <section className="py-32 px-4 relative overflow-hidden">
                    <div className="container mx-auto max-w-6xl relative z-10">
                        <div className="flex flex-col md:flex-row items-center justify-between mb-24 gap-12">
                            <motion.div
                                initial={{ opacity: 0, scale: 0.8 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                className="text-center md:text-left space-y-6"
                            >
                                <h2 className="text-5xl md:text-7xl font-black tracking-tighter uppercase leading-[0.85]">
                                    Impact Réel, <br />
                                    <span className="text-primary">Expérience Humaine</span>
                                </h2>
                                <p className="text-muted-foreground text-xl font-medium max-w-xl">
                                    Découvrez comment PharmaGo transforme le quotidien de nos utilisateurs à travers l'Afrique de l'Ouest.
                                </p>
                            </motion.div>
                            <motion.div whileHover={{ rotate: 5, scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                                <Button
                                    size="lg"
                                    className="h-20 px-12 rounded-[2.5rem] bg-foreground text-background font-black uppercase tracking-widest shadow-2xl hover:bg-primary hover:text-white transition-all duration-500"
                                >
                                    Rejoindre maintenant
                                </Button>
                            </motion.div>
                        </div>

                        <div className="grid lg:grid-cols-2 gap-16 items-center">
                            <motion.div
                                initial={{ opacity: 0, rotateY: -30 }}
                                whileInView={{ opacity: 1, rotateY: 0 }}
                                transition={{ duration: 1 }}
                                className="space-y-10"
                            >
                                <AnimatePresence mode="wait">
                                    <motion.div
                                        key={currentTestimonial}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -20 }}
                                        transition={{ duration: 0.5 }}
                                    >
                                        <Card className="glass-card p-12 lg:p-16 border-white/50 bg-white/40 rounded-[3rem] shadow-3xl hover:shadow-primary/5 transition-shadow">
                                            <CardContent className="p-0 space-y-10">
                                                <div className="flex gap-2">
                                                    {[1, 2, 3, 4, 5].map(i => <Star key={i} className="h-6 w-6 fill-yellow-400 text-yellow-400 shadow-sm" />)}
                                                </div>
                                                <blockquote className="text-3xl lg:text-4xl font-black tracking-tight text-foreground/90 italic leading-tight">
                                                    "{testimonials[currentTestimonial].quote}"
                                                </blockquote>
                                                <div className="flex items-center gap-6">
                                                    <motion.div
                                                        whileHover={{ scale: 1.1, rotate: 360 }}
                                                        className="w-20 h-20 rounded-[2rem] bg-primary/10 flex items-center justify-center text-primary border-2 border-primary/20"
                                                    >
                                                        <Heart className="h-10 w-10 fill-primary" />
                                                    </motion.div>
                                                    <div>
                                                        <div className="font-black text-2xl tracking-tighter uppercase">{testimonials[currentTestimonial].author}</div>
                                                        <div className="flex items-center gap-2 text-sm font-black text-muted-foreground uppercase tracking-widest">
                                                            <span>{testimonials[currentTestimonial].role}</span>
                                                            <span className="opacity-40">•</span>
                                                            <span>{testimonials[currentTestimonial].flag}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </motion.div>
                                </AnimatePresence>

                                <div className="flex gap-6">
                                    <motion.div whileHover={{ x: -10 }} whileTap={{ scale: 0.9 }}>
                                        <Button
                                            variant="outline"
                                            size="icon"
                                            onClick={prevTestimonial}
                                            className="h-16 w-16 rounded-3xl glass-morphism border-white/40 hover:bg-white/60 shadow-xl"
                                        >
                                            <ChevronLeft className="h-8 w-8" />
                                        </Button>
                                    </motion.div>
                                    <motion.div whileHover={{ x: 10 }} whileTap={{ scale: 0.9 }}>
                                        <Button
                                            variant="outline"
                                            size="icon"
                                            onClick={nextTestimonial}
                                            className="h-16 w-16 rounded-3xl glass-morphism border-white/40 hover:bg-white/60 shadow-xl"
                                        >
                                            <ChevronRight className="h-8 w-8" />
                                        </Button>
                                    </motion.div>
                                </div>
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0, scale: 0.9, rotate: 5 }}
                                whileInView={{ opacity: 1, scale: 1, rotate: 0 }}
                                transition={{ duration: 1 }}
                                className="relative h-[600px] rounded-[4rem] overflow-hidden group shadow-[0_50px_100px_rgba(0,0,0,0.2)]"
                            >
                                <div className="absolute inset-0 bg-gradient-to-br from-primary via-indigo-600 to-purple-700" />
                                <motion.div
                                    className="absolute inset-0 bg-[url('/pharmacy-hero.jpg')] bg-cover bg-center mix-blend-overlay opacity-40"
                                    whileHover={{ scale: 1.1 }}
                                    transition={{ duration: 1.5 }}
                                />

                                <div className="absolute top-12 right-12">
                                    <Badge className="h-12 px-8 bg-white/20 backdrop-blur-xl text-white border-white/40 font-black uppercase tracking-[0.2em] text-[12px] shadow-2xl">
                                        {testimonials[currentTestimonial].badge}
                                    </Badge>
                                </div>

                                <motion.div
                                    className="absolute bottom-12 left-12 right-12 p-10 glass-morphism bg-white/10 border-white/40 rounded-[3rem] space-y-6 backdrop-blur-3xl shadow-3xl"
                                    initial={{ y: 50, opacity: 0 }}
                                    whileInView={{ y: 0, opacity: 1 }}
                                    transition={{ delay: 0.5 }}
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="p-3 bg-white/20 rounded-2xl">
                                            <Shield className="h-8 w-8 text-white" />
                                        </div>
                                        <span className="text-white font-black uppercase tracking-[0.2em] text-sm">Vérifiée par PharmaGo Core</span>
                                    </div>
                                    <p className="text-white/90 text-lg font-bold leading-tight">L'authenticité et la qualité au service de votre bien-être global.</p>
                                </motion.div>
                            </motion.div>
                        </div>
                    </div>
                </section>

                {/* Newsletter Section */}
                <section className="py-40 px-4 relative overflow-hidden">
                    <motion.div
                        initial={{ opacity: 0, y: 100 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="container mx-auto max-w-5xl relative z-10 text-center"
                    >
                        <div className="led-border-container rounded-[4rem] p-[2px] shadow-4xl group">
                            <div className="led-border-spinner" />
                            <div className="relative bg-white/60 backdrop-blur-3xl rounded-[3.9rem] p-16 lg:p-24 border border-white/50 space-y-12 transition-transform duration-700">
                                <motion.div
                                    className="space-y-6"
                                    animate={{
                                        y: [0, -10, 0],
                                        rotate: [0, 1, -1, 0]
                                    }}
                                    transition={{ duration: 5, repeat: Infinity }}
                                >
                                    <h2 className="text-5xl md:text-8xl font-black tracking-tighter uppercase leading-[0.8]">
                                        Rejoignez La <br />
                                        <span className="text-primary tracking-normal font-sans italic">Newsletter</span>
                                    </h2>
                                    <p className="text-muted-foreground text-xl md:text-2xl font-medium max-w-xl mx-auto leading-relaxed">
                                        Recevez en exclusivité nos conseils santé et actualités livrés directement dans votre boîte mail.
                                    </p>
                                </motion.div>

                                <form className="flex flex-col sm:flex-row gap-6 max-w-2xl mx-auto" onSubmit={(e) => e.preventDefault()}>
                                    <div className="relative flex-1 group/input">
                                        <Mail className="absolute left-6 top-1/2 -translate-y-1/2 h-6 w-6 text-muted-foreground group-focus-within/input:text-primary transition-colors" />
                                        <Input
                                            type="email"
                                            placeholder="votre@email.com"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            className="h-20 pl-16 rounded-3xl bg-white/80 border-white/50 focus:bg-white focus:ring-4 focus:ring-primary/20 transition-all font-bold text-lg shadow-inner"
                                        />
                                    </div>
                                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                        <Button
                                            size="lg"
                                            className="h-20 px-12 rounded-3xl bg-primary hover:bg-primary-hover text-white font-black uppercase tracking-widest shadow-2xl shadow-primary/40 text-lg"
                                        >
                                            S'abonner
                                        </Button>
                                    </motion.div>
                                </form>
                                <p className="text-xs text-muted-foreground/60 font-black uppercase tracking-[0.3em] flex items-center justify-center gap-3">
                                    <Zap className="h-3 w-3 fill-primary" />
                                    ZÉRO SPAM · 100% SANTÉ · CONFIDENTIALITÉ TOTALE
                                </p>
                            </div>
                        </div>
                    </motion.div>
                </section>
            </main>

            <Footer />
        </div>
    );
};

export default IndexV2;
