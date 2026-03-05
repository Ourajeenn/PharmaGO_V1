import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MessageSquare, Send, X, Loader2 } from 'lucide-react';
import { toast } from "sonner";
import { format } from 'date-fns';
import { usePushNotifications } from '@/hooks/usePushNotifications';

interface Message {
    id: string;
    sender_id: string;
    content: string;
    created_at: string;
    order_id?: string;
}

interface RealtimeChatProps {
    orderId?: string;
    recipientId?: string;
    onClose?: () => void;
}

export const RealtimeChat: React.FC<RealtimeChatProps> = ({ orderId, recipientId, onClose }) => {
    const { user } = useAuth();
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const { notify } = usePushNotifications();
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!user) return;

        fetchMessages();

        // Subscribe to real-time messages
        const channel = supabase
            .channel('public:messages')
            .on('postgres_changes', {
                event: 'INSERT',
                schema: 'public',
                table: 'messages',
                filter: `recipient_id=eq.${user.id}`
            }, (payload) => {
                const newMsg = payload.new as Message;
                setMessages(prev => [...prev, newMsg]);

                // Trigger push notification if message is from someone else
                if (newMsg.sender_id !== user.id) {
                    notify('delivered', newMsg.order_id || 'new_message');
                }

                scrollToBottom();
            })
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [user]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const fetchMessages = async () => {
        try {
            const { data, error } = await supabase
                .from('messages')
                .select('*')
                .or(`sender_id.eq.${user?.id},recipient_id.eq.${user?.id}`)
                .order('created_at', { ascending: true });

            if (error) throw error;
            setMessages(data || []);
        } catch (error) {
            console.error('Error fetching messages:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim() || !user) return;

        const messageData = {
            sender_id: user.id,
            recipient_id: recipientId || 'pharmacy-1', // Fallback for MVP
            content: newMessage,
            order_id: orderId,
            message_type: 'text'
        };

        try {
            const { data, error } = await supabase
                .from('messages')
                .insert([messageData])
                .select()
                .single();

            if (error) throw error;

            setMessages(prev => [...prev, data]);
            setNewMessage('');
        } catch (error) {
            toast.error("Erreur lors de l'envoi du message");
        }
    };

    const scrollToBottom = () => {
        if (scrollRef.current) {
            scrollRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    };

    return (
        <div className="flex flex-col h-[500px] w-[350px] bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
            {/* Header */}
            <div className="bg-slate-900 text-white p-4 flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                    <span className="font-bold">Chat Pharmacie</span>
                </div>
                {onClose && (
                    <Button variant="ghost" size="icon" onClick={onClose} className="text-white hover:bg-white/10 h-8 w-8">
                        <X className="h-4 w-4" />
                    </Button>
                )}
            </div>

            {/* Messages */}
            <ScrollArea className="flex-1 p-4 bg-slate-50/50">
                {isLoading ? (
                    <div className="flex items-center justify-center h-full">
                        <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
                    </div>
                ) : (
                    <div className="space-y-4">
                        {messages.map((msg) => (
                            <div
                                key={msg.id}
                                className={`flex ${msg.sender_id === user?.id ? 'justify-end' : 'justify-start'}`}
                            >
                                <div
                                    className={`max-w-[80%] p-3 rounded-2xl text-sm ${msg.sender_id === user?.id
                                        ? 'bg-slate-900 text-white rounded-tr-none'
                                        : 'bg-white border text-slate-900 rounded-tl-none shadow-sm'
                                        }`}
                                >
                                    <p>{msg.content}</p>
                                    <span className={`text-[10px] block mt-1 ${msg.sender_id === user?.id ? 'text-slate-300' : 'text-slate-400'}`}>
                                        {format(new Date(msg.created_at), 'HH:mm')}
                                    </span>
                                </div>
                            </div>
                        ))}
                        <div ref={scrollRef} />
                    </div>
                )}
            </ScrollArea>

            {/* Input */}
            <form onSubmit={handleSendMessage} className="p-4 bg-white border-t flex gap-2">
                <Input
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Tapez votre message..."
                    className="flex-1 rounded-xl"
                />
                <Button type="submit" size="icon" className="rounded-xl bg-slate-900">
                    <Send className="h-4 w-4" />
                </Button>
            </form>
        </div>
    );
};
