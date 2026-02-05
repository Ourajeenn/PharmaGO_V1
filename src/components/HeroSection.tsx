import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Clock, Truck, ChevronLeft, ChevronRight, Star, Search, Rocket } from "lucide-react";
import { Input } from "@/components/ui/input";
import ScrollReveal from "@/components/ScrollReveal";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
} from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";

// Using the uploaded pharmacy image
import { useNavigate } from "react-router-dom";

const heroImage = "/pharmacy-hero.jpg";

const latestProducts = [{
  id: 1,
  name: "Doliprane 1000mg",
  price: "2,500 FCFA",
  category: "Antalgique",
  image: "/pharmacy-hero.jpg",
  rating: 4.8,
  inStock: true,
  isNew: true
}, {
  id: 2,
  name: "Amoxicilline 500mg",
  price: "3,200 FCFA",
  category: "Antibiotique",
  image: "/placeholder.svg",
  rating: 4.9,
  inStock: true,
  isNew: true
}, {
  id: 3,
  name: "Vitamines C",
  price: "1,800 FCFA",
  category: "Complément",
  image: "/placeholder.svg",
  rating: 4.7,
  inStock: false,
  isNew: false
}];

interface HeroSectionProps {
  badgeText?: string;
  titlePrefix?: string;
  titleHighlight?: string;
  subtitle?: string;
}

const HeroSection = ({
  badgeText = "🚀 Nouveau à Abidjan",
  titlePrefix = "Votre santé,",
  titleHighlight = "livrée chez vous",
  subtitle = "Commandez vos médicaments, consultez un médecin, trouvez une pharmacie."
}: HeroSectionProps) => {
  const navigate = useNavigate();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [glowColor, setGlowColor] = useState<'orange' | 'blue' | 'green'>('orange');

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % latestProducts.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const colors: ('orange' | 'blue' | 'green')[] = ['orange', 'blue', 'green'];
    let index = 0;
    const interval = setInterval(() => {
      index = (index + 1) % colors.length;
      setGlowColor(colors[index]);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const getGlowStyle = () => {
    switch (glowColor) {
      case 'blue': return '0 0 40px rgba(59, 130, 246, 0.8)'; // blue-500
      case 'green': return '0 0 40px rgba(34, 197, 94, 0.8)'; // green-500
      default: return '0 0 40px rgba(249, 115, 22, 0.8)'; // orange-500
    }
  };

  const nextSlide = () => {
    setCurrentSlide(prev => (prev + 1) % latestProducts.length);
  };

  const prevSlide = () => {
    setCurrentSlide(prev => (prev - 1 + latestProducts.length) % latestProducts.length);
  };

  return <section className="relative py-16 bg-gradient-to-br from-background to-muted overflow-hidden">
    <div className="container mx-auto px-4">
      <div className="grid lg:grid-cols-2 gap-12 items-center">
        {/* Left Content */}
        <div className="space-y-8">
          <ScrollReveal animation="fade-up" delay={0.1}>
            <div className="space-y-6">
              {/* Search Form moved to the top */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const input = (e.currentTarget.elements.namedItem('search') as HTMLInputElement).value;
                  if (input) {
                    const query = input.toLowerCase().trim();
                    if (query.includes("pharmacie")) {
                      navigate(`/pharmacies?q=${encodeURIComponent(input)}`);
                    } else if (query.includes("consultation") || query.includes("docteur") || query.includes("médecin") || query.includes("medecin")) {
                      navigate("/consultation");
                    } else if (query.includes("suivi") || query.includes("commande")) {
                      navigate("/livraison/suivi");
                    } else if (query.includes("carnet") || query.includes("e-carnet")) {
                      navigate("/ecarnet");
                    } else {
                      navigate(`/medicaments?q=${encodeURIComponent(input)}`);
                    }
                  }
                }}
                className="relative max-w-lg w-full"
              >
                <div className="relative flex items-center">
                  <Search className="absolute left-4 h-5 w-5 text-muted-foreground z-10" />
                  <Input
                    name="search"
                    placeholder="Rechercher un médicament, une pharmacie..."
                    className="pl-12 pr-4 h-12 text-base shadow-lg border border-white/20 focus:border-primary rounded-full bg-white/40 backdrop-blur-md"
                  />
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

                {/* Shrunk buttons moved below subtitle */}
                <div className="flex flex-wrap gap-3">
                  <Button
                    variant="outline"
                    onClick={() => navigate('/pharmacies')}
                    className="glass-morphism hover:bg-white/40 text-foreground rounded-full px-5 py-2 h-auto text-sm hover:shadow-md transition-all flex items-center gap-2"
                  >
                    <MapPin className="h-4 w-4 text-primary" />
                    Trouver une pharmacie
                  </Button>

                  <Button
                    variant="outline"
                    onClick={() => navigate('/livraison/suivi')}
                    className="glass-morphism hover:bg-white/40 text-foreground rounded-full px-5 py-2 h-auto text-sm hover:shadow-md transition-all flex items-center gap-2"
                  >
                    <Truck className="h-4 w-4 text-secondary" />
                    Suivre ma commande
                  </Button>
                </div>
              </div>
            </div>
          </ScrollReveal>

          <ScrollReveal animation="fade-up" delay={0.5}>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6 pt-8">
              <div className="text-center p-4 rounded-2xl border border-primary/20 bg-primary/5 backdrop-blur-sm shadow-sm hover:shadow-md transition-all duration-300">
                <div className="text-2xl md:text-3xl font-bold text-primary">24h</div>
                <div className="text-sm text-muted-foreground font-medium">Service continu</div>
              </div>
              <div className="text-center p-4 rounded-2xl border border-secondary/20 bg-secondary/5 backdrop-blur-sm shadow-sm hover:shadow-md transition-all duration-300">
                <div className="text-2xl md:text-3xl font-bold text-secondary">30min</div>
                <div className="text-sm text-muted-foreground font-medium">Livraison rapide</div>
              </div>
              <div className="text-center p-4 rounded-2xl border border-accent/20 bg-accent/5 backdrop-blur-sm shadow-sm hover:shadow-md transition-all duration-300">
                <div className="text-2xl md:text-3xl font-bold text-accent">150+</div>
                <div className="text-sm text-muted-foreground font-medium">Pharmacies</div>
              </div>
            </div>
          </ScrollReveal>
        </div>

        {/* Right Content - Carousel with LED Border */}
        <div className="space-y-8">
          <style>{`
            @keyframes circulate {
              0% { stroke-dashoffset: 0; }
              100% { stroke-dashoffset: -6000; }
            }
            
            .neon-frame {
              position: absolute;
              inset: 0;
              border-radius: 20px;
              pointer-events: none;
              z-index: 10;
            }

            .neon-svg {
              width: 100%;
              height: 100%;
              overflow: visible;
            }

            .path-green {
              fill: none;
              stroke: #00ff88;
              stroke-width: 2;
              stroke-linecap: round;
              stroke-dasharray: 800 5200;
              animation: circulate 12s linear infinite;
              filter: drop-shadow(0 0 3px #00ff88) drop-shadow(0 0 6px #00ff88);
            }

            .path-blue {
              fill: none;
              stroke: #00aaff;
              stroke-width: 2;
              stroke-linecap: round;
              stroke-dasharray: 800 5200;
              animation: circulate 12s linear infinite;
              animation-delay: -3s;
              filter: drop-shadow(0 0 3px #00aaff) drop-shadow(0 0 6px #00aaff);
            }

            .path-orange {
              fill: none;
              stroke: #ff8800;
              stroke-width: 2;
              stroke-linecap: round;
              stroke-dasharray: 800 5200;
              animation: circulate 12s linear infinite;
              animation-delay: -6s;
              filter: drop-shadow(0 0 3px #ff8800) drop-shadow(0 0 6px #ff8800);
            }

            .path-red {
              fill: none;
              stroke: #ff0044;
              stroke-width: 2;
              stroke-linecap: round;
              stroke-dasharray: 800 5200;
              animation: circulate 12s linear infinite;
              animation-delay: -9s;
              filter: drop-shadow(0 0 3px #ff0044) drop-shadow(0 0 6px #ff0044);
            }
            
            .led-inner-frame {
              position: relative;
              width: 100%;
              height: 100%;
              border-radius: 20px;
              overflow: hidden;
              background: #000;
              z-index: 1;
              clip-path: inset(0 round 20px);
            }

            .glass-content {
              background: rgba(0, 0, 0, 0.25);
              backdrop-filter: blur(25px) saturate(150%);
              -webkit-backdrop-filter: blur(25px) saturate(150%);
              border-radius: 16px;
              padding: 20px 24px;
              border: 1px solid rgba(255, 255, 255, 0.15);
              box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.4);
              max-width: fit-content;
            }
          `}</style>

          <Carousel
            opts={{
              align: "start",
              loop: true,
            }}
            plugins={[
              Autoplay({
                delay: 4000,
              }),
            ]}
            className="w-full relative h-[400px]"
          >
            <CarouselContent className="h-full">
              {[
                {
                  image: "/hero-carousel/pharma-black.png",
                  title: "Service Pharmacie de Qualité",
                  subtitle: "Conseils d'experts et écoute personnalisée",
                  bgStyle: { backgroundSize: 'cover' }
                },
                {
                  image: "/hero-carousel/consultation.png",
                  title: "Consultation en Ligne",
                  subtitle: "Parlez à un pharmacien certifié en direct"
                },
                {
                  image: "/hero-carousel/delivery-v2.png",
                  title: "Suivi en Temps Réel",
                  subtitle: "Sachez exactement où est votre commande"
                },
                {
                  image: "/hero-carousel/app-v4.png",
                  title: "Gestion Santé",
                  subtitle: "Votre santé à portée de main"
                }
              ].map((slide, index) => (
                <CarouselItem key={index} className="p-0 h-full">
                  <div className="relative h-[400px] w-full" style={{ borderRadius: '20px' }}>
                    <div className="neon-frame">
                      <svg className="neon-svg" viewBox="0 0 1200 675" preserveAspectRatio="none">
                        <path className="path-green" d="M 25,5 L 1175,5 Q 1195,5 1195,25 L 1195,650 Q 1195,670 1175,670 L 25,670 Q 5,670 5,650 L 5,25 Q 5,5 25,5" />
                        <path className="path-blue" d="M 25,5 L 1175,5 Q 1195,5 1195,25 L 1195,650 Q 1195,670 1175,670 L 25,670 Q 5,670 5,650 L 5,25 Q 5,5 25,5" />
                        <path className="path-orange" d="M 25,5 L 1175,5 Q 1195,5 1195,25 L 1195,650 Q 1195,670 1175,670 L 25,670 Q 5,670 5,650 L 5,25 Q 5,5 25,5" />
                        <path className="path-red" d="M 25,5 L 1175,5 Q 1195,5 1195,25 L 1195,650 Q 1195,670 1175,670 L 25,670 Q 5,670 5,650 L 5,25 Q 5,5 25,5" />
                      </svg>
                    </div>

                    <div className="led-inner-frame h-full w-full">
                      {/* Background image */}
                      <div className="absolute inset-0 overflow-hidden" style={{
                        backgroundImage: `url(${slide.image})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center center',
                        backgroundRepeat: 'no-repeat',
                        borderRadius: '20px',
                        ...((slide as any).bgStyle || {})
                      }}>
                        <div className="absolute bottom-8 left-8 right-8 text-white z-20">
                          <h3 className="text-xl md:text-2xl font-black mb-1 tracking-tight text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                            {slide.title}
                          </h3>
                          <p className="text-sm md:text-base text-white/90 font-bold drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)] opacity-95 max-w-2xl line-clamp-2">
                            {slide.subtitle}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
          </Carousel>

          {/* Latest Products Carousel */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-2xl font-bold">Dernières sorties</h3>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={prevSlide} className="h-8 w-8 p-0">
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm" onClick={nextSlide} className="h-8 w-8 p-0">
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <Card className="p-6 bg-white/40 backdrop-blur-md border border-white/30 shadow-xl hover:shadow-2xl transition-all duration-300 rounded-2xl">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-lg flex items-center justify-center">
                  <span className="text-2xl">💊</span>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-semibold">{latestProducts[currentSlide].name}</h4>
                    {latestProducts[currentSlide].isNew && <Badge className="bg-accent/10 text-accent border-accent/20">
                      Nouveau
                    </Badge>}
                  </div>
                  <p className="text-muted-foreground text-sm">{latestProducts[currentSlide].category}</p>
                  <div className="flex items-center gap-4 mt-2">
                    <span className="font-bold text-primary">{latestProducts[currentSlide].price}</span>
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span className="text-sm">{latestProducts[currentSlide].rating}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4 text-secondary" />
                      <span className="text-sm">
                        {latestProducts[currentSlide].inStock ? "En stock" : "Indisponible"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            {/* Dots indicator */}
            <div className="flex justify-center gap-2">
              {latestProducts.map((_, index) => <button key={index} onClick={() => setCurrentSlide(index)} className={`w-2 h-2 rounded-full transition-all duration-300 ${index === currentSlide ? "bg-primary w-6" : "bg-muted"}`} />)}
            </div>
          </div>
        </div>
      </div>
    </div >
  </section >;
};
export default HeroSection;