import { Link } from "react-router-dom";
import { Twitter, Instagram, Linkedin, Facebook } from "lucide-react";

const FooterV2 = () => {
    return (
        <footer className="relative overflow-hidden">
            {/* Gradient Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-orange-600 via-orange-500 to-amber-400 opacity-90" />
            <div className="absolute inset-0 bg-gradient-to-tl from-blue-900/60 via-transparent to-green-900/60" />

            <div className="relative z-10">
                {/* Main Footer Content */}
                <div className="container mx-auto px-4 py-12">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                        {/* Brand Section */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                                    <span className="text-white text-xl">💊</span>
                                </div>
                                <h3 className="text-2xl font-bold text-white">PharmaGo</h3>
                            </div>

                            {/* Social Links */}
                            <div className="flex gap-3">
                                <a
                                    href="https://twitter.com"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="w-10 h-10 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
                                >
                                    <Twitter className="h-5 w-5 text-white" />
                                </a>
                                <a
                                    href="https://instagram.com"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="w-10 h-10 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
                                >
                                    <Instagram className="h-5 w-5 text-white" />
                                </a>
                                <a
                                    href="https://linkedin.com"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="w-10 h-10 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
                                >
                                    <Linkedin className="h-5 w-5 text-white" />
                                </a>
                                <a
                                    href="https://facebook.com"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="w-10 h-10 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
                                >
                                    <Facebook className="h-5 w-5 text-white" />
                                </a>
                            </div>
                        </div>

                        {/* Product Links */}
                        <div>
                            <h4 className="text-white font-semibold mb-4">Produits</h4>
                            <ul className="space-y-2">
                                <li>
                                    <Link to="/medicaments" className="text-white/70 hover:text-white transition-colors">
                                        Médicaments
                                    </Link>
                                </li>
                                <li>
                                    <Link to="/parapharmacie" className="text-white/70 hover:text-white transition-colors">
                                        Parapharmacie
                                    </Link>
                                </li>
                                <li>
                                    <Link to="/consultation" className="text-white/70 hover:text-white transition-colors">
                                        Consultations
                                    </Link>
                                </li>
                                <li>
                                    <Link to="/pharmacies" className="text-white/70 hover:text-white transition-colors">
                                        Pharmacies
                                    </Link>
                                </li>
                            </ul>
                        </div>

                        {/* Services Links */}
                        <div>
                            <h4 className="text-white font-semibold mb-4">Services</h4>
                            <ul className="space-y-2">
                                <li>
                                    <Link to="/tracking" className="text-white/70 hover:text-white transition-colors">
                                        Suivi Commande
                                    </Link>
                                </li>
                                <li>
                                    <Link to="/e-carnet" className="text-white/70 hover:text-white transition-colors">
                                        E-Carnet Santé
                                    </Link>
                                </li>
                                <li>
                                    <Link to="/auth/driver" className="text-white/70 hover:text-white transition-colors">
                                        Devenir Livreur
                                    </Link>
                                </li>
                                <li>
                                    <Link to="/auth/pharmacy" className="text-white/70 hover:text-white transition-colors">
                                        Partenaire Pharmacie
                                    </Link>
                                </li>
                            </ul>
                        </div>

                        {/* Company Links */}
                        <div>
                            <h4 className="text-white font-semibold mb-4">Entreprise</h4>
                            <ul className="space-y-2">
                                <li>
                                    <Link to="/contact" className="text-white/70 hover:text-white transition-colors">
                                        À propos
                                    </Link>
                                </li>
                                <li>
                                    <Link to="/contact" className="text-white/70 hover:text-white transition-colors">
                                        Articles
                                    </Link>
                                </li>
                                <li>
                                    <Link to="/contact" className="text-white/70 hover:text-white transition-colors">
                                        Contact
                                    </Link>
                                </li>
                                <li>
                                    <Link to="/terms" className="text-white/70 hover:text-white transition-colors">
                                        Mentions légales
                                    </Link>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="border-t border-white/10">
                    <div className="container mx-auto px-4 py-6">
                        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                            <p className="text-white/60 text-sm">
                                © {new Date().getFullYear()} PharmaGo. Tous droits réservés.
                            </p>
                            <div className="flex gap-6 text-sm">
                                <Link to="/terms" className="text-white/60 hover:text-white transition-colors">
                                    Conditions d'utilisation
                                </Link>
                                <Link to="/terms" className="text-white/60 hover:text-white transition-colors">
                                    Politique de confidentialité
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default FooterV2;
