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
            <div className="grid grid-cols-3 gap-6 pt-8">
              <div className="text-center p-4 rounded-2xl border border-primary/20 bg-primary/5 backdrop-blur-sm shadow-sm hover:shadow-md transition-all duration-300">
                <div className="text-3xl font-bold text-primary">24h</div>
                <div className="text-sm text-muted-foreground font-medium">Service continu</div>
              </div>
              <div className="text-center p-4 rounded-2xl border border-secondary/20 bg-secondary/5 backdrop-blur-sm shadow-sm hover:shadow-md transition-all duration-300">
                <div className="text-3xl font-bold text-secondary">30min</div>
                <div className="text-sm text-muted-foreground font-medium">Livraison rapide</div>
              </div>
              <div className="text-center p-4 rounded-2xl border border-accent/20 bg-accent/5 backdrop-blur-sm shadow-sm hover:shadow-md transition-all duration-300">
                <div className="text-3xl font-bold text-accent">150+</div>
                <div className="text-sm text-muted-foreground font-medium">Pharmacies</div>
              </div>
            </div>
          </ScrollReveal>
        </div>

        {/* Right Content - Carousel */}
        <div className="space-y-8">
          <Carousel
            plugins={[
              Autoplay({
                delay: 5000,
              }),
            ]}
            className="w-full relative h-[500px] rounded-[2.5rem] overflow-hidden shadow-2xl"
          >
            <CarouselContent>
              {[
                {
                  image: "/hero-carousel/pharmacist-service.jpg",
                  title: "Service Pharmacie de Qualité",
                  subtitle: "Conseils d'experts et écoute personnalisée",
                  glow: "rgba(20, 184, 166, 0.8)", // teal
                  bgStyle: { backgroundSize: 'cover' }
                },
                {
                  image: "/hero-carousel/consultation.png",
                  title: "Consultation en Ligne",
                  subtitle: "Parlez à un pharmacien certifié en direct",
                  glow: "rgba(59, 130, 246, 0.8)" // blue
                },
                {
                  image: "/hero-carousel/delivery-v2.png",
                  title: "Suivi en Temps Réel",
                  subtitle: "Sachez exactement où est votre commande",
                  glow: "rgba(34, 197, 94, 0.8)" // green
                },
                {
                  image: "/hero-carousel/app.png",
                  title: "Gestion Santé",
                  subtitle: "Votre santé à portée de main",
                  glow: "rgba(168, 85, 247, 0.8)" // purple
                }
              ].map((slide, index) => (
                <CarouselItem key={index} className="p-0">
                  {/* Outer container for the border effect */}
                  <div className="relative h-[500px] w-full rounded-[2.5rem] overflow-hidden group p-[3px]">

                    {/* Rotating LED Border */}
                    <div
                      className="absolute top-[-50%] left-[-50%] w-[200%] h-[200%] animate-[spin_4s_linear_infinite]"
                      style={{
                        background: `conic-gradient(transparent, transparent, transparent, ${slide.glow})`
                      }}
                    />

                    {/* Inner content container */}
                    <div className="relative h-full w-full bg-background rounded-[2.3rem] overflow-hidden">
                      <div className="relative h-full w-full" style={{
                        backgroundImage: `url(${slide.image})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center center',
                        backgroundRepeat: 'no-repeat',
                        ...((slide as any).bgStyle || {})
                      }}>
                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />

                        <div className="absolute bottom-10 left-10 text-white p-4 max-w-md">
                          <h3 className="text-4xl font-black mb-3 drop-shadow-2xl tracking-tighter uppercase">{slide.title}</h3>
                          <p className="text-white/80 text-xl font-medium drop-shadow-md leading-relaxed">{slide.subtitle}</p>
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

            <Card className="p-6 bg-white/40 backdrop-blur-md border border-white/30 shadow-xl hover:shadow-2xl transition-all duration-300">
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