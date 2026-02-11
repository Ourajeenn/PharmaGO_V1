import {
    Home,
    ShoppingBag,
    FileText,
    MapPin,
    CreditCard,
    Heart,
    Package,
    Archive,
    Shield,
    BarChart2,
    Repeat,
    Users,
    Calendar,
    Database,
    MessageCircle,
    Route,
    DollarSign,
    Thermometer,
    CheckCircle,
    Settings
} from 'lucide-react'
import { LucideIcon } from 'lucide-react'

export interface NavItem {
    id: string
    icon: LucideIcon
    label: string
    path: string
}

export const navigationConfig = {
    patient: [
        { id: 'home', icon: Home, label: 'Accueil', path: '/dashboard' },
        { id: 'medicines', icon: ShoppingBag, label: 'Commander', path: '/medicaments' },
        { id: 'prescriptions', icon: FileText, label: 'Ordonnances', path: '/ordonnances' },
        { id: 'tracking', icon: MapPin, label: 'Suivi', path: '/suivi' },
        { id: 'wallet', icon: CreditCard, label: 'Portefeuille', path: '/paiement' },
        { id: 'health', icon: Heart, label: 'Santé', path: '/ecarnet' },
    ],
    pharmacy: [
        { id: 'home', icon: Home, label: 'Command Center', path: '/dashboard' },
        { id: 'orders', icon: Package, label: 'Commandes', path: '/dashboard' },
        { id: 'inventory', icon: Archive, label: 'Stock', path: '/dashboard' },
        { id: 'tiers-payant', icon: Shield, label: 'Tiers Payant', path: '/dashboard' },
        { id: 'analytics', icon: BarChart2, label: 'Statistiques', path: '/dashboard' },
        { id: 'transfers', icon: Repeat, label: 'Redistribution', path: '/dashboard' },
    ],
    doctor: [
        { id: 'home', icon: Home, label: 'Cabinet', path: '/dashboard' },
        { id: 'patients', icon: Users, label: 'Patients', path: '/dashboard' },
        { id: 'appointments', icon: Calendar, label: 'Rendez-vous', path: '/dashboard' },
        { id: 'prescriptions', icon: FileText, label: 'Ordonnances', path: '/ordonnances' },
        { id: 'drug-db', icon: Database, label: 'Base Médicaments', path: '/medicaments' },
        { id: 'messaging', icon: MessageCircle, label: 'Messagerie', path: '/contact' },
    ],
    driver: [
        { id: 'home', icon: Home, label: 'Tableau de Bord', path: '/dashboard' },
        { id: 'deliveries', icon: Package, label: 'Livraisons', path: '/dashboard?tab=active' },
        { id: 'routes', icon: Route, label: 'Itinéraires', path: '/dashboard?tab=route' },
        { id: 'earnings', icon: DollarSign, label: 'Gains', path: '/dashboard?tab=earnings' },
        { id: 'cold-chain', icon: Thermometer, label: 'Chaîne Froid', path: '/dashboard?tab=coldchain' },
        { id: 'zones', icon: MapPin, label: 'Zones', path: '/dashboard?tab=zones' },
    ],
    insurer: [
        { id: 'home', icon: Home, label: 'Dashboard', path: '/dashboard' },
        { id: 'claims', icon: FileText, label: 'Demandes', path: '/dashboard' },
        { id: 'coverage', icon: Shield, label: 'Couverture', path: '/dashboard' },
        { id: 'cmu', icon: CreditCard, label: 'CMU', path: '/dashboard' },
        { id: 'analytics', icon: BarChart2, label: 'Rapports', path: '/dashboard' },
        { id: 'validation', icon: CheckCircle, label: 'Validation', path: '/dashboard' },
    ],
    admin: [
        { id: 'home', icon: Home, label: 'Admin Panel', path: '/dashboard' },
        { id: 'users', icon: Users, label: 'Utilisateurs', path: '/dashboard' },
        { id: 'pharmacies', icon: Package, label: 'Pharmacies', path: '/pharmacies' },
        { id: 'analytics', icon: BarChart2, label: 'Analyses', path: '/dashboard' },
        { id: 'settings', icon: Settings, label: 'Paramètres', path: '/dashboard' },
    ],
    visitor: [
        { id: 'home', icon: Home, label: 'Accueil', path: '/dashboard' },
    ]
} as const

export type UserRole = keyof typeof navigationConfig
