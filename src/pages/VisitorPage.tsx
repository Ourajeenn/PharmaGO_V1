import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, ShoppingCart, Eye, Search, MapPin } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import NetworkBackground from "@/components/NetworkBackground";

const VisitorPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-transparent text-white relative">
      <NetworkBackground />
      <Header />

      <main className="relative z-10 container mx-auto px-4 py-8">
        <Button
          variant="ghost"
          onClick={() => navigate('/')}
          className="flex items-center gap-2 mb-8 text-white hover:bg-white/10 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Retour à l'accueil
        </Button>
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold">Mode Visiteur</h1>
            <p className="text-xl text-muted-foreground">
              Explorez PharmaGo sans créer de compte
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <Card className="bg-black/40 backdrop-blur-md border-white/10 hover:bg-black/50 hover:border-orange-500/50 transition-all cursor-pointer group" onClick={() => navigate('/medicaments')}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white group-hover:text-orange-400">
                  <Search className="h-6 w-6" />
                  Rechercher des médicaments
                </CardTitle>
                <CardDescription className="text-gray-300">
                  Parcourez notre catalogue de médicaments et produits pharmaceutiques
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="outline" className="w-full border-white/20 text-white hover:bg-white/10 hover:text-orange-400">
                  <Eye className="h-4 w-4 mr-2" />
                  Voir les médicaments
                </Button>
              </CardContent>
            </Card>

            <Card className="bg-black/40 backdrop-blur-md border-white/10 hover:bg-black/50 hover:border-orange-500/50 transition-all cursor-pointer group" onClick={() => navigate('/parapharmacie')}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white group-hover:text-orange-400">
                  <ShoppingCart className="h-6 w-6" />
                  Produits de parapharmacie
                </CardTitle>
                <CardDescription className="text-gray-300">
                  Découvrez nos produits de santé et bien-être
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="outline" className="w-full border-white/20 text-white hover:bg-white/10 hover:text-orange-400">
                  <Eye className="h-4 w-4 mr-2" />
                  Voir la parapharmacie
                </Button>
              </CardContent>
            </Card>

            <Card className="bg-black/40 backdrop-blur-md border-white/10 hover:bg-black/50 hover:border-orange-500/50 transition-all cursor-pointer group" onClick={() => navigate('/pharmacies')}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white group-hover:text-orange-400">
                  <MapPin className="h-6 w-6" />
                  Pharmacies de garde
                </CardTitle>
                <CardDescription className="text-gray-300">
                  Trouvez les pharmacies de garde près de chez vous
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="outline" className="w-full border-white/20 text-white hover:bg-white/10 hover:text-orange-400">
                  <Eye className="h-4 w-4 mr-2" />
                  Voir les pharmacies
                </Button>
              </CardContent>
            </Card>

            <Card className="bg-orange-500/10 backdrop-blur-md border-orange-500/30 hover:bg-orange-500/20 transition-all">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-orange-400">
                  Créer un compte
                </CardTitle>
                <CardDescription className="text-gray-300">
                  Pour commander et bénéficier de tous nos services
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button className="w-full bg-orange-600 hover:bg-orange-700 text-white border-none" onClick={() => navigate('/profile-selection')}>
                  S'inscrire maintenant
                </Button>
                <Button variant="outline" className="w-full border-white/20 text-white hover:bg-white/10" onClick={() => navigate('/auth')}>
                  J'ai déjà un compte
                </Button>
              </CardContent>
            </Card>
          </div>

          <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-white">Limitations du mode visiteur</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-gray-300">
              <p>• Vous pouvez consulter les produits et pharmacies</p>
              <p>• Pour passer commande, vous devez créer un compte</p>
              <p>• Le suivi de livraison nécessite une authentification</p>
              <p>• Les fonctionnalités d'assurance et CMU nécessitent un compte patient</p>
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default VisitorPage;
