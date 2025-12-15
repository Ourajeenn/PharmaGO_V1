import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { supabase } from '@/integrations/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'

export const ProfileCompletion = ({ onComplete }: { onComplete: () => void }) => {
    const { user, profile } = useAuth()
    const [loading, setLoading] = useState(false)
    const [checking, setChecking] = useState(true)
    const [needsCompletion, setNeedsCompletion] = useState(false)
    const [formData, setFormData] = useState<any>({})

    useEffect(() => {
        checkCompletion()
    }, [user, profile])

    const checkCompletion = async () => {
        if (!user || !profile) return

        try {
            let table = ''
            let requiredFields: string[] = []

            switch (profile.role) {
                case 'patient':
                    table = 'patients'
                    requiredFields = ['address', 'phone'] // Basic requirements
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
                    setChecking(false)
                    return
            }

            // Check specific role table
            const { data, error } = await supabase
                .from(table)
                .select('*')
                .eq('user_id', user.id)
                .single()

            if (error && error.code !== 'PGRST116') { // PGRST116 is "not found"
                console.error('Error checking profile:', error)
                return
            }

            // Check user_profiles for phone/name if needed
            const { data: userProfile } = await supabase
                .from('user_profiles')
                .select('*')
                .eq('id', user.id)
                .single()

            const missingFields = []

            // Check role specific fields
            if (!data) {
                missingFields.push(...requiredFields)
            } else {
                requiredFields.forEach(field => {
                    if (!data[field]) missingFields.push(field)
                })
            }

            // Check common fields
            if (!userProfile?.phone) missingFields.push('phone')
            if (!userProfile?.name) missingFields.push('name')

            if (missingFields.length > 0) {
                setNeedsCompletion(true)
                // Initialize form data with existing values
                setFormData({
                    ...userProfile,
                    ...data
                })
            } else {
                onComplete()
            }
        } catch (error) {
            console.error('Error in checkCompletion:', error)
        } finally {
            setChecking(false)
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        try {
            // Update user_profiles
            const { error: profileError } = await supabase
                .from('user_profiles')
                .update({
                    name: formData.name,
                    phone: formData.phone
                })
                .eq('id', user!.id)

            if (profileError) throw profileError

            // Update role specific table
            let table = ''
            switch (profile!.role) {
                case 'patient': table = 'patients'; break;
                case 'pharmacy': table = 'pharmacies'; break;
                case 'driver': table = 'drivers'; break;
                case 'doctor': table = 'doctors'; break;
                case 'insurer': table = 'insurers'; break;
            }

            if (table) {
                // Remove common fields from role data
                const { name, phone, email, role, id, created_at, updated_at, ...roleData } = formData

                const { error: roleError } = await supabase
                    .from(table)
                    .upsert({
                        user_id: user!.id,
                        ...roleData
                    })

                if (roleError) throw roleError
            }

            toast.success('Profil mis à jour avec succès')
            onComplete()
        } catch (error: any) {
            console.error('Error updating profile:', error)
            toast.error(error.message || 'Erreur lors de la mise à jour')
        } finally {
            setLoading(false)
        }
    }

    const handleChange = (field: string, value: string) => {
        setFormData((prev: any) => ({ ...prev, [field]: value }))
    }

    if (checking) {
        return (
            <div className="flex items-center justify-center min-h-[50vh]">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        )
    }

    if (!needsCompletion) return null

    return (
        <div className="container max-w-2xl mx-auto py-12 px-4">
            <Card>
                <CardHeader>
                    <CardTitle>Finaliser votre inscription</CardTitle>
                    <CardDescription>
                        Veuillez compléter ces informations pour accéder à votre tableau de bord.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Nom complet</Label>
                            <Input
                                id="name"
                                value={formData.name || ''}
                                onChange={(e) => handleChange('name', e.target.value)}
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="phone">Téléphone</Label>
                            <Input
                                id="phone"
                                value={formData.phone || ''}
                                onChange={(e) => handleChange('phone', e.target.value)}
                                required
                            />
                        </div>

                        {profile?.role === 'patient' && (
                            <div className="space-y-2">
                                <Label htmlFor="address">Adresse de livraison par défaut</Label>
                                <Input
                                    id="address"
                                    value={formData.address || ''}
                                    onChange={(e) => handleChange('address', e.target.value)}
                                    required
                                />
                            </div>
                        )}

                        {profile?.role === 'pharmacy' && (
                            <>
                                <div className="space-y-2">
                                    <Label htmlFor="address">Adresse de la pharmacie</Label>
                                    <Input
                                        id="address"
                                        value={formData.address || ''}
                                        onChange={(e) => handleChange('address', e.target.value)}
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="license_number">Numéro de licence</Label>
                                    <Input
                                        id="license_number"
                                        value={formData.license_number || ''}
                                        onChange={(e) => handleChange('license_number', e.target.value)}
                                        required
                                    />
                                </div>
                            </>
                        )}

                        {/* Add other role fields as needed */}

                        <Button type="submit" className="w-full" disabled={loading}>
                            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                            Enregistrer et continuer
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}
