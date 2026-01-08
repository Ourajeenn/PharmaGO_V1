import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { supabase } from '@/integrations/supabase/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { toast } from 'sonner'
import { Edit, X, Loader2, MapPin, Phone, Building } from 'lucide-react'

interface PharmacyProfileData {
    name: string
    email: string
    phone: string
    address: string
    licenseNumber: string
    openingHours: string // JSON stringified or text description for now
    isOnDuty: boolean
}

interface EditablePharmacyProfileProps {
    userId?: string
}

export const EditablePharmacyProfile = ({ userId }: EditablePharmacyProfileProps = {}) => {
    const { user: currentUser } = useAuth()
    const effectiveUserId = userId || currentUser?.id
    const [isEditing, setIsEditing] = useState(false)
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)

    const [profileData, setProfileData] = useState<PharmacyProfileData>({
        name: '',
        email: '',
        phone: '',
        address: '',
        licenseNumber: '',
        openingHours: '',
        isOnDuty: false
    })

    // Buffer for edits
    const [editedData, setEditedData] = useState<PharmacyProfileData>(profileData)

    useEffect(() => {
        if (effectiveUserId) {
            fetchPharmacyData()
        }
    }, [effectiveUserId])

    const fetchPharmacyData = async () => {
        if (!effectiveUserId) return
        try {
            setLoading(true)

            // 1. Get base profile
            const { data: userProfile, error: profileError } = await supabase
                .from('user_profiles')
                .select('*')
                .eq('id', effectiveUserId)
                .single()

            if (profileError) throw profileError

            // 2. Get pharmacy specific data
            const { data: pharmacyData, error: pharmError } = await supabase
                .from('pharmacies')
                .select('*')
                .eq('user_id', effectiveUserId)
                .single()

            if (pharmError && pharmError.code !== 'PGRST116') {
                console.error('Error fetching pharmacy details:', pharmError)
            }

            const mergedData: PharmacyProfileData = {
                name: pharmacyData?.name || userProfile?.name || '',
                email: userProfile?.email || '', // Fallback to profile email
                phone: userProfile?.phone || '',
                address: pharmacyData?.address || '',
                licenseNumber: pharmacyData?.license_number || '',
                openingHours: pharmacyData?.opening_hours ? JSON.stringify(pharmacyData.opening_hours, null, 2) : '',
                isOnDuty: pharmacyData?.is_on_duty || false
            }

            setProfileData(mergedData)
            setEditedData(mergedData)

        } catch (error) {
            console.error('Error loading pharmacy profile:', error)
            toast.error("Erreur lors du chargement du profil")
        } finally {
            setLoading(false)
        }
    }

    const handleSave = async () => {
        try {
            setSaving(true)

            // 1. Update user_profiles
            const { error: profileError } = await supabase
                .from('user_profiles')
                .update({
                    name: editedData.name,
                    phone: editedData.phone
                })
                .eq('id', effectiveUserId)

            if (profileError) throw profileError

            // 2. Upsert pharmacies table
            // Parse opening hours safely
            let parsedHours = null
            try {
                if (editedData.openingHours) parsedHours = JSON.parse(editedData.openingHours)
            } catch (e) {
                // If not valid JSON, store as text description if possible using a dedicated column or structure simpler
                // For strict schema JSONB, we might need a structured UI. 
                // For MVP, if it fails, we keep null or log warning. 
                console.warn('Invalid JSON for hours', e)
            }

            const { error: pharmError } = await supabase
                .from('pharmacies')
                .upsert({
                    user_id: effectiveUserId,
                    name: editedData.name,
                    address: editedData.address,
                    license_number: editedData.licenseNumber,
                    is_on_duty: editedData.isOnDuty,
                    opening_hours: parsedHours
                })

            if (pharmError) throw pharmError

            setProfileData(editedData)
            setIsEditing(false)
            toast.success('Profil Pharmacie mis à jour')

        } catch (error) {
            console.error('Error saving profile:', error)
            toast.error("Erreur lors de la sauvegarde")
        } finally {
            setSaving(false)
        }
    }

    const handleCancel = () => {
        setEditedData(profileData)
        setIsEditing(false)
    }

    const handleChange = (field: keyof PharmacyProfileData, value: any) => {
        setEditedData(prev => ({ ...prev, [field]: value }))
    }

    if (loading) {
        return <div className="p-8 text-center"><Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" /></div>
    }

    return (
        <Card>
            <CardHeader>
                <div className="flex justify-between items-center">
                    <div>
                        <CardTitle>Profil de la Pharmacie</CardTitle>
                        <CardDescription>Gérez les informations de votre officine</CardDescription>
                    </div>
                    {!isEditing ? (
                        <Button onClick={() => setIsEditing(true)} variant="outline">
                            <Edit className="h-4 w-4 mr-2" />
                            Modifier
                        </Button>
                    ) : (
                        <div className="flex gap-2">
                            <Button onClick={handleSave} size="sm" disabled={saving} className="bg-green-600 hover:bg-green-700">
                                {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Enregistrer
                            </Button>
                            <Button onClick={handleCancel} size="sm" variant="outline" disabled={saving}>
                                <X className="h-4 w-4 mr-2" />
                                Annuler
                            </Button>
                        </div>
                    )}
                </div>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="flex items-center gap-4 p-4 bg-green-50 rounded-lg border border-green-100">
                    <div className="h-16 w-16 bg-green-100 rounded-full flex items-center justify-center">
                        <Building className="h-8 w-8 text-green-600" />
                    </div>
                    <div>
                        <h3 className="font-semibold text-lg text-green-900">{profileData.name || 'Nom de la pharmacie'}</h3>
                        <p className="text-sm text-green-700">{profileData.address || 'Adresse non renseignée'}</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <Label htmlFor="name">Nom de l'officine</Label>
                        {isEditing ? (
                            <Input
                                id="name"
                                value={editedData.name}
                                onChange={(e) => handleChange('name', e.target.value)}
                            />
                        ) : (
                            <p className="p-2 bg-secondary/10 rounded font-medium">{profileData.name}</p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="phone">Téléphone</Label>
                        {isEditing ? (
                            <Input
                                id="phone"
                                value={editedData.phone}
                                onChange={(e) => handleChange('phone', e.target.value)}
                            />
                        ) : (
                            <div className="flex items-center gap-2 p-2 bg-secondary/10 rounded">
                                <Phone className="h-4 w-4 text-muted-foreground" />
                                {profileData.phone}
                            </div>
                        )}
                    </div>

                    <div className="space-y-2 md:col-span-2">
                        <Label htmlFor="address">Adresse complète</Label>
                        {isEditing ? (
                            <Input
                                id="address"
                                value={editedData.address}
                                onChange={(e) => handleChange('address', e.target.value)}
                            />
                        ) : (
                            <div className="flex items-center gap-2 p-2 bg-secondary/10 rounded">
                                <MapPin className="h-4 w-4 text-muted-foreground" />
                                {profileData.address}
                            </div>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="license">Numéro de Licence</Label>
                        {isEditing ? (
                            <Input
                                id="license"
                                value={editedData.licenseNumber}
                                onChange={(e) => handleChange('licenseNumber', e.target.value)}
                            />
                        ) : (
                            <p className="p-2 bg-secondary/10 rounded font-mono">{profileData.licenseNumber || 'N/A'}</p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label>Statut de Garde</Label>
                        <div className="flex items-center justify-between p-2 bg-secondary/10 rounded">
                            <span className="text-sm font-medium">Pharmacie de garde</span>
                            {isEditing ? (
                                <Switch
                                    checked={editedData.isOnDuty}
                                    onCheckedChange={(checked) => handleChange('isOnDuty', checked)}
                                />
                            ) : (
                                <span className={`px-2 py-1 rounded-full text-xs font-bold ${profileData.isOnDuty ? 'bg-green-100 text-green-800' : 'bg-gray-200 text-gray-600'}`}>
                                    {profileData.isOnDuty ? 'OUI' : 'NON'}
                                </span>
                            )}
                        </div>
                    </div>

                    <div className="space-y-2 md:col-span-2">
                        <Label htmlFor="hours">Horaires d'ouverture (Format JSON pour l'instant)</Label>
                        {isEditing ? (
                            <Textarea
                                id="hours"
                                value={editedData.openingHours}
                                onChange={(e) => handleChange('openingHours', e.target.value)}
                                className="font-mono text-xs"
                                rows={5}
                            />
                        ) : (
                            <pre className="p-2 bg-secondary/10 rounded overflow-auto text-xs">
                                {profileData.openingHours || 'Non spécifié'}
                            </pre>
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
