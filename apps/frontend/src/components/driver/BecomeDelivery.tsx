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
import { jsPDF } from "jspdf";
import "jspdf-autotable";
import { Download } from "lucide-react";

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

const legalText = `
CONDITIONS, PRÉREQUIS ET EXIGENCES RELATIFS À L’EXERCICE DE L’ACTIVITÉ DE LIVREUR

Article 1 – Objet du document
Le présent document a pour objet de définir de manière officielle, claire et exhaustive les conditions, prérequis, documents requis, critères d’éligibilité ainsi que les caractéristiques du véhicule nécessaires à l’exercice de l’activité de livreur à moto dans un cadre professionnel. Ces exigences visent à garantir la sécurité routière, la qualité du service rendu, la conformité réglementaire et la protection des clients, des partenaires et de la structure organisatrice.

Article 2 – Conditions générales et prérequis
Tout candidat souhaitant exercer l’activité de livreur à moto doit remplir l’ensemble des conditions définies dans le présent document avant toute validation de dossier. Aucune dérogation ne pourra être accordée en cas de non-respect total ou partiel des exigences énoncées.

Article 3 – Documents requis
Le candidat est tenu de fournir les documents suivants, en version originale et/ou en copie conforme selon les besoins de vérification :
3.1 Carte d’identité nationale : Carte d’identité nationale valide et non expirée. Les informations d’identité doivent être lisibles et conformes aux autres documents fournis. Toute incohérence ou falsification entraînera le rejet immédiat du dossier.
3.2 Permis de conduire : Permis de conduire de catégorie A ou A1. Permis en cours de validité autorisant la conduite d’une moto d’une cylindrée minimale de 125 cm³. Les permis suspendus, annulés ou provisoires ne sont pas acceptés.
3.3 Certificat de visite technique : Certificat de visite technique délivré par un centre agréé. Mention explicite de l’aptitude du véhicule à circuler. Certificat valide à la date de dépôt du dossier.
3.4 Carte grise du véhicule : Carte grise officielle du véhicule utilisé. Véhicule dûment immatriculé. En cas de non-propriété, un justificatif légal d’utilisation (autorisation, contrat de location, etc.) devra être fourni.

Article 4 – Conditions d’éligibilité du candidat
4.1 Âge minimum requis : Le candidat doit être âgé de 21 ans minimum à la date de la demande.
4.2 Expérience de conduite : Le candidat doit justifier d’une expérience minimale de deux (2) années de conduite de moto.
4.3 Casier judiciaire : Le candidat doit présenter un casier judiciaire vierge. Toute condamnation incompatible avec l’exercice de l’activité entraînera une inéligibilité automatique.
4.4 Aptitude physique : Le candidat doit être en bonne condition physique. Il doit être apte à conduire une moto sur des durées prolongées sans risque pour lui-même ou pour autrui.

Article 5 – Exigences relatives au véhicule
5.1 Type de véhicule : Moto d’une cylindrée minimale de 125 cm³. Véhicule adapté à un usage professionnel de livraison.
5.2 État général du véhicule : Véhicule en excellent état de marche. Freins, pneus, éclairage et signalisation parfaitement fonctionnels. Absence de défaillance mécanique susceptible de compromettre la sécurité.
5.3 Équipement de livraison : Présence obligatoire d’un top case isotherme. Le top case doit garantir la conservation thermique des produits transportés. Fermeture sécurisée et capacité adaptée à l’activité.
5.4 Assurance du véhicule : Assurance valide couvrant au minimum la responsabilité civile. Assurance à jour et conforme à l’usage professionnel du véhicule. Attestation d’assurance à fournir obligatoirement.

Article 6 – Dispositions finales
Le non-respect de l’une quelconque des dispositions du présent document entraînera le refus ou la suspension immédiate de l’autorisation d’exercer l’activité.
`;

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

          <div className="max-w-4xl mx-auto mb-12">
            <Card className="text-left border-primary/30 shadow-lg bg-white/50 backdrop-blur-sm overflow-hidden">
              <CardHeader className="bg-primary/5 border-b border-primary/10">
                <CardTitle className="text-xl font-bold flex items-center justify-between">
                  <span>CONDITIONS ET EXIGENCES RELATIFS À L’ACTIVITÉ DE LIVREUR</span>
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-2 text-primary border-primary/20 hover:bg-primary/10"
                    onClick={() => {
                      const doc = new jsPDF();
                      doc.setFont("helvetica", "bold");
                      doc.setFontSize(18);
                      doc.text("PharmaGo - Devenir Livreur", 105, 15, { align: "center" });

                      doc.setFontSize(11);
                      doc.setFont("helvetica", "normal");
                      doc.text("Conditions, prérequis et exigences officiels", 105, 22, { align: "center" });

                      doc.setLineWidth(0.5);
                      doc.line(20, 27, 190, 27);

                      doc.setFontSize(9);
                      const splitText = doc.splitTextToSize(legalText.trim(), 170);
                      doc.text(splitText, 20, 35);

                      doc.setFontSize(8);
                      doc.setTextColor(150);
                      doc.text(`Document généré le ${new Date().toLocaleDateString('fr-FR')}`, 105, 285, { align: "center" });

                      doc.save("PharmaGo_Exigences_Livreur.pdf");
                    }}
                  >
                    <Download className="h-4 w-4" />
                    Télécharger PDF
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-8 max-h-[500px] overflow-y-auto space-y-6 text-sm leading-relaxed scrollbar-thin scrollbar-thumb-primary/20">
                <div className="prose prose-sm max-w-none">
                  <div className="bg-primary/5 p-4 rounded-xl border border-primary/10 mb-6 italic">
                    Le présent document définit officiellement les conditions, prérequis et critères d'éligibilité pour l'activité de livreur à moto PharmaGo.
                  </div>

                  <h4 className="font-bold text-lg text-primary border-l-4 border-primary pl-3 mb-4">Article 1 – Objet du document</h4>
                  <p>Définir de manière officielle, claire et exhaustive les conditions, prérequis, documents nécessaires et caractéristiques du véhicule. Ces exigences garantissent la sécurité, la qualité et la conformité réglementaire.</p>

                  <h4 className="font-bold text-lg text-primary border-l-4 border-primary pl-3 mt-8 mb-4">Article 2 – Conditions générales et prérequis</h4>
                  <p>Tout candidat doit remplir l'ensemble des conditions avant validation. Aucune dérogation ne sera accordée en cas de non-respect.</p>

                  <h4 className="font-bold text-lg text-primary border-l-4 border-primary pl-3 mt-8 mb-4">Article 3 – Documents requis</h4>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                      <p className="font-bold text-primary mb-1">3.1 Carte d’identité nationale</p>
                      <p className="text-xs">Valide et non expirée, informations lisibles et conformes.</p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                      <p className="font-bold text-primary mb-1">3.2 Permis de conduire</p>
                      <p className="text-xs">Catégorie A ou A1 (125 cm³ min), en cours de validité.</p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                      <p className="font-bold text-primary mb-1">3.3 Visite technique</p>
                      <p className="text-xs">Délivré par un centre agréé, mention d'aptitude explicite.</p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                      <p className="font-bold text-primary mb-1">3.4 Carte grise</p>
                      <p className="text-xs">Véhicule immatriculé. Justificatif légal si non-propriétaire.</p>
                    </div>
                  </div>

                  <h4 className="font-bold text-lg text-primary border-l-4 border-primary pl-3 mt-8 mb-4">Article 4 – Conditions d’éligibilité</h4>
                  <div className="space-y-3">
                    <div className="flex items-start gap-2">
                      <div className="h-5 w-5 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-bold text-primary mt-0.5">4.1</div>
                      <p><strong>Âge minimum :</strong> 21 ans à la date de la demande.</p>
                    </div>
                    <div className="flex items-start gap-2">
                      <div className="h-5 w-5 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-bold text-primary mt-0.5">4.2</div>
                      <p><strong>Expérience :</strong> Deux (2) années de conduite de moto minimum.</p>
                    </div>
                    <div className="flex items-start gap-2">
                      <div className="h-5 w-5 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-bold text-primary mt-0.5">4.3</div>
                      <p><strong>Casier judiciaire :</strong> Doit être vierge et compatible avec l'activité.</p>
                    </div>
                    <div className="flex items-start gap-2">
                      <div className="h-5 w-5 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-bold text-primary mt-0.5">4.4</div>
                      <p><strong>Aptitude physique :</strong> Bonne condition physique pour les durées prolongées.</p>
                    </div>
                  </div>

                  <h4 className="font-bold text-lg text-primary border-l-4 border-primary pl-3 mt-8 mb-4">Article 5 – Exigences relatives au véhicule</h4>
                  <ul className="list-disc pl-6 space-y-2">
                    <li><strong>5.1 Type :</strong> Moto d'une cylindrée minimale de 125 cm³.</li>
                    <li><strong>5.2 État :</strong> Excellent état de marche (freins, pneus, éclairage, etc.).</li>
                    <li><strong>5.3 Équipement :</strong> Top case isotherme obligatoire pour la conservation thermique.</li>
                    <li><strong>5.4 Assurance :</strong> Valide (responsabilité civile min) et conforme à l'usage pro.</li>
                  </ul>

                  <h4 className="font-bold text-lg text-primary border-l-4 border-primary pl-3 mt-8 mb-4">Article 6 – Dispositions finales</h4>
                  <div className="bg-red-50 p-4 rounded-lg border border-red-100 text-red-700 font-medium">
                    Le non-respect de l’une quelconque des dispositions entraînera le refus ou la suspension immédiate de l’autorisation.
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

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
            {["Cocody", "Yopougon", "Abobo", "Treichville", "Marcory", "Plateau", "Koumassi", "Port-Bouët"].map((zone) => (
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
