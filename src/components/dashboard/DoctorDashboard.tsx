import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { 
  Stethoscope, 
  Calendar, 
  FileText, 
  QrCode, 
  Users, 
  Clock,
  MessageCircle,
  Plus,
  Search,
  Edit,
  Eye
} from 'lucide-react'

export const DoctorDashboard = () => {
  const [patients] = useState([
    {
      id: 'PAT001',
      name: 'Marie Kouassi',
      age: 45,
      phone: '+225 07 XX XX XX',
      lastVisit: '2024-01-15',
      nextAppointment: '2024-01-22 à 09:00',
      status: 'suivi_regulier',
      condition: 'Hypertension artérielle',
      insuranceId: 'CNPS123456',
      prescribedMeds: [
        'Amlodipine 5mg - 1x/jour',
        'Losartan 50mg - 1x/jour'
      ],
      medicalHistory: 'Patient diabétique de type 2, suivi depuis 2020',
      bloodPressure: '140/90 mmHg',
      weight: '78 kg'
    },
    {
      id: 'PAT002', 
      name: 'Koffi Yao',
      age: 32,
      phone: '+225 05 XX XX XX',
      lastVisit: '2024-01-10',
      nextAppointment: '2024-01-25 à 14:30',
      status: 'nouveau_patient',
      condition: 'Consultation générale',
      prescribedMeds: [
        'Amoxicilline 500mg - 2x/jour pendant 7 jours'
      ],
      medicalHistory: 'Aucun antécédent médical particulier',
      bloodPressure: '120/80 mmHg',
      weight: '72 kg'
    },
    {
      id: 'PAT003',
      name: 'Aya Traoré',
      age: 28,
      phone: '+225 01 XX XX XX',
      lastVisit: '2024-01-18',
      nextAppointment: '2024-01-30 à 11:00',
      status: 'suivi_regulier',
      condition: 'Suivi grossesse',
      insuranceId: 'CMU789012',
      prescribedMeds: [
        'Acide folique 5mg - 1x/jour',
        'Fer + Vitamine C - 1x/jour'
      ],
      medicalHistory: 'Première grossesse, 24 semaines',
      bloodPressure: '110/70 mmHg',
      weight: '65 kg'
    }
  ])

  const [prescriptions] = useState([
    {
      id: 'ORD001',
      patient: 'Marie Kouassi',
      patientId: 'PAT001',
      date: '2024-01-15',
      status: 'active',
      medications: [
        { name: 'Doliprane 1000mg', dosage: '1 comprimé 3x/jour', duration: '7 jours' },
        { name: 'Efferalgan 500mg', dosage: '1 comprimé si douleur', duration: '5 jours' }
      ],
      pharmacy: 'Pharmacie Centrale',
      diagnosis: 'Grippe saisonnière',
      notes: 'Repos recommandé, hydratation'
    },
    {
      id: 'ORD002',
      patient: 'Koffi Yao',
      patientId: 'PAT002',
      date: '2024-01-10',
      status: 'completed',
      medications: [
        { name: 'Amoxicilline 500mg', dosage: '1 comprimé 2x/jour', duration: '10 jours' }
      ],
      pharmacy: 'Pharmacie du Plateau',
      diagnosis: 'Infection respiratoire',
      notes: 'Contrôle dans 1 semaine'
    }
  ])

  const [appointments] = useState([
    {
      id: 'RDV001',
      patient: 'Marie Kouassi',
      date: '2024-01-22',
      time: '09:00',
      type: 'Suivi',
      status: 'confirmed'
    },
    {
      id: 'RDV002',
      patient: 'Aya Traoré',
      date: '2024-01-22',
      time: '10:30',
      type: 'Consultation',
      status: 'pending'
    }
  ])

  const stats = {
    todayPatients: 8,
    activePrescriptions: 15,
    appointmentsWeek: 24,
    consultationRate: 96
  }

  const getStatusBadge = (status: string) => {
    const styles = {
      suivi_regulier: 'bg-green-100 text-green-800 border-green-200',
      nouveau_patient: 'bg-blue-100 text-blue-800 border-blue-200',
      active: 'bg-green-100 text-green-800 border-green-200',
      completed: 'bg-gray-100 text-gray-800 border-gray-200',
      confirmed: 'bg-green-100 text-green-800 border-green-200',
      pending: 'bg-orange-100 text-orange-800 border-orange-200'
    }
    const labels = {
      suivi_regulier: 'Suivi régulier',
      nouveau_patient: 'Nouveau',
      active: 'Active',
      completed: 'Terminée',
      confirmed: 'Confirmé',
      pending: 'En attente'
    }
    return (
      <Badge className={styles[status as keyof typeof styles]}>
        {labels[status as keyof typeof labels]}
      </Badge>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-background to-blue-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Tableau de Bord Médecin</h1>
            <p className="text-muted-foreground">Gestion des patients et ordonnances</p>
          </div>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Nouvelle Ordonnance
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Patients Aujourd'hui</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.todayPatients}</div>
              <p className="text-xs text-muted-foreground">+2 depuis hier</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Ordonnances Actives</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.activePrescriptions}</div>
              <p className="text-xs text-muted-foreground">En cours</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">RDV cette Semaine</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.appointmentsWeek}</div>
              <p className="text-xs text-muted-foreground">Planifiés</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Taux de Consultation</CardTitle>
              <Stethoscope className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.consultationRate}%</div>
              <p className="text-xs text-muted-foreground">Ce mois</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="patients" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="patients">Patients</TabsTrigger>
            <TabsTrigger value="prescriptions">Historique</TabsTrigger>
            <TabsTrigger value="create">Prescrire</TabsTrigger>
            <TabsTrigger value="appointments">Planning</TabsTrigger>
          </TabsList>

          <TabsContent value="patients" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Mes Patients</CardTitle>
                    <CardDescription>Liste de vos patients et leur suivi</CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Input placeholder="Rechercher..." className="w-64" />
                    <Button variant="outline" size="icon">
                      <Search className="h-4 w-4" />
                    </Button>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Nouveau Patient
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {patients.map((patient) => (
                    <div key={patient.id} className="border rounded-lg p-6 space-y-4 bg-white shadow-sm">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h4 className="font-semibold text-lg">{patient.name}</h4>
                            {getStatusBadge(patient.status)}
                          </div>
                          <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground">
                            <p>👤 {patient.age} ans • {patient.phone}</p>
                            {patient.insuranceId && (
                              <p>🏥 Assurance: {patient.insuranceId}</p>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      {/* Informations médicales détaillées */}
                      <div className="bg-blue-50 p-4 rounded-lg space-y-3">
                        <h5 className="font-semibold text-blue-900">Informations Médicales</h5>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="font-medium text-blue-800">Condition de santé:</span>
                            <p className="text-blue-700">{patient.condition}</p>
                          </div>
                          
                          <div>
                            <span className="font-medium text-blue-800">Antécédents:</span>
                            <p className="text-blue-700">{patient.medicalHistory}</p>
                          </div>
                          
                          <div>
                            <span className="font-medium text-blue-800">Tension artérielle:</span>
                            <p className="text-blue-700">{patient.bloodPressure}</p>
                          </div>
                          
                          <div>
                            <span className="font-medium text-blue-800">Poids:</span>
                            <p className="text-blue-700">{patient.weight}</p>
                          </div>
                        </div>
                      </div>

                      {/* Médicaments prescrits */}
                      <div className="bg-green-50 p-4 rounded-lg space-y-3">
                        <h5 className="font-semibold text-green-900">Médicaments Prescrits</h5>
                        <div className="space-y-2">
                          {patient.prescribedMeds.map((med, index) => (
                            <div key={index} className="flex items-center gap-2 text-sm">
                              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                              <span className="text-green-700">{med}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Rendez-vous */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm bg-orange-50 p-4 rounded-lg">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-orange-600" />
                          <span className="font-medium text-orange-800">Dernière visite:</span>
                          <span className="text-orange-700">{patient.lastVisit}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-orange-600" />
                          <span className="font-medium text-orange-800">Prochain RDV:</span>
                          <span className="text-orange-700 font-semibold">{patient.nextAppointment}</span>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex flex-wrap gap-2 pt-2 border-t">
                        <Button size="sm" variant="outline" className="flex-1 min-w-fit">
                          <Eye className="h-4 w-4 mr-1" />
                          Voir Dossier Complet
                        </Button>
                        <Button size="sm" variant="outline" className="flex-1 min-w-fit">
                          <Edit className="h-4 w-4 mr-1" />
                          Modifier Infos
                        </Button>
                        <Button size="sm" className="flex-1 min-w-fit">
                          <FileText className="h-4 w-4 mr-1" />
                          Nouvelle Ordonnance
                        </Button>
                        <Button size="sm" variant="outline">
                          <Calendar className="h-4 w-4 mr-1" />
                          Programmer RDV
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="prescriptions" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Historique des Prescriptions</CardTitle>
                <CardDescription>Suivi des ordonnances délivrées</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {prescriptions.map((prescription) => (
                    <div key={prescription.id} className="border rounded-lg p-4 space-y-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-semibold">{prescription.id}</h4>
                          <p className="text-sm text-muted-foreground">{prescription.patient}</p>
                          <p className="text-xs text-muted-foreground">Diagnostic: {prescription.diagnosis}</p>
                        </div>
                        <div className="text-right">
                          {getStatusBadge(prescription.status)}
                          <p className="text-sm text-muted-foreground mt-1">{prescription.date}</p>
                        </div>
                      </div>
                      
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <h5 className="font-medium mb-2">Médicaments prescrits:</h5>
                        <div className="space-y-2">
                          {prescription.medications.map((med, index) => (
                            <div key={index} className="text-sm">
                              <div className="font-medium">{med.name}</div>
                              <div className="text-muted-foreground">{med.dosage} - {med.duration}</div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {prescription.notes && (
                        <div className="bg-blue-50 p-3 rounded-lg">
                          <p className="text-sm text-blue-800">
                            <strong>Notes:</strong> {prescription.notes}
                          </p>
                        </div>
                      )}

                      <div className="flex gap-2 pt-2">
                        <Button size="sm" variant="outline">
                          <QrCode className="h-4 w-4 mr-1" />
                          QR Code
                        </Button>
                        <Button size="sm" variant="outline">
                          <Edit className="h-4 w-4 mr-1" />
                          Modifier
                        </Button>
                        <p className="text-xs text-muted-foreground self-center">
                          Pharmacie: {prescription.pharmacy}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="appointments" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Planning des Rendez-vous</CardTitle>
                <CardDescription>Gestion des consultations</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {appointments.map((appointment) => (
                    <div key={appointment.id} className="border rounded-lg p-4 space-y-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-semibold">{appointment.patient}</h4>
                          <p className="text-sm text-muted-foreground">{appointment.type}</p>
                        </div>
                        <div className="text-right">
                          {getStatusBadge(appointment.status)}
                          <p className="text-sm font-semibold mt-1">{appointment.date} à {appointment.time}</p>
                        </div>
                      </div>
                      
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline">
                          <MessageCircle className="h-4 w-4 mr-1" />
                          Contacter
                        </Button>
                        <Button size="sm">
                          <Calendar className="h-4 w-4 mr-1" />
                          Reprogrammer
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="create" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Créer une Nouvelle Ordonnance</CardTitle>
                <CardDescription>Prescription médicale digitale</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium">Patient</label>
                      <Input placeholder="Rechercher un patient..." />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Diagnostic</label>
                      <Input placeholder="Diagnostic principal..." />
                    </div>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium">Médicaments</label>
                    <Textarea 
                      placeholder="Liste des médicaments avec posologie..."
                      className="min-h-32"
                    />
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium">Notes et recommandations</label>
                    <Textarea 
                      placeholder="Instructions supplémentaires..."
                      className="min-h-24"
                    />
                  </div>
                  
                  <div className="flex gap-2">
                    <Button>
                      <FileText className="h-4 w-4 mr-2" />
                      Créer l'ordonnance
                    </Button>
                    <Button variant="outline">
                      <QrCode className="h-4 w-4 mr-2" />
                      Générer QR Code
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}