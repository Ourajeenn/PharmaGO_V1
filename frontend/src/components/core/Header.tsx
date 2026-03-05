import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Menu, X, MapPin, Phone, Clock, User, ShoppingCart, Eye, Building2, Truck, Stethoscope, Shield, ArrowLeft, LogOut, ChevronDown, Mail, MessageSquare } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { CartDrawer } from "@/components/cart/CartDrawer"
import { NotificationsPopover } from "@/components/ui/NotificationsPopover"
import { ThemeToggle } from "@/components/core/ThemeToggle"
import { useAuth } from "@/hooks/useAuth"
import { supabase } from "@/integrations/supabase/client"
import { useDataSaver } from "@/contexts/DataSaverContext"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import useI18n, { type Lang, LANG_FLAGS, LANG_LABELS } from "@/hooks/useI18n"
import { useOnlineStatus } from "@/hooks/useOnlineStatus"
import { WifiOff } from "lucide-react"
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
  const { lang, setLang } = useI18n();
  const isOnline = useOnlineStatus();
  const { isDataSaverEnabled, toggleDataSaver } = useDataSaver();

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
      <header aria-label="En-tête principal PharmaGo" className="relative w-full rounded-[23px] bg-white/80 dark:bg-black/80 backdrop-blur-xl backdrop-saturate-150 border border-white/20 shadow-lg supports-[backdrop-filter]:bg-white/80 overflow-hidden min-h-[70px] md:min-h-[110px]">
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
                <span>24h/24 - Livraison 45min-2h</span>
              </div>

              {/* Language switcher */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-1.5 text-xs font-semibold hover:text-primary transition-colors ml-4 border border-white/20 rounded-full px-2.5 py-1 bg-white/5 hover:bg-white/10">
                    <span>{LANG_FLAGS[lang]}</span>
                    <span>{LANG_LABELS[lang]}</span>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-36">
                  {(Object.keys(LANG_LABELS) as Lang[]).map((l) => (
                    <DropdownMenuItem
                      key={l}
                      onClick={() => setLang(l)}
                      className={lang === l ? 'font-bold text-primary' : ''}
                    >
                      {LANG_FLAGS[l]} {LANG_LABELS[l]}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>



              {/* Offline Indicator Desktop */}
              {!isOnline && (
                <div className="flex items-center space-x-2 px-3 py-1 bg-orange-100 text-orange-700 rounded-full animate-pulse border border-orange-200">
                  <WifiOff className="h-4 w-4" />
                  <span className="font-bold text-xs uppercase tracking-tight">Mode Hors-ligne</span>
                </div>
              )}
            </div>
          </div>

          {/* Main navigation */}
          <div className="flex items-center justify-between py-4 relative">
            {/* Left: Cart and Commander */}
            <div className="flex items-center space-x-1 md:space-x-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate('/messages')}
                className="relative flex items-center justify-center rounded-full hover:bg-indigo-50 hover:text-indigo-600 text-foreground/70 h-10 w-10 transition-colors"
                title="Messagerie"
              >
                <MessageSquare className="h-5 w-5" />
                {/* Simulated badge for unread messages */}
                <span className="absolute top-2 right-2 flex h-2 w-2 rounded-full bg-indigo-600 animate-pulse"></span>
              </Button>
              <NotificationsPopover />
              <CartDrawer />
              <div className="hidden sm:block">
                <Button
                  variant="outline"
                  size="sm"
                  className="hidden md:inline-flex shadow-sm hover:shadow-md transition-all h-[40px] rounded-lg border-2 border-slate-200"
                  onClick={() => navigate('/paiement')}
                >
                  Commander
                </Button>
              </div>
            </div>

            <nav aria-label="Navigation principale" className="hidden xl:flex items-center space-x-1">
              {/* Accueil - Bleu */}
              <a href="/" className="relative px-3 py-2 text-foreground/70 font-bold text-sm tracking-tight uppercase rounded-full transition-all duration-300 whitespace-nowrap hover:!text-[#0070c0] hover:bg-[#0070c0]/10 hover:scale-105 hover:shadow-[0_0_15px_rgba(0,112,192,0.2)]">
                Accueil
              </a>
              {/* Ordonnances - Emeraude */}
              <Link to="/ordonnances" className="relative px-3 py-2 text-foreground/70 font-bold text-sm tracking-tight uppercase rounded-full transition-all duration-300 whitespace-nowrap hover:!text-emerald-600 hover:bg-emerald-500/10 hover:scale-105 hover:shadow-[0_0_15px_rgba(16,185,129,0.2)]">
                Ordonnances
              </Link>
              {/* Médicaments - Violet */}
              <Link to="/medicaments" className="relative px-3 py-2 text-foreground/70 font-bold text-sm tracking-tight uppercase rounded-full transition-all duration-300 whitespace-nowrap hover:!text-violet-600 hover:bg-violet-500/10 hover:scale-105 hover:shadow-[0_0_15px_rgba(139,92,246,0.2)]">
                Médicaments
              </Link>
              {/* Pharmacies - Orange */}
              <Link to="/pharmacies" className="relative px-3 py-2 text-foreground/70 font-bold text-sm tracking-tight uppercase rounded-full transition-all duration-300 whitespace-nowrap hover:!text-orange-500 hover:bg-orange-500/10 hover:scale-105 hover:shadow-[0_0_15px_rgba(249,115,22,0.2)]">
                Pharmacies
              </Link>
              {/* Consultation - Cyan */}
              <Link to="/consultation" className="relative px-3 py-2 text-foreground/70 font-bold text-sm tracking-tight uppercase rounded-full transition-all duration-300 whitespace-nowrap hover:!text-cyan-600 hover:bg-cyan-500/10 hover:scale-105 hover:shadow-[0_0_15px_rgba(6,182,212,0.2)]">
                Consultation
              </Link>
              {/* E-Carnet - Rose */}
              <Link to="/ecarnet" className="relative px-3 py-2 text-foreground/70 font-bold text-sm tracking-tight uppercase rounded-full transition-all duration-300 whitespace-nowrap hover:!text-rose-500 hover:bg-rose-500/10 hover:scale-105 hover:shadow-[0_0_15px_rgba(244,63,94,0.2)]">
                E-Carnet
              </Link>
            </nav>

            {/* Right: User Profile or Login */}
            <div className="flex items-center space-x-3 md:space-x-6">
              <div className="hidden md:block">
                <ThemeToggle />
              </div>
              {user && profile ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      className="flex items-center gap-2 md:gap-3 rounded-full overflow-hidden shadow-sm hover:shadow-md transition-all hover:scale-105 border-none bg-primary/5 hover:bg-primary/10 h-10 px-2 md:px-4"
                    >
                      <Avatar className="h-8 w-8 border-2 border-primary/20">
                        <AvatarImage src={profile.avatar_url || ''} />
                        <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-500 text-white font-bold text-sm">
                          {profile.name?.charAt(0) || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="hidden md:flex flex-col items-start text-left">
                        <span className="text-xs font-black uppercase tracking-widest text-foreground">{profile.name || 'Utilisateur'}</span>
                        <Badge className={`text-[9px] px-1.5 py-0 font-bold uppercase ${getRoleBadge(profile.role).color}`}>
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
                    <DropdownMenuItem onClick={() => navigate('/messages')}>
                      <Mail className="h-4 w-4 mr-2" />
                      Messages
                    </DropdownMenuItem>
                    {profile.role === 'admin' && (
                      <DropdownMenuItem onClick={() => navigate('/admin/dashboard')}>
                        <Shield className="h-4 w-4 mr-2 text-red-500" />
                        Admin Dashboard
                      </DropdownMenuItem>
                    )}
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
                  className="flex items-center rounded-full overflow-hidden shadow-sm hover:shadow-md transition-all hover:scale-105 group border-none bg-primary/5 hover:bg-primary hover:text-white h-10 px-2 md:px-4 gap-1 md:gap-2"
                >
                  <div className="p-1.5 rounded-full bg-primary text-white group-hover:bg-white group-hover:text-primary transition-colors">
                    <User className="h-4 w-4" />
                  </div>
                  <span className="text-primary font-black text-xs uppercase tracking-widest group-hover:text-white transition-colors">
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
                  <p className="text-[10px] text-muted-foreground font-semibold">Votre santé, livrée chez vous</p>
                </div>
                <div className="bg-white p-1 rounded-lg shadow-lg">
                  <img src="/pwa-192x192.png" alt="PharmaGo PWA Logo" className="h-6 w-6 object-contain" />
                </div>
              </Link>

              {/* Offline Indicator Mobile */}
              {!isOnline && (
                <div className="md:hidden flex items-center justify-center h-8 w-8 bg-orange-500 text-white rounded-full shadow-lg border-2 border-white animate-pulse">
                  <WifiOff className="h-4 w-4" />
                </div>
              )}

              {/* Mobile menu toggle */}
              <Button
                variant="ghost"
                size="sm"
                className="md:hidden"
                onClick={toggleMenu}
                aria-label={isMenuOpen ? "Fermer le menu" : "Ouvrir le menu"}
              >
                {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </Button>
            </div>
          </div>

          {/* Mobile Navigation */}
          {isMenuOpen && (
            <div className="md:hidden border-t border-white/10 py-4 bg-background/60 backdrop-blur-xl">
              <nav className="flex flex-col space-y-4 px-4">
                <a href="/" className="text-foreground hover:text-primary transition-colors font-bold text-sm uppercase tracking-widest">
                  Accueil
                </a>
                <Link to="/ordonnances" className="text-foreground hover:text-primary transition-colors font-bold text-sm uppercase tracking-widest">
                  Ordonnances
                </Link>
                <Link to="/medicaments" className="text-foreground hover:text-primary transition-colors font-bold text-sm uppercase tracking-widest">
                  Médicaments
                </Link>
                <Link to="/pharmacies" className="text-foreground hover:text-primary transition-colors font-bold text-sm uppercase tracking-widest" onClick={() => setIsMenuOpen(false)}>
                  Pharmacies
                </Link>
                <Link to="/consultation" className="text-foreground hover:text-primary transition-colors font-bold text-sm uppercase tracking-widest">
                  Consultation
                </Link>
                <Link to="/ecarnet" className="text-foreground hover:text-primary transition-colors font-bold text-sm uppercase tracking-widest">
                  E-Carnet
                </Link>

                <div className="flex items-center justify-between py-2 border-t border-white/10 mt-2">
                  <span className="text-sm font-medium">Thème</span>
                  <ThemeToggle />
                </div>

                {/* Assuming useDataSaver is called at the top of the component, e.g., const { isDataSaverEnabled, toggleDataSaver } = useDataSaver(); */}
                <div className="flex items-center justify-between py-2 border-t border-white/10">
                  <span className="text-sm font-medium">Éco. Données</span>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-muted-foreground">{isDataSaverEnabled ? 'ON' : 'OFF'}</span>
                    <Button
                      variant={isDataSaverEnabled ? "default" : "outline"}
                      size="sm"
                      className="h-6 w-10 px-0 rounded-full"
                      onClick={toggleDataSaver}
                    >
                      <div className={`h-4 w-4 rounded-full bg-white transition-transform ${isDataSaverEnabled ? 'translate-x-3' : '-translate-x-3'}`} />
                    </Button>
                  </div>
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
      </header >
    </div >
  );
};

export default Header;







