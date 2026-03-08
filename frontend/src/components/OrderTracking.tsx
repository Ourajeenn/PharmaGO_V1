import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ArrowLeft,
  Package,
  Truck,
  MapPin,
  Clock,
  Phone,
  Navigation,
  Search,
  CheckCircle,
  Star,
  CreditCard,
  Loader2,
  QrCode,
  MessageSquare
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { LiveMap } from "@/components/tracking/LiveMap";
import { DeliveryQRCode } from "./orders/DeliveryQRCode";
import { RealtimeChat } from "./chat/RealtimeChat";
import {
  Dialog,
  DialogContent,
  DialogTrigger
} from "@/components/ui/dialog";

interface Order {
  id: string;
  status: 'preparing' | 'ready' | 'picked_up' | 'in_transit' | 'delivered' | 'cancelled';
  pharmacy: {
    name: string;
    address: string;
    phone: string;
  };
  driver?: {
    name: string;
    phone: string;
    rating: number;
    location: { lat: number; lng: number };
  };
  items: {
    id: string;
    name: string;
    quantity: number;
    price: number;
  }[];
  total: number;
  deliveryFee: number;
  estimatedDelivery: string;
  deliveryAddress: string;
  orderTime: string;
  paymentMethod: string;
  paymentStatus: 'pending' | 'paid' | 'failed';
}

const mockOrders: Order[] = [
  {
    id: "ORD-2024-001",
    status: "in_transit",
    pharmacy: {
      name: "Pharmacie Moderne de Plateau",
      address: "Boulevard Clozel, Plateau",
      phone: "+225 21 32 45 67"
    },
    driver: {
      name: "Kouadio Jean",
      phone: "+225 07 12 34 56",
      rating: 4.8,
      location: { lat: 5.3364, lng: -4.0266 }
    },
    items: [
      { id: "1", name: "Doliprane 1000mg", quantity: 1, price: 2500 },
      { id: "2", name: "Amoxicilline 500mg", quantity: 1, price: 3200 }
    ],
    total: 6200,
    deliveryFee: 500,
    estimatedDelivery: "15:30",
    deliveryAddress: "Cocody, Riviera Golf, Villa 123",
    orderTime: "14:45",
    paymentMethod: "Orange Money",
    paymentStatus: "paid"
  },
  {
    id: "ORD-2024-002",
    status: "preparing",
    pharmacy: {
      name: "Pharmacie de la Paix",
      address: "Rue des Jardins, Cocody",
      phone: "+225 22 44 55 66"
    },
    items: [
      { id: "3", name: "Vitamines C", quantity: 2, price: 1800 }
    ],
    total: 4350,
    deliveryFee: 750,
    estimatedDelivery: "16:00",
    deliveryAddress: "Adjamé, Marché, Rue 15",
    orderTime: "15:20",
    paymentMethod: "Wave",
    paymentStatus: "paid"
  }
];

const statusSteps = [
  { key: 'pending', label: 'En attente', icon: Search },
  { key: 'preparing', label: 'Préparation', icon: Package },
  { key: 'ready', label: 'Prête', icon: CheckCircle },
  { key: 'picked_up', label: 'Récupérée', icon: Truck },
  { key: 'in_transit', label: 'En livraison', icon: Navigation },
  { key: 'delivered', label: 'Livrée', icon: CheckCircle }
];

interface OrderTrackingProps {
  onBackToHome?: () => void;
}

const OrderTracking = ({ onBackToHome }: OrderTrackingProps) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchOrderId, setSearchOrderId] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [showChat, setShowChat] = useState(false);

  // Simulate driver movement for Phase 6 Demo
  useEffect(() => {
    if (!selectedOrder?.driver || selectedOrder.status !== 'in_transit') return;

    const interval = setInterval(() => {
      setOrders(prevOrders => prevOrders.map(order => {
        if (order.id === selectedOrder.id && order.driver) {
          // Incrementally move towards a destination (simplified)
          const newLat = order.driver.location.lat + (Math.random() - 0.4) * 0.0005;
          const newLng = order.driver.location.lng + (Math.random() - 0.4) * 0.0005;
          return {
            ...order,
            driver: {
              ...order.driver,
              location: { lat: newLat, lng: newLng }
            }
          };
        }
        return order;
      }));
    }, 3000);

    return () => clearInterval(interval);
  }, [selectedOrder?.id, selectedOrder?.status]);

  // Sync selectedOrder with the updated orders list to reflect movement
  useEffect(() => {
    if (selectedOrder) {
      const updated = orders.find(o => o.id === selectedOrder.id);
      if (updated && JSON.stringify(updated.driver?.location) !== JSON.stringify(selectedOrder.driver?.location)) {
        setSelectedOrder(updated);
      }
    }
  }, [orders]);

  // Fetch initial orders
  useEffect(() => {
    if (!user) return;
    fetchOrders();

    // Subscribe to REALTIME updates on 'orders' table
    const ordersChannel = supabase
      .channel('schema-db-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'orders' },
        (payload) => {
          console.log('Realtime update:', payload);
          fetchOrders(); // Refresh all to stay in sync
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(ordersChannel);
    };
  }, [user]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const { data: ordersData, error } = await supabase
        .from('orders')
        .select(`
          *,
          pharmacies:pharmacy_id (
            id,
            user_profiles:user_id (name, phone, address)
          ),
          order_items (
            id,
            quantity,
            unit_price,
            medicines:medicine_id (name)
          ),
          delivery_tracking (
            status,
            current_lat,
            current_lng,
            driver_profiles:driver_id (
              user_profiles:user_id (name, phone)
            )
          )
        `)
        .eq('patient_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (ordersData) {
        const formattedOrders: Order[] = ordersData.map((o: any) => {
          const tracking = o.delivery_tracking?.[0];
          return {
            id: o.id,
            status: o.status,
            pharmacy: {
              name: o.pharmacies?.user_profiles?.name || 'Pharmacie',
              address: o.pharmacies?.user_profiles?.address || 'Adresse non spécifiée',
              phone: o.pharmacies?.user_profiles?.phone || ''
            },
            driver: tracking?.driver_profiles ? {
              name: tracking.driver_profiles.user_profiles?.name || 'Chauffeur',
              phone: tracking.driver_profiles.user_profiles?.phone || '',
              rating: 4.8, // Default rating
              location: {
                lat: tracking.current_lat || 5.3364,
                lng: tracking.current_lng || -4.0266
              }
            } : undefined,
            items: o.order_items?.map((item: any) => ({
              id: item.id,
              name: item.medicines?.name || 'Médicament',
              quantity: item.quantity,
              price: item.unit_price
            })) || [],
            total: o.total || 0,
            deliveryFee: 1500,
            estimatedDelivery: "---",
            deliveryAddress: o.delivery_address || 'À domicile',
            orderTime: new Date(o.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            paymentMethod: o.payment_method || 'Orange Money',
            paymentStatus: o.payment_status === 'paid' ? 'paid' : 'pending'
          };
        });
        setOrders(formattedOrders);
        if (!selectedOrder && formattedOrders.length > 0) {
          setSelectedOrder(formattedOrders[0]);
        }
      }
    } catch (err) {
      console.error('Error fetching orders:', err);
      toast.error("Échec du chargement des commandes");
    } finally {
      setLoading(false);
    }
  };

  const searchOrder = () => {
    const order = orders.find(o => o.id === searchOrderId || o.id.includes(searchOrderId));
    if (order) {
      setSelectedOrder(order);
      setSearchOrderId("");
    } else {
      toast.error("Commande non trouvée");
    }
  };

  const getStatusIndex = (status: string) => {
    return statusSteps.findIndex(step => step.key === status);
  };

  const getProgressPercentage = (status: string) => {
    const index = getStatusIndex(status);
    return ((index + 1) / statusSteps.length) * 100;
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      pending: "bg-gray-100 text-gray-800 border-gray-200",
      preparing: "bg-yellow-100 text-yellow-800 border-yellow-200",
      ready: "bg-blue-100 text-blue-800 border-blue-200",
      picked_up: "bg-purple-100 text-purple-800 border-purple-200",
      in_transit: "bg-orange-100 text-orange-800 border-orange-200",
      delivered: "bg-green-100 text-green-800 border-green-200",
      cancelled: "bg-red-100 text-red-800 border-red-200"
    };

    const labels = {
      pending: "En attente de validation",
      preparing: "En préparation",
      ready: "Prête à récupérer",
      picked_up: "Récupérée",
      in_transit: "En livraison",
      delivered: "Livrée",
      cancelled: "Annulée"
    };

    return (
      <Badge className={variants[status as keyof typeof variants]}>
        {labels[status as keyof typeof labels]}
      </Badge>
    );
  };

  const callDriver = (phone: string) => {
    window.open(`tel:${phone}`, '_self');
  };

  const openInWaze = (lat: number, lng: number) => {
    window.open(`https://waze.com/ul?ll=${lat},${lng}&navigate=yes`, '_blank');
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary to-secondary text-white">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-4 mb-4">
            {onBackToHome && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onBackToHome}
                className="text-white hover:bg-white/10"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Retour
              </Button>
            )}
            <h1 className="text-3xl font-bold">Suivi de Commande</h1>
          </div>
          <div className="flex justify-end mb-4">
            <Button
              variant="outline"
              className="bg-white/10 text-white border-white/20 hover:bg-white/20"
              onClick={() => navigate('/pharmacies')}
            >
              <MapPin className="h-4 w-4 mr-2" />
              Trouver une pharmacie
            </Button>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
            <div className="flex gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-white/60" />
                <Input
                  placeholder="Numéro de commande (ex: ORD-2024-001)"
                  value={searchOrderId}
                  onChange={(e) => setSearchOrderId(e.target.value)}
                  className="pl-10 bg-white/20 border-white/30 text-white placeholder:text-white/60"
                  onKeyPress={(e) => e.key === 'Enter' && searchOrder()}
                />
              </div>
              <Button
                variant="secondary"
                onClick={searchOrder}
                className="bg-white text-primary hover:bg-white/90"
              >
                Rechercher
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {loading && orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
            <p className="text-muted-foreground animate-pulse">Chargement de vos commandes...</p>
          </div>
        ) : (
          <Tabs defaultValue="tracking" className="space-y-6">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="tracking">Suivi en temps réel</TabsTrigger>
              <TabsTrigger value="orders">Mes commandes</TabsTrigger>
            </TabsList>

            <TabsContent value="tracking" className="space-y-6">
              {selectedOrder ? (
                <>
                  {/* Order Summary */}
                  <Card>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center gap-2">
                          <Package className="h-5 w-5" />
                          Commande {selectedOrder.id}
                        </CardTitle>
                        {getStatusBadge(selectedOrder.status)}
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        <div>
                          <h4 className="font-semibold mb-2">Montant total</h4>
                          <p className="text-2xl font-bold text-primary">
                            {(selectedOrder.total + selectedOrder.deliveryFee).toLocaleString()} FCFA
                          </p>
                        </div>
                        <div>
                          <h4 className="font-semibold mb-2">Pharmacie</h4>
                          <p className="text-sm">{selectedOrder.pharmacy.name}</p>
                        </div>
                        <div>
                          <h4 className="font-semibold mb-2">Livraison estimée</h4>
                          <p className="text-lg font-semibold text-secondary">
                            {selectedOrder.estimatedDelivery}
                          </p>
                        </div>
                        <div className="flex items-end gap-2">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button variant="outline" className="flex-1 gap-2 border-primary text-primary hover:bg-primary/5">
                                <QrCode className="h-4 w-4" />
                                QR Code
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-md p-0 overflow-hidden bg-transparent border-none shadow-none">
                              <DeliveryQRCode
                                orderId={selectedOrder.id}
                                pharmacyName={selectedOrder.pharmacy.name}
                                status={selectedOrder.status}
                              />
                            </DialogContent>
                          </Dialog>

                          <Dialog open={showChat} onOpenChange={setShowChat}>
                            <DialogTrigger asChild>
                              <Button className="flex-1 gap-2 bg-slate-900 hover:bg-slate-800 shadow-lg">
                                <MessageSquare className="h-4 w-4" />
                                Chat Pharmacie
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-[400px] p-0 border-none bg-transparent shadow-none overflow-hidden">
                              <RealtimeChat
                                orderId={selectedOrder.id}
                                onClose={() => setShowChat(false)}
                              />
                            </DialogContent>
                          </Dialog>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Status Timeline */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Statut de la commande</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <Progress
                          value={getProgressPercentage(selectedOrder.status)}
                          className="h-2"
                        />

                        <div className="flex justify-between">
                          {statusSteps.map((step, index) => {
                            const Icon = step.icon;
                            const isCompleted = index <= getStatusIndex(selectedOrder.status);
                            const isCurrent = index === getStatusIndex(selectedOrder.status);

                            return (
                              <div key={step.key} className="flex flex-col items-center text-center">
                                <div className={`
                                w-10 h-10 rounded-full flex items-center justify-center mb-2
                                ${isCompleted
                                    ? 'bg-primary text-white'
                                    : 'bg-muted text-muted-foreground'
                                  }
                                ${isCurrent ? 'ring-2 ring-primary ring-offset-2' : ''}
                              `}>
                                  <Icon className="h-5 w-5" />
                                </div>
                                <span className={`text-xs ${isCompleted ? 'font-semibold' : ''}`}>
                                  {step.label}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Driver Info & Actions & LIVE MAP */}
                  {selectedOrder.driver && selectedOrder.status === 'in_transit' && (
                    <div className="space-y-6">
                      <LiveMap
                        driverLocation={selectedOrder.driver.location}
                        destinationLocation={{ lat: 5.3484, lng: -4.0197 }} // Placeholder for actual delivery lat/lng
                        onDirectionsClick={() => window.open(`https://www.google.com/maps/dir/?api=1&destination=${selectedOrder.driver?.location.lat},${selectedOrder.driver?.location.lng}`, '_blank')}
                      />

                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <Truck className="h-5 w-5" />
                            Votre livreur
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                                <span className="text-xl">👨‍💼</span>
                              </div>
                              <div>
                                <h4 className="font-semibold">{selectedOrder.driver.name}</h4>
                                <div className="flex items-center gap-1">
                                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                                  <span className="text-sm">{selectedOrder.driver.rating}</span>
                                </div>
                              </div>
                            </div>

                            <div className="flex gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => callDriver(selectedOrder.driver!.phone)}
                              >
                                <Phone className="h-4 w-4 mr-2" />
                                Appeler
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  )}

                  {/* Delivery Address */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <MapPin className="h-5 w-5" />
                        Adresse de livraison
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p>{selectedOrder.deliveryAddress}</p>
                    </CardContent>
                  </Card>

                  {/* Order Items */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Détails de la commande</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {selectedOrder.items.map(item => (
                          <div key={item.id} className="flex justify-between items-center">
                            <div>
                              <h4 className="font-medium">{item.name}</h4>
                              <p className="text-sm text-muted-foreground">Quantité: {item.quantity}</p>
                            </div>
                            <span className="font-semibold">
                              {(item.price * item.quantity).toLocaleString()} FCFA
                            </span>
                          </div>
                        ))}

                        <div className="border-t pt-4 space-y-2">
                          <div className="flex justify-between">
                            <span>Sous-total</span>
                            <span>{selectedOrder.total.toLocaleString()} FCFA</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Frais de livraison</span>
                            <span>{selectedOrder.deliveryFee.toLocaleString()} FCFA</span>
                          </div>
                          <div className="flex justify-between font-bold text-lg border-t pt-2">
                            <span>Total</span>
                            <span>{(selectedOrder.total + selectedOrder.deliveryFee).toLocaleString()} FCFA</span>
                          </div>
                        </div>

                        <div className="bg-muted rounded-lg p-4 mt-4">
                          <div className="flex items-center gap-2 mb-2">
                            <CreditCard className="h-4 w-4" />
                            <span className="font-medium">Paiement</span>
                          </div>
                          <div className="flex justify-between">
                            <span>{selectedOrder.paymentMethod}</span>
                            <Badge className={selectedOrder.paymentStatus === 'paid' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>
                              {selectedOrder.paymentStatus === 'paid' ? 'Payé' : 'En attente'}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </>
              ) : (
                <Card>
                  <CardContent className="py-12 text-center">
                    <Package className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <h3 className="text-xl font-semibold mb-2">Aucune commande sélectionnée</h3>
                    <p className="text-muted-foreground">
                      Recherchez votre commande en utilisant votre numéro de commande
                    </p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="orders" className="space-y-6">
              <div className="grid gap-4">
                {orders.map(order => (
                  <Card
                    key={order.id}
                    className={`cursor-pointer transition-all hover:shadow-md ${selectedOrder?.id === order.id ? 'ring-2 ring-primary' : ''
                      }`}
                    onClick={() => setSelectedOrder(order)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-semibold">{order.id}</h4>
                          <p className="text-sm text-muted-foreground">
                            {order.pharmacy.name} • {order.orderTime}
                          </p>
                        </div>
                        <div className="text-right">
                          {getStatusBadge(order.status)}
                          <p className="text-lg font-bold mt-1">
                            {(order.total + order.deliveryFee).toLocaleString()} FCFA
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        )}
      </div>
    </div>
  );
};

export default OrderTracking;