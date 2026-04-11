import { useState, useEffect } from 'react';
import { Card } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import { Video, Mic, Smartphone, Clock, ShieldCheck, MapPin } from "lucide-react";
import DNABackground from "./DNABackground";

interface VirtualWaitingRoomProps {
    doctorName: string;
    patientName?: string;
}

const VirtualWaitingRoom = ({ doctorName, patientName = "Mme. Touré" }: VirtualWaitingRoomProps) => {
    const [queuePosition, setQueuePosition] = useState(2);
    const [waitTime, setWaitTime] = useState(5);

    useEffect(() => {
        const timer = setInterval(() => {
            setWaitTime((prev) => {
                if (prev <= 1) return 1;
                return prev - 1;
            });
        }, 60000); // Reduce wait time every minute

        return () => clearInterval(timer);
    }, []);

    return (
        <div className="relative h-full flex flex-col items-center justify-center p-6 overflow-hidden">
            {/* Background */}
            <DNABackground />
            <div className="absolute inset-0 bg-background/50 backdrop-blur-sm z-0" />

            <div className="relative z-10 w-full max-w-sm space-y-8 text-center animate-in fade-in zoom-in duration-500">

                {/* Status Badge */}
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-green-500/10 border border-green-500/20 backdrop-blur-md">
                    <span className="relative flex h-2.5 w-2.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500"></span>
                    </span>
                    <span className="text-sm font-medium text-green-600">En direct avec le cabinet</span>
                </div>

                {/* Doctor Info */}
                <div className="space-y-4">
                    <div className="relative mx-auto w-24 h-24">
                        <div className="absolute inset-0 rounded-full border-4 border-primary/20 animate-[spin_8s_linear_infinite]" />
                        <Avatar className="w-full h-full border-4 border-background shadow-xl">
                            <div className="bg-primary w-full h-full flex items-center justify-center text-white text-2xl font-bold">
                                {doctorName.split(' ').map(n => n[0]).join('')}
                            </div>
                        </Avatar>
                        <div className="absolute bottom-0 right-0 bg-green-500 w-6 h-6 rounded-full border-4 border-background flex items-center justify-center">
                            <Video className="w-3 h-3 text-white" />
                        </div>
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-foreground">{doctorName}</h3>
                        <p className="text-muted-foreground flex items-center justify-center gap-1.5">
                            <MapPin className="w-3.5 h-3.5" /> Cabinet Virtuel n°4
                        </p>
                    </div>
                </div>

                {/* Queue Info Card */}
                <Card className="bg-background/60 border-primary/10 shadow-lg backdrop-blur-md overflow-hidden">
                    <div className="grid grid-cols-2 divide-x divide-primary/5">
                        <div className="p-4 space-y-1">
                            <p className="text-xs text-muted-foreground uppercase tracking-wider">Position</p>
                            <p className="text-2xl font-bold text-primary">{queuePosition}e</p>
                        </div>
                        <div className="p-4 space-y-1">
                            <p className="text-xs text-muted-foreground uppercase tracking-wider">Attente est.</p>
                            <p className="text-2xl font-bold text-primary">{waitTime} min</p>
                        </div>
                    </div>
                    <div className="bg-primary/5 p-3 text-xs text-muted-foreground flex items-center justify-center gap-2">
                        <Clock className="w-3.5 h-3.5" />
                        Le médecin termine une consultation
                    </div>
                </Card>

                {/* Call Controls Preview (Disabled) */}
                <div className="flex justify-center gap-4 opacity-50 pointer-events-none grayscale">
                    <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                        <Mic className="w-5 h-5" />
                    </div>
                    <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                        <Video className="w-5 h-5" />
                    </div>
                    <div className="w-12 h-12 rounded-full bg-destructive/20 flex items-center justify-center">
                        <Smartphone className="w-5 h-5 text-destructive" />
                    </div>
                </div>

                <div className="text-xs text-muted-foreground flex items-center justify-center gap-1.5 pt-4">
                    <ShieldCheck className="w-3.5 h-3.5 text-primary" />
                    Connexion chiffrée de bout en bout
                </div>
            </div>
        </div>
    );
};

export default VirtualWaitingRoom;
