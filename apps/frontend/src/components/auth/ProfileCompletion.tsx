import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { supabase } from '@/integrations/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { Loader2, UserCheck, Zap } from 'lucide-react'
import { logger } from '@/utils/logger'

interface ProfileFormData {
    name?: string
    phone?: string
    address?: string
    license_number?: string
    company_name?: string
    vehicle_type?: string
    license_plate?: string
    specialization?: string
    [key: string]: any
}

export const ProfileCompletion = ({ onComplete }: { onComplete: () => void }) => {
    const { user, profile } = useAuth()
    const [loading, setLoading] = useState(false)
    const [checking, setChecking] = useState(true)
    const [needsCompletion, setNeedsCompletion] = useState(false)
    const [formData, setFormData] = useState<ProfileFormData>({})

    useEffect(() => {
        checkCompletion()
    }, [user, profile])

    const checkCompletion = async () => {
        if (!user || !profile) return

        try {
            // Admins bypass this entire check
            if (profile.role === 'admin') {
                onComplete()
                return
            }

            let table = ''
            let requiredFields: string[] = []

            switch (profile.role) {
                case 'patient':
                    table = 'patients'
                    requiredFields = ['address', 'phone']
                    break
                case 'pharmacy':
                    table = 'pharmacies'
                    requiredFields = ['address', 'license_number']
                    break
                case 'driver':
                    table = 'drivers'
                    requiredFields = ['vehicle_type', 'license_plate']
                    break
                case 'doctor':
                    table = 'doctors'
                    requiredFields = ['license_number', 'specialization']
                    break
                case 'insurer':
                    table = 'insurers'
                    requiredFields = ['company_name', 'license_number']
                    break
                default:
                    logger.log('ProfileCompletion: role exempt or unhandled:', profile.role)
                    onComplete()
                    return
            }

            const { data, error } = await supabase
                .from(table as any)
                .select('*')
                .eq('user_id', user.id)
                .single()

            if (error && error.code !== 'PGRST116') {
                logger.error('ProfileCompletion: error fetching role data:', error)
                // On technical error, allow entry to dashboard anyway
                onComplete()
                return
            }

            const { data: userProfile } = await supabase
                .from('user_profiles')
                .select('*')
                .eq('id', user.id)
                .single()

            const missingFields = []
            if (!data) {
                missingFields.push(...requiredFields)
            } else {
                requiredFields.forEach(field => {
                    if (!data[field]) missingFields.push(field)
                })
            }

            if (!userProfile?.phone) missingFields.push('phone')
            if (!userProfile?.name) missingFields.push('name')

            if (missingFields.length > 0) {
                setNeedsCompletion(true)
                setFormData({
                    ...(userProfile as any || {}),
                    ...(data as any || {})
                } as ProfileFormData)
            } else {
                onComplete()
            }
        } catch (error) {
            logger.error('ProfileCompletion: critical error in checkCompletion:', error)
            onComplete()
        } finally {
            setChecking(false)
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        try {
            const { error: profileError } = await supabase
                .from('user_profiles')
                .update({
                    name: formData.name,
                    phone: formData.phone
                })
                .eq('id', user!.id)

            if (profileError) throw profileError

            let table = ''
            switch (profile!.role) {
                case 'patient': table = 'patients'; break;
                case 'pharmacy': table = 'pharmacies'; break;
                case 'driver': table = 'drivers'; break;
                case 'doctor': table = 'doctors'; break;
                case 'insurer': table = 'insurers'; break;
            }

            if (table) {
                const { name, phone, email, role, id, created_at, updated_at, ...roleData } = formData
                const { error: roleError } = await supabase
                    .from(table as any)
                    .upsert({
                        user_id: user!.id,
                        ...roleData
                    })

                if (roleError) throw roleError
            }

            toast.success('Profil ancré avec succès')
            onComplete()
        } catch (error: any) {
            logger.error('ProfileCompletion: error updating profile:', error)
            toast.error(error.message || 'Erreur lors de la mise à jour')
        } finally {
            setLoading(false)
        }
    }

    const handleChange = (field: string, value: string) => {
        setFormData((prev) => ({ ...prev, [field]: value }))
    }

    if (checking) {
        return (
            <div className="flex items-center justify-center h-screen mesh-gradient">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
            </div>
        )
    }

    if (!needsCompletion) {
        return (
            <div className="flex items-center justify-center h-screen mesh-gradient">
                <div className="text-center space-y-4">
                    <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
                    <p className="text-sm font-black uppercase tracking-widest text-muted-foreground animate-pulse">Accès au Tableau de Bord...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen mesh-gradient flex items-center justify-center p-6 bg-slate-50">
            <div className="glass-card max-w-xl w-full p-8 lg:p-12 space-y-8 animate-in slide-in-from-bottom-4 duration-700 shadow-2xl">
                <div className="space-y-2">
                    <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary mb-4 border border-primary/20">
                        <UserCheck className="h-6 w-6" />
                    </div>
                    <h1 className="text-3xl font-black tracking-tighter uppercase text-foreground/90">
                        Finaliser mon <span className="text-primary tracking-normal">Profil</span>
                    </h1>
                    <p className="text-sm font-medium text-muted-foreground">
                        Quelques détails supplémentaires pour configurer votre accès {profile?.role}.
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Label htmlFor="name" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Nom Complet</Label>
                            <Input
                                id="name"
                                value={formData.name || ''}
                                onChange={(e) => handleChange('name', e.target.value)}
                                className="h-12 rounded-xl bg-white/40 border-white/40 focus:bg-white/60 transition-all font-bold"
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="phone" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Téléphone</Label>
                            <Input
                                id="phone"
                                value={formData.phone || ''}
                                onChange={(e) => handleChange('phone', e.target.value)}
                                className="h-12 rounded-xl bg-white/40 border-white/40 focus:bg-white/60 transition-all font-bold"
                                required
                            />
                        </div>
                    </div>

                    {profile?.role === 'patient' && (
                        <div className="space-y-2">
                            <Label htmlFor="address" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Adresse de Livraison</Label>
                            <Input
                                id="address"
                                value={formData.address || ''}
                                onChange={(e) => handleChange('address', e.target.value)}
                                className="h-12 rounded-xl bg-white/40 border-white/40 focus:bg-white/60 transition-all font-bold"
                                required
                            />
                        </div>
                    )}

                    {profile?.role === 'pharmacy' && (
                        <div className="space-y-6">
                            <div className="space-y-2">
                                <Label htmlFor="address" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Adresse Physique</Label>
                                <Input
                                    id="address"
                                    value={formData.address || ''}
                                    onChange={(e) => handleChange('address', e.target.value)}
                                    className="h-12 rounded-xl bg-white/40 border-white/40 focus:bg-white/60 transition-all font-bold"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="license_number" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Licence Professionnelle</Label>
                                <Input
                                    id="license_number"
                                    value={formData.license_number || ''}
                                    onChange={(e) => handleChange('license_number', e.target.value)}
                                    className="h-12 rounded-xl bg-white/40 border-white/40 focus:bg-white/60 transition-all font-bold"
                                    required
                                />
                            </div>
                        </div>
                    )}

                    <Button
                        type="submit"
                        disabled={loading}
                        className="w-full h-14 rounded-xl bg-primary hover:bg-primary-hover text-white font-black uppercase tracking-widest shadow-xl shadow-primary/20 transition-all hover:scale-[1.01]"
                    >
                        {loading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Zap className="mr-2 h-5 w-5" />}
                        Ancrer le Profil
                    </Button>
                </form>

                <p className="text-center text-[10px] text-muted-foreground/60 font-medium">
                    En continuant, vous certifiez l'exactitude des informations fournies.
                </p>
            </div>
        </div>
    )
}
