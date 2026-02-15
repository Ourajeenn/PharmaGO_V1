import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { supabase } from '@/integrations/supabase/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'
import { Save, Edit, X, Upload, Loader2, ChevronDown } from 'lucide-react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import insuranceData from '@/data/insurances.json'
import { uploadProfileImage } from '@/utils/upload'

interface PatientProfileData {
  name: string
  email: string
  phone: string
  dateOfBirth?: string
  address?: string
  insuranceId?: string
  insuranceName?: string
  cmuNumber?: string
  emergencyContact?: string
  bloodType?: string
  allergies?: string
  chronicConditions?: string
  avatarUrl?: string
}

// Add props interface
interface EditablePatientProfileProps {
  userId?: string
}

export const EditablePatientProfile = ({ userId }: EditablePatientProfileProps = {}) => {
  const { user: currentUser } = useAuth()
  // Use provided userId or fallback to current authenticated user
  const effectiveUserId = userId || currentUser?.id

  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)

  const [profileData, setProfileData] = useState<PatientProfileData>({
    name: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    address: '',
    insuranceId: '',
    insuranceName: '',
    cmuNumber: '',
    emergencyContact: '',
    bloodType: '',
    allergies: '',
    chronicConditions: ''
  })

  // Buffer for edits
  const [editedData, setEditedData] = useState<PatientProfileData>(profileData)

  useEffect(() => {
    if (effectiveUserId) {
      fetchPatientData()
    }
  }, [effectiveUserId])

  const fetchPatientData = async () => {
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

      // 2. Get patient specific data
      const { data: patientData, error: patientError } = await supabase
        .from('patients')
        .select('*')
        .eq('user_id', effectiveUserId)
        .single()

      // It's possible patient table entry doesn't exist yet if created via old flow
      // so we don't throw immediately, just log
      if (patientError && patientError.code !== 'PGRST116') {
        console.error('Error fetching patient details:', patientError)
      }

      const mergedData: PatientProfileData = {
        name: userProfile?.name || '',
        email: userProfile?.email || '', // Email might not be in profile, maybe fetch from auth? Admin can't see auth email easily. For now use profile email if exists.
        phone: userProfile?.phone || '',
        dateOfBirth: patientData?.date_of_birth || '',
        address: patientData?.address || '',
        insuranceId: patientData?.insurance_id || '',
        insuranceName: patientData?.insurance_name || '',
        cmuNumber: patientData?.cmu_number || '',
        emergencyContact: patientData?.emergency_contact || '',
        bloodType: patientData?.blood_type || '',
        allergies: patientData?.allergies || '',
        chronicConditions: patientData?.medical_history || '', // Mapping 'medical_history' to 'chronicConditions' for now
        avatarUrl: userProfile?.avatar_url || null
      }

      setProfileData(mergedData)
      setEditedData(mergedData)

    } catch (error) {
      console.error('Error loading profile:', error)
      toast.error("Erreur lors du chargement du profil")
    } finally {
      setLoading(false)
    }


  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      toast.error("L'image est trop volumineuse (max 2MB)");
      return;
    }

    setUploading(true);
    try {
      const publicUrl = await uploadProfileImage(file, 'avatars');
      if (publicUrl) {
        setEditedData(prev => ({ ...prev, avatarUrl: publicUrl }));
        toast.success("Image uploadée (n'oubliez pas d'enregistrer)");
      }
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Erreur lors de l'upload");
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true)

      // 1. Update user_profiles
      const { error: profileError } = await supabase
        .from('user_profiles')
        .update({
          name: editedData.name,
          email: editedData.email,
          phone: editedData.phone,
          avatar_url: editedData.avatarUrl
        })
        .eq('id', effectiveUserId)

      if (profileError) throw profileError

      // 2. Upsert patients table
      const { error: patientError } = await supabase
        .from('patients')
        .upsert({
          user_id: effectiveUserId,
          address: editedData.address,
          insurance_id: editedData.insuranceId,
          insurance_name: editedData.insuranceName,
          cmu_number: editedData.cmuNumber,
          emergency_contact: editedData.emergencyContact,
          blood_type: editedData.bloodType,
          allergies: editedData.allergies,
          medical_history: editedData.chronicConditions, // Mapping back
          // date_of_birth: editedData.dateOfBirth // DB might expect Date type or string
        })

      if (patientError) throw patientError

      setProfileData(editedData)
      setIsEditing(false)
      toast.success('Profil mis à jour avec succès')

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

  const handleChange = (field: keyof PatientProfileData, value: string) => {
    setEditedData(prev => ({ ...prev, [field]: value }))
  }

  if (loading) {
    return <div className="p-8 text-center">Chargement du profil...</div>
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Mon Profil Patient</CardTitle>
            <CardDescription>Informations personnelles et médicales</CardDescription>
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
        {/* Photo de profil */}
        <div className="flex items-center gap-4 p-4 bg-secondary/10 rounded-lg">
          <div className="h-20 w-20 bg-primary/20 rounded-full flex items-center justify-center text-3xl overflow-hidden relative border-2 border-primary/20">
            {profileData.avatarUrl ? (
              <img src={profileData.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              <span>👤</span>
            )}
            {uploading && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                <Loader2 className="h-6 w-6 text-white animate-spin" />
              </div>
            )}
          </div>

          {isEditing && (
            <div>
              <input
                type="file"
                id="avatar-upload"
                className="hidden"
                accept="image/*"
                onChange={handleImageUpload}
                disabled={uploading || saving}
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => document.getElementById('avatar-upload')?.click()}
                disabled={uploading || saving}
              >
                <Upload className="h-4 w-4 mr-2" />
                {uploading ? 'Upload...' : 'Changer la photo'}
              </Button>
              <p className="text-[10px] text-muted-foreground mt-1">JPG, PNG max 2MB</p>
            </div>
          )}
        </div>

        {/* Informations personnelles */}
        <div className="space-y-4">
          <h3 className="font-semibold text-lg border-b pb-2">Informations Personnelles</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nom complet</Label>
              {isEditing ? (
                <Input
                  id="name"
                  value={editedData.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                />
              ) : (
                <p className="p-2 bg-secondary/5 rounded">{profileData.name || 'Non renseigné'}</p>
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
                <p className="p-2 bg-secondary/5 rounded">{profileData.email || 'Non renseigné'}</p>
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
                <p className="p-2 bg-secondary/5 rounded">{profileData.phone || 'Non renseigné'}</p>
              )}
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="address">Adresse</Label>
              {isEditing ? (
                <Input
                  id="address"
                  value={editedData.address}
                  onChange={(e) => handleChange('address', e.target.value)}
                />
              ) : (
                <p className="p-2 bg-secondary/5 rounded">{profileData.address || 'Non renseigné'}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="emergencyContact">Contact d'urgence</Label>
              {isEditing ? (
                <Input
                  id="emergencyContact"
                  value={editedData.emergencyContact}
                  onChange={(e) => handleChange('emergencyContact', e.target.value)}
                />
              ) : (
                <p className="p-2 bg-secondary/5 rounded">{profileData.emergencyContact || 'Non renseigné'}</p>
              )}
            </div>
          </div>
        </div>

        {/* Informations de santé */}
        <div className="space-y-4">
          <h3 className="font-semibold text-lg border-b pb-2">Informations de Santé</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="bloodType">Groupe sanguin</Label>
              {isEditing ? (
                <Input
                  id="bloodType"
                  value={editedData.bloodType}
                  onChange={(e) => handleChange('bloodType', e.target.value)}
                  placeholder="Ex: O+"
                />
              ) : (
                <p className="p-2 bg-secondary/5 rounded">{profileData.bloodType || 'Non renseigné'}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="insuranceName">Compagnie d'assurance</Label>
              {isEditing ? (
                <div className="space-y-2">
                  <Select
                    value={insuranceData.includes(editedData.insuranceName || '') ? editedData.insuranceName : 'Autre'}
                    onValueChange={(value) => {
                      if (value === 'Autre') {
                        handleChange('insuranceName', '')
                      } else {
                        handleChange('insuranceName', value)
                      }
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionnez votre assurance" />
                    </SelectTrigger>
                    <SelectContent>
                      {insuranceData.map((name) => (
                        <SelectItem key={name} value={name}>
                          {name}
                        </SelectItem>
                      ))}
                      <SelectItem value="Autre">Autre (Saisir manuellement)</SelectItem>
                    </SelectContent>
                  </Select>

                  {(!insuranceData.includes(editedData.insuranceName || '') || editedData.insuranceName === '') && (
                    <Input
                      placeholder="Nom de votre assurance..."
                      value={editedData.insuranceName}
                      onChange={(e) => handleChange('insuranceName', e.target.value)}
                      className="mt-2"
                    />
                  )}
                </div>
              ) : (
                <p className="p-2 bg-secondary/5 rounded">{profileData.insuranceName || 'Non renseigné'}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="insuranceId">Numéro de carte d'assurance</Label>
              {isEditing ? (
                <Input
                  id="insuranceId"
                  value={editedData.insuranceId}
                  onChange={(e) => handleChange('insuranceId', e.target.value)}
                  placeholder="Ex: 123456789"
                />
              ) : (
                <p className="p-2 bg-secondary/5 rounded">{profileData.insuranceId || 'Non renseigné'}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="cmuNumber">Numéro CMU</Label>
              {isEditing ? (
                <Input
                  id="cmuNumber"
                  value={editedData.cmuNumber}
                  onChange={(e) => handleChange('cmuNumber', e.target.value)}
                />
              ) : (
                <p className="p-2 bg-secondary/5 rounded">{profileData.cmuNumber || 'Non renseigné'}</p>
              )}
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="allergies">Allergies</Label>
              {isEditing ? (
                <Textarea
                  id="allergies"
                  value={editedData.allergies}
                  onChange={(e) => handleChange('allergies', e.target.value)}
                  placeholder="Listez vos allergies connues..."
                />
              ) : (
                <p className="p-2 bg-secondary/5 rounded min-h-[60px]">{profileData.allergies || 'Aucune allergie signalée'}</p>
              )}
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="chronicConditions">Conditions chroniques (Antécédents)</Label>
              {isEditing ? (
                <Textarea
                  id="chronicConditions"
                  value={editedData.chronicConditions}
                  onChange={(e) => handleChange('chronicConditions', e.target.value)}
                  placeholder="Listez vos conditions chroniques..."
                />
              ) : (
                <p className="p-2 bg-secondary/5 rounded min-h-[60px]">{profileData.chronicConditions || 'Aucun antécédent signalé'}</p>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}