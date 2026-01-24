import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import {
  MessageCircle,
  Send,
  Bot,
  User,
  X,
  Minimize2,
  Maximize2
} from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface ChatMessage {
  id: string;
  type: 'user' | 'bot';
  content: string;
  timestamp: Date;
}

export const Chatbot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const { toast } = useToast();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      const welcomeMessage: ChatMessage = {
        id: '1',
        type: 'bot',
        content: "Bonjour ! Je suis votre assistant PharmaGo intelligent. Comment puis-je vous aider aujourd'hui ?",
        timestamp: new Date()
      };
      setMessages([welcomeMessage]);
    }
  }, [isOpen]);

  const sendMessage = async (content: string) => {
    if (!content.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      content,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    try {
      const { data, error } = await supabase.functions.invoke('chat', {
        body: {
          message: content,
          conversationId
        }
      });

      if (error) throw error;

      if (data.conversationId && !conversationId) {
        setConversationId(data.conversationId);
      }

      const botMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'bot',
        content: data.message,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('Chat error:', error);
      toast({
        title: "Erreur",
        description: "Impossible de contacter l'assistant. Veuillez réessayer.",
        variant: "destructive"
      });
    } finally {
      setIsTyping(false);
    }
  };

  if (!isOpen) {
    return (
      <Button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 z-50"
        size="icon"
      >
        <MessageCircle className="h-6 w-6" />
      </Button>
    );
  }

  return (
    <Card className={`fixed bottom-6 right-6 w-80 shadow-xl z-50 transition-all duration-300 ${isMinimized ? 'h-14' : 'h-96'
      }`}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm flex items-center gap-2">
            <div className="h-6 w-6 rounded-full overflow-hidden border border-primary/20">
              <img src="/leslie-avatar.png" alt="Leslie" className="h-full w-full object-cover" />
            </div>
            Assistant PharmaGo
            <Badge variant="secondary" className="text-xs">En ligne</Badge>
          </CardTitle>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={() => setIsMinimized(!isMinimized)}
            >
              {isMinimized ? <Maximize2 className="h-3 w-3" /> : <Minimize2 className="h-3 w-3" />}
            </Button>
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

      {!isMinimized && (
        <CardContent className="flex flex-col h-80">
          <ScrollArea className="flex-1 pr-2">
            <div className="space-y-3">
              {messages.length === 1 && (
                <div className="grid grid-cols-2 gap-2 mb-4">
                  {["📦 Suivre ma commande", "🏥 Pharmacie de garde", "📄 Envoyer ordonnance", "💊 Conseil médicament"].map((chip) => (
                    <Button
                      key={chip}
                      variant="outline"
                      size="sm"
                      className="text-xs h-auto py-2 whitespace-normal text-left justify-start"
                      onClick={() => sendMessage(chip)}
                    >
                      {chip}
                    </Button>
                  ))}
                </div>
              )}
              {messages.map((message) => (
                <div key={message.id} className="space-y-2">
                  <div
                    className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className="flex items-start gap-2 max-w-[85%]">
                      {message.type === 'bot' && (
                        <div className="h-6 w-6 rounded-full overflow-hidden border border-primary/20 flex-shrink-0 shadow-sm">
                          <img src="/leslie-avatar.png" alt="Leslie" className="h-full w-full object-cover" />
                        </div>
                      )}
                      <div
                        className={`px-3 py-2 rounded-lg text-sm ${message.type === 'user'
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted'
                          }`}
                      >
                        {message.content}
                      </div>
                      {message.type === 'user' && (
                        <div className="h-6 w-6 rounded-full bg-secondary flex items-center justify-center flex-shrink-0">
                          <User className="h-3 w-3" />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              {isTyping && (
                <div className="flex justify-start">
                  <div className="flex items-center gap-2">
                    <div className="h-6 w-6 rounded-full overflow-hidden border border-primary/20">
                      <img src="/leslie-avatar.png" alt="Leslie" className="h-full w-full object-cover" />
                    </div>
                    <div className="bg-muted px-3 py-2 rounded-lg">
                      <div className="flex space-x-1">
                        <div className="h-1 w-1 bg-muted-foreground rounded-full animate-pulse"></div>
                        <div className="h-1 w-1 bg-muted-foreground rounded-full animate-pulse delay-100"></div>
                        <div className="h-1 w-1 bg-muted-foreground rounded-full animate-pulse delay-200"></div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>

          <div className="flex items-center gap-2 mt-3 pt-3 border-t">
            <Input
              placeholder="Tapez votre question..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  sendMessage(inputValue);
                }
              }}
              className="flex-1 h-8 text-sm"
            />
            <Button
              onClick={() => sendMessage(inputValue)}
              disabled={!inputValue.trim() || isTyping}
              size="icon"
              className="h-8 w-8"
            >
              <Send className="h-3 w-3" />
            </Button>
          </div>
        </CardContent>
      )}
    </Card>
  );
};