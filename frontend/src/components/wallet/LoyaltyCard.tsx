import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Trophy, Star, Gift, Zap, ChevronRight, Lock } from 'lucide-react';

interface LoyaltyCardProps {
    points?: number;
    totalSpent?: number; // FCFA dépensés à vie
}

const LEVELS = [
    { name: 'Bronze', min: 0, max: 500, color: '#CD7F32', gradient: 'from-amber-700 to-amber-500', perks: ['5% de réduction', 'Livraison prioritaire'] },
    { name: 'Argent', min: 500, max: 1500, color: '#C0C0C0', gradient: 'from-slate-400 to-slate-300', perks: ['10% de réduction', 'Livraison offerte (1x/mois)', 'Support prioritaire'] },
    { name: 'Or', min: 1500, max: 4000, color: '#FFD700', gradient: 'from-yellow-500 to-amber-400', perks: ['15% de réduction', 'Livraison offerte illimitée', 'Accès médecins premium'] },
    { name: 'Platine', min: 4000, max: Infinity, color: '#E5E4E2', gradient: 'from-slate-300 via-white to-slate-300', perks: ['20% de réduction', 'Livraison express offerte', 'Consultation vidéo offerte', 'Hotline dédiée 24/7'] },
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
            <div className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${currentLevel.gradient} p-5 text-white shadow-lg`}>
                {/* decorative circles */}
                <div className="absolute -top-6 -right-6 w-28 h-28 rounded-full bg-white/10" />
                <div className="absolute -bottom-8 -left-4 w-24 h-24 rounded-full bg-white/5" />

                <div className="relative">
                    <div className="flex items-start justify-between mb-4">
                        <div>
                            <p className="text-xs font-medium text-white/70 uppercase tracking-widest">Niveau fidélité</p>
                            <h2 className="text-3xl font-black mt-0.5 drop-shadow">{currentLevel.name}</h2>
                        </div>
                        <div className="p-2.5 bg-white/20 rounded-xl backdrop-blur-sm">
                            <Trophy className="h-7 w-7" />
                        </div>
                    </div>

                    {/* Points */}
                    <div className="bg-white/20 backdrop-blur-sm rounded-xl px-4 py-3 mb-4">
                        <div className="flex items-end gap-1.5">
                            <span className="text-4xl font-black leading-none">{points.toLocaleString()}</span>
                            <span className="text-sm text-white/80 mb-1">points</span>
                        </div>
                        <p className="text-xs text-white/60 mt-0.5">
                            {totalSpent.toLocaleString()} FCFA dépensés · 1 point = 10 FCFA
                        </p>
                    </div>

                    {/* Progress to next level */}
                    {nextLevel && (
                        <div>
                            <div className="flex justify-between text-xs text-white/70 mb-1.5">
                                <span>{currentLevel.name}</span>
                                <span>
                                    {(nextLevel.min - points).toLocaleString()} pts pour {nextLevel.name}
                                </span>
                            </div>
                            <div className="w-full h-2.5 bg-white/20 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-white rounded-full transition-all duration-700"
                                    style={{ width: `${progressToNext}%` }}
                                />
                            </div>
                        </div>
                    )}
                    {!nextLevel && (
                        <Badge className="bg-white/30 text-white border-white/40 text-xs">
                            🏆 Niveau maximum atteint
                        </Badge>
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
