import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Sparkles, Star } from 'lucide-react';
import { Medicine } from '@/types/pharmacy';
import { PharmacyService } from '@/services/PharmacyService';

interface RecommendationEngineProps {
    userId: string;
    currentMedicine?: Medicine;
    onAddToCart?: (medicine: Medicine) => void;
}

export const RecommendationEngine = ({
    userId,
    currentMedicine,
    onAddToCart,
}: RecommendationEngineProps) => {
    const [recommendations, setRecommendations] = useState<Medicine[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchRecommendations();
    }, [userId, currentMedicine]);

    const fetchRecommendations = async () => {
        setLoading(true);
        try {
            const data = await PharmacyService.getRecommendations(userId);
            setRecommendations(data);
        } catch (error) {
            console.error('Failed to fetch recommendations:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Sparkles className="h-5 w-5" />
                        Recommandations pour vous
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center justify-center py-8">
                        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-primary" />
                    Recommandations pour vous
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {recommendations.map((medicine) => (
                        <div
                            key={medicine.id}
                            className="border rounded-lg p-4 hover:shadow-lg transition-shadow"
                        >
                            <div className="space-y-3">
                                <div className="flex items-start justify-between">
                                    <div>
                                        <h4 className="font-medium">{medicine.name}</h4>
                                        <p className="text-sm text-muted-foreground">
                                            {medicine.category}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-1 text-yellow-500">
                                        <Star className="h-4 w-4 fill-current" />
                                        <span className="text-xs font-medium">4.5</span>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between">
                                    <p className="text-lg font-bold text-primary">
                                        {medicine.price.toLocaleString()} FCFA
                                    </p>
                                    <Button
                                        size="sm"
                                        onClick={() => onAddToCart?.(medicine)}
                                    >
                                        Ajouter
                                    </Button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="mt-4 pt-4 border-t">
                    <p className="text-xs text-center text-muted-foreground">
                        ✨ Recommandations basées sur votre historique et vos préférences
                    </p>
                </div>
            </CardContent>
        </Card>
    );
};
