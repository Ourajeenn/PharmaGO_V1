import { Card, CardContent } from "@/components/ui/card";
import { Search, ShoppingCart, Truck } from "lucide-react";

const HowItWorks = () => {
  const steps = [
    {
      icon: Search,
      title: "Recherchez votre médicament",
      description: "Utilisez notre barre de recherche ou parcourez nos catégories pour trouver ce dont vous avez besoin",
      color: "from-blue-500 to-cyan-500"
    },
    {
      icon: ShoppingCart,
      title: "Ajoutez au panier",
      description: "Sélectionnez vos produits et téléversez votre ordonnance si nécessaire",
      color: "from-purple-500 to-pink-500"
    },
    {
      icon: Truck,
      title: "Recevez chez vous",
      description: "Un livreur proche de vous est automatiquement assigné pour une livraison rapide",
      color: "from-orange-500 to-red-500"
    }
  ];

  return (
    <section className="py-16 bg-transparent">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Comment ça marche ?</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Commandez vos médicaments en 3 étapes simples
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {steps.map((step, index) => (
            <Card key={index} className="relative overflow-hidden border-2 hover:shadow-xl transition-all">
              <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${step.color}`} />
              <CardContent className="p-6 text-center">
                <div className="relative inline-block mb-4">
                  <div className={`w-16 h-16 rounded-full bg-gradient-to-br ${step.color} flex items-center justify-center mx-auto`}>
                    <step.icon className="h-8 w-8 text-white" />
                  </div>
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center font-bold text-sm">
                    {index + 1}
                  </div>
                </div>
                <h3 className="text-xl font-semibold mb-3">{step.title}</h3>
                <p className="text-muted-foreground">{step.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
