import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
    Search,
    Heart,
    Brain,
    Stethoscope,
    Eye,
    Baby,
    Bone,
    Activity,
    Pill,
    Scissors,
    Star,
    MapPin,
    Clock,
    Phone,
    Video,
    Calendar,
    Filter,
    X
} from 'lucide-react'

export interface Specialty {
    id: string
    name: string
    nameFr: string
    icon: React.ElementType
    color: string
}

export const specialties: Specialty[] = [
    { id: 'general', name: 'General Practice', nameFr: 'Médecine Générale', icon: Stethoscope, color: 'bg-blue-500' },
    { id: 'cardiology', name: 'Cardiology', nameFr: 'Cardiologie', icon: Heart, color: 'bg-red-500' },
    { id: 'neurology', name: 'Neurology', nameFr: 'Neurologie', icon: Brain, color: 'bg-purple-500' },
    { id: 'ophthalmology', name: 'Ophthalmology', nameFr: 'Ophtalmologie', icon: Eye, color: 'bg-cyan-500' },
    { id: 'pediatrics', name: 'Pediatrics', nameFr: 'Pédiatrie', icon: Baby, color: 'bg-pink-500' },
    { id: 'orthopedics', name: 'Orthopedics', nameFr: 'Orthopédie', icon: Bone, color: 'bg-orange-500' },
    { id: 'psychiatry', name: 'Psychiatry', nameFr: 'Psychiatrie', icon: Activity, color: 'bg-indigo-500' },
    { id: 'dermatology', name: 'Dermatology', nameFr: 'Dermatologie', icon: Pill, color: 'bg-yellow-500' },
    { id: 'surgery', name: 'Surgery', nameFr: 'Chirurgie', icon: Scissors, color: 'bg-slate-500' }
]

interface Doctor {
    id: string
    name: string
    specialty: string
    specialtyId: string
    avatar?: string
    rating: number
    reviews: number
    location: string
    distance: string
    nextAvailable: string
    consultationFee: number
    languages: string[]
    teleconsult: boolean
}

const mockDoctors: Doctor[] = [
    {
        id: '1',
        name: 'Dr. Konan Yves',
        specialty: 'Cardiologie',
        specialtyId: 'cardiology',
        rating: 4.9,
        reviews: 127,
        location: 'Clinique Farah, Cocody',
        distance: '2.3 km',
        nextAvailable: "Aujourd'hui 14:30",
        consultationFee: 25000,
        languages: ['Français', 'Anglais'],
        teleconsult: true
    },
    {
        id: '2',
        name: 'Dr. Bamba Aminata',
        specialty: 'Pédiatrie',
        specialtyId: 'pediatrics',
        rating: 4.8,
        reviews: 89,
        location: 'Hôpital Mère-Enfant, Treichville',
        distance: '4.1 km',
        nextAvailable: 'Demain 09:00',
        consultationFee: 20000,
        languages: ['Français'],
        teleconsult: true
    },
    {
        id: '3',
        name: 'Dr. Touré Mamadou',
        specialty: 'Neurologie',
        specialtyId: 'neurology',
        rating: 4.7,
        reviews: 64,
        location: 'CHU Cocody',
        distance: '5.8 km',
        nextAvailable: 'Lundi 10:00',
        consultationFee: 35000,
        languages: ['Français', 'Anglais', 'Dioula'],
        teleconsult: false
    },
    {
        id: '4',
        name: 'Dr. Diallo Fatou',
        specialty: 'Médecine Générale',
        specialtyId: 'general',
        rating: 4.6,
        reviews: 203,
        location: 'Cabinet Médical Plateau',
        distance: '1.2 km',
        nextAvailable: "Aujourd'hui 16:00",
        consultationFee: 15000,
        languages: ['Français'],
        teleconsult: true
    }
]

interface DoctorSpecialtiesFilterProps {
    onDoctorSelect?: (doctor: Doctor) => void
}

export const DoctorSpecialtiesFilter = ({ onDoctorSelect }: DoctorSpecialtiesFilterProps) => {
    const [searchQuery, setSearchQuery] = useState('')
    const [selectedSpecialties, setSelectedSpecialties] = useState<string[]>([])
    const [teleconsultOnly, setTeleconsultOnly] = useState(false)

    const toggleSpecialty = (id: string) => {
        setSelectedSpecialties(prev =>
            prev.includes(id)
                ? prev.filter(s => s !== id)
                : [...prev, id]
        )
    }

    const clearFilters = () => {
        setSelectedSpecialties([])
        setTeleconsultOnly(false)
        setSearchQuery('')
    }

    const filteredDoctors = mockDoctors.filter(doctor => {
        const matchesSearch = doctor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            doctor.specialty.toLowerCase().includes(searchQuery.toLowerCase())
        const matchesSpecialty = selectedSpecialties.length === 0 ||
            selectedSpecialties.includes(doctor.specialtyId)
        const matchesTeleconsult = !teleconsultOnly || doctor.teleconsult

        return matchesSearch && matchesSpecialty && matchesTeleconsult
    })

    return (
        <div className="space-y-6">
            {/* Search Bar */}
            <Card className="glass-morphism border-white/20">
                <CardContent className="p-4">
                    <div className="flex gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Rechercher un médecin ou une spécialité..."
                                className="pl-10 rounded-xl"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        <Button
                            variant={teleconsultOnly ? "default" : "outline"}
                            className="rounded-xl"
                            onClick={() => setTeleconsultOnly(!teleconsultOnly)}
                        >
                            <Video className="h-4 w-4 mr-2" />
                            Téléconsultation
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Specialty Filter Grid */}
            <Card className="glass-morphism border-white/20">
                <CardHeader className="pb-3">
                    <div className="flex justify-between items-center">
                        <CardTitle className="text-lg flex items-center gap-2">
                            <Filter className="h-5 w-5" />
                            Spécialités médicales
                        </CardTitle>
                        {(selectedSpecialties.length > 0 || teleconsultOnly) && (
                            <Button variant="ghost" size="sm" onClick={clearFilters} className="text-xs">
                                <X className="h-3 w-3 mr-1" />
                                Effacer filtres
                            </Button>
                        )}
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-3 md:grid-cols-5 lg:grid-cols-9 gap-2">
                        {specialties.map((specialty) => {
                            const Icon = specialty.icon
                            const isSelected = selectedSpecialties.includes(specialty.id)
                            return (
                                <button
                                    key={specialty.id}
                                    onClick={() => toggleSpecialty(specialty.id)}
                                    className={`flex flex-col items-center gap-2 p-3 rounded-xl border transition-all ${isSelected
                                            ? 'border-primary bg-primary/10 shadow-lg'
                                            : 'border-white/20 hover:border-primary/50 bg-white/5'
                                        }`}
                                >
                                    <div className={`p-2 rounded-lg ${specialty.color} text-white`}>
                                        <Icon className="h-5 w-5" />
                                    </div>
                                    <span className="text-[10px] font-bold text-center leading-tight">
                                        {specialty.nameFr}
                                    </span>
                                </button>
                            )
                        })}
                    </div>
                </CardContent>
            </Card>

            {/* Results */}
            <div className="space-y-4">
                <div className="flex justify-between items-center">
                    <h3 className="font-bold text-lg">
                        {filteredDoctors.length} médecin{filteredDoctors.length > 1 ? 's' : ''} trouvé{filteredDoctors.length > 1 ? 's' : ''}
                    </h3>
                    <div className="flex gap-2">
                        {selectedSpecialties.map(id => {
                            const spec = specialties.find(s => s.id === id)
                            return spec && (
                                <Badge key={id} variant="secondary" className="rounded-full text-xs">
                                    {spec.nameFr}
                                    <button onClick={() => toggleSpecialty(id)} className="ml-1">
                                        <X className="h-3 w-3" />
                                    </button>
                                </Badge>
                            )
                        })}
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {filteredDoctors.map((doctor) => (
                        <Card key={doctor.id} className="glass-card hover:shadow-lg transition-all cursor-pointer group" onClick={() => onDoctorSelect?.(doctor)}>
                            <CardContent className="p-4">
                                <div className="flex gap-4">
                                    <Avatar className="h-16 w-16 border-2 border-white/40">
                                        <AvatarImage src={doctor.avatar} />
                                        <AvatarFallback className="bg-gradient-to-br from-primary to-blue-600 text-white font-bold">
                                            {doctor.name.split(' ').map(n => n[0]).join('')}
                                        </AvatarFallback>
                                    </Avatar>

                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <h4 className="font-bold truncate">{doctor.name}</h4>
                                                <p className="text-sm text-primary font-medium">{doctor.specialty}</p>
                                            </div>
                                            <div className="flex items-center gap-1 bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">
                                                <Star className="h-3 w-3 fill-current" />
                                                <span className="text-xs font-bold">{doctor.rating}</span>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                                            <span className="flex items-center gap-1">
                                                <MapPin className="h-3 w-3" />
                                                {doctor.distance}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <Clock className="h-3 w-3 text-green-500" />
                                                {doctor.nextAvailable}
                                            </span>
                                        </div>

                                        <div className="flex items-center justify-between mt-3">
                                            <span className="font-bold text-lg">{doctor.consultationFee.toLocaleString()} F</span>
                                            <div className="flex gap-2">
                                                {doctor.teleconsult && (
                                                    <Button size="sm" variant="outline" className="rounded-lg h-8">
                                                        <Video className="h-3 w-3" />
                                                    </Button>
                                                )}
                                                <Button size="sm" variant="outline" className="rounded-lg h-8">
                                                    <Phone className="h-3 w-3" />
                                                </Button>
                                                <Button size="sm" className="rounded-lg h-8">
                                                    <Calendar className="h-3 w-3 mr-1" />
                                                    RDV
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </div>
    )
}
