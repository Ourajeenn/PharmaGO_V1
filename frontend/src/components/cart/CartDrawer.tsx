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
import { CartSuggestions } from './CartSuggestions';

interface CartDrawerProps {
  children?: React.ReactNode;
  customTrigger?: React.ReactNode;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({ children, customTrigger }) => {
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
        {customTrigger || children || (
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
          <div className="relative flex flex-col items-center justify-center h-full text-center py-8 rounded-3xl overflow-hidden">
            {/* Background Image */}
            <div
              className="absolute inset-0 bg-cover bg-center opacity-90"
              style={{
                backgroundImage: 'url(/cart-background.png)',
                backgroundSize: 'cover',
                backgroundPosition: 'center'
              }}
            />
            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-50/80 via-blue-50/70 to-teal-50/80 backdrop-blur-[2px]" />

            {/* Content */}
            <div className="relative z-10 space-y-4 px-6">
              <div className="bg-white/90 backdrop-blur-md rounded-2xl p-6 shadow-xl border border-white/50">
                <ShoppingCart className="h-16 w-16 text-cyan-600 mb-4 mx-auto" />
                <h3 className="text-2xl font-bold mb-2 text-slate-900">Trouvez votre médicament idéal</h3>
                <p className="text-slate-600 mb-6">Votre panier est vide. Ajoutez des médicaments pour commencer votre commande.</p>
                <Button
                  onClick={() => navigate('/medicaments')}
                  className="bg-blue-500 hover:bg-blue-600 text-white rounded-full px-8 py-6 text-base font-semibold shadow-lg hover:shadow-xl transition-all"
                >
                  Acheter maintenant
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col h-full relative">
            {/* Subtle Background for Cart with Items */}
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-50/30 via-blue-50/20 to-teal-50/30 -z-10 rounded-3xl" />
            <ScrollArea className="flex-1 -mx-4 px-4 overflow-y-auto">
              <div className="space-y-6 pb-6 pt-2">
                {Object.entries(groupedItems).map(([pharmacyId, pharmacyItems]) => {
                  const pharmacySubtotal = pharmacyItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
                  const deliveryFee = 1000;

                  return (
                    <Card key={pharmacyId} className="border-l-4 border-l-primary shadow-lg backdrop-blur-md bg-white/60 rounded-3xl border border-white/40 hover:shadow-xl transition-all duration-300">
                      <CardHeader className="pb-3 bg-gradient-to-r from-primary/10 to-transparent backdrop-blur-sm rounded-t-3xl">
                        <div className="flex justify-between items-center">
                          <CardTitle className="text-xs font-black flex items-center gap-2 uppercase tracking-wider">
                            <MapPin className="h-4 w-4 text-primary" />
                            {pharmacyItems[0].pharmacy_name}
                          </CardTitle>
                          <Badge variant="outline" className="text-[10px] font-bold bg-white/50 border-white/40">
                            Livraison: {deliveryFee.toLocaleString()} F
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4 pt-4">
                        {pharmacyItems.map((item) => (
                          <div key={`${item.medicine.id}-${pharmacyId}`} className="flex items-center gap-4 group">
                            <div className="flex-1 min-w-0">
                              <h4 className="font-bold text-sm text-slate-900 group-hover:text-primary transition-colors">{item.medicine.name}</h4>
                              <p className="text-[10px] text-slate-500 font-medium">
                                {item.medicine.dosage} • {item.medicine.form}
                              </p>
                              <p className="text-sm font-black text-primary mt-1">
                                {item.price.toLocaleString()} FCFA
                              </p>
                            </div>
                            <div className="flex items-center gap-2 bg-slate-100/50 p-1 rounded-xl border border-slate-200/50">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6 rounded-lg hover:bg-white shadow-none"
                                onClick={() => updateQuantity(item.medicine.id, item.quantity - 1)}
                              >
                                <Minus className="h-3 w-3" />
                              </Button>
                              <span className="w-6 text-center text-xs font-black">{item.quantity}</span>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6 rounded-lg hover:bg-white shadow-none"
                                onClick={() => updateQuantity(item.medicine.id, item.quantity + 1)}
                              >
                                <Plus className="h-3 w-3" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6 rounded-lg hover:bg-red-50 text-slate-300 hover:text-destructive shadow-none"
                                onClick={() => removeFromCart(item.medicine.id)}
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        ))}
                        <div className="pt-3 mt-3 border-t border-dashed border-slate-200 flex justify-between items-center text-sm">
                          <span className="text-xs font-bold text-slate-500 uppercase tracking-tight">Sous-total :</span>
                          <span className="font-black text-slate-900">{pharmacySubtotal.toLocaleString()} FCFA</span>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </ScrollArea>

            <CartSuggestions />

            <div className="border-t border-primary/20 pt-6 mt-4 space-y-4 backdrop-blur-xl bg-white/40 rounded-3xl p-6 shadow-inner mb-10">
              <div className="flex justify-between items-center">
                <span className="text-lg font-black uppercase tracking-tighter">Total à payer</span>
                <span className="text-2xl font-black text-primary drop-shadow-sm">
                  {totalPrice.toLocaleString()} <span className="text-sm">FCFA</span>
                </span>
              </div>
              <Button
                className="w-full py-7 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-black text-lg shadow-xl shadow-blue-200 transition-all hover:scale-[1.02] active:scale-[0.98]"
                onClick={handleCheckout}
                disabled={items.length === 0}
              >
                <CreditCard className="h-6 w-6 mr-3" />
                Passer la commande
              </Button>
              <div className="flex items-center justify-center gap-2 text-[10px] text-slate-500 font-bold uppercase tracking-widest">
                <MapPin className="h-3 w-3 text-red-500" />
                Frais de livraison calculés à l'étape suivante
              </div>
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