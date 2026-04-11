import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MessageCircle,
  Send,
  Paperclip,
  Phone,
  Video,
  Users,
  Search,
  MoreVertical,
  Filter,
  CheckCircle2,
  Clock,
  ArrowLeft,
  X,
  FileText,
  Image as ImageIcon,
  Smile,
  Mic
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/components/ui/use-toast';
import { Textarea } from '@/components/ui/textarea';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface Message {
  id: string;
  sender_id: string;
  recipient_id?: string;
  order_id?: string;
  content: string;
  message_type: 'text' | 'image' | 'document';
  attachment_url?: string;
  is_read: boolean;
  created_at: string;
  sender?: {
    name: string;
    role: string;
    avatar_url?: string;
  };
}

interface Contact {
  id: string;
  name: string;
  role: string;
  avatar_url?: string;
  last_message?: string;
  last_message_time?: string;
  unread_count?: number;
  online?: boolean;
}

type RoleFilter = 'all' | 'doctor' | 'patient' | 'pharmacy' | 'driver' | 'insurer';

export const MessagingCenter: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [filteredContacts, setFilteredContacts] = useState<Contact[]>([]);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<RoleFilter>('all');
  const [showMobileList, setShowMobileList] = useState(true);

  // File attachments state
  const [attachmentFile, setAttachmentFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (user) {
      fetchContacts();

      // Realtime subscription for messages
      const channel = supabase
        .channel('messaging-refresh')
        .on('postgres_changes', {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `recipient_id=eq.${user.id}`
        }, (payload) => {
          const newMsg = payload.new as Message;
          if (selectedContact && newMsg.sender_id === selectedContact.id) {
            setMessages(prev => [...prev, newMsg]);
          } else {
            // Update unread count for contacts
            setContacts(prev => prev.map(c =>
              c.id === newMsg.sender_id ? { ...c, unread_count: (c.unread_count || 0) + 1, last_message: newMsg.content } : c
            ));
          }
        })
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [user, selectedContact]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    let result = contacts;
    if (activeFilter !== 'all') {
      result = result.filter(c => c.role === activeFilter);
    }
    if (searchQuery) {
      result = result.filter(c => c.name.toLowerCase().includes(searchQuery.toLowerCase()));
    }
    setFilteredContacts(result);
  }, [contacts, activeFilter, searchQuery]);

  useEffect(() => {
    if (selectedContact) {
      fetchMessages(selectedContact.id);
      setShowMobileList(false);
    }
  }, [selectedContact]);

  const fetchContacts = async () => {
    try {
      const { data: profiles, error } = await supabase
        .from('user_profiles')
        .select('id, name, role')
        .neq('id', user?.id)
        .limit(50);

      if (error) throw error;

      if (profiles) {
        setContacts(profiles.map(p => ({
          id: p.id,
          name: p.name || 'Utilisateur',
          role: p.role || 'patient',
          online: Math.random() > 0.4, // Simulation
          unread_count: 0
        })));
      }
    } catch (error) {
      console.error('Error fetching contacts:', error);
    }
  };

  const fetchMessages = async (contactId: string) => {
    try {
      const { data, error } = await supabase
        .from('messages')
        .select(`
          *,
          sender:user_profiles!messages_sender_id_fkey(name, role)
        `)
        .or(`and(sender_id.eq.${user?.id},recipient_id.eq.${contactId}),and(sender_id.eq.${contactId},recipient_id.eq.${user?.id})`)
        .order('created_at', { ascending: true });

      if (error) throw error;
      if (data) {
        setMessages(data as unknown as Message[]);
      }

      // Mark as read
      await supabase
        .from('messages')
        .update({ is_read: true })
        .match({ sender_id: contactId, recipient_id: user?.id, is_read: false });

    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "Fichier trop volumineux",
        description: "La taille maximum autorisée est de 5 MB.",
        variant: "destructive",
      });
      return;
    }
    setAttachmentFile(file);
  };

  const removeAttachment = () => {
    setAttachmentFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const uploadAttachment = async (file: File): Promise<{ url: string, type: 'image' | 'document' } | null> => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
      const filePath = `${user?.id}/${fileName}`;
      const isImage = file.type.startsWith('image/');
      const fileType = isImage ? 'image' : 'document';

      const { data, error } = await supabase.storage
        .from('message_attachments')
        .upload(filePath, file, { cacheControl: '3600', upsert: false });

      if (error) throw error;

      const { data: publicData } = supabase.storage
        .from('message_attachments')
        .getPublicUrl(filePath);

      return { url: publicData.publicUrl, type: fileType };
    } catch (error: any) {
      console.error('Error uploading attachment:', error);
      throw error;
    }
  };

  const sendMessage = async () => {
    if ((!newMessage.trim() && !attachmentFile) || !selectedContact || !user) return;

    const messageContent = newMessage;
    setNewMessage('');
    setLoading(true);

    try {
      let attachmentUrl = undefined;
      let messageType: 'text' | 'image' | 'document' = 'text';

      if (attachmentFile) {
        setUploadProgress(10);
        const uploaded = await uploadAttachment(attachmentFile);
        if (uploaded) {
          attachmentUrl = uploaded.url;
          messageType = uploaded.type;
        }
        setAttachmentFile(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
        setUploadProgress(100);
      }

      const tempMsg: Message = {
        id: Math.random().toString(),
        sender_id: user.id,
        content: messageContent,
        message_type: messageType,
        attachment_url: attachmentUrl,
        is_read: false,
        created_at: new Date().toISOString()
      };

      setMessages(prev => [...prev, tempMsg]);

      const { data, error } = await supabase
        .from('messages')
        .insert({
          sender_id: user.id,
          recipient_id: selectedContact.id,
          content: messageContent,
          message_type: messageType,
          attachment_url: attachmentUrl,
        })
        .select(`
          *,
          sender:user_profiles!messages_sender_id_fkey(name, role)
        `)
        .single();

      if (error) throw error;

      // Update the temp message with real data
      if (data) {
        setMessages(prev => prev.map(m => m.id === tempMsg.id ? (data as unknown as Message) : m));
      }

    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Erreur",
        description: "Impossible d'envoyer le message ou la pièce jointe",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      setUploadProgress(0);
    }
  };

  const getRoleColor = (role: string) => {
    switch (role?.toLowerCase()) {
      case 'patient': return 'bg-sky-500/10 text-sky-500 border-sky-500/20';
      case 'pharmacy': return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
      case 'doctor': return 'bg-violet-500/10 text-violet-500 border-violet-500/20';
      case 'driver': return 'bg-orange-500/10 text-orange-500 border-orange-500/20';
      case 'insurer': return 'bg-indigo-500/10 text-indigo-500 border-indigo-500/20';
      default: return 'bg-slate-500/10 text-slate-500 border-slate-500/20';
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role?.toLowerCase()) {
      case 'patient': return 'Patient';
      case 'pharmacy': return 'Pharmacie';
      case 'doctor': return 'Médecin';
      case 'driver': return 'Livreur';
      case 'insurer': return 'Assurance';
      default: return role;
    }
  };

  return (
    <div className="flex h-full min-h-[600px] max-h-[800px] w-full bg-white/50 backdrop-blur-xl rounded-3xl border border-white shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-500">
      {/* Sidebar - Contacts List */}
      <div className={`w-full md:w-80 lg:w-96 flex flex-col border-r border-slate-100 bg-white/30 backdrop-blur-md transition-all duration-300 ${!showMobileList ? 'hidden md:flex' : 'flex'}`}>
        <div className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-black bg-gradient-to-r from-slate-900 to-slate-600 bg-clip-text text-transparent">Messages</h1>
            <Button variant="ghost" size="icon" className="rounded-full hover:bg-slate-100/50">
              <Users className="h-5 w-5 text-slate-600" />
            </Button>
          </div>

          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
            <Input
              placeholder="Rechercher..."
              className="pl-10 h-11 bg-white/50 border-slate-100 rounded-2xl focus-visible:ring-emerald-500 transition-all shadow-sm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {(['all', 'doctor', 'patient', 'pharmacy', 'driver', 'insurer'] as RoleFilter[]).map((filter) => (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all ${activeFilter === filter
                  ? 'bg-slate-900 text-white shadow-lg'
                  : 'bg-white/70 text-slate-600 hover:bg-white border border-slate-100 shadow-sm'
                  }`}
              >
                {filter === 'all' ? 'Tous' : getRoleLabel(filter)}
              </button>
            ))}
          </div>
        </div>

        <ScrollArea className="flex-1 px-3">
          <div className="space-y-1 py-3 px-1">
            <AnimatePresence mode="popLayout">
              {filteredContacts.map((contact) => (
                <motion.div
                  key={contact.id}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  whileHover={{ x: 4 }}
                  className={`group flex items-center gap-3 p-3 rounded-2xl cursor-pointer transition-all duration-300 ${selectedContact?.id === contact.id
                    ? 'bg-gradient-to-r from-emerald-50 to-teal-50 shadow-sm'
                    : 'hover:bg-white/80'
                    }`}
                  onClick={() => setSelectedContact(contact)}
                >
                  <div className="relative">
                    <Avatar className={`h-12 w-12 border-2 transition-transform duration-300 group-hover:scale-105 ${selectedContact?.id === contact.id ? 'border-emerald-200' : 'border-white shadow-sm'}`}>
                      <AvatarImage src={contact.avatar_url} />
                      <AvatarFallback className="bg-gradient-to-br from-slate-100 to-slate-200 text-slate-600 font-bold">
                        {contact.name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    {contact.online && (
                      <div className="absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 bg-emerald-500 rounded-full border-2 border-white ring-1 ring-emerald-200" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-0.5">
                      <p className={`font-bold text-sm truncate ${selectedContact?.id === contact.id ? 'text-emerald-900' : 'text-slate-900'}`}>
                        {contact.name}
                      </p>
                      <span className="text-[10px] text-slate-400 font-medium whitespace-nowrap">
                        12:45
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <Badge variant="outline" className={`text-[10px] py-0 px-1.5 h-4 font-bold border ${getRoleColor(contact.role)}`}>
                        {getRoleLabel(contact.role)}
                      </Badge>
                      {contact.unread_count && contact.unread_count > 0 && (
                        <div className="h-5 min-w-[20px] rounded-full bg-emerald-500 text-white text-[10px] flex items-center justify-center font-bold px-1 animate-pulse">
                          {contact.unread_count}
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {filteredContacts.length === 0 && (
              <div className="py-20 text-center space-y-3">
                <div className="h-16 w-16 bg-slate-50 rounded-3xl flex items-center justify-center mx-auto text-slate-300 border border-slate-100">
                  <Search className="h-8 w-8" />
                </div>
                <p className="text-slate-400 text-sm font-medium">Aucun contact trouvé</p>
              </div>
            )}
          </div>
        </ScrollArea>
      </div>

      {/* Main Chat Area */}
      <div className={`flex-1 flex flex-col min-w-0 bg-white/5 backdrop-blur-sm transition-all duration-300 ${showMobileList ? 'hidden md:flex' : 'flex'}`}>
        {selectedContact ? (
          <>
            {/* Chat Header */}
            <div className="h-20 px-6 border-b border-slate-100 flex items-center justify-between bg-white/40 backdrop-blur-md sticky top-0 z-10 transition-all duration-300">
              <div className="flex items-center gap-4 min-w-0">
                <Button
                  variant="ghost"
                  size="icon"
                  className="md:hidden -ml-2 rounded-full hover:bg-slate-100"
                  onClick={() => setShowMobileList(true)}
                >
                  <ArrowLeft className="h-5 w-5" />
                </Button>

                <div className="flex items-center gap-3 min-w-0">
                  <div className="relative hidden sm:block">
                    <Avatar className="h-10 w-10 border-2 border-white shadow-sm ring-1 ring-slate-100">
                      <AvatarFallback className="bg-slate-100 font-bold">
                        {selectedContact.name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    {selectedContact.online && (
                      <div className="absolute bottom-0 right-0 h-3 w-3 bg-emerald-500 rounded-full border-2 border-white" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <h2 className="font-black text-slate-900 truncate tracking-tight">{selectedContact.name}</h2>
                    <div className="flex items-center gap-2">
                      <span className={`h-1.5 w-1.5 rounded-full ${selectedContact.online ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-slate-300'}`} />
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest italic">{selectedContact.online ? 'En ligne' : 'Hors ligne'}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <Button variant="ghost" size="icon" className="rounded-full text-slate-600 hover:text-emerald-600 hover:bg-emerald-50 transition-colors">
                  <Phone className="h-5 w-5" />
                </Button>
                <Button variant="ghost" size="icon" className="rounded-full text-slate-600 hover:text-emerald-600 hover:bg-emerald-50 transition-colors">
                  <Video className="h-5 w-5" />
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="rounded-full text-slate-400 hover:bg-slate-100">
                      <MoreVertical className="h-5 w-5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56 rounded-2xl p-2 border-slate-100 shadow-xl overflow-hidden">
                    <DropdownMenuItem className="rounded-xl flex gap-x-2 font-medium">
                      <Users className="h-4 w-4" /> Voir le profil
                    </DropdownMenuItem>
                    <DropdownMenuItem className="rounded-xl flex gap-x-2 font-medium">
                      <Clock className="h-4 w-4" /> Historique médical
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="rounded-xl text-red-500 focus:text-red-600 focus:bg-red-50 font-bold">
                      Bloquer le contact
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            {/* Messages Scroll Area */}
            <ScrollArea className="flex-1 bg-gradient-to-b from-white to-slate-50/50 relative">
              {/* Noise Overlay */}
              <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />

              <div className="p-6 space-y-6">
                <div className="flex justify-center -mt-2">
                  <div className="px-4 py-1.5 rounded-2xl bg-white/70 backdrop-blur-md border border-slate-100 text-[10px] font-black uppercase tracking-widest text-slate-400 shadow-sm">
                    Derniers échanges
                  </div>
                </div>

                <AnimatePresence initial={false}>
                  {messages.map((message, index) => {
                    const isMe = message.sender_id === user?.id;
                    const showAvatar = index === 0 || messages[index - 1].sender_id !== message.sender_id;

                    return (
                      <motion.div
                        key={message.id}
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        className={`flex gap-3 ${isMe ? 'justify-end' : 'justify-start'}`}
                      >
                        {!isMe && (
                          <div className="w-8 flex-shrink-0 self-end">
                            {showAvatar && (
                              <Avatar className="h-8 w-8 border-2 border-white shadow-sm">
                                <AvatarImage src={selectedContact.avatar_url} />
                                <AvatarFallback className="bg-slate-200 text-[10px] font-bold">
                                  {selectedContact.name.charAt(0).toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                            )}
                          </div>
                        )}

                        <div className={`flex flex-col max-w-[80%] md:max-w-[70%] ${isMe ? 'items-end' : 'items-start'}`}>
                          <div
                            className={`px-4 py-2.5 rounded-3xl shadow-sm text-sm leading-relaxed transition-all hover:shadow-md max-w-full ${isMe
                              ? 'bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-br-sm'
                              : 'bg-white border border-slate-100 text-slate-800 rounded-bl-sm'
                              }`}
                          >
                            {/* Render Attachment if exists */}
                            {message.attachment_url && (
                              <div className="mb-2 max-w-[240px] overflow-hidden rounded-xl border border-white/10 bg-black/10">
                                {message.message_type === 'image' ? (
                                  <a href={message.attachment_url} target="_blank" rel="noreferrer">
                                    <img
                                      src={message.attachment_url}
                                      alt="Pièce jointe"
                                      className="w-full h-auto object-cover max-h-48 hover:scale-105 transition-transform duration-300"
                                      loading="lazy"
                                    />
                                  </a>
                                ) : (
                                  <a href={message.attachment_url} target="_blank" rel="noreferrer" className="flex items-center gap-2 p-3 hover:bg-black/5 transition-colors">
                                    <FileText className="h-6 w-6 opacity-80" />
                                    <span className="text-xs font-semibold underline underline-offset-2 truncate">Voir le document</span>
                                  </a>
                                )}
                              </div>
                            )}

                            {message.content && <p className="break-words">{message.content}</p>}
                          </div>
                          <div className={`flex items-center gap-1.5 mt-1.5 px-1 ${isMe ? 'flex-row-reverse' : ''}`}>
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
                              {format(new Date(message.created_at), 'HH:mm')}
                            </span>
                            {isMe && message.is_read && (
                              <CheckCircle2 className="h-3 w-3 text-emerald-500 drop-shadow-sm" />
                            )}
                            {isMe && !message.is_read && (
                              <div className="h-1 w-1 bg-slate-300 rounded-full" />
                            )}
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
                <div ref={messagesEndRef} className="h-2" />
              </div>
            </ScrollArea>

            {/* Chat Input */}
            <div className="p-6 bg-white/70 backdrop-blur-md border-t border-slate-100 transition-all duration-300">

              {/* Attachment Preview Area */}
              <AnimatePresence>
                {attachmentFile && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, height: 0 }}
                    animate={{ opacity: 1, y: 0, height: 'auto' }}
                    exit={{ opacity: 0, y: 10, height: 0 }}
                    className="mb-3 flex items-center gap-3"
                  >
                    <div className="relative group rounded-xl overflow-hidden border border-slate-200 bg-slate-50 shadow-sm flex items-center gap-3 pr-3">
                      {attachmentFile.type.startsWith('image/') ? (
                        <img
                          src={URL.createObjectURL(attachmentFile)}
                          alt="Preview"
                          className="h-16 w-16 object-cover border-r border-slate-200"
                        />
                      ) : (
                        <div className="h-16 w-16 bg-indigo-50 flex items-center justify-center border-r border-slate-200">
                          <FileText className="h-6 w-6 text-indigo-500" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0 py-2">
                        <p className="text-xs font-bold text-slate-700 truncate max-w-[150px]">{attachmentFile.name}</p>
                        <p className="text-[10px] text-slate-500 font-medium">{(attachmentFile.size / 1024 / 1024).toFixed(2)} MB</p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={removeAttachment}
                        className="h-7 w-7 rounded-full bg-slate-200 hover:bg-red-100 hover:text-red-500 transition-colors text-slate-500"
                      >
                        <X className="h-3.5 w-3.5" />
                      </Button>

                      {/* Upload Progress Bar Overlay */}
                      {loading && uploadProgress > 0 && (
                        <div className="absolute bottom-0 left-0 h-1 bg-emerald-500/20 w-full">
                          <motion.div
                            className="h-full bg-emerald-500"
                            initial={{ width: 0 }}
                            animate={{ width: `${uploadProgress}%` }}
                          />
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="bg-slate-50 border border-slate-200 rounded-3xl p-2.5 focus-within:bg-white focus-within:border-emerald-500/50 focus-within:ring-4 focus-within:ring-emerald-500/5 transition-all shadow-sm relative">

                {/* Hidden File Input */}
                <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  accept="image/jpeg,image/png,image/webp,application/pdf"
                  onChange={handleFileSelect}
                />

                <div className="flex flex-col gap-2">
                  <Textarea
                    placeholder={attachmentFile ? "Ajouter une légende (optionnel)..." : "Ecrivez votre message..."}
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        sendMessage();
                      }
                    }}
                    disabled={loading}
                    className="w-full min-h-[44px] max-h-[160px] bg-transparent border-none text-slate-800 placeholder:text-slate-400 resize-none focus-visible:ring-0 px-3 py-2 text-sm leading-relaxed scrollbar-hide disabled:opacity-50"
                  />

                  <div className="flex items-center justify-between border-t border-slate-200/50 pt-2 px-1">
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        disabled={loading}
                        onClick={() => fileInputRef.current?.click()}
                        className="h-9 w-9 rounded-2xl text-slate-400 hover:text-emerald-500 hover:bg-emerald-50 transition-colors"
                      >
                        <Paperclip className="h-4.5 w-4.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        disabled={loading}
                        onClick={() => {
                          if (fileInputRef.current) {
                            fileInputRef.current.accept = 'image/*';
                            fileInputRef.current.click();
                          }
                        }}
                        className="h-9 w-9 rounded-2xl text-slate-400 hover:text-emerald-500 hover:bg-emerald-50 transition-colors"
                      >
                        <ImageIcon className="h-4.5 w-4.5" />
                      </Button>
                      <Button variant="ghost" size="icon" disabled={loading} className="h-9 w-9 rounded-2xl text-slate-400 hover:text-emerald-500 hover:bg-emerald-50">
                        <Mic className="h-4.5 w-4.5" />
                      </Button>
                      <div className="w-px h-4 bg-slate-200 mx-1" />
                      <Button variant="ghost" size="icon" disabled={loading} className="h-9 w-9 rounded-2xl text-slate-400 hover:text-emerald-500 hover:bg-emerald-50">
                        <Smile className="h-4.5 w-4.5" />
                      </Button>
                    </div>

                    <Button
                      onClick={sendMessage}
                      disabled={(!newMessage.trim() && !attachmentFile) || loading}
                      className="h-10 px-6 rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-700 text-white font-black shadow-lg shadow-emerald-200 hover:scale-[1.02] transform transition-all active:scale-95 disabled:scale-100 disabled:opacity-50"
                    >
                      <span>{loading ? 'Envoi...' : 'Envoyer'}</span>
                      <Send className={`ml-2 h-4 w-4 ${loading ? 'animate-pulse' : ''}`} />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center p-12 bg-slate-50/30">
            <div className="max-w-sm text-center space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-1000">
              <div className="relative mx-auto w-32 h-32">
                <div className="absolute inset-0 bg-emerald-100 rounded-[40px] rotate-6 animate-pulse" />
                <div className="absolute inset-0 bg-emerald-500/10 rounded-[40px] -rotate-6" />
                <div className="relative h-full w-full bg-white rounded-[40px] shadow-2xl border border-emerald-100 flex items-center justify-center overflow-hidden">
                  <motion.div
                    animate={{
                      y: [0, -10, 0],
                      rotate: [0, 5, -5, 0]
                    }}
                    transition={{
                      duration: 4,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  >
                    <MessageCircle className="h-16 w-16 text-emerald-500 drop-shadow-sm" />
                  </motion.div>
                </div>
              </div>

              <div className="space-y-3">
                <h2 className="text-3xl font-black text-slate-900 tracking-tight">Vos Conversations</h2>
                <p className="text-slate-500 font-medium leading-relaxed">
                  Sélectionnez un contact pour démarrer un échange sécurisé avec votre médecin, pharmacien ou livreur.
                </p>
              </div>

              <div className="flex justify-center gap-4">
                <div className="flex -space-x-3 overflow-hidden">
                  {[1, 2, 3, 4].map(i => (
                    <div key={i} className="inline-block h-10 w-10 rounded-full ring-4 ring-white shadow-md bg-slate-100 overflow-hidden">
                      <img src={`https://i.pravatar.cc/100?img=${i + 10}`} alt="User" className="h-full w-full object-cover grayscale opacity-60" />
                    </div>
                  ))}
                </div>
                <div className="flex items-center text-xs font-black text-slate-400 uppercase tracking-widest pt-3">
                  +150 Professionnels
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};