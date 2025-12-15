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
} from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-card border-t">
      <div className="container mx-auto px-4">
        {/* Newsletter Section */}
        <div className="py-12 border-b">
          <div className="max-w-4xl mx-auto text-center">
            <h3 className="text-2xl font-bold mb-4">Restez informé</h3>
            <p className="text-muted-foreground mb-6">
              Recevez les dernières nouvelles, promotions et conseils santé directement dans votre boîte mail
            </p>
            <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
              <Input
                placeholder="Votre adresse email"
                type="email"
                className="flex-1"
              />
              <Button className="sm:w-auto">
                S'abonner
              </Button>
            </div>
          </div>
        </div>

        {/* Main Footer Content */}
        <div className="py-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="bg-gradient-to-r from-primary to-secondary p-2 rounded-lg">
                <span className="text-white font-bold text-xl">P</span>
              </div>
              <div>
                <h3 className="text-xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                  PharmaGo
                </h3>
                <p className="text-xs text-muted-foreground">Express Delivery</p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              La  plateforme de livraison de médicaments à domicile en Côte d'Ivoire.
              Service rapide, fiable et sécurisé 24h/24.
            </p>
            <div className="flex space-x-4">
              <Button variant="outline" size="sm" className="w-10 h-10 p-0">
                <Facebook className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" className="w-10 h-10 p-0">
                <Twitter className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" className="w-10 h-10 p-0">
                <Instagram className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" className="w-10 h-10 p-0">
                <Linkedin className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Services */}
          <div>
            <h4 className="font-semibold text-lg mb-4">Services</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                  Livraison de médicaments
                </a>
              </li>
              <li>
                <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                  Pharmacies de garde
                </a>
              </li>
              <li>
                <a href="/consultation" className="text-muted-foreground hover:text-primary transition-colors">
                  Téléconsultation
                </a>
              </li>
              <li>
                <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                  Ordonnance en ligne
                </a>
              </li>
              <li>
                <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                  Matériel médical
                </a>
              </li>
              <li>
                <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                  Conseil pharmaceutique
                </a>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="font-semibold text-lg mb-4">Support</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="/contact" className="text-muted-foreground hover:text-primary transition-colors">
                  Contactez-nous
                </a>
              </li>
              <li>
                <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                  Comment commander
                </a>
              </li>
              <li>
                <a href="/tracking" className="text-muted-foreground hover:text-primary transition-colors">
                  Suivi de commande
                </a>
              </li>
              <li>
                <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                  Politique de retour
                </a>
              </li>
              <li>
                <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                  Devenir partenaire
                </a>
              </li>
              <li>
                <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                  Devenir livreur
                </a>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold text-lg mb-4">Contact</h4>
            <div className="space-y-3 text-sm">
              <div className="flex items-start gap-2">
                <MapPin className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium">Siège social</p>
                  <p className="text-muted-foreground">
                    Plateau, Boulevard Clozel<br />
                    Abidjan, Côte d'Ivoire
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-primary" />
                <div>
                  <p className="font-medium">+225 01 02 03 04 05</p>
                  <p className="text-muted-foreground text-xs">Ligne d'urgence 24h/24</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-primary" />
                <div>
                  <p className="font-medium">contact@pharmago.ci</p>
                  <p className="text-muted-foreground text-xs">Support client</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-secondary" />
                <div>
                  <p className="font-medium">Service 24h/24</p>
                  <p className="text-muted-foreground text-xs">7j/7 dans toute la région</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Footer */}
        <div className="py-6 border-t flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-sm text-muted-foreground">
            © 2025 PharmaGo Express. Tous droits réservés.
          </div>

          <div className="flex flex-wrap gap-6 text-sm">
            <a href="/cgu" className="text-muted-foreground hover:text-primary transition-colors">
              Conditions d'utilisation
            </a>
            <a href="/cgu" className="text-muted-foreground hover:text-primary transition-colors">
              Politique de confidentialité
            </a>
            <a href="/terms" className="text-muted-foreground hover:text-primary transition-colors">
              Mentions légales & RGPD
            </a>
            <a href="/contact" className="text-muted-foreground hover:text-primary transition-colors">
              Contact
            </a>
          </div>

          <div className="flex items-center gap-1 text-sm text-muted-foreground">

          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
