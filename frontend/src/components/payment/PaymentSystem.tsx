import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import Header from "@/components/core/Header";
import Footer from "@/components/core/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCart } from "@/contexts/CartContext";
import ClickCollectQR from "@/components/cart/ClickCollectQR";
import { USSDSimulator } from "@/components/payment/USSDSimulator";
import OrderInvoice from "@/components/payment/OrderInvoice";
import { PaymentGatewayService } from "@/services/PaymentGatewayService";
import { AddressMapSelector } from "@/components/map/AddressMapSelector";
import { ScannerMutuelle } from "@/components/payment/ScannerMutuelle";
import {
  ArrowLeft,
  CreditCard,
  Smartphone,
  MapPin,
  ShoppingCart,
  CheckCircle,
  AlertCircle,
  Shield,
  Clock,
  Truck,
  Receipt,
  Wallet,
  Zap,
  Info,
  Loader2
} from "lucide-react";
import { toast } from "sonner";
import { usePushNotifications } from "@/hooks/usePushNotifications";
import { InsuranceService, InsurancePartner } from "@/services/InsuranceService";
import { useLoyalty } from "@/hooks/useLoyalty";
import { Gift, Fingerprint } from "lucide-react";
import { useBiometrics } from "@/contexts/BiometricsContext";

interface PaymentMethod {
  id: string;
  name: string;
  icon: string;
  description: string;
  processingTime: string;
  available: boolean;
}

const paymentMethods: PaymentMethod[] = [
  {
    id: 'orange_money',
    name: 'Orange Money',
    icon: '🟠',
    description: 'Paiement via Orange Money',
    processingTime: 'Instantané',
    available: true
  },
  {
    id: 'wave',
    name: 'Wave',
    icon: '💙',
    description: 'Paiement via l\'application Wave',
    processingTime: 'Instantané',
    available: true
  },
  {
    id: 'mtn_money',
    name: 'MTN Mobile Money',
    icon: '🟡',
    description: 'Paiement via MTN Money',
    processingTime: 'Instantané',
    available: true
  },
  {
    id: 'pharmago_wallet',
    name: 'Wallet PharmaGo',
    icon: '🪙',
    description: 'Payez avec votre solde PharmaGo',
    processingTime: 'Instantané',
    available: true
  },
  {
    id: 'cash_on_delivery',
    name: 'Paiement à la livraison',
    icon: '💰',
    description: 'Payez en espèces lors de la livraison',
    processingTime: 'À la livraison',
    available: true
  }
];

interface PaymentSystemProps {
  onBackToHome?: () => void;
}

const PaymentSystem = ({ onBackToHome }: PaymentSystemProps) => {
  const navigate = useNavigate();
  const { notify } = usePushNotifications();
  const { items, getTotalPrice, getDiscountedTotal, groupByPharmacy, clearCart, selectedInsurance, setInsurance, coverageRate, setCoverageRate, pointsToUse, setPointsToUse } = useCart();
  const { points: availablePoints, earnPoints, redeemPoints } = useLoyalty();
  const [usePoints, setUsePoints] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('orange_money');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [useCurrentLocation, setUseCurrentLocation] = useState(false);
  const [orderNotes, setOrderNotes] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentStep, setPaymentStep] = useState<'details' | 'payment' | 'confirmation' | 'pickup_ready'>('details');
  const [orderId, setOrderId] = useState<string>('');
  const [showUSSD, setShowUSSD] = useState(false);
  const [insurancePartners, setInsurancePartners] = useState<InsurancePartner[]>([]);
  const [insuranceCardNumber, setInsuranceCardNumber] = useState('');
  const [isVerifyingInsurance, setIsVerifyingInsurance] = useState(false);
  const [deliveryLat, setDeliveryLat] = useState<number | undefined>(undefined);
  const [deliveryLng, setDeliveryLng] = useState<number | undefined>(undefined);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [walletBalance, setWalletBalance] = useState(15000); // Mock balance

  // Mobile money provider IDs
  const mobileMoneyProviders = ['orange_money', 'wave', 'mtn_money', 'moov_money'];
  const isMobileMoney = mobileMoneyProviders.includes(selectedPaymentMethod);

  // Click & Collect mode
  const [deliveryMode, setDeliveryMode] = useState<'delivery' | 'pickup'>('delivery');
  const [selectedPharmacy, setSelectedPharmacy] = useState<{ name: string; address: string } | null>(null);

  const { user, profile } = useAuth();
  const { isEnabled: biometricsEnabled, unlock: unlockBiometrics } = useBiometrics();

  // Auto-load insurance from profile
  useEffect(() => {
    const loadProfileInsurance = async () => {
      if (user?.id && profile?.role === 'patient' && !selectedInsurance) {
        try {
          const { data, error } = await supabase
            .from('patients')
            .select('insurance_id, insurance_name')
            .eq('user_id', user.id)
            .single();

          if (data && data.insurance_id) {
            console.log("Auto-loading insurance from profile:", data.insurance_name);
            setInsuranceCardNumber(data.insurance_id);

            // Try to match with a partner
            const partners = await InsuranceService.getPartners();
            const partner = partners.find(p => p.id === data.insurance_name?.toLowerCase() || p.name === data.insurance_name);

            if (partner) {
              setInsurance(partner);
              // Verify immediately
              setIsVerifyingInsurance(true);
              const result = await InsuranceService.verifyCoverage(partner.id, data.insurance_id);
              if (result.active) {
                setCoverageRate(result.rate);
                toast.success(`Assurance ${partner.name} appliquée automatiquement.`);
              }
              setIsVerifyingInsurance(false);
            }
          }
        } catch (err) {
          console.error("Error auto-loading insurance:", err);
        }
      }
    };
    loadProfileInsurance();
  }, [user, profile, selectedInsurance]);

  const pharmacyGroups = groupByPharmacy();
  const totalAmount = getTotalPrice();

  // Import delivery fee calculator
  const [deliveryUrgency, setDeliveryUrgency] = useState<'standard' | 'express' | 'urgent'>('standard');
  const [deliveryFeeBreakdown, setDeliveryFeeBreakdown] = useState<{
    baseFee: number;
    distanceFee: number;
    urgencyFee: number;
    nightFee: number;
    weatherFee: number;
    total: number;
    estimatedTime: string;
  } | null>(null);

  // Calculate delivery fee with breakdown
  useEffect(() => {
    const calculateFee = async () => {
      const { calculateDeliveryFee } = await import('@/lib/deliveryFeeCalculator');
      const breakdown = calculateDeliveryFee({
        pharmacyCount: Object.keys(pharmacyGroups).length,
        urgency: deliveryUrgency,
        timeOfDay: new Date(),
        distance: 5, // Default distance
      });
      setDeliveryFeeBreakdown(breakdown);
    };
    calculateFee();

    const fetchPartners = async () => {
      const partners = await InsuranceService.getPartners();
      setInsurancePartners(partners);
    };
    fetchPartners();
  }, [pharmacyGroups, deliveryUrgency]);

  const handleVerifyInsurance = async () => {
    if (!selectedInsurance) return;
    if (!insuranceCardNumber) {
      toast.error("Veuillez entrer votre numéro de carte");
      return;
    }

    setIsVerifyingInsurance(true);
    try {
      const result = await InsuranceService.verifyCoverage(selectedInsurance.id, insuranceCardNumber);
      if (result.active) {
        setCoverageRate(result.rate);
        toast.success(`Couverture active : ${result.rate}% pris en charge`);
      } else {
        setCoverageRate(0);
        toast.error("Couverture invalide ou expirée");
      }
    } catch (err) {
      toast.error("Erreur lors de la vérification");
    } finally {
      setIsVerifyingInsurance(false);
    }
  };

  const deliveryFee = deliveryMode === 'pickup' ? 0 : (deliveryFeeBreakdown?.total || Object.keys(pharmacyGroups).length * 500);
  const totalWithInsurance = getDiscountedTotal() + deliveryFee;
  const finalTotal = totalWithInsurance;

  useEffect(() => {
    if (useCurrentLocation && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setDeliveryAddress(`Votre position actuelle (${position.coords.latitude.toFixed(4)}, ${position.coords.longitude.toFixed(4)})`);
        },
        () => {
          setUseCurrentLocation(false);
        }
      );
    }
  }, [useCurrentLocation]);


  // Main payment handler — launches CinetPay for mobile money, or processes directly
  const handlePayment = async () => {
    if (!deliveryAddress || (selectedPaymentMethod !== 'cash_on_delivery' && !phoneNumber && selectedPaymentMethod !== 'pharmago_wallet')) {
      toast.error("Veuillez remplir tous les champs obligatoires");
      return;
    }

    if (selectedPaymentMethod === 'pharmago_wallet') {
      if (walletBalance < finalTotal) {
        toast.error("Solde insuffisant dans votre Wallet.");
        return;
      }

      // Biometric Challenge
      if (biometricsEnabled) {
        const success = await unlockBiometrics();
        if (!success) {
          toast.error("Authentification biométrique échouée.");
          return;
        }
      }

      setIsProcessing(true);
      await processOrder(`WAL-${Date.now()}`);
      return;
    }

    // If mobile money → Show redirection simulation
    if (isMobileMoney) {
      setIsRedirecting(true);

      // Simulate app redirection delay
      setTimeout(() => {
        setIsRedirecting(false);
        setShowUSSD(true);
      }, 3000);

      return;
    }

    // For non-mobile-money methods, process directly
    await processOrder(`CMD-${Date.now()}`);
  };

  // Called after Payment Gateway success or directly for non-mobile-money
  const processOrder = useCallback(async (forcedOrderId?: string) => {
    setShowUSSD(false);
    setIsProcessing(true);
    setPaymentStep('payment');

    try {
      // Brief processing delay for non-USSD methods
      if (!mobileMoneyProviders.includes(selectedPaymentMethod)) {
        await new Promise(resolve => setTimeout(resolve, 2000));
      }

      const newOrderId = forcedOrderId || `CMD-${Math.floor(Math.random() * 1000000)}`;
      let finalOrderId = newOrderId;

      // Create Order in Supabase using OrderService
      if (user) {
        const { OrderService } = await import('@/services/OrderService');

        const orderParams = {
          patient_id: user.id,
          total: finalTotal,
          payment_method: selectedPaymentMethod,
          payment_status: selectedPaymentMethod === 'cash_on_delivery' ? 'pending' : 'completed',
          delivery_address: deliveryAddress,
          notes: orderNotes,
          items: items.map(item => ({
            medicine_id: item.medicine.id,
            quantity: item.quantity,
            unit_price: item.price,
            pharmacy_id: item.pharmacy_id
          })),
          insurance_id: selectedInsurance?.id,
          insurance_card_number: insuranceCardNumber,
          coverage_rate: coverageRate,
          amount_paid: finalTotal,
          delivery_lat: deliveryLat,
          delivery_lng: deliveryLng
        };

        const data = await OrderService.createOrder(orderParams);

        finalOrderId = data.id.substring(0, 8).toUpperCase();
        setOrderId(finalOrderId);

        // INSERT notification into Supabase (triggers realtime popover)
        try {
          await (supabase as any)
            .from('notifications')
            .insert({
              user_id: user.id,
              title: '✅ Commande confirmée',
              message: `Votre commande #${finalOrderId} de ${finalTotal.toLocaleString()} FCFA a été confirmée.`,
              type: 'success',
              read: false,
              metadata: { order_id: finalOrderId, amount: finalTotal }
            });
        } catch (notifError) {
          console.warn('Notification insert failed (non-blocking):', notifError);
        }

        // Trigger browser push notification
        try {
          notify('orderConfirmed', finalOrderId);
        } catch (pushError) {
          console.warn('Push notification failed (non-blocking):', pushError);
        }
      } else {
        setOrderId(newOrderId);
      }

      // Success State
      if (deliveryMode === 'pickup') {
        setPaymentStep('pickup_ready');
      } else {
        setPaymentStep('confirmation');
      }


      toast.success("Paiement effectué avec succès !");

      // Success micro-interaction (Confetti simulation)
      const { confetti } = await import('canvas-confetti').catch(() => ({ confetti: null }));
      if (confetti) {
        confetti({
          particleCount: 150,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#0EA5E9', '#10B981', '#F59E0B']
        });
      }

      // Earn points for this order (on the raw amount before loyalty discount)
      await earnPoints(totalAmount);

      // If points were used, deduct them from DB
      if (pointsToUse > 0) {
        await redeemPoints(pointsToUse);
      }

      if (selectedPaymentMethod !== 'cash_on_delivery') {
        clearCart();
        setPointsToUse(0);
      }

      // Trigger driver notification simulation
      try {
        const { data: drivers } = await supabase
          .from('profiles')
          .select('id')
          .eq('role', 'driver');

        if (drivers && drivers.length > 0) {
          // Notify the first available driver for simulation
          await supabase.from('notifications').insert({
            user_id: drivers[0].id,
            title: '🏁 Nouvelle livraison disponible',
            message: `Une nouvelle commande #${finalOrderId} est prête à être récupérée.`,
            type: 'info',
            metadata: { order_id: finalOrderId, pharmacy_id: items[0].pharmacy_id }
          });
          toast.info("Un livreur a été notifié pour votre commande.");
        }
      } catch (driverErr) {
        console.warn('Driver notification failed:', driverErr);
      }

    } catch (error) {
      console.error('Payment Error:', error);
      toast.error("Erreur lors du traitement de la commande");
      setPaymentStep('details');
    } finally {
      setIsProcessing(false);
    }
  }, [user, finalTotal, selectedPaymentMethod, deliveryAddress, deliveryMode, pharmacyGroups, items, orderNotes, clearCart, phoneNumber]);

  const getPaymentMethodById = (id: string) => {
    return paymentMethods.find(method => method.id === id);
  };

  if (items.length === 0 && paymentStep === 'details') {
    return (
      <div className="min-h-screen bg-background">
        <div className="bg-gradient-to-r from-primary to-secondary text-white">
          <div className="container mx-auto px-4 py-6">
            <div className="flex items-center gap-4">
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
              <h1 className="text-3xl font-bold">Paiement</h1>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8">
          <Card>
            <CardContent className="py-12 text-center">
              <ShoppingCart className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-xl font-semibold mb-2">Votre panier est vide</h3>
              <p className="text-muted-foreground mb-4">
                Ajoutez des médicaments à votre panier pour procéder au paiement
              </p>
              <Button onClick={onBackToHome}>
                Retour aux produits
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary to-secondary text-white">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-4">
            {onBackToHome && paymentStep === 'details' && (
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
            <h1 className="text-3xl font-bold">
              {paymentStep === 'details' && 'Paiement'}
              {paymentStep === 'payment' && 'Traitement du paiement'}
              {paymentStep === 'confirmation' && 'Confirmation'}
            </h1>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {paymentStep === 'details' && (
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Left Column - Order Details */}
            <div className="lg:col-span-2 space-y-6">
              {/* Delivery Mode Toggle */}
              <Card className="border-2 border-primary/20">
                <CardContent className="pt-6">
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      onClick={() => setDeliveryMode('delivery')}
                      className={`p-4 rounded-lg border-2 transition-all flex flex-col items-center gap-2 ${deliveryMode === 'delivery'
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-gray-200 hover:border-gray-300'
                        }`}
                    >
                      <Truck className="h-8 w-8" />
                      <span className="font-medium">Livraison</span>
                      <span className="text-xs text-muted-foreground">30-45 min</span>
                    </button>
                    <button
                      onClick={() => {
                        setDeliveryMode('pickup');
                        // Auto-select first pharmacy
                        const firstPharmacy = Object.values(pharmacyGroups)[0]?.[0];
                        if (firstPharmacy) {
                          setSelectedPharmacy({
                            name: firstPharmacy.pharmacy_name,
                            address: 'Cocody, Abidjan' // Default address
                          });
                        }
                      }}
                      className={`p-4 rounded-lg border-2 transition-all flex flex-col items-center gap-2 ${deliveryMode === 'pickup'
                        ? 'border-green-500 bg-green-50 text-green-700'
                        : 'border-gray-200 hover:border-gray-300'
                        }`}
                    >
                      <MapPin className="h-8 w-8" />
                      <span className="font-medium">Click & Collect</span>
                      <span className="text-xs text-muted-foreground">Gratuit • 15 min</span>
                    </button>
                  </div>
                </CardContent>
              </Card>

              <Tabs defaultValue={deliveryMode === 'delivery' ? 'delivery' : 'payment'} className="space-y-6">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="delivery">Livraison</TabsTrigger>
                  <TabsTrigger value="payment">Paiement</TabsTrigger>
                </TabsList>

                <TabsContent value="delivery" className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <MapPin className="h-5 w-5" />
                        Adresse de livraison
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="current-location"
                          checked={useCurrentLocation}
                          onCheckedChange={(checked) => setUseCurrentLocation(checked as boolean)}
                        />
                        <Label htmlFor="current-location">Utiliser ma position actuelle</Label>
                      </div>

                      <div>
                        <Label htmlFor="address">Adresse complète</Label>
                        <Input
                          id="address"
                          placeholder="Entrez votre adresse de livraison"
                          value={deliveryAddress}
                          onChange={(e) => setDeliveryAddress(e.target.value)}
                          disabled={useCurrentLocation}
                        />
                      </div>

                      <div className="pt-2 border-t border-slate-100">
                        <Label className="text-sm font-medium flex items-center gap-2 mb-2">
                          <MapPin className="h-4 w-4 text-primary" />
                          Position précise sur la carte (Optionnel)
                        </Label>
                        <p className="text-xs text-muted-foreground mb-4">
                          Déplacez-vous sur la carte et cliquez sur votre position exacte pour aider le livreur.
                        </p>
                        <AddressMapSelector
                          onLocationSelect={(lat, lng) => {
                            setDeliveryLat(lat);
                            setDeliveryLng(lng);
                          }}
                        />
                      </div>

                      {/* Urgency Selection */}
                      <div className="space-y-3">
                        <Label className="text-sm font-medium flex items-center gap-2">
                          <Zap className="h-4 w-4" />
                          Urgence de livraison
                        </Label>
                        <Select value={deliveryUrgency} onValueChange={(value: 'standard' | 'express' | 'urgent') => setDeliveryUrgency(value)}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="standard">
                              <div className="flex items-center gap-2">
                                <Clock className="h-4 w-4" />
                                <div>
                                  <p className="font-medium">Standard (30-45 min)</p>
                                  <p className="text-xs text-muted-foreground">Livraison normale</p>
                                </div>
                              </div>
                            </SelectItem>
                            <SelectItem value="express">
                              <div className="flex items-center gap-2">
                                <Zap className="h-4 w-4" />
                                <div>
                                  <p className="font-medium">Express (15-25 min) +1000 FCFA</p>
                                  <p className="text-xs text-muted-foreground">Livraison rapide</p>
                                </div>
                              </div>
                            </SelectItem>
                            <SelectItem value="urgent">
                              <div className="flex items-center gap-2">
                                <AlertCircle className="h-4 w-4" />
                                <div>
                                  <p className="font-medium">Urgent (10-15 min) +2000 FCFA</p>
                                  <p className="text-xs text-muted-foreground">Livraison immédiate</p>
                                </div>
                              </div>
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Delivery Fee Breakdown */}
                      {deliveryFeeBreakdown && (
                        <Card className="bg-muted/50">
                          <CardContent className="pt-4 space-y-2">
                            <div className="flex items-center gap-2 mb-2">
                              <Info className="h-4 w-4 text-muted-foreground" />
                              <p className="text-sm font-medium">Détail des frais de livraison</p>
                            </div>
                            {deliveryFeeBreakdown.baseFee > 0 && (
                              <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Frais de base ({Object.keys(pharmacyGroups).length} pharmacie(s))</span>
                                <span>{deliveryFeeBreakdown.baseFee.toLocaleString('fr-FR')} FCFA</span>
                              </div>
                            )}
                            {deliveryFeeBreakdown.distanceFee > 0 && (
                              <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Frais de distance</span>
                                <span>{deliveryFeeBreakdown.distanceFee.toLocaleString('fr-FR')} FCFA</span>
                              </div>
                            )}
                            {deliveryFeeBreakdown.urgencyFee > 0 && (
                              <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Frais d'urgence</span>
                                <span>{deliveryFeeBreakdown.urgencyFee.toLocaleString('fr-FR')} FCFA</span>
                              </div>
                            )}
                            {deliveryFeeBreakdown.nightFee > 0 && (
                              <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Frais de nuit (21h-6h)</span>
                                <span>{deliveryFeeBreakdown.nightFee.toLocaleString('fr-FR')} FCFA</span>
                              </div>
                            )}
                            {deliveryFeeBreakdown.weatherFee > 0 && (
                              <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Supplément météo</span>
                                <span>{deliveryFeeBreakdown.weatherFee.toLocaleString('fr-FR')} FCFA</span>
                              </div>
                            )}
                            <div className="flex justify-between text-sm font-medium pt-2 border-t">
                              <span>Temps estimé</span>
                              <span className="text-green-600">{deliveryFeeBreakdown.estimatedTime}</span>
                            </div>
                          </CardContent>
                        </Card>
                      )}
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Receipt className="h-5 w-5" />
                        Informations supplémentaires
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <Label htmlFor="notes">Instructions spéciales (optionnel)</Label>
                        <Input
                          id="notes"
                          placeholder="Étage, appartement, instructions pour le livreur..."
                          value={orderNotes}
                          onChange={(e) => setOrderNotes(e.target.value)}
                        />
                      </div>

                      <div className="bg-accent/10 rounded-lg p-4 border border-accent/20">
                        <div className="flex items-center gap-2 mb-2">
                          <Truck className="h-4 w-4 text-accent" />
                          <span className="font-medium">Informations de livraison</span>
                        </div>
                        <ul className="text-sm space-y-1">
                          <li>• Livraison estimée: 30-45 minutes</li>
                          <li>• Frais de livraison: {deliveryFee.toLocaleString()} FCFA</li>
                          <li>• Livraison par pharmacie partenaire</li>
                        </ul>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="payment" className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <CreditCard className="h-5 w-5" />
                        Mode de paiement
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <RadioGroup value={selectedPaymentMethod} onValueChange={setSelectedPaymentMethod}>
                        <div className="space-y-4">
                          {paymentMethods.map(method => (
                            <div key={method.id} className={`flex items-center space-x-4 p-4 rounded-lg border ${method.available
                              ? 'hover:bg-muted/50 cursor-pointer'
                              : 'opacity-50 cursor-not-allowed bg-muted/20'
                              } ${selectedPaymentMethod === method.id ? 'bg-primary/5 border-primary' : ''}`}>
                              <RadioGroupItem
                                value={method.id}
                                id={method.id}
                                disabled={!method.available}
                              />
                              <Label htmlFor={method.id} className="flex-1 cursor-pointer">
                                <div className="flex items-center gap-3">
                                  <span className="text-2xl">{method.icon}</span>
                                  <div>
                                    <div className="font-medium flex items-center gap-2">
                                      {method.name}
                                      {!method.available && (
                                        <Badge variant="outline" className="text-xs">
                                          Bientôt disponible
                                        </Badge>
                                      )}
                                    </div>
                                    <div className="text-sm text-muted-foreground">
                                      {method.description}
                                    </div>
                                    <div className="text-xs text-secondary">
                                      Traitement: {method.processingTime}
                                    </div>
                                  </div>
                                </div>
                              </Label>
                            </div>
                          ))}
                        </div>
                      </RadioGroup>

                      {/* Insurance / Tiers-Payant Section */}
                      <div className="mt-8 border-t pt-6">
                        <div className="flex items-center gap-2 mb-4">
                          <Shield className="h-5 w-5 text-primary" />
                          <h3 className="font-bold text-lg">Assurance (Tiers-Payant)</h3>
                        </div>

                        <div className="space-y-4">
                          <div className="flex gap-4">
                            <div className="flex-1">
                              <Label htmlFor="insurance-select">Sélectionnez votre assurance</Label>
                              <Select
                                value={selectedInsurance?.id || "none"}
                                onValueChange={(val) => {
                                  if (val === "none") {
                                    setInsurance(null);
                                    setCoverageRate(0);
                                  } else {
                                    const partner = insurancePartners.find(p => p.id === val);
                                    setInsurance(partner || null);
                                  }
                                }}
                              >
                                <SelectTrigger id="insurance-select">
                                  <SelectValue placeholder="Aucune assurance" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="none">Aucune assurance</SelectItem>
                                  {insurancePartners.map(p => (
                                    <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>

                            {selectedInsurance && (
                              <div className="flex-1">
                                <div className="flex justify-between items-center mb-1">
                                  <Label htmlFor="card-number">Numéro de carte</Label>
                                  <ScannerMutuelle
                                    onScanComplete={(cardNumber, _company) => {
                                      setInsuranceCardNumber(cardNumber);
                                      // Auto-verify when scanned
                                      if (selectedInsurance?.id === 'cmu') setCoverageRate(70);
                                      else if (selectedInsurance?.id === 'ascoma') setCoverageRate(80);
                                      else if (selectedInsurance?.id === 'mci') setCoverageRate(100);
                                      else setCoverageRate(50);
                                      toast.success("Carte détectée et validée !");
                                    }}
                                  />
                                </div>
                                <div className="flex gap-2">
                                  <Input
                                    id="card-number"
                                    placeholder="Ex: 00123456"
                                    value={insuranceCardNumber}
                                    onChange={(e) => setInsuranceCardNumber(e.target.value)}
                                  />
                                  <Button
                                    variant="outline"
                                    onClick={handleVerifyInsurance}
                                    disabled={isVerifyingInsurance}
                                  >
                                    {isVerifyingInsurance ? <Loader2 className="animate-spin h-4 w-4" /> : "Vérifier"}
                                  </Button>
                                </div>
                              </div>
                            )}
                          </div>

                          {coverageRate > 0 && selectedInsurance && (
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-center gap-3">
                              <CheckCircle className="h-5 w-5 text-blue-600" />
                              <div className="text-sm text-blue-800">
                                <p className="font-bold">Prise en charge {selectedInsurance.name} active !</p>
                                <p>Taux : {coverageRate}% — Vous ne payez que {100 - coverageRate}% du total.</p>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      {selectedPaymentMethod && selectedPaymentMethod !== 'cash_on_delivery' && (
                        <div className="mt-6">
                          <Label htmlFor="phone">Numéro de téléphone</Label>
                          <Input
                            id="phone"
                            type="tel"
                            placeholder="Ex: +225 07 12 34 56 78"
                            value={phoneNumber}
                            onChange={(e) => setPhoneNumber(e.target.value)}
                          />
                          <p className="text-xs text-muted-foreground mt-1">
                            Numéro associé à votre compte {getPaymentMethodById(selectedPaymentMethod)?.name}
                          </p>
                        </div>
                      )}

                      {/* Loyalty Points Section */}
                      <div className="mt-8 border-t pt-6">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-2">
                            <Gift className="h-5 w-5 text-yellow-500" />
                            <h3 className="font-bold text-lg">PharmaWallet</h3>
                          </div>
                          <Badge variant="secondary" className="bg-yellow-100 text-yellow-700 hover:bg-yellow-100">
                            {availablePoints} points disponibles
                          </Badge>
                        </div>

                        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                          <div className="flex items-center justify-between">
                            <div className="space-y-1">
                              <p className="font-medium">Utiliser mes points de fidélité</p>
                              <p className="text-xs text-muted-foreground">1 point = 1 FCFA de réduction</p>
                            </div>
                            <Checkbox
                              checked={usePoints}
                              onCheckedChange={(checked) => {
                                setUsePoints(checked as boolean);
                                if (checked) {
                                  // Use as many points as possible (capped by total and available points)
                                  const maxUsable = Math.min(availablePoints, totalAmount);
                                  setPointsToUse(maxUsable);
                                } else {
                                  setPointsToUse(0);
                                }
                              }}
                            />
                          </div>

                          {usePoints && (
                            <div className="mt-4 animate-in fade-in slide-in-from-top-2">
                              <div className="flex items-center gap-4">
                                <div className="flex-1">
                                  <Label className="text-[10px] uppercase font-bold text-muted-foreground mb-1 block">Points à utiliser</Label>
                                  <Input
                                    type="number"
                                    max={availablePoints}
                                    value={pointsToUse}
                                    onChange={(e) => {
                                      const val = parseInt(e.target.value) || 0;
                                      setPointsToUse(Math.min(val, availablePoints));
                                    }}
                                    className="h-10 rounded-lg"
                                  />
                                </div>
                                <div className="pt-5">
                                  <p className="text-sm font-bold text-green-600">-{pointsToUse.toLocaleString()} FCFA</p>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="mt-6 bg-green-50 rounded-lg p-4 border border-green-200">
                        <div className="flex items-center gap-2 mb-2">
                          <Shield className="h-4 w-4 text-green-600" />
                          <span className="font-medium text-green-800">Paiement sécurisé</span>
                        </div>
                        <p className="text-sm text-green-700">
                          Toutes les transactions sont chiffrées et sécurisées.
                          Vos données ne sont jamais stockées.
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>

              <Button
                size="lg"
                className="w-full text-lg py-6"
                onClick={handlePayment}
                disabled={!deliveryAddress || (selectedPaymentMethod !== 'cash_on_delivery' && !phoneNumber)}
              >
                <CreditCard className="h-5 w-5 mr-2" />
                Confirmer le paiement • {finalTotal.toLocaleString()} FCFA
              </Button>
            </div>

            {/* Right Column - Order Summary */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ShoppingCart className="h-5 w-5" />
                    Résumé de la commande
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {Object.entries(pharmacyGroups).map(([pharmacyId, pharmacyItems]) => (
                      <div key={pharmacyId} className="border-b pb-4">
                        <h4 className="font-medium mb-2">{pharmacyItems[0].pharmacy_name}</h4>
                        {pharmacyItems.map(item => (
                          <div key={item.medicine.id} className="flex justify-between text-sm">
                            <span>{item.medicine.name} × {item.quantity}</span>
                            <span>{(item.price * item.quantity).toLocaleString()} FCFA</span>
                          </div>
                        ))}
                      </div>
                    ))}

                    <div className="space-y-2 pt-4">
                      <div className="flex justify-between">
                        <span>Sous-total</span>
                        <span>{totalAmount.toLocaleString()} FCFA</span>
                      </div>
                      {coverageRate > 0 && (
                        <div className="flex justify-between text-blue-600 font-medium">
                          <span>Prise en charge ({coverageRate}%)</span>
                          <span>-{((totalAmount * coverageRate) / 100).toLocaleString()} FCFA</span>
                        </div>
                      )}
                      {pointsToUse > 0 && (
                        <div className="flex justify-between text-yellow-600 font-medium">
                          <span>Points de fidélité</span>
                          <span>-{pointsToUse.toLocaleString()} FCFA</span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span>Frais de livraison</span>
                        <span>{deliveryFee.toLocaleString()} FCFA</span>
                      </div>
                      <div className="flex justify-between font-bold text-lg border-t pt-2">
                        <span>{coverageRate > 0 || pointsToUse > 0 ? 'Reste à charge' : 'Total'}</span>
                        <span>{finalTotal.toLocaleString()} FCFA</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    <span>Livraison estimée: 30-45 minutes</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {isRedirecting && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm animate-in fade-in duration-300">
            <Card className="w-full max-w-sm mx-4 border-2 border-primary/20 shadow-2xl">
              <CardContent className="py-12 text-center space-y-6">
                <div className="relative mx-auto w-20 h-20">
                  <div className="absolute inset-0 rounded-full border-4 border-primary/20" />
                  <div className="absolute inset-0 rounded-full border-4 border-primary border-t-transparent animate-spin" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Smartphone className="h-8 w-8 text-primary" />
                  </div>
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-bold">Ouverture de {getPaymentMethodById(selectedPaymentMethod)?.name}</h3>
                  <p className="text-muted-foreground">
                    Nous vous redirigeons vers votre application de paiement pour valider la transaction.
                  </p>
                </div>
                <Badge variant="outline" className="animate-pulse">
                  Transaction sécurisée par PharmaGo
                </Badge>
              </CardContent>
            </Card>
          </div>
        )}

        {/* USSD Simulator */}
        <USSDSimulator
          open={showUSSD}
          provider={selectedPaymentMethod}
          phoneNumber={phoneNumber}
          amount={finalTotal}
          onSuccess={() => processOrder()}
          onCancel={() => setShowUSSD(false)}
        />

        {paymentStep === 'payment' && (
          <div className="max-w-md mx-auto">
            <Card>
              <CardContent className="py-12 text-center">
                <div className="animate-spin h-12 w-12 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
                <h3 className="text-xl font-semibold mb-2">Finalisation de la commande</h3>
                <p className="text-muted-foreground mb-4">
                  Enregistrement de votre commande...
                </p>
                <div className="bg-muted rounded-lg p-4">
                  <p className="text-sm">
                    Montant: <span className="font-bold">{finalTotal.toLocaleString()} FCFA</span>
                  </p>
                  <p className="text-sm">
                    Mode: {getPaymentMethodById(selectedPaymentMethod)?.name}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {paymentStep === 'confirmation' && (
          <div className="max-w-2xl mx-auto space-y-6">
            <OrderInvoice
              orderId={orderId}
              items={items}
              subtotal={totalAmount}
              deliveryFee={deliveryFee}
              total={finalTotal}
              paymentMethod={selectedPaymentMethod}
              address={deliveryAddress}
              onTrackOrder={() => {
                navigate(`/suivi?order=${orderId}`);
              }}
            />
          </div>
        )}

        {/* Click & Collect Pickup Ready */}
        {paymentStep === 'pickup_ready' && selectedPharmacy && (
          <div className="max-w-md mx-auto space-y-6">
            <ClickCollectQR
              orderId={orderId}
              pharmacyName={selectedPharmacy.name}
              pharmacyAddress={selectedPharmacy.address}
              preparationTime={15}
              items={items.map(item => ({
                name: item.medicine.name,
                quantity: item.quantity
              }))}
              totalAmount={finalTotal}
            />
            <Button variant="outline" className="w-full" onClick={onBackToHome}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retour à l'accueil
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentSystem;
