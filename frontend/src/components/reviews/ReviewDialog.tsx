import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Star } from "lucide-react";
import { toast } from "sonner";

interface ReviewDialogProps {
    isOpen: boolean;
    onClose: () => void;
    targetName: string;
    targetType: 'pharmacy' | 'driver';
}

const ReviewDialog = ({ isOpen, onClose, targetName, targetType }: ReviewDialogProps) => {
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async () => {
        if (rating === 0) {
            toast.error("Veuillez sélectionner une note.");
            return;
        }

        setIsSubmitting(true);
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1500));

        setIsSubmitting(false);
        toast.success(`Votre avis sur ${targetType === 'pharmacy' ? 'la pharmacie' : 'le livreur'} a été envoyé !`);
        onClose();
        setRating(0);
        setComment("");
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
                    <div className="flex gap-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                            <button
                                key={star}
                                onClick={() => setRating(star)}
                                className="focus:outline-none transition-transform hover:scale-110"
                            >
                                <Star
                                    className={`h-8 w-8 ${rating >= star ? "fill-yellow-400 text-yellow-400" : "text-slate-300"}`}
                                />
                            </button>
                        ))}
                    </div>
                    <p className="text-sm font-medium text-muted-foreground">
                        {rating === 0 ? "Touchez les étoiles pour noter" : `${rating}/5 Étoiles`}
                    </p>

                    <Textarea
                        placeholder="Dites-nous en plus (optionnel)..."
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        className="resize-none"
                    />
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={onClose} disabled={isSubmitting}>Annuler</Button>
                    <Button onClick={handleSubmit} disabled={isSubmitting || rating === 0}>
                        {isSubmitting ? "Envoi..." : "Envoyer mon avis"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default ReviewDialog;
