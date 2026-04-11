import { Badge } from '@/components/ui/badge'
import { Crown, Heart, Baby, Shield, UserCheck } from 'lucide-react'

export type PatientType = 'standard' | 'vip' | 'senior' | 'minor' | 'chronic'

interface PatientTypeBadgeProps {
    type: PatientType
    size?: 'sm' | 'md' | 'lg'
    showLabel?: boolean
}

const typeConfig = {
    standard: {
        icon: UserCheck,
        label: 'Standard',
        color: 'bg-slate-100 text-slate-700 border-slate-200',
        gradient: 'from-slate-400 to-slate-500'
    },
    vip: {
        icon: Crown,
        label: 'VIP Premium',
        color: 'bg-amber-100 text-amber-800 border-amber-300',
        gradient: 'from-amber-400 to-yellow-500'
    },
    senior: {
        icon: Heart,
        label: 'Senior 60+',
        color: 'bg-purple-100 text-purple-700 border-purple-200',
        gradient: 'from-purple-400 to-pink-500'
    },
    minor: {
        icon: Baby,
        label: 'Mineur (-18)',
        color: 'bg-blue-100 text-blue-700 border-blue-200',
        gradient: 'from-blue-400 to-cyan-500'
    },
    chronic: {
        icon: Shield,
        label: 'Maladie Chronique',
        color: 'bg-red-100 text-red-700 border-red-200',
        gradient: 'from-red-400 to-rose-500'
    }
}

export const PatientTypeBadge = ({ type, size = 'md', showLabel = true }: PatientTypeBadgeProps) => {
    const config = typeConfig[type]
    const Icon = config.icon

    const sizeClasses = {
        sm: 'text-[10px] px-2 py-0.5',
        md: 'text-xs px-3 py-1',
        lg: 'text-sm px-4 py-1.5'
    }

    const iconSizes = {
        sm: 'h-3 w-3',
        md: 'h-4 w-4',
        lg: 'h-5 w-5'
    }

    return (
        <Badge
            className={`${config.color} ${sizeClasses[size]} border font-bold flex items-center gap-1.5 rounded-full`}
        >
            <Icon className={iconSizes[size]} />
            {showLabel && <span>{config.label}</span>}
        </Badge>
    )
}

// Patient Type Card for profile display
interface PatientTypeCardProps {
    type: PatientType
    benefits: string[]
    onUpgrade?: () => void
}

export const PatientTypeCard = ({ type, benefits, onUpgrade }: PatientTypeCardProps) => {
    const config = typeConfig[type]
    const Icon = config.icon

    return (
        <div className={`relative overflow-hidden rounded-2xl border p-6 ${config.color}`}>
            <div className={`absolute -top-10 -right-10 w-32 h-32 rounded-full bg-gradient-to-br ${config.gradient} opacity-20 blur-2xl`} />

            <div className="relative z-10">
                <div className="flex items-center gap-3 mb-4">
                    <div className={`p-3 rounded-xl bg-gradient-to-br ${config.gradient} text-white`}>
                        <Icon className="h-6 w-6" />
                    </div>
                    <div>
                        <h3 className="font-bold text-lg">{config.label}</h3>
                        <p className="text-xs opacity-70">Statut actif</p>
                    </div>
                </div>

                <div className="space-y-2">
                    <p className="text-xs font-bold uppercase tracking-wider opacity-60">Avantages</p>
                    <ul className="space-y-1">
                        {benefits.map((benefit, idx) => (
                            <li key={idx} className="text-sm flex items-center gap-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-current" />
                                {benefit}
                            </li>
                        ))}
                    </ul>
                </div>

                {type !== 'vip' && onUpgrade && (
                    <button
                        onClick={onUpgrade}
                        className="mt-4 w-full py-2 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-500 text-amber-900 font-bold text-sm hover:opacity-90 transition-opacity"
                    >
                        <Crown className="inline h-4 w-4 mr-2" />
                        Passer en VIP
                    </button>
                )}
            </div>
        </div>
    )
}

// Benefits by type
export const patientTypeBenefits = {
    standard: [
        'Livraison standard',
        'Support client 8h-18h',
        'Points de fidélité 1x'
    ],
    vip: [
        'Livraison prioritaire GRATUITE',
        'Support client 24/7',
        'Points de fidélité 3x',
        'Accès médecins experts',
        'Remises exclusives 15%'
    ],
    senior: [
        'Livraison à domicile prioritaire',
        'Rappels médicaments renforcés',
        'Support téléphonique dédié',
        'Remise 10% automatique'
    ],
    minor: [
        'Validation parentale requise',
        'Médicaments pédiatriques',
        'Alertes dosage enfant',
        'Suivi vaccinations'
    ],
    chronic: [
        'Renouvellement automatique',
        'Suivi médical renforcé',
        'Alertes rupture de stock',
        'Coordination pharmacie fixe'
    ]
}
