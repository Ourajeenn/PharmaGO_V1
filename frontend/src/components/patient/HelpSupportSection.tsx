import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import {
    HelpCircle, MessageCircle, Phone, Mail, FileText, Search,
    ChevronRight, ExternalLink, BookOpen, Video, AlertCircle,
    CheckCircle, Clock, Send, Loader2
} from 'lucide-react'
import { toast } from 'sonner'

interface FAQ {
    id: string
    question: string
    answer: string
    category: string
}

export const HelpSupportSection = () => {
    const [searchQuery, setSearchQuery] = useState('')
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [contactForm, setContactForm] = useState({
        subject: '',
        message: ''
    })

    const faqs: FAQ[] = [
        {
            id: '1',
            question: 'Comment passer une commande de médicaments?',
            answer: 'Pour commander, allez dans l\'onglet "Médicaments", recherchez le produit souhaité, ajoutez-le au panier puis procédez au paiement via Mobile Money. Vous recevrez une confirmation par SMS.',
            category: 'commandes'
        },
        {
            id: '2',
            question: 'Quels sont les délais de livraison?',
            answer: 'Livraison Express: 45 minutes en zone urbaine. Livraison Standard: 2 heures. Les délais peuvent varier selon la disponibilité en pharmacie et le trafic.',
            category: 'livraison'
        },
        {
            id: '3',
            question: 'Comment télécharger une ordonnance?',
            answer: 'Dans votre tableau de bord, cliquez sur "Mes Ordonnances" puis "Télécharger". Prenez une photo claire de votre ordonnance. Notre équipe la validera sous 15 minutes.',
            category: 'ordonnances'
        },
        {
            id: '4',
            question: 'Comment fonctionne le remboursement CMU?',
            answer: 'Si vous avez une carte CMU, ajoutez-la dans votre profil. Le remboursement (50-70% selon les médicaments) sera calculé automatiquement et déduit de votre total.',
            category: 'remboursement'
        },
        {
            id: '5',
            question: 'Puis-je annuler ma commande?',
            answer: 'Vous pouvez annuler gratuitement tant que la pharmacie n\'a pas commencé la préparation. Une fois "En préparation", des frais de 500 FCFA s\'appliquent.',
            category: 'commandes'
        },
        {
            id: '6',
            question: 'Comment suivre ma livraison en temps réel?',
            answer: 'Une fois votre commande expédiée, cliquez sur "Suivre" dans "Mes Commandes". Vous verrez la position GPS du livreur en temps réel sur la carte.',
            category: 'livraison'
        },
        {
            id: '7',
            question: 'Quels moyens de paiement sont acceptés?',
            answer: 'Nous acceptons: Orange Money, MTN Mobile Money, Wave, Moov Money. Le paiement par carte bancaire sera bientôt disponible.',
            category: 'paiement'
        },
        {
            id: '8',
            question: 'Comment contacter le livreur?',
            answer: 'Sur la page de suivi, vous avez les boutons "Appeler" et "Message" pour contacter directement votre livreur. Vous pouvez aussi lui envoyer un message via WhatsApp.',
            category: 'livraison'
        }
    ]

    const guides = [
        { id: '1', title: 'Première commande', description: 'Guide pas à pas pour votre première commande', icon: BookOpen, duration: '3 min' },
        { id: '2', title: 'Gérer mes ordonnances', description: 'Télécharger et renouveler vos ordonnances', icon: FileText, duration: '2 min' },
        { id: '3', title: 'Suivi de livraison', description: 'Suivre votre commande en temps réel', icon: Video, duration: '1 min' },
        { id: '4', title: 'Remboursement CMU', description: 'Comprendre le remboursement assurance', icon: CheckCircle, duration: '2 min' }
    ]

    const filteredFaqs = faqs.filter(faq =>
        faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
        faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
    )

    const handleSubmitTicket = async () => {
        if (!contactForm.subject || !contactForm.message) {
            toast.error('Veuillez remplir tous les champs')
            return
        }

        setIsSubmitting(true)
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1500))
        setIsSubmitting(false)

        toast.success('Message envoyé!', { description: 'Notre équipe vous répondra sous 24h.' })
        setContactForm({ subject: '', message: '' })
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="text-center space-y-2">
                <h3 className="text-2xl font-black tracking-tight">Aide & Support</h3>
                <p className="text-sm text-muted-foreground">Comment pouvons-nous vous aider?</p>
            </div>

            {/* Search */}
            <div className="relative max-w-md mx-auto">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                    placeholder="Rechercher dans l'aide..."
                    className="pl-10 h-12 rounded-xl bg-white/50"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="glass-card border-green-200 hover:shadow-lg transition-all cursor-pointer group">
                    <CardContent className="p-4 flex items-center gap-3">
                        <div className="p-3 bg-green-100 rounded-xl group-hover:scale-110 transition-transform">
                            <Phone className="h-5 w-5 text-green-600" />
                        </div>
                        <div>
                            <p className="font-bold">Appeler</p>
                            <p className="text-sm text-muted-foreground">+225 07 00 00 00</p>
                        </div>
                    </CardContent>
                </Card>
                <Card className="glass-card border-blue-200 hover:shadow-lg transition-all cursor-pointer group">
                    <CardContent className="p-4 flex items-center gap-3">
                        <div className="p-3 bg-blue-100 rounded-xl group-hover:scale-110 transition-transform">
                            <MessageCircle className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                            <p className="font-bold">WhatsApp</p>
                            <p className="text-sm text-muted-foreground">Chat en direct</p>
                        </div>
                    </CardContent>
                </Card>
                <Card className="glass-card border-purple-200 hover:shadow-lg transition-all cursor-pointer group">
                    <CardContent className="p-4 flex items-center gap-3">
                        <div className="p-3 bg-purple-100 rounded-xl group-hover:scale-110 transition-transform">
                            <Mail className="h-5 w-5 text-purple-600" />
                        </div>
                        <div>
                            <p className="font-bold">Email</p>
                            <p className="text-sm text-muted-foreground">support@pharmago.ci</p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Tabs defaultValue="faq" className="space-y-6">
                <TabsList className="bg-white/50 p-1 rounded-xl w-full max-w-md mx-auto">
                    <TabsTrigger value="faq" className="flex-1 rounded-lg">FAQ</TabsTrigger>
                    <TabsTrigger value="guides" className="flex-1 rounded-lg">Guides</TabsTrigger>
                    <TabsTrigger value="contact" className="flex-1 rounded-lg">Contact</TabsTrigger>
                </TabsList>

                {/* FAQ Tab */}
                <TabsContent value="faq" className="space-y-4">
                    <Accordion type="single" collapsible className="space-y-2">
                        {filteredFaqs.map((faq) => (
                            <AccordionItem key={faq.id} value={faq.id} className="glass-card border rounded-xl px-4">
                                <AccordionTrigger className="hover:no-underline py-4">
                                    <div className="flex items-center gap-3 text-left">
                                        <HelpCircle className="h-5 w-5 text-primary flex-shrink-0" />
                                        <span className="font-medium">{faq.question}</span>
                                    </div>
                                </AccordionTrigger>
                                <AccordionContent className="pb-4 pl-8 text-muted-foreground">
                                    {faq.answer}
                                </AccordionContent>
                            </AccordionItem>
                        ))}
                    </Accordion>

                    {filteredFaqs.length === 0 && (
                        <div className="text-center py-8">
                            <AlertCircle className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
                            <p className="text-muted-foreground">Aucun résultat pour "{searchQuery}"</p>
                        </div>
                    )}
                </TabsContent>

                {/* Guides Tab */}
                <TabsContent value="guides" className="space-y-4">
                    <div className="grid gap-4">
                        {guides.map((guide) => {
                            const Icon = guide.icon
                            return (
                                <Card key={guide.id} className="glass-card hover:shadow-lg transition-all cursor-pointer group">
                                    <CardContent className="p-4">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 bg-primary/10 rounded-lg group-hover:scale-110 transition-transform">
                                                    <Icon className="h-5 w-5 text-primary" />
                                                </div>
                                                <div>
                                                    <h4 className="font-bold">{guide.title}</h4>
                                                    <p className="text-sm text-muted-foreground">{guide.description}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Badge variant="secondary" className="text-xs">
                                                    <Clock className="h-3 w-3 mr-1" />
                                                    {guide.duration}
                                                </Badge>
                                                <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:translate-x-1 transition-transform" />
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            )
                        })}
                    </div>
                </TabsContent>

                {/* Contact Tab */}
                <TabsContent value="contact" className="space-y-4">
                    <Card className="glass-card">
                        <CardHeader>
                            <CardTitle className="text-lg">Envoyer un message</CardTitle>
                            <CardDescription>Notre équipe vous répondra sous 24h</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Sujet</label>
                                <Input
                                    placeholder="Ex: Problème de livraison"
                                    value={contactForm.subject}
                                    onChange={(e) => setContactForm(prev => ({ ...prev, subject: e.target.value }))}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Message</label>
                                <Textarea
                                    placeholder="Décrivez votre problème en détail..."
                                    rows={4}
                                    value={contactForm.message}
                                    onChange={(e) => setContactForm(prev => ({ ...prev, message: e.target.value }))}
                                />
                            </div>
                            <Button
                                className="w-full rounded-xl"
                                onClick={handleSubmitTicket}
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? (
                                    <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Envoi...</>
                                ) : (
                                    <><Send className="h-4 w-4 mr-2" /> Envoyer</>
                                )}
                            </Button>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    )
}

export default HelpSupportSection
