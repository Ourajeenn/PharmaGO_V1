import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Siren, Clock, MapPin, Bike, CheckCircle2, Navigation, AlertTriangle } from 'lucide-react';

const EmergencyDialog = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [product, setProduct] = useState<any>(null);
    const [step, setStep] = useState(0); // 0: Dispatching, 1: En Route, 2: Arriving
    const [timeLeft, setTimeLeft] = useState(15 * 60); // 15 mins in seconds
    const [driverFound, setDriverFound] = useState(false);
    const [searchRadius, setSearchRadius] = useState(500); // 500m

    useEffect(() => {
        const handleEmergency = (e: any) => {
            setProduct(e.detail.product);
            setIsOpen(true);
            setStep(0);
            setDriverFound(false);
            setSearchRadius(500);
            setTimeLeft(15 * 60);
        };

        window.addEventListener('TRIGGER_EMERGENCY', handleEmergency);
        return () => window.removeEventListener('TRIGGER_EMERGENCY', handleEmergency);
    }, []);

    useEffect(() => {
        if (!isOpen) return;

        // Driver search simulation
        if (!driverFound) {
            const searchTimer = setInterval(() => {
                setSearchRadius(prev => {
                    if (prev >= 2000) {
                        setDriverFound(true);
                        setStep(1);
                        clearInterval(searchTimer);
                        return prev;
                    }
                    return prev + 500;
                });
            }, 1500); // Expanding radius every 1.5 seconds for demo
            return () => clearInterval(searchTimer);
        }

        // Countdown timer simulation
        const countdownTimer = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 0) {
                    setStep(2);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(countdownTimer);
    }, [isOpen, driverFound]);

    const formatTime = (seconds: number) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    if (!isOpen || !product) return null;

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogContent className="sm:max-w-[450px] bg-red-50/90 border-red-200">
                <DialogHeader>
                    <div className="mx-auto bg-red-100 p-3 rounded-full mb-4 animate-pulse">
                        <Siren className="h-8 w-8 text-red-600" />
                    </div>
                    <DialogTitle className="text-center text-2xl font-black text-red-700">
                        MODE URGENCE VITALE
                    </DialogTitle>
                    <DialogDescription className="text-center font-medium text-red-900/80">
                        {product.name}
                    </DialogDescription>
                </DialogHeader>

                <div className="py-6 space-y-6">
                    {/* Search Step */}
                    {!driverFound && (
                        <div className="text-center space-y-4">
                            <div className="relative h-32 w-32 mx-auto flex items-center justify-center">
                                <div className="absolute inset-0 border-4 border-red-500 rounded-full animate-ping opacity-20" />
                                <div className="absolute inset-4 border-4 border-red-500 rounded-full animate-ping opacity-40 animation-delay-500" />
                                <MapPin className="h-10 w-10 text-red-600 relative z-10" />
                            </div>
                            <h3 className="font-bold text-red-800 text-lg">Broadcast aux livreurs...</h3>
                            <p className="text-sm text-red-700">
                                Recherche dans un rayon de <span className="font-bold">{searchRadius}m</span>
                            </p>
                            <Progress value={(searchRadius / 2000) * 100} className="h-2 bg-red-200 [&>div]:bg-red-600" />
                            <p className="text-xs text-red-600 italic">
                                La pharmacie est alertée par alarme sonore et dispose de 3 min pour préparer le colis.
                            </p>
                        </div>
                    )}

                    {/* Tracking Step */}
                    {driverFound && step === 1 && (
                        <div className="space-y-6">
                            <div className="bg-red-600 text-white rounded-xl p-6 text-center shadow-lg relative overflow-hidden">
                                <div className="absolute top-0 left-0 w-full h-1 bg-white/30 animate-[scan_2s_ease-in-out_infinite]" />
                                <Clock className="h-8 w-8 mx-auto mb-2 opacity-80" />
                                <p className="text-sm font-medium uppercase tracking-widest opacity-90 mb-1">
                                    Arrivée estimée dans
                                </p>
                                <div className="text-5xl font-black tabular-nums tracking-tight">
                                    {formatTime(timeLeft)}
                                </div>
                            </div>

                            <div className="bg-white rounded-xl p-4 shadow-sm border border-red-100">
                                <div className="flex items-center gap-4">
                                    <div className="h-12 w-12 bg-slate-100 rounded-full flex items-center justify-center border-2 border-red-100">
                                        <Bike className="h-6 w-6 text-slate-500" />
                                    </div>
                                    <div className="flex-1">
                                        <h4 className="font-bold text-slate-900">Livreur assigné</h4>
                                        <p className="text-sm text-slate-500">Ibrahim D. (★ 4.9)</p>
                                    </div>
                                    <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                                        PRIORITÉ 1
                                    </Badge>
                                </div>
                            </div>

                            <div className="bg-orange-50 p-3 rounded-lg border border-orange-200 flex gap-3 text-sm text-orange-800">
                                <AlertTriangle className="h-5 w-5 shrink-0" />
                                <p>Un surcoût de 1000 FCFA est appliqué pour garantir la livraison en moins de 15 minutes.</p>
                            </div>
                        </div>
                    )}

                    {/* Arrival Step */}
                    {step === 2 && (
                        <div className="text-center space-y-4 animate-in zoom-in duration-500">
                            <div className="mx-auto bg-green-100 p-4 rounded-full w-fit">
                                <CheckCircle2 className="h-12 w-12 text-green-600" />
                            </div>
                            <h3 className="font-black text-2xl text-slate-900">Livreur Arrivé !</h3>
                            <p className="text-slate-600">
                                Ibrahim est devant votre position. Merci de récupérer votre {product.name}.
                            </p>
                        </div>
                    )}
                </div>

                <div className="flex justify-center -mb-2">
                    <Button
                        variant="ghost"
                        onClick={() => setIsOpen(false)}
                        className="text-red-700 hover:text-red-900 hover:bg-red-200/50"
                    >
                        Fermer le mode urgence
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default EmergencyDialog;
