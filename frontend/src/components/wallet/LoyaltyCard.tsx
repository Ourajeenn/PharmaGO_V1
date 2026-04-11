import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Trophy, Star, Gift, Zap, ChevronRight, Lock } from 'lucide-react';

interface LoyaltyCardProps {
    points?: number;
    totalSpent?: number; // FCFA dépensés à vie
}

const LEVELS = [
    { name: 'Bronze', min: 0, max: 500, color: '#CD7F32', gradient: 'from-[#8B4513] via-[#CD7F32] to-[#A0522D]', perks: ['5% de réduction', 'Livraison prioritaire'] },
    { name: 'Argent', min: 500, max: 1500, color: '#C0C0C0', gradient: 'from-[#708090] via-[#C0C0C0] to-[#E6E6FA配套]', perks: ['10% de réduction', 'Livraison offerte (1x/mois)', 'Support prioritaire'] },
    { name: 'Or', min: 1500, max: 4000, color: '#FFD700', gradient: 'from-[#B8860B] via-[#FFD700] to-[#FFFACD]', perks: ['15% de réduction', 'Livraison offerte illimitée', 'Accès médecins premium'] },
    { name: 'Platine', min: 4000, max: Infinity, color: '#E5E4E2', gradient: 'from-[#2F4F4F] via-[#E5E4E2] to-[#F5F5F5]', perks: ['20% de réduction', 'Livraison express offerte', 'Consultation vidéo offerte', 'Hotline dédiée 24/7'] },
];

const REWARDS = [
    { id: 1, label: 'Livraison gratuite', cost: 200, icon: '🚚', available: true },
    { id: 2, label: '5% sur commande', cost: 350, icon: '💊', available: true },
    { id: 3, label: '10% sur commande', cost: 600, icon: '✨', available: false },
    { id: 4, label: 'Consultation vidéo', cost: 1000, icon: '📹', available: false },
];

function getLevel(points: number) {
    return [...LEVELS].reverse().find((l) => points >= l.min) ?? LEVELS[0];
}

function getNextLevel(points: number) {
    return LEVELS.find((l) => l.min > points) ?? null;
}

export function LoyaltyCard({ points = 420, totalSpent = 84000 }: LoyaltyCardProps) {
    const currentLevel = getLevel(points);
    const nextLevel = getNextLevel(points);
    const progressToNext = nextLevel
        ? ((points - currentLevel.min) / (nextLevel.min - currentLevel.min)) * 100
        : 100;

    return (
        <div className="space-y-4">
            {/* Level Card */}
            <div className={`relative overflow-hidden rounded-3xl bg-gradient-to-br ${currentLevel.gradient} p-7 text-white shadow-2xl transition-all duration-500 hover:scale-[1.02] active:scale-[0.98] group`}>
                {/* mesh gradient overlays */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 transition-transform duration-1000 group-hover:scale-110" />
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-black/10 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2" />

                <div className="relative z-10">
                    <div className="flex items-start justify-between mb-6">
                        <div className="space-y-1">
                            <p className="text-[10px] font-black text-white/60 uppercase tracking-[0.2em]">Status Privilège</p>
                            <h2 className="text-4xl font-black tracking-tight drop-shadow-lg">{currentLevel.name}</h2>
                        </div>
                        <div className="p-3 bg-white/10 border border-white/20 rounded-2xl backdrop-blur-md shadow-inner transition-transform duration-500 group-hover:rotate-12">
                            <Trophy className="h-8 w-8 text-white drop-shadow" />
                        </div>
                    </div>

                    {/* Points Section */}
                    <div className="bg-white/10 border border-white/10 backdrop-blur-xl rounded-2xl p-5 mb-6 shadow-xl overflow-hidden group/points relative">
                        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover/points:translate-x-full transition-transform duration-1000" />
                        <div className="flex items-end gap-2">
                            <span className="text-5xl font-black leading-none drop-shadow-md tracking-tighter">{points.toLocaleString()}</span>
                            <span className="text-sm font-bold text-white/70 mb-1 uppercase tracking-widest">Points</span>
                        </div>
                        <div className="flex items-center gap-2 mt-2">
                            <Badge variant="outline" className="text-[10px] bg-white/5 border-white/20 text-white/80 font-bold backdrop-blur">
                                {totalSpent.toLocaleString()} FCFA CUMULÉS
                            </Badge>
                            <span className="text-[10px] text-white/40 font-medium">1pt = 10 FCFA</span>
                        </div>
                    </div>

                    {/* Progress with custom styling */}
                    {nextLevel && (
                        <div className="space-y-3">
                            <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-white/70">
                                <span className="flex items-center gap-1.5">
                                    <Zap className="h-3 w-3 fill-white/20" />
                                    Objectif {nextLevel.name}
                                </span>
                                <span className="text-white">
                                    Plus que {(nextLevel.min - points).toLocaleString()} pts
                                </span>
                            </div>
                            <div className="relative w-full h-3 bg-black/20 rounded-full overflow-hidden p-0.5 border border-white/5 shadow-inner">
                                <div
                                    className="h-full bg-gradient-to-r from-white/40 via-white to-white/60 rounded-full transition-all duration-1000 ease-out shadow-[0_0_15px_rgba(255,255,255,0.5)]"
                                    style={{ width: `${progressToNext}%` }}
                                />
                            </div>
                        </div>
                    )}
                    {!nextLevel && (
                        <div className="flex items-center gap-2 bg-white/20 backdrop-blur-md border border-white/30 rounded-full px-4 py-2 w-fit">
                            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400 animate-pulse" />
                            <span className="text-xs font-black uppercase tracking-widest italic">Légende PharmaGo</span>
                        </div>
                    )}
                </div>
            </div>

            {/* Current perks */}
            <div>
                <h4 className="text-sm font-semibold mb-2 flex items-center gap-1.5">
                    <Zap className="h-4 w-4 text-yellow-500" />
                    Vos avantages {currentLevel.name}
                </h4>
                <div className="space-y-1.5">
                    {currentLevel.perks.map((perk) => (
                        <div key={perk} className="flex items-center gap-2 text-sm">
                            <Star className="h-3.5 w-3.5 text-yellow-500 flex-shrink-0 fill-yellow-400" />
                            <span>{perk}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Rewards store */}
            <div>
                <h4 className="text-sm font-semibold mb-2 flex items-center gap-1.5">
                    <Gift className="h-4 w-4 text-primary" />
                    Récompenses disponibles
                </h4>
                <div className="grid grid-cols-2 gap-2">
                    {REWARDS.map((reward) => {
                        const canAfford = points >= reward.cost;
                        return (
                            <button
                                key={reward.id}
                                disabled={!canAfford}
                                className={`relative flex flex-col items-center gap-1.5 p-3 rounded-xl border text-center transition-all
                  ${canAfford
                                        ? 'bg-white border-primary/30 hover:bg-primary/5 hover:border-primary cursor-pointer shadow-sm hover:shadow-md'
                                        : 'bg-muted/50 border-muted cursor-not-allowed opacity-60'
                                    }`}
                            >
                                {!canAfford && (
                                    <Lock className="absolute top-2 right-2 h-3 w-3 text-muted-foreground" />
                                )}
                                <span className="text-2xl">{reward.icon}</span>
                                <span className="text-xs font-medium leading-tight">{reward.label}</span>
                                <span className={`text-xs font-bold ${canAfford ? 'text-primary' : 'text-muted-foreground'}`}>
                                    {reward.cost.toLocaleString()} pts
                                </span>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* All levels preview */}
            <div>
                <h4 className="text-sm font-semibold mb-2">Progression des niveaux</h4>
                <div className="space-y-2">
                    {LEVELS.map((level) => {
                        const unlocked = points >= level.min;
                        const isCurrent = getLevel(points).name === level.name;
                        return (
                            <div
                                key={level.name}
                                className={`flex items-center gap-3 p-2.5 rounded-xl border transition-all
                  ${isCurrent ? 'border-primary/40 bg-primary/5' : unlocked ? 'border-green-200 bg-green-50/50' : 'border-muted bg-muted/30'}`}
                            >
                                <div
                                    className="h-7 w-7 rounded-full flex-shrink-0 shadow-sm"
                                    style={{ background: level.color }}
                                />
                                <div className="flex-1 min-w-0">
                                    <p className="text-xs font-semibold">{level.name}</p>
                                    <p className="text-[10px] text-muted-foreground">
                                        {level.max === Infinity
                                            ? `≥ ${level.min.toLocaleString()} pts`
                                            : `${level.min.toLocaleString()} – ${level.max.toLocaleString()} pts`}
                                    </p>
                                </div>
                                {isCurrent && (
                                    <Badge className="text-[10px] bg-primary text-white">Votre niveau</Badge>
                                )}
                                {unlocked && !isCurrent && (
                                    <Badge variant="outline" className="text-[10px] text-green-600 border-green-300">✓ Atteint</Badge>
                                )}
                                {!unlocked && (
                                    <Lock className="h-3.5 w-3.5 text-muted-foreground" />
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}

export default LoyaltyCard;
