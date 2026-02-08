
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Mic, MicOff } from "lucide-react";
import { toast } from "sonner";

export const VoiceCommandControl = () => {
    const [isListening, setIsListening] = useState(false);

    const toggleListening = () => {
        if (isListening) {
            setIsListening(false);
            toast.info("Commande vocale désactivée");
        } else {
            setIsListening(true);
            toast.success("Écoute activée...", {
                description: "Dites 'Pharmacies', 'Dossier', ou 'Aide'"
            });

            // Simulate voice recognition after 3 seconds
            setTimeout(() => {
                setIsListening(false);
                toast.info("Commande reconnue : 'Pharmacies'", {
                    description: "Navigation vers la carte..."
                });
                // In a real app, we would trigger navigation here
            }, 3000);
        }
    };

    return (
        <Button
            variant={isListening ? "destructive" : "outline"}
            size="icon"
            className={`rounded-full shadow-lg fixed bottom-24 right-6 z-50 h-14 w-14 transition-all duration-300 ${isListening ? "animate-pulse scale-110" : "bg-white/80 backdrop-blur border-primary/20 hover:scale-105"}`}
            onClick={toggleListening}
        >
            {isListening ? <MicOff className="h-6 w-6" /> : <Mic className="h-6 w-6 text-primary" />}
        </Button>
    );
};
