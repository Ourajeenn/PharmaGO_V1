import { useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Home } from "lucide-react";

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-secondary/5 p-4">
      <div className="max-w-md w-full text-center space-y-8 glass-morphism p-12 rounded-3xl animate-fade-in">
        <div className="relative">
          <h1 className="text-9xl font-black text-primary/20">404</h1>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-2xl font-bold">Oups !</span>
          </div>
        </div>

        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-slate-800">Page introuvable</h2>
          <p className="text-slate-500">
            Désolé, la page que vous recherchez semble avoir été déplacée ou n'existe plus.
          </p>
        </div>

        <div className="flex flex-col gap-3">
          <Button
            onClick={() => navigate('/')}
            className="w-full py-6 rounded-2xl gap-2 text-lg shadow-lg hover:shadow-primary/30 transition-all font-bold"
          >
            <Home className="h-5 w-5" />
            Retour à l'accueil
          </Button>
          <Button
            variant="ghost"
            onClick={() => navigate(-1)}
            className="w-full py-6 rounded-2xl gap-2 hover:bg-primary/5 transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
            Page précédente
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
