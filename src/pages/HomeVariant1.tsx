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

const HomeVariant1 = () => {
    return (
        <div className="min-h-screen bg-background relative">
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
            <Footer />
        </div>
    );
};

export default HomeVariant1;
