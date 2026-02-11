import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
    MessageCircle,
    Send,
    Phone,
    Video,
    MoreVertical,
    Image,
    Paperclip,
    Smile,
    Check,
    CheckCheck,
    Clock,
    User,
    Search
} from 'lucide-react';
import { toast } from 'sonner';

interface Message {
    id: string;
    senderId: string;
    content: string;
    timestamp: Date;
    status: 'sending' | 'sent' | 'delivered' | 'read';
    type: 'text' | 'image' | 'file';
}

interface ChatContact {
    id: string;
    name: string;
    avatar?: string;
    role: 'patient' | 'doctor' | 'pharmacy' | 'driver';
    lastMessage?: string;
    lastMessageTime?: Date;
    unreadCount: number;
    online: boolean;
}

interface RealTimeChatProps {
    currentUserId: string;
    currentUserRole: string;
}

export function RealTimeChat({ currentUserId, currentUserRole }: RealTimeChatProps) {
    const [contacts, setContacts] = useState<ChatContact[]>([
        {
            id: '1',
            name: 'Dr. Kouassi Jean',
            role: 'doctor',
            lastMessage: 'Votre ordonnance est prête',
            lastMessageTime: new Date(Date.now() - 1000 * 60 * 5),
            unreadCount: 2,
            online: true
        },
        {
            id: '2',
            name: 'Pharmacie Centrale',
            role: 'pharmacy',
            lastMessage: 'Commande #PG-2486 préparée',
            lastMessageTime: new Date(Date.now() - 1000 * 60 * 30),
            unreadCount: 0,
            online: true
        },
        {
            id: '3',
            name: 'Livreur Koné',
            role: 'driver',
            lastMessage: 'J\'arrive dans 10 minutes',
            lastMessageTime: new Date(Date.now() - 1000 * 60 * 60),
            unreadCount: 1,
            online: true
        },
        {
            id: '4',
            name: 'Mme Aya Marie',
            role: 'patient',
            lastMessage: 'Merci docteur',
            lastMessageTime: new Date(Date.now() - 1000 * 60 * 60 * 2),
            unreadCount: 0,
            online: false
        }
    ]);

    const [selectedContact, setSelectedContact] = useState<ChatContact | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (selectedContact) {
            // Load messages for selected contact
            setMessages([
                {
                    id: '1',
                    senderId: selectedContact.id,
                    content: 'Bonjour, comment allez-vous aujourd\'hui ?',
                    timestamp: new Date(Date.now() - 1000 * 60 * 10),
                    status: 'read',
                    type: 'text'
                },
                {
                    id: '2',
                    senderId: currentUserId,
                    content: 'Bonjour, je vais bien merci. J\'ai une question concernant mon ordonnance.',
                    timestamp: new Date(Date.now() - 1000 * 60 * 8),
                    status: 'read',
                    type: 'text'
                },
                {
                    id: '3',
                    senderId: selectedContact.id,
                    content: 'Bien sûr, je vous écoute.',
                    timestamp: new Date(Date.now() - 1000 * 60 * 6),
                    status: 'read',
                    type: 'text'
                },
                {
                    id: '4',
                    senderId: currentUserId,
                    content: 'Est-ce que je peux prendre le Doliprane avec l\'Ibuprofène ?',
                    timestamp: new Date(Date.now() - 1000 * 60 * 5),
                    status: 'delivered',
                    type: 'text'
                },
                {
                    id: '5',
                    senderId: selectedContact.id,
                    content: selectedContact.lastMessage || 'Oui, vous pouvez les alterner mais pas les prendre en même temps. Respectez un intervalle de 4h minimum.',
                    timestamp: new Date(Date.now() - 1000 * 60 * 2),
                    status: 'read',
                    type: 'text'
                }
            ]);

            // Mark as read
            setContacts(prev => prev.map(c =>
                c.id === selectedContact.id ? { ...c, unreadCount: 0 } : c
            ));
        }
    }, [selectedContact, currentUserId]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const sendMessage = () => {
        if (!newMessage.trim() || !selectedContact) return;

        const message: Message = {
            id: `msg-${Date.now()}`,
            senderId: currentUserId,
            content: newMessage,
            timestamp: new Date(),
            status: 'sending',
            type: 'text'
        };

        setMessages(prev => [...prev, message]);
        setNewMessage('');

        // Simulate sending
        setTimeout(() => {
            setMessages(prev => prev.map(m =>
                m.id === message.id ? { ...m, status: 'delivered' as const } : m
            ));
        }, 500);
    };

    const formatTime = (date: Date) => {
        return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    };

    const getStatusIcon = (status: Message['status']) => {
        switch (status) {
            case 'sending':
                return <Clock className="h-3 w-3 text-slate-400" />;
            case 'sent':
                return <Check className="h-3 w-3 text-slate-400" />;
            case 'delivered':
                return <CheckCheck className="h-3 w-3 text-slate-400" />;
            case 'read':
                return <CheckCheck className="h-3 w-3 text-blue-500" />;
        }
    };

    const getRoleBadge = (role: ChatContact['role']) => {
        const styles = {
            doctor: 'bg-blue-100 text-blue-700',
            patient: 'bg-green-100 text-green-700',
            pharmacy: 'bg-purple-100 text-purple-700',
            driver: 'bg-amber-100 text-amber-700'
        };
        const labels = {
            doctor: 'Médecin',
            patient: 'Patient',
            pharmacy: 'Pharmacie',
            driver: 'Livreur'
        };
        return (
            <Badge variant="outline" className={`${styles[role]} text-[10px] border-0`}>
                {labels[role]}
            </Badge>
        );
    };

    const totalUnread = contacts.reduce((sum, c) => sum + c.unreadCount, 0);

    const filteredContacts = contacts.filter(c =>
        c.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <Card className="bg-white border-slate-200 h-[600px] flex flex-col overflow-hidden">
            <CardHeader className="pb-2 border-b">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="p-2 bg-primary/10 rounded-xl">
                            <MessageCircle className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                            <CardTitle className="text-lg">Messages</CardTitle>
                            {totalUnread > 0 && (
                                <p className="text-xs text-muted-foreground">{totalUnread} non lu(s)</p>
                            )}
                        </div>
                    </div>
                </div>
            </CardHeader>

            <CardContent className="flex-1 p-0 flex overflow-hidden">
                {/* Contacts List */}
                <div className="w-80 border-r border-slate-200 flex flex-col">
                    {/* Search */}
                    <div className="p-3 border-b">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Rechercher..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10 h-9"
                            />
                        </div>
                    </div>

                    {/* Contacts */}
                    <ScrollArea className="flex-1">
                        {filteredContacts.map(contact => (
                            <div
                                key={contact.id}
                                className={`p-3 flex items-center gap-3 cursor-pointer hover:bg-slate-50 transition-colors ${selectedContact?.id === contact.id ? 'bg-primary/5 border-l-2 border-primary' : ''
                                    }`}
                                onClick={() => setSelectedContact(contact)}
                            >
                                <div className="relative">
                                    <Avatar className="h-10 w-10">
                                        <AvatarImage src={contact.avatar} />
                                        <AvatarFallback className="bg-slate-200 text-slate-600 text-sm">
                                            {contact.name.split(' ').map(n => n[0]).join('')}
                                        </AvatarFallback>
                                    </Avatar>
                                    {contact.online && (
                                        <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between">
                                        <h4 className="text-sm font-semibold truncate">{contact.name}</h4>
                                        {contact.lastMessageTime && (
                                            <span className="text-[10px] text-muted-foreground">
                                                {formatTime(contact.lastMessageTime)}
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <p className="text-xs text-muted-foreground truncate">{contact.lastMessage}</p>
                                        {contact.unreadCount > 0 && (
                                            <Badge className="bg-primary text-white h-5 w-5 p-0 flex items-center justify-center text-[10px]">
                                                {contact.unreadCount}
                                            </Badge>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </ScrollArea>
                </div>

                {/* Chat Area */}
                <div className="flex-1 flex flex-col">
                    {selectedContact ? (
                        <>
                            {/* Chat Header */}
                            <div className="p-3 border-b flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <Avatar className="h-10 w-10">
                                        <AvatarImage src={selectedContact.avatar} />
                                        <AvatarFallback className="bg-slate-200 text-slate-600">
                                            {selectedContact.name.split(' ').map(n => n[0]).join('')}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <h4 className="text-sm font-semibold">{selectedContact.name}</h4>
                                        <div className="flex items-center gap-2">
                                            {getRoleBadge(selectedContact.role)}
                                            <span className={`text-[10px] ${selectedContact.online ? 'text-green-600' : 'text-slate-400'}`}>
                                                {selectedContact.online ? 'En ligne' : 'Hors ligne'}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-1">
                                    <Button variant="ghost" size="icon" className="h-8 w-8">
                                        <Phone className="h-4 w-4" />
                                    </Button>
                                    <Button variant="ghost" size="icon" className="h-8 w-8">
                                        <Video className="h-4 w-4" />
                                    </Button>
                                    <Button variant="ghost" size="icon" className="h-8 w-8">
                                        <MoreVertical className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>

                            {/* Messages */}
                            <ScrollArea className="flex-1 p-4">
                                <div className="space-y-3">
                                    {messages.map(message => {
                                        const isOwn = message.senderId === currentUserId;
                                        return (
                                            <div
                                                key={message.id}
                                                className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                                            >
                                                <div className={`max-w-[70%] ${isOwn ? 'order-2' : 'order-1'}`}>
                                                    <div
                                                        className={`px-4 py-2 rounded-2xl ${isOwn
                                                                ? 'bg-primary text-white rounded-tr-none'
                                                                : 'bg-slate-100 text-slate-900 rounded-tl-none'
                                                            }`}
                                                    >
                                                        <p className="text-sm">{message.content}</p>
                                                    </div>
                                                    <div className={`flex items-center gap-1 mt-1 ${isOwn ? 'justify-end' : 'justify-start'}`}>
                                                        <span className="text-[10px] text-muted-foreground">
                                                            {formatTime(message.timestamp)}
                                                        </span>
                                                        {isOwn && getStatusIcon(message.status)}
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                    <div ref={messagesEndRef} />
                                </div>
                            </ScrollArea>

                            {/* Input */}
                            <div className="p-3 border-t">
                                <div className="flex items-center gap-2">
                                    <Button variant="ghost" size="icon" className="h-9 w-9 flex-shrink-0">
                                        <Paperclip className="h-5 w-5 text-muted-foreground" />
                                    </Button>
                                    <Input
                                        placeholder="Votre message..."
                                        value={newMessage}
                                        onChange={(e) => setNewMessage(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                                        className="flex-1"
                                    />
                                    <Button variant="ghost" size="icon" className="h-9 w-9 flex-shrink-0">
                                        <Smile className="h-5 w-5 text-muted-foreground" />
                                    </Button>
                                    <Button
                                        onClick={sendMessage}
                                        disabled={!newMessage.trim()}
                                        size="icon"
                                        className="h-9 w-9 flex-shrink-0"
                                    >
                                        <Send className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="flex-1 flex items-center justify-center text-center p-8">
                            <div>
                                <MessageCircle className="h-16 w-16 text-slate-300 mx-auto mb-4" />
                                <h3 className="text-lg font-semibold text-slate-600">Sélectionnez une conversation</h3>
                                <p className="text-sm text-muted-foreground mt-1">
                                    Choisissez un contact pour commencer à discuter
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
