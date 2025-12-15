import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { 
  Download, 
  Package, 
  Calendar, 
  MapPin, 
  CreditCard,
  FileText,
  Eye
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { generateInvoicePDF } from '@/lib/invoicePdf';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface OrderHistoryProps {
  userId: string;
  userName: string;
  userEmail: string;
}

export const OrderHistory = ({ userId, userName, userEmail }: OrderHistoryProps) => {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);

  useEffect(() => {
    fetchOrders();
  }, [userId]);

  const fetchOrders = async () => {
    try {
      const { data: ordersData, error: ordersError } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (
            id,
            medicine_id,
            quantity,
            unit_price,
            total_price,
            medicines (
              name,
              generic_name
            )
          ),
          pharmacies (
            name,
            address
          )
        `)
        .eq('patient_id', userId)
        .order('created_at', { ascending: false });

      if (ordersError) throw ordersError;
      setOrders(ordersData || []);
    } catch (error: any) {
      console.error('Error fetching orders:', error);
      toast.error('Erreur lors du chargement de l\'historique');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: 'bg-yellow-500',
      confirmed: 'bg-blue-500',
      preparing: 'bg-orange-500',
      ready: 'bg-purple-500',
      assigned: 'bg-indigo-500',
      picked_up: 'bg-cyan-500',
      delivered: 'bg-green-500',
      cancelled: 'bg-red-500'
    };
    return colors[status] || 'bg-gray-500';
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      pending: 'En attente',
      confirmed: 'Confirmée',
      preparing: 'En préparation',
      ready: 'Prête',
      assigned: 'Livreur assigné',
      picked_up: 'En livraison',
      delivered: 'Livrée',
      cancelled: 'Annulée'
    };
    return labels[status] || status;
  };

  const getPaymentMethodLabel = (method: string) => {
    const labels: Record<string, string> = {
      orange_money: 'Orange Money',
      wave: 'Wave',
      mtn_money: 'MTN Money',
      moov_money: 'Moov Money',
      cash_on_delivery: 'Paiement à la livraison',
      card: 'Carte bancaire'
    };
    return labels[method] || method;
  };

  const handleDownloadInvoice = (order: any) => {
    try {
      const formattedOrder = {
        id: order.id,
        created_at: order.created_at,
        total: order.total,
        delivery_fee: 500, // Vous pouvez calculer dynamiquement
        payment_method: getPaymentMethodLabel(order.payment_method || ''),
        delivery_address: order.delivery_address,
        status: getStatusLabel(order.status),
        items: order.order_items.map((item: any) => ({
          medicine_name: item.medicines?.name || 'N/A',
          quantity: item.quantity,
          unit_price: item.unit_price,
          total_price: item.total_price
        })),
        pharmacy_name: order.pharmacies?.name
      };

      generateInvoicePDF(formattedOrder, userName, userEmail);
      toast.success('Facture téléchargée avec succès');
    } catch (error) {
      console.error('Error generating invoice:', error);
      toast.error('Erreur lors de la génération de la facture');
    }
  };

  const viewOrderDetails = (order: any) => {
    setSelectedOrder(order);
    setDetailsOpen(true);
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Historique des commandes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Chargement...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Historique des commandes ({orders.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {orders.length === 0 ? (
            <div className="text-center py-8">
              <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">Aucune commande pour le moment</p>
            </div>
          ) : (
            <ScrollArea className="h-[600px] pr-4">
              <div className="space-y-4">
                {orders.map((order) => (
                  <Card key={order.id} className="border-l-4" style={{ borderLeftColor: `var(--${getStatusColor(order.status)})` }}>
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="space-y-1">
                          <p className="text-sm font-medium">
                            Commande #{order.id.substring(0, 8).toUpperCase()}
                          </p>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Calendar className="h-4 w-4" />
                            {new Date(order.created_at).toLocaleDateString('fr-FR', {
                              day: '2-digit',
                              month: 'long',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </div>
                        </div>
                        <Badge className={getStatusColor(order.status)}>
                          {getStatusLabel(order.status)}
                        </Badge>
                      </div>

                      <Separator className="my-3" />

                      <div className="space-y-2">
                        <div className="flex items-start gap-2 text-sm">
                          <MapPin className="h-4 w-4 mt-0.5 text-muted-foreground" />
                          <span className="text-muted-foreground">{order.delivery_address}</span>
                        </div>
                        
                        <div className="flex items-center gap-2 text-sm">
                          <CreditCard className="h-4 w-4 text-muted-foreground" />
                          <span className="text-muted-foreground">
                            {getPaymentMethodLabel(order.payment_method || '')}
                          </span>
                        </div>

                        <div className="flex items-center gap-2 text-sm">
                          <Package className="h-4 w-4 text-muted-foreground" />
                          <span className="text-muted-foreground">
                            {order.order_items?.length || 0} article(s)
                          </span>
                        </div>
                      </div>

                      <Separator className="my-3" />

                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground">Total</p>
                          <p className="text-lg font-bold">{order.total.toLocaleString('fr-FR')} FCFA</p>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => viewOrderDetails(order)}
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            Détails
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDownloadInvoice(order)}
                          >
                            <Download className="h-4 w-4 mr-2" />
                            Facture
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>

      {/* Order Details Dialog */}
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Détails de la commande</DialogTitle>
            <DialogDescription>
              Commande #{selectedOrder?.id.substring(0, 8).toUpperCase()}
            </DialogDescription>
          </DialogHeader>
          
          {selectedOrder && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium">Date</p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(selectedOrder.created_at).toLocaleDateString('fr-FR')}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium">Statut</p>
                  <Badge className={getStatusColor(selectedOrder.status)}>
                    {getStatusLabel(selectedOrder.status)}
                  </Badge>
                </div>
              </div>

              <Separator />

              <div>
                <p className="text-sm font-medium mb-2">Adresse de livraison</p>
                <p className="text-sm text-muted-foreground">{selectedOrder.delivery_address}</p>
              </div>

              {selectedOrder.pharmacies && (
                <div>
                  <p className="text-sm font-medium mb-2">Pharmacie</p>
                  <p className="text-sm text-muted-foreground">{selectedOrder.pharmacies.name}</p>
                  <p className="text-xs text-muted-foreground">{selectedOrder.pharmacies.address}</p>
                </div>
              )}

              <Separator />

              <div>
                <p className="text-sm font-medium mb-3">Articles commandés</p>
                <div className="space-y-2">
                  {selectedOrder.order_items?.map((item: any) => (
                    <div key={item.id} className="flex justify-between items-start p-2 rounded-lg bg-muted/50">
                      <div className="flex-1">
                        <p className="text-sm font-medium">{item.medicines?.name}</p>
                        {item.medicines?.generic_name && (
                          <p className="text-xs text-muted-foreground">{item.medicines.generic_name}</p>
                        )}
                        <p className="text-xs text-muted-foreground">
                          {item.quantity} x {item.unit_price.toLocaleString('fr-FR')} FCFA
                        </p>
                      </div>
                      <p className="text-sm font-medium">
                        {item.total_price.toLocaleString('fr-FR')} FCFA
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Sous-total</span>
                  <span>{(selectedOrder.total - 500).toLocaleString('fr-FR')} FCFA</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Frais de livraison</span>
                  <span>500 FCFA</span>
                </div>
                <Separator />
                <div className="flex justify-between text-base font-bold">
                  <span>Total</span>
                  <span>{selectedOrder.total.toLocaleString('fr-FR')} FCFA</span>
                </div>
              </div>

              <Button 
                className="w-full" 
                onClick={() => handleDownloadInvoice(selectedOrder)}
              >
                <FileText className="h-4 w-4 mr-2" />
                Télécharger la facture
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};
