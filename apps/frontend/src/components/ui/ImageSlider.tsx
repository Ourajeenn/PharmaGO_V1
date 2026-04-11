import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, ChevronRight, Play, Pause, Sparkles, ArrowRight, ShieldCheck, Zap } from "lucide-react";
import ScrollReveal from "@/components/home/ScrollReveal";
import { useNavigate } from "react-router-dom";

const promoSlides = [
  {
    id: 1,
    title: "Service Pharmacie",
    subtitle: "Conseils d'experts",
    description: "Bénéficiez de conseils professionnels de pharmaciens certifiés en direct. Une expertise médicale à portée de main pour votre bien-être quotidien.",
    image: "hero-carousel/pharma-black.png",
    badge: "QUALITÉ",
    cta: "Nos Services",
    link: "/pharmacies",
    gradient: "from-teal-500 to-cyan-600",
    offer: "Conseils gratuits 24h/24",
    icon: <ShieldCheck className="h-5 w-5" />
  },
  {
    id: 2,
    title: "Consultation en Ligne",
    subtitle: "Parlez à un expert",
    description: "Téléconsultation rapide et sécurisée avec nos pharmaciens. Obtenez un avis médical et vos ordonnances sans vous déplacer.",
    image: "hero-carousel/consultation.png",
    badge: "TÉLÉSANTÉ",
    cta: "Consulter",
    link: "/consultation",
    gradient: "from-blue-500 to-indigo-600",
    offer: "Première consultation offerte",
    icon: <Zap className="h-5 w-5" />
  },
  {
    id: 3,
    title: "Livraison Express",
    subtitle: "Suivi en temps réel",
    description: "Suivez votre livraison en direct avec notre système GPS haute précision. Vos médicaments chez vous en moins de 45 minutes.",
    image: "hero-carousel/delivery-v2.png",
    badge: "LOGISTIQUE",
    cta: "Suivre colis",
    link: "/livraison/suivi",
    gradient: "from-green-500 to-emerald-600",
    offer: "Livraison en 45 min",
    icon: <ArrowRight className="h-5 w-5" />
  },
  {
    id: 5,
    title: "Application Mobile",
    subtitle: "Santé connectée",
    description: "Gérez vos ordonnances, rappels de prises et rendez-vous depuis votre smartphone. Toute votre pharmacie dans votre poche.",
    image: "hero-carousel/app-v4.png",
    badge: "MOBILITÉ",
    cta: "Télécharger",
    link: "/#download",
    gradient: "from-purple-500 to-violet-600",
    offer: "Disponible sur iOS & Android",
    icon: <Sparkles className="h-5 w-5" />
  }
];

const ImageSlider = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAutoPlaying) return;
    const timer = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % promoSlides.length);
    }, 6000);
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

  const currentSlideData = promoSlides[currentSlide];

  return (
    <section className="py-16 bg-transparent relative overflow-hidden">
      <div className="container mx-auto px-4 relative z-10">
        <ScrollReveal animation="fade-up">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="h-px w-8 bg-primary"></span>
                <span className="text-primary font-bold text-sm tracking-widest uppercase">Promotions</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-black tracking-tight text-slate-900">Offres & Exclusivités</h2>
            </div>
            <p className="text-slate-600 max-w-md md:text-right">
              Explorez nos services digitaux et profitez d'avantages exclusifs pour simplifier votre parcours de santé.
            </p>
          </div>
        </ScrollReveal>

        <ScrollReveal animation="zoom-in" delay={0.2}>
          <div className="relative mx-auto">
            <style>{`
              @keyframes circulate {
                0% { stroke-dashoffset: 0; }
                100% { stroke-dashoffset: -6000; }
              }
              
              .neon-frame {
                position: absolute;
                inset: 0;
                border-radius: 2rem;
                pointer-events: none;
                z-index: 10;
              }

              .neon-svg {
                width: 100%;
                height: 100%;
                overflow: visible;
              }

              .path-common {
                fill: none;
                stroke-width: 0.8;
                stroke-linecap: round;
                stroke-dasharray: 750 5250;
                animation: circulate 30s linear infinite;
              }

              .path-green { stroke: #00ff88; filter: drop-shadow(0 0 2px #00ff88); }
              .path-blue { stroke: #00aaff; animation-delay: -7.5s; filter: drop-shadow(0 0 2px #00aaff); }
              .path-orange { stroke: #ff8800; animation-delay: -15s; filter: drop-shadow(0 0 2px #ff8800); }
              .path-red { stroke: #ff0044; animation-delay: -22.5s; filter: drop-shadow(0 0 2px #ff0044); }
              
              .led-inner-frame {
                position: relative;
                width: 100%;
                height: 100%;
                border-radius: 1.8rem;
                overflow: hidden;
                background: #000;
                z-index: 1;
              }
            `}</style>

            <Card className="relative min-h-[550px] md:min-h-[500px] border border-white/40 shadow-2xl bg-white/40 backdrop-blur-3xl rounded-[2.5rem] overflow-hidden">
              {/* Background Glows */}
              <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-40">
                <div className={`absolute -top-24 -left-24 w-96 h-96 bg-gradient-to-br ${currentSlideData.gradient} opacity-20 blur-[100px] transition-all duration-1000`} />
                <div className={`absolute -bottom-24 -right-24 w-96 h-96 bg-gradient-to-br ${currentSlideData.gradient} opacity-20 blur-[100px] transition-all duration-1000`} />
              </div>

              <div className="relative z-10 w-full h-full flex flex-col lg:flex-row items-center p-8 md:p-12 gap-12">
                {/* Left: Info Content */}
                <div className="flex-1 space-y-6 md:space-y-8 animate-fade-in order-2 lg:order-1 text-center lg:text-left">
                  <div className="space-y-3">
                    <div className="flex items-center justify-center lg:justify-start gap-3">
                      {/* Removed category badge as requested */}
                      <Badge variant="outline" className="border-slate-200 text-slate-600 py-1 px-3 bg-white/40">
                        {currentSlideData.offer}
                      </Badge>
                    </div>
                    <h3 className="text-3xl md:text-5xl font-black text-slate-900 leading-tight">
                      {currentSlideData.title}
                    </h3>
                    <p className="text-xl font-bold text-primary">
                      {currentSlideData.subtitle}
                    </p>
                  </div>

                  <p className="text-lg text-slate-600 leading-relaxed max-w-xl mx-auto lg:mx-0">
                    {currentSlideData.description}
                  </p>

                  <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
                    <Button
                      size="lg"
                      onClick={() => navigate(currentSlideData.link)}
                      className="rounded-full px-8 bg-primary text-white hover:bg-primary/90 font-bold group shadow-lg shadow-primary/20"
                    >
                      {currentSlideData.cta}
                      <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                    </Button>
                    {/* Removed play/pause button as requested */}
                  </div>
                </div>

                {/* Right: Neon Image Frame */}
                <div className="flex-1 w-full max-w-[450px] lg:max-w-none aspect-square lg:aspect-auto h-[300px] lg:h-[400px] order-1 lg:order-2">
                  <div className="relative w-full h-full group">
                    <div className="neon-frame">
                      <svg className="neon-svg" viewBox="0 0 1200 1200" preserveAspectRatio="none">
                        <path className="path-green path-common" d="M 50,5 L 1150,5 Q 1195,5 1195,50 L 1195,1150 Q 1195,1195 1150,1195 L 50,1195 Q 5,1195 5,1150 L 5,50 Q 5,5 50,5" />
                        <path className="path-blue path-common" d="M 50,5 L 1150,5 Q 1195,5 1195,50 L 1195,1150 Q 1195,1195 1150,1195 L 50,1195 Q 5,1195 5,1150 L 5,50 Q 5,5 50,5" />
                        <path className="path-orange path-common" d="M 50,5 L 1150,5 Q 1195,5 1195,50 L 1195,1150 Q 1195,1195 1150,1195 L 50,1195 Q 5,1195 5,1150 L 5,50 Q 5,5 50,5" />
                        <path className="path-red path-common" d="M 50,5 L 1150,5 Q 1195,5 1195,50 L 1195,1150 Q 1195,1195 1150,1195 L 50,1195 Q 5,1195 5,1150 L 5,50 Q 5,5 50,5" />
                      </svg>
                    </div>

                    <div className="led-inner-frame w-full h-full shadow-2xl transition-transform duration-700 group-hover:scale-[1.02]">
                      <img
                        src={`/${currentSlideData.image}`}
                        alt={currentSlideData.title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-tr from-black/20 to-transparent" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Navigation UI removed as requested */}
            </Card>

            {/* Pagination Items Overlay */}
            <div className="flex justify-center gap-3 mt-10">
              {promoSlides.map((_, index) => (
                <button
                  key={index}
                  onClick={() => goToSlide(index)}
                  className={`h-2 transition-all duration-500 rounded-full ${index === currentSlide ? "bg-primary w-12 shadow-[0_0_10px_rgba(0,242,254,0.5)]" : "bg-slate-200 w-4 hover:bg-slate-300"}`}
                />
              ))}
            </div>
          </div>
        </ScrollReveal>

        {/* Categories/Thumbnails */}
        <ScrollReveal animation="fade-up" delay={0.4}>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-16 max-w-6xl mx-auto">
            {promoSlides.map((slide, index) => (
              <Card
                key={slide.id}
                className={`group relative cursor-pointer overflow-hidden transition-all duration-500 rounded-3xl border-none ${index === currentSlide ? 'ring-2 ring-primary shadow-[0_0_30px_rgba(59,130,246,0.3)]' : 'hover:shadow-xl opacity-60 hover:opacity-100'}`}
                onClick={() => goToSlide(index)}
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${slide.gradient} opacity-90`} />
                <div className="relative p-6 h-full flex flex-col justify-between z-10">
                  <div className="bg-white/20 backdrop-blur-md rounded-2xl p-3 w-fit transition-transform duration-500 group-hover:scale-110 group-hover:rotate-12">
                    <div className="text-white">
                      {slide.icon}
                    </div>
                  </div>
                  <div>
                    <h4 className="font-bold text-lg text-white group-hover:translate-x-1 transition-transform">{slide.title}</h4>
                    <p className="text-xs text-white/80 mt-1 uppercase tracking-tighter font-semibold">{slide.badge}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
};

export default ImageSlider;
