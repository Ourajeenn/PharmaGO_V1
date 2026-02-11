import { useState, useEffect } from "react";
import { MedicineService } from "@/services/MedicineService";
import { Medicine } from "@/lib/supabase";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SEO from '@/components/SEO';
import { pagesSEO } from '@/config/seo';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Filter, Star, AlertCircle, Plus, Scale, Search, ShieldCheck, Zap, Sparkles, Bell } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useCart } from "@/contexts/CartContext";
import { useComparison } from "@/contexts/ComparisonContext";
import { toast } from "sonner";
import { CartDrawer } from "@/components/cart/CartDrawer";
import MedicineSearchWithSuggestions from "@/components/medicine/MedicineSearchWithSuggestions";
import PrescriptionUpload from "@/components/medicine/PrescriptionUpload";
import { MedicineDetailDialog } from "@/components/medicine/MedicineDetailDialog";
import { MedicineComparisonDialog } from "@/components/medicine/MedicineComparisonDialog";
import { PharmacyPriceComparison } from "@/components/medicine/PharmacyPriceComparison";
import { StockAlertDialog } from "@/components/medicine/StockAlertDialog";
import { RecommendationEngine } from "@/components/medicine/RecommendationEngine";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import dolipraneImg from "@/assets/medicines/doliprane.jpg";
import amoxicillineImg from "@/assets/medicines/amoxicilline.jpg";
import spasfonImg from "@/assets/medicines/spasfon.jpg";
import imodiumImg from "@/assets/medicines/imodium.jpg";
import homeopathieImg from "@/assets/medicines/homeopathie.jpg";
import sprayNasalImg from "@/assets/medicines/spray-nasal.jpg";
import dolipraneBoxImg from "@/assets/medicines/doliprane-box.jpg";
import amoxicillineBoxImg from "@/assets/medicines/amoxicilline-box.jpg";
import spasfonBoxImg from "@/assets/medicines/spasfon-box.jpg";
import pillsDetailImg from "@/assets/medicines/pills-detail.jpg";
import efferalganImg from "@/assets/medicines/efferalgan.png";
import advilImg from "@/assets/medicines/advil.png";
import vitaminCImg from "@/assets/medicines/vitamin-c.png";
import coughSyrupImg from "@/assets/medicines/cough-syrup.png";
import betadineImg from "@/assets/medicines/betadine.png";
import faceCreamImg from "@/assets/medicines/face-cream.png";
import shampooImg from "@/assets/medicines/shampoo.png";

const categories = [
  { name: "Appareil digestif", products: ["Anti-acides", "Anti-diarrhéiques", "Laxatifs", "Anti-nausées"] },
  { name: "Soins dentaires", products: ["Anti-douleurs dentaires", "Bains de bouche", "Gels gingivaux"] },
  { name: "Dermatologie", products: ["Anti-fongiques", "Crèmes corticoïdes", "Cicatrisants", "Anti-acné"] },
  { name: "Douleurs articulaires et musculaires", products: ["Anti-inflammatoires", "Gels anti-douleur", "Patchs chauffants"] },
  { name: "Douleurs et fièvre", products: ["Paracétamol", "Ibuprofène", "Aspirine", "Anti-migraineux"] },
  { name: "Forme, vitamines et minéraux", products: ["Multivitamines", "Fer", "Calcium", "Magnésium"] },
  { name: "Gynécologie", products: ["Contraceptifs", "Traitements hormonaux", "Anti-mycosiques vaginaux"] },
  { name: "Ophtalmologie", products: ["Collyres", "Larmes artificielles", "Anti-allergiques oculaires"] },
  { name: "ORL (nez, gorge, oreilles)", products: ["Anti-rhume", "Sprays nasaux", "Pastilles pour la gorge", "Gouttes auriculaires"] },
  { name: "Parasitologie", products: ["Anti-poux", "Anti-gale", "Vermifuges", "Anti-paludéens"] },
  { name: "Produits de diagnostic", products: ["Tests de glycémie", "Tests de grossesse", "Tests d'ovulation"] },
  { name: "Sang et appareil cardiovasculaire", products: ["Anti-hypertenseurs", "Anticoagulants", "Veinotoniques"] },
  { name: "Sevrage tabagique", products: ["Patchs nicotine", "Gommes", "Substituts nicotiniques"] },
  { name: "Sommeil et détente", products: ["Somnifères légers", "Anxiolytiques naturels", "Mélatonine"] },
  { name: "Système nerveux", products: ["Anti-épileptiques", "Anti-Parkinson", "Anxiolytiques"] },
  { name: "Urologie", products: ["Antibiotiques urinaires", "Antispasmodiques", "Compléments prostate"] },
  { name: "Vaccins", products: ["Vaccin grippe", "Vaccin hépatite", "Vaccin fièvre jaune"] },
  { name: "Médicaments sur ordonnance", products: ["Antibiotiques", "Anti-diabétiques", "Psychotropes", "Hormones"] },
  { name: "Homéopathie", products: ["Granules", "Doses", "Complexes homéopathiques", "Teintures mères"] }
];

const mockProducts = [
  { id: 1, name: "Doliprane 1000mg", category: "Douleurs et fièvre", price: 2500, rating: 4.8, inStock: true, prescription: true, image: dolipraneImg, images: [dolipraneImg, dolipraneBoxImg, pillsDetailImg], description: "Antalgique et antipyrétique efficace contre les douleurs et la fièvre", composition: "Paracétamol 1000mg", dosage: "1 comprimé toutes les 6 heures, maximum 4 comprimés par jour", sideEffects: ["Réactions allergiques rares", "Atteinte hépatique en cas de surdosage"], manufacturer: "Sanofi" },
  { id: 2, name: "Spasfon", category: "Appareil digestif", price: 3200, rating: 4.7, inStock: true, prescription: false, image: spasfonImg, images: [spasfonImg, spasfonBoxImg], description: "Antispasmodique pour le traitement des douleurs abdominales", composition: "Phloroglucinol 80mg", dosage: "2 comprimés 3 fois par jour", sideEffects: ["Réactions cutanées", "Troubles digestifs légers"], manufacturer: "Teva Santé" },
  { id: 3, name: "Imodium", category: "Appareil digestif", price: 2800, rating: 4.6, inStock: true, prescription: false, image: imodiumImg, images: [imodiumImg, pillsDetailImg], description: "Traitement symptomatique des diarrhées aiguës", composition: "Lopéramide 2mg", dosage: "2 gélules au début, puis 1 gélule après chaque selle liquide", sideEffects: ["Constipation", "Nausées", "Ballonnements"], manufacturer: "Johnson & Johnson" },
  { id: 4, name: "Amoxicilline 500mg", category: "Médicaments sur ordonnance", price: 4200, rating: 4.9, inStock: true, prescription: true, image: amoxicillineImg, images: [amoxicillineImg, amoxicillineBoxImg, pillsDetailImg], description: "Antibiotique à large spectre pour infections bactériennes", composition: "Amoxicilline 500mg", dosage: "1 gélule 3 fois par jour pendant 7 à 10 jours", sideEffects: ["Diarrhée", "Éruptions cutanées", "Candidose"], manufacturer: "Mylan" },
  { id: 5, name: "Oscillococcinum", category: "Homéopathie", price: 3500, rating: 4.5, inStock: true, prescription: false, image: homeopathieImg, images: [homeopathieImg], description: "Médicament homéopathique traditionnellement utilisé en cas d'état grippal", composition: "Anas Barbariae Hepatis et Cordis Extractum 200K", dosage: "1 dose le plus tôt possible, à renouveler si nécessaire", sideEffects: [], manufacturer: "Boiron" },
  { id: 6, name: "Spray nasal", category: "ORL (nez, gorge, oreilles)", price: 1800, rating: 4.4, inStock: true, prescription: false, image: sprayNasalImg, images: [sprayNasalImg], description: "Décongestionne et nettoie les voies nasales", composition: "Eau de mer isotonique", dosage: "2 à 3 pulvérisations par narine, 3 fois par jour", sideEffects: ["Irritation nasale légère"], manufacturer: "Laboratoires Gilbert" },
  { id: 7, name: "Efferalgan 1000mg", category: "Douleurs et fièvre", price: 2600, rating: 4.8, inStock: true, prescription: true, image: efferalganImg, images: [efferalganImg, pillsDetailImg], description: "Paracétamol effervescent pour soulager douleurs et fièvre", composition: "Paracétamol 1000mg", dosage: "1 comprimé toutes les 6 heures, max 4 par jour", sideEffects: ["Réactions cutanées rares"], manufacturer: "UPSA" },
  { id: 8, name: "Advil 400mg", category: "Douleurs et fièvre", price: 3100, rating: 4.7, inStock: true, prescription: false, image: advilImg, images: [advilImg, pillsDetailImg], description: "Anti-inflammatoire non stéroïdien, soulage la douleur et la fièvre", composition: "Ibuprofène 400mg", dosage: "1 comprimé 3 fois par jour au cours des repas", sideEffects: ["Brûlures d'estomac", "Nausées"], manufacturer: "Pfizer" },
  { id: 9, name: "Vitamine C UPSA", category: "Forme, vitamines et minéraux", price: 2200, rating: 4.6, inStock: true, prescription: false, image: vitaminCImg, images: [vitaminCImg], description: "Traitement de la fatigue passagère", composition: "Acide ascorbique 1000mg", dosage: "1 comprimé par jour, de préférence le matin", sideEffects: ["Agitation légère si pris le soir"], manufacturer: "UPSA" },
];

const parapharmacieProducts = [
  { id: 101, name: "Crème hydratante visage", category: "Cosmétiques", price: 8500, rating: 4.7, inStock: true, image: faceCreamImg, description: "Hydratation intense 24h" },
  { id: 102, name: "Sérum anti-âge", category: "Cosmétiques", price: 15000, rating: 4.8, inStock: true, image: dolipraneImg, description: "Réduit les rides et ridules" },
  { id: 111, name: "Shampooing fortifiant", category: "Cosmétiques", price: 7500, rating: 4.7, inStock: true, image: shampooImg, description: "Renforce les cheveux" },
  { id: 201, name: "Dentifrice blancheur", category: "Hygiène", price: 2800, rating: 4.7, inStock: true, image: sprayNasalImg, description: "Blanchit et protège" },
  { id: 301, name: "Lait corporel bébé", category: "Bébé & Maman", price: 6500, rating: 4.9, inStock: true, image: homeopathieImg, description: "Hydrate et protège" },
  { id: 401, name: "Multivitamines", category: "Compléments", price: 8500, rating: 4.7, inStock: true, image: spasfonImg, description: "Vitalité et énergie" },
];

const MedicinesPage = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const { addToCart } = useCart();
  const { addToComparison, removeFromComparison, isInComparison, comparisonList } = useComparison();
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [priceSort, setPriceSort] = useState("default");
  const [prescriptionFilter, setPrescriptionFilter] = useState("all");
  const [selectedMedicine, setSelectedMedicine] = useState<Medicine | any | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isComparisonOpen, setIsComparisonOpen] = useState(false);
  const [comparisonMedicine, setComparisonMedicine] = useState<any>(null); // For price comparison
  const [alertMedicine, setAlertMedicine] = useState<any>(null); // For stock alert
  const [parapharmacieCategory, setParapharmacieCategory] = useState("all");

  const [medicines, setMedicines] = useState<any[]>([]);
  const [allParapharmacie, setAllParapharmacie] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Pagination State
  const [medPage, setMedPage] = useState(1);
  const [medTotal, setMedTotal] = useState(0);
  const [paraPage, setParaPage] = useState(1);
  const [paraTotal, setParaTotal] = useState(0);
  const pageSize = 12;

  useEffect(() => {
    const fetchMedications = async () => {
      setLoading(true);
      try {
        const { data, count } = await MedicineService.getMedicines('medication', medPage, pageSize);
        const mapToUI = (item: any) => ({
          id: item.id,
          name: item.name,
          category: item.category || "Médicaments",
          price: Math.floor(Math.random() * 8000) + 500,
          rating: (4 + Math.random()).toFixed(1),
          inStock: Math.random() > 0.2, // 20% chance out of stock
          prescription: item.requires_prescription,
          image: dolipraneImg,
          images: [dolipraneImg],
          description: item.description || `DCI: ${item.dci || 'N/A'}.`,
          composition: item.dci || item.generic_name || "N/A",
          dosage: item.dosage || "Selon avis médical",
          sideEffects: ["Consultez la notice pour plus d'informations"],
          manufacturer: item.manufacturer || "Non spécifié",
          ammNumber: item.amm_number,
          countryOfOrigin: item.country_of_origin,
          genericName: item.generic_name,
          productType: item.product_type
        });

        setMedicines(data.length > 0 ? data.map(mapToUI) : mockProducts.slice(0, pageSize));
        setMedTotal(count || (data.length === 0 ? mockProducts.length : 0));
      } catch (error) {
        console.error("Error loading medicines:", error);
        setMedicines(mockProducts.slice(0, pageSize));
      } finally {
        setLoading(false);
      }
    };
    fetchMedications();
  }, [medPage]);

  useEffect(() => {
    const fetchPara = async () => {
      setLoading(true);
      try {
        const [suppResult, phytoResult] = await Promise.all([
          MedicineService.getMedicines('supplement', paraPage, pageSize / 2),
          MedicineService.getMedicines('phytomedicine', paraPage, pageSize / 2)
        ]);
        const mapToUI = (item: any) => ({
          id: item.id,
          name: item.name,
          category: item.category || (item.product_type === 'supplement' ? "Compléments" : "Phytothérapie"),
          price: Math.floor(Math.random() * 5000) + 1500,
          rating: (4 + Math.random()).toFixed(1),
          inStock: true,
          prescription: false,
          image: vitaminCImg,
          images: [vitaminCImg],
          description: item.description || `Bio et naturel.`,
          composition: item.generic_name || "Plantes et actifs naturels",
          dosage: item.dosage || "1 à 2 fois par jour",
          sideEffects: ["Pas d'effets secondaires notoires"],
          manufacturer: item.manufacturer || "Laboratoire Naturel",
          ammNumber: item.amm_number,
          countryOfOrigin: item.country_of_origin,
          productType: item.product_type
        });
        const combinedPara = [...suppResult.data, ...phytoResult.data].map(mapToUI);
        setAllParapharmacie(combinedPara.length > 0 ? combinedPara : parapharmacieProducts.slice(0, pageSize));
        setParaTotal((suppResult.count + phytoResult.count) || (combinedPara.length === 0 ? parapharmacieProducts.length : 0));
      } catch (error) {
        console.error("Error loading parapharmacie:", error);
        setAllParapharmacie(parapharmacieProducts.slice(0, pageSize));
      } finally {
        setLoading(false);
      }
    };
    fetchPara();
  }, [paraPage]);

  const filteredProducts = medicines
    .filter(product => {
      const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === "all" || product.category === selectedCategory;
      const matchesPrescription = prescriptionFilter === "all" ||
        (prescriptionFilter === "prescription" && product.prescription) ||
        (prescriptionFilter === "libre" && !product.prescription);
      return matchesSearch && matchesCategory && matchesPrescription;
    })
    .sort((a, b) => {
      if (priceSort === "asc") return a.price - b.price;
      if (priceSort === "desc") return b.price - a.price;
      return 0;
    });

  const filteredPara = allParapharmacie
    .filter(product => {
      const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = parapharmacieCategory === "all" || product.category === parapharmacieCategory;
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      if (priceSort === "asc") return a.price - b.price;
      if (priceSort === "desc") return b.price - a.price;
      return 0;
    });

  return (
    <>
      <SEO {...pagesSEO.medicines} />
      <div className="min-h-screen mesh-gradient bg-slate-50 selection:bg-primary selection:text-white font-jakarta">
        <Header />

        {/* Floating comparison button */}
        {comparisonList.length > 0 && (
          <div className="fixed bottom-10 right-10 z-50">
            <Button
              size="lg"
              onClick={() => setIsComparisonOpen(true)}
              className="shadow-[0_20px_50px_rgba(0,112,192,0.3)] bg-primary hover:bg-primary-hover text-white font-black uppercase tracking-widest h-16 px-8 rounded-2xl border border-white/20 transition-all hover:scale-105"
            >
              <Scale className="h-5 w-5 mr-3" />
              Comparer ({comparisonList.length})
            </Button>
          </div>
        )}

        <main className="py-16 pt-32">
          <div className="container mx-auto px-6 max-w-7xl">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-16 animate-in fade-in slide-in-from-bottom-6 duration-700">
              <div className="space-y-4">
                <Button
                  variant="ghost"
                  onClick={() => navigate('/')}
                  className="flex items-center gap-2 -ml-4 text-muted-foreground hover:text-foreground hover:bg-white/40 rounded-xl px-4 transition-all font-bold group"
                >
                  <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
                  <span className="text-[10px] uppercase tracking-[0.2em] font-black">Retour</span>
                </Button>
                <div className="space-y-2">
                  <h1 className="text-5xl lg:text-7xl font-black tracking-tighter uppercase text-foreground/90 leading-[0.9]">
                    Santé <span className="text-primary tracking-normal italic">& Bien-être</span>
                  </h1>
                  <p className="text-sm font-black uppercase tracking-[0.3em] text-muted-foreground/60">
                    Catalogue pharmaceutique haute fidélité
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4 bg-white/40 backdrop-blur-xl p-2 rounded-2xl border border-white/60 shadow-xl">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
                  <ShieldCheck className="h-6 w-6" />
                </div>
                <div className="pr-4">
                  <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Sécurité</p>
                  <p className="text-xs font-bold text-foreground">Produits Certifiés AMM</p>
                </div>
              </div>
            </div>

            <Tabs defaultValue="medicines" className="w-full space-y-12">
              <div className="flex justify-center">
                <TabsList className="bg-white/40 backdrop-blur-xl p-1.5 rounded-[1.5rem] border border-white/60 shadow-2xl w-full max-w-xl h-20">
                  <TabsTrigger value="medicines" className="rounded-2xl h-full data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-xl transition-all font-black uppercase tracking-widest text-[10px] flex-1">
                    <Zap className="h-4 w-4 mr-2" />
                    Médicaments
                  </TabsTrigger>
                  <TabsTrigger value="parapharmacie" className="rounded-2xl h-full data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-xl transition-all font-black uppercase tracking-widest text-[10px] flex-1">
                    <Sparkles className="h-4 w-4 mr-2" />
                    Parapharmacie
                  </TabsTrigger>
                </TabsList>
              </div>

              <TabsContent value="medicines" className="space-y-12 outline-none">
                {/* Search & Global Actions */}
                <div className="glass-card bg-white/40 backdrop-blur-xl p-8 rounded-[2.5rem] border border-white/60 shadow-2xl mb-12 animate-in fade-in duration-1000">
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                    <div className="lg:col-span-5 relative group">
                      <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                      <MedicineSearchWithSuggestions
                        onSearch={(term) => setSearchTerm(term)}
                        className="h-16 pl-14 pr-6 rounded-2xl bg-white/60 border-white/60 border-2 focus:border-primary/40 focus:bg-white transition-all shadow-inner font-bold text-lg"
                        placeholder="Rechercher par nom, DCI, symptôme..."
                      />
                    </div>



                    <div className="lg:col-span-3">
                      <PrescriptionUpload onUpload={(file) => {
                        toast.success("Ordonnance analysée par le système");
                      }} />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-10">
                    <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                      <SelectTrigger className="h-14 rounded-xl bg-white/40 border-white/40 font-bold px-6 focus:ring-primary/20">
                        <div className="flex items-center gap-2">
                          <Filter className="h-4 w-4 text-primary" />
                          <SelectValue placeholder="Toutes les catégories" />
                        </div>
                      </SelectTrigger>
                      <SelectContent className="glass-morphism border-white/40 rounded-xl">
                        <SelectItem value="all">Toutes les spécialités</SelectItem>
                        {categories.map(cat => (
                          <SelectItem key={cat.name} value={cat.name}>{cat.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <Select value={prescriptionFilter} onValueChange={setPrescriptionFilter}>
                      <SelectTrigger className="h-14 rounded-xl bg-white/40 border-white/40 font-bold px-6 focus:ring-primary/20">
                        <SelectValue placeholder="Délivrance" />
                      </SelectTrigger>
                      <SelectContent className="glass-morphism border-white/40 rounded-xl">
                        <SelectItem value="all">Tous les régimes</SelectItem>
                        <SelectItem value="prescription">Sur ordonnance (RX)</SelectItem>
                        <SelectItem value="libre">Vente libre (OTC)</SelectItem>
                      </SelectContent>
                    </Select>

                    <Select value={priceSort} onValueChange={setPriceSort}>
                      <SelectTrigger className="h-14 rounded-xl bg-white/40 border-white/40 font-bold px-6 focus:ring-primary/20">
                        <SelectValue placeholder="Trier les prix" />
                      </SelectTrigger>
                      <SelectContent className="glass-morphism border-white/40 rounded-xl">
                        <SelectItem value="default">Pertinence</SelectItem>
                        <SelectItem value="asc">Prix Croissant</SelectItem>
                        <SelectItem value="desc">Prix Décroissant</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Hero Category Bento (Optional/Strategic) */}
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-16 overflow-x-auto pb-4 no-scrollbar">
                  {categories.slice(0, 12).map((cat, i) => (
                    <button
                      key={cat.name}
                      onClick={() => setSelectedCategory(cat.name)}
                      className={`flex flex-col items-center justify-center p-6 rounded-[2rem] border transition-all min-w-[140px] aspect-square ${selectedCategory === cat.name
                        ? 'bg-primary text-white border-primary shadow-2xl scale-105'
                        : 'bg-white/40 text-foreground border-white/60 hover:bg-white/80'
                        }`}
                    >
                      <div className={`w-10 h-10 rounded-xl mb-3 flex items-center justify-center ${selectedCategory === cat.name ? 'bg-white/20' : 'bg-primary/10 text-primary'}`}>
                        <Zap className="h-5 w-5" />
                      </div>
                      <span className="text-[10px] font-black uppercase tracking-widest text-center leading-tight">{cat.name}</span>
                    </button>
                  ))}
                </div>

                {/* Main Product Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                  {filteredProducts.map((product, idx) => (
                    <div
                      key={product.id}
                      className="glass-card group bg-white/40 backdrop-blur-xl rounded-[2.5rem] border border-white/60 shadow-xl overflow-hidden hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 cursor-pointer animate-in fade-in slide-in-from-bottom-4"
                      style={{ animationDelay: `${idx * 50}ms` }}
                      onClick={() => {
                        setSelectedMedicine(product)
                        setIsDetailOpen(true)
                      }}
                    >
                      <div className="p-6 h-full flex flex-col">
                        <div className="relative aspect-square rounded-[2rem] overflow-hidden mb-6 bg-white/60 border border-white/40">
                          <img
                            src={product.image}
                            alt={product.name}
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                          />
                          {product.prescription && (
                            <div className="absolute top-4 right-4 bg-amber-500 text-white text-[8px] font-black uppercase tracking-[0.2em] px-3 py-1.5 rounded-full shadow-xl">
                              Ordonnance RX
                            </div>
                          )}
                          {!product.inStock && (
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-black/80 backdrop-blur-sm text-white px-4 py-2 rounded-xl text-center transform -rotate-12 border border-white/20 shadow-2xl z-10">
                              <p className="text-xl font-black uppercase tracking-widest">Rupture</p>
                              <p className="text-[10px] font-medium text-white/80">Momentanée</p>
                            </div>
                          )}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              isInComparison(product.id) ? removeFromComparison(product.id) : addToComparison(product);
                            }}
                            className={`absolute bottom-4 right-4 w-10 h-10 rounded-xl flex items-center justify-center border transition-all ${isInComparison(product.id)
                              ? 'bg-primary text-white border-primary shadow-lg'
                              : 'bg-white/80 text-muted-foreground border-white/60 hover:bg-white hover:text-primary shadow-md'
                              }`}
                          >
                            <Scale className="h-4 w-4" />
                          </button>
                        </div>

                        <div className="flex-1 space-y-2">
                          <div className="flex justify-between items-start gap-2">
                            <h3 className="text-xl font-black tracking-tighter uppercase text-foreground group-hover:text-primary transition-colors leading-tight line-clamp-2">
                              {product.name}
                            </h3>
                            <div className="flex items-center gap-1.5 px-2 py-1 bg-white/60 rounded-lg border border-white/40 shadow-sm">
                              <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                              <span className="text-[10px] font-black text-foreground">{product.rating}</span>
                            </div>
                          </div>
                          <p className="text-[10px] font-black uppercase tracking-widest text-primary/60 truncate">
                            {product.category}
                          </p>
                          <p className="text-xs font-medium text-muted-foreground line-clamp-2 min-h-[2rem]">
                            {product.description}
                          </p>
                        </div>

                        <div className="mt-8 pt-6 border-t border-white/40 flex items-center justify-between">
                          <div className="space-y-0.5">
                            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">À partir de</p>
                            <p className="text-2xl font-black tracking-tighter text-primary">
                              {(product.price * 0.95).toFixed(0).toLocaleString()} <span className="text-sm tracking-normal">FCFA</span>
                            </p>
                          </div>

                          <div className="flex gap-2">
                            <Button
                              size="icon"
                              variant="outline"
                              onClick={(e) => {
                                e.stopPropagation();
                                setComparisonMedicine(product);
                              }}
                              className="h-14 w-14 rounded-2xl border-2 border-primary/20 text-primary hover:bg-primary/10 transition-all font-bold"
                              title="Comparer les prix"
                            >
                              <Scale className="h-5 w-5" />
                            </Button>

                            {product.inStock ? (
                              <Button
                                size="icon"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  addToCart({
                                    medicine: { id: product.id.toString(), name: product.name, description: product.category, category: product.category, requires_prescription: product.prescription, manufacturer: product.manufacturer || '', generic_name: product.genericName || '', dosage: product.dosage || '', form: '', created_at: '', updated_at: '' },
                                    quantity: 1, pharmacy_id: 'mock-pharmacy', pharmacy_name: 'PharmaGo Prime', price: product.price
                                  });
                                  toast.success(`${product.name} ajouté au panier`);
                                }}
                                className="h-14 w-14 rounded-2xl bg-foreground text-background hover:bg-primary hover:text-white transition-all shadow-xl hover:shadow-primary/40 group-hover:rotate-6"
                              >
                                <Plus className="h-6 w-6" />
                              </Button>
                            ) : (
                              <Button
                                size="icon"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setAlertMedicine(product);
                                }}
                                className="h-14 w-14 rounded-2xl bg-amber-100 text-amber-600 hover:bg-amber-500 hover:text-white transition-all shadow-xl hover:shadow-amber-500/40"
                                title="M'alerter du retour en stock"
                              >
                                <Bell className="h-6 w-6" />
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Empty State */}
                {
                  filteredProducts.length === 0 && (
                    <div className="text-center py-20 glass-card bg-white/20 backdrop-blur-md rounded-[3rem] border border-white/40 max-w-2xl mx-auto">
                      <Search className="h-16 w-16 text-muted-foreground mx-auto mb-6 opacity-20" />
                      <h3 className="text-2xl font-black uppercase tracking-tighter text-foreground mb-2">Aucun Résultat Alpha</h3>
                      <p className="text-sm font-medium text-muted-foreground max-w-xs mx-auto">Modifiez vos filtres ou effectuez une nouvelle recherche pour affiner le catalogue.</p>
                      <Button variant="outline" onClick={() => { setSearchTerm(""); setSelectedCategory("all"); setPrescriptionFilter("all"); }} className="mt-8 rounded-xl font-black uppercase tracking-widest text-[10px]">Réinitialiser Tout</Button>
                    </div>
                  )
                }

                {/* Dashboard Pagination */}
                {medTotal > pageSize && (
                  <div className="flex justify-center items-center gap-6 mt-20 pb-10">
                    <Button
                      variant="ghost"
                      onClick={() => { setMedPage(p => Math.max(1, p - 1)); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                      disabled={medPage === 1}
                      className="h-14 px-8 rounded-xl font-black uppercase tracking-widest text-[10px] border border-white/60 bg-white/30 hover:bg-primary hover:text-white transition-all"
                    >
                      Protocole Précédent
                    </Button>
                    <div className="bg-white/40 backdrop-blur-md border border-white/60 h-14 px-6 rounded-xl flex items-center justify-center min-w-[120px]">
                      <span className="text-xs font-black uppercase tracking-[0.2em] text-foreground">Séquence {medPage} / {Math.ceil(medTotal / pageSize)}</span>
                    </div>
                    <Button
                      variant="ghost"
                      onClick={() => { setMedPage(p => p + 1); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                      disabled={medPage >= Math.ceil(medTotal / pageSize)}
                      className="h-14 px-8 rounded-xl font-black uppercase tracking-widest text-[10px] border border-white/60 bg-white/30 hover:bg-primary hover:text-white transition-all"
                    >
                      Protocole Suivant
                    </Button>
                  </div>
                )}

                {/* Recommendation Engine */}
                <div className="mt-16 animate-in slide-in-from-bottom-8 duration-700 delay-300">
                  <RecommendationEngine
                    userId="current-user"
                    onAddToCart={(med) => {
                      addToCart({
                        medicine: { id: med.id, name: med.name, description: med.category, category: med.category, requires_prescription: false, manufacturer: '', generic_name: '', dosage: '', form: '', created_at: '', updated_at: '' },
                        quantity: 1, pharmacy_id: 'mock-pharmacy', pharmacy_name: 'PharmaGo Prime', price: med.price
                      });
                      toast.success(`${med.name} ajouté au panier`);
                    }}
                  />
                </div>
              </TabsContent>

              <TabsContent value="parapharmacie" className="space-y-12 outline-none">
                <div className="glass-card bg-white/40 backdrop-blur-xl p-8 rounded-[2.5rem] border border-white/60 shadow-2xl mb-12 animate-in fade-in duration-1000">
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                    <div className="lg:col-span-8 relative group">
                      <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                      <input
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full h-16 pl-14 pr-6 rounded-2xl bg-white/60 border-white/60 border-2 focus:border-primary/40 focus:bg-white transition-all shadow-inner font-bold text-lg outline-none"
                        placeholder="Soins cosmétiques, vitamines, hygiène..."
                      />
                    </div>
                    <div className="lg:col-span-4">
                      <Select value={parapharmacieCategory} onValueChange={setParapharmacieCategory}>
                        <SelectTrigger className="h-16 rounded-2xl bg-white/40 border-white/40 font-bold px-6 focus:ring-primary/20">
                          <div className="flex items-center gap-2">
                            <Filter className="h-4 w-4 text-primary" />
                            <SelectValue placeholder="Toutes les gammes" />
                          </div>
                        </SelectTrigger>
                        <SelectContent className="glass-morphism border-white/40 rounded-xl">
                          <SelectItem value="all">Toutes les gammes</SelectItem>
                          <SelectItem value="Cosmétiques">Cosmétiques & Beauté</SelectItem>
                          <SelectItem value="Hygiène">Hygiène & Soins</SelectItem>
                          <SelectItem value="Bébé & Maman">Bébé & Maman</SelectItem>
                          <SelectItem value="Compléments">Vitamines & Énergie</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                  {filteredPara.map((product, idx) => (
                    <div
                      key={product.id}
                      className="glass-card group bg-white/40 backdrop-blur-xl rounded-[2.5rem] border border-white/60 shadow-xl overflow-hidden hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 cursor-pointer animate-in fade-in slide-in-from-bottom-4"
                      style={{ animationDelay: `${idx * 50}ms` }}
                      onClick={() => { setSelectedMedicine(product); setIsDetailOpen(true); }}
                    >
                      <div className="p-6 h-full flex flex-col">
                        <div className="relative aspect-square rounded-[2rem] overflow-hidden mb-6 bg-white/60 border border-white/40">
                          <img
                            src={product.image}
                            alt={product.name}
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                          />
                          <div className="absolute top-4 left-4 bg-white/80 backdrop-blur-md text-primary text-[8px] font-black uppercase tracking-[0.2em] px-3 py-1.5 rounded-full shadow-lg border border-white/60">
                            Naturel
                          </div>
                        </div>
                        <div className="flex-1 space-y-2">
                          <div className="flex justify-between items-start gap-2">
                            <h3 className="text-xl font-black tracking-tighter uppercase text-foreground group-hover:text-primary transition-colors leading-tight line-clamp-2">
                              {product.name}
                            </h3>
                            <div className="flex items-center gap-1.5 px-2 py-1 bg-white/60 rounded-lg border border-white/40 shadow-sm">
                              <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                              <span className="text-[10px] font-black text-foreground">{product.rating}</span>
                            </div>
                          </div>
                          <p className="text-[10px] font-black uppercase tracking-widest text-primary/60 truncate">
                            {product.category}
                          </p>
                          <p className="text-xs font-medium text-muted-foreground line-clamp-2 min-h-[2rem]">
                            {product.description}
                          </p>
                        </div>
                        <div className="mt-8 pt-6 border-t border-white/40 flex items-center justify-between">
                          <div className="space-y-0.5">
                            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Prix Boutique</p>
                            <p className="text-2xl font-black tracking-tighter text-primary">
                              {product.price.toLocaleString()} <span className="text-sm tracking-normal">FCFA</span>
                            </p>
                          </div>
                          <Button
                            size="icon"
                            onClick={(e) => {
                              e.stopPropagation();
                              addToCart({
                                medicine: { id: product.id.toString(), name: product.name, description: product.category, category: product.category, requires_prescription: false, manufacturer: '', generic_name: '', dosage: '', form: '', created_at: '', updated_at: '' },
                                quantity: 1, pharmacy_id: 'mock-pharmacy', pharmacy_name: 'PharmaGo Prime', price: product.price
                              });
                              toast.success(`${product.name} ajouté au panier`);
                            }}
                            className="h-14 w-14 rounded-2xl bg-foreground text-background hover:bg-primary hover:text-white transition-all shadow-xl hover:shadow-primary/40"
                          >
                            <Plus className="h-6 w-6" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </main >

        <Footer />
        <CartDrawer />
        <MedicineDetailDialog
          open={isDetailOpen}
          onOpenChange={setIsDetailOpen}
          medicine={selectedMedicine}
        />
        <MedicineComparisonDialog
          open={isComparisonOpen}
          onOpenChange={setIsComparisonOpen}
        />
        <PharmacyPriceComparison
          open={!!comparisonMedicine}
          onOpenChange={(open) => !open && setComparisonMedicine(null)}
          medicine={comparisonMedicine}
        />
        <StockAlertDialog
          open={!!alertMedicine}
          onOpenChange={(open) => !open && setAlertMedicine(null)}
          medicineName={alertMedicine?.name || ""}
        />
      </div >
    </>
  );
};

export default MedicinesPage;
