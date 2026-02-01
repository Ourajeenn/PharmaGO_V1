import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Clock, Truck, ChevronLeft, ChevronRight, Star, Search, Rocket, Play, Pause, Heart } from "lucide-react";
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

const heroSlides = [
  {
    id: 1,
    title: "Service Pharmacie de Qualité",
    subtitle: "Conseils d'experts et écoute personnalisée",
    description: "Bénéficiez de conseils professionnels de pharmaciens certifiés pour tous vos besoins de santé",
    image: "hero-carousel/pharmacist-service.jpg",
    badge: "QUALITÉ",
    cta: "Nos Services",
    gradient: "from-teal-500 to-cyan-600",
    offer: "Conseils gratuits 24h/24"
  },
  {
    id: 2,
    title: "Consultation en Ligne",
    subtitle: "Parlez à un pharmacien certifié en direct",
    description: "Téléconsultation rapide et sécurisée avec nos pharmaciens disponibles à tout moment",
    image: "hero-carousel/consultation.png",
    badge: "TÉLÉSANTÉ",
    cta: "Consulter maintenant",
    gradient: "from-blue-500 to-indigo-600",
    offer: "Première consultation offerte"
  },
  {
    id: 3,
    title: "Suivi en Temps Réel",
    subtitle: "Sachez exactement où est votre commande",
    description: "Suivez votre livraison en direct avec notre système de tracking GPS en temps réel",
    image: "hero-carousel/delivery-v2.png",
    badge: "LIVRAISON",
    cta: "Suivre ma commande",
    gradient: "from-green-500 to-emerald-600",
    offer: "Livraison en 30 minutes"
  },
  {
    id: 4,
    title: "Gestion Santé",
    subtitle: "Votre santé à portée de main",
    description: "Application mobile complète pour gérer vos ordonnances, rendez-vous et historique médical",
    image: "hero-carousel/app.png",
    badge: "APPLICATION",
    cta: "Télécharger l'app",
    gradient: "from-purple-500 to-violet-600",
    offer: "Disponible sur iOS & Android"
  }
];

const HeroSection = ({
  badgeText = "🚀 Nouveau à Abidjan",
  titlePrefix = "Votre santé,",
  titleHighlight = "livrée chez vous",
  subtitle = "Commandez vos médicaments, consultez un médecin, trouvez une pharmacie."
}: HeroSectionProps) => {
  const navigate = useNavigate();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [productSlide, setProductSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [favorites, setFavorites] = useState<number[]>([]);

  const currentSlideData = heroSlides[currentSlide];

  // Auto-play for hero carousel
  useEffect(() => {
    if (!isAutoPlaying) return;
    const timer = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % heroSlides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [isAutoPlaying]);

  // Auto-play for products carousel
  useEffect(() => {
    const timer = setInterval(() => {
      setProductSlide(prev => (prev + 1) % latestProducts.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  const nextSlide = () => {
    setCurrentSlide(prev => (prev + 1) % heroSlides.length);
  };

  const prevSlide = () => {
    setCurrentSlide(prev => (prev - 1 + heroSlides.length) % heroSlides.length);
  };

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  const toggleAutoPlay = () => {
    setIsAutoPlaying(!isAutoPlaying);
  };

  const toggleFavorite = (id: number) => {
    setFavorites(prev =>
      prev.includes(id) ? prev.filter(fav => fav !== id) : [...prev, id]
    );
  };

  const nextProductSlide = () => {
    setProductSlide(prev => (prev + 1) % latestProducts.length);
  };

  const prevProductSlide = () => {
    setProductSlide(prev => (prev - 1 + latestProducts.length) % latestProducts.length);
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
          {/* Right Content - New Card-Based Carousel */}
          <div className="relative">
            <Card className="relative min-h-[450px] md:h-[500px] flex items-center transition-all duration-500 border-none shadow-2xl premium-rounded">
              <div className={`absolute inset-0 bg-gradient-to-br ${currentSlideData.gradient} opacity-95`} />

              {/* Background Pattern */}
              <div className="absolute inset-0 opacity-15">
                <div className="absolute top-10 right-10 w-48 h-48 rounded-full bg-white/20 animate-pulse blur-2xl"></div>
                <div className="absolute bottom-10 left-10 w-32 h-32 rounded-full bg-white/10 animate-pulse delay-1000 blur-xl"></div>
                <div className="absolute top-1/2 left-1/2 w-64 h-64 rounded-full bg-white/5 animate-pulse delay-500 blur-3xl"></div>
              </div>

              {/* Content */}
              <div className="relative z-10 w-full py-12">
                <div className="container mx-auto px-6 md:px-12">
                  <div className="grid md:grid-cols-2 gap-12 items-center">
                    <div className="text-white space-y-8">
                      <div className="space-y-3">
                        <h3 className="text-3xl md:text-4xl font-bold leading-tight">
                          {currentSlideData.title}
                        </h3>
                        <p className="text-xl md:text-2xl font-medium text-white/90">
                          {currentSlideData.subtitle}
                        </p>
                        <p className="text-white/80 text-lg">
                          {currentSlideData.description}
                        </p>
                      </div>

                      <div className="bg-white/15 backdrop-blur-md rounded-xl p-4 border border-white/20 shadow-inner max-w-fit">
                        <p className="text-white font-bold text-lg flex items-center gap-2">
                          <span className="text-2xl">🎉</span> {currentSlideData.offer}
                        </p>
                      </div>

                      <div className="flex flex-wrap gap-3 pt-2">
                        <Button size="lg" className="bg-white text-gray-900 hover:bg-white/90 shadow-xl font-bold transition-all duration-300 hover:scale-105 px-8">
                          {currentSlideData.cta}
                        </Button>
                        <Button
                          variant="outline"
                          size="lg"
                          className="bg-black/20 border-white/40 text-white hover:bg-white hover:text-gray-900 hover:border-white shadow-lg font-bold transition-all duration-300 hover:scale-105 px-6 flex items-center gap-2"
                          onClick={() => toggleFavorite(currentSlideData.id)}
                        >
                          <Heart className={`h-5 w-5 ${favorites.includes(currentSlideData.id) ? 'fill-red-500 text-red-500' : ''} transition-colors duration-300`} />
                          <span>{favorites.includes(currentSlideData.id) ? 'Sauvegardé' : 'Sauvegarder'}</span>
                        </Button>
                        <Button
                          variant="outline"
                          size="lg"
                          className="bg-black/20 border-white/40 text-white hover:bg-white hover:text-gray-900 hover:border-white shadow-lg font-bold transition-all duration-300 hover:scale-105 px-6"
                        >
                          Télécharger
                        </Button>
                      </div>
                    </div>

                    <div className="hidden md:flex flex-col items-center justify-center gap-4">
                      <Badge className="bg-white/20 text-white border-white/30 hover:bg-white/30 text-sm px-4 py-1">
                        {currentSlideData.badge}
                      </Badge>
                      <div className="w-80 h-80 rounded-3xl overflow-hidden shadow-2xl border-4 border-white/30 backdrop-blur-sm bg-white/5">
                        <img
                          src={`/${currentSlideData.image}`}
                          alt={currentSlideData.title}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            console.error(`Failed to load image: /${currentSlideData.image}`);
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                            const parent = target.parentElement;
                            if (parent) {
                              parent.innerHTML = `<div class="w-full h-full flex items-center justify-center text-8xl bg-gradient-to-br ${currentSlideData.gradient}">
                                ${currentSlideData.id === 1 ? "💊" : ""}
                                ${currentSlideData.id === 2 ? "👨‍⚕️" : ""}
                                ${currentSlideData.id === 3 ? "🚀" : ""}
                                ${currentSlideData.id === 4 ? "📱" : ""}
                              </div>`;
                            }
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Controls and Counter */}
              <div className="absolute top-4 right-4 flex gap-2">
                <div className="bg-black/20 backdrop-blur-sm text-white px-3 py-1 rounded-full text-sm">
                  {currentSlide + 1} / {heroSlides.length}
                </div>
                <Button variant="ghost" size="sm" onClick={toggleAutoPlay} className="bg-white/10 text-white hover:bg-white/20 border-white/20">
                  {isAutoPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                </Button>
              </div>

              {/* Navigation Arrows */}
              <Button variant="ghost" size="sm" onClick={prevSlide} className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/10 text-white hover:bg-white/20 border-white/20 h-12 w-12">
                <ChevronLeft className="h-6 w-6" />
              </Button>
              <Button variant="ghost" size="sm" onClick={nextSlide} className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/10 text-white hover:bg-white/20 border-white/20 h-12 w-12">
                <ChevronRight className="h-6 w-6" />
              </Button>
            </Card>

            {/* Slide Indicators */}
            <div className="flex justify-center gap-2 mt-6">
              {heroSlides.map((_, index) => (
                <button
                  key={index}
                  onClick={() => goToSlide(index)}
                  className={`w-3 h-3 rounded-full transition-all duration-300 ${index === currentSlide ? "bg-primary w-8" : "bg-muted hover:bg-muted-foreground/50"
                    }`}
                />
              ))}
            </div>
          </div>

          {/* Latest Products Carousel */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-2xl font-bold">Dernières sorties</h3>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={prevProductSlide} className="h-8 w-8 p-0">
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm" onClick={nextProductSlide} className="h-8 w-8 p-0">
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
                    <h4 className="font-semibold">{latestProducts[productSlide].name}</h4>
                    {latestProducts[productSlide].isNew && <Badge className="bg-accent/10 text-accent border-accent/20">
                      Nouveau
                    </Badge>}
                  </div>
                  <p className="text-muted-foreground text-sm">{latestProducts[productSlide].category}</p>
                  <div className="flex items-center gap-4 mt-2">
                    <span className="font-bold text-primary">{latestProducts[productSlide].price}</span>
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span className="text-sm">{latestProducts[productSlide].rating}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4 text-secondary" />
                      <span className="text-sm">
                        {latestProducts[productSlide].inStock ? "En stock" : "Indisponible"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            {/* Dots indicator */}
            <div className="flex justify-center gap-2">
              {latestProducts.map((_, index) => <button key={index} onClick={() => setProductSlide(index)} className={`w-2 h-2 rounded-full transition-all duration-300 ${index === productSlide ? "bg-primary w-6" : "bg-muted"}`} />)}
            </div>
          </div>
        </div>
      </div>
    </div >
  </section >;
};
export default HeroSection;