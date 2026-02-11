
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Bell, Mail, Phone, CheckCircle } from "lucide-react";
import { toast } from "sonner";

interface StockAlertDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    medicineName: string;
}

export const StockAlertDialog = ({ open, onOpenChange, medicineName }: StockAlertDialogProps) => {
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Simulate API call
        setTimeout(() => {
            setSubmitted(true);
            toast.success("Alerte créée avec succès !");
            setTimeout(() => {
                onOpenChange(false);
                setSubmitted(false); // Reset for next time
                setEmail("");
                setPhone("");
            }, 2000);
        }, 1000);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                {!submitted ? (
                    <>
                        <DialogHeader>
                            <DialogTitle className="flex items-center gap-2 text-xl">
                                <Bell className="h-5 w-5 text-amber-500" />
                                Alerte de disponibilité
                            </DialogTitle>
                            <DialogDescription>
                                Nous vous préviendrons dès que <strong>{medicineName}</strong> sera de nouveau en stock dans une pharmacie à proximité.
                            </DialogDescription>
                        </DialogHeader>

                        <form onSubmit={handleSubmit} className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label htmlFor="email" className="flex items-center gap-2">
                                    <Mail className="h-4 w-4" /> Email
                                </Label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="votre@email.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </div>

                            <div className="relative">
                                <div className="absolute inset-0 flex items-center">
                                    <span className="w-full border-t" />
                                </div>
                                <div className="relative flex justify-center text-xs uppercase">
                                    <span className="bg-background px-2 text-muted-foreground">Ou / Et</span>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="phone" className="flex items-center gap-2">
                                    <Phone className="h-4 w-4" /> Téléphone (SMS/WhatsApp)
                                </Label>
                                <Input
                                    id="phone"
                                    type="tel"
                                    placeholder="+225 07..."
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                />
                            </div>

                            <DialogFooter className="mt-6">
                                <Button type="submit" className="w-full font-bold" disabled={!email && !phone}>
                                    M'avertir
                                </Button>
                            </DialogFooter>

                            <div className="mt-6 pt-6 border-t">
                                <h4 className="text-sm font-bold mb-3">Alternatives disponibles immédiatement :</h4>
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-white rounded-md border flex items-center justify-center text-xs font-bold text-gray-400">IMG</div>
                                            <div>
                                                <p className="text-sm font-bold text-gray-900">Générique {medicineName}</p>
                                                <p className="text-xs text-green-600 font-medium">En stock • -30% moins cher</p>
                                            </div>
                                        </div>
                                        <Button variant="outline" size="sm" className="h-8 text-xs">Voir</Button>
                                    </div>
                                </div>
                            </div>
                        </form>
                    </>
                ) : (
                    <div className="py-8 flex flex-col items-center text-center space-y-3 animate-in fade-in zoom-in duration-300">
                        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-2">
                            <CheckCircle className="h-8 w-8 text-green-600" />
                        </div>
                        <h3 className="text-xl font-bold text-green-700">C'est noté !</h3>
                        <p className="text-muted-foreground">
                            Vous recevrez une notification instantanée dès le retour en stock.
                        </p>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
};
