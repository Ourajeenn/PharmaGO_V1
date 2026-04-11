import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
    MessageSquare, Search, Send, Paperclip, Phone, Video,
    Clock, CheckCheck, User, Shield, Bell, Plus,
    FileText, Image, X, ChevronRight
} from 'lucide-react'
import { toast } from 'sonner'

interface Conversation {
    id: string
    patientName: string
    patientAvatar?: string
    lastMessage: string
    lastMessageTime: string
    unreadCount: number
    isOnline: boolean
    isPriority: boolean
}

interface Message {
    id: string
    content: string
    timestamp: string
    isFromDoctor: boolean
    type: 'text' | 'image' | 'file' | 'prescription'
    status: 'sent' | 'delivered' | 'read'
    attachment?: {
        name: string
        url: string
    }
}

export const SecureMessagingSection = () => {
    const [selectedConversation, setSelectedConversation] = useState<string | null>(null)
    const [searchQuery, setSearchQuery] = useState('')
    const [newMessage, setNewMessage] = useState('')
    const [isNewConversationDialogOpen, setIsNewConversationDialogOpen] = useState(false)

    // Mock data
    const [conversations] = useState<Conversation[]>([
        { id: '1', patientName: 'Kouamé Aya', lastMessage: 'Merci docteur, je vais suivre vos conseils.', lastMessageTime: '10:45', unreadCount: 0, isOnline: true, isPriority: false },
        { id: '2', patientName: 'Traoré Ibrahim', lastMessage: 'J\'ai encore des douleurs depuis hier...', lastMessageTime: '09:30', unreadCount: 2, isOnline: false, isPriority: true },
        { id: '3', patientName: 'Koné Fatou', lastMessage: 'Résultats d\'analyse disponibles', lastMessageTime: 'Hier', unreadCount: 0, isOnline: true, isPriority: false },
        { id: '4', patientName: 'Bamba Moussa', lastMessage: 'Bonjour, j\'aurais besoin d\'un renouvellement...', lastMessageTime: 'Hier', unreadCount: 1, isOnline: false, isPriority: false },
        { id: '5', patientName: 'Diallo Aminata', lastMessage: 'Ordonnance reçue, merci!', lastMessageTime: 'Lun', unreadCount: 0, isOnline: false, isPriority: false }
    ])

    const [messages] = useState<Record<string, Message[]>>({
        '1': [
            { id: 'm1', content: 'Bonjour Mme Kouamé, comment vous sentez-vous aujourd\'hui?', timestamp: '10:30', isFromDoctor: true, type: 'text', status: 'read' },
            { id: 'm2', content: 'Bonjour Docteur! Je vais mieux, les médicaments font effet.', timestamp: '10:35', isFromDoctor: false, type: 'text', status: 'read' },
            { id: 'm3', content: 'C\'est une bonne nouvelle. Continuez le traitement pendant encore 5 jours.', timestamp: '10:40', isFromDoctor: true, type: 'text', status: 'read' },
            { id: 'm4', content: 'Merci docteur, je vais suivre vos conseils.', timestamp: '10:45', isFromDoctor: false, type: 'text', status: 'read' }
        ],
        '2': [
            { id: 'm5', content: 'Dr, j\'ai des effets secondaires depuis le nouveau traitement', timestamp: '09:00', isFromDoctor: false, type: 'text', status: 'read' },
            { id: 'm6', content: 'Quels symptômes avez-vous exactement?', timestamp: '09:15', isFromDoctor: true, type: 'text', status: 'read' },
            { id: 'm7', content: 'J\'ai encore des douleurs depuis hier...', timestamp: '09:30', isFromDoctor: false, type: 'text', status: 'delivered' }
        ]
    })

    const selectedConv = conversations.find(c => c.id === selectedConversation)
    const currentMessages = selectedConversation ? messages[selectedConversation] || [] : []

    const filteredConversations = conversations.filter(conv =>
        conv.patientName.toLowerCase().includes(searchQuery.toLowerCase())
    )

    const handleSendMessage = () => {
        if (!newMessage.trim() || !selectedConversation) return
        toast.success('Message envoyé')
        setNewMessage('')
    }

    const getStatusIcon = (status: string) => {
        if (status === 'read') return <CheckCheck className="h-3 w-3 text-blue-500" />
        if (status === 'delivered') return <CheckCheck className="h-3 w-3 text-gray-400" />
        return <Clock className="h-3 w-3 text-gray-400" />
    }

    return (
        <div className="h-[calc(100vh-300px)] min-h-[500px] flex rounded-2xl overflow-hidden border bg-white">
            {/* Conversations List */}
            <div className="w-80 border-r flex flex-col">
                <div className="p-4 border-b">
                    <div className="flex items-center justify-between mb-3">
                        <h3 className="font-bold text-lg">Messages</h3>
                        <Button
                            size="sm"
                            className="rounded-lg"
                            onClick={() => setIsNewConversationDialogOpen(true)}
                        >
                            <Plus className="h-4 w-4" />
                        </Button>
                    </div>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Rechercher..."
                            className="pl-9 rounded-xl"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>
                <div className="flex-1 overflow-y-auto">
                    {filteredConversations.map((conv) => (
                        <div
                            key={conv.id}
                            className={`p-3 cursor-pointer hover:bg-gray-50 transition-colors border-b ${selectedConversation === conv.id ? 'bg-primary/5' : ''
                                }`}
                            onClick={() => setSelectedConversation(conv.id)}
                        >
                            <div className="flex items-center gap-3">
                                <div className="relative">
                                    <Avatar>
                                        <AvatarFallback className="bg-primary/10 text-primary">
                                            {conv.patientName.split(' ').map(n => n[0]).join('')}
                                        </AvatarFallback>
                                    </Avatar>
                                    {conv.isOnline && (
                                        <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-1">
                                            <span className="font-medium truncate">{conv.patientName}</span>
                                            {conv.isPriority && (
                                                <Badge className="bg-red-100 text-red-700 text-xs px-1">Urgent</Badge>
                                            )}
                                        </div>
                                        <span className="text-xs text-muted-foreground">{conv.lastMessageTime}</span>
                                    </div>
                                    <p className="text-sm text-muted-foreground truncate">{conv.lastMessage}</p>
                                </div>
                                {conv.unreadCount > 0 && (
                                    <Badge className="bg-primary text-white rounded-full h-5 min-w-5 text-xs">
                                        {conv.unreadCount}
                                    </Badge>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Chat Area */}
            {selectedConversation ? (
                <div className="flex-1 flex flex-col">
                    {/* Chat Header */}
                    <div className="p-4 border-b flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <Avatar>
                                <AvatarFallback className="bg-primary/10 text-primary">
                                    {selectedConv?.patientName.split(' ').map(n => n[0]).join('')}
                                </AvatarFallback>
                            </Avatar>
                            <div>
                                <p className="font-bold">{selectedConv?.patientName}</p>
                                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                    {selectedConv?.isOnline ? (
                                        <><span className="w-2 h-2 bg-green-500 rounded-full" /> En ligne</>
                                    ) : (
                                        <>Hors ligne</>
                                    )}
                                </div>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <Button variant="outline" size="icon" className="rounded-lg">
                                <Phone className="h-4 w-4" />
                            </Button>
                            <Button variant="outline" size="icon" className="rounded-lg">
                                <Video className="h-4 w-4" />
                            </Button>
                            <Button variant="outline" size="icon" className="rounded-lg">
                                <User className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>

                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
                        <div className="flex justify-center">
                            <Badge variant="secondary" className="text-xs">
                                <Shield className="h-3 w-3 mr-1" /> Messages chiffrés de bout en bout
                            </Badge>
                        </div>
                        {currentMessages.map((msg) => (
                            <div
                                key={msg.id}
                                className={`flex ${msg.isFromDoctor ? 'justify-end' : 'justify-start'}`}
                            >
                                <div className={`max-w-[70%] ${msg.isFromDoctor
                                        ? 'bg-primary text-white rounded-2xl rounded-br-sm'
                                        : 'bg-white rounded-2xl rounded-bl-sm shadow-sm'
                                    } p-3`}>
                                    <p className="text-sm">{msg.content}</p>
                                    <div className={`flex items-center justify-end gap-1 mt-1 ${msg.isFromDoctor ? 'text-white/70' : 'text-muted-foreground'
                                        }`}>
                                        <span className="text-xs">{msg.timestamp}</span>
                                        {msg.isFromDoctor && getStatusIcon(msg.status)}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Input */}
                    <div className="p-4 border-t bg-white">
                        <div className="flex items-center gap-2">
                            <Button variant="outline" size="icon" className="rounded-lg flex-shrink-0">
                                <Paperclip className="h-4 w-4" />
                            </Button>
                            <Button variant="outline" size="icon" className="rounded-lg flex-shrink-0">
                                <FileText className="h-4 w-4" />
                            </Button>
                            <Input
                                placeholder="Écrivez votre message..."
                                className="rounded-xl"
                                value={newMessage}
                                onChange={(e) => setNewMessage(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                            />
                            <Button
                                className="rounded-lg flex-shrink-0"
                                onClick={handleSendMessage}
                                disabled={!newMessage.trim()}
                            >
                                <Send className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="flex-1 flex items-center justify-center bg-gray-50">
                    <div className="text-center">
                        <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                        <p className="font-bold">Sélectionnez une conversation</p>
                        <p className="text-sm text-muted-foreground">ou démarrez une nouvelle discussion</p>
                    </div>
                </div>
            )}

            {/* New Conversation Dialog */}
            <Dialog open={isNewConversationDialogOpen} onOpenChange={setIsNewConversationDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Nouvelle conversation</DialogTitle>
                    </DialogHeader>
                    <div className="py-4 space-y-4">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input placeholder="Rechercher un patient..." className="pl-9" />
                        </div>
                        <p className="text-sm text-muted-foreground">Patients récents</p>
                        <div className="space-y-2">
                            {conversations.slice(0, 3).map((conv) => (
                                <div
                                    key={conv.id}
                                    className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 cursor-pointer"
                                    onClick={() => {
                                        setSelectedConversation(conv.id)
                                        setIsNewConversationDialogOpen(false)
                                    }}
                                >
                                    <Avatar>
                                        <AvatarFallback className="bg-primary/10 text-primary">
                                            {conv.patientName.split(' ').map(n => n[0]).join('')}
                                        </AvatarFallback>
                                    </Avatar>
                                    <span className="font-medium">{conv.patientName}</span>
                                    <ChevronRight className="h-4 w-4 ml-auto text-muted-foreground" />
                                </div>
                            ))}
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    )
}

export default SecureMessagingSection
