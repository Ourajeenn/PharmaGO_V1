import React, { useEffect, useState } from 'react';
import { useCart } from '@/contexts/CartContext';
import { PharmacyService } from '@/services/PharmacyService';
import { Medicine } from '@/lib/supabase';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Sparkles, ShoppingBag } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';

export const CartSuggestions: React.FC = () => {
    const { items, addToCart } = useCart();
    const [categories, setCategories] = useState<string[]>([]);

    // Déduire les catégories des articles dans le panier
    useEffect(() => {
        if (items.length > 0) {
            const cats = new Set<string>();
            items.forEach(item => {
                if (item.medicine.category) {
                    cats.add(item.medicine.category);
                }
            });
            setCategories(Array.from(cats));
        } else {
            setCategories([]);
        }
    }, [items]);

    const { data: suggestions, isLoading } = useQuery({
        queryKey: ['cart-suggestions', categories],
        queryFn: async () => {
            // Fetch recommendations based on cart categories
            const results = await PharmacyService.getRecommendations('current-user', categories);

            // Filter out items already in the cart
            const cartMedicineIds = new Set(items.map(i => i.medicine.id));
            return results.filter(medicine => !cartMedicineIds.has(medicine.id)).slice(0, 3);
        },
        // Only fetch if there are items in the cart
        enabled: items.length > 0,
    });

    const handleAddSuggestion = (medicine: Medicine) => {
        // For MVP, we assign it to the first pharmacy in the cart, or a default one if cart is empty
        // Since suggestions only appear when cart has items, we can safely use the first item's pharmacy
        const targetPharmacyId = items.length > 0 ? items[0].pharmacy_id : 'default-pharmacy';
        const targetPharmacyName = items.length > 0 ? items[0].pharmacy_name : 'Pharmacie Centrale';

        addToCart({
            medicine,
            quantity: 1,
            pharmacy_id: targetPharmacyId,
            pharmacy_name: targetPharmacyName,
            price: (medicine as any).price || 1500, // Use medicine price or default
        });

        toast.success(`${medicine.name} ajouté !`, {
            icon: '✨'
        });
    };

    if (items.length === 0) return null;

    if (isLoading) {
        return (
            <div className="mt-6">
                <h4 className="flex items-center text-sm font-bold text-slate-700 mb-3">
                    <Sparkles className="h-4 w-4 mr-2 text-amber-500" />
                    Complétez votre commande
                </h4>
                <div className="flex gap-3 overflow-x-auto pb-2 -mx-2 px-2">
                    {[1, 2, 3].map(i => (
                        <Skeleton key={i} className="min-w-[140px] h-24 rounded-xl" />
                    ))}
                </div>
            </div>
        );
    }

    if (!suggestions || suggestions.length === 0) return null;

    return (
        <div className="mt-6 mb-4">
            <h4 className="flex items-center text-sm font-bold text-slate-800 mb-3">
                <Sparkles className="h-4 w-4 mr-2 text-amber-500" />
                Produits recommandés pour vous
            </h4>
            <div className="flex gap-3 overflow-x-auto pb-4 -mx-1 px-1 custom-scrollbar">
                {suggestions.map((med) => (
                    <Card key={med.id} className="min-w-[140px] max-w-[160px] flex-shrink-0 border border-slate-200/60 shadow-sm hover:shadow-md transition-all duration-200 rounded-2xl overflow-hidden bg-gradient-to-br from-white to-slate-50/50">
                        <CardContent className="p-3">
                            <div className="h-16 w-full bg-slate-100 rounded-xl mb-2 flex items-center justify-center">
                                <ShoppingBag className="h-6 w-6 text-slate-300" />
                            </div>
                            <h5 className="font-bold text-xs text-slate-800 line-clamp-1" title={med.name}>
                                {med.name}
                            </h5>
                            <p className="text-[10px] text-slate-500 mb-2 truncate">
                                {med.category || 'Parapharmacie'}
                            </p>
                            <div className="flex items-center justify-between">
                                <span className="font-black text-primary text-xs flex-shrink-0">
                                    {(med as any).price || 1500} F
                                </span>
                                <Button
                                    size="icon"
                                    variant="secondary"
                                    className="h-6 w-6 rounded-full bg-blue-50 hover:bg-blue-100 text-blue-600 ml-1 flex-shrink-0"
                                    onClick={() => handleAddSuggestion(med)}
                                >
                                    <Plus className="h-3 w-3" />
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
};
