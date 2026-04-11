import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
    Pill,
    AlertTriangle,
    CheckCircle,
    Info,
    DollarSign,
    Package,
    Sparkles,
    ChevronRight,
    Search,
    Shield,
    Loader2,
    ThumbsUp,
    ThumbsDown
} from 'lucide-react';
import { toast } from 'sonner';

interface MedicationRecommendation {
    id: string;
    name: string;
    genericName: string;
    dosage: string;
    frequency: string;
    duration: string;
    price: number;
    insuranceCoverage: number;
    patientCost: number;
    efficacyScore: number;
    safetyScore: number;
    availabilityScore: number;
    overallScore: number;
    rank: 1 | 2 | 3;
    reason: string;
    warnings: string[];
    interactions: string[];
    alternatives: string[];
}

interface AIRecommenderProps {
    patientId?: string;
    diagnosis?: string;
}

export function AIMedicationRecommender({ patientId, diagnosis }: AIRecommenderProps) {
    const [searchDiagnosis, setSearchDiagnosis] = useState(diagnosis || '');
    const [isLoading, setIsLoading] = useState(false);
    const [recommendations, setRecommendations] = useState<MedicationRecommendation[]>([]);
    const [showResults, setShowResults] = useState(false);

    const sampleRecommendations: MedicationRecommendation[] = [
        {
            id: '1',
            name: 'Metformine 500mg',
            genericName: 'Metformine HCl',
            dosage: '500mg',
            frequency: '2x/jour',
            duration: '30 jours',
            price: 4500,
            insuranceCoverage: 80,
            patientCost: 900,
            efficacyScore: 92,
            safetyScore: 88,
            availabilityScore: 95,
            overallScore: 91,
            rank: 1,
            reason: 'Traitement de 1ère ligne pour diabète type 2, excellent rapport efficacité/coût',
            warnings: ['Prendre avec repas', 'Surveiller fonction rénale'],
            interactions: [],
            alternatives: ['Glimépiride', 'Sitagliptine']
        },
        {
            id: '2',
            name: 'Glimépiride 2mg',
            genericName: 'Glimépiride',
            dosage: '2mg',
            frequency: '1x/jour (matin)',
            duration: '30 jours',
            price: 6200,
            insuranceCoverage: 70,
            patientCost: 1860,
            efficacyScore: 85,
            safetyScore: 82,
            availabilityScore: 90,
            overallScore: 85,
            rank: 2,
            reason: 'Alternative si contre-indication Metformine',
            warnings: ['Risque hypoglycémie', 'Éviter alcool'],
            interactions: ['Anticoagulants'],
            alternatives: ['Gliclazide']
        },
        {
            id: '3',
            name: 'Sitagliptine 100mg',
            genericName: 'Sitagliptine phosphate',
            dosage: '100mg',
            frequency: '1x/jour',
            duration: '30 jours',
            price: 18500,
            insuranceCoverage: 60,
            patientCost: 7400,
            efficacyScore: 88,
            safetyScore: 90,
            availabilityScore: 75,
            overallScore: 84,
            rank: 3,
            reason: 'Nouvelle génération, moins d\'effets secondaires gastro',
            warnings: ['Surveiller pancréas'],
            interactions: [],
            alternatives: ['Linagliptine']
        }
    ];

    const searchMedications = () => {
        if (!searchDiagnosis) {
            toast.error('Veuillez saisir un diagnostic');
            return;
        }

        setIsLoading(true);

        setTimeout(() => {
            setRecommendations(sampleRecommendations);
            setShowResults(true);
            setIsLoading(false);
            toast.success('Recommandations IA générées');
        }, 2000);
    };

    const getRankBadge = (rank: 1 | 2 | 3) => {
        const styles = {
            1: 'bg-gradient-to-r from-amber-400 to-yellow-500 text-white',
            2: 'bg-gradient-to-r from-slate-300 to-slate-400 text-slate-800',
            3: 'bg-gradient-to-r from-amber-600 to-amber-700 text-white'
        };
        const labels = { 1: '1ère ligne', 2: 'Alternative', 3: 'Backup' };

        return (
            <Badge className={`${styles[rank]} text-xs font-bold`}>
                {labels[rank]}
            </Badge>
        );
    };

    const getScoreColor = (score: number) => {
        if (score >= 90) return 'text-green-600';
        if (score >= 75) return 'text-amber-600';
        return 'text-red-600';
    };

    return (
        <Card className="bg-gradient-to-br from-violet-50/50 to-fuchsia-50/50 border-violet-200/50">
            <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="p-2 bg-violet-100 rounded-xl">
                            <Sparkles className="h-5 w-5 text-violet-600" />
                        </div>
                        <div>
                            <CardTitle className="text-lg flex items-center gap-2">
                                Recommandeur IA
                                <Badge variant="outline" className="bg-violet-100 text-violet-600 border-violet-200 text-[10px]">
                                    ML Model v2.1
                                </Badge>
                            </CardTitle>
                            <p className="text-xs text-muted-foreground">Suggestions personnalisées basées sur le profil patient</p>
                        </div>
                    </div>
                </div>
            </CardHeader>

            <CardContent className="space-y-4">
                {/* Search Input */}
                <div className="flex gap-2">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Diagnostic ou symptôme (ex: Diabète type 2)"
                            value={searchDiagnosis}
                            onChange={(e) => setSearchDiagnosis(e.target.value)}
                            className="pl-10"
                            onKeyDown={(e) => e.key === 'Enter' && searchMedications()}
                        />
                    </div>
                    <Button
                        onClick={searchMedications}
                        disabled={isLoading}
                        className="bg-violet-600 hover:bg-violet-700"
                    >
                        {isLoading ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                            <>
                                <Sparkles className="h-4 w-4 mr-2" />
                                Analyser
                            </>
                        )}
                    </Button>
                </div>

                {/* Patient Context */}
                <div className="bg-white/60 rounded-lg p-3 border border-violet-100">
                    <p className="text-xs text-muted-foreground mb-2">Contexte patient pris en compte:</p>
                    <div className="flex flex-wrap gap-2">
                        <Badge variant="outline" className="text-xs">Âge: 45 ans</Badge>
                        <Badge variant="outline" className="text-xs">Allergies: Aucune</Badge>
                        <Badge variant="outline" className="text-xs">Médicaments: Amlodipine 5mg</Badge>
                        <Badge variant="outline" className="text-xs">CMU: Couvert 80%</Badge>
                    </div>
                </div>

                {/* Recommendations */}
                {showResults && (
                    <div className="space-y-3">
                        <h4 className="text-sm font-semibold flex items-center gap-2">
                            <Pill className="h-4 w-4 text-violet-600" />
                            Recommandations ({recommendations.length})
                        </h4>

                        {recommendations.map(med => (
                            <div
                                key={med.id}
                                className={`bg-white rounded-xl border p-4 hover:shadow-md transition-all ${med.rank === 1 ? 'border-amber-300 ring-1 ring-amber-200' : 'border-slate-200'
                                    }`}
                            >
                                <div className="flex items-start justify-between mb-3">
                                    <div className="flex items-center gap-3">
                                        <div className={`p-2 rounded-lg ${med.rank === 1 ? 'bg-amber-100' : 'bg-violet-100'
                                            }`}>
                                            <Pill className={`h-5 w-5 ${med.rank === 1 ? 'text-amber-600' : 'text-violet-600'
                                                }`} />
                                        </div>
                                        <div>
                                            <h5 className="font-semibold text-slate-900">{med.name}</h5>
                                            <p className="text-xs text-muted-foreground">{med.genericName}</p>
                                        </div>
                                    </div>
                                    {getRankBadge(med.rank)}
                                </div>

                                {/* Posology */}
                                <div className="grid grid-cols-3 gap-3 mb-3 text-sm">
                                    <div className="bg-slate-50 p-2 rounded-lg text-center">
                                        <p className="text-xs text-muted-foreground">Dosage</p>
                                        <p className="font-semibold">{med.dosage}</p>
                                    </div>
                                    <div className="bg-slate-50 p-2 rounded-lg text-center">
                                        <p className="text-xs text-muted-foreground">Fréquence</p>
                                        <p className="font-semibold">{med.frequency}</p>
                                    </div>
                                    <div className="bg-slate-50 p-2 rounded-lg text-center">
                                        <p className="text-xs text-muted-foreground">Durée</p>
                                        <p className="font-semibold">{med.duration}</p>
                                    </div>
                                </div>

                                {/* Scores */}
                                <div className="grid grid-cols-4 gap-2 mb-3">
                                    <div className="text-center">
                                        <p className={`text-lg font-bold ${getScoreColor(med.overallScore)}`}>{med.overallScore}</p>
                                        <p className="text-[10px] text-muted-foreground">Score global</p>
                                    </div>
                                    <div className="text-center">
                                        <p className={`text-lg font-bold ${getScoreColor(med.efficacyScore)}`}>{med.efficacyScore}</p>
                                        <p className="text-[10px] text-muted-foreground">Efficacité</p>
                                    </div>
                                    <div className="text-center">
                                        <p className={`text-lg font-bold ${getScoreColor(med.safetyScore)}`}>{med.safetyScore}</p>
                                        <p className="text-[10px] text-muted-foreground">Sécurité</p>
                                    </div>
                                    <div className="text-center">
                                        <p className={`text-lg font-bold ${getScoreColor(med.availabilityScore)}`}>{med.availabilityScore}</p>
                                        <p className="text-[10px] text-muted-foreground">Dispo</p>
                                    </div>
                                </div>

                                {/* Reason */}
                                <div className="bg-violet-50 rounded-lg p-3 mb-3">
                                    <div className="flex items-start gap-2">
                                        <Info className="h-4 w-4 text-violet-600 mt-0.5 flex-shrink-0" />
                                        <p className="text-xs text-violet-800">{med.reason}</p>
                                    </div>
                                </div>

                                {/* Warnings */}
                                {med.warnings.length > 0 && (
                                    <div className="flex flex-wrap gap-1 mb-3">
                                        {med.warnings.map((w, i) => (
                                            <Badge key={i} variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 text-[10px]">
                                                <AlertTriangle className="h-2 w-2 mr-1" />
                                                {w}
                                            </Badge>
                                        ))}
                                    </div>
                                )}

                                {/* Price & Action */}
                                <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                                    <div className="flex items-center gap-4">
                                        <div>
                                            <p className="text-xs text-muted-foreground">Prix</p>
                                            <p className="text-sm font-semibold">{med.price.toLocaleString()} F</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-muted-foreground">Couvert {med.insuranceCoverage}%</p>
                                            <p className="text-sm font-semibold text-green-600">{med.patientCost.toLocaleString()} F à payer</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Button variant="ghost" size="icon" className="h-8 w-8">
                                            <ThumbsUp className="h-4 w-4 text-green-600" />
                                        </Button>
                                        <Button variant="ghost" size="icon" className="h-8 w-8">
                                            <ThumbsDown className="h-4 w-4 text-red-600" />
                                        </Button>
                                        <Button size="sm" className="bg-violet-600 hover:bg-violet-700">
                                            <CheckCircle className="h-4 w-4 mr-1" />
                                            Prescrire
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Disclaimer */}
                <div className="bg-slate-100 rounded-lg p-3 text-center">
                    <p className="text-[10px] text-muted-foreground">
                        <Shield className="h-3 w-3 inline mr-1" />
                        Suggestions basées sur l'IA. Le médecin reste seul décideur.
                    </p>
                </div>
            </CardContent>
        </Card>
    );
}
