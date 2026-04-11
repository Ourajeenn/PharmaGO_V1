import { useState, useEffect } from 'react';
import Header from '@/components/core/Header';
import Footer from '@/components/core/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Phone, MessageSquare, MapPin, Navigation, Clock, CheckCircle2, User, Star } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { usePushNotifications } from '@/hooks/usePushNotifications';
import ReviewDialog from '@/components/reviews/ReviewDialog';
import { calculateOptimalRoute } from '@/services/stockRoutingService';

const DeliveryTracking = () => {
    const navigate = useNavigate();
    const [status, setStatus] = useState(0);
    const [progress, setProgress] = useState(0); // 0 to 1
    const [estimatedTime, setEstimatedTime] = useState(15);
    const [distance, setDistance] = useState(2.4);
    const { notify } = usePushNotifications();
    const [hasNotifiedProximity, setHasNotifiedProximity] = useState(false);
    const [reviewOpen, setReviewOpen] = useState(false);

    // Mock an order requiring multiple pharmacies
    const userLoc = { latitude: 5.3364, longitude: -4.0267 }; // Plateau
    const driverLoc = { latitude: 5.3033, longitude: -3.9877 }; // Marcory
    const items = [
        { itemId: "doli-1000", quantity: 2 },
        { itemId: "amox-500", quantity: 1 }
    ];

    // We compute the optimal TSP route on load to show multi-pharmacy logistics
    const [routingStats, setRoutingStats] = useState({ distance: 2.4, time: 15, stops: [] as any[] });

    useEffect(() => {
        const route = calculateOptimalRoute(userLoc, driverLoc, items);
        setRoutingStats({
            distance: Number((route.totalDistance / 1000).toFixed(1)),
            time: route.estimatedTimeParams.travelMins + route.estimatedTimeParams.baseHandlingMins,
            stops: route.stops
        });
        setDistance(Number((route.totalDistance / 1000).toFixed(1)));
        setEstimatedTime(route.estimatedTimeParams.travelMins + route.estimatedTimeParams.baseHandlingMins);
    }, []);

    const dynamicSteps = [
        { title: "En attente", time: "14:30" },
        { title: "Payée", time: "14:32" },
        { title: `Préparation (${routingStats.stops.length} pharmacies)`, time: "14:35" },
        ...routingStats.stops.map((stop, i) => ({
            title: `Collecte ${i + 1}: ${stop.pharmacyName}`,
            time: `14:${40 + (i * 5)}`
        })),
        { title: "En route vers vous", time: "15:00" },
        { title: "Livrée", time: "15:15" }
    ];

    useEffect(() => {
        // Step progress simulation
        const timer = setInterval(() => {
            setStatus(prev => {
                if (prev < 4) return prev + 1;
                return prev;
            });
        }, 8000);
        return () => clearInterval(timer);
    }, []);

    useEffect(() => {
        // Location simulation when status is "En livraison" (3)
        if (status !== 3) return;

        const moveTimer = setInterval(() => {
            setProgress(prev => {
                const next = Math.min(prev + 0.01, 1);

                // Update dynamic info
                const remainingDistance = Math.max(0, 2.4 * (1 - next));
                const remainingTime = Math.ceil(15 * (1 - next));

                setDistance(Number(remainingDistance.toFixed(1)));
                setEstimatedTime(remainingTime);

                // Proximity Alert at 0.5km (approx 80% progress)
                if (remainingDistance < 0.5 && !hasNotifiedProximity && routingStats.distance > 0) {
                    notify('nearbyDelivery', 2, 'CMD-872');
                    setHasNotifiedProximity(true);
                }

                if (next >= 1) {
                    setTimeout(() => setStatus(4), 2000);
                    return 1;
                }
                return next;
            });
        }, 1000);

        return () => clearInterval(moveTimer);
    }, [status, hasNotifiedProximity, notify]);

    // Calculate marker position (Plateau to Cocody simulation)
    const markerX = 40 + (progress * 40); // 40% to 80% width
    const markerY = 60 - (progress * 30); // 60% to 30% height

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
                                {/* Simulated Interactive Map */}
                                <div className="absolute inset-0 bg-[url('https://upload.wikimedia.org/wikipedia/commons/e/ec/Abidjan_OpenStreetMap.png')] bg-cover opacity-60 grayscale-[0.5]"></div>

                                {/* Path Overlay */}
                                <svg className="absolute inset-0 w-full h-full pointer-events-none">
                                    <path
                                        d="M 120,400 Q 300,350 450,250 T 800,150"
                                        fill="none"
                                        stroke="white"
                                        strokeWidth="8"
                                        strokeLinecap="round"
                                        className="opacity-40"
                                    />
                                    <path
                                        d="M 120,400 Q 300,350 450,250 T 800,150"
                                        fill="none"
                                        stroke="#f97316"
                                        strokeWidth="4"
                                        strokeLinecap="round"
                                        strokeDasharray="1000"
                                        strokeDashoffset={1000 - (progress * 1000)}
                                        className="transition-all duration-1000 ease-linear"
                                    />
                                </svg>

                                {/* User Home Marker */}
                                <div className="absolute top-[140px] right-[20%] z-10">
                                    <div className="relative">
                                        <div className="absolute -inset-4 bg-primary/20 rounded-full animate-ping" />
                                        <div className="bg-white p-2 rounded-full shadow-lg border-2 border-primary">
                                            <MapPin className="h-5 w-5 text-primary" />
                                        </div>
                                        <Badge className="absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap bg-slate-900">
                                            Destination
                                        </Badge>
                                    </div>
                                </div>

                                {/* Delivery Marker (Moto) */}
                                <div
                                    className="absolute transition-all duration-1000 ease-linear z-20"
                                    style={{
                                        left: `${markerX}%`,
                                        top: `${markerY}%`,
                                        transform: 'translate(-50%, -50%)'
                                    }}
                                >
                                    <div className="relative">
                                        <div className="bg-orange-500 p-2 rounded-full shadow-xl border-2 border-white text-white">
                                            <Navigation className="h-6 w-6 rotate-45" />
                                        </div>
                                        <div className="absolute top-1/2 left-full ml-3 -translate-y-1/2 bg-white px-3 py-1 rounded-full shadow-md border border-slate-100 whitespace-nowrap">
                                            <p className="text-[10px] font-black uppercase text-orange-600">Livreur en mouvement</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Floating Status Card */}
                            <div className="absolute bottom-6 left-6 right-6 bg-white/90 backdrop-blur-md p-6 rounded-2xl shadow-2xl border border-white/40">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-xs font-black uppercase tracking-widest text-muted-foreground mb-1">Temps estimé</p>
                                        <p className="text-3xl font-black text-primary flex items-center gap-2">
                                            <Clock className="h-6 w-6" />
                                            {estimatedTime} <span className="text-lg font-bold">min</span>
                                        </p>
                                    </div>
                                    <div className="h-12 w-[1px] bg-slate-200" />
                                    <div className="text-right">
                                        <p className="text-xs font-black uppercase tracking-widest text-muted-foreground mb-1">Distance</p>
                                        <p className="text-2xl font-black text-slate-900">{distance} <span className="text-lg font-bold">km</span></p>
                                    </div>
                                </div>
                            </div>
                        </Card>
                    </div>

                    {/* Info Section */}
                    <div className="space-y-6">
                        {/* Traffic Alert - Mocked */}
                        <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 animate-in slide-in-from-top-4 duration-700">
                            <div className="flex items-start gap-3">
                                <div className="bg-orange-100 p-2 rounded-full text-orange-600">
                                    <Clock className="h-5 w-5" />
                                </div>
                                <div className="flex-1">
                                    <h4 className="font-bold text-orange-900 text-sm mb-1">Trafic dense détecté</h4>
                                    <p className="text-xs text-orange-800 mb-3">
                                        Ralentissement sur Boulevard Latrille. Retard estimé : <span className="font-bold">+15 min</span>.
                                    </p>
                                    {status < 2 && (
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            className="bg-white border-orange-200 text-orange-700 hover:bg-orange-100 text-xs h-8"
                                            onClick={() => alert("Changement de mode : Votre commande sera préparée pour le retrait au comptoir de garde.")}
                                        >
                                            Switch to Click & Collect (Free)
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Driver Card */}
                        <Card className="border-none shadow-md rounded-2xl overflow-hidden mt-6">
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
                                    <Button
                                        className="w-full bg-[#25D366] hover:bg-[#128C7E] text-white border-none"
                                        variant="outline"
                                        onClick={() => window.open("https://wa.me/22507070707?text=Bonjour, je suis le client de la commande...", "_blank")}
                                    >
                                        <MessageSquare className="h-4 w-4 mr-2" />
                                        WhatsApp
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
                                    {dynamicSteps.map((step, index) => {
                                        // Align status with dynamic steps length
                                        const isActive = index <= (status === 4 ? dynamicSteps.length - 1 : status * (dynamicSteps.length / 5));

                                        return (
                                            <div key={index} className="relative flex items-center gap-4">
                                                <div className={`z-10 w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all duration-500 ${isActive
                                                    ? 'bg-primary border-primary text-primary-foreground scale-110'
                                                    : 'bg-white border-slate-200 text-slate-300'
                                                    }`}>
                                                    {isActive ? <CheckCircle2 className="h-4 w-4" /> : <div className="h-2 w-2 rounded-full bg-slate-200" />}
                                                </div>
                                                <div className="flex-1">
                                                    <p className={`font-medium transition-colors ${isActive ? 'text-foreground' : 'text-muted-foreground'}`}>
                                                        {step.title}
                                                    </p>
                                                    <p className="text-xs text-muted-foreground">{step.time}</p>
                                                </div>
                                            </div>
                                        )
                                    })}
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
                                        <div className="flex flex-col gap-3">
                                            <Button
                                                onClick={() => setReviewOpen(true)}
                                                className="w-full bg-primary hover:bg-primary-hover text-white font-bold"
                                            >
                                                <Star className="h-4 w-4 mr-2" />
                                                Laisser un avis (Pharmacie & Livreur)
                                            </Button>

                                            <div className="bg-white p-3 rounded-lg border border-slate-100">
                                                <p className="text-xs text-muted-foreground mb-1">Signature du client</p>
                                                <div className="h-12 border-b-2 border-slate-100 font-handwriting text-2xl text-slate-600 flex items-end px-2 italic">
                                                    Reçu par Client
                                                </div>
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

            <ReviewDialog
                isOpen={reviewOpen}
                onClose={() => setReviewOpen(false)}
                targetName="Pharmacie de Garde"
                targetType="pharmacy"
                orderId="CMD-872"
            />
            <Footer />
        </div>
    );
};

export default DeliveryTracking;
