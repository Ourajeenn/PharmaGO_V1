import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  MapPin,
  Phone,
  Mail,
  Clock,
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  Send,
} from "lucide-react";

const Footer = () => {
  return (
    <footer className="relative overflow-hidden border-t">
      {/* Premium Gradient Backgrounds from V2 */}
      <div className="absolute inset-0 bg-gradient-to-br from-orange-600/5 via-orange-500/5 to-amber-400/5" />
      <div className="absolute inset-0 bg-gradient-to-tl from-blue-900/5 via-transparent to-green-900/5" />

      <div className="relative z-10 container mx-auto px-4">
        {/* Unified Newsletter Section */}
        <div className="py-16 border-b border-white/10">
          <div className="max-w-4xl mx-auto text-center space-y-6">
            <h3 className="text-3xl md:text-4xl font-black uppercase tracking-tighter">
              Restez <span className="text-primary">informé</span>
            </h3>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Recevez les dernières nouvelles, promotions et conseils santé directement dans votre boîte mail.
            </p>
            <form className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto" onSubmit={(e) => e.preventDefault()}>
              <div className="relative flex-1">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  placeholder="votre@email.com"
                  type="email"
                  className="pl-11 h-14 rounded-xl glass-morphism border-white/40 font-medium"
                />
              </div>
              <Button className="h-14 px-8 rounded-xl font-black uppercase tracking-widest shadow-lg shadow-primary/20">
                S'abonner
                <Send className="ml-2 h-4 w-4" />
              </Button>
            </form>
          </div>
        </div>

        {/* Main Footer Content */}
        <div className="py-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand & Social */}
          <div className="space-y-6">
            <div className="flex items-center space-x-2">
              <div className="bg-gradient-to-r from-orange-500 to-amber-500 p-2 rounded-xl shadow-lg shadow-orange-500/20">
                <span className="text-white font-black text-xl">P</span>
              </div>
              <div>
                <h3 className="text-2xl font-black tracking-tighter uppercase">
                  Pharma<span className="text-primary">Go</span>
                </h3>
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground">Express Delivery</p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              La plateforme de livraison de médicaments à domicile en Côte d'Ivoire.
              Soin, rapidité et fiabilité 24h/24 dans tout le pays.
            </p>
            <div className="flex space-x-3">
              {[
                { icon: Facebook, href: "https://facebook.com" },
                { icon: Twitter, href: "https://twitter.com" },
                { icon: Instagram, href: "https://instagram.com" },
                { icon: Linkedin, href: "https://linkedin.com" },
              ].map((social, i) => (
                <a
                  key={i}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-xl glass-morphism border-white/40 flex items-center justify-center transition-all hover:scale-110 hover:bg-white/60 text-foreground/70 hover:text-primary"
                >
                  <social.icon className="h-5 w-5" />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-black uppercase tracking-widest text-sm mb-6">Produits & Services</h4>
            <ul className="space-y-4 text-sm">
              {[
                { label: "Médicaments", path: "/medicaments" },
                { label: "Parapharmacie", path: "/parapharmacie" },
                { label: "Téléconsultation", path: "/consultation" },
                { label: "Pharmacies de garde", path: "/pharmacies" },
                { label: "Matériel médical", path: "#" },
              ].map((link, i) => (
                <li key={i}>
                  <Link to={link.path} className="text-muted-foreground hover:text-primary transition-all font-medium flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary/20" />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="font-black uppercase tracking-widest text-sm mb-6">Support & Partenariat</h4>
            <ul className="space-y-4 text-sm">
              {[
                { label: "Contactez-nous", path: "/contact" },
                { label: "Suivi de commande", path: "/tracking" },
                { label: "E-Carnet Santé", path: "/e-carnet" },
                { label: "Devenir livreur", path: "/auth/driver" },
                { label: "Partenaire Pharmacie", path: "/auth/pharmacy" },
              ].map((link, i) => (
                <li key={i}>
                  <Link to={link.path} className="text-muted-foreground hover:text-primary transition-all font-medium">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Details */}
          <div>
            <h4 className="font-black uppercase tracking-widest text-sm mb-6">Contact en direct</h4>
            <div className="space-y-5 text-sm">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary flex-shrink-0">
                  <MapPin className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-black uppercase text-[10px] tracking-widest text-muted-foreground mb-1">Siège social</p>
                  <p className="font-medium text-foreground/90">Plateau, Abidjan</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center text-green-600 flex-shrink-0">
                  <Phone className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-black uppercase text-[10px] tracking-widest text-muted-foreground mb-1">Urgence 24h/24</p>
                  <p className="font-medium text-foreground/90">+225 01 02 03 04 05</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-600 flex-shrink-0">
                  <Mail className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-black uppercase text-[10px] tracking-widest text-muted-foreground mb-1">Email Support</p>
                  <p className="font-medium text-foreground/90">contact@pharmago.ci</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="py-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
            © {new Date().getFullYear()} PharmaGo Express. Tous droits réservés.
          </p>
          <div className="flex flex-wrap justify-center gap-6">
            {[
              { label: "CGU / CGV", path: "/terms" },
              { label: "Confidentialité", path: "/terms" },
              { label: "Mentions Légales", path: "/terms" },
            ].map((link, i) => (
              <Link key={i} to={link.path} className="text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors">
                {link.label}
              </Link>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Système Opérationnel</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

