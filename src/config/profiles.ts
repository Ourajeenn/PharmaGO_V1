import { LucideIcon, User, Building2, Truck, Stethoscope, Shield, Globe } from 'lucide-react';
import React from 'react';

export interface ProfileOption {
    id: string;
    title: string;
    subtitle: string;
    description: string;
    icon: any; // Using any to avoid complex type issues with Lucide components
    route: string;
    color: string;
}

export const profiles: ProfileOption[] = [
    {
        id: 'patient',
        title: 'Patient',
        subtitle: 'Tableau de Bord Patient',
        description: 'Gérez vos commandes et prescriptions',
        icon: User,
        route: '/auth/patient',
        color: 'bg-[#0070c0]'
    },
    {
        id: 'pharmacy',
        title: 'Pharmacie',
        subtitle: 'Pharmacie du Centre',
        description: 'Gestion des commandes et du stock',
        icon: Building2,
        route: '/auth/pharmacy',
        color: 'bg-[#00b050]'
    },
    {
        id: 'driver',
        title: 'Livreur',
        subtitle: 'Interface Livreur',
        description: 'Gestion des livraisons et tournées',
        icon: Truck,
        route: '/auth/driver',
        color: 'bg-[#f97316]'
    },
    {
        id: 'doctor',
        title: 'Médecin',
        subtitle: 'Tableau Médecin',
        description: 'Gestion des patients et prescriptions',
        icon: Stethoscope,
        route: '/auth/doctor',
        color: 'bg-[#0070c0]'
    },
    {
        id: 'insurer',
        title: 'Assurance Maladie',
        subtitle: 'Interface Assurance',
        description: 'Gestion des remboursements et CMU',
        icon: Shield,
        route: '/auth/insurer',
        color: 'bg-[#00b050]'
    },
    {
        id: 'visitor',
        title: 'Visiteur',
        subtitle: 'Mode Visiteur',
        description: 'Parcourir le catalogue sans compte',
        icon: Globe,
        route: '/',
        color: 'bg-[#f97316]'
    }
];
