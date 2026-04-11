import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ShoppingBag, Truck, Calendar, MapPin, ChevronRight, Package, Download } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useECarnet } from "@/contexts/ECarnetContext";
import { PDFService } from "@/services/PDFService";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

export interface Order {
    id: string;
    date: string;
    items: { name: string; quantity: number }[];
    total: number;
    status: 'En cours' | 'Livrée' | 'Annulée';
    pharmacy: string;
}

const OrderHistory = () => {
    const { user } = useAuth();
    const { currentPatient } = useECarnet();
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user) {
            fetchOrders();
        }
    }, [user]);

    const fetchOrders = async () => {
        try {
            const { data, error } = await supabase
                .from('orders')
                .select(`
                    id,
                    created_at,
                    total,
                    status,
                    pharmacies (name),
                    order_items (
                        quantity,
                        medicines (name)
                    )
                `)
                .eq('patient_id', user?.id)
                .order('created_at', { ascending: false })
                .limit(5);

            if (error) throw error;

            const mappedOrders: Order[] = (data || []).map(o => ({
                id: o.id.substring(0, 8).toUpperCase(),
                date: new Date(o.created_at).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' }),
                total: o.total,
                status: mapStatus(o.status),
                pharmacy: o.pharmacies?.name || "Pharmacie Inconnue",
                items: o.order_items?.map((i: any) => ({
                    name: i.medicines?.name || "Médicament",
                    quantity: i.quantity
                })) || []
            }));

            setOrders(mappedOrders);
        } catch (err) {
            console.error("Error fetching patient orders:", err);
            // toast.error("Impossible de charger l'historique");
        } finally {
            setLoading(false);
        }
    };

    const mapStatus = (status: string): Order['status'] => {
        if (status === 'delivered') return 'Livrée';
        if (status === 'cancelled') return 'Annulée';
        return 'En cours';
    };

    return (
        <Card className="h-full">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <ShoppingBag className="h-5 w-5 text-primary" />
                    Historique des Commandes
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {loading ? (
                        <div className="text-center py-4 text-xs text-muted-foreground animate-pulse">Chargement des commandes...</div>
                    ) : orders.length === 0 ? (
                        <div className="text-center py-4 text-xs text-muted-foreground">Aucune commande récente</div>
                    ) : (
                        orders.map((order) => (
                            <div key={order.id} className="border rounded-lg p-3 hover:bg-muted/50 transition-colors">
                                <div className="flex justify-between items-start mb-2">
                                    <div>
                                        <div className="font-semibold text-sm flex items-center gap-2">
                                            {order.id}
                                            <Badge variant={order.status === 'Livrée' ? 'secondary' : 'default'} className="text-[10px] h-5">
                                                {order.status}
                                            </Badge>
                                        </div>
                                        <div className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                                            <Calendar className="h-3 w-3" />
                                            {order.date}
                                        </div>
                                    </div>
                                    <div className="text-right flex flex-col items-end gap-2">
                                        <div className="font-bold text-sm text-primary">{order.total.toLocaleString()} FCFA</div>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8 rounded-full hover:bg-primary/10 text-primary transition-all"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                PDFService.generateOrderReceipt(order, currentPatient || undefined);
                                                toast.success("Facture téléchargée");
                                            }}
                                        >
                                            <Download className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>

                                <div className="text-xs text-muted-foreground mb-2">
                                    <div className="flex items-center gap-1 mb-1">
                                        <MapPin className="h-3 w-3" />
                                        {order.pharmacy}
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <Package className="h-3 w-3" />
                                        {order.items.map(i => `${i.quantity}x ${i.name}`).join(', ')}
                                    </div>
                                </div>

                                <Button variant="ghost" size="sm" className="w-full text-xs h-7">
                                    Voir détails <ChevronRight className="h-3 w-3 ml-1" />
                                </Button>
                            </div>
                        ))
                    )}
                    <Button variant="outline" className="w-full">
                        Voir toutes les commandes
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
};

export default OrderHistory;
