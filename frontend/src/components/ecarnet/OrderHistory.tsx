import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ShoppingBag, Truck, Calendar, MapPin, ChevronRight, Package } from "lucide-react";

export interface Order {
    id: string;
    date: string;
    items: { name: string; quantity: number }[];
    total: number;
    status: 'En cours' | 'Livrée' | 'Annulée';
    pharmacy: string;
}

const mockOrders: Order[] = [
    {
        id: "CMD-2024-001",
        date: "12 Déc 2024",
        items: [{ name: "Doliprane 1000mg", quantity: 2 }, { name: "Vitamines C", quantity: 1 }],
        total: 5500,
        status: "Livrée",
        pharmacy: "Pharmacie des Finances"
    },
    {
        id: "CMD-2024-002",
        date: "16 Déc 2024",
        items: [{ name: "Amoxicilline 500mg", quantity: 1 }],
        total: 3200,
        status: "En cours",
        pharmacy: "Pharmacie de Cocody"
    }
];

const OrderHistory = () => {
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
                    {mockOrders.map((order) => (
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
                                <div className="text-right">
                                    <div className="font-bold text-sm text-primary">{order.total.toLocaleString()} FCFA</div>
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
                    ))}
                    <Button variant="outline" className="w-full">
                        Voir toutes les commandes
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
};

export default OrderHistory;
