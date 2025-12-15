import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'
import { Save, Edit, X, Upload } from 'lucide-react'

interface PatientProfileData {
  name: string
  email: string
  phone: string
  dateOfBirth: string
  address: string
  insuranceId: string
  cmuNumber: string
  emergencyContact: string
  bloodType: string
  allergies: string
  chronicConditions: string
}

export const EditablePatientProfile = () => {
  const [isEditing, setIsEditing] = useState(false)
  const [profileData, setProfileData] = useState<PatientProfileData>({
    name: 'Jean Kouassi',
    email: 'jean.kouassi@example.com',
    phone: '+225 07 XX XX XX XX',
    dateOfBirth: '1985-03-15',
    address: 'Cocody, Angré 7ème Tranche, Abidjan',
    insuranceId: 'CNPS123456789',
    cmuNumber: 'CMU987654321',
    emergencyContact: '+225 05 XX XX XX XX',
    bloodType: 'O+',
    allergies: 'Pénicilline, Arachides',
    chronicConditions: 'Hypertension artérielle'
  })

  const [editedData, setEditedData] = useState(profileData)

  const handleSave = () => {
    setProfileData(editedData)
    setIsEditing(false)
    toast.success('Profil mis à jour avec succès')
  }

  const handleCancel = () => {
    setEditedData(profileData)
    setIsEditing(false)
  }

  const handleChange = (field: keyof PatientProfileData, value: string) => {
    setEditedData(prev => ({ ...prev, [field]: value }))
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
              <Button onClick={handleSave} size="sm">
                <Save className="h-4 w-4 mr-2" />
                Enregistrer
              </Button>
              <Button onClick={handleCancel} size="sm" variant="outline">
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
          <div className="h-20 w-20 bg-primary/20 rounded-full flex items-center justify-center text-3xl">
            👤
          </div>
          {isEditing && (
            <Button variant="outline" size="sm">
              <Upload className="h-4 w-4 mr-2" />
              Changer la photo
            </Button>
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
                <p className="p-2 bg-secondary/5 rounded">{profileData.name}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              {isEditing ? (
                <Input
                  id="email"
                  type="email"
                  value={editedData.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                />
              ) : (
                <p className="p-2 bg-secondary/5 rounded">{profileData.email}</p>
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
                <p className="p-2 bg-secondary/5 rounded">{profileData.phone}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="dateOfBirth">Date de naissance</Label>
              {isEditing ? (
                <Input
                  id="dateOfBirth"
                  type="date"
                  value={editedData.dateOfBirth}
                  onChange={(e) => handleChange('dateOfBirth', e.target.value)}
                />
              ) : (
                <p className="p-2 bg-secondary/5 rounded">
                  {new Date(profileData.dateOfBirth).toLocaleDateString('fr-FR')}
                </p>
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
                <p className="p-2 bg-secondary/5 rounded">{profileData.address}</p>
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
                <p className="p-2 bg-secondary/5 rounded">{profileData.emergencyContact}</p>
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
                />
              ) : (
                <p className="p-2 bg-secondary/5 rounded">{profileData.bloodType}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="insuranceId">Numéro d'assurance</Label>
              {isEditing ? (
                <Input
                  id="insuranceId"
                  value={editedData.insuranceId}
                  onChange={(e) => handleChange('insuranceId', e.target.value)}
                />
              ) : (
                <p className="p-2 bg-secondary/5 rounded">{profileData.insuranceId}</p>
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
                <p className="p-2 bg-secondary/5 rounded">{profileData.cmuNumber}</p>
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
                <p className="p-2 bg-secondary/5 rounded min-h-[60px]">{profileData.allergies}</p>
              )}
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="chronicConditions">Conditions chroniques</Label>
              {isEditing ? (
                <Textarea
                  id="chronicConditions"
                  value={editedData.chronicConditions}
                  onChange={(e) => handleChange('chronicConditions', e.target.value)}
                  placeholder="Listez vos conditions chroniques..."
                />
              ) : (
                <p className="p-2 bg-secondary/5 rounded min-h-[60px]">{profileData.chronicConditions}</p>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}