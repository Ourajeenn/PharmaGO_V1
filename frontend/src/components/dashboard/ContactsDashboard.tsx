import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import {
    Search,
    Plus,
    Filter,
    MessageCircle,
    Phone,
    Star,
    MoreVertical,
    Mail,
    MapPin,
    Pill
} from 'lucide-react'
import { toast } from 'sonner'

interface Contact {
    id: string
    name: string
    role: string
    status: 'Active' | 'Inactive'
    location: string
    tags: string[]
    avatar?: string
    isFavorite: boolean
}

export const ContactsDashboard = () => {
    const [searchQuery, setSearchQuery] = useState('')
    const [selectedLetter, setSelectedLetter] = useState('M')

    const [contacts, setContacts] = useState<Contact[]>([
        {
            id: '1',
            name: 'Julia Gomes',
            role: 'Zencorporation',
            status: 'Active',
            location: 'San Francisco, USA',
            tags: [],
            isFavorite: true
        },
        {
            id: '2',
            name: 'Carolina Cunha',
            role: 'Grooveshark',
            status: 'Inactive',
            location: 'Paris, France',
            tags: [],
            isFavorite: true
        },
        {
            id: '3',
            name: 'Anna Maria',
            role: 'Telecentrics',
            status: 'Active',
            location: 'Warsaw, Poland',
            tags: [],
            isFavorite: true
        },
        {
            id: '4',
            name: 'Clara Alves',
            role: 'Toughzap',
            status: 'Active',
            location: 'Zurich, Switzerland',
            tags: [],
            isFavorite: true
        },
        {
            id: '5',
            name: 'Robert Marter',
            role: 'Grooveshark',
            status: 'Active',
            location: 'San Francisco, USA',
            tags: ['CLIENT', 'WORKSHOP'],
            isFavorite: false
        },
        {
            id: '6',
            name: 'Seth Meyes - Tuttiano',
            role: 'Konmatfix',
            status: 'Active',
            location: 'Los Angeles, USA',
            tags: ['INTERNAL WORKS', 'BOARD ROOM'],
            isFavorite: false
        },
        {
            id: '7',
            name: 'Derek Mimhouse',
            role: 'Grooveshark',
            status: 'Inactive',
            location: 'Miami, USA',
            tags: ['CLIENT'],
            isFavorite: false
        },
        {
            id: '8',
            name: 'Gabriele Morvalho',
            role: 'Konmatfix',
            status: 'Active',
            location: 'Paris, France',
            tags: ['BOARD ROOM', 'WORKSHOP', 'INTERNAL WORKS'],
            isFavorite: false
        },
        {
            id: '9',
            name: 'Murilo Nakroncalves',
            role: 'Toughzap',
            status: 'Active',
            location: 'Toronto, CA',
            tags: ['WORKSHOP'],
            isFavorite: false
        }
    ])

    const alphabet = 'ABCDEFGHIJKLMNOPQRSTU'.split('')

    const favoriteContacts = contacts.filter(c => c.isFavorite)
    const regularContacts = contacts.filter(c => !c.isFavorite)

    const handleSendMessage = (contactName: string) => {
        toast.success(`Message envoyé à ${contactName}`)
    }

    const handleCall = (contactName: string) => {
        toast.success(`Appel vers ${contactName}`)
    }

    const toggleFavorite = (contactId: string) => {
        setContacts(prev => prev.map(contact =>
            contact.id === contactId
                ? { ...contact, isFavorite: !contact.isFavorite }
                : contact
        ))
    }

    const getTagColor = (tag: string) => {
        const colors: Record<string, string> = {
            'CLIENT': 'bg-purple-100 text-purple-700 border-purple-200',
            'WORKSHOP': 'bg-green-100 text-green-700 border-green-200',
            'BOARD ROOM': 'bg-pink-100 text-pink-700 border-pink-200',
            'INTERNAL WORKS': 'bg-orange-100 text-orange-700 border-orange-200'
        }
        return colors[tag] || 'bg-gray-100 text-gray-700 border-gray-200'
    }

    return (
        <div className="flex h-screen bg-gradient-to-br from-purple-50 to-pink-50 overflow-hidden">
            {/* Alphabetical Sidebar */}
            <aside className="w-28 bg-gradient-to-b from-blue-600 to-indigo-700 flex flex-col items-center py-8 shadow-xl">
                <div className="flex flex-col items-center gap-6 mb-8">
                    <button className="text-white/60 hover:text-white transition-colors">
                        <Settings className="h-5 w-5" />
                    </button>
                    <button className="text-white/60 hover:text-white transition-colors">
                        <Users className="h-5 w-5" />
                    </button>
                    <button className="text-white/60 hover:text-white transition-colors">
                        <Mail className="h-5 w-5" />
                    </button>
                    <button className="text-white/60 hover:text-white transition-colors">
                        <CalendarIcon className="h-5 w-5" />
                    </button>
                </div>

                <div className="flex-1 flex flex-col items-center gap-1 overflow-y-auto py-4">
                    <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-2 rotate-180" style={{ writingMode: 'vertical-rl' }}>
                        Alphabetical sorting
                    </p>
                    {alphabet.map((letter) => (
                        <button
                            key={letter}
                            onClick={() => setSelectedLetter(letter)}
                            className={`w-10 h-10 rounded-lg flex items-center justify-center text-sm font-bold transition-all ${selectedLetter === letter
                                    ? 'bg-white text-blue-600 shadow-lg'
                                    : 'text-white/60 hover:text-white hover:bg-white/10'
                                }`}
                        >
                            {letter}
                        </button>
                    ))}
                </div>

                <div className="mt-auto">
                    <button className="text-white/60 hover:text-white transition-colors">
                        <MoreVertical className="h-5 w-5" />
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto">
                {/* Header */}
                <header className="bg-white/80 backdrop-blur-md border-b border-slate-200/60 px-8 py-5">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-6">
                            <div className="w-10 h-10 bg-gradient-to-br from-pink-400 to-purple-400 rounded-xl flex items-center justify-center">
                                <Pill className="h-6 w-6 text-white" />
                            </div>

                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                <Input
                                    placeholder="Search"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pl-10 w-64 bg-slate-50 border-slate-200 rounded-lg h-10"
                                />
                            </div>

                            <h1 className="text-xl font-bold text-slate-900">DOZ Pharmacy - Contacts</h1>
                        </div>

                        <div className="flex items-center gap-3">
                            <Button className="bg-pink-400 hover:bg-pink-500 text-white px-6 rounded-lg font-semibold">
                                <Plus className="h-4 w-4 mr-2" />
                                ADD CONTACT
                            </Button>
                            <Button variant="outline" size="icon" className="h-10 w-10 rounded-lg border-slate-300">
                                <Filter className="h-4 w-4 text-slate-600" />
                            </Button>
                            <Button className="bg-blue-600 hover:bg-blue-700 text-white h-10 w-10 rounded-lg">
                                <Search className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                </header>

                {/* Content */}
                <div className="p-8 space-y-8">
                    {/* Favorite Section */}
                    <div>
                        <h2 className="text-lg font-bold text-slate-900 mb-4">Favorite</h2>
                        <div className="grid grid-cols-4 gap-4">
                            {favoriteContacts.map((contact) => (
                                <Card key={contact.id} className="bg-white border-slate-200 hover:shadow-lg transition-all">
                                    <CardContent className="p-5">
                                        <div className="flex items-start justify-between mb-4">
                                            <div className="flex items-center gap-3">
                                                <Avatar className="h-12 w-12">
                                                    <AvatarImage src={contact.avatar} />
                                                    <AvatarFallback className="bg-gradient-to-br from-blue-400 to-purple-400 text-white font-semibold">
                                                        {contact.name.split(' ').map(n => n[0]).join('')}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div>
                                                    <h3 className="font-semibold text-sm text-slate-900">{contact.name}</h3>
                                                    <p className="text-xs text-slate-500">{contact.role}</p>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => toggleFavorite(contact.id)}
                                                className="text-yellow-500 hover:text-yellow-600"
                                            >
                                                <Star className="h-4 w-4 fill-current" />
                                            </button>
                                        </div>

                                        <div className="space-y-2 mb-4">
                                            <div className="flex items-center gap-2">
                                                <Badge variant="outline" className={`text-[10px] font-semibold ${contact.status === 'Active' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-gray-50 text-gray-700 border-gray-200'
                                                    }`}>
                                                    {contact.status}
                                                </Badge>
                                            </div>
                                            <div className="flex items-center gap-2 text-xs text-slate-600">
                                                <MapPin className="h-3 w-3" />
                                                <span>{contact.location}</span>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="flex-1 text-xs text-slate-500 hover:text-blue-600"
                                                onClick={() => handleSendMessage(contact.name)}
                                            >
                                                <MessageCircle className="h-3 w-3 mr-1" />
                                                Send message
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="flex-1 text-xs text-slate-500 hover:text-blue-600"
                                                onClick={() => handleCall(contact.name)}
                                            >
                                                <Phone className="h-3 w-3 mr-1" />
                                                Call
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </div>

                    {/* Contacts List */}
                    <div>
                        <h2 className="text-lg font-bold text-slate-900 mb-4">Contacts list</h2>
                        <Card className="bg-white border-slate-200">
                            <CardContent className="p-0">
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead className="bg-slate-50 border-b border-slate-200">
                                            <tr>
                                                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                                    Name
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                                    Status
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                                    Location
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                                    Tags
                                                </th>
                                                <th className="px-6 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                                    Actions
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-200">
                                            {regularContacts.map((contact) => (
                                                <tr key={contact.id} className="hover:bg-slate-50 transition-colors">
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center gap-3">
                                                            <Avatar className="h-10 w-10">
                                                                <AvatarImage src={contact.avatar} />
                                                                <AvatarFallback className="bg-gradient-to-br from-blue-400 to-purple-400 text-white font-semibold text-sm">
                                                                    {contact.name.split(' ').map(n => n[0]).join('')}
                                                                </AvatarFallback>
                                                            </Avatar>
                                                            <div>
                                                                <p className="font-semibold text-sm text-slate-900">{contact.name}</p>
                                                                <p className="text-xs text-slate-500">{contact.role}</p>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <Badge variant="outline" className={`text-xs font-semibold ${contact.status === 'Active' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-gray-50 text-gray-700 border-gray-200'
                                                            }`}>
                                                            {contact.status}
                                                        </Badge>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <span className="text-sm text-slate-600">{contact.location}</span>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="flex flex-wrap gap-1">
                                                            {contact.tags.map((tag, index) => (
                                                                <Badge
                                                                    key={index}
                                                                    variant="outline"
                                                                    className={`text-[10px] font-semibold ${getTagColor(tag)}`}
                                                                >
                                                                    {tag}
                                                                </Badge>
                                                            ))}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center justify-end gap-2">
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                className="text-xs text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                                                                onClick={() => handleSendMessage(contact.name)}
                                                            >
                                                                <MessageCircle className="h-3.5 w-3.5 mr-1" />
                                                                Send message
                                                            </Button>
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                className="text-xs text-slate-600 hover:text-slate-700 hover:bg-slate-100"
                                                                onClick={() => handleCall(contact.name)}
                                                            >
                                                                <Phone className="h-3.5 w-3.5 mr-1" />
                                                                Call
                                                            </Button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </main>

            {/* Decorative Element */}
            <div className="fixed bottom-8 right-8 w-12 h-24 bg-gradient-to-b from-pink-400 to-pink-500 rounded-full opacity-60 blur-sm"></div>
        </div>
    )
}

// Missing imports
import { Settings, Users, Calendar as CalendarIcon } from 'lucide-react'
