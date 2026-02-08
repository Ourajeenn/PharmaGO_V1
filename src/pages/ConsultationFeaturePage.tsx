import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Video, MessageCircle, FileText, Calendar, Clock, Shield, CheckCircle, Home } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import MedicalChatDialog from "@/components/consultation/MedicalChatDialog";
import AppointmentBookingDialog from "@/components/consultation/AppointmentBookingDialog";
import { logger } from "@/utils/logger";

const ConsultationFeaturePage = () => {
    const { featureId } = useParams();
    const navigate = useNavigate();
    const [isChatOpen, setIsChatOpen] = useState(false);
    const [isAppointmentOpen, setIsAppointmentOpen] = useState(false);

    const features: { [key: string]: any } = {
        "video": {
            title: "Téléconsultation vidéo",
            icon: Video,
            description: "Consultez un médecin en face à face via vidéo sécurisée",
            details: [
                "Qualité vidéo HD sécurisée",
                "Partage d'écran pour les documents",
                "Connexion stable même en bas débit",
                "Disponible sur mobile et ordinateur"
            ],
            action: "Démarrer une consultation"
        },
        "chat": {
            title: "Chat médical",
            icon: MessageCircle,
            description: "Échangez par message avec votre médecin",
            details: [
                "Réponses rapides",
                "Envoi de photos sécurisé",
                "Historique des conversations",
                "Idéal pour le suivi et les questions simples"
            ],
            action: "Ouvrir le chat"
        },
        "prescription": {
            title: "E-prescription",
            icon: FileText,
            description: "Recevez votre ordonnance électronique directement",
            details: [
                "Ordonnance sécurisée et infalsifiable",
                "Envoi direct à la pharmacie de votre choix",
                "Disponible immédiatement après la consultation",
                "Valable dans toutes les pharmacies partenaires"
            ],
            action: "Voir mes ordonnances"
        },
        "appointment": {
            title: "Prise de rendez-vous",
            icon: Calendar,
            description: "Réservez votre consultation en quelques clics",
            details: [
                "Large choix de créneaux horaires",
                "Rappels automatiques par SMS/Email",
                "Gestion facile des annulations",
                "Synchronisation avec votre calendrier"
            ],
            action: "Prendre rendez-vous"
        },
        "ecarnet": {
            title: "Mon E-Carnet de Santé",
            icon: FileText,
            description: "Votre dossier médical numérique sécurisé",
            details: [
                "Historique complet des consultations",
                "Ordonnances et résultats d'analyses",
                "Accessible par ID unique sécurisé",
                "Partageable avec vos médecins"
            ],
            action: "Accéder à mon carnet"
        },
        "home": {
            title: "Visite à Domicile",
            icon: Home,
            description: "Un médecin se déplace chez vous pour une consultation",
            details: [
                "Disponible 24h/24 et 7j/7",
                "Arrivée du médecin en moins d'une heure",
                "Équipement complet pour les premiers soins",
                "Couverture sur tout le grand Abidjan"
            ],
            action: "Commander une visite"
        }
    };

    const feature = features[featureId || "video"];

    if (!feature) {
        return (
            <div className="min-h-screen bg-background flex flex-col">
                <Header />
                <div className="flex-1 flex flex-col items-center justify-center p-4">
                    <h1 className="text-2xl font-bold mb-4">Fonctionnalité non trouvée</h1>
                    <Button onClick={() => navigate('/consultation')}>Retour</Button>
                </div>
                <Footer />
            </div>
        );
    }

    const handleAction = () => {
        if (featureId === 'chat') {
            setIsChatOpen(true);
        } else if (featureId === 'ecarnet') {
            navigate('/ecarnet');
        } else if (featureId === 'appointment') {
            setIsAppointmentOpen(true);
        } else {
            // Handle other actions or show a toast
            logger.log(`Action triggered for ${featureId}`);
        }
    };

    const Icon = feature.icon;

    return (
        <div className="min-h-screen bg-background flex flex-col">
            <Header />

            <main className="flex-1 py-12">
                <div className="container mx-auto px-4">
                    <div className="flex items-center gap-4 mb-8">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => navigate('/')}
                            className="flex items-center gap-2 hover:bg-primary/10"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            Retour à l'accueil
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => navigate('/consultation')}
                            className="flex items-center gap-2"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            Retour aux consultations
                        </Button>
                    </div>

                    <div className="max-w-4xl mx-auto">
                        <div className="text-center mb-12">
                            <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                                <Icon className="h-10 w-10 text-primary" />
                            </div>
                            <h1 className="text-4xl font-bold mb-4">{feature.title}</h1>
                            <p className="text-xl text-muted-foreground">{feature.description}</p>
                        </div>

                        <div className="grid md:grid-cols-2 gap-8 mb-12">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Avantages</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {feature.details.map((detail: string, index: number) => (
                                        <div key={index} className="flex items-start gap-3">
                                            <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                                            <span>{detail}</span>
                                        </div>
                                    ))}
                                </CardContent>
                            </Card>

                            <Card className="bg-gradient-to-br from-primary/5 to-secondary/5 border-primary/20">
                                <CardHeader>
                                    <CardTitle>Action rapide</CardTitle>
                                </CardHeader>
                                <CardContent className="flex flex-col items-center justify-center h-full min-h-[200px] space-y-6">
                                    <p className="text-center text-muted-foreground">
                                        Profitez de ce service dès maintenant
                                    </p>
                                    <Button size="lg" className="w-full sm:w-auto" onClick={handleAction}>
                                        {feature.action}
                                    </Button>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>
            </main>

            <Footer />

            <MedicalChatDialog
                isOpen={isChatOpen}
                onClose={() => setIsChatOpen(false)}
            />

            <AppointmentBookingDialog
                isOpen={isAppointmentOpen}
                onClose={() => setIsAppointmentOpen(false)}
            />
        </div>
    );
};

export default ConsultationFeaturePage;
