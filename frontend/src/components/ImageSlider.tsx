import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, ChevronRight, Play, Pause, Star, Heart } from "lucide-react";
import ScrollReveal from "@/components/ScrollReveal";
const promoSlides = [
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
    image: "hero-carousel/delivery-new.jpg",
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
    image: "hero-carousel/app-v4.png",
    badge: "APPLICATION",
    cta: "Télécharger l'app",
    gradient: "from-purple-500 to-violet-600",
    offer: "Disponible sur iOS & Android"
  }
];
const ImageSlider = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [favorites, setFavorites] = useState<number[]>([]);
  useEffect(() => {
    if (!isAutoPlaying) return;
    const timer = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % promoSlides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [isAutoPlaying]);
  const nextSlide = () => {
    setCurrentSlide(prev => (prev + 1) % promoSlides.length);
  };
  const prevSlide = () => {
    setCurrentSlide(prev => (prev - 1 + promoSlides.length) % promoSlides.length);
  };
  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };
  const toggleAutoPlay = () => {
    setIsAutoPlaying(!isAutoPlaying);
  };
  const toggleFavorite = (id: number) => {
    setFavorites(prev => prev.includes(id) ? prev.filter(fav => fav !== id) : [...prev, id]);
  };
  const currentSlideData = promoSlides[currentSlide];
  return <section className="py-8 bg-background">
    <div className="container mx-auto px-4">
      <ScrollReveal animation="fade-up">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold mb-2">Offres & Promotions</h2>
          <p className="text-muted-foreground">Découvrez nos dernières offres et services exclusifs</p>
        </div>
      </ScrollReveal>

      <ScrollReveal animation="zoom-in" delay={0.2}>
        <div className="relative max-w-4xl mx-auto">
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
          `}</style>

          {/* Pronounced Glassmorphism Card */}
          <Card className="relative min-h-[450px] md:h-[500px] flex items-center transition-all duration-500 border-2 border-white/30 shadow-[0_20px_50px_rgba(0,0,0,0.3)] premium-rounded overflow-hidden bg-white/15 backdrop-blur-3xl">
            {/* Interior Glossy Gradient */}
            <div className="absolute inset-0 bg-gradient-to-tr from-white/10 to-transparent pointer-events-none" />

            {/* Background Pattern - Stronger for contrast */}
            <div className="absolute inset-0 opacity-30">
              <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-white/20 blur-3xl"></div>
              <div className="absolute bottom-0 left-0 w-64 h-64 rounded-full bg-primary/20 blur-3xl"></div>
            </div>

            {/* Content */}
            <div className="relative z-10 w-full py-12">
              <div className="container mx-auto px-6 md:px-12">
                <div className="grid md:grid-cols-2 gap-12 items-center">
                  <div className="text-foreground space-y-4">
                    <div className="space-y-3">
                      <h3 className="text-xl md:text-2xl font-black leading-tight text-foreground tracking-tighter">
                        {currentSlideData.title}
                      </h3>
                      <p className="text-base md:text-lg font-extrabold text-primary/100">
                        {currentSlideData.subtitle}
                      </p>
                      <p className="opacity-95 text-sm md:text-base font-bold leading-relaxed text-foreground/80 max-w-md">
                        {currentSlideData.description}
                      </p>
                    </div>

                    <div className="bg-white/20 backdrop-blur-md rounded-xl p-4 border border-white/30 shadow-lg max-w-fit">
                      <p className="font-bold text-lg flex items-center gap-2">
                        <span className="text-2xl">🎉</span> {currentSlideData.offer}
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-3 pt-2">
                      <Button size="lg" className="bg-primary text-white hover:brightness-110 shadow-xl font-bold transition-all duration-300 hover:scale-105 px-8">
                        {currentSlideData.cta}
                      </Button>
                      <Button
                        variant="outline"
                        size="lg"
                        className="bg-white/20 border-white/30 text-foreground hover:bg-white/30 shadow-lg font-bold transition-all duration-300 hover:scale-105 px-6 flex items-center gap-2"
                        onClick={() => toggleFavorite(currentSlideData.id)}
                      >
                        <Heart className={`h-5 w-5 ${favorites.includes(currentSlideData.id) ? 'fill-red-500 text-red-500' : ''} transition-colors duration-300`} />
                        <span>{favorites.includes(currentSlideData.id) ? 'Sauvegardé' : 'Sauvegarder'}</span>
                      </Button>
                    </div>
                  </div>

                  <div className="hidden md:flex flex-col items-center justify-center gap-4">
                    <Badge className="bg-white/10 text-white border-white/10 hover:bg-white/20 text-sm px-4 py-1">
                      {currentSlideData.badge}
                    </Badge>

                    {/* Neon Border Image Frame */}
                    <div className="relative w-80 h-80">
                      <div className="neon-frame">
                        <svg className="neon-svg" viewBox="0 0 1200 1200" preserveAspectRatio="none">
                          <path className="path-green" d="M 50,5 L 1150,5 Q 1195,5 1195,50 L 1195,1150 Q 1195,1195 1150,1195 L 50,1195 Q 5,1195 5,1150 L 5,50 Q 5,5 50,5" />
                          <path className="path-blue" d="M 50,5 L 1150,5 Q 1195,5 1195,50 L 1195,1150 Q 1195,1195 1150,1195 L 50,1195 Q 5,1195 5,1150 L 5,50 Q 5,5 50,5" />
                          <path className="path-orange" d="M 50,5 L 1150,5 Q 1195,5 1195,50 L 1195,1150 Q 1195,1195 1150,1195 L 50,1195 Q 5,1195 5,1150 L 5,50 Q 5,5 50,5" />
                          <path className="path-red" d="M 50,5 L 1150,5 Q 1195,5 1195,50 L 1195,1150 Q 1195,1195 1150,1195 L 50,1195 Q 5,1195 5,1150 L 5,50 Q 5,5 50,5" />
                        </svg>
                      </div>
                      <div className="led-inner-frame w-full h-full">
                        <img
                          src={`/${currentSlideData.image}`}
                          alt={currentSlideData.title}
                          className="w-full h-full object-cover"
                          style={{ borderRadius: '20px' }}
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                            const parent = target.parentElement;
                            if (parent) {
                              parent.innerHTML = `<div class="w-full h-full flex items-center justify-center text-8xl bg-slate-900 text-white">
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
            </div>

            {/* Controls and Counter */}
            <div className="absolute top-4 right-4 flex gap-2">
              <div className="bg-black/20 backdrop-blur-sm text-white px-3 py-1 rounded-full text-sm">
                {currentSlide + 1} / {promoSlides.length}
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
            {promoSlides.map((_, index) => <button key={index} onClick={() => goToSlide(index)} className={`w-3 h-3 rounded-full transition-all duration-300 ${index === currentSlide ? "bg-primary w-8" : "bg-muted hover:bg-muted-foreground/50"}`} />)}
          </div>


        </div>
      </ScrollReveal>

      {/* Thumbnails */}
      <ScrollReveal animation="fade-up" delay={0.4}>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8 max-w-4xl mx-auto">
          {promoSlides.map((slide, index) => <Card key={slide.id} className={`cursor-pointer transition-all duration-300 hover:scale-105 h-32 ${index === currentSlide ? 'ring-2 ring-primary shadow-lg' : 'hover:shadow-md'}`} onClick={() => goToSlide(index)}>
            <div className={`p-4 bg-gradient-to-br ${slide.gradient} text-white rounded-lg h-full flex items-center justify-center`}>
              <div className="text-center">
                <div className="text-2xl mb-2">
                  {slide.id === 1 && "💊"}
                  {slide.id === 2 && "👨‍⚕️"}
                  {slide.id === 3 && "🚀"}
                  {slide.id === 4 && "📱"}
                </div>
                <h4 className="font-semibold text-sm">{slide.title}</h4>
                <p className="text-xs text-white/80 mt-1">{slide.badge}</p>
              </div>
            </div>
          </Card>)}
        </div>
      </ScrollReveal>
    </div>
  </section>;
};
export default ImageSlider;