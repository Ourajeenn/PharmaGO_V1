import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Receipt,
    Printer,
    Download,
    CheckCircle2,
    Truck,
    Clock,
    MapPin,
    Building2,
    Calendar
} from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

interface OrderInvoiceProps {
    orderId: string;
    items: any[];
    total: number;
    subtotal: number;
    deliveryFee: number;
    paymentMethod: string;
    address: string;
    onTrackOrder?: () => void;
}

const OrderInvoice = ({
    orderId,
    items,
    total,
    subtotal,
    deliveryFee,
    paymentMethod,
    address,
    onTrackOrder
}: OrderInvoiceProps) => {
    const handlePrint = () => {
        window.print();
    };

    return (
        <Card className="w-full max-w-2xl mx-auto border-2 shadow-2xl print:shadow-none print:border-none">
            <CardHeader className="bg-primary/5 border-b text-center py-8 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10">
                    <Building2 className="h-24 w-24" />
                </div>
                <div className="flex justify-center mb-4">
                    <div className="bg-green-100 p-3 rounded-full">
                        <CheckCircle2 className="h-10 w-10 text-green-600" />
                    </div>
                </div>
                <CardTitle className="text-2xl font-bold text-primary">COMMANDE CONFIRMÉE</CardTitle>
                <p className="text-muted-foreground">Merci pour votre confiance !</p>
                <div className="mt-4 flex justify-center gap-2">
                    <Badge variant="outline" className="text-sm px-3 py-1">
                        #{orderId}
                    </Badge>
                    <Badge variant="outline" className="text-sm px-3 py-1 flex gap-1 items-center">
                        <Calendar className="h-3 w-3" />
                        {format(new Date(), "dd MMMM yyyy 'à' HH:mm", { locale: fr })}
                    </Badge>
                </div>
            </CardHeader>
            <CardContent className="p-8 space-y-8">
                {/* Pharmacy & Delivery Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-6 border-b">
                    <div className="space-y-3">
                        <h4 className="font-semibold text-sm uppercase text-muted-foreground flex items-center gap-2">
                            <MapPin className="h-4 w-4" />
                            Lieu de livraison
                        </h4>
                        <p className="text-sm leading-relaxed">{address}</p>
                    </div>
                    <div className="space-y-3">
                        <h4 className="font-semibold text-sm uppercase text-muted-foreground flex items-center gap-2">
                            <Truck className="h-4 w-4" />
                            Mode de paiement
                        </h4>
                        <div className="flex items-center gap-2">
                            <Badge variant="secondary" className="capitalize">
                                {paymentMethod.replace('_', ' ')}
                            </Badge>
                        </div>
                    </div>
                </div>

                {/* Items List */}
                <div className="space-y-4">
                    <h4 className="font-semibold text-sm uppercase text-muted-foreground">Articles</h4>
                    <div className="space-y-3">
                        {items.map((item, idx) => (
                            <div key={idx} className="flex justify-between items-center text-sm">
                                <div className="flex gap-3 items-center">
                                    <span className="w-6 h-6 flex items-center justify-center bg-muted rounded text-xs font-bold">
                                        {item.quantity}
                                    </span>
                                    <span className="font-medium">{item.medicine?.name || item.name}</span>
                                </div>
                                <span className="font-bold">{(item.price * item.quantity).toLocaleString()} FCFA</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Financial Summary */}
                <div className="bg-muted/30 p-6 rounded-xl space-y-3">
                    <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Sous-total</span>
                        <span>{subtotal.toLocaleString()} FCFA</span>
                    </div>
                    <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Frais de livraison</span>
                        <span>{deliveryFee.toLocaleString()} FCFA</span>
                    </div>
                    <div className="flex justify-between text-lg font-bold pt-3 border-t border-muted-foreground/20 text-primary">
                        <span>Total à payer</span>
                        <span>{total.toLocaleString()} FCFA</span>
                    </div>
                </div>

                {/* Print/Share Actions */}
                <div className="flex flex-col sm:flex-row gap-4 pt-4 print:hidden">
                    <Button variant="outline" className="flex-1" onClick={handlePrint}>
                        <Printer className="h-4 w-4 mr-2" />
                        Imprimer le reçu
                    </Button>
                    {onTrackOrder ? (
                        <Button className="flex-1" onClick={onTrackOrder}>
                            <Truck className="h-4 w-4 mr-2" />
                            Suivre mon colis
                        </Button>
                    ) : (
                        <Button className="flex-1">
                            <Download className="h-4 w-4 mr-2" />
                            Télécharger PDF
                        </Button>
                    )}
                </div>

                <div className="text-center text-[10px] text-muted-foreground uppercase tracking-widest pt-8 border-t border-dashed">
                    PharmaGo Express - Votre santé, notre priorité
                    <br /> Côte d'Ivoire - Abidjan
                </div>
            </CardContent>
        </Card>
    );
};

export default OrderInvoice;
