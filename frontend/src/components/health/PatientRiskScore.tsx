import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
    Activity,
    Heart,
    AlertTriangle,
    TrendingUp,
    TrendingDown,
    Minus,
    Brain,
    Shield,
    ChevronRight,
    Calendar,
    Stethoscope,
    Pill,
    User,
    Sparkles
} from 'lucide-react';

interface RiskFactor {
    name: string;
    value: number;
    status: 'low' | 'medium' | 'high';
    trend: 'up' | 'down' | 'stable';
}

interface Recommendation {
    id: string;
    type: 'consultation' | 'test' | 'lifestyle' | 'medication';
    title: string;
    description: string;
    priority: 'low' | 'medium' | 'high';
    dueDate?: string;
}

interface PatientRiskScoreProps {
    patientId?: string;
}

export function PatientRiskScore({ patientId }: PatientRiskScoreProps) {
    const [overallScore, setOverallScore] = useState(42);
    const [riskLevel, setRiskLevel] = useState<'low' | 'medium' | 'high'>('medium');

    const [riskFactors, setRiskFactors] = useState<RiskFactor[]>([
        { name: 'Tension artérielle', value: 15, status: 'medium', trend: 'down' },
        { name: 'Glycémie', value: 8, status: 'low', trend: 'stable' },
        { name: 'Cholestérol', value: 12, status: 'medium', trend: 'up' },
        { name: 'IMC (Poids)', value: 5, status: 'low', trend: 'down' },
        { name: 'Adhésion traitement', value: 2, status: 'low', trend: 'stable' }
    ]);

    const [recommendations, setRecommendations] = useState<Recommendation[]>([
        {
            id: '1',
            type: 'consultation',
            title: 'Consulter un cardiologue',
            description: 'Votre tension récente suggère une visite de suivi',
            priority: 'medium',
            dueDate: '15 Fév 2026'
        },
        {
            id: '2',
            type: 'test',
            title: 'Bilan lipidique',
            description: 'Analyse sanguine recommandée dans 30 jours',
            priority: 'low',
            dueDate: '1 Mars 2026'
        },
        {
            id: '3',
            type: 'lifestyle',
            title: 'Augmenter l\'activité physique',
            description: '30 min de marche quotidienne recommandée',
            priority: 'low'
        }
    ]);

    const getRiskLevelStyles = (level: string) => {
        switch (level) {
            case 'low':
                return {
                    bg: 'bg-green-500',
                    text: 'text-green-600',
                    light: 'bg-green-100',
                    border: 'border-green-200',
                    label: 'Faible'
                };
            case 'medium':
                return {
                    bg: 'bg-amber-500',
                    text: 'text-amber-600',
                    light: 'bg-amber-100',
                    border: 'border-amber-200',
                    label: 'Modéré'
                };
            case 'high':
                return {
                    bg: 'bg-red-500',
                    text: 'text-red-600',
                    light: 'bg-red-100',
                    border: 'border-red-200',
                    label: 'Élevé'
                };
            default:
                return {
                    bg: 'bg-slate-500',
                    text: 'text-slate-600',
                    light: 'bg-slate-100',
                    border: 'border-slate-200',
                    label: 'N/A'
                };
        }
    };

    const getTrendIcon = (trend: string) => {
        switch (trend) {
            case 'up':
                return <TrendingUp className="h-3 w-3 text-red-500" />;
            case 'down':
                return <TrendingDown className="h-3 w-3 text-green-500" />;
            default:
                return <Minus className="h-3 w-3 text-slate-400" />;
        }
    };

    const getRecommendationIcon = (type: string) => {
        switch (type) {
            case 'consultation':
                return <Stethoscope className="h-4 w-4" />;
            case 'test':
                return <Activity className="h-4 w-4" />;
            case 'lifestyle':
                return <Heart className="h-4 w-4" />;
            case 'medication':
                return <Pill className="h-4 w-4" />;
            default:
                return <Activity className="h-4 w-4" />;
        }
    };

    const levelStyles = getRiskLevelStyles(riskLevel);

    return (
        <Card className="bg-gradient-to-br from-indigo-50/50 to-purple-50/50 border-indigo-200/50">
            <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="p-2 bg-indigo-100 rounded-xl">
                            <Brain className="h-5 w-5 text-indigo-600" />
                        </div>
                        <div>
                            <CardTitle className="text-lg flex items-center gap-2">
                                Score de Risque IA
                                <Badge variant="outline" className="bg-indigo-100 text-indigo-600 border-indigo-200 text-[10px]">
                                    <Sparkles className="h-3 w-3 mr-1" />
                                    IA
                                </Badge>
                            </CardTitle>
                            <p className="text-xs text-muted-foreground">Analyse prédictive de votre santé</p>
                        </div>
                    </div>
                </div>
            </CardHeader>

            <CardContent className="space-y-4">
                {/* Overall Score Gauge */}
                <div className="bg-white rounded-xl p-6 border border-slate-200 text-center relative overflow-hidden">
                    {/* Background decoration */}
                    <div className="absolute inset-0 opacity-5">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500 rounded-full -translate-y-1/2 translate-x-1/2" />
                    </div>

                    <div className="relative">
                        {/* Score Circle */}
                        <div className="relative w-32 h-32 mx-auto mb-4">
                            <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                                {/* Background circle */}
                                <circle
                                    cx="50"
                                    cy="50"
                                    r="45"
                                    fill="none"
                                    stroke="#e2e8f0"
                                    strokeWidth="10"
                                />
                                {/* Progress circle */}
                                <circle
                                    cx="50"
                                    cy="50"
                                    r="45"
                                    fill="none"
                                    stroke={
                                        overallScore <= 20 ? '#22c55e' :
                                            overallScore <= 50 ? '#f59e0b' :
                                                overallScore <= 80 ? '#f97316' : '#ef4444'
                                    }
                                    strokeWidth="10"
                                    strokeLinecap="round"
                                    strokeDasharray={`${overallScore * 2.83} 283`}
                                />
                            </svg>
                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                <span className="text-3xl font-black text-slate-900">{overallScore}</span>
                                <span className="text-xs text-muted-foreground">/100</span>
                            </div>
                        </div>

                        <Badge className={`${levelStyles.bg} text-white text-sm px-4 py-1`}>
                            Risque {levelStyles.label}
                        </Badge>

                        <p className="text-sm text-muted-foreground mt-3">
                            Basé sur {riskFactors.length} facteurs de risque analysés
                        </p>
                    </div>
                </div>

                {/* Risk Factors Breakdown */}
                <div>
                    <h4 className="text-sm font-semibold mb-3">Facteurs de risque</h4>
                    <div className="space-y-3">
                        {riskFactors.map((factor, i) => {
                            const factorStyles = getRiskLevelStyles(factor.status);
                            return (
                                <div key={i} className="bg-white p-3 rounded-lg border border-slate-200">
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm font-medium">{factor.name}</span>
                                            {getTrendIcon(factor.trend)}
                                        </div>
                                        <Badge
                                            variant="outline"
                                            className={`${factorStyles.light} ${factorStyles.text} ${factorStyles.border} text-[10px]`}
                                        >
                                            +{factor.value} pts
                                        </Badge>
                                    </div>
                                    <Progress
                                        value={factor.value * 3}
                                        className="h-2"
                                    />
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* AI Recommendations */}
                <div>
                    <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                        <Sparkles className="h-4 w-4 text-indigo-500" />
                        Recommandations personnalisées
                    </h4>
                    <div className="space-y-2">
                        {recommendations.map(rec => {
                            const priorityStyles = getRiskLevelStyles(rec.priority === 'high' ? 'high' : rec.priority === 'medium' ? 'medium' : 'low');
                            return (
                                <div
                                    key={rec.id}
                                    className="bg-white p-3 rounded-lg border border-slate-200 hover:shadow-md transition-shadow cursor-pointer group"
                                >
                                    <div className="flex items-start gap-3">
                                        <div className={`p-2 rounded-lg ${priorityStyles.light}`}>
                                            {getRecommendationIcon(rec.type)}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h5 className="text-sm font-semibold text-slate-900">{rec.title}</h5>
                                            <p className="text-xs text-muted-foreground">{rec.description}</p>
                                            {rec.dueDate && (
                                                <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                                                    <Calendar className="h-3 w-3" />
                                                    {rec.dueDate}
                                                </div>
                                            )}
                                        </div>
                                        <ChevronRight className="h-5 w-5 text-slate-400 group-hover:text-primary transition-colors" />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Disclaimer */}
                <div className="bg-slate-100 rounded-lg p-3 text-center">
                    <p className="text-[10px] text-muted-foreground">
                        <Shield className="h-3 w-3 inline mr-1" />
                        Score généré par IA. Ne remplace pas l'avis d'un professionnel de santé.
                    </p>
                </div>
            </CardContent>
        </Card>
    );
}
