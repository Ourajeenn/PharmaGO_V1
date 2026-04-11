
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { MapPin, ArrowRight, TrendingDown, Percent, Star, Clock, ShieldCheck, History } from "lucide-react";
import { toast } from "sonner";
import { useCart } from "@/contexts/CartContext";

interface PharmacyOffer {
    id: string;
    name: string;
    price: number;
    distance: number;
    rating: number;
    isOpen: boolean;
    promo?: boolean;
    lastUpdated: string;
    statusText: string;
    isGuard?: boolean;
}

interface PharmacyPriceComparisonProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    medicine: any; // Using any for flexibility with existing types
}

export const PharmacyPriceComparison = ({ open, onOpenChange, medicine }: PharmacyPriceComparisonProps) => {
    const { addToCart } = useCart();
    const [sortBy, setSortBy] = useState<'price' | 'distance'>('price');

    if (!medicine) return null;

    // Simulate generating offers
    const basePrice = medicine.price;
    const offers: PharmacyOffer[] = [
        {
            id: 'ph1',
            name: 'Pharmacie Saint-Jean',
            price: Math.floor(basePrice * 0.95), // Cheaper
            distance: 1.2,
            rating: 4.8,
            isOpen: true,
            promo: true,
            lastUpdated: "À l'instant",
            statusText: "Ouvert • Ferme à 21h00",
            isGuard: false
        },
        {
            id: 'ph2',
            name: 'Pharmacie des Lagunes',
            price: basePrice,
            distance: 0.5, // Closer
            rating: 4.5,
            isOpen: true,
            lastUpdated: "Il y a 5 min",
            statusText: "Ouvert • Ferme à 20h00",
            isGuard: false
        },
        {
            id: 'ph3',
            name: 'Grande Pharmacie du Plateau',
            price: Math.floor(basePrice * 1.1), // More expensive
            distance: 3.5,
            rating: 4.9,
            isOpen: true,
            lastUpdated: "Il y a 2 min",
            statusText: "DE GARDE 24/7",
            isGuard: true
        },
        {
            id: 'ph4',
            name: 'Pharmacie 24h Cocody',
            price: Math.floor(basePrice * 1.05),
            distance: 2.1,
            rating: 4.6,
            isOpen: true,
            lastUpdated: "Il y a 12 min",
            statusText: "Ouvert 24h/24",
            isGuard: true
        }
    ];

    const sortedOffers = [...offers].sort((a, b) => {
        if (sortBy === 'price') return a.price - b.price;
        return a.distance - b.distance;
    });

    const bestPrice = Math.min(...offers.map(o => o.price));
    const savings = basePrice - bestPrice;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto bg-white/95 backdrop-blur-xl border-white/20">
                <DialogHeader>
                    <div className="flex items-start gap-4">
                        <div className="w-16 h-16 rounded-xl bg-white border border-gray-200 p-1 flex-shrink-0">
                            <img src={medicine.image} alt={medicine.name} className="w-full h-full object-cover rounded-lg" />
                        </div>
                        <div>
                            <DialogTitle className="text-2xl font-black uppercase tracking-tight text-primary">
                                {medicine.name}
                            </DialogTitle>
                            <DialogDescription className="text-muted-foreground font-medium">
                                {medicine.category} • Comparateur de prix intelligent
                            </DialogDescription>
                        </div>
                    </div>
                </DialogHeader>

                <div className="mt-4 space-y-6">
                    {/* Best Deal Highlight */}
                    {savings > 0 && (
                        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-center gap-4 animate-in zoom-in-95 duration-500 shadow-sm">
                            <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 shadow-sm">
                                <TrendingDown className="h-6 w-6" />
                            </div>
                            <div className="flex-1">
                                <p className="text-sm font-bold text-emerald-800 uppercase tracking-wide">Meilleure offre détectée</p>
                                <p className="text-emerald-700 text-sm">Économisez <span className="font-black bg-emerald-100 px-1 rounded">{savings.toLocaleString()} FCFA</span> en choisissant l'offre la moins chère.</p>
                            </div>
                        </div>
                    )}

                    {/* Sort Controls */}
                    <div className="flex items-center justify-between bg-gray-50 p-2 rounded-lg border border-gray-100">
                        <h3 className="text-sm font-bold text-gray-600 px-2">{sortedOffers.length} Pharmacies disponibles</h3>
                        <div className="flex gap-2">
                            <Button
                                variant={sortBy === 'price' ? 'default' : 'ghost'}
                                size="sm"
                                onClick={() => setSortBy('price')}
                                className="rounded-md h-8 text-xs"
                            >
                                Prix
                            </Button>
                            <Button
                                variant={sortBy === 'distance' ? 'default' : 'ghost'}
                                size="sm"
                                onClick={() => setSortBy('distance')}
                                className="rounded-md h-8 text-xs"
                            >
                                Distance
                            </Button>
                        </div>
                    </div>

                    {/* Offers Table Header (Hidden on small screens, visible on large) */}
                    <div className="hidden md:grid grid-cols-12 gap-4 px-4 text-xs font-bold text-gray-400 uppercase tracking-wider">
                        <div className="col-span-5">Pharmacie</div>
                        <div className="col-span-3">Disponibilité</div>
                        <div className="col-span-2 text-right">Prix</div>
                        <div className="col-span-2"></div>
                    </div>

                    {/* Offers List */}
                    <div className="space-y-2">
                        {sortedOffers.map((offer, idx) => (
                            <div
                                key={offer.id}
                                className={`group relative grid grid-cols-1 md:grid-cols-12 gap-4 items-center p-4 rounded-xl border transition-all duration-300 hover:shadow-lg ${idx === 0 && sortBy === 'price' ? 'bg-primary/5 border-primary/20 ring-1 ring-primary/10' : 'bg-white border-gray-100 hover:border-gray-200'
                                    }`}
                            >
                                {offer.promo && (
                                    <div className="absolute -top-2 -right-2 md:top-auto md:right-auto md:relative bg-red-500 text-white text-[9px] font-bold px-2 py-0.5 rounded-full shadow-sm animate-pulse md:hidden">
                                        PROMO
                                    </div>
                                )}

                                {/* Pharmacy Info */}
                                <div className="col-span-12 md:col-span-5 flex items-center gap-3">
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs flex-shrink-0 ${idx === 0 && sortBy === 'price' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'bg-gray-100 text-gray-500'
                                        }`}>
                                        {idx + 1}
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-gray-900 text-sm group-hover:text-primary transition-colors flex items-center gap-2">
                                            {offer.name}
                                            {offer.isGuard && <Badge variant="outline" className="text-[9px] h-4 px-1 border-purple-200 bg-purple-50 text-purple-700">GARDE</Badge>}
                                        </h4>
                                        <div className="flex items-center gap-3 text-xs text-muted-foreground mt-0.5">
                                            <span className="flex items-center gap-1">
                                                <MapPin className="h-3 w-3 text-gray-400" /> {offer.distance} km
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <Star className="h-3 w-3 fill-amber-400 text-amber-400" /> {offer.rating}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Status & Timestamp */}
                                <div className="col-span-12 md:col-span-3 flex flex-row md:flex-col justify-between md:justify-center items-center md:items-start gap-1">
                                    <div className={`text-xs font-medium flex items-center gap-1.5 px-2 py-1 rounded-md ${offer.isGuard ? "bg-purple-100 text-purple-700" : "bg-green-100 text-green-700"
                                        }`}>
                                        {offer.isGuard ? <ShieldCheck className="h-3 w-3" /> : <Clock className="h-3 w-3" />}
                                        {offer.statusText}
                                    </div>
                                    <div className="text-[10px] text-gray-400 flex items-center gap-1">
                                        <History className="h-3 w-3" />
                                        Stock à jour: {offer.lastUpdated}
                                    </div>
                                </div>

                                {/* Price */}
                                <div className="col-span-6 md:col-span-2 text-left md:text-right">
                                    <div className="text-lg font-black text-gray-900 group-hover:text-primary transition-colors">
                                        {offer.price.toLocaleString()} F
                                    </div>
                                    {offer.price < basePrice && (
                                        <div className="text-[10px] text-emerald-600 font-bold flex items-center md:justify-end gap-1">
                                            <TrendingDown className="h-2.5 w-2.5" />
                                            -{Math.round((basePrice - offer.price) / basePrice * 100)}%
                                        </div>
                                    )}
                                </div>

                                {/* Action */}
                                <div className="col-span-6 md:col-span-2 flex justify-end">
                                    <Button
                                        size="sm"
                                        className={`rounded-xl h-9 px-4 font-bold shadow-sm transition-all ${idx === 0 && sortBy === 'price' ? 'bg-primary text-white hover:bg-primary/90' : 'bg-gray-50 text-gray-900 hover:bg-gray-100 border border-gray-200'
                                            }`}
                                        onClick={() => {
                                            addToCart({
                                                medicine: { ...medicine, price: offer.price },
                                                quantity: 1,
                                                pharmacy_id: offer.id,
                                                pharmacy_name: offer.name,
                                                price: offer.price
                                            });
                                            toast.success("Ajouté au panier via " + offer.name);
                                            onOpenChange(false);
                                        }}
                                    >
                                        <span className="mr-2 text-xs">Choisir</span>
                                        <ArrowRight className="h-3 w-3" />
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};
