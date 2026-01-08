import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { supabase } from '@/integrations/supabase/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'
import { Edit, X, Loader2, Shield, Phone, FileText } from 'lucide-react'

interface InsurerProfileData {
    companyName: string
    representativeName: string
    email: string
    phone: string
    licenseNumber: string
    coverageTypes: string // JSON representation
}

interface EditableInsurerProfileProps {
    userId?: string
}

export const EditableInsurerProfile = ({ userId }: EditableInsurerProfileProps = {}) => {
    const { user: currentUser } = useAuth()
    const effectiveUserId = userId || currentUser?.id
    const [isEditing, setIsEditing] = useState(false)
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)

    const [profileData, setProfileData] = useState<InsurerProfileData>({
        companyName: '',
        representativeName: '',
        email: '',
        phone: '',
        licenseNumber: '',
        coverageTypes: ''
    })

    // Buffer for edits
    const [editedData, setEditedData] = useState<InsurerProfileData>(profileData)

    useEffect(() => {
        if (effectiveUserId) {
            fetchInsurerData()
        }
    }, [effectiveUserId])

    const fetchInsurerData = async () => {
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

            // 2. Get insurer specific data
            const { data: insurerData, error: insError } = await supabase
                .from('insurers')
                .select('*')
                .eq('user_id', effectiveUserId)
                .single()

            if (insError && insError.code !== 'PGRST116') {
                console.error('Error fetching insurer details:', insError)
            }

            const mergedData: InsurerProfileData = {
                companyName: insurerData?.company_name || '',
                representativeName: userProfile?.name || '',
                email: userProfile?.email || '', // Fallback to profile email
                phone: userProfile?.phone || '',
                licenseNumber: insurerData?.license_number || '',
                coverageTypes: insurerData?.coverage_types ? JSON.stringify(insurerData.coverage_types, null, 2) : ''
            }

            setProfileData(mergedData)
            setEditedData(mergedData)

        } catch (error) {
            console.error('Error loading insurer profile:', error)
            toast.error("Erreur lors du chargement du profil")
        } finally {
            setLoading(false)
        }
    }

    const handleSave = async () => {
        try {
            setSaving(true)

            // 1. Update user_profiles (Representative Name & Phone)
            const { error: profileError } = await supabase
                .from('user_profiles')
                .update({
                    name: editedData.representativeName,
                    phone: editedData.phone
                })
                .eq('id', effectiveUserId)

            if (profileError) throw profileError

            // 2. Upsert insurers table
            let parsedCoverage = null
            try {
                if (editedData.coverageTypes) parsedCoverage = JSON.parse(editedData.coverageTypes)
            } catch (e) {
                console.warn('Invalid JSON coverage', e)
                // Optionally handle invalid JSON error here
            }

            const { error: insError } = await supabase
                .from('insurers')
                .upsert({
                    user_id: effectiveUserId,
                    company_name: editedData.companyName,
                    license_number: editedData.licenseNumber,
                    coverage_types: parsedCoverage
                })

            if (insError) throw insError

            setProfileData(editedData)
            setIsEditing(false)
            toast.success('Profil Assurance mis à jour')

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

    const handleChange = (field: keyof InsurerProfileData, value: string) => {
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
                        <CardTitle>Profil d'Assurance</CardTitle>
                        <CardDescription>Informations de la compagnie et couverture</CardDescription>
                    </div>
                    {!isEditing ? (
                        <Button onClick={() => setIsEditing(true)} variant="outline">
                            <Edit className="h-4 w-4 mr-2" />
                            Modifier
                        </Button>
                    ) : (
                        <div className="flex gap-2">
                            <Button onClick={handleSave} size="sm" disabled={saving} className="bg-blue-600 hover:bg-blue-700">
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
                <div className="flex items-center gap-4 p-4 bg-blue-50 rounded-lg border border-blue-100">
                    <div className="h-16 w-16 bg-blue-100 rounded-full flex items-center justify-center">
                        <Shield className="h-8 w-8 text-blue-600" />
                    </div>
                    <div>
                        <h3 className="font-semibold text-lg text-blue-900">{profileData.companyName || 'Nom de la Compagnie'}</h3>
                        <p className="text-sm text-blue-700">Représentant: {profileData.representativeName}</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <Label htmlFor="companyName">Nom de la Compagnie</Label>
                        {isEditing ? (
                            <Input
                                id="companyName"
                                value={editedData.companyName}
                                onChange={(e) => handleChange('companyName', e.target.value)}
                            />
                        ) : (
                            <p className="p-2 bg-secondary/10 rounded font-medium">{profileData.companyName}</p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="representative">Nom du Représentant</Label>
                        {isEditing ? (
                            <Input
                                id="representative"
                                value={editedData.representativeName}
                                onChange={(e) => handleChange('representativeName', e.target.value)}
                            />
                        ) : (
                            <p className="p-2 bg-secondary/10 rounded font-medium">{profileData.representativeName}</p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="phone">Contact Téléphonique</Label>
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

                    <div className="space-y-2">
                        <Label htmlFor="license">Numéro d'Agrément</Label>
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

                    <div className="space-y-2 md:col-span-2">
                        <Label htmlFor="coverage">Types de Couverture (Format JSON)</Label>
                        {isEditing ? (
                            <Textarea
                                id="coverage"
                                value={editedData.coverageTypes}
                                onChange={(e) => handleChange('coverageTypes', e.target.value)}
                                className="font-mono text-xs"
                                rows={6}
                                placeholder='{"maladie": 80, "maternite": 100}'
                            />
                        ) : (
                            <pre className="p-2 bg-secondary/10 rounded overflow-auto text-xs">
                                {profileData.coverageTypes || 'Aucune couverture définie'}
                            </pre>
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
