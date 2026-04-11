import { useCallback, useEffect, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import { Card, CardContent } from "@/components/ui/card";
import { Star, Quote } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const Testimonials = () => {
  const testimonials = [
    {
      name: "Aminata K.",
      location: "Cocody, Abidjan",
      rating: 5,
      comment: "Service exceptionnel ! J'ai reçu mes médicaments en moins de 30 minutes. Le livreur était très professionnel.",
      initials: "AK"
    },
    {
      name: "Kouadio M.",
      location: "Plateau, Abidjan",
      rating: 5,
      comment: "Très pratique pour les urgences nocturnes. La pharmacie de garde la plus proche était fermée, PharmaGo m'a sauvé !",
      initials: "KM"
    },
    {
      name: "Fatoumata D.",
      location: "Yopougon, Abidjan",
      rating: 5,
      comment: "Application facile à utiliser. J'ai pu téléverser mon ordonnance et tout s'est fait automatiquement. Excellent !",
      initials: "FD"
    },
    {
      name: "Jean-Claude A.",
      location: "Marcory, Abidjan",
      rating: 4,
      comment: "Bon service, prix compétitifs. Je recommande vivement pour tous vos besoins en médicaments.",
      initials: "JCA"
    }
  ];

  const [emblaRef, emblaApi] = useEmblaCarousel(
    {
      loop: true,
      align: "start",
      slidesToScroll: 1,
      breakpoints: {
        '(min-width: 768px)': { slidesToScroll: 2 },
        '(min-width: 1024px)': { slidesToScroll: 3 }
      }
    },
    [Autoplay({ delay: 5000, stopOnInteraction: false })]
  );

  const [selectedIndex, setSelectedIndex] = useState(0);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on("select", onSelect);
    return () => {
      emblaApi.off("select", onSelect);
    };
  }, [emblaApi, onSelect]);

  const scrollTo = useCallback(
    (index: number) => emblaApi && emblaApi.scrollTo(index),
    [emblaApi]
  );

  return (
    <section className="py-16 bg-transparent">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Ce que disent nos clients</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Des milliers de clients satisfaits nous font confiance
          </p>
        </div>

        <div className="max-w-7xl mx-auto">
          <div className="overflow-hidden" ref={emblaRef}>
            <div className="flex gap-6">
              {testimonials.map((testimonial, index) => (
                <div
                  key={index}
                  className="flex-[0_0_100%] md:flex-[0_0_calc(50%-12px)] lg:flex-[0_0_calc(33.333%-16px)] min-w-0"
                >
                  <Card className="hover:shadow-lg transition-all relative h-full">
                    <Quote className="absolute top-4 right-4 h-8 w-8 text-primary/10" />
                    <CardContent className="p-6">
                      <div className="flex items-center gap-3 mb-4">
                        <Avatar className="h-12 w-12 bg-gradient-to-br from-primary to-secondary">
                          <AvatarFallback className="text-white font-semibold">
                            {testimonial.initials}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <h4 className="font-semibold">{testimonial.name}</h4>
                          <p className="text-xs text-muted-foreground">{testimonial.location}</p>
                        </div>
                      </div>

                      <div className="flex gap-1 mb-3">
                        {[...Array(testimonial.rating)].map((_, i) => (
                          <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        ))}
                      </div>

                      <p className="text-sm text-muted-foreground italic">
                        "{testimonial.comment}"
                      </p>
                    </CardContent>
                  </Card>
                </div>
              ))}
            </div>
          </div>

          {/* Navigation Dots */}
          <div className="flex justify-center gap-2 mt-8">
            {testimonials.map((_, index) => (
              <button
                key={index}
                className={`h-2 rounded-full transition-all ${index === selectedIndex
                  ? "w-8 bg-primary"
                  : "w-2 bg-primary/30 hover:bg-primary/50"
                  }`}
                onClick={() => scrollTo(index)}
                aria-label={`Go to testimonial ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
