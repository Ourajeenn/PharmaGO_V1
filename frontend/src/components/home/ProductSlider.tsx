import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, ShoppingCart, Plus } from "lucide-react";
import { useState } from "react";
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
} from "@/components/ui/carousel";
import ScrollReveal from "./ScrollReveal";

const featuredProducts = [
    {
        id: 1,
        name: "Doliprane 1000mg",
        price: 2500,
        category: "Antalgique",
        image: "/meds/real/doliprane.png",
        rating: 4.8,
        reviews: 124,
        pharmacy: "Pharmacie du Centre"
    },
    {
        id: 2,
        name: "Amoxicilline 500mg",
        price: 3200,
        category: "Antibiotique",
        image: "/meds/real/amoxicilline.png",
        rating: 4.9,
        reviews: 89,
        pharmacy: "Pharmacie de la Paix"
    },
    {
        id: 3,
        name: "Vitamines C 1000mg",
        price: 1800,
        category: "Complément",
        image: "/meds/real/vitamine-c.png",
        rating: 4.7,
        reviews: 156,
        pharmacy: "Pharmacie Moderne"
    },
    {
        id: 5,
        name: "Ibuprofen 400mg",
        price: 2200,
        category: "Anti-inflammatoire",
        image: "/meds/real/ibuprofen.png",
        rating: 4.8,
        reviews: 98,
        pharmacy: "Pharmacie Express"
    },
    {
        id: 6,
        name: "Thermomètre digital",
        price: 4500,
        category: "Matériel",
        image: "/meds/real/thermometre.png",
        rating: 4.9,
        reviews: 67,
        pharmacy: "Pharmacie du Port"
    }
];

const ProductSlider = () => {
    return (
        <section className="py-16 bg-transparent overflow-hidden">
            <div className="container mx-auto px-4">
                <ScrollReveal animation="fade-up">
                    <div className="flex items-end justify-between mb-10">
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <span className="h-px w-8 bg-primary"></span>
                                <span className="text-primary font-bold text-sm tracking-widest uppercase">Sélection</span>
                            </div>
                            <h2 className="text-3xl md:text-4xl font-black tracking-tight text-slate-900">Dernières sorties</h2>
                        </div>
                        <p className="text-slate-500 hidden md:block max-w-xs text-right text-sm">
                            Découvrez les nouveaux produits de santé disponibles dans nos pharmacies partenaires.
                        </p>
                    </div>
                </ScrollReveal>

                <Carousel
                    opts={{
                        align: "start",
                        loop: true,
                    }}
                    className="w-full"
                >
                    <CarouselContent className="-ml-4 pb-4">
                        {featuredProducts.map((product) => (
                            <CarouselItem key={product.id} className="pl-4 md:basis-1/2 lg:basis-1/4">
                                <ScrollReveal animation="fade-up">
                                    <Card className="group hover:shadow-xl transition-all duration-500 rounded-[2rem] border-slate-100 overflow-hidden bg-white">
                                        <CardContent className="p-0">
                                            <div className="aspect-square bg-slate-50 flex items-center justify-center p-4 overflow-hidden">
                                                <img
                                                    src={product.image}
                                                    alt={product.name}
                                                    className="w-full h-full object-contain mix-blend-multiply group-hover:scale-110 transition-transform duration-500"
                                                />
                                            </div>
                                            <div className="p-6 space-y-4">
                                                <div className="flex justify-between items-start">
                                                    <div>
                                                        <Badge variant="secondary" className="mb-2 bg-slate-100 text-slate-600 border-none">
                                                            {product.category}
                                                        </Badge>
                                                        <h3 className="font-bold text-lg text-slate-900 group-hover:text-primary transition-colors">
                                                            {product.name}
                                                        </h3>
                                                    </div>
                                                    <div className="flex items-center gap-1">
                                                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                                                        <span className="text-sm font-bold">{product.rating}</span>
                                                    </div>
                                                </div>

                                                <div className="flex items-center justify-between pt-2 border-t border-slate-50">
                                                    <span className="text-xl font-black text-primary">
                                                        {product.price.toLocaleString()} <span className="text-xs font-bold opacity-70">FCFA</span>
                                                    </span>
                                                    <button className="h-10 w-10 rounded-full bg-slate-900 text-white flex items-center justify-center hover:bg-primary transition-colors shadow-lg">
                                                        <Plus className="h-5 w-5" />
                                                    </button>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </ScrollReveal>
                            </CarouselItem>
                        ))}
                    </CarouselContent>
                    <div className="flex justify-center gap-4 mt-8">
                        <CarouselPrevious className="static translate-y-0 h-12 w-12 rounded-full border-slate-200" />
                        <CarouselNext className="static translate-y-0 h-12 w-12 rounded-full border-slate-200" />
                    </div>
                </Carousel>
            </div>
        </section>
    );
};

export default ProductSlider;
