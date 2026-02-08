import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MessageCircle, Mic, MicOff, Volume2, LifeBuoy, X } from 'lucide-react';
import { Chatbot } from './chatbot/Chatbot';
import { useVoiceAssistant, PharmaGoCommands } from '@/lib/voiceAssistant';
import { useNavigate } from 'react-router-dom';

export const UnifiedSupport = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState<'none' | 'chat' | 'voice'>('none');
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    // Voice Logic
    const {
        isSupported,
        isListening,
        transcript,
        error: voiceError,
        startListening,
        stopListening,
        speak,
        registerCommand,
    } = useVoiceAssistant();

    // Register Voice Commands
    useState(() => {
        registerCommand(PharmaGoCommands.findPharmacy(navigate));
        registerCommand(PharmaGoCommands.trackOrder(navigate));
        registerCommand(PharmaGoCommands.viewCart(navigate));
        registerCommand(PharmaGoCommands.goHome(navigate));
    });

    const toggleVoice = () => {
        if (activeTab === 'voice') {
            setActiveTab('none');
            stopListening();
        } else {
            setActiveTab('voice');
            startListening();
            speak("Je vous écoute");
            setIsMenuOpen(false);
        }
    };

    const toggleChat = () => {
        if (activeTab === 'chat') {
            setActiveTab('none');
        } else {
            setActiveTab('chat');
            setIsMenuOpen(false);
            if (isListening) stopListening();
        }
    };

    const handleQuickCommand = (text: string, action: () => void) => {
        speak(text);
        setTimeout(action, 1000);
    };

    return (
        <div className="fixed bottom-4 right-4 z-50 flex flex-col items-end gap-2">

            {/* Active Content Panel */}
            {activeTab === 'chat' && (
                <div className="mb-2">
                    <Chatbot
                        isOpen={true}
                        isEmbedded={false}
                        onOpenChange={(open) => !open && setActiveTab('none')}
                    />
                </div>
            )}

            {activeTab === 'voice' && (
                <Card className="w-80 mb-2 shadow-xl border-primary/20 animate-in slide-in-from-bottom-5">
                    <CardHeader className="pb-3 flex flex-row items-center justify-between">
                        <CardTitle className="text-base flex items-center gap-2">
                            <Volume2 className="h-4 w-4 text-primary" />
                            Assistant Vocal
                        </CardTitle>
                        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setActiveTab('none')}>
                            <X className="h-3 w-3" />
                        </Button>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-2">
                            <Button variant="outline" size="sm" onClick={() => handleQuickCommand('Je cherche une pharmacie', () => navigate('/pharmacies'))}>
                                🏥 Pharmacies
                            </Button>
                            <Button variant="outline" size="sm" onClick={() => handleQuickCommand('Suivre ma commande', () => navigate('/suivi'))}>
                                📦 Suivi
                            </Button>
                        </div>

                        {transcript && (
                            <div className="bg-muted p-2 rounded text-sm italic">
                                "{transcript}"
                            </div>
                        )}

                        <Button
                            className={`w-full ${isListening ? 'animate-pulse bg-red-500 hover:bg-red-600' : ''}`}
                            onClick={() => isListening ? stopListening() : startListening()}
                        >
                            {isListening ? <><MicOff className="mr-2 h-4 w-4" /> Arrêter</> : <><Mic className="mr-2 h-4 w-4" /> Parler</>}
                        </Button>
                    </CardContent>
                </Card>
            )}

            {/* Floating Menu Buttons (Speed Dial) */}
            {isMenuOpen && (
                <div className="flex flex-col gap-3 items-center mb-2 animate-in slide-in-from-bottom-2 fade-in duration-300">
                    <Button
                        onClick={toggleVoice}
                        className="h-12 w-12 rounded-full shadow-lg bg-blue-600 hover:bg-blue-700"
                        size="icon"
                    >
                        <Mic className="h-5 w-5 text-white" />
                    </Button>
                    <Button
                        onClick={toggleChat}
                        className="h-12 w-12 rounded-full shadow-lg bg-purple-600 hover:bg-purple-700"
                        size="icon"
                    >
                        <MessageCircle className="h-5 w-5 text-white" />
                    </Button>
                </div>
            )}

            {/* Main Toggle Button */}
            <Button
                onClick={() => {
                    if (activeTab !== 'none' && !isMenuOpen) {
                        // If a tab is open, close it first? Or just toggle menu?
                        // Let's say main button toggles menu.
                        setIsMenuOpen(!isMenuOpen);
                    } else {
                        setIsMenuOpen(!isMenuOpen);
                    }
                }}
                className={`h-14 w-14 rounded-full shadow-xl transition-transform duration-300 ${isMenuOpen ? 'rotate-45' : ''}`}
                size="icon"
            >
                {activeTab !== 'none' && !isMenuOpen ? (
                    // If tab open and menu closed, show X to close everything? 
                    // Or just keep the menu toggle behavior.
                    // Let's use LifeBuoy as "Support" icon.
                    <X className="h-6 w-6" onClick={(e) => {
                        e.stopPropagation();
                        setActiveTab('none');
                    }} />
                ) : (
                    <LifeBuoy className="h-7 w-7" />
                )}
            </Button>
        </div>
    );
};
