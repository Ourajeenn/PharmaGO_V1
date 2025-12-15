import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import ImageSlider from "@/components/ImageSlider";
import ProductGrid from "@/components/ProductGrid";
import BecomeDelivery from "@/components/BecomeDelivery";
import Footer from "@/components/Footer";
import { ParticlesBackground } from "@/components/ParticlesBackground";
import HowItWorks from "@/components/HowItWorks";
import Testimonials from "@/components/Testimonials";

const HomeVariant4 = () => {
    return (
        <div className="min-h-screen bg-background relative">
            <ParticlesBackground />
            <Header />
            <main className="relative z-10">
                <HeroSection
                    badgeText="✨ Beauté & Bien-être"
                    titlePrefix="Vos produits"
                    titleHighlight="préférés en un clic"
                    subtitle="Découvrez notre sélection de soins, vitamines et produits de beauté livrés chez vous."
                />
                <ProductGrid />
                <ImageSlider />
                <HowItWorks />
                <Testimonials />
                <BecomeDelivery />
            </main>
            <Footer />
        </div>
    );
};

export default HomeVariant4;
