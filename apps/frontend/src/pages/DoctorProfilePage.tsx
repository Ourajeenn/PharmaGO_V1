import Header from "@/components/core/Header";
import Footer from "@/components/core/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Star, MapPin, Phone, Mail, Calendar, Clock, CheckCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

const DoctorProfilePage = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-background">
            <Header />

            <main className="container mx-auto px-4 py-8">
                <div className="max-w-4xl mx-auto">
                    <Button
                        variant="ghost"
                        onClick={() => navigate('/')}
                        className="flex items-center gap-2 mb-6 hover:bg-primary/10 transition-colors"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Retour à l'accueil
                    </Button>
                    <Card className="mb-8">
                        <CardContent className="p-6">
                            <div className="flex flex-col md:flex-row gap-6 items-start">
                                <Avatar className="h-32 w-32">
                                    <AvatarImage src="/placeholder-doctor.jpg" />
                                    <AvatarFallback className="text-4xl">DK</AvatarFallback>
                                </Avatar>

                                <div className="flex-1">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h1 className="text-3xl font-bold mb-2">Dr. Kouassi Jean</h1>
                                            <p className="text-xl text-primary font-medium mb-2">Médecin Généraliste</p>
                                            <div className="flex items-center gap-2 text-muted-foreground mb-4">
                                                <MapPin className="h-4 w-4" />
                                                <span>Cocody, Abidjan - Clinique des 2 Plateaux</span>
                                            </div>
                                        </div>
                                        <Badge className="bg-green-500 hover:bg-green-600">Disponible</Badge>
                                    </div>

                                    <div className="flex items-center gap-4 mb-6">
                                        <div className="flex items-center gap-1">
                                            <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                                            <span className="font-bold">4.9</span>
                                            <span className="text-muted-foreground">(124 avis)</span>
                                        </div>
                                        <div className="text-muted-foreground">|</div>
                                        <div className="text-muted-foreground">15 ans d'expérience</div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <Button className="w-full gap-2">
                                            <Calendar className="h-4 w-4" />
                                            Prendre rendez-vous
                                        </Button>
                                        <Button variant="outline" className="w-full gap-2">
                                            <MessageCircle className="h-4 w-4" />
                                            Envoyer un message
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="md:col-span-2 space-y-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle>À propos</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-muted-foreground leading-relaxed">
                                        Le Dr. Kouassi Jean est un médecin généraliste expérimenté, spécialisé dans le suivi des maladies chroniques et la médecine préventive.
                                        Diplômé de la Faculté de Médecine d'Abidjan, il exerce depuis plus de 15 ans avec une approche humaine et personnalisée.
                                    </p>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle>Spécialités & Services</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex flex-wrap gap-2">
                                        <Badge variant="secondary">Consultation générale</Badge>
                                        <Badge variant="secondary">Suivi pédiatrique</Badge>
                                        <Badge variant="secondary">Vaccination</Badge>
                                        <Badge variant="secondary">Certificats médicaux</Badge>
                                        <Badge variant="secondary">Urgences mineures</Badge>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        <div className="space-y-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Horaires</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-2 text-sm">
                                        <div className="flex justify-between">
                                            <span>Lundi - Vendredi</span>
                                            <span className="font-medium">08:00 - 18:00</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>Samedi</span>
                                            <span className="font-medium">09:00 - 13:00</span>
                                        </div>
                                        <div className="flex justify-between text-muted-foreground">
                                            <span>Dimanche</span>
                                            <span>Fermé</span>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle>Contact</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-3">
                                        <div className="flex items-center gap-3">
                                            <Phone className="h-4 w-4 text-primary" />
                                            <span>+225 01 02 03 04 05</span>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <Mail className="h-4 w-4 text-primary" />
                                            <span>dr.kouassi@pharmago.ci</span>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
};

import { MessageCircle } from "lucide-react";

export default DoctorProfilePage;
