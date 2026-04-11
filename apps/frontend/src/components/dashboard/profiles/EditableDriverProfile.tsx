import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { supabase } from '@/integrations/supabase/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { Edit, X, Loader2, Truck, FileText } from 'lucide-react'

interface DriverProfileData {
    name: string
    email: string
    phone: string
    vehicleType: string
    licensePlate: string
    experienceYears: number
}

interface EditableDriverProfileProps {
    userId?: string
}

export const EditableDriverProfile = ({ userId }: EditableDriverProfileProps = {}) => {
    const { user: currentUser } = useAuth()
    const effectiveUserId = userId || currentUser?.id
    const [isEditing, setIsEditing] = useState(false)
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)

    const [profileData, setProfileData] = useState<DriverProfileData>({
        name: '',
        email: '',
        phone: '',
        vehicleType: '',
        licensePlate: '',
        experienceYears: 0
    })

    const [editedData, setEditedData] = useState<DriverProfileData>(profileData)

    useEffect(() => {
        if (effectiveUserId) {
            fetchDriverData()
        }
    }, [effectiveUserId])

    const fetchDriverData = async () => {
        if (!effectiveUserId) return
        try {
            setLoading(true)

            const { data: userProfile, error: profileError } = await supabase
                .from('user_profiles')
                .select('*')
                .eq('id', effectiveUserId)
                .single()

            if (profileError) throw profileError

            const { data: driverData, error: driverError } = await supabase
                .from('drivers')
                .select('*')
                .eq('user_id', effectiveUserId)
                .single()

            if (driverError && driverError.code !== 'PGRST116') {
                console.error('Error fetching driver details:', driverError)
            }

            const mergedData: DriverProfileData = {
                name: userProfile?.name || '',
                email: userProfile?.email || '',
                phone: userProfile?.phone || '',
                vehicleType: driverData?.vehicle_type || '',
                licensePlate: driverData?.license_plate || '',
                experienceYears: driverData?.experience_years || 0
            }

            setProfileData(mergedData)
            setEditedData(mergedData)

        } catch (error) {
            console.error('Error loading driver profile:', error)
            toast.error("Erreur lors du chargement du profil")
        } finally {
            setLoading(false)
        }
    }

    const handleSave = async () => {
        try {
            setSaving(true)

            const { error: profileError } = await supabase
                .from('user_profiles')
                .update({
                    name: editedData.name,
                    email: editedData.email,
                    phone: editedData.phone
                })
                .eq('id', effectiveUserId)

            if (profileError) throw profileError

            const { error: driverError } = await supabase
                .from('drivers')
                .upsert({
                    user_id: effectiveUserId,
                    vehicle_type: editedData.vehicleType,
                    license_plate: editedData.licensePlate,
                    experience_years: editedData.experienceYears
                })

            if (driverError) throw driverError

            setProfileData(editedData)
            setIsEditing(false)
            toast.success('Profil Livreur mis à jour')

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

    const handleChange = (field: keyof DriverProfileData, value: string | number) => {
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
                        <CardTitle>Profil Livreur</CardTitle>
                        <CardDescription>Informations du véhicule et expérience</CardDescription>
                    </div>
                    {!isEditing ? (
                        <Button onClick={() => setIsEditing(true)} variant="outline">
                            <Edit className="h-4 w-4 mr-2" />
                            Modifier
                        </Button>
                    ) : (
                        <div className="flex gap-2">
                            <Button onClick={handleSave} size="sm" disabled={saving}>
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
                <div className="flex items-center gap-4 p-4 bg-orange-50 rounded-lg">
                    <div className="h-16 w-16 bg-orange-100 rounded-full flex items-center justify-center">
                        <Truck className="h-8 w-8 text-orange-600" />
                    </div>
                    <div>
                        <h3 className="font-semibold text-lg">{profileData.name || 'Nom du Livreur'}</h3>
                        <p className="text-sm text-muted-foreground">{profileData.vehicleType || 'Type de véhicule non défini'}</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <Label htmlFor="name">Nom complet</Label>
                        {isEditing ? (
                            <Input
                                id="name"
                                value={editedData.name}
                                onChange={(e) => handleChange('name', e.target.value)}
                            />
                        ) : (
                            <p className="p-2 bg-secondary/10 rounded">{profileData.name}</p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        {isEditing ? (
                            <Input
                                id="email"
                                value={editedData.email}
                                onChange={(e) => handleChange('email', e.target.value)}
                            />
                        ) : (
                            <p className="p-2 bg-secondary/10 rounded">{profileData.email}</p>
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
                            <p className="p-2 bg-secondary/10 rounded">{profileData.phone}</p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="vehicleType">Type de Véhicule</Label>
                        {isEditing ? (
                            <Input
                                id="vehicleType"
                                value={editedData.vehicleType}
                                onChange={(e) => handleChange('vehicleType', e.target.value)}
                                placeholder="Scooter, Moto, Voiture..."
                            />
                        ) : (
                            <p className="p-2 bg-secondary/10 rounded">{profileData.vehicleType || 'Non renseigné'}</p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="licensePlate">Plaque d'Immatriculation</Label>
                        {isEditing ? (
                            <Input
                                id="licensePlate"
                                value={editedData.licensePlate}
                                onChange={(e) => handleChange('licensePlate', e.target.value)}
                            />
                        ) : (
                            <div className="flex items-center gap-2 p-2 bg-secondary/10 rounded font-mono">
                                <FileText className="h-4 w-4 text-muted-foreground" />
                                {profileData.licensePlate || 'N/A'}
                            </div>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="experienceYears">Années d'Expérience</Label>
                        {isEditing ? (
                            <Input
                                id="experienceYears"
                                type="number"
                                value={editedData.experienceYears}
                                onChange={(e) => handleChange('experienceYears', parseInt(e.target.value) || 0)}
                            />
                        ) : (
                            <p className="p-2 bg-secondary/10 rounded">{profileData.experienceYears} ans</p>
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
