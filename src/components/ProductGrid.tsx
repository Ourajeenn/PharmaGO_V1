import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MapPin, Star, Clock, ShoppingCart, Search, Filter, Heart, Plus } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { toast } from "sonner";
import ScrollReveal from "@/components/ScrollReveal";

const products = [
  {
    id: 1,
    name: "Doliprane 1000mg",
    price: 2500,
    category: "Antalgique",
    type: "Prescription",
    image: "/placeholder.svg",
    rating: 4.8,
    reviews: 124,
    inStock: true,
    pharmacy: "Pharmacie du Centre",
    distance: "1.2 km",
    delivery: "15-20 min",
    description: "Paracétamol pour douleurs et fièvre",
    molecule: "Paracétamol",
    symptoms: ["Fièvre", "Douleur", "Maux de tête"]
  },
  {
    id: 2,
    name: "Amoxicilline 500mg",
    price: 3200,
    category: "Antibiotique",
    type: "Prescription",
    image: "/placeholder.svg",
    rating: 4.9,
    reviews: 89,
    inStock: true,
    pharmacy: "Pharmacie de la Paix",
    distance: "2.1 km",
    delivery: "20-25 min",
    description: "Antibiotique à large spectre",
    molecule: "Amoxicilline",
    symptoms: ["Infection bactérienne", "Angine", "Otite"]
  },
  {
    id: 3,
    name: "Vitamines C 1000mg",
    price: 1800,
    category: "Complément",
    type: "Libre",
    image: "/placeholder.svg",
    rating: 4.7,
    reviews: 156,
    inStock: true,
    pharmacy: "Pharmacie Moderne",
    distance: "0.8 km",
    delivery: "10-15 min",
    description: "Complément vitaminique",
    molecule: "Acide ascorbique",
    symptoms: ["Fatigue", "Rhume", "Carence"]
  },
  {
    id: 4,
    name: "Sérum physiologique",
    price: 800,
    category: "Hygiène",
    type: "Libre",
    image: "/placeholder.svg",
    rating: 4.6,
    reviews: 203,
    inStock: false,
    pharmacy: "Pharmacie de la Santé",
    distance: "1.5 km",
    delivery: "Indisponible",
    description: "Solution pour lavage nasal",
    molecule: "Chlorure de sodium",
    symptoms: ["Nez bouché", "Yeux secs"]
  },
  {
    id: 5,
    name: "Ibuprofen 400mg",
    price: 2200,
    category: "Anti-inflammatoire",
    type: "Prescription",
    image: "/placeholder.svg",
    rating: 4.8,
    reviews: 98,
    inStock: true,
    pharmacy: "Pharmacie Express",
    distance: "0.5 km",
    delivery: "10-15 min",
    description: "Anti-inflammatoire non stéroïdien",
    molecule: "Ibuprofène",
    symptoms: ["Douleur", "Inflammation", "Courbatures"]
  },
  {
    id: 6,
    name: "Thermomètre digital",
    price: 4500,
    category: "Matériel médical",
    type: "Libre",
    image: "/placeholder.svg",
    rating: 4.9,
    reviews: 67,
    inStock: true,
    pharmacy: "Pharmacie du Port",
    distance: "3.2 km",
    delivery: "25-30 min",
    description: "Thermomètre électronique précis",
    molecule: "",
    symptoms: ["Fièvre"]
  }
];

import { useSearchParams } from "react-router-dom";
import { useEffect } from "react";

// ... existing imports

const ProductGrid = () => {
  const [searchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState(searchParams.get("q") || "");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedType, setSelectedType] = useState("all");
  const [priceRange, setPriceRange] = useState("all");
  const [favorites, setFavorites] = useState<number[]>([]);
  const { addToCart } = useCart();

  useEffect(() => {
    const query = searchParams.get("q");
    if (query) {
      setSearchTerm(query);
    }
  }, [searchParams]);

  const categories = ["all", "Antalgique", "Antibiotique", "Complément", "Hygiène", "Anti-inflammatoire", "Matériel médical"];
  const types = ["all", "Prescription", "Libre"];
  const priceRanges = [
    { value: "all", label: "Tous les prix" },
    { value: "0-1000", label: "0 - 1,000 FCFA" },
    { value: "1000-3000", label: "1,000 - 3,000 FCFA" },
    { value: "3000-5000", label: "3,000 - 5,000 FCFA" },
    { value: "5000+", label: "5,000+ FCFA" }
  ];

  const toggleFavorite = (id: number) => {
    setFavorites(prev =>
      prev.includes(id)
        ? prev.filter(fav => fav !== id)
        : [...prev, id]
    );
  };

  const filteredProducts = products.filter(product => {
    const term = searchTerm.toLowerCase();
    const matchesSearch =
      product.name.toLowerCase().includes(term) ||
      product.description.toLowerCase().includes(term) ||
      (product.molecule && product.molecule.toLowerCase().includes(term)) ||
      (product.symptoms && product.symptoms.some(s => s.toLowerCase().includes(term)));

    const matchesCategory = selectedCategory === "all" || product.category === selectedCategory;
    const matchesType = selectedType === "all" || product.type === selectedType;

    let matchesPrice = true;
    if (priceRange !== "all") {
      if (priceRange === "0-1000") matchesPrice = product.price <= 1000;
      else if (priceRange === "1000-3000") matchesPrice = product.price > 1000 && product.price <= 3000;
      else if (priceRange === "3000-5000") matchesPrice = product.price > 3000 && product.price <= 5000;
      else if (priceRange === "5000+") matchesPrice = product.price > 5000;
    }

    return matchesSearch && matchesCategory && matchesType && matchesPrice;
  });

  return (
    <section className="py-16" id="medicaments">
      <div className="container mx-auto px-4">
        <ScrollReveal animation="fade-up">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Médicaments & Produits de Santé
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Découvrez notre large gamme de médicaments et produits de santé disponibles dans les pharmacies d'Abidjan
            </p>
          </div>
        </ScrollReveal>

        {/* Filters */}
        <ScrollReveal animation="fade-up" delay={0.2}>
          <div className="bg-card p-6 rounded-lg border shadow-sm mb-8">
            <div className="flex items-center gap-2 mb-4">
              <Filter className="h-5 w-5 text-primary" />
              <h3 className="text-lg font-semibold">Filtres de recherche</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Rechercher par nom, molécule, symptôme..."
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
                  {categories.map(category => (
                    <SelectItem key={category} value={category}>
                      {category === "all" ? "Toutes les catégories" : category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={selectedType} onValueChange={setSelectedType}>
                <SelectTrigger>
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  {types.map(type => (
                    <SelectItem key={type} value={type}>
                      {type === "all" ? "Tous les types" : type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={priceRange} onValueChange={setPriceRange}>
                <SelectTrigger>
                  <SelectValue placeholder="Prix" />
                </SelectTrigger>
                <SelectContent>
                  {priceRanges.map(range => (
                    <SelectItem key={range.value} value={range.value}>
                      {range.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="mt-4 text-sm text-muted-foreground">
              {filteredProducts.length} produit(s) trouvé(s)
            </div>
          </div>
        </ScrollReveal>

        {/* Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map((product, index) => (
            <ScrollReveal key={product.id} animation="fade-up" delay={index * 0.1}>
              <Card
                className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-primary/10 hover:border-primary/30 h-full"
              >
                <CardContent className="p-0">
                  <div className="relative">
                    <div className="aspect-square bg-gradient-to-br from-primary/5 to-secondary/5 flex items-center justify-center text-6xl">
                      💊
                    </div>
                    <div className="absolute top-3 right-3 flex flex-col gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        className={`h-8 w-8 p-0 bg-white/80 hover:bg-white ${favorites.includes(product.id) ? 'text-red-500' : 'text-gray-400'
                          }`}
                        onClick={() => toggleFavorite(product.id)}
                      >
                        <Heart className={`h-4 w-4 ${favorites.includes(product.id) ? 'fill-current' : ''}`} />
                      </Button>
                      {product.type === "Prescription" && (
                        <Badge className="bg-accent/10 text-accent border-accent/20 text-xs">
                          Ordonnance
                        </Badge>
                      )}
                    </div>
                    {!product.inStock && (
                      <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                        <Badge variant="destructive">Indisponible</Badge>
                      </div>
                    )}
                  </div>

                  <div className="p-4 space-y-3">
                    <div>
                      <h3 className="font-semibold text-lg group-hover:text-primary transition-colors">
                        {product.name}
                      </h3>
                      {product.molecule && (
                        <p className="text-xs text-primary/80 font-medium">{product.molecule}</p>
                      )}
                      <p className="text-sm text-muted-foreground">{product.description}</p>
                    </div>

                    <div className="flex items-center justify-between">
                      <Badge variant="outline" className="text-xs">
                        {product.category}
                      </Badge>
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span className="text-sm font-medium">{product.rating}</span>
                        <span className="text-xs text-muted-foreground">({product.reviews})</span>
                      </div>
                    </div>

                    <div className="border-t pt-3">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                        <MapPin className="h-4 w-4" />
                        <span>{product.pharmacy}</span>
                        <span>•</span>
                        <span>{product.distance}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Clock className="h-4 w-4 text-secondary" />
                        <span className={product.inStock ? "text-secondary" : "text-destructive"}>
                          {product.delivery}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2">
                      <span className="text-xl font-bold text-primary">
                        {product.price.toLocaleString()} FCFA
                      </span>
                      <Button
                        size="sm"
                        disabled={!product.inStock}
                        className="hover:shadow-md transition-all duration-200"
                        onClick={() => {
                          addToCart({
                            medicine: {
                              id: product.id.toString(),
                              name: product.name,
                              description: product.description,
                              category: product.category,
                              requires_prescription: product.type === 'Prescription',
                              manufacturer: '',
                              generic_name: '',
                              dosage: '',
                              form: '',
                              created_at: '',
                              updated_at: ''
                            },
                            quantity: 1,
                            pharmacy_id: 'mock-pharmacy',
                            pharmacy_name: product.pharmacy,
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
            </ScrollReveal>
          ))}
        </div>

        {
          filteredProducts.length === 0 && (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-xl font-semibold mb-2">Aucun produit trouvé</h3>
              <p className="text-muted-foreground">Essayez de modifier vos critères de recherche</p>
            </div>
          )
        }
      </div>
    </section>
  );
};

export default ProductGrid;