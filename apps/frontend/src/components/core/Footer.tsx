import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  MapPin,
  Phone,
  Mail,
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  Send,
  ArrowRight
} from "lucide-react";

const Footer = () => {
  return (
    <footer className="relative bg-slate-950 text-slate-200 overflow-hidden pt-20 border-t border-white/10">
      {/* Decorative Glow Elements */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="relative z-10 container mx-auto px-4">
        {/* Newsletter Section - Float Card Style */}
        <div className="relative -mt-32 mb-16 max-w-5xl mx-auto rounded-3xl bg-gradient-to-br from-slate-900 to-slate-950 border border-white/10 p-8 md:p-12 shadow-2xl shadow-black/50 overflow-hidden">
          <div className="absolute inset-0 bg-[url('/noise.png')] opacity-[0.03] mix-blend-overlay" />
          <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-transparent to-blue-500/10" />
          
          <div className="relative flex flex-col lg:flex-row items-center justify-between gap-8">
            <div className="text-center lg:text-left space-y-3">
              <h3 className="text-3xl font-black text-white tracking-tight">
                Restez <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">informé</span>
              </h3>
              <p className="text-slate-400 max-w-md">
                Recevez nos meilleures offres santé, nouveautés et conseils directement par email.
              </p>
            </div>
            
            <form className="flex w-full lg:w-auto flex-col sm:flex-row gap-3" onSubmit={(e) => e.preventDefault()}>
              <div className="relative sm:w-80">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500" />
                <Input
                  placeholder="votre@email.com"
                  type="email"
                  className="pl-12 h-14 bg-slate-950/50 border-white/10 text-white placeholder:text-slate-500 rounded-xl focus-visible:ring-primary focus-visible:border-primary"
                />
              </div>
              <Button className="h-14 px-8 rounded-xl bg-gradient-to-r from-blue-600 to-emerald-500 hover:from-blue-500 hover:to-emerald-400 text-white border-0 font-bold uppercase tracking-wide transition-all duration-300 shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:shadow-[0_0_30px_rgba(16,185,129,0.5)] flex items-center justify-center">
                S'abonner
                <Send className="ml-2 h-4 w-4" />
              </Button>
            </form>
          </div>
        </div>

        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12 lg:gap-8 pb-16">
          {/* Brand & Mission - Takes up more space */}
          <div className="lg:col-span-4 space-y-6">
            <div className="flex items-center space-x-3">
              <div className="bg-white p-1.5 rounded-xl shadow-lg">
                <img
                  src="/pwa-192x192.png"
                  alt="PharmaGo Logo"
                  className="w-10 h-10 object-contain"
                />
              </div>
              <div>
                <h3 className="text-2xl font-black tracking-tighter uppercase text-white">
                  Pharma<span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">Go</span>
                </h3>
                <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-emerald-400">Express Delivery</p>
              </div>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed max-w-sm">
              Votre pharmacie en ligne de confiance en Côte d'Ivoire. Nous assurons la livraison rapide, sécurisée et confidentielle de vos produits de santé 24h/24 et 7j/7.
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
                  className="w-10 h-10 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center transition-all duration-300 hover:scale-110 hover:bg-primary hover:border-primary hover:text-white text-slate-400"
                >
                  <social.icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div className="lg:col-span-2 lg:col-start-6">
            <h4 className="font-bold uppercase tracking-wider text-white text-sm mb-6 flex items-center">
              <span className="w-8 h-[2px] bg-primary mr-3 rounded-full"></span>
              Services
            </h4>
            <ul className="space-y-3">
              {[
                { label: "Médicaments", path: "/medicaments" },
                { label: "Parapharmacie", path: "/parapharmacie" },
                { label: "Téléconsultation", path: "/consultation" },
                { label: "Pharmacies de garde", path: "/pharmacies" },
                { label: "Matériel médical", path: "#" },
              ].map((link, i) => (
                <li key={i}>
                  <Link to={link.path} className="text-slate-400 text-sm hover:text-white hover:translate-x-1 transition-all flex items-center group">
                    <ArrowRight className="h-3 w-3 mr-2 opacity-0 -ml-5 group-hover:opacity-100 group-hover:ml-0 transition-all text-primary" />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div className="lg:col-span-2">
            <h4 className="font-bold uppercase tracking-wider text-white text-sm mb-6 flex items-center">
              <span className="w-8 h-[2px] bg-blue-500 mr-3 rounded-full"></span>
              Support
            </h4>
            <ul className="space-y-3">
              {[
                { label: "Assistance", path: "/contact" },
                { label: "Suivi de commande", path: "/tracking" },
                { label: "Mon Profil", path: "/profile" },
                { label: "Devenir Livreur", path: "/auth/driver" },
                { label: "Espace Pharmacie", path: "/auth/pharmacy" },
              ].map((link, i) => (
                <li key={i}>
                  <Link to={link.path} className="text-slate-400 text-sm hover:text-white hover:translate-x-1 transition-all flex items-center group">
                    <ArrowRight className="h-3 w-3 mr-2 opacity-0 -ml-5 group-hover:opacity-100 group-hover:ml-0 transition-all text-blue-400" />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Information */}
          <div className="lg:col-span-3">
             <h4 className="font-bold uppercase tracking-wider text-white text-sm mb-6 flex items-center">
              <span className="w-8 h-[2px] bg-emerald-500 mr-3 rounded-full"></span>
              Contact
            </h4>
            <div className="space-y-4">
              <div className="group flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-emerald-400 flex-shrink-0 group-hover:bg-emerald-500/20 group-hover:border-emerald-500/30 transition-colors">
                  <Phone className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-0.5">Urgence 24h/24</p>
                  <p className="text-sm font-medium text-white group-hover:text-emerald-400 transition-colors">+225 01 02 03 04 05</p>
                </div>
              </div>

              <div className="group flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-blue-400 flex-shrink-0 group-hover:bg-blue-500/20 group-hover:border-blue-500/30 transition-colors">
                  <Mail className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-0.5">Assistance Client</p>
                  <p className="text-sm font-medium text-white group-hover:text-blue-400 transition-colors">contact@pharmago.ci</p>
                </div>
              </div>

              <div className="group flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-primary flex-shrink-0 group-hover:bg-primary/20 group-hover:border-primary/30 transition-colors">
                  <MapPin className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-0.5">Siège Social</p>
                  <p className="text-sm font-medium text-white group-hover:text-primary transition-colors">Plateau, Abidjan</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Legal Bar */}
        <div className="py-6 border-t border-slate-800 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs text-slate-500">
            © {new Date().getFullYear()} <span className="font-semibold text-slate-300">PharmaGo Express</span>. Tous droits réservés.
          </p>
          <div className="flex flex-wrap justify-center gap-4 md:gap-8">
            {[
              { label: "CGU / CGV", path: "/terms" },
              { label: "Confidentialité", path: "/terms" },
              { label: "Mentions Légales", path: "/terms" },
            ].map((link, i) => (
              <Link key={i} to={link.path} className="text-xs text-slate-500 hover:text-white transition-colors">
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
