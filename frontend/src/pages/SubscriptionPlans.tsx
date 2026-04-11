import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, Star, Shield, ArrowRight, Pill, CalendarCheck, TrendingDown } from 'lucide-react';
import { subscriptionService, SubscriptionPlan, UserSubscription } from '@/services/subscriptionService';
import { useToast } from '@/components/ui/use-toast';
import { Progress } from '@/components/ui/progress';

const SubscriptionPlans = () => {
    const navigate = useNavigate();
    const { toast } = useToast();
    const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
    const [subscription, setSubscription] = useState<UserSubscription | null>(null);
    const [step, setStep] = useState(0); // 0: View Plans, 1: Onboarding Meds, 2: Dashboard
    const [selectedMeds, setSelectedMeds] = useState<string[]>(['Amlodipine 10mg']); // Mock default
    const [selectedPlanId, setSelectedPlanId] = useState<string>('');
    const [isProcessing, setIsProcessing] = useState(false);

    useEffect(() => {
        const load = async () => {
            const fetchedPlans = await subscriptionService.getPlans();
            setPlans(fetchedPlans);
            const sub = await subscriptionService.getSubscription('user-1');
            if (sub) {
                setSubscription(sub);
                setStep(2); // Auto-jump to dashboard if subscribed
            }
        };
        load();
    }, []);

    const handleSubscribe = async () => {
        setIsProcessing(true);
        // Simulate network call
        setTimeout(async () => {
            const newSub = await subscriptionService.subscribe('user-1', selectedPlanId, selectedMeds);
            setSubscription(newSub);
            setIsProcessing(false);
            setStep(2); // Go to Dashboard
            toast({ title: 'Abonnement activé 🎉', description: 'Votre traitement arrivera automatiquement chaque mois.' });
        }, 1500);
    };

    // ──────────────────── VIEW: DASHBOARD ──────────────────── //
    if (step === 2 && subscription) {
        const plan = plans.find(p => p.id === subscription.planId);
        return (
            <div className="container mx-auto px-4 py-8 space-y-8 animate-in fade-in duration-500 max-w-4xl">
                <div className="flex justify-between items-end">
                    <div>
                        <h2 className="text-3xl font-black text-slate-900 tracking-tight">Espace PharmaGo+</h2>
                        <p className="text-slate-500">Gérez vos expéditions mensuelles automatiques</p>
                    </div>
                    <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 text-sm px-4 py-1">
                        Abonnement {plan?.tier} Actif
                    </Badge>
                </div>

                <div className="grid md:grid-cols-3 gap-6">
                    {/* Next Refill Card */}
                    <Card className="md:col-span-2 shadow-lg border-primary/10 bg-gradient-to-br from-white to-blue-50/50">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-lg flex items-center gap-2">
                                <CalendarCheck className="h-5 w-5 text-blue-600" /> Prochain Renouvellement
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center justify-between mb-4">
                                <span className="text-4xl font-black text-slate-800">{subscription.nextRefillDate}</span>
                                <div className="text-right">
                                    <p className="text-sm font-bold text-slate-600">Préparation en cours</p>
                                    <p className="text-xs text-muted-foreground">Pharmacie Centrale HKB</p>
                                </div>
                            </div>
                            <Progress value={65} className="h-2 bg-blue-100 [&>div]:bg-blue-600" />
                            <div className="flex justify-between text-xs font-bold text-muted-foreground mt-2">
                                <span>Prescription vérifiée</span>
                                <span>Livraison (7j)</span>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Savings Card */}
                    <Card className="shadow-lg border-emerald-100 bg-emerald-50/30">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-lg flex items-center gap-2 text-emerald-800">
                                <TrendingDown className="h-5 w-5" /> Économies
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            <p className="text-3xl font-black text-emerald-600">{subscription.savings} FCFA</p>
                            <p className="text-xs font-medium text-emerald-700/80">sur les frais de livraison ce mois-ci par rapport aux achats à l'acte.</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Medications List */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-lg">
                            <Pill className="h-5 w-5 text-primary" /> Traitements Programmés
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {subscription.medications.map(med => (
                            <div key={med} className="flex justify-between items-center p-4 border border-slate-100 rounded-xl bg-slate-50">
                                <span className="font-bold text-slate-800">{med}</span>
                                <Badge className="bg-green-100 text-green-700 hover:bg-green-200 border-none shrink-0">Prévu pour le colis</Badge>
                            </div>
                        ))}
                    </CardContent>
                </Card>
            </div>
        );
    }

    // ──────────────────── VIEW: ONBOARDING STEP ──────────────────── //
    if (step === 1) {
        return (
            <div className="container mx-auto px-4 py-8 max-w-2xl animate-in slide-in-from-right duration-500">
                <Card className="shadow-2xl border-primary/20 bg-white">
                    <CardHeader className="text-center pb-8 border-b border-slate-100">
                        <Badge variant="secondary" className="mb-4 mx-auto w-fit bg-blue-50 text-blue-700 uppercase tracking-widest text-[10px]">Étape 2/2</Badge>
                        <CardTitle className="text-3xl font-black tracking-tight mb-2">Choisir vos traitements automatiques</CardTitle>
                        <p className="text-slate-500">Quels médicaments devons-nous vous livrer chaque mois de manière garantie ?</p>
                    </CardHeader>
                    <CardContent className="pt-8 space-y-6">
                        <div className="p-4 rounded-xl border-2 border-primary/40 bg-primary/5 flex items-center justify-between cursor-pointer">
                            <div>
                                <h3 className="font-bold text-slate-900 border-b border-slate-200 pb-1 mb-2">Vos traitements connus :</h3>
                                <p className="font-black text-xl text-primary flex items-center gap-2">
                                    <Check className="h-5 w-5" /> Amlodipine 10mg
                                </p>
                            </div>
                        </div>
                        <Button variant="outline" className="w-full border-dashed border-2 py-8 text-slate-500 bg-slate-50 hover:bg-slate-100">
                            + Ajouter un autre traitement
                        </Button>
                    </CardContent>
                    <CardFooter className="bg-slate-50 rounded-b-xl border-t border-slate-100 p-6 flex justify-between">
                        <Button variant="ghost" onClick={() => setStep(0)}>Retour</Button>
                        <Button
                            className="bg-primary hover:bg-primary/90 rounded-full px-8 shadow-xl"
                            disabled={isProcessing}
                            onClick={handleSubscribe}
                        >
                            {isProcessing ? 'Activation en cours...' : 'Activer mon plan'}
                        </Button>
                    </CardFooter>
                </Card>
            </div>
        );
    }

    // ──────────────────── VIEW: PRICING PLANS ──────────────────── //
    return (
        <div className="container mx-auto px-4 py-16 animate-in slide-in-from-bottom duration-700">
            <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
                <Badge className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white uppercase font-black tracking-widest hover:scale-105 transition-transform duration-300">Nouveau</Badge>
                <h1 className="text-4xl md:text-5xl font-black tracking-tighter text-slate-900">
                    Gérez vos maladies chroniques sans stress avec <span className="text-primary">PharmaGo+</span>
                </h1>
                <p className="text-lg text-slate-600 font-medium leading-relaxed">
                    Fini les oublis, fini les ruptures de stock. Nous garantissons la disponibilité de vos médicaments et vous les livrons automatiquement chaque mois.
                </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                {plans.map((plan, i) => (
                    <Card key={plan.id} className={`relative shadow-xl hover:-translate-y-2 transition-transform duration-300 overflow-hidden ${plan.tier === 'Confort' ? 'border-primary ring-2 ring-primary/20 z-10 scale-105 md:scale-110' : 'border-slate-100'}`}>
                        {plan.tier === 'Confort' && (
                            <div className="absolute top-0 left-0 right-0 bg-primary text-white text-[10px] font-black uppercase text-center py-1.5 tracking-widest">
                                Le plus choisi
                            </div>
                        )}
                        <CardHeader className={`text-center ${plan.tier === 'Confort' ? 'pt-8' : 'pt-6'}`}>
                            <CardTitle className="text-xl font-bold text-slate-800 mb-2">{plan.tier}</CardTitle>
                            <div className="flex items-baseline justify-center gap-1">
                                <span className="text-4xl font-black">{plan.price.toLocaleString()}</span>
                                <span className="text-sm font-bold text-slate-500">FCFA / mois</span>
                            </div>
                        </CardHeader>
                        <CardContent className="pt-6">
                            <ul className="space-y-4">
                                {plan.benefits.map((benefit, idx) => (
                                    <li key={idx} className="flex items-start gap-3">
                                        <div className={`mt-0.5 rounded-full p-0.5 ${plan.tier !== 'Essentiel' ? 'bg-primary/20 text-primary' : 'bg-slate-100 text-slate-500'}`}>
                                            <Check className="h-3 w-3" />
                                        </div>
                                        <span className="text-sm font-medium text-slate-700 leading-snug">{benefit}</span>
                                    </li>
                                ))}
                            </ul>
                        </CardContent>
                        <CardFooter className="pt-6 pb-8">
                            <Button
                                className={`w-full rounded-full font-bold h-12 shadow-lg transition-all ${plan.tier === 'Confort' ? 'bg-primary hover:bg-primary/90 text-white shadow-primary/30' : 'bg-slate-100 text-slate-900 hover:bg-slate-200 hover:shadow-slate-300/30'}`}
                                onClick={() => { setSelectedPlanId(plan.id); setStep(1); }}
                            >
                                Choisir {plan.tier} <ArrowRight className="ml-2 h-4 w-4" />
                            </Button>
                        </CardFooter>
                    </Card>
                ))}
            </div>
        </div>
    );
};

export default SubscriptionPlans;
