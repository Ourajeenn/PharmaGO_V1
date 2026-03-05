import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ShoppingCart, Eye, Search, MapPin, Globe, ArrowRight } from "lucide-react";
import NetworkBackground from "@/components/core/NetworkBackground";

const VisitorPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen mesh-gradient relative overflow-hidden flex flex-col items-center p-6 lg:p-12">
      <NetworkBackground />

      {/* HUD Navigation */}
      <div className="absolute top-0 left-0 w-full p-8 flex justify-between items-center z-50">
        <Button
          variant="ghost"
          onClick={() => navigate('/profile-selection')}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground hover:bg-white/40 transition-all rounded-xl px-4 font-bold border border-transparent hover:border-white/40"
        >
          <ArrowLeft className="h-4 w-4" />
          <span className="text-xs uppercase tracking-widest">Retour</span>
        </Button>
        <div className="flex items-center gap-2 pointer-events-none">
          <div className="w-8 h-8 bg-white/40 border border-white/60 rounded-xl flex items-center justify-center shadow-lg">
            <Globe className="h-4 w-4 text-primary" />
          </div>
          <span className="text-sm font-black uppercase tracking-widest text-foreground/80">Mode Visiteur</span>
        </div>
      </div>

      <div className="max-w-7xl w-full space-y-16 relative z-10 animate-in fade-in duration-1000 mt-20">
        {/* Title Section */}
        <div className="text-center space-y-4">
          <h2 className="text-5xl lg:text-7xl font-black tracking-tighter uppercase text-foreground/90 leading-[0.9]">
            Explorez <span className="text-primary tracking-normal italic">Librement</span>
          </h2>
          <p className="text-sm font-black uppercase tracking-[0.3em] text-muted-foreground/60 max-w-2xl mx-auto">
            Découvrez l'écosystème PharmaGo sans engagement
          </p>
        </div>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">

          <div
            className="glass-card group p-1 transition-all duration-500 cursor-pointer hover:scale-[1.02] hover:glow-border"
            onClick={() => navigate('/medicaments')}
          >
            <div className="bg-white/30 backdrop-blur-2xl rounded-[2.2rem] p-8 h-full flex flex-col justify-between border border-white/40 shadow-xl relative overflow-hidden">
              <div className="absolute -top-10 -right-10 w-32 h-32 bg-blue-500 opacity-5 rounded-full blur-3xl group-hover:opacity-20 transition-opacity" />
              <div className="space-y-6">
                <div className="w-14 h-14 rounded-2xl bg-blue-500 flex items-center justify-center text-white shadow-xl shadow-blue-500/20 group-hover:rotate-12 transition-transform duration-500">
                  <Search className="h-7 w-7" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-2xl font-black tracking-tighter uppercase text-foreground">Catalogue</h3>
                  <p className="text-sm text-muted-foreground font-medium leading-relaxed">
                    Consultez la disponibilité des médicaments et comparez les prix en temps réel.
                  </p>
                </div>
              </div>
              <div className="mt-8 flex justify-end">
                <Button variant="ghost" className="rounded-xl hover:bg-white/40 gap-2 font-bold text-blue-600">
                  Explorer <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          <div
            className="glass-card group p-1 transition-all duration-500 cursor-pointer hover:scale-[1.02] hover:glow-border"
            onClick={() => navigate('/parapharmacie')}
          >
            <div className="bg-white/30 backdrop-blur-2xl rounded-[2.2rem] p-8 h-full flex flex-col justify-between border border-white/40 shadow-xl relative overflow-hidden">
              <div className="absolute -top-10 -right-10 w-32 h-32 bg-green-500 opacity-5 rounded-full blur-3xl group-hover:opacity-20 transition-opacity" />
              <div className="space-y-6">
                <div className="w-14 h-14 rounded-2xl bg-green-500 flex items-center justify-center text-white shadow-xl shadow-green-500/20 group-hover:rotate-12 transition-transform duration-500">
                  <ShoppingCart className="h-7 w-7" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-2xl font-black tracking-tighter uppercase text-foreground">Parapharmacie</h3>
                  <p className="text-sm text-muted-foreground font-medium leading-relaxed">
                    Découvrez nos produits de bien-être, cosmétiques et hygiène.
                  </p>
                </div>
              </div>
              <div className="mt-8 flex justify-end">
                <Button variant="ghost" className="rounded-xl hover:bg-white/40 gap-2 font-bold text-green-600">
                  Voir les produits <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          <div
            className="glass-card group p-1 transition-all duration-500 cursor-pointer hover:scale-[1.02] hover:glow-border"
            onClick={() => navigate('/pharmacies')}
          >
            <div className="bg-white/30 backdrop-blur-2xl rounded-[2.2rem] p-8 h-full flex flex-col justify-between border border-white/40 shadow-xl relative overflow-hidden">
              <div className="absolute -top-10 -right-10 w-32 h-32 bg-purple-500 opacity-5 rounded-full blur-3xl group-hover:opacity-20 transition-opacity" />
              <div className="space-y-6">
                <div className="w-14 h-14 rounded-2xl bg-purple-500 flex items-center justify-center text-white shadow-xl shadow-purple-500/20 group-hover:rotate-12 transition-transform duration-500">
                  <MapPin className="h-7 w-7" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-2xl font-black tracking-tighter uppercase text-foreground">Pharmacies</h3>
                  <p className="text-sm text-muted-foreground font-medium leading-relaxed">
                    Localisez les pharmacies de garde et partenaires autour de vous.
                  </p>
                </div>
              </div>
              <div className="mt-8 flex justify-end">
                <Button variant="ghost" className="rounded-xl hover:bg-white/40 gap-2 font-bold text-purple-600">
                  Trouver <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="glass-card p-8 lg:p-12 relative overflow-hidden text-center max-w-4xl mx-auto rounded-[3rem] border-white/40 shadow-2xl">
          <div className="relative z-10 space-y-6">
            <h3 className="text-3xl font-black uppercase tracking-tighter">Prêt à passer commande ?</h3>
            <p className="text-muted-foreground max-w-xl mx-auto font-medium">
              Créez un compte pour accéder au panier, au suivi de livraison en temps réel et à la prise en charge assurance.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Button
                onClick={() => navigate('/auth')}
                className="rounded-xl h-14 px-8 font-black uppercase tracking-widest bg-foreground text-background hover:bg-foreground/90 transition-all shadow-xl hover:scale-105"
              >
                Créer un compte
              </Button>
              <Button
                variant="outline"
                onClick={() => navigate('/auth')}
                className="rounded-xl h-14 px-8 font-bold uppercase tracking-widest border-foreground/20 hover:bg-white/40 transition-all"
              >
                Se connecter
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VisitorPage;

