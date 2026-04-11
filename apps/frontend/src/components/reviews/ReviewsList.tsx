import { useState, useEffect } from "react";
import { Star, MessageSquare } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";

interface Review {
    id: string;
    rating: number;
    comment: string | null;
    created_at: string;
    reviewer_name?: string;
}

interface ReviewsListProps {
    targetId: string;
    targetType: 'pharmacy' | 'driver';
}

export const ReviewsList = ({ targetId, targetType }: ReviewsListProps) => {
    const [reviews, setReviews] = useState<Review[]>([]);
    const [loading, setLoading] = useState(true);
    const [averageRating, setAverageRating] = useState(0);

    useEffect(() => {
        if (targetId) fetchReviews();
    }, [targetId]);

    const fetchReviews = async () => {
        try {
            const { data, error } = await (supabase as any)
                .from('reviews')
                .select('*')
                .eq('target_id', targetId)
                .eq('target_type', targetType)
                .order('created_at', { ascending: false })
                .limit(20);

            if (error) throw error;

            setReviews(data || []);
            if (data && data.length > 0) {
                const avg = data.reduce((sum: number, r: Review) => sum + r.rating, 0) / data.length;
                setAverageRating(Math.round(avg * 10) / 10);
            }
        } catch (error) {
            console.error('Error fetching reviews:', error);
        } finally {
            setLoading(false);
        }
    };

    const renderStars = (rating: number, small = false) =>
        [1, 2, 3, 4, 5].map((star) => (
            <Star
                key={star}
                className={`${small ? 'h-3.5 w-3.5' : 'h-5 w-5'} ${rating >= star ? 'fill-yellow-400 text-yellow-400' : 'text-slate-200'
                    }`}
            />
        ));

    const formatDate = (dateStr: string) =>
        new Date(dateStr).toLocaleDateString('fr-FR', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
        });

    if (loading) {
        return (
            <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" />
            </div>
        );
    }

    if (reviews.length === 0) {
        return (
            <div className="text-center py-8 text-muted-foreground">
                <MessageSquare className="h-10 w-10 mx-auto mb-2 opacity-30" />
                <p className="text-sm">Aucun avis pour le moment.</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {/* Average rating summary */}
            <div className="flex items-center gap-3 p-4 bg-yellow-50 rounded-xl border border-yellow-100">
                <span className="text-4xl font-black text-yellow-600">{averageRating}</span>
                <div>
                    <div className="flex">{renderStars(Math.round(averageRating))}</div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                        {reviews.length} avis client{reviews.length > 1 ? 's' : ''}
                    </p>
                </div>
            </div>

            {/* Individual reviews */}
            {reviews.map((review) => (
                <Card key={review.id} className="border-none shadow-sm bg-white/70">
                    <CardContent className="p-4 space-y-2">
                        <div className="flex items-center justify-between">
                            <div className="flex">{renderStars(review.rating, true)}</div>
                            <span className="text-xs text-muted-foreground">
                                {formatDate(review.created_at)}
                            </span>
                        </div>
                        {review.comment && (
                            <p className="text-sm text-foreground/80 leading-relaxed">
                                "{review.comment}"
                            </p>
                        )}
                    </CardContent>
                </Card>
            ))}
        </div>
    );
};

export default ReviewsList;
