import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import {
  MessageCircle,
  Send,
  X,
  Minimize2,
  Maximize2,
  User,
  WifiOff,
  Wifi
} from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useHealthAI } from '@/hooks/useHealthAI';
import { useAuth } from '@/hooks/useAuth';

interface ChatMessage {
  id: string;
  type: 'user' | 'bot';
  content: string;
  timestamp: Date;
  isOffline?: boolean;
}

interface ChatbotProps {
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  isEmbedded?: boolean;
}

const DEFAULT_CHIPS = [
  "📦 Suivre ma commande",
  "🏥 Pharmacie de garde",
  "💊 Conseil médicament",
  "🆘 Urgence médicale",
];

const EDGE_FUNCTION_TIMEOUT_MS = 3500;

export const Chatbot: React.FC<ChatbotProps> = ({
  isOpen: controlledIsOpen,
  onOpenChange,
  isEmbedded = false,
}) => {
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const isControlled = controlledIsOpen !== undefined;
  const isOpen = isControlled ? controlledIsOpen : internalIsOpen;

  const setIsOpen = (value: boolean) => {
    if (isControlled && onOpenChange) onOpenChange(value);
    else setInternalIsOpen(value);
  };

  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [chips, setChips] = useState<string[]>(DEFAULT_CHIPS);
  const [patientContext, setPatientContext] = useState<{ name?: string; allergies?: string }>({});

  const { toast } = useToast();
  const { user, profile } = useAuth();
  const { getLocalResponse } = useHealthAI();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // ── Fetch Extended Context ──────────────────────────────
  useEffect(() => {
    const fetchExtendedContext = async () => {
      if (user?.id && profile?.role === 'patient') {
        const { data } = await supabase
          .from('patients')
          .select('allergies')
          .eq('user_id', user.id)
          .single();

        setPatientContext({
          name: profile.name || undefined,
          allergies: data?.allergies || undefined
        });
      } else if (profile?.name) {
        setPatientContext({ name: profile.name });
      }
    };
    fetchExtendedContext();
  }, [user, profile]);

  // ── Online/offline detection ────────────────────────────
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

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      const welcome: ChatMessage = {
        id: '0',
        type: 'bot',
        content: "Bonjour ! 👋 Je suis **Leslie**, votre assistante santé PharmaGo. Comment puis-je vous aider aujourd'hui ?",
        timestamp: new Date(),
      };
      setMessages([welcome]);
    }
  }, [isOpen]);

  // ── Edge function call with timeout ──────────────────────
  const callEdgeFunction = useCallback(
    async (content: string): Promise<string | null> => {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), EDGE_FUNCTION_TIMEOUT_MS);

      try {
        const { data, error } = await supabase.functions.invoke('chat', {
          body: { message: content, conversationId },
        });

        clearTimeout(timeoutId);
        if (error) return null;

        if (data.conversationId && !conversationId) {
          setConversationId(data.conversationId);
        }
        return data.message ?? null;
      } catch {
        clearTimeout(timeoutId);
        return null;
      }
    },
    [conversationId]
  );

  // ── Main send handler ─────────────────────────────────────
  const sendMessage = async (content: string) => {
    if (!content.trim()) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      content,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setInputValue('');
    setIsTyping(true);

    let botContent: string;
    let usedOffline = false;

    if (!isOnline) {
      // Offline — always use local AI
      const { message, suggestedChips } = getLocalResponse(content, patientContext);
      botContent = message;
      if (suggestedChips) setChips(suggestedChips);
      usedOffline = true;
    } else {
      // Online — try edge function, fallback to local AI on timeout/error
      const edgeResponse = await callEdgeFunction(content);
      if (edgeResponse) {
        botContent = edgeResponse;
      } else {
        const { message, suggestedChips } = getLocalResponse(content, patientContext);
        botContent = message;
        if (suggestedChips) setChips(suggestedChips);
        usedOffline = true;
      }
    }

    const botMsg: ChatMessage = {
      id: (Date.now() + 1).toString(),
      type: 'bot',
      content: botContent,
      timestamp: new Date(),
      isOffline: usedOffline,
    };
    setMessages((prev) => [...prev, botMsg]);
    setIsTyping(false);
  };

  // ── Floating button ────────────────────────────────────────
  if (!isOpen && !isEmbedded && !isControlled) {
    return (
      <Button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 z-50 animate-pulse-gentle"
        size="icon"
      >
        <MessageCircle className="h-6 w-6" />
        <span className="absolute -top-1 -right-1 flex h-4 w-4">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
          <span className="relative inline-flex rounded-full h-4 w-4 bg-primary border-2 border-white"></span>
        </span>
      </Button>
    );
  }

  if (!isOpen && (isEmbedded || isControlled)) return null;

  return (
    <Card
      className={`${isEmbedded
        ? 'w-full h-full border-none shadow-none'
        : 'fixed bottom-6 right-6 w-96 shadow-2xl z-50'
        } transition-all duration-300 ${!isEmbedded && isMinimized ? 'h-14 overflow-hidden' : !isEmbedded ? 'h-[520px]' : ''
        }`}
    >
      {/* ── Header ──────────────────────────────────────── */}
      <CardHeader className="pb-2 border-b">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm flex items-center gap-2">
            <div className={`h-7 w-7 rounded-full overflow-hidden border border-primary/30 shadow-sm ${isTyping ? 'animate-pulse' : ''}`}>
              <img
                src="/leslie-avatar.png"
                alt="Leslie"
                className="h-full w-full object-cover"
              />
            </div>
            <span className="font-semibold">Leslie — PharmaGo AI</span>

            {/* Online / offline indicator */}
            <span
              className={`flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded-full ${isOnline
                ? 'bg-green-100 text-green-700'
                : 'bg-orange-100 text-orange-700'
                }`}
            >
              {isOnline ? (
                <Wifi className="h-2.5 w-2.5" />
              ) : (
                <WifiOff className="h-2.5 w-2.5" />
              )}
              {isOnline ? 'En ligne' : 'Hors-ligne'}
            </span>
          </CardTitle>

          <div className="flex items-center gap-1">
            {!isEmbedded && (
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={() => setIsMinimized(!isMinimized)}
              >
                {isMinimized ? (
                  <Maximize2 className="h-3 w-3" />
                ) : (
                  <Minimize2 className="h-3 w-3" />
                )}
              </Button>
            )}
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={() => setIsOpen(false)}
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </CardHeader>

      {/* ── Body ────────────────────────────────────────── */}
      {!isMinimized && (
        <CardContent className="flex flex-col p-3 gap-3 h-[calc(100%-56px)]">
          <ScrollArea className="flex-1 pr-1">
            <div className="space-y-3">
              {/* Quick chips — shown when only welcome message OR specific suggestions active */}
              {messages.length >= 1 && (
                <div className="flex flex-wrap gap-1.5 mb-3 animate-in fade-in slide-in-from-top-2 duration-500">
                  {chips.map((chip) => (
                    <Button
                      key={chip}
                      variant="outline"
                      size="sm"
                      className="text-[10px] h-7 px-3 rounded-full border-primary/20 hover:bg-primary/5 hover:border-primary transition-all whitespace-nowrap bg-white/50 backdrop-blur-sm shadow-sm"
                      onClick={() => sendMessage(chip)}
                    >
                      {chip}
                    </Button>
                  ))}
                </div>
              )}

              {/* Messages */}
              {messages.map((message) => (
                <div key={message.id}>
                  <div
                    className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'
                      }`}
                  >
                    <div className="flex items-end gap-2 max-w-[88%]">
                      {message.type === 'bot' && (
                        <div className="h-6 w-6 rounded-full overflow-hidden border border-primary/20 flex-shrink-0 shadow-sm mb-0.5">
                          <img
                            src="/leslie-avatar.png"
                            alt="Leslie"
                            className="h-full w-full object-cover"
                          />
                        </div>
                      )}
                      <div>
                        <div
                          className={`px-3 py-2 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${message.type === 'user'
                            ? 'bg-primary text-primary-foreground rounded-br-sm'
                            : 'bg-muted rounded-bl-sm shadow-sm'
                            }`}
                        >
                          {/* Rich Text Rendering */}
                          <div
                            dangerouslySetInnerHTML={{
                              __html: message.content
                                .replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold text-primary">$1</strong>')
                                .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" class="text-blue-600 underline font-medium hover:text-blue-800 transition-colors">$1</a>')
                            }}
                          />
                        </div>
                        {message.isOffline && message.type === 'bot' && (
                          <p className="text-[10px] text-muted-foreground mt-0.5 flex items-center gap-1 pl-1">
                            <WifiOff className="h-2.5 w-2.5" />
                            Réponse locale (IA embarquée)
                          </p>
                        )}
                      </div>
                      {message.type === 'user' && (
                        <div className="h-6 w-6 rounded-full bg-secondary flex items-center justify-center flex-shrink-0 mb-0.5">
                          <User className="h-3 w-3" />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}

              {/* Typing indicator */}
              {isTyping && (
                <div className="flex justify-start">
                  <div className="flex items-end gap-2">
                    <div className="h-6 w-6 rounded-full overflow-hidden border border-primary/20">
                      <img
                        src="/leslie-avatar.png"
                        alt="Leslie"
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div className="bg-muted px-3 py-2.5 rounded-2xl rounded-bl-sm">
                      <div className="flex space-x-1">
                        {[0, 150, 300].map((delay) => (
                          <div
                            key={delay}
                            className="h-1.5 w-1.5 bg-muted-foreground/60 rounded-full animate-bounce"
                            style={{ animationDelay: `${delay}ms` }}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>

          {/* ── Input area ──────────────────────────────── */}
          {!isOnline && (
            <div className="flex items-center gap-1.5 text-xs text-orange-600 bg-orange-50 rounded-lg px-3 py-1.5">
              <WifiOff className="h-3.5 w-3.5 flex-shrink-0" />
              Mode hors-ligne — Leslie répond en local
            </div>
          )}

          <div className="flex items-center gap-2 pt-1 border-t">
            <Input
              placeholder={isOnline ? "Tapez votre question..." : "Question (mode hors-ligne)..."}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  sendMessage(inputValue);
                }
              }}
              className="flex-1 h-9 text-sm"
            />
            <Button
              onClick={() => sendMessage(inputValue)}
              disabled={!inputValue.trim() || isTyping}
              size="icon"
              className="h-9 w-9 flex-shrink-0"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      )}
    </Card>
  );
};