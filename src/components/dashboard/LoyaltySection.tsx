import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Trophy, Gift, Star, Zap, Clock, ChevronRight, Lock, User, Flame, Medal } from "lucide-react";
import { toast } from "sonner";

export const LoyaltySection = () => {
    const [points, setPoints] = useState(1250);
    const [tier] = useState("Gold");

    const rewards = [
        {
            id: 1,
            name: "Bon de réduction 2000 FCFA",
            cost: 500,
            description: "Valable sur la parapharmacie",
            icon: <Gift className="h-5 w-5 text-pink-500" />,
            color: "bg-pink-100 text-pink-700"
        },
        {
            id: 2,
            name: "Livraison Gratuite",
            cost: 300,
            description: "Sur votre prochaine commande",
            icon: <Zap className="h-5 w-5 text-yellow-500" />,
            color: "bg-yellow-100 text-yellow-700"
        },
        {
            id: 3,
            name: "Consultation -50%",
            cost: 1000,
            description: "Avec un généraliste partenaire",
            icon: <Star className="h-5 w-5 text-purple-500" />,
            color: "bg-purple-100 text-purple-700"
        },
        {
            id: 4,
            name: "Produit Offert (Mystery Box)",
            cost: 2000,
            description: "Découvrez votre cadeau",
            icon: <Lock className="h-5 w-5 text-gray-400" />,
            color: "bg-gray-100 text-gray-500",
            locked: true
        }
    ];

    const badges = [
        { id: 1, name: "Pionnier", icon: <Medal className="h-4 w-4" />, color: "bg-blue-100 text-blue-600" },
        { id: 2, name: "Santé de Fer", icon: <Star className="h-4 w-4" />, color: "bg-red-100 text-red-600" },
        { id: 3, name: "Eco-Responsable", icon: <Zap className="h-4 w-4" />, color: "bg-green-100 text-green-600" },
    ];

    const handleRedeem = (reward: any) => {
        if (points >= reward.cost) {
            setPoints(prev => prev - reward.cost);
            toast.success(`Récompense "${reward.name}" débloquée !`, {
                description: "Retrouvez votre code dans votre portefeuille."
            });
        } else {
            toast.error("Points insuffisants");
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Header Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="md:col-span-2 glass-card border-amber-500/20 bg-gradient-to-br from-amber-50 to-orange-50 overflow-hidden relative">
                    <div className="absolute right-0 top-0 w-64 h-64 bg-amber-200/20 rounded-full blur-3xl -mr-16 -mt-16" />
                    <CardContent className="p-8 flex justify-between items-center relative z-10">
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <Badge className="bg-amber-500 hover:bg-amber-600 text-white border-none uppercase tracking-widest px-3 py-1">Membre {tier}</Badge>
                                <span className="text-xs font-bold text-amber-700">Top 5%</span>
                            </div>
                            <h2 className="text-5xl font-black text-amber-900 tracking-tighter mb-1">{points} <span className="text-xl">PTS</span></h2>
                            <p className="text-amber-800/80 font-medium">Solde de points disponible</p>
                        </div>
                        <div className="hidden md:block">
                            <Trophy className="h-32 w-32 text-amber-500/20 absolute right-8 top-1/2 -translate-y-1/2" />
                            <Trophy className="h-24 w-24 text-amber-500 animate-pulse relative z-10 drop-shadow-xl" />
                        </div>
                    </CardContent>
                    <CardFooter className="bg-amber-500/10 border-t border-amber-500/10 p-4 flex justify-between items-center">
                        <div className="w-2/3 space-y-2">
                            <div className="flex justify-between text-xs font-bold uppercase tracking-wide text-amber-900/60">
                                <span>Prochain palier: Platinum</span>
                                <span>1250 / 2000 PTS</span>
                            </div>
                            <Progress value={62.5} className="h-2 bg-amber-200" />
                        </div>
                        <div className="ml-4 flex items-center gap-2 bg-white/50 px-3 py-1 rounded-full border border-amber-200">
                            <Flame className="h-4 w-4 text-orange-500 fill-orange-500" />
                            <span className="text-xs font-bold text-orange-700">Série: 5 Jours</span>
                        </div>
                    </CardFooter>
                </Card>

                <Card className="glass-card flex flex-col justify-center items-center text-center p-6 space-y-4">
                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                        <Clock className="h-8 w-8 text-blue-600" />
                    </div>
                    <div>
                        <h3 className="font-bold text-lg">Dernière activité</h3>
                        <p className="text-sm text-gray-500">+50 PTS - Achat Doliprane</p>
                        <p className="text-xs text-gray-400 mt-1">Il y a 2 jours</p>
                    </div>
                    <Button variant="outline" className="w-full rounded-xl">Voir l'historique</Button>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Rewards Catalog */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="flex items-center justify-between">
                        <h3 className="text-2xl font-bold tracking-tight">Catalogue Récompenses</h3>
                        <Button variant="ghost" className="text-primary hover:text-primary/80">Tout voir <ChevronRight className="h-4 w-4 ml-1" /></Button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {rewards.map((reward) => (
                            <div key={reward.id} className="group relative bg-white/50 backdrop-blur-sm border border-white/40 rounded-2xl p-6 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                                <div className={`w-12 h-12 ${reward.color} rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                                    {reward.icon}
                                </div>
                                <h4 className="font-bold text-lg mb-1">{reward.name}</h4>
                                <p className="text-sm text-muted-foreground mb-4 min-h-[40px]">{reward.description}</p>

                                <div className="flex items-center justify-between mt-auto">
                                    <span className="font-black text-primary text-lg">{reward.cost} PTS</span>
                                    <Button
                                        onClick={() => handleRedeem(reward)}
                                        disabled={points < reward.cost || reward.locked}
                                        className={`rounded-xl ${points < reward.cost ? 'opacity-50' : ''}`}
                                    >
                                        {reward.locked ? <Lock className="h-4 w-4" /> : 'Échanger'}
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Missions / Ways to earn */}
                <div className="space-y-6">
                    <h3 className="text-xl font-bold tracking-tight">Gagner des points</h3>
                    <div className="space-y-3">
                        <div className="bg-white/60 p-4 rounded-xl border border-white/40 flex items-center gap-4">
                            <div className="p-2 bg-green-100 rounded-lg text-green-600"><Zap className="h-5 w-5" /></div>
                            <div className="flex-1">
                                <h5 className="font-bold text-sm">Commander sur l'app</h5>
                                <p className="text-xs text-muted-foreground">100 F = 1 Point</p>
                            </div>
                        </div>
                        <div className="bg-white/60 p-4 rounded-xl border border-white/40 flex items-center gap-4">
                            <div className="p-2 bg-blue-100 rounded-lg text-blue-600"><Star className="h-5 w-5" /></div>
                            <div className="flex-1">
                                <h5 className="font-bold text-sm">Noter une pharmacie</h5>
                                <p className="text-xs text-muted-foreground">+ 10 Points</p>
                            </div>
                            <Button size="sm" variant="secondary" className="h-8 rounded-lg">Go</Button>
                        </div>
                        <div className="bg-white/60 p-4 rounded-xl border border-white/40 flex items-center gap-4">
                            <div className="p-2 bg-purple-100 rounded-lg text-purple-600"><User className="h-5 w-5" /></div>
                            <div className="flex-1">
                                <h5 className="font-bold text-sm">Parraîner un ami</h5>
                                <p className="text-xs text-muted-foreground">+ 500 Points</p>
                            </div>
                            <Button size="sm" variant="secondary" className="h-8 rounded-lg">Go</Button>
                        </div>
                    </div>
                </div>
            </div>
        </div >
    );
};
