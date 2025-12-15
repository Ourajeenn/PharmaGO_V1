import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import ImageSlider from "@/components/ImageSlider";
import ProductGrid from "@/components/ProductGrid";
import PharmacyGuard from "@/components/PharmacyGuard";
import BecomeDelivery from "@/components/BecomeDelivery";
import Footer from "@/components/Footer";
import { ParticlesBackground } from "@/components/ParticlesBackground";
import HowItWorks from "@/components/HowItWorks";
import Testimonials from "@/components/Testimonials";
import SEO from "@/components/SEO";

import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-background relative">
      <SEO
        title="PharmaGo - Pharmacie en Ligne Abidjan | Livraison 24h"
        description="Commandez vos médicaments en ligne avec PharmaGo. Livraison rapide 24h/24 à Abidjan, consultation IA gratuite, plus de 100 pharmacies partenaires. Votre santé, notre priorité."
        keywords="pharmacie en ligne Abidjan, livraison médicaments Côte d'Ivoire, pharmacie de garde, ordonnance en ligne, téléconsultation, e-santé CI"
        url="https://pharmago.ci"
      />
      <ParticlesBackground />
      <Header />
      <main className="relative z-10">
        <HeroSection />
        <HowItWorks />
        <ImageSlider />
        <ProductGrid />
        <PharmacyGuard />
        <Testimonials />
        <BecomeDelivery />
      </main>

      {/* Floating button to new homepage */}
      <div className="fixed bottom-8 right-8 z-50">
        <Button
          onClick={() => navigate('/home-v2')}
          size="lg"
          className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 shadow-2xl hover:shadow-orange-500/50 transition-all duration-300 hover:scale-105"
        >
          <Sparkles className="mr-2 h-5 w-5" />
          Nouvelle Version
        </Button>
      </div>

      <Footer />
    </div>
  );
};

export default Index;
