import { Card, CardContent } from "@/components/ui/card";
import { ShieldCheck, Stethoscope, Clock, HeartPulse, Building2 } from "lucide-react";
import ScrollReveal from "./ScrollReveal";

const services = [
    {
        title: "Service Pharmacie de Qualité",
        icon: <ShieldCheck className="h-10 w-10" />,
        color: "bg-blue-500",
        description: "Expertise médicale et conseils certifiés"
    },
    {
        title: "Consultation en Ligne",
        icon: <Stethoscope className="h-10 w-10" />,
        color: "bg-emerald-500",
        description: "Médecins à votre écoute 24h/24"
    },
    {
        title: "Suivi en Temps Réel",
        icon: <Clock className="h-10 w-10" />,
        color: "bg-orange-500",
        description: "Tracking précis de vos livraisons"
    },
    {
        title: "Gestion Santé",
        icon: <HeartPulse className="h-10 w-10" />,
        color: "bg-rose-500",
        description: "Historique et e-carnet numérique"
    },
    {
        title: "Online Pharmacy",
        icon: <Building2 className="h-10 w-10" />,
        color: "bg-violet-500",
        description: "Accès au stock de tout Abidjan"
    }
];

const ServiceGrid = () => {
    return (
        <section className="py-16 bg-transparent">
            <div className="container mx-auto px-4">
                <ScrollReveal animation="fade-up">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl md:text-4xl font-bold mb-4">Nos Services de Santé</h2>
                        <p className="text-muted-foreground max-w-2xl mx-auto">
                            Une gamme complète de services innovants pour votre bien-être quotidien
                        </p>
                    </div>
                </ScrollReveal>

                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
                    {services.map((service, index) => (
                        <ScrollReveal key={index} animation="fade-up" delay={index * 0.1}>
                            <Card className="group hover:shadow-xl transition-all duration-300 border-none bg-white rounded-[2rem] overflow-hidden hover:-translate-y-2 h-full">
                                <CardContent className="p-8 flex flex-col items-center text-center space-y-4">
                                    <div className={`${service.color} p-4 rounded-2xl text-white shadow-lg transition-transform duration-500 group-hover:scale-110 group-hover:rotate-6`}>
                                        {service.icon}
                                    </div>
                                    <h3 className="font-bold text-lg leading-tight">{service.title}</h3>
                                    <p className="text-sm text-muted-foreground">{service.description}</p>
                                </CardContent>
                            </Card>
                        </ScrollReveal>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default ServiceGrid;
