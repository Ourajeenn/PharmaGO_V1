import { useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SEO from '@/components/SEO';
import { pagesSEO } from '@/config/seo';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Filter, Star, AlertCircle, Plus, Scale } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useCart } from "@/contexts/CartContext";
import { useComparison } from "@/contexts/ComparisonContext";
import { toast } from "sonner";
import { CartDrawer } from "@/components/cart/CartDrawer";
import MedicineSearchWithSuggestions from "@/components/medicine/MedicineSearchWithSuggestions";
import PrescriptionUpload from "@/components/medicine/PrescriptionUpload";
import { MedicineDetailDialog } from "@/components/medicine/MedicineDetailDialog";
import { MedicineComparisonDialog } from "@/components/medicine/MedicineComparisonDialog";
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
  {
    name: "Appareil digestif",
    products: ["Anti-acides", "Anti-diarrhéiques", "Laxatifs", "Anti-nausées"]
  },
  {
    name: "Soins dentaires",
    products: ["Anti-douleurs dentaires", "Bains de bouche", "Gels gingivaux"]
  },
  {
    name: "Dermatologie",
    products: ["Anti-fongiques", "Crèmes corticoïdes", "Cicatrisants", "Anti-acné"]
  },
  {
    name: "Douleurs articulaires et musculaires",
    products: ["Anti-inflammatoires", "Gels anti-douleur", "Patchs chauffants"]
  },
  {
    name: "Douleurs et fièvre",
    products: ["Paracétamol", "Ibuprofène", "Aspirine", "Anti-migraineux"]
  },
  {
    name: "Forme, vitamines et minéraux",
    products: ["Multivitamines", "Fer", "Calcium", "Magnésium"]
  },
  {
    name: "Gynécologie",
    products: ["Contraceptifs", "Traitements hormonaux", "Anti-mycosiques vaginaux"]
  },
  {
    name: "Ophtalmologie",
    products: ["Collyres", "Larmes artificielles", "Anti-allergiques oculaires"]
  },
  {
    name: "ORL (nez, gorge, oreilles)",
    products: ["Anti-rhume", "Sprays nasaux", "Pastilles pour la gorge", "Gouttes auriculaires"]
  },
  {
    name: "Parasitologie",
    products: ["Anti-poux", "Anti-gale", "Vermifuges", "Anti-paludéens"]
  },
  {
    name: "Produits de diagnostic",
    products: ["Tests de glycémie", "Tests de grossesse", "Tests d'ovulation"]
  },
  {
    name: "Sang et appareil cardiovasculaire",
    products: ["Anti-hypertenseurs", "Anticoagulants", "Veinotoniques"]
  },
  {
    name: "Sevrage tabagique",
    products: ["Patchs nicotine", "Gommes", "Substituts nicotiniques"]
  },
  {
    name: "Sommeil et détente",
    products: ["Somnifères légers", "Anxiolytiques naturels", "Mélatonine"]
  },
  {
    name: "Système nerveux",
    products: ["Anti-épileptiques", "Anti-Parkinson", "Anxiolytiques"]
  },
  {
    name: "Urologie",
    products: ["Antibiotiques urinaires", "Antispasmodiques", "Compléments prostate"]
  },
  {
    name: "Vaccins",
    products: ["Vaccin grippe", "Vaccin hépatite", "Vaccin fièvre jaune"]
  },
  {
    name: "Médicaments sur ordonnance",
    products: ["Antibiotiques", "Anti-diabétiques", "Psychotropes", "Hormones"]
  },
  {
    name: "Homéopathie",
    products: ["Granules", "Doses", "Complexes homéopathiques", "Teintures mères"]
  }
];

const mockProducts = [
  {
    id: 1,
    name: "Doliprane 1000mg",
    category: "Douleurs et fièvre",
    price: 2500,
    rating: 4.8,
    inStock: true,
    prescription: true,
    image: dolipraneImg,
    images: [dolipraneImg, dolipraneBoxImg, pillsDetailImg],
    description: "Antalgique et antipyrétique efficace contre les douleurs et la fièvre",
    composition: "Paracétamol 1000mg",
    dosage: "1 comprimé toutes les 6 heures, maximum 4 comprimés par jour",
    sideEffects: ["Réactions allergiques rares", "Atteinte hépatique en cas de surdosage"],
    manufacturer: "Sanofi"
  },
  {
    id: 2,
    name: "Spasfon",
    category: "Appareil digestif",
    price: 3200,
    rating: 4.7,
    inStock: true,
    prescription: false,
    image: spasfonImg,
    images: [spasfonImg, spasfonBoxImg],
    description: "Antispasmodique pour le traitement des douleurs abdominales",
    composition: "Phloroglucinol 80mg",
    dosage: "2 comprimés 3 fois par jour",
    sideEffects: ["Réactions cutanées", "Troubles digestifs légers"],
    manufacturer: "Teva Santé"
  },
  {
    id: 3,
    name: "Imodium",
    category: "Appareil digestif",
    price: 2800,
    rating: 4.6,
    inStock: true,
    prescription: false,
    image: imodiumImg,
    images: [imodiumImg, pillsDetailImg],
    description: "Traitement symptomatique des diarrhées aiguës",
    composition: "Lopéramide 2mg",
    dosage: "2 gélules au début, puis 1 gélule après chaque selle liquide",
    sideEffects: ["Constipation", "Nausées", "Ballonnements"],
    manufacturer: "Johnson & Johnson"
  },
  {
    id: 4,
    name: "Amoxicilline 500mg",
    category: "Médicaments sur ordonnance",
    price: 4200,
    rating: 4.9,
    inStock: true,
    prescription: true,
    image: amoxicillineImg,
    images: [amoxicillineImg, amoxicillineBoxImg, pillsDetailImg],
    description: "Antibiotique à large spectre pour infections bactériennes",
    composition: "Amoxicilline 500mg",
    dosage: "1 gélule 3 fois par jour pendant 7 à 10 jours",
    sideEffects: ["Diarrhée", "Éruptions cutanées", "Candidose"],
    manufacturer: "Mylan"
  },
  {
    id: 5,
    name: "Oscillococcinum",
    category: "Homéopathie",
    price: 3500,
    rating: 4.5,
    inStock: true,
    prescription: false,
    image: homeopathieImg,
    images: [homeopathieImg],
    description: "Médicament homéopathique traditionnellement utilisé en cas d'état grippal",
    composition: "Anas Barbariae Hepatis et Cordis Extractum 200K",
    dosage: "1 dose le plus tôt possible, à renouveler si nécessaire",
    sideEffects: [],
    manufacturer: "Boiron"
  },
  {
    id: 6,
    name: "Spray nasal",
    category: "ORL (nez, gorge, oreilles)",
    price: 1800,
    rating: 4.4,
    inStock: true,
    prescription: false,
    image: sprayNasalImg,
    images: [sprayNasalImg],
    description: "Décongestionne et nettoie les voies nasales",
    composition: "Eau de mer isotonique",
    dosage: "2 à 3 pulvérisations par narine, 3 fois par jour",
    sideEffects: ["Irritation nasale légère"],
    manufacturer: "Laboratoires Gilbert"
  },
  {
    id: 7,
    name: "Efferalgan 1000mg",
    category: "Douleurs et fièvre",
    price: 2600,
    rating: 4.8,
    inStock: true,
    prescription: true,
    image: efferalganImg,
    images: [efferalganImg, pillsDetailImg],
    description: "Paracétamol effervescent pour soulager douleurs et fièvre",
    composition: "Paracétamol 1000mg",
    dosage: "1 comprimé toutes les 6 heures, max 4 par jour",
    sideEffects: ["Réactions cutanées rares"],
    manufacturer: "UPSA"
  },
  {
    id: 8,
    name: "Advil 400mg",
    category: "Douleurs et fièvre",
    price: 3100,
    rating: 4.7,
    inStock: true,
    prescription: false,
    image: advilImg,
    images: [advilImg, pillsDetailImg],
    description: "Anti-inflammatoire non stéroïdien, soulage la douleur et la fièvre",
    composition: "Ibuprofène 400mg",
    dosage: "1 comprimé 3 fois par jour au cours des repas",
    sideEffects: ["Brûlures d'estomac", "Nausées"],
    manufacturer: "Pfizer"
  },
  {
    id: 9,
    name: "Vitamine C UPSA",
    category: "Forme, vitamines et minéraux",
    price: 2200,
    rating: 4.6,
    inStock: true,
    prescription: false,
    image: vitaminCImg,
    images: [vitaminCImg],
    description: "Traitement de la fatigue passagère",
    composition: "Acide ascorbique 1000mg",
    dosage: "1 comprimé par jour, de préférence le matin",
    sideEffects: ["Agitation légère si pris le soir"],
    manufacturer: "UPSA"
  },
  {
    id: 10,
    name: "Sirop Toux Sèche",
    category: "ORL (nez, gorge, oreilles)",
    price: 4500,
    rating: 4.5,
    inStock: true,
    prescription: false,
    image: coughSyrupImg,
    images: [coughSyrupImg],
    description: "Sirop apaisant pour toux sèche et d'irritation",
    composition: "Oxomémazine",
    dosage: "1 gobelet doseur 3 fois par jour",
    sideEffects: ["Somnolence possible"],
    manufacturer: "Sanofi"
  },
  {
    id: 11,
    name: "Bétadine Dermique",
    category: "Dermatologie",
    price: 3800,
    rating: 4.9,
    inStock: true,
    prescription: false,
    image: betadineImg,
    images: [betadineImg],
    description: "Antiseptique local pour le nettoyage des plaies",
    composition: "Povidone iodée 10%",
    dosage: "Application locale pure ou diluée",
    sideEffects: ["Coloration transitoire de la peau"],
    manufacturer: "Meda Pharma"
  },
];

// Parapharmacie products - Expanded catalog
const parapharmacieProducts = [
  // ========== COSMÉTIQUES ==========
  // Soins du visage
  { id: 101, name: "Crème hydratante visage", category: "Cosmétiques", price: 8500, rating: 4.7, inStock: true, image: faceCreamImg, description: "Hydratation intense 24h" },
  { id: 102, name: "Sérum anti-âge", category: "Cosmétiques", price: 15000, rating: 4.8, inStock: true, image: dolipraneImg, description: "Réduit les rides et ridules" },
  { id: 103, name: "Masque purifiant", category: "Cosmétiques", price: 6500, rating: 4.6, inStock: true, image: spasfonImg, description: "Nettoie en profondeur" },
  { id: 104, name: "Eau micellaire", category: "Cosmétiques", price: 5500, rating: 4.9, inStock: true, image: imodiumImg, description: "Démaquille et purifie" },
  { id: 105, name: "Crème de nuit réparatrice", category: "Cosmétiques", price: 12000, rating: 4.8, inStock: true, image: homeopathieImg, description: "Régénère pendant le sommeil" },
  { id: 106, name: "Contour des yeux anti-cernes", category: "Cosmétiques", price: 9500, rating: 4.7, inStock: true, image: sprayNasalImg, description: "Réduit poches et cernes" },
  { id: 107, name: "Gommage visage doux", category: "Cosmétiques", price: 7200, rating: 4.6, inStock: true, image: dolipraneBoxImg, description: "Exfolie en douceur" },
  { id: 108, name: "Lotion tonique", category: "Cosmétiques", price: 6800, rating: 4.5, inStock: true, image: amoxicillineBoxImg, description: "Resserre les pores" },
  { id: 109, name: "Crème anti-taches", category: "Cosmétiques", price: 13500, rating: 4.8, inStock: true, image: spasfonBoxImg, description: "Unifie le teint" },
  { id: 110, name: "Huile démaquillante", category: "Cosmétiques", price: 8900, rating: 4.7, inStock: true, image: pillsDetailImg, description: "Démaquillage tout en douceur" },

  // Soins capillaires
  { id: 111, name: "Shampooing fortifiant", category: "Cosmétiques", price: 7500, rating: 4.7, inStock: true, image: shampooImg, description: "Renforce les cheveux" },
  { id: 112, name: "Après-shampooing", category: "Cosmétiques", price: 6500, rating: 4.6, inStock: true, image: dolipraneImg, description: "Démêle et nourrit" },
  { id: 113, name: "Masque capillaire réparateur", category: "Cosmétiques", price: 9800, rating: 4.8, inStock: true, image: spasfonImg, description: "Répare les cheveux abîmés" },
  { id: 114, name: "Huile d'argan cheveux", category: "Cosmétiques", price: 11500, rating: 4.9, inStock: true, image: imodiumImg, description: "Nourrit et fait briller" },
  { id: 115, name: "Shampooing anti-pelliculaire", category: "Cosmétiques", price: 8200, rating: 4.6, inStock: true, image: homeopathieImg, description: "Élimine les pellicules" },
  { id: 116, name: "Sérum anti-chute", category: "Cosmétiques", price: 16500, rating: 4.7, inStock: true, image: sprayNasalImg, description: "Stimule la pousse" },

  // Soins solaires
  { id: 117, name: "Crème solaire SPF 50+", category: "Cosmétiques", price: 12500, rating: 4.9, inStock: true, image: dolipraneBoxImg, description: "Très haute protection" },
  { id: 118, name: "Après-soleil apaisant", category: "Cosmétiques", price: 8500, rating: 4.7, inStock: true, image: amoxicillineBoxImg, description: "Apaise et hydrate" },
  { id: 119, name: "Lait solaire SPF 30", category: "Cosmétiques", price: 9800, rating: 4.6, inStock: true, image: spasfonBoxImg, description: "Protection moyenne" },
  { id: 120, name: "Stick solaire lèvres SPF 50", category: "Cosmétiques", price: 4500, rating: 4.8, inStock: true, image: pillsDetailImg, description: "Protège les lèvres" },

  // Soins du corps
  { id: 121, name: "Lait corporel hydratant", category: "Cosmétiques", price: 7800, rating: 4.7, inStock: true, image: dolipraneImg, description: "Hydrate tout le corps" },
  { id: 122, name: "Beurre de karité", category: "Cosmétiques", price: 9500, rating: 4.9, inStock: true, image: spasfonImg, description: "Nutrition intense" },
  { id: 123, name: "Gommage corps", category: "Cosmétiques", price: 8200, rating: 4.6, inStock: true, image: imodiumImg, description: "Peau douce et lisse" },
  { id: 124, name: "Huile de coco bio", category: "Cosmétiques", price: 10500, rating: 4.8, inStock: true, image: homeopathieImg, description: "Multi-usages" },

  // ========== HYGIÈNE ==========
  // Hygiène bucco-dentaire
  { id: 201, name: "Dentifrice blancheur", category: "Hygiène", price: 2800, rating: 4.7, inStock: true, image: sprayNasalImg, description: "Blanchit et protège" },
  { id: 202, name: "Bain de bouche", category: "Hygiène", price: 3500, rating: 4.6, inStock: true, image: dolipraneBoxImg, description: "Haleine fraîche" },
  { id: 203, name: "Fil dentaire", category: "Hygiène", price: 1800, rating: 4.5, inStock: true, image: amoxicillineBoxImg, description: "Nettoyage interdentaire" },
  { id: 204, name: "Brosse à dents électrique", category: "Hygiène", price: 15000, rating: 4.9, inStock: true, image: spasfonBoxImg, description: "Nettoyage optimal" },
  { id: 205, name: "Dentifrice sensibilité", category: "Hygiène", price: 3200, rating: 4.8, inStock: true, image: pillsDetailImg, description: "Pour dents sensibles" },

  // Hygiène corporelle
  { id: 206, name: "Gel douche doux", category: "Hygiène", price: 3500, rating: 4.5, inStock: true, image: dolipraneImg, description: "Pour peaux sensibles" },
  { id: 207, name: "Savon antibactérien", category: "Hygiène", price: 2500, rating: 4.8, inStock: true, image: spasfonImg, description: "Élimine 99.9% des bactéries" },
  { id: 208, name: "Déodorant 48h", category: "Hygiène", price: 4200, rating: 4.6, inStock: true, image: imodiumImg, description: "Protection longue durée" },
  { id: 209, name: "Savon d'Alep", category: "Hygiène", price: 4800, rating: 4.9, inStock: true, image: homeopathieImg, description: "Naturel et doux" },
  { id: 210, name: "Gel intime", category: "Hygiène", price: 5500, rating: 4.7, inStock: true, image: sprayNasalImg, description: "pH neutre" },
  { id: 211, name: "Lingettes démaquillantes", category: "Hygiène", price: 3800, rating: 4.6, inStock: true, image: dolipraneBoxImg, description: "Pratiques et douces" },
  { id: 212, name: "Cotons-tiges bio", category: "Hygiène", price: 2200, rating: 4.5, inStock: true, image: amoxicillineBoxImg, description: "100% biodégradables" },
  { id: 213, name: "Gel hydroalcoolique", category: "Hygiène", price: 2800, rating: 4.8, inStock: true, image: spasfonBoxImg, description: "Désinfecte les mains" },
  { id: 214, name: "Savon noir", category: "Hygiène", price: 3500, rating: 4.7, inStock: true, image: pillsDetailImg, description: "Gommage traditionnel" },

  // Hygiène féminine
  { id: 215, name: "Serviettes hygiéniques", category: "Hygiène", price: 3200, rating: 4.6, inStock: true, image: dolipraneImg, description: "Ultra-absorbantes" },
  { id: 216, name: "Tampons", category: "Hygiène", price: 3500, rating: 4.5, inStock: true, image: spasfonImg, description: "Confort optimal" },
  { id: 217, name: "Protège-slips", category: "Hygiène", price: 2500, rating: 4.7, inStock: true, image: imodiumImg, description: "Fraîcheur quotidienne" },

  // ========== BÉBÉ & MAMAN ==========
  // Soins bébé
  { id: 301, name: "Lait corporel bébé", category: "Bébé & Maman", price: 6500, rating: 4.9, inStock: true, image: homeopathieImg, description: "Hydrate et protège" },
  { id: 302, name: "Lingettes bébé", category: "Bébé & Maman", price: 3200, rating: 4.7, inStock: true, image: sprayNasalImg, description: "Ultra-douces" },
  { id: 303, name: "Gel lavant bébé", category: "Bébé & Maman", price: 5800, rating: 4.8, inStock: true, image: dolipraneBoxImg, description: "Corps et cheveux" },
  { id: 304, name: "Huile de massage bébé", category: "Bébé & Maman", price: 5500, rating: 4.6, inStock: true, image: amoxicillineBoxImg, description: "Apaise et nourrit" },
  { id: 305, name: "Crème pour le change", category: "Bébé & Maman", price: 6200, rating: 4.9, inStock: true, image: spasfonBoxImg, description: "Prévient les rougeurs" },
  { id: 306, name: "Eau nettoyante bébé", category: "Bébé & Maman", price: 4800, rating: 4.7, inStock: true, image: pillsDetailImg, description: "Sans rinçage" },
  { id: 307, name: "Shampooing bébé", category: "Bébé & Maman", price: 4500, rating: 4.8, inStock: true, image: dolipraneImg, description: "Ne pique pas les yeux" },
  { id: 308, name: "Talc bébé", category: "Bébé & Maman", price: 3800, rating: 4.5, inStock: true, image: spasfonImg, description: "Absorbe l'humidité" },
  { id: 309, name: "Couches taille 3", category: "Bébé & Maman", price: 8500, rating: 4.8, inStock: true, image: imodiumImg, description: "4-9 kg" },
  { id: 310, name: "Couches taille 4", category: "Bébé & Maman", price: 9200, rating: 4.8, inStock: true, image: homeopathieImg, description: "7-18 kg" },
  { id: 311, name: "Biberon anti-colique", category: "Bébé & Maman", price: 7500, rating: 4.7, inStock: true, image: sprayNasalImg, description: "260ml" },
  { id: 312, name: "Tétines silicone", category: "Bébé & Maman", price: 3500, rating: 4.6, inStock: true, image: dolipraneBoxImg, description: "Lot de 2" },

  // Soins maman
  { id: 313, name: "Crème anti-vergetures", category: "Bébé & Maman", price: 12000, rating: 4.8, inStock: true, image: amoxicillineBoxImg, description: "Prévient et réduit" },
  { id: 314, name: "Huile de massage grossesse", category: "Bébé & Maman", price: 9800, rating: 4.7, inStock: true, image: spasfonBoxImg, description: "Détend et nourrit" },
  { id: 315, name: "Coussinets d'allaitement", category: "Bébé & Maman", price: 4200, rating: 4.6, inStock: true, image: pillsDetailImg, description: "Ultra-absorbants" },
  { id: 316, name: "Crème mamelons", category: "Bébé & Maman", price: 6500, rating: 4.9, inStock: true, image: dolipraneImg, description: "Apaise et répare" },

  // ========== COMPLÉMENTS ALIMENTAIRES ==========
  // Vitamines et minéraux
  { id: 401, name: "Multivitamines", category: "Compléments", price: 8500, rating: 4.7, inStock: true, image: spasfonImg, description: "Vitalité et énergie" },
  { id: 402, name: "Oméga 3", category: "Compléments", price: 9500, rating: 4.8, inStock: true, image: imodiumImg, description: "Santé cardiovasculaire" },
  { id: 403, name: "Probiotiques", category: "Compléments", price: 11000, rating: 4.9, inStock: true, image: homeopathieImg, description: "Équilibre intestinal" },
  { id: 404, name: "Collagène", category: "Compléments", price: 13500, rating: 4.6, inStock: true, image: sprayNasalImg, description: "Peau, cheveux, ongles" },
  { id: 405, name: "Vitamine D3", category: "Compléments", price: 7200, rating: 4.8, inStock: true, image: dolipraneBoxImg, description: "Renforce les os" },
  { id: 406, name: "Magnésium marin", category: "Compléments", price: 8800, rating: 4.7, inStock: true, image: amoxicillineBoxImg, description: "Anti-fatigue" },
  { id: 407, name: "Fer + Vitamine C", category: "Compléments", price: 7500, rating: 4.6, inStock: true, image: spasfonBoxImg, description: "Combat l'anémie" },
  { id: 408, name: "Calcium + Vitamine D", category: "Compléments", price: 8200, rating: 4.7, inStock: true, image: pillsDetailImg, description: "Santé osseuse" },
  { id: 409, name: "Zinc", category: "Compléments", price: 6500, rating: 4.5, inStock: true, image: dolipraneImg, description: "Immunité" },
  { id: 410, name: "Vitamine B Complex", category: "Compléments", price: 7800, rating: 4.8, inStock: true, image: spasfonImg, description: "Énergie et vitalité" },

  // Minceur et détox
  { id: 411, name: "Brûleur de graisses", category: "Compléments", price: 12500, rating: 4.6, inStock: true, image: imodiumImg, description: "Aide à la perte de poids" },
  { id: 412, name: "Draineur détox", category: "Compléments", price: 9800, rating: 4.7, inStock: true, image: homeopathieImg, description: "Élimine les toxines" },
  { id: 413, name: "Coupe-faim naturel", category: "Compléments", price: 10500, rating: 4.5, inStock: true, image: sprayNasalImg, description: "Réduit l'appétit" },
  { id: 414, name: "Thé vert minceur", category: "Compléments", price: 6800, rating: 4.6, inStock: true, image: dolipraneBoxImg, description: "Antioxydant puissant" },

  // Beauté et bien-être
  { id: 415, name: "Levure de bière", category: "Compléments", price: 7500, rating: 4.8, inStock: true, image: amoxicillineBoxImg, description: "Cheveux et ongles" },
  { id: 416, name: "Spiruline bio", category: "Compléments", price: 11500, rating: 4.9, inStock: true, image: spasfonBoxImg, description: "Super-aliment" },
  { id: 417, name: "Acide hyaluronique", category: "Compléments", price: 14500, rating: 4.7, inStock: true, image: pillsDetailImg, description: "Anti-âge" },
  { id: 418, name: "Biotine", category: "Compléments", price: 8500, rating: 4.6, inStock: true, image: dolipraneImg, description: "Croissance cheveux" },

  // Sommeil et stress
  { id: 419, name: "Mélatonine", category: "Compléments", price: 9200, rating: 4.8, inStock: true, image: spasfonImg, description: "Favorise l'endormissement" },
  { id: 420, name: "Magnésium + B6", category: "Compléments", price: 8800, rating: 4.7, inStock: true, image: imodiumImg, description: "Anti-stress" },
  { id: 421, name: "Valériane", category: "Compléments", price: 7500, rating: 4.6, inStock: true, image: homeopathieImg, description: "Relaxation naturelle" },
  { id: 422, name: "Passiflore", category: "Compléments", price: 7200, rating: 4.5, inStock: true, image: sprayNasalImg, description: "Calme et sérénité" },

  // Sport et performance
  { id: 423, name: "Protéines whey", category: "Compléments", price: 18500, rating: 4.8, inStock: true, image: dolipraneBoxImg, description: "Développement musculaire" },
  { id: 424, name: "BCAA", category: "Compléments", price: 15000, rating: 4.7, inStock: true, image: amoxicillineBoxImg, description: "Récupération musculaire" },
  { id: 425, name: "Créatine", category: "Compléments", price: 12500, rating: 4.6, inStock: true, image: spasfonBoxImg, description: "Force et endurance" },
  { id: 426, name: "Boisson énergétique", category: "Compléments", price: 8500, rating: 4.5, inStock: true, image: pillsDetailImg, description: "Boost d'énergie" },
];

const MedicinesPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const { addToCart } = useCart();
  const { addToComparison, removeFromComparison, isInComparison, comparisonList } = useComparison();
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [priceSort, setPriceSort] = useState("default");
  const [prescriptionFilter, setPrescriptionFilter] = useState("all");
  const [selectedMedicine, setSelectedMedicine] = useState<typeof mockProducts[0] | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isComparisonOpen, setIsComparisonOpen] = useState(false);
  const [parapharmacieCategory, setParapharmacieCategory] = useState("all");

  const filteredProducts = mockProducts
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

  return (
    <>
      <SEO {...pagesSEO.medicines} />
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5">
        <Header />

        {/* Floating comparison button */}
        {comparisonList.length > 0 && (
          <div className="fixed bottom-6 right-6 z-50">
            <Button
              size="lg"
              onClick={() => setIsComparisonOpen(true)}
              className="shadow-lg"
            >
              <Scale className="h-5 w-5 mr-2" />
              Comparer ({comparisonList.length})
            </Button>
          </div>
        )}
        <main className="py-16">
          <div className="container mx-auto px-4">
            <div className="text-center mb-8">
              <h1 className="text-4xl font-bold mb-4">Médicaments & Parapharmacie</h1>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Toute notre gamme de produits de santé et bien-être
              </p>
            </div>

            {/* Tabs for Medicines and Parapharmacie */}
            <Tabs defaultValue="medicines" className="w-full">
              <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 mb-8">
                <TabsTrigger value="medicines">Médicaments</TabsTrigger>
                <TabsTrigger value="parapharmacie">Parapharmacie</TabsTrigger>
              </TabsList>

              <TabsContent value="medicines">
                <div className="flex items-center justify-center gap-2 text-sm text-amber-600 bg-amber-50 p-3 rounded-lg max-w-xl mx-auto mb-8">
                  <AlertCircle className="h-4 w-4" />
                  <span>Les médicaments sur ordonnance nécessitent une prescription valide</span>
                </div>

                {/* Upload Prescription */}
                <div className="mb-8">
                  <PrescriptionUpload onUpload={(file) => {
                    console.log("Prescription uploaded:", file);
                  }} />
                </div>

                {/* Filters */}
                <div className="bg-card p-6 rounded-lg border shadow-sm mb-8">
                  <div className="flex items-center gap-2 mb-4">
                    <Filter className="h-5 w-5 text-primary" />
                    <h3 className="text-lg font-semibold">Recherche et filtres</h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <MedicineSearchWithSuggestions
                      onSearch={(term) => setSearchTerm(term)}
                    />

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

                    <Select value={prescriptionFilter} onValueChange={setPrescriptionFilter}>
                      <SelectTrigger>
                        <SelectValue placeholder="Type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Tous les types</SelectItem>
                        <SelectItem value="prescription">Sur ordonnance</SelectItem>
                        <SelectItem value="libre">Vente libre</SelectItem>
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
                    {filteredProducts.length} médicament(s) trouvé(s)
                  </div>
                </div>

                {/* Categories Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                  {categories.map((category) => (
                    <Card key={category.name} className="hover:shadow-lg transition-all cursor-pointer">
                      <CardContent className="p-6">
                        <h3 className="font-semibold text-base mb-3">{category.name}</h3>
                        <ul className="space-y-2 text-sm text-muted-foreground">
                          {category.products.slice(0, 3).map((product) => (
                            <li key={product} className="flex items-center gap-2">
                              <Badge variant="secondary" className="w-1.5 h-1.5 p-0 rounded-full"></Badge>
                              {product}
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {/* Products Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredProducts.map(product => (
                    <Card
                      key={product.id}
                      className="hover:shadow-lg transition-all cursor-pointer group"
                      onClick={() => {
                        setSelectedMedicine(product)
                        setIsDetailOpen(true)
                      }}
                    >
                      <CardContent className="p-4">
                        <div className="relative">
                          <div className="aspect-square overflow-hidden mb-4 rounded-lg">
                            <img
                              src={product.image}
                              alt={product.name}
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                            />
                            {product.images && product.images.length > 1 && (
                              <div className="absolute bottom-2 right-2 bg-background/80 backdrop-blur-sm px-2 py-1 rounded-full text-xs font-medium">
                                +{product.images.length - 1} photos
                              </div>
                            )}
                          </div>
                          {product.prescription && (
                            <Badge className="absolute top-2 right-2 bg-accent/10 text-accent border-accent/20">
                              Ordonnance
                            </Badge>
                          )}
                        </div>
                        <h3 className="font-semibold text-lg mb-2">{product.name}</h3>
                        <Badge variant="outline" className="mb-3 text-xs">
                          {product.category}
                        </Badge>
                        <div className="flex items-center gap-2 mb-3">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          <span className="text-sm font-medium">{product.rating}</span>
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-xl font-bold text-primary">
                              {product.price.toLocaleString()} FCFA
                            </span>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant={isInComparison(product.id) ? "secondary" : "outline"}
                              onClick={(e) => {
                                e.stopPropagation()
                                if (isInComparison(product.id)) {
                                  removeFromComparison(product.id)
                                  toast.success('Retiré de la comparaison')
                                } else {
                                  if (comparisonList.length >= 4) {
                                    toast.error('Maximum 4 médicaments pour la comparaison')
                                  } else {
                                    addToComparison(product)
                                    toast.success('Ajouté à la comparaison')
                                  }
                                }
                              }}
                              className="flex-1"
                            >
                              <Scale className="h-4 w-4 mr-1" />
                              {isInComparison(product.id) ? 'Comparé' : 'Comparer'}
                            </Button>
                            <Button
                              size="sm"
                              disabled={!product.inStock}
                              onClick={(e) => {
                                e.stopPropagation()
                                addToCart({
                                  medicine: {
                                    id: product.id.toString(),
                                    name: product.name,
                                    description: product.category,
                                    category: product.category,
                                    requires_prescription: product.prescription,
                                    manufacturer: '',
                                    generic_name: '',
                                    dosage: '',
                                    form: '',
                                    created_at: '',
                                    updated_at: ''
                                  },
                                  quantity: 1,
                                  pharmacy_id: 'mock-pharmacy',
                                  pharmacy_name: 'Pharmacie disponible',
                                  price: product.price
                                });
                                toast.success(`${product.name} ajouté au panier`);
                              }}
                              className="flex-1"
                            >
                              <Plus className="h-4 w-4 mr-1" />
                              Panier
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
                    <h3 className="text-xl font-semibold mb-2">Aucun médicament trouvé</h3>
                    <p className="text-muted-foreground">Essayez de modifier vos critères de recherche</p>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="parapharmacie">
                <div className="mb-8">
                  <h3 className="text-xl font-semibold mb-4 text-center">Catégories Parapharmacie</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto mb-8">
                    <Card
                      className={`p-4 text-center hover:shadow-lg transition-all cursor-pointer ${parapharmacieCategory === "all" ? "border-primary border-2" : ""}`}
                      onClick={() => setParapharmacieCategory("all")}
                    >
                      <div className="text-3xl mb-2">🛍️</div>
                      <p className="text-sm font-medium">Tous</p>
                    </Card>
                    <Card
                      className={`p-4 text-center hover:shadow-lg transition-all cursor-pointer ${parapharmacieCategory === "Cosmétiques" ? "border-primary border-2" : ""}`}
                      onClick={() => setParapharmacieCategory("Cosmétiques")}
                    >
                      <div className="text-3xl mb-2">💄</div>
                      <p className="text-sm font-medium">Cosmétiques</p>
                    </Card>
                    <Card
                      className={`p-4 text-center hover:shadow-lg transition-all cursor-pointer ${parapharmacieCategory === "Hygiène" ? "border-primary border-2" : ""}`}
                      onClick={() => setParapharmacieCategory("Hygiène")}
                    >
                      <div className="text-3xl mb-2">🧼</div>
                      <p className="text-sm font-medium">Hygiène</p>
                    </Card>
                    <Card
                      className={`p-4 text-center hover:shadow-lg transition-all cursor-pointer ${parapharmacieCategory === "Bébé & Maman" ? "border-primary border-2" : ""}`}
                      onClick={() => setParapharmacieCategory("Bébé & Maman")}
                    >
                      <div className="text-3xl mb-2">🍼</div>
                      <p className="text-sm font-medium">Bébé & Maman</p>
                    </Card>
                    <Card
                      className={`p-4 text-center hover:shadow-lg transition-all cursor-pointer ${parapharmacieCategory === "Compléments" ? "border-primary border-2" : ""}`}
                      onClick={() => setParapharmacieCategory("Compléments")}
                    >
                      <div className="text-3xl mb-2">💊</div>
                      <p className="text-sm font-medium">Compléments</p>
                    </Card>
                  </div>
                </div>

                {/* Parapharmacie Products Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {parapharmacieProducts
                    .filter(product => parapharmacieCategory === "all" || product.category === parapharmacieCategory)
                    .map(product => (
                      <Card key={product.id} className="hover:shadow-lg transition-all cursor-pointer group">
                        <CardContent className="p-4">
                          <div className="relative">
                            <div className="aspect-square overflow-hidden mb-4 rounded-lg">
                              <img
                                src={product.image}
                                alt={product.name}
                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                              />
                            </div>
                          </div>
                          <h3 className="font-semibold text-lg mb-2">{product.name}</h3>
                          <Badge variant="outline" className="mb-3 text-xs">
                            {product.category}
                          </Badge>
                          <p className="text-sm text-muted-foreground mb-3">{product.description}</p>
                          <div className="flex items-center gap-2 mb-3">
                            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                            <span className="text-sm font-medium">{product.rating}</span>
                          </div>
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-xl font-bold text-primary">
                                {product.price.toLocaleString()} FCFA
                              </span>
                            </div>
                            <Button
                              size="sm"
                              disabled={!product.inStock}
                              onClick={() => {
                                addToCart({
                                  medicine: {
                                    id: product.id.toString(),
                                    name: product.name,
                                    description: product.description,
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
                                  pharmacy_name: 'Pharmacie disponible',
                                  price: product.price
                                });
                                toast.success(`${product.name} ajouté au panier`);
                              }}
                              className="w-full"
                            >
                              <Plus className="h-4 w-4 mr-1" />
                              Ajouter au panier
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                </div>

                {parapharmacieProducts.filter(p => parapharmacieCategory === "all" || p.category === parapharmacieCategory).length === 0 && (
                  <div className="text-center py-12">
                    <div className="text-6xl mb-4">🔍</div>
                    <h3 className="text-xl font-semibold mb-2">Aucun produit trouvé</h3>
                    <p className="text-muted-foreground">Sélectionnez une autre catégorie</p>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </main>
        <Footer />
        <CartDrawer />
        <MedicineDetailDialog
          medicine={selectedMedicine}
          open={isDetailOpen}
          onOpenChange={setIsDetailOpen}
        />
        <MedicineComparisonDialog
          open={isComparisonOpen}
          onOpenChange={setIsComparisonOpen}
        />
      </div>
    </>
  );
};

export default MedicinesPage;
