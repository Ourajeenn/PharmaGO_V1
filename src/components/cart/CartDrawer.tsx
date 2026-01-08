import React from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ShoppingCart, Plus, Minus, Trash2, MapPin, CreditCard } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { useNavigate } from 'react-router-dom';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import PaymentModal from '@/components/payment/PaymentModal';
import { useState } from 'react';

interface CartDrawerProps {
  children?: React.ReactNode;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({ children }) => {
  const { items, updateQuantity, removeFromCart, getTotalPrice, getItemCount, groupByPharmacy } = useCart();
  const navigate = useNavigate();
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);

  const groupedItems = groupByPharmacy();
  const totalPrice = getTotalPrice();
  const itemCount = getItemCount();

  const handleCheckout = () => {
    if (items.length > 0) {
      setIsPaymentOpen(true);
    }
  };

  return (
    <Sheet>
      <SheetTrigger asChild>
        {children || (
          <Button variant="ghost" size="sm" className="relative">
            <ShoppingCart className="h-5 w-5" />
            {itemCount > 0 && (
              <Badge variant="secondary" className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs">
                {itemCount}
              </Badge>
            )}
          </Button>
        )}
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-lg backdrop-blur-xl bg-background/80 border-l border-border/50 rounded-l-3xl shadow-2xl">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" />
            Mon Panier ({itemCount} article{itemCount !== 1 ? 's' : ''})
          </SheetTitle>
        </SheetHeader>

        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center py-8">
            <ShoppingCart className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">Votre panier est vide</h3>
            <p className="text-muted-foreground mb-4">Ajoutez des médicaments pour commencer</p>
          </div>
        ) : (
          <div className="flex flex-col h-full">
            <ScrollArea className="flex-1 py-4">
              <div className="space-y-4">
                {Object.entries(groupedItems).map(([pharmacyId, pharmacyItems]) => {
                  const pharmacySubtotal = pharmacyItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
                  const deliveryFee = 1000; // Fixed fee for now, or dynamic based on calculation

                  return (
                    <Card key={pharmacyId} className="border-l-4 border-l-primary shadow-lg backdrop-blur-md bg-card/60 rounded-2xl border border-border/30 hover:shadow-xl transition-all duration-300">
                      <CardHeader className="pb-3 bg-gradient-to-r from-primary/10 to-primary/5 backdrop-blur-sm rounded-t-2xl">
                        <div className="flex justify-between items-center">
                          <CardTitle className="text-sm flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-primary" />
                            {pharmacyItems[0].pharmacy_name}
                          </CardTitle>
                          <Badge variant="outline" className="text-xs font-normal">
                            Livraison: {deliveryFee.toLocaleString()} F
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-3 pt-3">
                        {pharmacyItems.map((item) => (
                          <div key={`${item.medicine.id}-${pharmacyId}`} className="flex items-center gap-3">
                            <div className="flex-1 min-w-0">
                              <h4 className="font-medium text-sm truncate">{item.medicine.name}</h4>
                              <p className="text-xs text-muted-foreground">
                                {item.medicine.dosage} • {item.medicine.form}
                              </p>
                              <p className="text-sm font-medium text-primary">
                                {item.price.toLocaleString()} FCFA
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              <Button
                                variant="outline"
                                size="icon"
                                className="h-7 w-7"
                                onClick={() => updateQuantity(item.medicine.id, item.quantity - 1)}
                              >
                                <Minus className="h-3 w-3" />
                              </Button>
                              <span className="w-6 text-center text-sm font-medium">{item.quantity}</span>
                              <Button
                                variant="outline"
                                size="icon"
                                className="h-7 w-7"
                                onClick={() => updateQuantity(item.medicine.id, item.quantity + 1)}
                              >
                                <Plus className="h-3 w-3" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 text-destructive hover:text-destructive hover:bg-destructive/10"
                                onClick={() => removeFromCart(item.medicine.id)}
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        ))}
                        <div className="pt-2 mt-2 border-t flex justify-between items-center text-sm">
                          <span className="text-muted-foreground">Sous-total pharmacie:</span>
                          <span className="font-semibold">{pharmacySubtotal.toLocaleString()} FCFA</span>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </ScrollArea>

            <div className="border-t border-border/30 pt-4 space-y-4 backdrop-blur-sm bg-background/60 rounded-2xl p-4 -mx-4 -mb-4">
              <div className="flex justify-between items-center">
                <span className="text-lg font-semibold">Total:</span>
                <span className="text-lg font-bold text-primary">
                  {totalPrice.toLocaleString()} FCFA
                </span>
              </div>
              <Button
                className="w-full"
                onClick={handleCheckout}
                disabled={items.length === 0}
              >
                <CreditCard className="h-4 w-4 mr-2" />
                Passer la commande
              </Button>
              <p className="text-xs text-muted-foreground text-center">
                Frais de livraison calculés à l'étape suivante
              </p>
            </div>
          </div>
        )}
      </SheetContent>

      <PaymentModal
        isOpen={isPaymentOpen}
        onClose={() => setIsPaymentOpen(false)}
        totalAmount={totalPrice + 1000} // Adding simulated delivery fee
      />
    </Sheet>
  );
};