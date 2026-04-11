import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Mic, MicOff, Volume2 } from 'lucide-react';
import { useVoiceAssistant, PharmaGoCommands } from '@/lib/voiceAssistant';
import { useNavigate } from 'react-router-dom';

export const VoiceAssistant = () => {
    const navigate = useNavigate();
    const {
        isSupported,
        isListening,
        transcript,
        error,
        startListening,
        stopListening,
        speak,
        registerCommand,
    } = useVoiceAssistant();

    const [isOpen, setIsOpen] = useState(false);

    // Register commands
    useState(() => {
        registerCommand(PharmaGoCommands.findPharmacy(navigate));
        registerCommand(PharmaGoCommands.trackOrder(navigate));
        registerCommand(PharmaGoCommands.viewCart(navigate));
        registerCommand(PharmaGoCommands.goHome(navigate));
    });

    if (!isSupported) {
        return null;
    }

    const handleToggleListening = () => {
        if (isListening) {
            stopListening();
        } else {
            startListening();
            speak('Je vous écoute');
        }
    };

    const handleQuickCommand = (text: string, action: () => void) => {
        speak(text);
        setTimeout(action, 1000);
    };

    return (
        <div className="fixed bottom-20 right-4 z-50">
            {isOpen && (
                <Card className="w-80 mb-4 shadow-lg">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-base flex items-center gap-2">
                            <Volume2 className="h-4 w-4" />
                            Assistant vocal
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <div className="space-y-2">
                            <p className="text-xs text-muted-foreground">Commandes rapides:</p>
                            <div className="grid grid-cols-2 gap-2">
                                <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() =>
                                        handleQuickCommand('Je vous emmène aux pharmacies', () =>
                                            navigate('/pharmacies')
                                        )
                                    }
                                    className="text-xs h-auto py-2"
                                >
                                    Pharmacies
                                </Button>
                                <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() =>
                                        handleQuickCommand('Voici le suivi de vos commandes', () =>
                                            navigate('/suivi')
                                        )
                                    }
                                    className="text-xs h-auto py-2"
                                >
                                    Suivi
                                </Button>
                                <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() =>
                                        handleQuickCommand('Je vous emmène aux médicaments', () =>
                                            navigate('/medicaments')
                                        )
                                    }
                                    className="text-xs h-auto py-2"
                                >
                                    Médicaments
                                </Button>
                                <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() =>
                                        handleQuickCommand('Retour à l\'accueil', () => navigate('/'))
                                    }
                                    className="text-xs h-auto py-2"
                                >
                                    Accueil
                                </Button>
                            </div>
                        </div>

                        {transcript && (
                            <div className="bg-secondary/20 p-2 rounded text-sm">
                                <p className="text-xs text-muted-foreground mb-1">Vous avez dit:</p>
                                <p className="font-medium">{transcript}</p>
                            </div>
                        )}

                        {error && (
                            <div className="bg-destructive/10 p-2 rounded text-sm text-destructive">
                                {error}
                            </div>
                        )}

                        <Button
                            onClick={handleToggleListening}
                            className="w-full"
                            variant={isListening ? 'destructive' : 'default'}
                        >
                            {isListening ? (
                                <>
                                    <MicOff className="h-4 w-4 mr-2" />
                                    Arrêter
                                </>
                            ) : (
                                <>
                                    <Mic className="h-4 w-4 mr-2" />
                                    Parler
                                </>
                            )}
                        </Button>
                    </CardContent>
                </Card>
            )}

            <Button
                onClick={() => setIsOpen(!isOpen)}
                size="lg"
                className="rounded-full h-14 w-14 shadow-lg"
                variant={isListening ? 'destructive' : 'default'}
            >
                {isListening ? (
                    <MicOff className="h-6 w-6 animate-pulse" />
                ) : (
                    <Mic className="h-6 w-6" />
                )}
            </Button>
        </div>
    );
};
