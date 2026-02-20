import React, { useState, useEffect, useRef, useCallback } from 'react';
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
  User,
  Radio
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import LeafletMap from '@/components/maps/LeafletMap';
import { toast } from 'sonner';
import { formatDistanceToNow, parseISO, differenceInMinutes } from 'date-fns';
import { fr } from 'date-fns/locale';

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
  const [isLive, setIsLive] = useState(false);
  const [etaMinutes, setEtaMinutes] = useState<number | null>(null);
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);
  const prevStatusRef = useRef<string | null>(null);

  // ── Demo mode mock data ──────────────────────────────────────────────────
  const DEMO_STATUSES = ['pending', 'confirmed', 'preparing', 'ready', 'assigned', 'picked_up', 'delivered'];
  const mockTrackingData: TrackingInfo = {
    id: 'demo-order-12345678',
    status: 'assigned',
    driver_name: 'Kouadio Bertin',
    driver_phone: '+225 0701020304',
    current_latitude: 5.3600,
    current_longitude: -4.0083,
    estimated_arrival: new Date(Date.now() + 18 * 60 * 1000).toISOString(),
    order_total: 12500,
    pharmacy_name: 'Pharmacie Centrale Abidjan',
    pharmacy_address: 'Plateau, Avenue Chardy',
    delivery_address: 'Cocody, Rue des Jardins, Villa 14',
    created_at: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
    items: [
      { medicine_name: 'Amoxicilline 500mg', quantity: 1, price: 2500 },
      { medicine_name: 'Paracétamol 1000mg', quantity: 2, price: 800 },
      { medicine_name: 'Ibuprofène 400mg', quantity: 1, price: 1500 },
    ],
  };

  // Initial fetch of full order info
  const fetchTrackingInfo = async () => {
    try {
      const { data: orderData, error: orderError } = await (supabase as any)
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

  // Subscribe to realtime GPS updates on delivery_tracking table
  const subscribeToRealtime = () => {
    // Subscribe to order status changes
    const orderChannel = supabase
      .channel(`order-tracking-${orderId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'delivery_tracking',
          filter: `order_id=eq.${orderId}`,
        },
        (payload) => {
          const updated = payload.new as any;
          setTrackingInfo((prev) =>
            prev
              ? {
                ...prev,
                current_latitude: updated.current_latitude ?? prev.current_latitude,
                current_longitude: updated.current_longitude ?? prev.current_longitude,
                estimated_arrival: updated.estimated_arrival ?? prev.estimated_arrival,
              }
              : prev
          );
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'orders',
          filter: `id=eq.${orderId}`,
        },
        (payload) => {
          const updated = payload.new as any;
          setTrackingInfo((prev) =>
            prev ? { ...prev, status: updated.status ?? prev.status } : prev
          );
        }
      )
      .subscribe((status) => {
        setIsLive(status === 'SUBSCRIBED');
      });

    channelRef.current = orderChannel;
  };

  // ── ETA countdown (ticks every minute) ────────────────────────────────
  useEffect(() => {
    const computeEta = () => {
      if (!trackingInfo?.estimated_arrival) { setEtaMinutes(null); return; }
      const mins = differenceInMinutes(parseISO(trackingInfo.estimated_arrival), new Date());
      setEtaMinutes(mins > 0 ? mins : 0);
    };
    computeEta();
    const interval = setInterval(computeEta, 60_000);
    return () => clearInterval(interval);
  }, [trackingInfo?.estimated_arrival]);

  useEffect(() => {
    if (orderId === 'demo') {
      // Demo mode: inject mock data and cycle through statuses every 4s
      setTrackingInfo(mockTrackingData);
      setIsLive(true);
      setLoading(false);

      let idx = DEMO_STATUSES.indexOf(mockTrackingData.status);
      const interval = setInterval(() => {
        idx = Math.min(idx + 1, DEMO_STATUSES.length - 1);
        const nextStatus = DEMO_STATUSES[idx];
        setTrackingInfo(prev => prev ? { ...prev, status: nextStatus } : prev);
        const label = statusSteps.find(s => s.key === nextStatus)?.label;
        if (label) toast.success(`🚚 Statut mis à jour : ${label}`);
        if (idx === DEMO_STATUSES.length - 1) clearInterval(interval);
      }, 4000);
      return () => clearInterval(interval);
    }

    if (!orderId) return;
    fetchTrackingInfo();
    subscribeToRealtime();

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
      setIsLive(false);
    };
  }, [orderId]);

  // ── Status-change toasts ────────────────────────────────────────────────
  useEffect(() => {
    if (!trackingInfo?.status) return;
    const current = trackingInfo.status;
    if (prevStatusRef.current && prevStatusRef.current !== current) {
      const label = statusSteps.find(s => s.key === current)?.label;
      if (label) toast.success(`🚚 Statut mis à jour : ${label}`);
    }
    prevStatusRef.current = current;
  }, [trackingInfo?.status]);

  const getStatusIndex = (status: string) =>
    statusSteps.findIndex((step) => step.key === status);

  const getProgressPercentage = (status: string) => {
    const index = getStatusIndex(status);
    return ((index + 1) / statusSteps.length) * 100;
  };

  const openInWaze = () => {
    if (trackingInfo?.current_latitude && trackingInfo?.current_longitude) {
      window.open(
        `https://waze.com/ul?ll=${trackingInfo.current_latitude},${trackingInfo.current_longitude}&navigate=yes`,
        '_blank'
      );
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
  const isDelivering = ['assigned', 'picked_up'].includes(trackingInfo.status);

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
            <div className="flex items-center gap-2">
              {/* Live indicator */}
              {isDelivering && (
                <div className={`flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full
                  ${isLive
                    ? 'bg-green-100 text-green-700'
                    : 'bg-slate-100 text-slate-500'}`}
                >
                  <Radio className={`h-3.5 w-3.5 ${isLive ? 'animate-pulse' : ''}`} />
                  {isLive ? 'En direct' : 'Connexion...'}
                </div>
              )}
              <Badge
                variant={trackingInfo.status === 'delivered' ? 'default' : 'secondary'}
                className="capitalize"
              >
                {statusSteps.find((s) => s.key === trackingInfo.status)?.label}
              </Badge>
            </div>
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
                <div className="bg-primary/5 border border-primary/20 rounded-lg p-3 text-center">
                  <p className="text-xs text-muted-foreground mb-0.5">Arrivée estimée</p>
                  {etaMinutes !== null && etaMinutes > 0 ? (
                    <p className="font-bold text-primary text-lg">
                      Dans {etaMinutes} min
                    </p>
                  ) : etaMinutes === 0 ? (
                    <p className="font-bold text-green-600 text-lg">Arrivée imminente !</p>
                  ) : (
                    <p className="font-medium">
                      {new Date(trackingInfo.estimated_arrival).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Map — shown when driver is en route */}
      {isDelivering && trackingInfo.current_latitude && trackingInfo.current_longitude && (
        <Card className="overflow-hidden border-green-200">
          <CardHeader className="pb-2 bg-green-50/50">
            <CardTitle className="flex items-center gap-2 text-base">
              <Navigation className="h-4 w-4 text-green-600" />
              Suivi GPS en direct
              {isLive && (
                <span className="ml-1 relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500"></span>
                </span>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0 overflow-hidden">
            <LeafletMap
              position={{
                lat: trackingInfo.current_latitude,
                lng: trackingInfo.current_longitude,
              }}
              height="350px"
            />
          </CardContent>
        </Card>
      )}

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
                  <div
                    className={`flex h-8 w-8 items-center justify-center rounded-full transition-colors
                    ${isCompleted
                        ? isCurrent
                          ? 'bg-primary text-primary-foreground ring-4 ring-primary/20'
                          : 'bg-green-500 text-white'
                        : 'bg-muted text-muted-foreground'
                      }`}
                  >
                    <StepIcon className="h-4 w-4" />
                  </div>
                  <div className="flex-1">
                    <p className={`font-medium ${isCompleted ? 'text-foreground' : 'text-muted-foreground'}`}>
                      {step.label}
                    </p>
                  </div>
                  {isCompleted && <CheckCircle className="h-4 w-4 text-green-500" />}
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
                    {trackingInfo.driver_name.split(' ').map((n) => n[0]).join('')}
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