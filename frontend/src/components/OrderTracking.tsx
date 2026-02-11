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
  CreditCard
} from "lucide-react";

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
  const [searchOrderId, setSearchOrderId] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [orders] = useState<Order[]>(mockOrders);

  useEffect(() => {
    // Auto-select the first order if available
    if (orders.length > 0 && !selectedOrder) {
      setSelectedOrder(orders[0]);
    }
  }, [orders, selectedOrder]);

  const searchOrder = () => {
    const order = orders.find(o => o.id === searchOrderId);
    if (order) {
      setSelectedOrder(order);
      setSearchOrderId("");
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
      preparing: "bg-yellow-100 text-yellow-800 border-yellow-200",
      ready: "bg-blue-100 text-blue-800 border-blue-200",
      picked_up: "bg-purple-100 text-purple-800 border-purple-200",
      in_transit: "bg-orange-100 text-orange-800 border-orange-200",
      delivered: "bg-green-100 text-green-800 border-green-200",
      cancelled: "bg-red-100 text-red-800 border-red-200"
    };

    const labels = {
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
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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

                {/* Driver Info & Actions */}
                {selectedOrder.driver && selectedOrder.status === 'in_transit' && (
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
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openInWaze(
                              selectedOrder.driver!.location.lat,
                              selectedOrder.driver!.location.lng
                            )}
                          >
                            <Navigation className="h-4 w-4 mr-2" />
                            Waze
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
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
      </div>
    </div>
  );
};

export default OrderTracking;