import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Clock, Truck, ChevronLeft, ChevronRight, Star } from "lucide-react";
import ScrollReveal from "@/components/ScrollReveal";
// Using the uploaded pharmacy image
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
            <div className="space-y-4">
              <Badge className="bg-primary/10 text-primary border-primary/20 hover:bg-primary/20 mx-[154px]">
                {badgeText}
              </Badge>
              <h1 className="text-4xl md:text-6xl font-bold leading-tight">
                {titlePrefix}
                <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent block">
                  {titleHighlight}
                </span>
              </h1>
              <p className="text-xl text-muted-foreground leading-relaxed">
                {subtitle}
              </p>
            </div>
          </ScrollReveal>

          <ScrollReveal animation="fade-up" delay={0.3}>
            <div className="flex flex-wrap gap-4">
              <Button size="lg" className="text-lg px-8 py-6 hover:shadow-lg transition-all duration-300" onClick={() => window.location.href = '/pharmacies'}>
                <MapPin className="h-5 w-5 mr-2" />
                Trouver une pharmacie
              </Button>
              <Button variant="outline" size="lg" className="text-lg px-8 py-6" onClick={() => window.location.href = '/suivi'}>
                <Truck className="h-5 w-5 mr-2" />
                Suivre ma commande
              </Button>
            </div>
          </ScrollReveal>

          <ScrollReveal animation="fade-up" delay={0.5}>
            <div className="grid grid-cols-3 gap-6 pt-8">
              <div className="text-center">
                <div className="text-3xl font-bold text-primary">24h</div>
                <div className="text-sm text-muted-foreground">Service continu</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-secondary">30min</div>
                <div className="text-sm text-muted-foreground">Livraison rapide</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-accent">150+</div>
                <div className="text-sm text-muted-foreground">Pharmacies</div>
              </div>
            </div>
          </ScrollReveal>
        </div>

        {/* Right Content - Carousel */}
        <div className="space-y-8">
          <div className="relative h-80 rounded-2xl overflow-hidden animate-[float_3s_ease-in-out_infinite]" style={{
            backgroundImage: `url(${heroImage})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            boxShadow: getGlowStyle(),
            transition: 'box-shadow 1.5s ease-in-out'
          }}>
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent mx-0 px-0 py-0 my-0" />
            <div className="absolute bottom-6 left-6 text-white">
              <h3 className="text-2xl font-bold mb-2">Livraison Express</h3>
              <p className="text-white/90">Médicaments certifiés • Livreurs agréés</p>
            </div>
          </div>

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

            <Card className="p-6 bg-gradient-to-r from-card to-card/80 border-primary/20 hover:shadow-lg transition-all duration-300">
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
    </div>
  </section>;
};
export default HeroSection;