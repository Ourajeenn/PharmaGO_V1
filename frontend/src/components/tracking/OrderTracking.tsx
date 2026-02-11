import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  MapPin,
  Package,
  Truck,
  CheckCircle,
  Clock,
  Phone,
  MessageCircle,
  Navigation,
  User
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import LeafletMap from '@/components/maps/LeafletMap';

interface TrackingInfo {
  id: string;
  status: string;
  driver_name?: string;
  driver_phone?: string;
  current_latitude?: number;
  current_longitude?: number;
  estimated_arrival?: string;
  order_total: number;
  pharmacy_name: string;
  pharmacy_address: string;
  delivery_address: string;
  created_at: string;
  items: Array<{
    medicine_name: string;
    quantity: number;
    price: number;
  }>;
}

const statusSteps = [
  { key: 'pending', label: 'Commande reçue', icon: Package },
  { key: 'confirmed', label: 'Confirmée', icon: CheckCircle },
  { key: 'preparing', label: 'En préparation', icon: Clock },
  { key: 'ready', label: 'Prête', icon: Package },
  { key: 'assigned', label: 'Livreur assigné', icon: User },
  { key: 'picked_up', label: 'Récupérée', icon: Truck },
  { key: 'delivered', label: 'Livrée', icon: CheckCircle },
];

export const OrderTracking: React.FC<{ orderId: string }> = ({ orderId }) => {
  const { user } = useAuth();
  const [trackingInfo, setTrackingInfo] = useState<TrackingInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (orderId) {
      fetchTrackingInfo();
      const interval = setInterval(fetchTrackingInfo, 30000); // Update every 30 seconds
      return () => clearInterval(interval);
    }
  }, [orderId]);

  const fetchTrackingInfo = async () => {
    try {
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .select(`
          *,
          pharmacy:pharmacies(name, address),
          order_items(
            quantity,
            unit_price,
            medicine:medicines(name)
          ),
          delivery_tracking(
            current_latitude,
            current_longitude,
            estimated_arrival,
            status
          ),
          driver:drivers(
            user_id,
            user_profile:user_profiles(name, phone)
          )
        `)
        .eq('id', orderId)
        .single();

      if (orderError) throw orderError;

      setTrackingInfo({
        id: orderData.id,
        status: orderData.status,
        driver_name: orderData.driver?.user_profile?.name,
        driver_phone: orderData.driver?.user_profile?.phone,
        current_latitude: orderData.delivery_tracking?.[0]?.current_latitude,
        current_longitude: orderData.delivery_tracking?.[0]?.current_longitude,
        estimated_arrival: orderData.delivery_tracking?.[0]?.estimated_arrival,
        order_total: orderData.total,
        pharmacy_name: orderData.pharmacy?.name || '',
        pharmacy_address: orderData.pharmacy?.address || '',
        delivery_address: orderData.delivery_address,
        created_at: orderData.created_at,
        items: orderData.order_items?.map((item: any) => ({
          medicine_name: item.medicine?.name || '',
          quantity: item.quantity,
          price: item.unit_price,
        })) || [],
      });
    } catch (error) {
      console.error('Error fetching tracking info:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIndex = (status: string) => {
    return statusSteps.findIndex(step => step.key === status);
  };

  const getProgressPercentage = (status: string) => {
    const index = getStatusIndex(status);
    return ((index + 1) / statusSteps.length) * 100;
  };

  const openInWaze = () => {
    if (trackingInfo?.current_latitude && trackingInfo?.current_longitude) {
      const wazeUrl = `https://waze.com/ul?ll=${trackingInfo.current_latitude},${trackingInfo.current_longitude}&navigate=yes`;
      window.open(wazeUrl, '_blank');
    }
  };

  const callDriver = () => {
    if (trackingInfo?.driver_phone) {
      window.open(`tel:${trackingInfo.driver_phone}`);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </CardContent>
      </Card>
    );
  }

  if (!trackingInfo) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">Commande non trouvée</p>
        </CardContent>
      </Card>
    );
  }

  const currentStatusIndex = getStatusIndex(trackingInfo.status);

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Commande #{trackingInfo.id.slice(-8)}
            </CardTitle>
            <Badge
              variant={trackingInfo.status === 'delivered' ? 'default' : 'secondary'}
              className="capitalize"
            >
              {statusSteps.find(s => s.key === trackingInfo.status)?.label}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Progress value={getProgressPercentage(trackingInfo.status)} className="h-2" />

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Total</p>
                <p className="font-medium">{trackingInfo.order_total.toLocaleString()} FCFA</p>
              </div>
              <div>
                <p className="text-muted-foreground">Pharmacie</p>
                <p className="font-medium">{trackingInfo.pharmacy_name}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Commande passée</p>
                <p className="font-medium">
                  {new Date(trackingInfo.created_at).toLocaleDateString()}
                </p>
              </div>
              {trackingInfo.estimated_arrival && (
                <div>
                  <p className="text-muted-foreground">Arrivée estimée</p>
                  <p className="font-medium">
                    {new Date(trackingInfo.estimated_arrival).toLocaleTimeString()}
                  </p>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Status Timeline */}
      <Card>
        <CardHeader>
          <CardTitle>Suivi de la commande</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {statusSteps.map((step, index) => {
              const StepIcon = step.icon;
              const isCompleted = index <= currentStatusIndex;
              const isCurrent = index === currentStatusIndex;

              return (
                <div key={step.key} className="flex items-center gap-3">
                  <div className={`flex h-8 w-8 items-center justify-center rounded-full ${isCompleted
                      ? isCurrent
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-green-500 text-white'
                      : 'bg-muted text-muted-foreground'
                    }`}>
                    <StepIcon className="h-4 w-4" />
                  </div>
                  <div className="flex-1">
                    <p className={`font-medium ${isCompleted ? 'text-foreground' : 'text-muted-foreground'}`}>
                      {step.label}
                    </p>
                  </div>
                  {isCompleted && (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Driver Info & Actions */}
      {trackingInfo.driver_name && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Votre livreur
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Avatar>
                  <AvatarFallback>
                    {trackingInfo.driver_name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{trackingInfo.driver_name}</p>
                  <p className="text-sm text-muted-foreground">Livreur PharmaGo</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={callDriver}>
                  <Phone className="h-4 w-4 mr-1" />
                  Appeler
                </Button>
                <Button variant="outline" size="sm">
                  <MessageCircle className="h-4 w-4 mr-1" />
                  Message
                </Button>
                {trackingInfo.current_latitude && trackingInfo.current_longitude && (
                  <Button variant="outline" size="sm" onClick={openInWaze}>
                    <Navigation className="h-4 w-4 mr-1" />
                    Waze
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Map Visualization */}
      {(trackingInfo.current_latitude && trackingInfo.current_longitude) && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Navigation className="h-5 w-5" />
              Suivi en direct
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0 overflow-hidden">
            <LeafletMap
              position={{
                lat: trackingInfo.current_latitude,
                lng: trackingInfo.current_longitude
              }}
              // Note: We don't have destination coords in trackingInfo easily available unless we geocode the address
              // For now just showing driver position
              height="350px"
            />
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
          <p>{trackingInfo.delivery_address}</p>
        </CardContent>
      </Card>

      {/* Order Items */}
      <Card>
        <CardHeader>
          <CardTitle>Détails de la commande</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {trackingInfo.items.map((item, index) => (
              <div key={index} className="flex items-center justify-between py-2">
                <div>
                  <p className="font-medium">{item.medicine_name}</p>
                  <p className="text-sm text-muted-foreground">Quantité: {item.quantity}</p>
                </div>
                <p className="font-medium">{(item.price * item.quantity).toLocaleString()} FCFA</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};