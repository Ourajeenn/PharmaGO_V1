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

const HomeVariant2 = () => {
    return (
        <div className="min-h-screen bg-background relative">
            <ParticlesBackground />
            <Header />
            <main className="relative z-10">
                <HeroSection
                    badgeText="🏥 Urgences & Garde"
                    titlePrefix="Besoin d'une pharmacie"
                    titleHighlight="en urgence ?"
                    subtitle="Trouvez instantanément la pharmacie de garde la plus proche, 24h/24 et 7j/7."
                />
                <PharmacyGuard />
                <HowItWorks />
                <ProductGrid />
                <Testimonials />
                <BecomeDelivery />
            </main>
            <Footer />
        </div>
    );
};

export default HomeVariant2;
