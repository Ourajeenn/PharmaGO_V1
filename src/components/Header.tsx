import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Menu, X, MapPin, Phone, Clock, User, ShoppingCart, Eye } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { CartDrawer } from "./cart/CartDrawer";
import { ThemeToggle } from "./ThemeToggle";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  return (
    <header className="sticky top-0 z-50 w-full bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60 border-b">
      <div className="container mx-auto px-4">
        {/* Top bar */}
        <div className="hidden md:flex items-center justify-between py-2 text-sm border-b">
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-2">
              <MapPin className="h-4 w-4 text-primary" />
              <span>Abidjan, Côte d'Ivoire</span>
            </div>
            <div className="flex items-center space-x-2">
              <Phone className="h-4 w-4 text-primary" />
              <span>+225 01 40 271 217</span>
            </div>
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4 text-primary" />
              <span>24h/24 - Livraison express</span>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <Button
              variant="default"
              size="sm"
              className="h-8 text-xs hover-scale bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90"
              onClick={() => navigate('/login')}
            >
              <User className="h-4 w-4 mr-1" />
              Commencer maintenant
            </Button>
            <Button asChild variant="outline" size="sm" className="h-8 text-xs hover-scale">
              <Link to="/auth/driver">Devenir Livreur</Link>
            </Button>
          </div>
        </div>

        {/* Main navigation */}
        <div className="flex items-center justify-between py-4">
          <div className="flex items-center space-x-2">
            <div className="bg-gradient-to-r from-primary to-secondary p-2 rounded-lg">
              <span className="text-white font-bold text-xl">P</span>
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                PharmaGo
              </h1>
              <p className="text-xs text-muted-foreground">Express Delivery</p>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <a href="/" className="story-link text-foreground hover:text-primary transition-colors font-medium">
              Accueil
            </a>
            <Link to="/medicaments" className="story-link text-foreground hover:text-primary transition-colors font-medium">
              Médicaments & Parapharmacie
            </Link>
            <Link to="/pharmacies" className="story-link text-foreground hover:text-primary transition-colors font-medium">
              Pharmacies
            </Link>
            <Link to="/consultation" className="story-link text-foreground hover:text-primary transition-colors font-medium">
              Consultation Médicale
            </Link>
            <Link to="/ecarnet" className="story-link text-foreground hover:text-primary transition-colors font-medium">
              E-Carnet
            </Link>
            <a href="/#livreur" className="story-link text-foreground hover:text-primary transition-colors font-medium">
              Devenir Livreur
            </a>
          </nav>

          <div className="flex items-center space-x-4">
            <ThemeToggle />
            <CartDrawer />
            <Button
              variant="default"
              size="sm"
              className="hidden md:inline-flex"
              onClick={() => navigate('/paiement')}
            >
              Commander
            </Button>

            {/* Mobile menu toggle */}
            <Button
              variant="ghost"
              size="sm"
              className="md:hidden"
              onClick={toggleMenu}
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden border-t py-4">
            <nav className="flex flex-col space-y-4">
              <a href="/" className="text-foreground hover:text-primary transition-colors font-medium">
                Accueil
              </a>
              <Link to="/medicaments" className="text-foreground hover:text-primary transition-colors font-medium">
                Médicaments & Parapharmacie
              </Link>
              <Link to="/pharmacies" className="text-foreground hover:text-primary transition-colors font-medium">
                Pharmacies
              </Link>
              <Link to="/consultation" className="text-foreground hover:text-primary transition-colors font-medium">
                Consultation Médicale
              </Link>
              <a href="#livreur" className="text-foreground hover:text-primary transition-colors font-medium">
                Devenir Livreur
              </a>
              <div className="flex flex-col space-y-2 pt-4 border-t">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full mb-2"
                  onClick={() => navigate('/visitor')}
                >
                  <Eye className="h-4 w-4 mr-1" />
                  Mode Visiteur
                </Button>
                <Button
                  variant="default"
                  size="sm"
                  className="bg-gradient-to-r from-primary to-secondary"
                  onClick={() => navigate('/login')}
                >
                  <User className="h-4 w-4 mr-1" />
                  Commencer maintenant
                </Button>
                <Button
                  variant="default"
                  size="sm"
                  className="mt-4"
                  onClick={() => navigate('/paiement')}
                >
                  Commander
                </Button>
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
