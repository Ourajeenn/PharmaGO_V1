import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, Truck, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import ScrollReveal from "@/components/home/ScrollReveal";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";
import { Card } from "@/components/ui/card";
import ScannerOrdonnance from "@/components/prescription/ScannerOrdonnance";

interface HeroSectionProps {
  badgeText?: string;
  titlePrefix?: string;
  titleHighlight?: string;
  subtitle?: string;
}

const latestProducts = [
  {
    id: "hero-1",
    name: "Service Pharmacie",
    image: "hero-carousel/pharma-black.png",
    category: "Qualité",
    description: "Conseils d'experts."
  },
  {
    id: "hero-2",
    name: "Consultation en Ligne",
    image: "hero-carousel/consultation.png",
    category: "Télésanté",
    description: "Parlez à un expert."
  },
  {
    id: "hero-3",
    name: "Livraison Express",
    image: "hero-carousel/delivery-v2.png",
    category: "Rapidité",
    description: "Livré en 45 min."
  },
  {
    id: "hero-5",
    name: "Application Mobile",
    image: "hero-carousel/app-v4.png",
    category: "Innovation",
    description: "Santé connectée."
  }
];

const HeroSection = ({
  titlePrefix = "Votre santé,",
  titleHighlight = "livrée chez vous",
  subtitle = "Commandez vos médicaments, consultez un médecin, trouvez une pharmacie."
}: HeroSectionProps) => {
  const navigate = useNavigate();

  return (
    <section className="relative py-16 bg-transparent overflow-hidden">
      <style>
        {`
          @keyframes border-circulate {
            0% { stroke-dashoffset: 800; }
            100% { stroke-dashoffset: 0; }
          }
          .neon-path {
            stroke-dasharray: 100 700;
            animation: border-circulate 25s linear infinite;
          }
          .neon-path-1 { stroke: #00f2fe; animation-delay: 0s; }
          .neon-path-2 { stroke: #ff0080; animation-delay: -8.33s; }
          .neon-path-3 { stroke: #f7971e; animation-delay: -16.66s; }
        `}
      </style>
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="space-y-8">
            <ScrollReveal animation="fade-up" delay={0.1}>
              <div className="space-y-6">
                {/* Search Form */}
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    const input = (e.currentTarget.elements.namedItem('search') as HTMLInputElement).value;
                    if (input) {
                      const query = input.toLowerCase().trim();
                      if (query.includes("pharmacie")) {
                        navigate(`/pharmacies?q=${encodeURIComponent(input)}`);
                      } else if (query.includes("consultation") || query.includes("docteur") || query.includes("médecin")) {
                        navigate("/consultation");
                      } else if (query.includes("suivi") || query.includes("commande")) {
                        navigate("/livraison/suivi");
                      } else if (query.includes("carnet")) {
                        navigate("/ecarnet");
                      } else {
                        navigate(`/medicaments?q=${encodeURIComponent(input)}`);
                      }
                    }
                  }}
                  className="relative max-w-lg w-full"
                >
                  <div className="relative flex items-center">
                    <Search className="absolute left-6 h-6 w-6 text-muted-foreground z-10" />
                    <Input
                      name="search"
                      placeholder="Doliprane, Amoxicilline, Paracétamol..."
                      className="pl-14 pr-6 h-16 text-lg shadow-xl border-2 border-primary/20 focus:border-primary rounded-full bg-white/60 backdrop-blur-xl transition-all hover:bg-white/80 hover:shadow-2xl"
                    />
                  </div>

                  {/* Popular Searches */}
                  <div className="flex flex-wrap gap-2 text-sm mt-4 ml-4">
                    <span className="text-muted-foreground font-medium text-xs uppercase tracking-wider self-center mr-1">Populaire:</span>
                    {["Doliprane", "Amoxicilline", "Vitamine C"].map(term => (
                      <Badge
                        key={term}
                        variant="secondary"
                        className="cursor-pointer hover:bg-primary hover:text-white transition-colors bg-white/80 text-slate-700 backdrop-blur-sm border-slate-200/50 shadow-sm"
                        onClick={() => navigate(`/medicaments?q=${term}`)}
                      >
                        {term}
                      </Badge>
                    ))}
                  </div>
                </form>

                <h1 className="text-4xl md:text-6xl font-bold leading-tight">
                  {titlePrefix}
                  <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent block">
                    {titleHighlight}
                  </span>
                </h1>

                <div className="space-y-4">
                  <p className="text-xl text-muted-foreground leading-relaxed">
                    {subtitle}
                  </p>

                  <div className="flex flex-wrap gap-3">
                    <ScannerOrdonnance />
                    <Button
                      variant="outline"
                      onClick={() => navigate('/pharmacies')}
                      className="glass-morphism hover:!bg-primary/15 hover:!border-primary/40 hover:!text-primary text-foreground rounded-full px-5 py-2 h-auto text-sm flex items-center gap-2 transition-all duration-300 hover:scale-105 hover:shadow-[0_0_20px_rgba(0,112,192,0.15)]"
                    >
                      <MapPin className="h-4 w-4 text-primary" />
                      Trouver une pharmacie
                    </Button>

                    <Button
                      variant="outline"
                      onClick={() => navigate('/livraison/suivi')}
                      className="glass-morphism hover:!bg-emerald-500/15 hover:!border-emerald-500/40 hover:!text-emerald-600 text-foreground rounded-full px-5 py-2 h-auto text-sm flex items-center gap-2 transition-all duration-300 hover:scale-105 hover:shadow-[0_0_20px_rgba(16,185,129,0.15)]"
                    >
                      <Truck className="h-4 w-4 text-secondary" />
                      Suivre ma commande
                    </Button>

                    <Button
                      variant="default"
                      onClick={() => window.open('https://wa.me/22501402712217', '_blank')}
                      className="bg-[#25D366] hover:bg-[#128C7E] text-white border-none rounded-full px-5 py-2 h-auto text-sm flex items-center gap-2"
                    >
                      <span className="text-lg">💬</span>
                      WhatsApp
                    </Button>
                  </div>
                </div>
              </div>
            </ScrollReveal>

            <ScrollReveal animation="fade-up" delay={0.5}>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6 pt-8">
                <div className="text-center p-4 rounded-2xl border border-primary/20 bg-primary/5 backdrop-blur-sm shadow-sm transition-all duration-300">
                  <div className="text-2xl md:text-3xl font-bold text-primary">24h</div>
                  <div className="text-sm text-muted-foreground font-medium">Service continu</div>
                </div>
                <div className="text-center p-4 rounded-2xl border border-secondary/20 bg-secondary/5 backdrop-blur-sm shadow-sm transition-all duration-300">
                  <div className="text-2xl md:text-3xl font-bold text-secondary">45m-2h</div>
                  <div className="text-sm text-muted-foreground font-medium">Livraison rapide</div>
                </div>
                <div className="text-center p-4 rounded-2xl border border-accent/20 bg-accent/5 backdrop-blur-sm shadow-sm transition-all duration-300">
                  <div className="text-2xl md:text-3xl font-bold text-accent">150+</div>
                  <div className="text-sm text-muted-foreground font-medium">Pharmacies</div>
                </div>
              </div>
            </ScrollReveal>
          </div>

          <ScrollReveal animation="fade-left" delay={0.3}>
            <div className="w-full">
              <Carousel
                className="w-full"
                plugins={[
                  Autoplay({
                    delay: 4000,
                  }),
                ]}
              >
                <CarouselContent>
                  {latestProducts.map((product) => (
                    <CarouselItem key={product.id}>
                      <Card className="overflow-hidden border-none shadow-2xl bg-white/40 backdrop-blur-md rounded-[2rem] relative p-1">
                        {/* Segmented Neon Border SVG Overlay */}
                        <div className="absolute inset-0 pointer-events-none z-20">
                          <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                            <rect
                              x="0.5" y="0.5" width="99" height="99"
                              rx="8" ry="8"
                              fill="none"
                              strokeWidth="0.5"
                              className="neon-path neon-path-1"
                            />
                            <rect
                              x="0.5" y="0.5" width="99" height="99"
                              rx="8" ry="8"
                              fill="none"
                              strokeWidth="0.5"
                              className="neon-path neon-path-2"
                            />
                            <rect
                              x="0.5" y="0.5" width="99" height="99"
                              rx="8" ry="8"
                              fill="none"
                              strokeWidth="0.8"
                              className="neon-path neon-path-3"
                            />
                          </svg>
                        </div>

                        <div className="aspect-[4/3] relative overflow-hidden rounded-[1.8rem]">
                          <img
                            src={`/${product.image}`}
                            alt={product.name}
                            className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
                            loading="lazy"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent">
                            <div className="absolute bottom-6 left-6 right-6">
                              <h3 className="text-xl font-bold text-white mb-1">{product.name}</h3>
                              <p className="text-sm text-white/80">{product.description}</p>
                            </div>
                          </div>
                        </div>
                      </Card>
                    </CarouselItem>
                  ))}
                </CarouselContent>
              </Carousel>
            </div>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;

