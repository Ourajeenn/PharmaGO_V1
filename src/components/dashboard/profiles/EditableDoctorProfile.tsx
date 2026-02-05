import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { supabase } from '@/integrations/supabase/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { Edit, X, Loader2, Stethoscope, MapPin, FileText } from 'lucide-react'

interface DoctorProfileData {
    name: string
    email: string
    phone: string
    specialization: string
    licenseNumber: string
    clinicName: string
    clinicAddress: string
}

interface EditableDoctorProfileProps {
    userId?: string
}

export const EditableDoctorProfile = ({ userId }: EditableDoctorProfileProps = {}) => {
    const { user: currentUser } = useAuth()
    const effectiveUserId = userId || currentUser?.id
    const [isEditing, setIsEditing] = useState(false)
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)

    const [profileData, setProfileData] = useState<DoctorProfileData>({
        name: '',
        email: '',
        phone: '',
        specialization: '',
        licenseNumber: '',
        clinicName: '',
        clinicAddress: ''
    })

    const [editedData, setEditedData] = useState<DoctorProfileData>(profileData)

    useEffect(() => {
        if (effectiveUserId) {
            fetchDoctorData()
        }
    }, [effectiveUserId])

    const fetchDoctorData = async () => {
        if (!effectiveUserId) return
        try {
            setLoading(true)

            const { data: userProfile, error: profileError } = await supabase
                .from('user_profiles')
                .select('*')
                .eq('id', effectiveUserId)
                .single()

            if (profileError) throw profileError

            const { data: doctorData, error: docError } = await supabase
                .from('doctors')
                .select('*')
                .eq('user_id', effectiveUserId)
                .single()

            if (docError && docError.code !== 'PGRST116') {
                console.error('Error fetching doctor details:', docError)
            }

            const mergedData: DoctorProfileData = {
                name: userProfile?.name || '',
                email: userProfile?.email || '',
                phone: userProfile?.phone || '',
                specialization: doctorData?.specialization || '',
                licenseNumber: doctorData?.license_number || '',
                clinicName: doctorData?.clinic_name || '',
                clinicAddress: doctorData?.clinic_address || ''
            }

            setProfileData(mergedData)
            setEditedData(mergedData)

        } catch (error) {
            console.error('Error loading doctor profile:', error)
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

            const { error: docError } = await supabase
                .from('doctors')
                .upsert({
                    user_id: effectiveUserId,
                    specialization: editedData.specialization,
                    license_number: editedData.licenseNumber,
                    clinic_name: editedData.clinicName,
                    clinic_address: editedData.clinicAddress
                })

            if (docError) throw docError

            setProfileData(editedData)
            setIsEditing(false)
            toast.success('Profil Docteur mis à jour')

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

    const handleChange = (field: keyof DoctorProfileData, value: string) => {
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
                        <CardTitle>Profil Médecin</CardTitle>
                        <CardDescription>Informations professionnelles</CardDescription>
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
                <div className="flex items-center gap-4 p-4 bg-secondary/10 rounded-lg">
                    <div className="h-16 w-16 bg-primary/20 rounded-full flex items-center justify-center">
                        <Stethoscope className="h-8 w-8 text-primary" />
                    </div>
                    <div>
                        <h3 className="font-semibold text-lg">{profileData.name || 'Nom du Docteur'}</h3>
                        <p className="text-sm text-muted-foreground">{profileData.specialization || 'Spécialisation non définie'}</p>
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
                        <Label htmlFor="email">Email professionnel</Label>
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
                        <Label htmlFor="specialization">Spécialisation</Label>
                        {isEditing ? (
                            <Input
                                id="specialization"
                                value={editedData.specialization}
                                onChange={(e) => handleChange('specialization', e.target.value)}
                            />
                        ) : (
                            <p className="p-2 bg-secondary/10 rounded">{profileData.specialization}</p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="clinicName">Nom de la Clinique</Label>
                        {isEditing ? (
                            <Input
                                id="clinicName"
                                value={editedData.clinicName}
                                onChange={(e) => handleChange('clinicName', e.target.value)}
                            />
                        ) : (
                            <p className="p-2 bg-secondary/10 rounded">{profileData.clinicName || 'Non renseigné'}</p>
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

                    <div className="space-y-2 md:col-span-2">
                        <Label htmlFor="clinicAddress">Adresse de la Clinique</Label>
                        {isEditing ? (
                            <Input
                                id="clinicAddress"
                                value={editedData.clinicAddress}
                                onChange={(e) => handleChange('clinicAddress', e.target.value)}
                            />
                        ) : (
                            <div className="flex items-center gap-2 p-2 bg-secondary/10 rounded">
                                <MapPin className="h-4 w-4 text-muted-foreground" />
                                {profileData.clinicAddress || 'Non renseignée'}
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
                            <div className="flex items-center gap-2 p-2 bg-secondary/10 rounded font-mono">
                                <FileText className="h-4 w-4 text-muted-foreground" />
                                {profileData.licenseNumber || 'N/A'}
                            </div>
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
