import { useState, useMemo } from "react";
import Header from "@/components/core/Header";
import Footer from "@/components/core/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Search, Filter, ShoppingCart, Star, ChevronDown, Plus, ChevronRight, ChevronLeft, Zap, Sparkles, TrendingUp, Gift } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useCart } from "@/contexts/CartContext";
import { toast } from "sonner";
import { CartDrawer } from "@/components/cart/CartDrawer";
import { PharmacyService } from "@/services/PharmacyService";
import { Medicine } from "@/lib/supabase";
import { Loader2 } from "lucide-react";
import { useEffect } from "react";
import { useI18n, type TranslationKey } from "@/hooks/useI18n";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
} from "@/components/ui/dropdown-menu";

const categories = [
  { name: "Bébé, enfant et maternité", products: ["Couches", "Lait infantile", "Biberons", "Soins bébé"] },
  { name: "Bouche et dents", products: ["Dentifrices", "Brosses à dents", "Bains de bouche", "Fil dentaire"] },
  { name: "Cheveux", products: ["Shampoings", "Après-shampoings", "Masques capillaires", "Sérums"] },
  { name: "Corps", products: ["Gels douche", "Crèmes hydratantes", "Déodorants", "Huiles corporelles"] },
  { name: "Matériel médical", products: ["Thermomètres", "Tensiomètres", "Pansements", "Compresses"] },
  { name: "Santé", products: ["Vitamines", "Compléments alimentaires", "Probiotiques", "Minéraux"] },
  { name: "Sexualité et intimité", products: ["Préservatifs", "Lubrifiants", "Tests de grossesse", "Hygiène intime"] },
  { name: "Visage", products: ["Crèmes hydratantes", "Sérums anti-âge", "Nettoyants", "Masques"] },
  { name: "Vétérinaire", products: ["Antiparasitaires", "Compléments animaux", "Soins dentaires", "Vitamines"] }
];

const FALLBACK_IMAGE = "https://images.unsplash.com/photo-1559594482-e824888be1de?w=500&q=80";

const ITEMS_PER_PAGE = 9;

const ParapharmacyPage = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [priceSort, setPriceSort] = useState("default");
  const [currentPage, setCurrentPage] = useState(1);
  const [products, setProducts] = useState<(Medicine & { price: number, rating: number, image: string, inStock: boolean })[]>([]);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();
  const { t, lang: currentLang } = useI18n();

  const translatedCategories = useMemo(() => [
    { name: t('catBaby'), id: 'catBaby' },
    { name: t('catTeeth'), id: 'catTeeth' },
    { name: t('catHair'), id: 'catHair' },
    { name: t('catBody'), id: 'catBody' },
    { name: t('catMedical'), id: 'catMedical' },
    { name: t('catHealth'), id: 'catHealth' },
    { name: t('catSexy'), id: 'catSexy' },
    { name: t('catFace'), id: 'catFace' },
    { name: t('catVeterinary'), id: 'catVeterinary' },
  ], [t]);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      const data = await PharmacyService.getParapharmacyProducts();
      // Enforce some mock values for display if DB fields are missing
      const enrichedData = data.map(p => ({
        ...p,
        price: (p as any).price || Math.floor(2000 + Math.random() * 15000),
        rating: (p as any).rating || (4 + Math.random()),
        image: (p as any).image || FALLBACK_IMAGE,
        inStock: true
      }));
      setProducts(enrichedData as any[]);
      setLoading(false);
    };
    fetchProducts();
  }, []);

  const filteredProducts = useMemo(() => {
    return products
      .filter(product => {
        const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
        // Simple mapping for demo, usually categories would be IDs in DB
        const matchesCategory = selectedCategory === "all" || product.category === selectedCategory ||
          translatedCategories.find(c => c.id === selectedCategory)?.name === product.category;
        return matchesSearch && matchesCategory;
      })
      .sort((a, b) => {
        if (priceSort === "asc") return a.price - b.price;
        if (priceSort === "desc") return b.price - a.price;
        return 0;
      });
  }, [searchTerm, selectedCategory, priceSort]);

  const featuredProducts = useMemo(() => products.slice(0, 4), [products]);

  const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE);
  const paginatedProducts = filteredProducts.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  const handleAddToCart = (product: Medicine & { price: number }) => {
    addToCart({
      medicine: product,
      quantity: 1,
      pharmacy_id: 'mock-pharmacy',
      pharmacy_name: 'Parapharmacie PharmaGo',
      price: product.price
    });
    toast.success(`${product.name} ajouté au panier`);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="py-8">
        <div className="container mx-auto px-4">
          <Button
            variant="ghost"
            onClick={() => navigate('/')}
            className="flex items-center gap-2 mb-6 hover:bg-primary/10 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            {t('back')}
          </Button>

          {/* Hero Promo Section */}
          <div className="relative rounded-2xl overflow-hidden mb-12 bg-gradient-to-r from-blue-600 to-indigo-700 text-white shadow-xl">
            <div className="absolute inset-0 opacity-20">
              <div className="absolute top-10 left-10 w-32 h-32 bg-white rounded-full blur-3xl" />
              <div className="absolute bottom-10 right-10 w-64 h-64 bg-blue-400 rounded-full blur-3xl" />
            </div>
            <div className="relative px-8 py-12 flex flex-col md:flex-row items-center justify-between gap-8">
              <div className="md:w-1/2 space-y-4">
                <Badge className="bg-yellow-400 text-blue-900 border-none px-3 py-1 font-bold">OFFRE SPÉCIALE</Badge>
                <h1 className="text-4xl md:text-5xl font-black leading-tight">{t('paraPromoTitle')}</h1>
                <p className="text-blue-100 text-lg">{t('paraPromoDesc')} {currentLang === 'fr' ? 'Livraison offerte dès 15 000 FCFA.' : (currentLang === 'en' ? 'Free delivery over 15,000 FCFA.' : '')}</p>
                <div className="flex gap-4 pt-2">
                  <Button className="bg-white text-blue-700 hover:bg-blue-50 font-bold px-8 py-6 rounded-xl">{t('confirm')}</Button>
                </div>
              </div>
              <div className="md:w-1/3 flex justify-center">
                <div className="relative">
                  <div className="absolute inset-0 bg-white/20 rounded-full blur-2xl animate-pulse" />
                  <TrendingUp className="h-32 w-32 text-white/40" />
                  <Gift className="absolute -top-4 -right-4 h-12 w-12 text-yellow-300 animate-bounce" />
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-12">
            <div>
              <h2 className="text-3xl font-bold">{t('paraTitle')}</h2>
              <p className="text-muted-foreground">{t('paraSubtitle')}</p>
            </div>
            <Card className="p-2 border-primary/20 bg-primary/5">
              <div className="flex items-center gap-2 px-3 py-1">
                <Zap className="h-4 w-4 text-primary animate-pulse" />
                <span className="text-sm font-medium">Livraison en 30-45 minutes max</span>
              </div>
            </Card>
          </div>

          {/* Featured Sections (Horizontal Scroll on Mobile) */}
          <div className="mb-12 overflow-hidden">
            <div className="flex items-center gap-2 mb-6">
              <Sparkles className="h-5 w-5 text-yellow-500" />
              <h3 className="text-xl font-bold">Produits Vedettes</h3>
            </div>
            {loading ? (
              <div className="flex justify-center p-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {featuredProducts.map(product => (
                  <div key={`featured-${product.id}`} className="group cursor-pointer">
                    <div className="relative aspect-square rounded-xl overflow-hidden mb-3 border bg-white">
                      <img src={(product as any).image} alt={product.name} className="w-full h-full object-cover transition-transform group-hover:scale-105" />
                      <Badge className="absolute top-2 left-2 bg-yellow-400 text-blue-900 border-none text-[10px]">COUP DE COEUR</Badge>
                    </div>
                    <h4 className="font-semibold text-sm truncate">{product.name}</h4>
                    <p className="font-bold text-primary">{(product.price || 0).toLocaleString()} F</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Sidebar Filters */}
            <aside className="lg:col-span-1 space-y-6">
              <Card>
                <CardContent className="p-4 space-y-4">
                  <div>
                    <h4 className="font-bold mb-3 flex items-center gap-2">
                      <Search className="h-4 w-4" /> Recherche
                    </h4>
                    <Input
                      placeholder="Produit..."
                      value={searchTerm}
                      onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                    />
                  </div>
                  <div>
                    <h4 className="font-bold mb-3">Catégories</h4>
                    <div className="space-y-1">
                      <Button
                        variant={selectedCategory === 'all' ? 'default' : 'ghost'}
                        size="sm"
                        className="w-full justify-start"
                        onClick={() => { setSelectedCategory('all'); setCurrentPage(1); }}
                      >
                        {t('navHome')}
                      </Button>
                      {translatedCategories.map(cat => (
                        <Button
                          key={cat.id}
                          variant={selectedCategory === cat.id ? 'default' : 'ghost'}
                          size="sm"
                          className="w-full justify-start truncate"
                          onClick={() => { setSelectedCategory(cat.id); setCurrentPage(1); }}
                        >
                          {cat.name}
                        </Button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h4 className="font-bold mb-3 font-bold mb-3 flex items-center gap-2">
                      <Filter className="h-4 w-4" /> Trier par prix
                    </h4>
                    <Select value={priceSort} onValueChange={setPriceSort}>
                      <SelectTrigger>
                        <SelectValue placeholder="Tri" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="default">Défaut</SelectItem>
                        <SelectItem value="asc">Croissant</SelectItem>
                        <SelectItem value="desc">Décroissant</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>
            </aside>

            {/* Main Product Area */}
            <div className="lg:col-span-3 space-y-8">
              {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[1, 2, 3, 4, 5, 6].map(i => (
                    <div key={i} className="h-64 rounded-2xl bg-slate-100 animate-pulse" />
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {paginatedProducts.map(product => (
                    <Card key={product.id} className="hover:shadow-lg transition-all overflow-hidden group border-none shadow-sm flex flex-col">
                      <div className="relative aspect-[4/3] overflow-hidden bg-slate-50">
                        <img
                          src={(product as any).image}
                          alt={product.name}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                        {!(product as any).inStock && (
                          <div className="absolute inset-0 bg-black/40 backdrop-blur-[1px] flex items-center justify-center">
                            <Badge variant="destructive" className="px-3">Rupture</Badge>
                          </div>
                        )}
                      </div>
                      <CardContent className="p-4 flex flex-1 flex-col">
                        <Badge variant="outline" className="text-[9px] uppercase tracking-wider mb-2 w-fit bg-slate-50 text-slate-500">
                          {product.category}
                        </Badge>
                        <h3 className="font-bold mb-1 truncate flex-1">{product.name}</h3>
                        <div className="flex items-center gap-1 mb-3">
                          <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                          <span className="text-xs font-semibold">{(product as any).rating.toFixed(1)}</span>
                        </div>
                        <div className="flex items-center justify-between mt-auto pt-2 border-t">
                          <span className="text-lg font-black text-primary">
                            {(product.price || 0).toLocaleString()} F
                          </span>
                          <Button
                            size="sm"
                            className="rounded-xl h-8 w-8 p-0"
                            disabled={!(product as any).inStock}
                            onClick={() => handleAddToCart(product)}
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-4 py-8 border-t">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <span className="font-bold">Page {currentPage} sur {totalPages}</span>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              )}

              {filteredProducts.length === 0 && (
                <div className="text-center py-24 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
                  <div className="text-6xl mb-6">🔍</div>
                  <h3 className="text-2xl font-bold mb-2">Aucun résultat</h3>
                  <p className="text-muted-foreground">Désolé, nous n'avons pas trouvé de produit correspondant à votre demande.</p>
                  <Button
                    variant="link"
                    onClick={() => { setSearchTerm(''); setSelectedCategory('all'); }}
                    className="mt-2"
                  >
                    Effacer tous les filtres
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
      <CartDrawer />
    </div>
  );
};

export default ParapharmacyPage;
