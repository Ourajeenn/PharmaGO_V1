import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChevronLeft, ChevronRight, Play, Shield, Clock, Truck } from 'lucide-react';
import { Link } from 'react-router-dom';

const slides = [
  {
    id: 1,
    title: "Vos médicaments, livrés chez vous en toute sécurité",
    subtitle: "Service de livraison express 24h/24",
    description: "Commandez vos médicaments en ligne et recevez-les directement à votre domicile avec notre service de livraison sécurisé et rapide.",
    cta: "Commander maintenant",
    ctaLink: "/auth/patient",
    image: "/hero-pharmacy.jpg",
    features: [
      { icon: Shield, text: "Médicaments authentiques" },
      { icon: Clock, text: "Livraison express" },
      { icon: Truck, text: "Suivi en temps réel" }
    ],
    gradient: "from-blue-600 via-purple-600 to-teal-600"
  },
  {
    id: 2,
    title: "Pharmacies de garde disponibles 24h/24",
    subtitle: "Urgences médicales couvertes",
    description: "Accédez aux pharmacies de garde près de chez vous à tout moment. Service d'urgence avec livraison express en moins de 30 minutes.",
    cta: "Voir les pharmacies",
    ctaLink: "/#garde",
    image: "/hero-pharmacy.jpg",
    features: [
      { icon: Clock, text: "Service 24h/24" },
      { icon: Truck, text: "Livraison express" },
      { icon: Shield, text: "Pharmacies agréées" }
    ],
    gradient: "from-green-600 via-emerald-600 to-teal-600"
  },
  {
    id: 3,
    title: "Rejoignez notre réseau de livreurs",
    subtitle: "Opportunité d'emploi flexible",
    description: "Devenez livreur PharmaGo et générez des revenus avec des horaires flexibles. Formation gratuite et équipement fourni.",
    cta: "Devenir livreur",
    ctaLink: "/auth/driver",
    image: "/hero-pharmacy.jpg",
    features: [
      { icon: Truck, text: "Horaires flexibles" },
      { icon: Shield, text: "Formation gratuite" },
      { icon: Clock, text: "Revenus attractifs" }
    ],
    gradient: "from-orange-600 via-red-600 to-pink-600"
  }
];

export const HeroSlider: React.FC = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  useEffect(() => {
    if (!isAutoPlaying) return;

    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [isAutoPlaying]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  return (
    <div className="relative h-screen overflow-hidden bg-gradient-to-br from-primary via-secondary to-accent">
      {/* Animated background particles */}
      <div className="absolute inset-0">
        {[...Array(30)].map((_, i) => (
          <div
            key={i}
            className="absolute animate-float"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${3 + Math.random() * 4}s`
            }}
          >
            <div
              className="w-2 h-2 bg-white/20 rounded-full"
              style={{
                transform: `scale(${0.5 + Math.random()})`,
              }}
            />
          </div>
        ))}
      </div>

      {/* Slide container */}
      <div className="relative h-full">
        {slides.map((slide, index) => (
          <div
            key={slide.id}
            className={`absolute inset-0 transition-all duration-1000 ease-in-out ${index === currentSlide
                ? 'opacity-100 translate-x-0'
                : index < currentSlide
                  ? 'opacity-0 -translate-x-full'
                  : 'opacity-0 translate-x-full'
              }`}
          >
            <div className={`absolute inset-0 bg-gradient-to-r ${slide.gradient} opacity-90`} />

            <div className="container mx-auto px-4 h-full flex items-center relative z-10">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center w-full">
                {/* Content */}
                <div className="text-white space-y-6 animate-fade-in">
                  <Badge variant="secondary" className="bg-white/20 text-white border-white/30 hover:bg-white/30">
                    {slide.subtitle}
                  </Badge>

                  <h1 className="text-4xl md:text-6xl font-bold leading-tight">
                    {slide.title}
                  </h1>

                  <p className="text-lg md:text-xl text-white/90 leading-relaxed max-w-2xl">
                    {slide.description}
                  </p>

                  {/* Features */}
                  <div className="flex flex-wrap gap-4">
                    {slide.features.map((feature, idx) => (
                      <div key={idx} className="flex items-center gap-2 bg-white/20 rounded-full px-4 py-2">
                        <feature.icon className="h-4 w-4" />
                        <span className="text-sm font-medium">{feature.text}</span>
                      </div>
                    ))}
                  </div>

                  {/* CTA */}
                  <div className="flex flex-col sm:flex-row gap-4 pt-4">
                    <Button asChild size="lg" className="bg-white text-primary hover:bg-white/90 font-semibold">
                      <Link to={slide.ctaLink}>
                        {slide.cta}
                      </Link>
                    </Button>
                    <Button
                      variant="outline"
                      size="lg"
                      className="border-white text-white hover:bg-white hover:text-primary"
                      onClick={() => setIsAutoPlaying(!isAutoPlaying)}
                    >
                      <Play className={`h-4 w-4 mr-2 ${isAutoPlaying ? '' : 'animate-pulse'}`} />
                      {isAutoPlaying ? 'Pause' : 'Play'} Auto
                    </Button>
                  </div>
                </div>

                {/* Image/Visual */}
                <div className="relative animate-scale-in">
                  <div className="relative w-full h-96 lg:h-[500px] rounded-[2.5rem] overflow-hidden shadow-2xl">
                    <img
                      src={slide.image}
                      alt={slide.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                  </div>

                  {/* Floating elements */}
                  <div className="absolute -top-4 -right-4 bg-white rounded-full p-4 shadow-lg animate-bounce">
                    <Shield className="h-6 w-6 text-primary" />
                  </div>
                  <div className="absolute -bottom-4 -left-4 bg-accent text-white rounded-full p-4 shadow-lg animate-pulse">
                    <Truck className="h-6 w-6" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Navigation */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-20">
        <div className="flex items-center gap-4 bg-white/20 backdrop-blur-sm rounded-full px-6 py-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={prevSlide}
            className="h-8 w-8 text-white hover:bg-white/20"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>

          <div className="flex gap-2">
            {slides.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${index === currentSlide
                    ? 'bg-white w-8'
                    : 'bg-white/50 hover:bg-white/80'
                  }`}
              />
            ))}
          </div>

          <Button
            variant="ghost"
            size="icon"
            onClick={nextSlide}
            className="h-8 w-8 text-white hover:bg-white/20"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Slide counter */}
      <div className="absolute top-8 right-8 z-20">
        <div className="bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 text-white text-sm font-medium">
          {currentSlide + 1} / {slides.length}
        </div>
      </div>
    </div>
  );
};