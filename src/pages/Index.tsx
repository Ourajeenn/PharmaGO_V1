import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import ImageSlider from "@/components/ImageSlider";
import ProductGrid from "@/components/ProductGrid";
import PharmacyGuard from "@/components/PharmacyGuard";
import BecomeDelivery from "@/components/BecomeDelivery";
import Footer from "@/components/Footer";
import HowItWorks from "@/components/HowItWorks";
import Testimonials from "@/components/Testimonials";
import SEO from "@/components/SEO";

import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";

import GetStartedSection from "@/components/GetStartedSection";

const Index = () => {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-transparent relative">
      <SEO
        title="PharmaGo - Pharmacie en Ligne Abidjan | Livraison 24h"
        description="Commandez vos médicaments en ligne avec PharmaGo. Livraison rapide 24h/24 à Abidjan, consultation IA gratuite, plus de 100 pharmacies partenaires. Votre santé, notre priorité."
        keywords="pharmacie en ligne Abidjan, livraison médicaments Côte d'Ivoire, pharmacie de garde, ordonnance en ligne, téléconsultation, e-santé CI"
        url="https://pharmago.ci"
      />

      {/* Spline 3D Background - Hidden on mobile for performance */}
      <div className="spline-container fixed top-0 left-0 w-full h-full -z-20 overflow-hidden pointer-events-none hidden md:block">
        <iframe
          src="https://my.spline.design/celestialflowabstractdigitalform-ObUlVgj70g2y4bbx5vBKSfxN/"
          frameBorder="0"
          width="100%"
          height="100%"
          id="aura-spline"
          title="Spline 3D Background"
          className="scale-110 opacity-60"
          loading="lazy"
        />
      </div>

      {/* Mesh Gradient Overlay for consistent premium feel */}
      <div className="fixed top-0 left-0 w-full h-full -z-10 mesh-gradient opacity-40 pointer-events-none" />

      <Header />

      <main className="relative z-10 space-y-24 pb-20">
        <HeroSection />

        <div className="container mx-auto px-4">
          <HowItWorks />
        </div>

        <ImageSlider />

        <div className="container mx-auto px-4">
          <ProductGrid />
        </div>

        <PharmacyGuard />

        <div className="container mx-auto px-4">
          <Testimonials />
        </div>

        <BecomeDelivery />
        <GetStartedSection />
      </main>

      {/* Floating button to new homepage */}
      <div className="fixed bottom-24 right-4 z-50">
        <Button
          onClick={() => navigate('/home-v2')}
          size="lg"
          className="h-12 w-12 rounded-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 shadow-xl shadow-orange-500/20 transition-all duration-300 hover:scale-110 font-black flex items-center justify-center text-white border-none p-0"
        >
          V2
        </Button>
      </div>

      <Footer />
    </div>
  );
};

export default Index;
