import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Truck, 
  Clock, 
  DollarSign, 
  Shield, 
  CheckCircle, 
  Users, 
  MapPin, 
  Phone,
  FileText,
  CreditCard,
  Star
} from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

const benefits = [
  {
    icon: DollarSign,
    title: "Revenus attractifs",
    description: "Jusqu'à 150,000 FCFA/mois",
    details: "Salaire de base + commission sur chaque livraison"
  },
  {
    icon: Clock,
    title: "Horaires flexibles",
    description: "Travaillez quand vous voulez",
    details: "Choisissez vos créneaux de disponibilité"
  },
  {
    icon: Shield,
    title: "Assurance complète",
    description: "Couverture accident et vol",
    details: "Protection moto et responsabilité civile incluses"
  },
  {
    icon: Users,
    title: "Formation gratuite",
    description: "Formation complète fournie",
    details: "Sécurité, service client, GPS, pharmacologie de base"
  }
];

const requirements = [
  {
    icon: FileText,
    title: "Documents requis",
    items: [
      "Carte d'identité nationale",
      "Permis de conduire (A ou A1)",
      "Certificat de visite technique",
      "Carte grise du véhicule"
    ]
  },
  {
    icon: Shield,
    title: "Conditions d'éligibilité",
    items: [
      "Âge minimum 21 ans",
      "Expérience conduite 2 ans min",
      "Casier judiciaire vierge",
      "Bonne condition physique"
    ]
  },
  {
    icon: Truck,
    title: "Véhicule requis",
    items: [
      "Moto 125cc minimum",
      "État de marche excellent",
      "Top case isotherme",
      "Assurance à jour"
    ]
  }
];

const steps = [
  {
    number: "01",
    title: "Candidature en ligne",
    description: "Remplissez le formulaire et uploadez vos documents"
  },
  {
    number: "02", 
    title: "Vérification",
    description: "Nous vérifions vos documents et antécédents"
  },
  {
    number: "03",
    title: "Entretien",
    description: "Rencontre physique et test de conduite"
  },
  {
    number: "04",
    title: "Formation",
    description: "Formation de 2 jours sur nos procédures"
  },
  {
    number: "05",
    title: "Certification",
    description: "Obtenez votre badge PharmaGo et commencez !"
  }
];

const testimonials = [
  {
    name: "Kouadio Marcel",
    role: "Livreur depuis 8 mois",
    rating: 5,
    comment: "Excellent travail, équipe sympathique et revenus réguliers. Je recommande !",
    earnings: "120,000 FCFA/mois"
  },
  {
    name: "Aya Fatou",
    role: "Livreuse depuis 1 an",
    rating: 5,
    comment: "Horaires flexibles parfaits pour mes études. Formation très complète.",
    earnings: "95,000 FCFA/mois"
  }
];

const BecomeDelivery = () => {
  return (
    <section className="py-16" id="livreur">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Truck className="h-8 w-8 text-primary" />
            <h2 className="text-3xl md:text-4xl font-bold">
              Devenir Livreur PharmaGo
            </h2>
          </div>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-6">
            Rejoignez notre équipe de livreurs certifiés et participez à la révolution de la livraison de médicaments à Abidjan
          </p>
          
          <div className="bg-gradient-to-r from-primary to-secondary p-6 rounded-lg text-white inline-block">
            <div className="text-3xl font-bold mb-2">Nous recrutons !</div>
            <div className="text-lg opacity-90">50 nouveaux livreurs recherchés</div>
          </div>
        </div>

        {/* Benefits */}
        <div className="mb-16">
          <h3 className="text-2xl font-bold text-center mb-8">Pourquoi choisir PharmaGo ?</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {benefits.map((benefit, index) => {
              const Icon = benefit.icon;
              return (
                <Card key={index} className="text-center hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-primary/20">
                  <CardContent className="p-6">
                    <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Icon className="h-8 w-8 text-primary" />
                    </div>
                    <h4 className="font-semibold text-lg mb-2">{benefit.title}</h4>
                    <p className="text-primary font-medium mb-2">{benefit.description}</p>
                    <p className="text-sm text-muted-foreground">{benefit.details}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Requirements */}
        <div className="mb-16">
          <h3 className="text-2xl font-bold text-center mb-8">Conditions & Prérequis</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {requirements.map((req, index) => {
              const Icon = req.icon;
              return (
                <Card key={index} className="hover:shadow-lg transition-all duration-300">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Icon className="h-5 w-5 text-secondary" />
                      {req.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {req.items.map((item, idx) => (
                        <li key={idx} className="flex items-center gap-2 text-sm">
                          <CheckCircle className="h-4 w-4 text-secondary flex-shrink-0" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Steps */}
        <div className="mb-16">
          <h3 className="text-2xl font-bold text-center mb-8">Processus de Candidature</h3>
          <div className="relative">
            <div className="hidden md:block absolute top-12 left-1/2 transform -translate-x-1/2 w-full max-w-4xl h-0.5 bg-primary/20"></div>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
              {steps.map((step, index) => (
                <Card key={index} className="relative bg-gradient-to-br from-card to-card/80 hover:shadow-lg transition-all duration-300">
                  <CardContent className="p-6 text-center">
                    <div className="bg-primary text-white w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 font-bold text-lg relative z-10">
                      {step.number}
                    </div>
                    <h4 className="font-semibold mb-2">{step.title}</h4>
                    <p className="text-sm text-muted-foreground">{step.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>

        {/* Testimonials */}
        <div className="mb-16">
          <h3 className="text-2xl font-bold text-center mb-8">Témoignages de nos Livreurs</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="hover:shadow-lg transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center text-white font-bold">
                      {testimonial.name.charAt(0)}
                    </div>
                    <div>
                      <h4 className="font-semibold">{testimonial.name}</h4>
                      <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                      <div className="flex items-center gap-1 mt-1">
                        {[...Array(testimonial.rating)].map((_, i) => (
                          <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        ))}
                      </div>
                    </div>
                  </div>
                  <p className="text-sm mb-3 italic">"{testimonial.comment}"</p>
                  <Badge className="bg-secondary/10 text-secondary border-secondary/20">
                    <DollarSign className="h-3 w-3 mr-1" />
                    {testimonial.earnings}
                  </Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Checklist */}
        <div className="mb-16">
          <h3 className="text-2xl font-bold text-center mb-8">Checklist de démarrage</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              "Pièces d'identité à jour",
              "Permis de conduire valide",
              "Moto en bon état (125cc+)",
              "Smartphone avec data/GPS"
            ].map((item, idx) => (
              <Card key={idx} className="hover:shadow-lg transition-all duration-300">
                <CardContent className="p-6 flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
                  <span className="text-sm">{item}</span>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Zones desservies */}
        <div className="mb-16 text-center">
          <h3 className="text-2xl font-bold mb-6">Zones desservies</h3>
          <div className="flex flex-wrap gap-3 justify-center">
            {["Cocody","Yopougon","Abobo","Treichville","Marcory","Plateau","Koumassi","Port-Bouët"].map((zone) => (
              <Badge key={zone} variant="secondary" className="px-4 py-2">{zone}</Badge>
            ))}
          </div>
        </div>

        {/* FAQ */}
        <div className="mb-16 max-w-3xl mx-auto">
          <h3 className="text-2xl font-bold text-center mb-6">FAQ</h3>
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="faq-1">
              <AccordionTrigger>Combien puis-je gagner par mois ?</AccordionTrigger>
              <AccordionContent>Une moyenne de 80,000 à 150,000 FCFA selon votre disponibilité et vos performances.</AccordionContent>
            </AccordionItem>
            <AccordionItem value="faq-2">
              <AccordionTrigger>Les horaires sont-ils flexibles ?</AccordionTrigger>
              <AccordionContent>Oui, vous choisissez vos créneaux (matin, après-midi, soir) depuis l'application.</AccordionContent>
            </AccordionItem>
            <AccordionItem value="faq-3">
              <AccordionTrigger>Êtes-vous assurés ?</AccordionTrigger>
              <AccordionContent>Oui, une assurance accident/vol est incluse pendant vos missions.</AccordionContent>
            </AccordionItem>
            <AccordionItem value="faq-4">
              <AccordionTrigger>Comment candidater ?</AccordionTrigger>
              <AccordionContent>Créez un compte, choisissez le rôle "Livreur" puis complétez vos informations et documents.</AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>

        {/* CTA Section */}
        <div className="bg-gradient-to-r from-primary to-secondary p-8 rounded-2xl text-white text-center">
          <h3 className="text-2xl font-bold mb-4">Prêt à nous rejoindre ?</h3>
          <p className="text-lg opacity-90 mb-6 max-w-2xl mx-auto">
            Commencez votre carrière de livreur PharmaGo dès aujourd'hui. 
            Candidature simple et rapide en ligne.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button size="lg" variant="secondary" className="text-lg px-8 py-6" asChild>
              <a href="/auth" aria-label="Aller à la page d'inscription livreur">
                <FileText className="h-5 w-5 mr-2" />
                Candidater maintenant
              </a>
            </Button>
            <Button size="lg" variant="outline" className="bg-white/10 border-white/30 text-white hover:bg-white/20 text-lg px-8 py-6" asChild>
              <a href="tel:+2250102030405" aria-label="Appeler le support recrutement">
                <Phone className="h-5 w-5 mr-2" />
                +225 01 40 271 217
              </a>
            </Button>
          </div>
          
          <div className="mt-6 flex flex-wrap justify-center gap-4 text-sm opacity-80">
            <div className="flex items-center gap-1">
              <MapPin className="h-4 w-4" />
              <span>Abidjan, toutes communes</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              <span>Réponse sous 48h</span>
            </div>
            <div className="flex items-center gap-1">
              <CreditCard className="h-4 w-4" />
              <span>Premier salaire garanti</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default BecomeDelivery;
