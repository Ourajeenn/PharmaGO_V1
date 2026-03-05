import Header from "@/components/core/Header";
import Footer from "@/components/core/Footer";
import HeroSection from "@/components/home/HeroSection";
import HowItWorks from "@/components/home/HowItWorks";
import Testimonials from "@/components/home/Testimonials";
import ProductGrid from "@/components/home/ProductGrid";
import MobileAppShowcase from "@/components/home/MobileAppShowcase";
import GetStartedSection from "@/components/home/GetStartedSection";
import ProductSlider from "@/components/home/ProductSlider";
import ImageSlider from "@/components/ui/ImageSlider";
import ServiceGrid from "@/components/home/ServiceGrid";
import PharmacyGuard from "@/components/maps/PharmacyGuard";
import SplineBackground from "@/components/home/SplineBackground";

export default function Index() {
    return (
        <div className="min-h-screen relative">
            <SplineBackground />
            <Header />
            <main>
                {/* 1. Hero Section (Search + Carousel + 3 Cards) */}
                <HeroSection
                    titlePrefix="Votre santé,"
                    titleHighlight="livrée chez vous"
                    subtitle="Accédez à tous vos services de santé en un clic. Livraison express, téléconsultation et suivi personnalisé."
                />

                {/* 2. Dernières sorties (Product Slider) */}
                <ProductSlider />

                {/* 3. Comment ça marche ? */}
                <HowItWorks />

                {/* 4. Offres & Promotions */}
                <ImageSlider />

                {/* 5. Service Grid */}
                <ServiceGrid />

                {/* 6. Médicaments & Produits de Santé (Catalog) */}
                <ProductGrid />

                {/* 7. Pharmacies de Garde */}
                <PharmacyGuard />

                {/* 8. Application Mobile */}
                <MobileAppShowcase />

                {/* 9. Témoignages */}
                <Testimonials />

                {/* 10. Call to Action */}
                <GetStartedSection />
            </main>
            <Footer />
        </div>
    );
}
