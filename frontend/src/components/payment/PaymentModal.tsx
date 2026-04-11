import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { CheckCircle, CreditCard, Wallet, Smartphone, Loader2, MapPin, Phone, User } from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { useCart } from "@/contexts/CartContext";
import { auditService } from "@/services/AuditService";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

interface PaymentModalProps {
    isOpen: boolean;
    onClose: () => void;
    totalAmount: number;
}

const PaymentModal = ({ isOpen, onClose, totalAmount }: PaymentModalProps) => {
    const [step, setStep] = useState(1);
    const [paymentMethod, setPaymentMethod] = useState("om");
    const [isProcessing, setIsProcessing] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const { user } = useAuth();

    // Form State (Epic 2 - ORDER-02)
    const [deliveryMode, setDeliveryMode] = useState<'delivery' | 'pickup'>('delivery');
    const { items, clearCart } = useCart();

    // Get unique pharmacies from items
    const pharmacies = Array.from(new Set(items.map(item => item.pharmacy_name || "Pharmacie Principale")));

    const [deliveryInfo, setDeliveryInfo] = useState({
        name: "",
        phone: "",
        address: ""
    });

    const navigate = useNavigate();
    // const { clearCart } = useCart(); // Already destructured above

    const handleNextStep = () => {
        if (step === 1) {
            if (!deliveryInfo.name || !deliveryInfo.phone) {
                toast.error("Veuillez remplir votre nom et téléphone");
                return;
            }
            if (deliveryMode === 'delivery' && !deliveryInfo.address) {
                toast.error("Veuillez remplir l'adresse de livraison");
                return;
            }
            setStep(2);
        } else if (step === 2) {
            handlePayment();
        }
    };

    const handlePayment = async () => {
        setIsProcessing(true);

        // Simulate payment initiation
        await new Promise(resolve => setTimeout(resolve, 1500));

        toast.info("Validation du paiement en attente...");

        // Simulate Webhook Wait (Epic 2 - PAY-01)
        await new Promise(resolve => setTimeout(resolve, 2000));

        setIsProcessing(false);
        setIsSuccess(true);

        // Audit Log (SEC-02)
        auditService.log('PAYMENT_PROCESSED', 'current_user_id', {
            amount: totalAmount,
            method: paymentMethod,
            status: 'SUCCESS'
        });

        toast.success("Paiement confirmé par l'opérateur !");

        // Real Database Persistence (Epic 2 - ORDER-03)
        try {
            if (user) {
                // Group items by pharmacy to create separate or consolidated orders
                // For simplicity now, we create one order per pharmacy
                const grouped = items.reduce((acc, item) => {
                    if (!acc[item.pharmacy_id]) acc[item.pharmacy_id] = [];
                    acc[item.pharmacy_id].push(item);
                    return acc;
                }, {} as any);

                for (const [pharmacyId, pharmacyItems] of Object.entries(grouped)) {
                    const subtotal = (pharmacyItems as any).reduce((sum: number, item: any) => sum + (item.price * item.quantity), 0);

                    const { error: orderError } = await supabase
                        .from('orders')
                        .insert({
                            patient_id: user.id,
                            pharmacy_id: pharmacyId,
                            status: 'ready', // Immediately available for drivers
                            total: subtotal + 1000,
                            delivery_address: deliveryMode === 'delivery' ? deliveryInfo.address : ' retrait en pharmacie',
                            items: pharmacyItems,
                            created_at: new Date().toISOString()
                        });

                    if (orderError) throw orderError;
                }
            }
        } catch (error) {
            console.error("Error creating order:", error);
            toast.error("Erreur lors de la création de la commande");
        }

        // Clear cart and close after delay
        setTimeout(() => {
            clearCart();
            onClose();
            setIsSuccess(false);
            setStep(1); // Reset
            navigate('/livraison/suivi');
        }, 2000);
    };

    if (isSuccess) {
        return (
            <Dialog open={isOpen} onOpenChange={onClose}>
                <DialogContent className="sm:max-w-md text-center py-10">
                    <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                        <CheckCircle className="h-10 w-10 text-green-600" />
                    </div>
                    <DialogTitle className="text-2xl font-bold text-green-700 mb-2">Commande Confirmée !</DialogTitle>
                    <DialogDescription className="text-lg">
                        {deliveryMode === 'delivery'
                            ? "Votre commande a été transmise à la pharmacie."
                            : "Votre commande est prête à être préparée."}
                    </DialogDescription>

                    {deliveryMode === 'delivery' ? (
                        <p className="text-muted-foreground mt-2">Un livreur va vous être assigné sous peu.</p>
                    ) : (
                        <div className="mt-6 p-4 bg-white border-2 border-dashed border-gray-300 rounded-xl">
                            <p className="text-sm font-bold text-gray-500 mb-2 uppercase tracking-wide">Code de Retrait</p>
                            <div className="bg-black p-2 w-32 h-32 mx-auto rounded-lg mb-2">
                                <img src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=ORDER-${Date.now()}`} alt="QR Code" className="w-full h-full" />
                            </div>
                            <p className="text-xs text-muted-foreground">Présentez ce code à la pharmacie pour récupérer votre commande.</p>
                            <div className="mt-2 text-primary font-mono font-bold text-xl tracking-widest">
                                #{Math.floor(1000 + Math.random() * 9000)}
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        )
    }

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>
                        {step === 1 ? "Informations de Livraison" : "Paiement Sécurisé"}
                    </DialogTitle>
                    <DialogDescription>
                        Montant total : <span className="font-bold text-primary">{totalAmount.toLocaleString()} FCFA</span>
                    </DialogDescription>
                </DialogHeader>

                <div className="py-4">
                    {step === 1 && (
                        <div className="space-y-4">
                            {/* Delivery Mode Toggle */}
                            <div className="grid grid-cols-2 gap-2 p-1 bg-muted rounded-lg">
                                <Button
                                    variant={deliveryMode === 'delivery' ? 'default' : 'ghost'}
                                    onClick={() => setDeliveryMode('delivery')}
                                    className="rounded-md"
                                >
                                    <MapPin className="h-4 w-4 mr-2" />
                                    Livraison
                                </Button>
                                <Button
                                    variant={deliveryMode === 'pickup' ? 'default' : 'ghost'}
                                    onClick={() => setDeliveryMode('pickup')}
                                    className="rounded-md"
                                >
                                    <Smartphone className="h-4 w-4 mr-2" />
                                    Click & Collect
                                </Button>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="name">Nom complet</Label>
                                <div className="relative">
                                    <User className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        id="name"
                                        placeholder="Votre nom"
                                        className="pl-9"
                                        value={deliveryInfo.name}
                                        onChange={(e) => setDeliveryInfo({ ...deliveryInfo, name: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="phone">Téléphone</Label>
                                <div className="relative">
                                    <Phone className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        id="phone"
                                        placeholder="0102030405"
                                        className="pl-9"
                                        value={deliveryInfo.phone}
                                        onChange={(e) => setDeliveryInfo({ ...deliveryInfo, phone: e.target.value })}
                                    />
                                </div>
                            </div>

                            {deliveryMode === 'delivery' ? (
                                <div className="space-y-2 animate-in slide-in-from-top-2">
                                    <Label htmlFor="address">Adresse de livraison</Label>
                                    <div className="relative">
                                        <MapPin className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            id="address"
                                            placeholder="Quartier, Rue, Repère..."
                                            className="pl-9"
                                            value={deliveryInfo.address}
                                            onChange={(e) => setDeliveryInfo({ ...deliveryInfo, address: e.target.value })}
                                        />
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-2 animate-in slide-in-from-top-2">
                                    <Label>Point de retrait</Label>
                                    <div className="p-3 border rounded-lg bg-gray-50 space-y-2">
                                        <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Vos articles seront disponibles ici :</p>
                                        {pharmacies.map((pharmacy, idx) => (
                                            <div key={idx} className="flex items-center gap-2 text-sm font-bold text-gray-800">
                                                <MapPin className="h-4 w-4 text-primary" />
                                                {pharmacy}
                                            </div>
                                        ))}
                                    </div>
                                    <p className="text-[10px] text-amber-600 bg-amber-50 p-2 rounded border border-amber-100 flex gap-2">
                                        <CheckCircle className="h-3 w-3 mt-0.5" />
                                        Présentez votre QR code à la pharmacie pour récupérer votre commande sans attendre.
                                    </p>
                                </div>
                            )}
                        </div>
                    )}

                    {step === 2 && (
                        <div className="grid gap-4">
                            <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod} className="grid grid-cols-2 gap-4">
                                <div className={`flex flex-col items-center justify-between rounded-md border-2 border-muted p-4 hover:bg-accent hover:text-accent-foreground cursor-pointer transition-all ${paymentMethod === 'om' ? 'border-primary bg-primary/5' : ''}`}>
                                    <RadioGroupItem value="om" id="om" className="sr-only" />
                                    <Label htmlFor="om" className="cursor-pointer flex flex-col items-center gap-2 w-full">
                                        <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center text-white font-bold">OM</div>
                                        <span className="font-semibold">Orange Money</span>
                                    </Label>
                                </div>
                                <div className={`flex flex-col items-center justify-between rounded-md border-2 border-muted p-4 hover:bg-accent hover:text-accent-foreground cursor-pointer transition-all ${paymentMethod === 'wave' ? 'border-primary bg-primary/5' : ''}`}>
                                    <RadioGroupItem value="wave" id="wave" className="sr-only" />
                                    <Label htmlFor="wave" className="cursor-pointer flex flex-col items-center gap-2 w-full">
                                        <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold">W</div>
                                        <span className="font-semibold">Wave</span>
                                    </Label>
                                </div>
                                <div className={`flex flex-col items-center justify-between rounded-md border-2 border-muted p-4 hover:bg-accent hover:text-accent-foreground cursor-pointer transition-all ${paymentMethod === 'mtn' ? 'border-primary bg-primary/5' : ''}`}>
                                    <RadioGroupItem value="mtn" id="mtn" className="sr-only" />
                                    <Label htmlFor="mtn" className="cursor-pointer flex flex-col items-center gap-2 w-full">
                                        <div className="w-10 h-10 bg-yellow-400 rounded-full flex items-center justify-center text-black font-bold">MoMo</div>
                                        <span className="font-semibold">MTN MoMo</span>
                                    </Label>
                                </div>
                                <div className={`flex flex-col items-center justify-between rounded-md border-2 border-muted p-4 hover:bg-accent hover:text-accent-foreground cursor-pointer transition-all ${paymentMethod === 'cash' ? 'border-primary bg-primary/5' : ''}`}>
                                    <RadioGroupItem value="cash" id="cash" className="sr-only" />
                                    <Label htmlFor="cash" className="cursor-pointer flex flex-col items-center gap-2 w-full">
                                        <Wallet className="h-8 w-8 text-slate-600" />
                                        <span className="font-semibold">Espèces</span>
                                    </Label>
                                </div>
                            </RadioGroup>
                        </div>
                    )}
                </div>

                <DialogFooter className="flex-col sm:flex-row gap-2">
                    {step === 2 && (
                        <Button onClick={() => setStep(1)} variant="outline" disabled={isProcessing}>
                            Retour
                        </Button>
                    )}
                    <Button onClick={onClose} variant="ghost" disabled={isProcessing}>Annuler</Button>
                    <Button onClick={handleNextStep} disabled={isProcessing} className="w-full sm:w-auto bg-primary text-white hover:bg-primary/90">
                        {isProcessing ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                {step === 2 ? "Traitement..." : "Suivant"}
                            </>
                        ) : (
                            <>
                                {step === 1 ? "Continuer vers le paiement" : `Payer ${totalAmount.toLocaleString()} FCFA`}
                            </>
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default PaymentModal;
