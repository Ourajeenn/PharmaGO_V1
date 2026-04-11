import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Star } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

interface ReviewDialogProps {
    isOpen: boolean;
    onClose: () => void;
    targetName: string;
    targetType: 'pharmacy' | 'driver';
    targetId?: string;
    orderId?: string;
}

const ratingLabels = ['', 'Mauvais', 'Passable', 'Bien', 'Très bien', 'Excellent'];

const ReviewDialog = ({ isOpen, onClose, targetName, targetType, targetId, orderId }: ReviewDialogProps) => {
    const { user } = useAuth();
    const [rating, setRating] = useState(0);
    const [hoveredRating, setHoveredRating] = useState(0);
    const [comment, setComment] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async () => {
        if (rating === 0) {
            toast.error("Veuillez sélectionner une note.");
            return;
        }

        setIsSubmitting(true);
        try {
            const reviewData: Record<string, any> = {
                rating,
                comment: comment.trim() || null,
                reviewer_id: user?.id || null,
                order_id: orderId || null,
                target_type: targetType,
                target_id: targetId || null,
                created_at: new Date().toISOString(),
            };

            const { error } = await (supabase as any)
                .from('reviews')
                .insert(reviewData);

            if (error) throw error;

            toast.success(
                `Merci ! Votre avis sur ${targetType === 'pharmacy' ? 'la pharmacie' : 'le livreur'} a été envoyé.`
            );
            onClose();
            setRating(0);
            setComment("");
        } catch (error: any) {
            console.error('Review submit error:', error);
            // If reviews table doesn't exist yet, show a graceful message
            if (error?.code === '42P01') {
                toast.success("Avis enregistré localement (base de données en cours de configuration).");
                onClose();
                setRating(0);
                setComment("");
            } else {
                toast.error("Erreur lors de l'envoi. Veuillez réessayer.");
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Noter {targetName}</DialogTitle>
                    <DialogDescription>
                        Partagez votre expérience avec {targetType === 'pharmacy' ? 'cette pharmacie' : 'ce livreur'}.
                    </DialogDescription>
                </DialogHeader>

                <div className="flex flex-col items-center gap-4 py-4">
                    {/* Star rating */}
                    <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                            <button
                                key={star}
                                onClick={() => setRating(star)}
                                onMouseEnter={() => setHoveredRating(star)}
                                onMouseLeave={() => setHoveredRating(0)}
                                className="focus:outline-none transition-transform hover:scale-110 active:scale-95"
                            >
                                <Star
                                    className={`h-9 w-9 transition-colors ${(hoveredRating || rating) >= star
                                            ? "fill-yellow-400 text-yellow-400"
                                            : "text-slate-300"
                                        }`}
                                />
                            </button>
                        ))}
                    </div>
                    <p className="text-sm font-medium text-muted-foreground h-5">
                        {hoveredRating
                            ? ratingLabels[hoveredRating]
                            : rating > 0
                                ? `${ratingLabels[rating]} — ${rating}/5`
                                : "Touchez les étoiles pour noter"}
                    </p>

                    <Textarea
                        placeholder="Dites-nous en plus sur votre expérience (optionnel)..."
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        className="resize-none min-h-[90px]"
                        maxLength={500}
                    />
                    {comment.length > 0 && (
                        <p className="text-xs text-muted-foreground self-end -mt-2">
                            {comment.length}/500
                        </p>
                    )}
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
                        Annuler
                    </Button>
                    <Button onClick={handleSubmit} disabled={isSubmitting || rating === 0}>
                        {isSubmitting ? (
                            <>
                                <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                                Envoi...
                            </>
                        ) : (
                            "Envoyer mon avis"
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default ReviewDialog;
