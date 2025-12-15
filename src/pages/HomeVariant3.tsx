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

const HomeVariant3 = () => {
    return (
        <div className="min-h-screen bg-background relative">
            <ParticlesBackground />
            <Header />
            <main className="relative z-10">
                <HeroSection
                    badgeText="👨‍⚕️ Téléconsultation IA"
                    titlePrefix="Votre médecin"
                    titleHighlight="disponible 24h/24"
                    subtitle="Consultez un spécialiste en ligne et recevez votre ordonnance immédiatement."
                />
                <HowItWorks />
                <ImageSlider />
                <ProductGrid />
                <Testimonials />
            </main>
            <Footer />
        </div>
    );
};

export default HomeVariant3;
