
import { useState, useRef, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Bot, User, Send, X, AlertTriangle, ThumbsUp, ThumbsDown, Mic, MicOff, Volume2, MessageCircle, Minimize2, Maximize2, Trash2, WifiOff } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useHealthAI } from "@/hooks/useHealthAI";
import { useECarnet } from "@/contexts/ECarnetContext";
import { useVoiceAssistant } from "@/lib/voiceAssistant";
import { supabase } from "@/lib/supabase";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useCart } from "@/contexts/CartContext";
import { ShoppingCart } from "lucide-react";
// ── Constants ────────────────────────────────────────────────
const CHAT_STORAGE_KEY = 'pharmago_leslie_history';
const MAX_STORED_MESSAGES = 50;
const EDGE_FUNCTION_TIMEOUT_MS = 3500;

interface Message {
    id: string;
    role: "bot" | "user";
    content: string;
    timestamp: Date;
    hasFeedback?: boolean;
    isOffline?: boolean;
}

interface AIHealthAssistantProps {
    isFloating?: boolean;
    onClose?: () => void;
}

// ── Helper: load messages from localStorage ──────────────────
const loadStoredMessages = (): Message[] => {
    try {
        const stored = localStorage.getItem(CHAT_STORAGE_KEY);
        if (stored) {
            const parsed = JSON.parse(stored);
            return parsed.map((m: any) => ({ ...m, timestamp: new Date(m.timestamp) }));
        }
    } catch { /* ignore */ }
    return [];
};

// ── Helper: Clean text for speech synthesis ──────────────────
const cleanTextForSpeech = (text: string): string => {
    return text
        .replace(/\[ACTION:ADD_CART_.*?\]/g, '') // remove action flags
        .replace(/\[(.*?)\]\(.*?\)/g, '$1') // replace markdown links with just the text
        .replace(/[*_#~]/g, '') // remove markdown formatting chars
        .replace(/[📌🆘💊🙋‍♂️🙋‍♀️✅❌⚠️]/g, '') // remove emojis
        .replace(/;/g, ',') // replace semi-colons with comma for pacing
        .replace(/\n\n/g, '. ') // replace double new lines with periods
        .replace(/:/g, ','); // replace colons with commas
};

const getWelcomeMessage = (patientName?: string): Message => ({
    id: "1",
    role: "bot",
    content: patientName
        ? `Bonjour ${patientName} ! Je suis Leslie, votre assistant santé personnel PharmaGo. J'ai accès à votre carnet de santé pour mieux vous conseiller. Comment puis-je vous aider aujourd'hui ?`
        : "Bonjour ! Je suis Leslie, votre assistant santé intelligent PharmaGo. Je peux vous conseiller sur votre traitement, analyser vos mesures ou vous aider en cas d'urgence. Comment puis-je vous aider ?",
    timestamp: new Date()
});

export const AIHealthAssistant = ({ isFloating = false, onClose }: AIHealthAssistantProps) => {
    const { getLocalResponse, submitFeedback } = useHealthAI();
    const { currentPatient, getPatientSummary } = useECarnet();
    const { isListening, transcript, startListening, stopListening, speak, isSupported: isVoiceSupported } = useVoiceAssistant();
    const { profile } = useAuth();
    const navigate = useNavigate();
    const { addToCart } = useCart();

    const [isMinimized, setIsMinimized] = useState(isFloating ? true : false);
    const [conversationId, setConversationId] = useState<string | null>(null);
    const [isOnline, setIsOnline] = useState(navigator.onLine);
    const [chips, setChips] = useState<string[]>(["🆘 Urgence", "💊 Conseil Médicament", "🙋 Parler à un pharmacien"]);
    const [isHumanMode, setIsHumanMode] = useState(false);

    // Patient context for AI personalization
    const patientSummary = currentPatient ? getPatientSummary(currentPatient.id) : null;
    const patientContext = {
        name: currentPatient?.firstName || profile?.name,
        allergies: currentPatient?.allergies?.join(', '),
        metrics: patientSummary ? {
            blood_pressure: { value: "120/80" },
            glucose: { value: "0.95" },
            spO2: { value: "98" }
        } : undefined
    };

    // ── Messages state with localStorage persistence ─────────
    const [messages, setMessages] = useState<Message[]>(() => {
        const stored = loadStoredMessages();
        if (stored.length > 0) return stored;
        return [getWelcomeMessage(currentPatient?.firstName || profile?.name)];
    });
    const [input, setInput] = useState("");
    const [isTyping, setIsTyping] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    // ── Persist messages to localStorage ─────────────────────
    useEffect(() => {
        if (messages.length > 0) {
            try {
                const toStore = messages.slice(-MAX_STORED_MESSAGES);
                localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(toStore));
            } catch { /* quota exceeded — ignore */ }
        }
    }, [messages]);

    // ── Clear history ────────────────────────────────────────
    const clearHistory = () => {
        localStorage.removeItem(CHAT_STORAGE_KEY);
        setMessages([getWelcomeMessage(currentPatient?.firstName || profile?.name)]);
        setConversationId(null);
    };

    // ── Voice transcript sync ────────────────────────────────
    useEffect(() => {
        if (transcript) setInput(transcript);
    }, [transcript]);

    // ── Online/offline detection ─────────────────────────────
    useEffect(() => {
        const handleOnline = () => setIsOnline(true);
        const handleOffline = () => setIsOnline(false);
        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);
        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    // ── Auto-scroll ──────────────────────────────────────────
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [messages]);

    // ── Edge function call with timeout ──────────────────────
    const callEdgeFunction = useCallback(
        async (content: string): Promise<string | null> => {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), EDGE_FUNCTION_TIMEOUT_MS);

            try {
                const { data, error } = await supabase.functions.invoke('chat', {
                    body: {
                        message: content,
                        conversationId,
                        context: patientContext
                    },
                });

                clearTimeout(timeoutId);
                if (error) {
                    console.warn("Edge function error, falling back to local AI:", error);
                    return null;
                }

                if (data?.conversationId && !conversationId) {
                    setConversationId(data.conversationId);
                }
                return data?.message ?? null;
            } catch (err) {
                clearTimeout(timeoutId);
                console.error("Chat invocation failed:", err);
                return null;
            }
        },
        [conversationId, patientContext]
    );

    // ── Send message handler ─────────────────────────────────
    const handleSend = async (forcedInput?: string) => {
        const textToSend = forcedInput || input;
        if (!textToSend.trim()) return;

        const userMsg: Message = {
            id: Date.now().toString(),
            role: "user",
            content: textToSend,
            timestamp: new Date()
        };

        setMessages(prev => [...prev, userMsg]);
        setInput("");
        setIsTyping(true);

        let botContent = "";
        let isResponseOffline = false;

        const processAIAction = (action?: string) => {
            if (!action) return;
            setTimeout(() => {
                if (action === 'NAVIGATE_PHARMACY') navigate('/pharmacies');
                if (action === 'NAVIGATE_CONSULTATION') navigate('/consultation');
                if (action === 'NAVIGATE_CART') navigate('/cart');
                if (onClose) onClose();
            }, 3000); // Give user time to read the message before navigating
        };

        if (!isOnline) {
            // Offline — always use local AI
            const aiResp = getLocalResponse(textToSend, patientContext);
            botContent = aiResp.message;
            if (aiResp.suggestedChips) setChips(aiResp.suggestedChips);
            processAIAction(aiResp.action);
            isResponseOffline = true;
        } else {
            // Check for explicit "Human" request
            if (textToSend.toLowerCase().includes('pharmacien') || textToSend.toLowerCase().includes('humain')) {
                botContent = "Pas de problème. Je vous transfère immédiatement à un pharmacien diplômé de notre réseau de garde. Veuillez patienter un instant...";
                setIsHumanMode(true);
                setChips(["J'ai une ordonnance", "Renouveler mon traitement"]);
            }
            // Check for specific drug request to mock cart adding
            else if (textToSend.toLowerCase().includes('paracétamol') || textToSend.toLowerCase().includes('doliprane')) {
                botContent = "Biensûr. Le Doliprane 1000mg est en stock dans la pharmacie la plus proche. Voici l'article :\n\n[ACTION:ADD_CART_doli-1000_Doliprane 1000mg_1500_1]";
            }
            // Online — try edge function with timeout, fallback to local AI
            else {
                const edgeResponse = await callEdgeFunction(textToSend);
                if (edgeResponse) {
                    botContent = edgeResponse;
                } else {
                    const aiResp = getLocalResponse(textToSend, patientContext);
                    botContent = aiResp.message;
                    if (aiResp.suggestedChips) setChips(aiResp.suggestedChips);
                    processAIAction(aiResp.action);
                    isResponseOffline = true;
                }
            }
        }

        const botMsg: Message = {
            id: (Date.now() + 1).toString(),
            role: "bot",
            content: botContent,
            timestamp: new Date(),
            isOffline: isResponseOffline
        };

        setMessages(prev => [...prev, botMsg]);
        setIsTyping(false);
    };

    const handleFeedback = (msgId: string, score: number) => {
        setMessages(prev => prev.map(m => m.id === msgId ? { ...m, hasFeedback: true } : m));
        submitFeedback(score);
    };

    const toggleVoice = () => {
        if (isListening) stopListening();
        else startListening();
    };

    // ── Minimized floating button — Leslie Avatar ──────────────
    if (isFloating && !onClose && isMinimized) {
        return (
            <button
                onClick={() => setIsMinimized(false)}
                className="fixed bottom-[80px] md:bottom-6 right-4 md:right-6 h-12 w-12 md:h-16 md:w-16 rounded-full shadow-2xl hover:shadow-primary/30 hover:scale-110 transition-all duration-300 z-[9999] group cursor-pointer p-0 border-0 bg-transparent"
                aria-label="Ouvrir le chat Leslie"
            >
                <div className="relative w-full h-full">
                    <div className="absolute inset-0 rounded-full bg-gradient-to-br from-primary to-indigo-600 animate-pulse opacity-30 scale-125" />
                    <img
                        src="/leslie-official.png"
                        alt="Leslie - Assistant IA"
                        className="w-full h-full rounded-full object-cover border-[3px] border-white shadow-xl group-hover:border-primary transition-all"
                    />
                    <span className="absolute -top-0.5 -right-0.5 flex h-3 w-3 md:h-4 md:w-4">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 md:h-4 md:w-4 bg-emerald-500 border-2 border-white"></span>
                    </span>
                </div>
            </button>
        );
    }

    // ── Full chat panel ──────────────────────────────────────
    return (
        <Card className={`${isFloating ? "fixed bottom-0 md:bottom-6 right-0 md:right-6 w-full md:w-[380px] z-[9999] shadow-2xl rounded-t-2xl md:rounded-2xl border-x-0 border-b-0 md:border-x md:border-b" : "h-[600px] flex flex-col relative"} transition-all duration-300 ${isMinimized ? "h-0 overflow-hidden opacity-0 pointer-events-none" : "h-[85vh] md:h-[600px] opacity-100"} flex flex-col glass-card border-primary/20 overflow-hidden`}>
            {/* Decorative background elements */}
            <div className="absolute top-0 right-0 -m-16 w-64 h-64 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 -m-16 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

            <CardHeader className="bg-white/50 backdrop-blur-sm border-b border-white/20 z-10 px-4 py-3">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-2xl ${isHumanMode ? 'bg-gradient-to-br from-emerald-500 to-green-600' : 'bg-gradient-to-br from-primary to-blue-600'} flex items-center justify-center shadow-lg relative ${isTyping ? 'animate-pulse' : ''}`}>
                            {isHumanMode ? <User className="h-6 w-6 text-white" /> : <Bot className="h-6 w-6 text-white" />}
                            <div className={`absolute -bottom-1 -right-1 w-3.5 h-3.5 border-2 border-white rounded-full ${isOnline ? 'bg-green-500' : 'bg-orange-500'}`} />
                        </div>
                        <div>
                            <CardTitle className="text-lg font-black tracking-tight flex items-center gap-2 leading-none">
                                {isHumanMode ? 'Dr. Pharm' : 'Leslie'}
                                {isHumanMode ? (
                                    <Badge variant="secondary" className="bg-emerald-100 text-emerald-700 text-[9px] uppercase font-bold px-1.5 h-4">Humain</Badge>
                                ) : (
                                    <Badge variant="secondary" className="bg-blue-100 text-blue-700 text-[9px] uppercase font-bold px-1.5 h-4">IA Optimum</Badge>
                                )}
                            </CardTitle>
                            <CardDescription className="text-[10px] font-bold uppercase tracking-widest flex items-center gap-1">
                                {isOnline ? 'En ligne' : 'Mode Local'} {isHumanMode && '· Pharmacien de Garde'}
                            </CardDescription>
                        </div>
                    </div>

                    <div className="flex items-center gap-1">
                        {/* Clear history button */}
                        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full" onClick={clearHistory} title="Effacer l'historique">
                            <Trash2 className="h-4 w-4" />
                        </Button>
                        {isFloating && !onClose && (
                            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full" onClick={() => setIsMinimized(true)} title="Fermer le chat">
                                <X className="h-4 w-4" />
                            </Button>
                        )}
                        {onClose && (
                            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full" onClick={onClose} title="Fermer">
                                <X className="h-4 w-4" />
                            </Button>
                        )}
                    </div>
                </div>
            </CardHeader>

            {!isMinimized && (
                <>
                    <CardContent className="flex-1 overflow-hidden p-0 z-10">
                        <ScrollArea className="h-full p-4">
                            <div className="space-y-4">
                                {/* Quick Chips */}
                                <div className="flex flex-wrap gap-2 mb-4">
                                    {chips.map(chip => (
                                        <button
                                            key={chip}
                                            onClick={() => handleSend(chip)}
                                            className="text-[10px] font-black uppercase tracking-widest bg-white/80 border border-primary/10 px-3 py-1.5 rounded-full hover:bg-primary hover:text-white transition-all shadow-sm"
                                        >
                                            {chip}
                                        </button>
                                    ))}
                                </div>

                                <div className="flex justify-center my-4">
                                    <span className="text-[10px] text-muted-foreground bg-gray-100/50 px-3 py-1 rounded-full uppercase font-bold tracking-widest">Aujourd'hui</span>
                                </div>

                                {messages.map((msg) => (
                                    <div
                                        key={msg.id}
                                        className={`flex gap-3 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                                    >
                                        {msg.role === "bot" && (
                                            <Avatar className={`h-8 w-8 border-2 border-white shadow-sm shrink-0 ${isHumanMode && msg.id !== '1' ? 'bg-emerald-100' : ''}`}>
                                                {isHumanMode && msg.id !== '1' ? (
                                                    <AvatarFallback className="bg-emerald-500 text-white"><User className="h-4 w-4" /></AvatarFallback>
                                                ) : (
                                                    <>
                                                        <AvatarImage src="/leslie-official.png" />
                                                        <AvatarFallback className="bg-primary text-white"><Bot className="h-4 w-4" /></AvatarFallback>
                                                    </>
                                                )}
                                            </Avatar>
                                        )}

                                        <div className={`max-w-[85%] rounded-[1.5rem] p-4 shadow-sm ${msg.role === "user"
                                            ? "bg-primary text-primary-foreground rounded-tr-none"
                                            : "bg-white text-foreground rounded-tl-none border border-primary/5"
                                            }`}>

                                            {/* Normal text content */}
                                            <div
                                                className="text-sm leading-relaxed"
                                                dangerouslySetInnerHTML={{
                                                    __html: msg.content
                                                        .replace(/\[ACTION:ADD_CART_.*?\]/g, '') // Remove action flag from text
                                                        .replace(/\*\*(.*?)\*\*/g, '<strong class="font-extrabold text-blue-900">$1</strong>')
                                                        .replace(/\n/g, '<br/>')
                                                        .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" class="underline font-bold text-blue-600 hover:text-blue-800 transition-colors">$1</a>')
                                                }}
                                            />

                                            {/* Parsed Action Button Component */}
                                            {msg.content.includes('[ACTION:ADD_CART') && (() => {
                                                const match = msg.content.match(/\[ACTION:ADD_CART_(.*?)_(.*?)_(\d+)_(.*?)\]/);
                                                if (!match) return null;
                                                const [_, id, name, price, qty] = match;
                                                return (
                                                    <div className="mt-3 bg-emerald-50 rounded-xl p-3 border border-emerald-100 text-center">
                                                        <p className="font-bold text-slate-800 mb-2">{name} • {price} FCFA</p>
                                                        <Button
                                                            size="sm"
                                                            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
                                                            onClick={() => addToCart({
                                                                medicine: { id, name, description: '', category: '', requires_prescription: false, dosage: '', form: '', manufacturer: '', generic_name: '', created_at: '', updated_at: '' },
                                                                quantity: parseInt(qty),
                                                                pharmacy_id: 'mock-pharmacy',
                                                                pharmacy_name: 'Pharmacie la plus proche',
                                                                price: parseInt(price)
                                                            })}
                                                        >
                                                            <ShoppingCart className="h-4 w-4 mr-2" />
                                                            Ajouter au panier
                                                        </Button>
                                                    </div>
                                                );
                                            })()}

                                            <div className="flex justify-between items-center mt-3 pt-2 border-t border-black/5">
                                                <div className="flex items-center gap-2">
                                                    <p className={`text-[9px] font-bold uppercase tracking-widest opacity-60 ${msg.role === "user" ? "text-primary-foreground" : "text-muted-foreground"}`}>
                                                        {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </p>
                                                    {msg.isOffline && <Badge className="text-[7px] bg-orange-100 text-orange-600 border-none scale-75 origin-left h-3 px-1">Local</Badge>}
                                                </div>

                                                <div className="flex items-center gap-3">
                                                    {msg.role === 'bot' && (
                                                        <button onClick={() => speak(cleanTextForSpeech(msg.content))} className="hover:text-primary transition-colors text-muted-foreground p-2 -m-2">
                                                            <Volume2 className="h-4 w-4" />
                                                        </button>
                                                    )}

                                                    {msg.role === 'bot' && !msg.hasFeedback && msg.id !== '1' && (
                                                        <div className="flex gap-2">
                                                            <button onClick={() => handleFeedback(msg.id, 5)} className="hover:text-green-600 transition-colors text-muted-foreground">
                                                                <ThumbsUp className="h-3.5 w-3.5" />
                                                            </button>
                                                            <button onClick={() => handleFeedback(msg.id, 1)} className="hover:text-red-600 transition-colors text-muted-foreground">
                                                                <ThumbsDown className="h-3.5 w-3.5" />
                                                            </button>
                                                        </div>
                                                    )}
                                                    {msg.hasFeedback && <span className="text-[9px] font-black text-green-600 uppercase tracking-tighter">Merci!</span>}
                                                </div>
                                            </div>
                                        </div>

                                        {msg.role === "user" && (
                                            <Avatar className="h-8 w-8 border-2 border-white shadow-sm shrink-0">
                                                <AvatarImage src="/user-avatar.png" />
                                                <AvatarFallback className="bg-slate-900 text-white"><User className="h-4 w-4" /></AvatarFallback>
                                            </Avatar>
                                        )}
                                    </div>
                                ))}

                                {isTyping && (
                                    <div className="flex gap-3 justify-start">
                                        <Avatar className="h-8 w-8 border-2 border-white shadow-sm shrink-0">
                                            <AvatarFallback className="bg-primary text-white"><Bot className="h-4 w-4" /></AvatarFallback>
                                        </Avatar>
                                        <div className="bg-white rounded-2xl rounded-tl-none p-4 border border-white/40 flex gap-1 items-center h-12">
                                            <span className="w-2 h-2 bg-primary/40 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                                            <span className="w-2 h-2 bg-primary/40 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                                            <span className="w-2 h-2 bg-primary/40 rounded-full animate-bounce"></span>
                                        </div>
                                    </div>
                                )}
                                <div ref={scrollRef} />
                            </div>
                        </ScrollArea>

                        {/* Disclaimer Banner */}
                        <div className="absolute bottom-2 left-2 right-2 bg-yellow-50/90 backdrop-blur border border-yellow-200 rounded-lg p-2 flex items-start gap-2 text-[10px] text-yellow-800 shadow-sm animate-in slide-in-from-bottom-2">
                            <AlertTriangle className="h-3 w-3 mt-0.5 text-yellow-600 flex-shrink-0" />
                            <p>Ceci est une IA. Les conseils fournis ne remplacent pas un avis médical professionnel. En cas d'urgence, contactez le 180 ou le 185.</p>
                        </div>
                    </CardContent>

                    <CardFooter className="bg-white/50 backdrop-blur-sm border-t border-white/20 p-4 z-10">
                        {/* Offline banner */}
                        {!isOnline && (
                            <div className="flex items-center gap-1.5 text-xs text-orange-600 bg-orange-50 rounded-lg px-3 py-1.5 mb-2 w-full">
                                <WifiOff className="h-3.5 w-3.5 flex-shrink-0" />
                                Mode hors-ligne — Leslie répond en local
                            </div>
                        )}
                        <form
                            className="flex w-full gap-2 relative items-center"
                            onSubmit={(e) => {
                                e.preventDefault();
                                handleSend();
                            }}
                        >
                            <div className="relative flex-1">
                                <Input
                                    placeholder={isListening ? "Je vous écoute..." : "Tapez ici..."}
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    className={`rounded-2xl border-white/40 bg-white/80 focus-visible:ring-primary h-12 pr-12 transition-all ${isListening ? 'ring-2 ring-red-500 border-transparent pulse-red' : ''}`}
                                />
                                <button
                                    type="button"
                                    onClick={toggleVoice}
                                    className={`absolute right-3 top-1/2 -translate-y-1/2 h-8 w-8 rounded-xl flex items-center justify-center transition-all ${isListening ? 'bg-red-500 text-white' : 'text-slate-400 hover:bg-slate-100'}`}
                                >
                                    {isListening ? <MicOff className="h-4 w-4" /> : <Mic className={`h-4 w-4 ${isVoiceSupported ? 'text-primary' : 'opacity-20'}`} />}
                                </button>
                            </div>
                            <Button type="submit" size="icon" className="rounded-2xl h-12 w-12 shadow-xl shadow-primary/25 bg-slate-900 hover:bg-primary transition-all shrink-0" disabled={(!input.trim() && !isListening) || isTyping}>
                                <Send className="h-5 w-5" />
                            </Button>
                        </form>
                    </CardFooter>
                </>
            )}
        </Card>
    );
};
