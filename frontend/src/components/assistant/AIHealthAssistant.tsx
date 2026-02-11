
import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Bot, User, Send, X, RefreshCw, AlertTriangle, Sparkles } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

interface Message {
    id: string;
    role: "bot" | "user";
    content: string;
    timestamp: Date;
}

export const AIHealthAssistant = () => {
    const [messages, setMessages] = useState<Message[]>([
        {
            id: "1",
            role: "bot",
            content: "Bonjour ! Je suis PharmaBot, votre assistant santé intelligent. Je peux vous aider à identifier des symptômes bénins ou à trouver une pharmacie. Comment puis-je vous aider aujourd'hui ?",
            timestamp: new Date()
        }
    ]);
    const [input, setInput] = useState("");
    const [isTyping, setIsTyping] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [messages]);

    const handleSend = async () => {
        if (!input.trim()) return;

        const userMsg: Message = {
            id: Date.now().toString(),
            role: "user",
            content: input,
            timestamp: new Date()
        };

        setMessages(prev => [...prev, userMsg]);
        setInput("");
        setIsTyping(true);

        // Simulate AI processing
        setTimeout(() => {
            const botResponse = generateResponse(userMsg.content);
            const botMsg: Message = {
                id: (Date.now() + 1).toString(),
                role: "bot",
                content: botResponse,
                timestamp: new Date()
            };
            setMessages(prev => [...prev, botMsg]);
            setIsTyping(false);
        }, 1500);
    };

    const generateResponse = (text: string): string => {
        const lowerText = text.toLowerCase();

        if (lowerText.includes("tête") || lowerText.includes("migraine")) {
            return "Pour les maux de tête, le repos et l'hydratation sont recommandés. Si la douleur persiste, le Paracétamol (Doliprane) est souvent efficace. Souhaitez-vous que je vérifie la disponibilité du Doliprane dans les pharmacies proches ?";
        }
        if (lowerText.includes("fièvre") || lowerText.includes("chaud")) {
            return "Une fièvre légère peut être traitée avec du repos et des antipyrétiques comme le Paracétamol. Si la fièvre dépasse 38.5°C ou dure plus de 3 jours, veuillez consulter un médecin immédiatement.";
        }
        if (lowerText.includes("ventre") || lowerText.includes("estomac")) {
            return "Les maux d'estomac peuvent avoir de nombreuses causes. Évitez les repas lourds. Le Spasfon peut aider en cas de spasmes. Si la douleur est intense, consultez un médecin.";
        }
        if (lowerText.includes("pharmacie")) {
            return "Vous pouvez consulter la carte des pharmacies dans l'onglet 'Pharmacies' pour trouver la plus proche de vous.";
        }

        return "Je comprends. Cependant, en tant qu'IA, je ne peux pas poser de diagnostic précis. Je vous recommande de consulter un médecin ou de vous rendre dans la pharmacie la plus proche pour un avis professionnel.";
    };

    return (
        <Card className="h-[600px] flex flex-col glass-card border-primary/20 shadow-2xl relative overflow-hidden">
            {/* Decorative background elements */}
            <div className="absolute top-0 right-0 -m-16 w-64 h-64 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 -m-16 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

            <CardHeader className="bg-white/50 backdrop-blur-sm border-b border-white/20 z-10">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center shadow-lg relative">
                        <Bot className="h-7 w-7 text-white" />
                        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full animate-pulse" />
                    </div>
                    <div>
                        <CardTitle className="text-xl font-black tracking-tight flex items-center gap-2">
                            PharmaBot <Badge variant="secondary" className="bg-blue-100 text-blue-700 text-[10px] uppercase font-bold"><Sparkles className="h-3 w-3 mr-1" /> IA Beta</Badge>
                        </CardTitle>
                        <CardDescription className="text-xs font-medium">Assistant Santé 24/7</CardDescription>
                    </div>
                </div>
            </CardHeader>

            <CardContent className="flex-1 overflow-hidden p-0 relative z-10">
                <ScrollArea className="h-full p-4">
                    <div className="space-y-4">
                        <div className="flex justify-center my-4">
                            <span className="text-[10px] text-muted-foreground bg-gray-100 px-3 py-1 rounded-full uppercase font-bold tracking-widest">Aujourd'hui</span>
                        </div>

                        {messages.map((msg) => (
                            <div
                                key={msg.id}
                                className={`flex gap-3 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                            >
                                {msg.role === "bot" && (
                                    <Avatar className="h-8 w-8 border-2 border-white shadow-sm">
                                        <AvatarImage src="/bot-avatar.png" />
                                        <AvatarFallback className="bg-primary text-white"><Bot className="h-4 w-4" /></AvatarFallback>
                                    </Avatar>
                                )}

                                <div className={`max-w-[80%] rounded-2xl p-4 shadow-sm ${msg.role === "user"
                                        ? "bg-primary text-primary-foreground rounded-tr-none"
                                        : "bg-white text-foreground rounded-tl-none border border-white/40"
                                    }`}>
                                    <p className="text-sm leading-relaxed">{msg.content}</p>
                                    <p className={`text-[10px] mt-1 opacity-70 ${msg.role === "user" ? "text-primary-foreground" : "text-muted-foreground"}`}>
                                        {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </p>
                                </div>

                                {msg.role === "user" && (
                                    <Avatar className="h-8 w-8 border-2 border-white shadow-sm">
                                        <AvatarImage src="/user-avatar.png" />
                                        <AvatarFallback className="bg-gray-200"><User className="h-4 w-4 text-gray-500" /></AvatarFallback>
                                    </Avatar>
                                )}
                            </div>
                        ))}

                        {isTyping && (
                            <div className="flex gap-3 justify-start">
                                <Avatar className="h-8 w-8 border-2 border-white shadow-sm">
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

            <CardFooter className="bg-white/50 backdrop-blur-sm border-t border-white/20 p-4 z-10 mt-10">
                <form
                    className="flex w-full gap-2"
                    onSubmit={(e) => {
                        e.preventDefault();
                        handleSend();
                    }}
                >
                    <Input
                        placeholder="Décrivez vos symptômes..."
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        className="rounded-xl border-white/40 bg-white/60 focus-visible:ring-primary h-11"
                    />
                    <Button type="submit" size="icon" className="rounded-xl h-11 w-11 shadow-lg shadow-primary/20 shrink-0" disabled={!input.trim()}>
                        <Send className="h-4 w-4" />
                    </Button>
                </form>
            </CardFooter>
        </Card>
    );
};
