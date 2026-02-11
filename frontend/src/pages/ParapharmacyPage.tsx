import { useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Search, Filter, ShoppingCart, Star, ChevronDown, Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useCart } from "@/contexts/CartContext";
import { toast } from "sonner";
import { CartDrawer } from "@/components/cart/CartDrawer";
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
  {
    name: "Bébé, enfant et maternité",
    products: ["Couches", "Lait infantile", "Biberons", "Soins bébé"]
  },
  {
    name: "Bouche et dents",
    products: ["Dentifrices", "Brosses à dents", "Bains de bouche", "Fil dentaire"]
  },
  {
    name: "Cheveux",
    products: ["Shampoings", "Après-shampoings", "Masques capillaires", "Sérums"]
  },
  {
    name: "Corps",
    products: ["Gels douche", "Crèmes hydratantes", "Déodorants", "Huiles corporelles"]
  },
  {
    name: "Matériel médical",
    products: ["Thermomètres", "Tensiomètres", "Pansements", "Compresses"]
  },
  {
    name: "Santé",
    products: ["Vitamines", "Compléments alimentaires", "Probiotiques", "Minéraux"]
  },
  {
    name: "Sexualité et intimité",
    products: ["Préservatifs", "Lubrifiants", "Tests de grossesse", "Hygiène intime"]
  },
  {
    name: "Visage",
    products: ["Crèmes hydratantes", "Sérums anti-âge", "Nettoyants", "Masques"]
  },
  {
    name: "Vétérinaire",
    products: ["Antiparasitaires", "Compléments animaux", "Soins dentaires", "Vitamines"]
  }
];

const mockProducts = [
  { id: 1, name: "Couches Pampers T3", category: "Bébé, enfant et maternité", price: 8500, rating: 4.8, inStock: true },
  { id: 2, name: "Dentifrice Signal White", category: "Bouche et dents", price: 1500, rating: 4.5, inStock: true },
  { id: 3, name: "Shampoing L'Oréal", category: "Cheveux", price: 3200, rating: 4.7, inStock: true },
  { id: 4, name: "Gel douche Dove", category: "Corps", price: 2100, rating: 4.6, inStock: true },
  { id: 5, name: "Thermomètre digital", category: "Matériel médical", price: 4500, rating: 4.9, inStock: true },
  { id: 6, name: "Vitamine C 1000mg", category: "Santé", price: 3500, rating: 4.7, inStock: true },
];

const ParapharmacyPage = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [priceSort, setPriceSort] = useState("default");
  const { addToCart } = useCart();

  const productImages: Record<number, string> = {
    1: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=500&q=80", // Couches
    2: "https://images.unsplash.com/photo-1559594482-e824888be1de?w=500&q=80", // Dentifrice
    3: "https://images.unsplash.com/photo-1535585209827-a15fcdbc4c2d?w=500&q=80", // Shampoing
    4: "https://images.unsplash.com/photo-1559594482-e824888be1de?w=500&q=80", // Gel douche
    5: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=500&q=80", // Thermomètre
    6: "https://images.unsplash.com/photo-1584017945366-b97b0e9b1179?w=500&q=80", // Vitamine
  };

  const filteredProducts = mockProducts
    .filter(product => {
      const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === "all" || product.category === selectedCategory;
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      if (priceSort === "asc") return a.price - b.price;
      if (priceSort === "desc") return b.price - a.price;
      return 0;
    });

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="py-12">
        <div className="container mx-auto px-4">
          <Button
            variant="ghost"
            onClick={() => navigate('/')}
            className="flex items-center gap-2 mb-8 hover:bg-primary/10 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Retour à l'accueil
          </Button>

          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4">Parapharmacie</h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Découvrez notre gamme complète de produits de parapharmacie
            </p>
          </div>

          {/* Filters */}
          <div className="bg-card p-6 rounded-lg border shadow-sm mb-8">
            <div className="flex items-center gap-2 mb-4">
              <Filter className="h-5 w-5 text-primary" />
              <h3 className="text-lg font-semibold">Recherche et filtres</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Rechercher un produit..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Catégorie" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toutes les catégories</SelectItem>
                  {categories.map(cat => (
                    <SelectItem key={cat.name} value={cat.name}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={priceSort} onValueChange={setPriceSort}>
                <SelectTrigger>
                  <SelectValue placeholder="Trier par prix" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="default">Prix par défaut</SelectItem>
                  <SelectItem value="asc">Prix croissant</SelectItem>
                  <SelectItem value="desc">Prix décroissant</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="mt-4 text-sm text-muted-foreground">
              {filteredProducts.length} produit(s) trouvé(s)
            </div>
          </div>

          {/* Categories Dropdown Menu */}
          <div className="mb-8">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="lg" className="w-full md:w-auto">
                  <Filter className="h-4 w-4 mr-2" />
                  Catégories de parapharmacie
                  <ChevronDown className="h-4 w-4 ml-2" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-80 max-h-[500px] overflow-y-auto bg-background z-50">
                <DropdownMenuLabel>Toutes les catégories</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {categories.map((category) => (
                  <DropdownMenuSub key={category.name}>
                    <DropdownMenuSubTrigger className="cursor-pointer">
                      {category.name}
                    </DropdownMenuSubTrigger>
                    <DropdownMenuSubContent className="w-56 bg-background z-50">
                      {category.products.map((product) => (
                        <DropdownMenuItem
                          key={product}
                          className="cursor-pointer"
                          onClick={() => setSearchTerm(product)}
                        >
                          {product}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuSubContent>
                  </DropdownMenuSub>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Products Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts.map(product => (
              <Card key={product.id} className="hover:shadow-lg transition-all glass-morphism overflow-hidden group">
                <CardContent className="p-0">
                  <div className="relative aspect-square overflow-hidden">
                    <img
                      src={productImages[product.id] || "/placeholder.svg"}
                      alt={product.name}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    {!product.inStock && (
                      <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] flex items-center justify-center">
                        <Badge variant="destructive" className="px-4 py-1 text-sm">Rupture de stock</Badge>
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="font-bold text-lg mb-1 truncate">{product.name}</h3>
                    <Badge variant="secondary" className="mb-3 text-[10px] uppercase tracking-wider">
                      {product.category}
                    </Badge>
                    <div className="flex items-center gap-1 mb-4">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`h-3 w-3 ${i < Math.floor(product.rating) ? 'fill-yellow-400 text-yellow-400' : 'text-slate-300'}`}
                        />
                      ))}
                      <span className="text-xs text-slate-500 ml-1">({product.rating})</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xl font-black text-primary">
                        {product.price.toLocaleString()} F
                      </span>
                      <Button
                        size="sm"
                        className="rounded-xl px-4"
                        disabled={!product.inStock}
                        onClick={() => {
                          addToCart({
                            medicine: {
                              id: product.id.toString(),
                              name: product.name,
                              description: product.category,
                              category: product.category,
                              requires_prescription: false,
                              manufacturer: '',
                              generic_name: '',
                              dosage: '',
                              form: '',
                              created_at: '',
                              updated_at: ''
                            },
                            quantity: 1,
                            pharmacy_id: 'mock-pharmacy',
                            pharmacy_name: 'Parapharmacie disponible',
                            price: product.price
                          });
                          toast.success(`${product.name} ajouté au panier`);
                        }}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Ajouter
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredProducts.length === 0 && (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-xl font-semibold mb-2">Aucun produit trouvé</h3>
              <p className="text-muted-foreground">Essayez de modifier vos critères de recherche</p>
            </div>
          )}
        </div>
      </main>
      <Footer />
      <CartDrawer />
    </div>
  );
};

export default ParapharmacyPage;
