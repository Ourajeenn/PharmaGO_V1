import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Phone, MessageSquare, MapPin, Navigation, Clock, CheckCircle2, User } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

const DeliveryTracking = () => {
    const navigate = useNavigate();
    const [status, setStatus] = useState(0);
    const steps = [
        { title: "En attente", time: "14:30" },
        { title: "Payée", time: "14:32" },
        { title: "Préparation", time: "14:35" },
        { title: "En livraison", time: "14:45" },
        { title: "Livrée", time: "15:10" }
    ];

    useEffect(() => {
        // Simulate progress
        const timer = setInterval(() => {
            setStatus(prev => (prev < 4 ? prev + 1 : prev));
        }, 5000);
        return () => clearInterval(timer);
    }, []);

    return (
        <div className="min-h-screen flex flex-col bg-slate-50">
            <Header />

            <main className="flex-1 container mx-auto px-4 py-8">
                <Button
                    variant="ghost"
                    onClick={() => navigate('/')}
                    className="flex items-center gap-2 mb-6 hover:bg-primary/10 transition-colors"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Retour à l'accueil
                </Button>
                <div className="grid lg:grid-cols-3 gap-8">
                    {/* Map Section */}
                    <div className="lg:col-span-2 space-y-6">
                        <Card className="h-[500px] overflow-hidden relative shadow-lg border-none rounded-2xl">
                            <div className="absolute inset-0 bg-slate-200 flex items-center justify-center">
                                {/* Placeholder for Map - In real app use Leaflet or Google Maps */}
                                <div className="text-center">
                                    <MapPin className="h-12 w-12 text-primary mx-auto mb-2 animate-bounce" />
                                    <p className="text-muted-foreground font-medium">Carte de suivi en temps réel</p>
                                    <p className="text-xs text-muted-foreground">(Simulation de la carte)</p>
                                </div>
                                <div className="absolute inset-0 bg-[url('https://upload.wikimedia.org/wikipedia/commons/e/ec/Abidjan_OpenStreetMap.png')] bg-cover opacity-50 mix-blend-multiply"></div>
                            </div>

                            {/* Floating Status Card */}
                            <div className="absolute bottom-6 left-6 right-6 bg-white/90 backdrop-blur-md p-4 rounded-xl shadow-lg border border-white/20">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-muted-foreground">Temps estimé</p>
                                        <p className="text-2xl font-bold text-primary flex items-center gap-2">
                                            <Clock className="h-5 w-5" />
                                            15 min
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm text-muted-foreground">Distance</p>
                                        <p className="text-xl font-semibold">2.4 km</p>
                                    </div>
                                </div>
                            </div>
                        </Card>
                    </div>

                    {/* Info Section */}
                    <div className="space-y-6">
                        {/* Driver Card */}
                        <Card className="border-none shadow-md rounded-2xl overflow-hidden">
                            <CardHeader className="bg-primary/5 pb-4">
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <Navigation className="h-5 w-5 text-primary" />
                                    Information Livreur
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="pt-6">
                                <div className="flex items-center gap-4 mb-6">
                                    <div className="h-16 w-16 bg-slate-100 rounded-full overflow-hidden border-2 border-white shadow-sm flex items-center justify-center">
                                        <User className="h-8 w-8 text-slate-400" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-lg">Moussa Koné</h3>
                                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                            <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                                                ★ 4.9
                                            </Badge>
                                            <span>• 124 Courses</span>
                                        </div>
                                        <p className="text-xs text-muted-foreground mt-1">Moto Yamaha • AB-123-CD</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <Button className="w-full" variant="outline">
                                        <MessageSquare className="h-4 w-4 mr-2" />
                                        Message
                                    </Button>
                                    <Button className="w-full bg-green-600 hover:bg-green-700 text-white">
                                        <Phone className="h-4 w-4 mr-2" />
                                        Appeler
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Order Progress */}
                        <Card className="border-none shadow-md rounded-2xl">
                            <CardHeader>
                                <CardTitle className="text-lg">État de la commande</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-6 relative before:absolute before:left-[15px] before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-100">
                                    {steps.map((step, index) => (
                                        <div key={index} className="relative flex items-center gap-4">
                                            <div className={`z-10 w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all duration-500 ${index <= status
                                                ? 'bg-primary border-primary text-primary-foreground scale-110'
                                                : 'bg-white border-slate-200 text-slate-300'
                                                }`}>
                                                {index <= status ? <CheckCircle2 className="h-4 w-4" /> : <div className="h-2 w-2 rounded-full bg-slate-200" />}
                                            </div>
                                            <div className="flex-1">
                                                <p className={`font-medium transition-colors ${index <= status ? 'text-foreground' : 'text-muted-foreground'}`}>
                                                    {step.title}
                                                </p>
                                                <p className="text-xs text-muted-foreground">{step.time}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Proof of Delivery (Epic 3 - DELIV-03) */}
                        {status >= 4 && (
                            <Card className="border-green-200 bg-green-50/50 shadow-sm rounded-2xl animate-in fade-in slide-in-from-bottom-4 duration-700">
                                <CardHeader className="pb-2">
                                    <div className="flex items-center gap-2 text-green-700">
                                        <CheckCircle2 className="h-5 w-5" />
                                        <CardTitle className="text-lg">Preuve de Livraison</CardTitle>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        <div className="aspect-video bg-slate-200 rounded-lg flex items-center justify-center relative overflow-hidden group">
                                            <img
                                                src="https://images.unsplash.com/photo-1586769852044-692d6e3703f0?q=80&w=1000&auto=format&fit=crop"
                                                alt="Colis livré"
                                                className="absolute inset-0 w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-500"
                                            />
                                            <div className="absolute bottom-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded">
                                                {new Date().toLocaleTimeString()}
                                            </div>
                                        </div>
                                        <div className="bg-white p-3 rounded-lg border border-slate-100">
                                            <p className="text-xs text-muted-foreground mb-1">Signature du client</p>
                                            <div className="h-12 border-b-2 border-slate-100 font-handwriting text-2xl text-slate-600 flex items-end px-2 italic">
                                                Reçu par Client
                                            </div>
                                        </div>
                                        <div className="text-sm text-slate-600 italic">
                                            "Colis déposé à l'accueil comme convenu."
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default DeliveryTracking;
