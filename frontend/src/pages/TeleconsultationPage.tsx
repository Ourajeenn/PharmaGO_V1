import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import {
    Video,
    Search,
    Star,
    Clock,
    Calendar,
    ChevronRight,
    Stethoscope,
    Shield,
    ArrowLeft,
    Phone,
    MessageCircle,
} from 'lucide-react';
import { VideoConsultation } from '@/components/consultation/VideoConsultation';
import AppointmentBookingDialog from '@/components/consultation/AppointmentBookingDialog';
import { toast } from 'sonner';

interface Doctor {
    id: string;
    name: string;
    specialty: string;
    rating: number;
    reviews: number;
    experience: string;
    price: number;
    available: boolean;
    avatar?: string;
    languages: string[];
    nextSlot: string;
}

const DOCTORS: Doctor[] = [
    {
        id: '1',
        name: 'Dr. Kouamé Assoua',
        specialty: 'Médecin généraliste',
        rating: 4.9,
        reviews: 312,
        experience: '15 ans',
        price: 5000,
        available: true,
        languages: ['Français', 'Dioula'],
        nextSlot: 'Maintenant',
    },
    {
        id: '2',
        name: 'Dr. Fatou Diallo',
        specialty: 'Pédiatre',
        rating: 4.8,
        reviews: 247,
        experience: '12 ans',
        price: 7500,
        available: true,
        languages: ['Français', 'Anglais'],
        nextSlot: '15 min',
    },
    {
        id: '3',
        name: 'Dr. Ibrahim Coulibaly',
        specialty: 'Cardiologue',
        rating: 4.7,
        reviews: 189,
        experience: '20 ans',
        price: 10000,
        available: false,
        languages: ['Français'],
        nextSlot: '14h00',
    },
    {
        id: '4',
        name: 'Dr. Aya Brou',
        specialty: 'Dermatologue',
        rating: 4.6,
        reviews: 145,
        experience: '8 ans',
        price: 8000,
        available: true,
        languages: ['Français', 'Baoulé'],
        nextSlot: '30 min',
    },
    {
        id: '5',
        name: 'Dr. Moussa Konaté',
        specialty: 'Interniste',
        rating: 4.8,
        reviews: 203,
        experience: '18 ans',
        price: 9000,
        available: false,
        languages: ['Français', 'Anglais'],
        nextSlot: '16h30',
    },
];

const SPECIALTIES = ['Tous', 'Généraliste', 'Pédiatre', 'Cardiologue', 'Dermatologue', 'Interniste'];

type View = 'list' | 'video';

export default function TeleconsultationPage() {
    const [search, setSearch] = useState('');
    const [selectedSpecialty, setSelectedSpecialty] = useState('Tous');
    const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
    const [bookingOpen, setBookingOpen] = useState(false);
    const [view, setView] = useState<View>('list');

    const filtered = DOCTORS.filter((d) => {
        const matchSearch =
            d.name.toLowerCase().includes(search.toLowerCase()) ||
            d.specialty.toLowerCase().includes(search.toLowerCase());
        const matchSpecialty =
            selectedSpecialty === 'Tous' || d.specialty.includes(selectedSpecialty.replace('Généraliste', 'généraliste'));
        return matchSearch && matchSpecialty;
    });

    const startImmediate = (doctor: Doctor) => {
        if (!doctor.available) {
            toast.error(`${doctor.name} n'est pas disponible maintenant.`);
            return;
        }
        setSelectedDoctor(doctor);
        setView('video');
    };

    const openBooking = (doctor: Doctor) => {
        setSelectedDoctor(doctor);
        setBookingOpen(true);
    };

    if (view === 'video' && selectedDoctor) {
        return (
            <div className="space-y-4 max-w-2xl mx-auto p-4">
                <Button variant="ghost" className="gap-2" onClick={() => setView('list')}>
                    <ArrowLeft className="h-4 w-4" />
                    Retour aux médecins
                </Button>
                <VideoConsultation
                    patient={{ id: selectedDoctor.id, name: selectedDoctor.name }}
                    onEnd={() => setView('list')}
                />
            </div>
        );
    }

    return (
        <div className="space-y-6 p-4 max-w-3xl mx-auto">
            {/* Hero Banner */}
            <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-2xl p-6 text-white">
                <div className="absolute inset-0 opacity-10">
                    <div className="absolute top-4 right-8 w-32 h-32 rounded-full bg-white" />
                    <div className="absolute -bottom-8 -left-8 w-40 h-40 rounded-full bg-white" />
                </div>
                <div className="relative">
                    <div className="flex items-center gap-2 mb-2">
                        <Video className="h-6 w-6" />
                        <h1 className="text-2xl font-black">Téléconsultation</h1>
                    </div>
                    <p className="text-blue-100 text-sm mb-4">
                        Consultez un médecin en vidéo depuis chez vous, 7j/7
                    </p>
                    <div className="flex gap-4 text-xs">
                        {[
                            { icon: Shield, text: 'Consultation sécurisée' },
                            { icon: Clock, text: 'Réponse en 15 min' },
                            { icon: Star, text: 'Médecins certifiés' },
                        ].map(({ icon: Icon, text }) => (
                            <div key={text} className="flex items-center gap-1.5 bg-white/20 rounded-lg px-2.5 py-1.5">
                                <Icon className="h-3.5 w-3.5" />
                                <span>{text}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Search + Filters */}
            <div className="space-y-3">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Rechercher un médecin ou une spécialité..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-10"
                    />
                </div>
                <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
                    {SPECIALTIES.map((s) => (
                        <Button
                            key={s}
                            variant={selectedSpecialty === s ? 'default' : 'outline'}
                            size="sm"
                            className="whitespace-nowrap flex-shrink-0"
                            onClick={() => setSelectedSpecialty(s)}
                        >
                            {s}
                        </Button>
                    ))}
                </div>
            </div>

            {/* Doctors List */}
            <div className="space-y-3">
                <p className="text-sm text-muted-foreground">
                    {filtered.length} médecin{filtered.length > 1 ? 's' : ''} disponible{filtered.length > 1 ? 's' : ''}
                </p>

                {filtered.map((doctor) => (
                    <Card
                        key={doctor.id}
                        className="hover:shadow-md transition-all border-l-4"
                        style={{ borderLeftColor: doctor.available ? '#22c55e' : '#e2e8f0' }}
                    >
                        <CardContent className="p-4">
                            <div className="flex gap-4">
                                {/* Avatar */}
                                <div className="relative flex-shrink-0">
                                    <Avatar className="h-14 w-14">
                                        <AvatarImage src={doctor.avatar} />
                                        <AvatarFallback className="bg-blue-100 text-blue-700 font-semibold">
                                            {doctor.name.split(' ').slice(1).map((n) => n[0]).join('')}
                                        </AvatarFallback>
                                    </Avatar>
                                    {doctor.available && (
                                        <span className="absolute -bottom-0.5 -right-0.5 h-4 w-4 rounded-full bg-green-500 border-2 border-white" />
                                    )}
                                </div>

                                {/* Info */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-start justify-between gap-2">
                                        <div>
                                            <h3 className="font-semibold text-sm">{doctor.name}</h3>
                                            <p className="text-xs text-muted-foreground flex items-center gap-1">
                                                <Stethoscope className="h-3 w-3" />
                                                {doctor.specialty} · {doctor.experience}
                                            </p>
                                        </div>
                                        <Badge
                                            variant={doctor.available ? 'default' : 'secondary'}
                                            className={`text-xs flex-shrink-0 ${doctor.available
                                                ? 'bg-green-100 text-green-700 border-green-200'
                                                : ''
                                                }`}
                                        >
                                            {doctor.available ? '🟢 Disponible' : `⏰ ${doctor.nextSlot}`}
                                        </Badge>
                                    </div>

                                    {/* Rating & price */}
                                    <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                                        <span className="flex items-center gap-1">
                                            <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                                            <strong className="text-foreground">{doctor.rating}</strong>
                                            ({doctor.reviews} avis)
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <Clock className="h-3 w-3" />
                                            Prochain créneau : <strong className="text-foreground">{doctor.nextSlot}</strong>
                                        </span>
                                        <span className="ml-auto font-semibold text-foreground">
                                            {doctor.price.toLocaleString()} F
                                        </span>
                                    </div>

                                    {/* Languages */}
                                    <div className="flex gap-1 mt-2">
                                        {doctor.languages.map((l) => (
                                            <span key={l} className="text-[10px] bg-blue-50 text-blue-600 rounded px-1.5 py-0.5">
                                                {l}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex gap-2 mt-3 pt-3 border-t">
                                <Button
                                    size="sm"
                                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                                    onClick={() => startImmediate(doctor)}
                                    disabled={!doctor.available}
                                >
                                    <Video className="h-4 w-4 mr-1.5" />
                                    Consultation immédiate
                                </Button>
                                <Button
                                    size="sm"
                                    variant="outline"
                                    className="flex-1"
                                    onClick={() => openBooking(doctor)}
                                >
                                    <Calendar className="h-4 w-4 mr-1.5" />
                                    Prendre RDV
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                ))}

                {filtered.length === 0 && (
                    <div className="text-center py-12 text-muted-foreground">
                        <Stethoscope className="h-10 w-10 mx-auto mb-2 opacity-30" />
                        <p>Aucun médecin trouvé pour "{search}"</p>
                    </div>
                )}
            </div>

            {/* Appointment Booking Dialog */}
            {selectedDoctor && (
                <AppointmentBookingDialog
                    isOpen={bookingOpen}
                    onClose={() => setBookingOpen(false)}
                    specialty={selectedDoctor.specialty}
                />
            )}
        </div>
    );
}
