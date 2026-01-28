import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Menu, X, MapPin, Phone, Clock, User, ShoppingCart, Eye, Building2, Truck, Stethoscope, Shield, ArrowLeft, LogOut } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { CartDrawer } from "./cart/CartDrawer"
import { ThemeToggle } from "./ThemeToggle"
import { useAuth } from "@/hooks/useAuth"
import { supabase } from "@/integrations/supabase/client"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();
  const { user, profile } = useAuth();

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      toast.success("Déconnexion réussie");
      navigate('/');
    } catch (error) {
      toast.error("Erreur lors de la déconnexion");
    }
  };

  const getRoleBadge = (role: string | undefined) => {
    const roles: Record<string, { label: string; color: string }> = {
      patient: { label: 'Patient', color: 'bg-blue-100 text-blue-700' },
      pharmacy: { label: 'Pharmacie', color: 'bg-green-100 text-green-700' },
      doctor: { label: 'Médecin', color: 'bg-purple-100 text-purple-700' },
      driver: { label: 'Livreur', color: 'bg-orange-100 text-orange-700' },
      insurer: { label: 'Assureur', color: 'bg-cyan-100 text-cyan-700' },
      admin: { label: 'Admin', color: 'bg-red-100 text-red-700' }
    };
    return roles[role || ''] || { label: 'Visiteur', color: 'bg-gray-100 text-gray-700' };
  };

  return (
    <div className="sticky top-4 z-50 mx-4 md:container md:mx-auto led-border-container rounded-3xl group">
      {/* Spinning LED effect behind */}
      <div className="led-border-spinner group-hover:opacity-100" />

      {/* Main header content */}
      <header className="relative w-full rounded-[23px] bg-white/80 dark:bg-black/80 backdrop-blur-xl backdrop-saturate-150 border border-white/20 shadow-lg supports-[backdrop-filter]:bg-white/80 transition-all duration-300 overflow-hidden">
        <div className="container mx-auto px-4">
          {/* Top bar */}
          <div className="hidden md:flex items-center justify-center py-2 text-sm border-b border-white/10">
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
          </div>

          {/* Main navigation */}
          <div className="flex items-center justify-between py-4 relative">
            {/* Left: Cart and Commander */}
            <div className="flex items-center space-x-2 md:space-x-4">
              <CartDrawer />
              <Button
                variant="outline"
                size="sm"
                className="hidden md:inline-flex shadow-sm hover:shadow-md transition-all h-[40px] rounded-lg border-2 border-slate-200"
                onClick={() => navigate('/paiement')}
              >
                Commander
              </Button>
              <div className="hidden sm:block">
                <ThemeToggle />
              </div>
            </div>

            {/* Middle: Desktop Navigation */}
            <nav className="hidden xl:flex items-center space-x-6">
              <a href="/" className="story-link text-foreground hover:text-primary transition-colors font-medium text-sm">
                Accueil
              </a>
              <Link to="/ordonnances" className="story-link text-foreground hover:text-primary transition-colors font-medium text-sm">
                Ordonnances
              </Link>
              <Link to="/medicaments" className="story-link text-foreground hover:text-primary transition-colors font-medium text-sm">
                Médicaments
              </Link>
              <Link to="/pharmacies" className="story-link text-foreground hover:text-primary transition-colors font-medium text-sm">
                Pharmacies
              </Link>
              <Link to="/pharmacies-garde" className="story-link text-foreground hover:text-primary transition-colors font-medium text-sm">
                Pharmacies de Garde
              </Link>
              <Link to="/consultation" className="story-link text-foreground hover:text-primary transition-colors font-medium text-sm">
                Consultation
              </Link>
              <Link to="/ecarnet" className="story-link text-foreground hover:text-primary transition-colors font-medium text-sm">
                E-Carnet
              </Link>
            </nav>

            {/* Right: User Profile or Login */}
            <div className="flex items-center space-x-3 md:space-x-6">
              {user && profile ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      className="flex items-center gap-2 md:gap-3 rounded-full overflow-hidden shadow-sm hover:shadow-md transition-all hover:scale-105 border-none bg-[#f1f7ff] hover:bg-primary/10 h-10 px-2 md:px-4"
                    >
                      <Avatar className="h-8 w-8 border-2 border-primary/20">
                        <AvatarImage src={profile.avatar_url || ''} />
                        <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-500 text-white font-bold text-sm">
                          {profile.name?.charAt(0) || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="hidden md:flex flex-col items-start">
                        <span className="text-sm font-bold text-slate-900">{profile.name || 'Utilisateur'}</span>
                        <Badge className={`text-[10px] px-2 py-0 ${getRoleBadge(profile.role).color}`}>
                          {getRoleBadge(profile.role).label}
                        </Badge>
                      </div>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel>Mon Compte</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => navigate('/dashboard')}>
                      <User className="h-4 w-4 mr-2" />
                      Dashboard
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate('/profile-selection')}>
                      <Shield className="h-4 w-4 mr-2" />
                      Changer de profil
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                      <LogOut className="h-4 w-4 mr-2" />
                      Déconnexion
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Button
                  variant="ghost"
                  onClick={() => navigate('/profile-selection')}
                  className="flex items-center rounded-full overflow-hidden shadow-sm hover:shadow-md transition-all hover:scale-105 group border-none bg-[#f1f7ff] hover:bg-primary hover:text-white h-10 px-2 md:px-4 gap-1 md:gap-2"
                >
                  <div className="p-1.5 rounded-full bg-primary text-white group-hover:bg-white group-hover:text-primary transition-colors">
                    <User className="h-4 w-4" />
                  </div>
                  <span className="text-[#0070c0] font-bold text-xs md:text-sm group-hover:text-white transition-colors">
                    Profils
                  </span>
                </Button>
              )}

              {/* Right: Logo */}
              <Link to="/" className="flex items-center space-x-2 hover:opacity-80 transition-opacity transform -translate-y-1">
                <div className="text-right hidden sm:block">
                  <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-green-500 bg-clip-text text-transparent">
                    PharmaGo
                  </h1>
                  <p className="text-[10px] text-muted-foreground font-semibold">Express Delivery</p>
                </div>
                <div className="bg-gradient-to-r from-blue-600 to-green-500 p-1.5 rounded-lg shadow-lg">
                  <span className="text-white font-bold text-lg">P</span>
                </div>
              </Link>

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
            <div className="md:hidden border-t border-white/10 py-4 bg-background/60 backdrop-blur-xl">
              <nav className="flex flex-col space-y-4 px-4">
                <a href="/" className="text-foreground hover:text-primary transition-colors font-medium">
                  Accueil
                </a>
                <Link to="/ordonnances" className="text-foreground hover:text-primary transition-colors font-medium">
                  Ordonnances
                </Link>
                <Link to="/medicaments" className="text-foreground hover:text-primary transition-colors font-medium">
                  Médicaments & Parapharmacie
                </Link>
                <Link to="/pharmacies" className="text-foreground hover:text-primary transition-colors font-medium">
                  Pharmacies
                </Link>
                <Link to="/consultation" className="text-foreground hover:text-primary transition-colors font-medium">
                  Consultation Médicale
                </Link>

                <div className="flex items-center justify-between py-2 border-t border-white/10 mt-2">
                  <span className="text-sm font-medium">Thème</span>
                  <ThemeToggle />
                </div>

                <div className="pt-2 border-t border-white/10">
                  <p className="text-xs font-bold text-muted-foreground uppercase mb-3 px-2">Espaces Utilisateurs</p>
                  <Button
                    variant="outline"
                    className="w-full justify-between bg-[#f1f7ff] text-primary border-none hover:bg-primary hover:text-white"
                    onClick={() => {
                      navigate('/profile-selection');
                      setIsMenuOpen(false);
                    }}
                  >
                    <span className="flex items-center">
                      <User className="h-4 w-4 mr-2" />
                      Choisir mon profil
                    </span>
                    <ArrowLeft className="h-4 w-4 rotate-180" />
                  </Button>
                </div>

                <div className="pt-4 border-t border-white/10 space-y-2">
                  <Button
                    variant="default"
                    size="sm"
                    className="w-full bg-gradient-to-r from-blue-600 to-green-500"
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
    </div>
  );
};

export default Header;
