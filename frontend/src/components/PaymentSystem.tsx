import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCart } from "@/contexts/CartContext";
import ClickCollectQR from "@/components/cart/ClickCollectQR";
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
  Info
} from "lucide-react";
import { toast } from "sonner";

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
    description: 'Paiement rapide et sécurisé avec Orange Money',
    processingTime: 'Instantané',
    available: true
  },
  {
    id: 'wave',
    name: 'Wave',
    icon: '💙',
    description: 'Envoi et réception d\'argent avec Wave',
    processingTime: 'Instantané',
    available: true
  },
  {
    id: 'mtn_money',
    name: 'MTN Mobile Money',
    icon: '🟡',
    description: 'Paiement mobile avec MTN Money',
    processingTime: 'Instantané',
    available: true
  },
  {
    id: 'moov_money',
    name: 'Moov Money',
    icon: '🔵',
    description: 'Solution de paiement Moov Money',
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
  },
  {
    id: 'card',
    name: 'Carte bancaire',
    icon: '💳',
    description: 'Visa, Mastercard acceptées',
    processingTime: '1-2 minutes',
    available: false
  }
];

interface PaymentSystemProps {
  onBackToHome?: () => void;
}

const PaymentSystem = ({ onBackToHome }: PaymentSystemProps) => {
  const { items, getTotalPrice, groupByPharmacy, clearCart } = useCart();
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('orange_money');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [useCurrentLocation, setUseCurrentLocation] = useState(false);
  const [orderNotes, setOrderNotes] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentStep, setPaymentStep] = useState<'details' | 'payment' | 'confirmation' | 'pickup_ready'>('details');
  const [orderId, setOrderId] = useState<string>('');

  // Click & Collect mode
  const [deliveryMode, setDeliveryMode] = useState<'delivery' | 'pickup'>('delivery');
  const [selectedPharmacy, setSelectedPharmacy] = useState<{ name: string; address: string } | null>(null);

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
  }, [pharmacyGroups, deliveryUrgency]);

  const deliveryFee = deliveryMode === 'pickup' ? 0 : (deliveryFeeBreakdown?.total || Object.keys(pharmacyGroups).length * 500);
  const finalTotal = totalAmount + deliveryFee;

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

  const { user } = useAuth(); // Add useAuth hook

  const handlePayment = async () => {
    if (!deliveryAddress || (selectedPaymentMethod !== 'cash_on_delivery' && !phoneNumber)) {
      toast.error("Veuillez remplir tous les champs obligatoires");
      return;
    }

    setIsProcessing(true);
    setPaymentStep('payment');

    try {
      // 1. Simulate Payment Gateway Delay
      await new Promise(resolve => setTimeout(resolve, 2000));

      const newOrderId = `CMD-${Math.floor(Math.random() * 1000000)}`;

      // 2. Create Order in Supabase
      if (user) {
        const { data, error } = await supabase
          .from('orders')
          .insert({
            patient_id: user.id,
            status: 'pending',
            total: finalTotal,
            payment_method: selectedPaymentMethod,
            payment_status: selectedPaymentMethod === 'cash_on_delivery' ? 'pending' : 'completed',
            delivery_address: deliveryAddress,
            pharmacy_id: Object.keys(pharmacyGroups)[0] || null, // Pick first pharmacy for now
            items_count: items.reduce((acc, item) => acc + item.quantity, 0),
            notes: orderNotes
          })
          .select()
          .single();

        if (error) throw error;
        setOrderId(data.id.substring(0, 8).toUpperCase());
      } else {
        // Fallback for guest checkout (if allowed)
        setOrderId(newOrderId);
      }

      // 3. Success State
      if (deliveryMode === 'pickup') {
        setPaymentStep('pickup_ready');
      } else {
        setPaymentStep('confirmation');
      }

      toast.success("Paiement effectué avec succès !");

      // Clear cart
      if (selectedPaymentMethod !== 'cash_on_delivery') {
        clearCart();
      }

    } catch (error) {
      console.error('Payment Error:', error);
      toast.error("Erreur lors du traitement de la commande");
      setPaymentStep('details'); // Go back
    } finally {
      setIsProcessing(false);
    }
  };

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
                      <div className="flex justify-between">
                        <span>Frais de livraison</span>
                        <span>{deliveryFee.toLocaleString()} FCFA</span>
                      </div>
                      <div className="flex justify-between font-bold text-lg border-t pt-2">
                        <span>Total</span>
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

        {paymentStep === 'payment' && (
          <div className="max-w-md mx-auto">
            <Card>
              <CardContent className="py-12 text-center">
                <div className="animate-spin h-12 w-12 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
                <h3 className="text-xl font-semibold mb-2">Traitement du paiement</h3>
                <p className="text-muted-foreground mb-4">
                  Veuillez patienter pendant que nous traitons votre paiement...
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
            <Card>
              <CardContent className="py-12 text-center">
                <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
                <h3 className="text-2xl font-bold mb-2">Paiement confirmé !</h3>
                <p className="text-muted-foreground mb-6">
                  Votre commande a été enregistrée avec succès
                </p>

                <div className="bg-green-50 rounded-lg p-4 border border-green-200 mb-6">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Receipt className="h-5 w-5 text-green-600" />
                    <span className="font-semibold text-green-800">Numéro de commande</span>
                  </div>
                  <div className="text-2xl font-bold text-green-800">{orderId}</div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div className="bg-muted rounded-lg p-4">
                    <Wallet className="h-6 w-6 mx-auto mb-2 text-primary" />
                    <div className="font-semibold">Montant payé</div>
                    <div className="text-lg font-bold text-primary">
                      {finalTotal.toLocaleString()} FCFA
                    </div>
                  </div>
                  <div className="bg-muted rounded-lg p-4">
                    <Clock className="h-6 w-6 mx-auto mb-2 text-secondary" />
                    <div className="font-semibold">Livraison estimée</div>
                    <div className="text-lg font-bold text-secondary">30-45 min</div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4">
                  <Button variant="outline" className="flex-1" onClick={onBackToHome}>
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Retour à l'accueil
                  </Button>
                  <Button className="flex-1">
                    <Truck className="h-4 w-4 mr-2" />
                    Suivre ma commande
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Que se passe-t-il maintenant ?</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white font-semibold text-sm">1</div>
                    <div>
                      <div className="font-medium">Préparation de votre commande</div>
                      <div className="text-sm text-muted-foreground">La pharmacie prépare vos médicaments</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-secondary rounded-full flex items-center justify-center text-white font-semibold text-sm">2</div>
                    <div>
                      <div className="font-medium">Collecte par le livreur</div>
                      <div className="text-sm text-muted-foreground">Notre livreur récupère votre commande</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-accent rounded-full flex items-center justify-center text-white font-semibold text-sm">3</div>
                    <div>
                      <div className="font-medium">Livraison à votre adresse</div>
                      <div className="text-sm text-muted-foreground">Réception de vos médicaments</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
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