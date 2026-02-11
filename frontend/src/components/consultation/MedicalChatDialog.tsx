import { useState, useEffect, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Send, Bot, User, Loader2, Mic, MicOff, Volume2, VolumeX } from "lucide-react";
import { useVoiceAssistant } from "@/lib/voiceAssistant";
import VoiceVisualizer from "./VoiceVisualizer";
import DNABackground from "./DNABackground";
import VirtualWaitingRoom from "./VirtualWaitingRoom";

interface Message {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
}

interface MedicalChatDialogProps {
    isOpen: boolean;
    onClose: () => void;
}

const MedicalChatDialog = ({ isOpen, onClose }: MedicalChatDialogProps) => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [inputValue, setInputValue] = useState("");
    const [isTyping, setIsTyping] = useState(false);
    const [isSoundOn, setIsSoundOn] = useState(true);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [currentView, setCurrentView] = useState<'chat' | 'waiting-room'>('chat');
    const [assignedDoctor, setAssignedDoctor] = useState("");
    const scrollRef = useRef<HTMLDivElement>(null);

    const {
        isListening,
        transcript,
        startListening,
        stopListening,
        speak,
        isSupported
    } = useVoiceAssistant();

    // Update input when voice transcript changes
    useEffect(() => {
        if (transcript) {
            setInputValue(transcript);
        }
    }, [transcript]);

    useEffect(() => {
        if (isOpen && messages.length === 0) {
            // Initial greeting
            setIsTyping(true);
            const greeting = "Bonjour, je suis Leslie. J'espère que vous allez bien ? Comment puis-je rendre votre visite agréable ? Quel est le motif de votre consultation aujourd'hui ?";

            setTimeout(() => {
                addMessage('assistant', greeting);
                if (isSoundOn) handleSpeak(greeting);
                setIsTyping(false);
            }, 1500);
        }
    }, [isOpen]);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, isTyping]);

    const addMessage = (role: 'user' | 'assistant', content: string) => {
        const newMessage: Message = {
            id: Date.now().toString(),
            role,
            content,
            timestamp: new Date()
        };
        setMessages(prev => [...prev, newMessage]);
    };

    const handleSpeak = (text: string) => {
        speak(text);
        setIsSpeaking(true);
        // Estimate speech duration based on word count (approx 150 words/min = 2.5 words/sec)
        const wordCount = text.split(' ').length;
        const duration = Math.max(2000, (wordCount / 2.5) * 1000);

        setTimeout(() => {
            setIsSpeaking(false);
        }, duration);
    };

    const handleSend = () => {
        if (!inputValue.trim()) return;

        const userMessage = inputValue;
        addMessage('user', userMessage);
        setInputValue("");
        setIsTyping(true);

        // Simulate AI processing and response
        setTimeout(() => {
            let response = "";
            const lowerInput = userMessage.toLowerCase();

            // Analyze input for keywords to find specialty
            const specialties = {
                cardiology: {
                    keywords: ["cœur", "poitrine", "palpitations", "essoufflement", "tension"],
                    doctor: "Dr. Koné (Cardiologue)",
                    response: "D'accord, je comprends. Ces symptômes peuvent être angoissants, mais ne vous inquiétez pas, nous allons vérifier cela rapidement."
                },
                dermatology: {
                    keywords: ["peau", "bouton", "démangeaison", "rougeur", "tache"],
                    doctor: "Dr. Touré (Dermatologue)",
                    response: "Je vois. Ce genre de gêne cutanée peut être très inconfortable. Laissez-moi regarder qui est disponible pour vous soulager."
                },
                pediatrics: {
                    keywords: ["enfant", "bébé", "fièvre enfant", "toux enfant"],
                    doctor: "Dr. N'Dri (Pédiatre)",
                    response: "Oh, je comprends votre inquiétude pour votre enfant. C'est important d'agir vite avec les tout-petits."
                },
                ophthalmology: {
                    keywords: ["oeil", "yeux", "vision", "vue"],
                    doctor: "Dr. Bamba (Ophtalmologue)",
                    response: "Bien reçu. La vue est précieuse, vous faites bien de consulter rapidement pour ces gênes visuelles."
                },
                general: {
                    keywords: ["fièvre", "mal de tête", "fatigue", "grippe", "rhume", "ventre"],
                    doctor: "Dr. Kouassi (Généraliste)",
                    response: "Entendu. Vous ne semblez effectivement pas être au top de votre forme. Un bilan général nous aidera à y voir plus clair."
                }
            };

            let selectedSpecialty = null;
            for (const [_, data] of Object.entries(specialties)) {
                if (data.keywords.some(k => lowerInput.includes(k))) {
                    selectedSpecialty = data;
                    break;
                }
            }

            // Conversation Logic
            // If it's the first real exchange or we found a specialty match, provide initial feedback
            if (messages.length <= 2 && !selectedSpecialty && !messages.some(m => m.role === 'assistant' && m.content.includes("antécédents"))) {
                // Fallback if no keyword found and early in convo
                response = "Je vous écoute. Prenez votre temps pour me décrire ce que vous ressentez, afin que je puisse trouver le meilleur spécialiste pour vous.";
                addMessage('assistant', response);
                if (isSoundOn) handleSpeak(response);
            }
            else if (selectedSpecialty && messages.length <= 2) {
                // Specialty found early on
                response = `${selectedSpecialty.response} Je pense qu'une consultation avec ${selectedSpecialty.doctor} serait la plus adaptée. Est-ce que vous avez des antécédents particuliers à me signaler avant que je vous connecte ?`;
                addMessage('assistant', response);
                if (isSoundOn) handleSpeak(response);
            }
            else {
                // Autonomous Sequence: Check -> Return -> Transfer
                // This runs if:
                // 1. It's later in the conversation (user answered antecedents)
                // 2. OR user sends a 2nd message refining their symptoms

                response = "D'accord, je note toutes ces informations dans votre dossier pré-consultation. Laissez-moi juste vérifier les disponibilités des médecins en temps réel...";
                addMessage('assistant', response);
                if (isSoundOn) handleSpeak(response);

                // Determine doctor (scanning history including current input)
                const doctorName = selectedSpecialty?.doctor.split(' ')[1] || "Dr. Koné"; // Default or derived

                // More robust doctor detection from history if needed
                const historyText = [...messages, { role: 'user', content: lowerInput }].map(m => m.content.toLowerCase()).join(' ');

                let finalDoctor = "Dr. Kouassi";
                if (historyText.includes("cœur") || historyText.includes("cardiologue")) finalDoctor = "Dr. Koné";
                else if (historyText.includes("peau") || historyText.includes("dermatologue")) finalDoctor = "Dr. Touré";
                else if (historyText.includes("enfant") || historyText.includes("pédiatre")) finalDoctor = "Dr. N'Dri";
                else if (historyText.includes("yeux") || historyText.includes("ophtalmologue")) finalDoctor = "Dr. Bamba";

                // Simulated Delay for Check
                setTimeout(() => {
                    setAssignedDoctor(finalDoctor);
                    const returnMessage = `Je suis de retour. Bonne nouvelle, ${finalDoctor} est disponible immédiatement. Je vous accompagne vers sa salle d'attente virtuelle. Tout va bien se passer.`;

                    addMessage('assistant', returnMessage);
                    if (isSoundOn) handleSpeak(returnMessage);

                    // Final Transfer Delay
                    setTimeout(() => {
                        setCurrentView('waiting-room');
                        if (isSoundOn) speak("Transfert en cours.");
                    }, 6000); // 6s to read return message

                }, 4000); // 4s checking simulation
            }

            setIsTyping(false);
        }, 2000);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const toggleListening = () => {
        if (isListening) {
            stopListening();
        } else {
            startListening();
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-[500px] h-[600px] flex flex-col p-0 gap-0 overflow-hidden">
                {currentView === 'waiting-room' ? (
                    <VirtualWaitingRoom doctorName={assignedDoctor} />
                ) : (
                    <>
                        <DialogHeader className="p-4 border-b bg-primary/5">
                            <DialogTitle className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div className="bg-primary rounded-full z-10 relative overflow-hidden h-9 w-9 border-2 border-white shadow-sm">
                                        <img src="/leslie-avatar.png" alt="Leslie" className="h-full w-full object-cover" />
                                    </div>
                                    <div className="z-10 relative">
                                        <span className="font-bold">Leslie</span> (Assistant Médical IA)
                                        <span className="block text-xs font-normal text-muted-foreground">En ligne • Réponses instantanées</span>
                                    </div>
                                </div>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8"
                                    onClick={() => setIsSoundOn(!isSoundOn)}
                                >
                                    {isSoundOn ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
                                </Button>
                            </DialogTitle>
                        </DialogHeader>

                        <div className="flex-1 overflow-y-auto p-4 space-y-4 relative" ref={scrollRef}>
                            {/* Background Animation */}
                            <DNABackground />

                            {/* Content Layer */}
                            <div className="relative z-10 space-y-4">
                                {messages.map((message) => (
                                    <div
                                        key={message.id}
                                        className={`flex gap-3 ${message.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
                                    >
                                        <Avatar className="h-8 w-8 border border-primary/20">
                                            {message.role === 'assistant' ? (
                                                <>
                                                    <AvatarImage src="/leslie-avatar.png" />
                                                    <AvatarFallback className="bg-primary text-white">
                                                        <Bot className="h-4 w-4" />
                                                    </AvatarFallback>
                                                </>
                                            ) : (
                                                <div className="bg-secondary h-full w-full flex items-center justify-center">
                                                    <User className="h-5 w-5 text-white" />
                                                </div>
                                            )}
                                        </Avatar>
                                        <div
                                            className={`rounded-lg p-3 max-w-[80%] text-sm ${message.role === 'user'
                                                ? 'bg-primary text-primary-foreground'
                                                : 'bg-muted'
                                                }`}
                                        >
                                            {message.content}
                                            <div className={`text-[10px] mt-1 ${message.role === 'user' ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>
                                                {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {isTyping && (
                                <div className="flex gap-3">
                                    <Avatar className="h-8 w-8 border border-primary/20">
                                        <AvatarImage src="/leslie-avatar.png" />
                                        <AvatarFallback className="bg-primary text-white">
                                            <Bot className="h-4 w-4" />
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="bg-muted rounded-lg p-3 flex items-center gap-1">
                                        <span className="w-1.5 h-1.5 bg-foreground/40 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                                        <span className="w-1.5 h-1.5 bg-foreground/40 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                                        <span className="w-1.5 h-1.5 bg-foreground/40 rounded-full animate-bounce"></span>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="p-4 border-t bg-background/95 backdrop-blur-sm relative z-20">
                            {(isListening || isSpeaking) && (
                                <div className="absolute bottom-full left-0 right-0 h-24 bg-gradient-to-t from-background via-background/90 to-transparent flex items-end justify-center pb-2 pointer-events-none">
                                    <VoiceVisualizer isActive={true} />
                                </div>
                            )}
                            <div className="flex gap-2">
                                {isSupported && (
                                    <Button
                                        variant={isListening ? "destructive" : "outline"}
                                        size="icon"
                                        onClick={toggleListening}
                                        className={isListening ? "animate-pulse" : ""}
                                    >
                                        {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                                    </Button>
                                )}
                                <Input
                                    placeholder={isListening ? "Écoute en cours..." : "Écrivez votre message..."}
                                    value={inputValue}
                                    onChange={(e) => setInputValue(e.target.value)}
                                    onKeyDown={handleKeyDown}
                                    disabled={isTyping}
                                    className="flex-1"
                                />
                                <Button onClick={handleSend} disabled={!inputValue.trim() || isTyping} size="icon">
                                    {isTyping ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                                </Button>
                            </div>
                        </div>
                    </>
                )}
            </DialogContent>
        </Dialog >
    );
};

export default MedicalChatDialog;
