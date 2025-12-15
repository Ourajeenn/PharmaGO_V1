import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Shield, 
  FileText, 
  CreditCard, 
  Users, 
  Clock,
  CheckCircle
} from 'lucide-react'

export const InsurerDashboard = () => {
  const [claims] = useState([
    {
      id: 'RMB001',
      patient: 'Marie Kouassi',
      amount: 25500,
      status: 'en_attente',
      date: '2024-01-15',
      pharmacy: 'Pharmacie Centrale'
    },
    {
      id: 'RMB002',
      patient: 'Koffi Yao',
      amount: 18750,
      status: 'traite',
      date: '2024-01-10',
      pharmacy: 'Pharmacie du Plateau'
    }
  ])

  const stats = {
    pendingClaims: 8,
    processedClaims: 45,
    totalReimbursed: 1250000,
    cmuCards: 234
  }

  const getStatusBadge = (status: string) => {
    const styles = {
      en_attente: 'bg-orange-100 text-orange-800 border-orange-200',
      traite: 'bg-green-100 text-green-800 border-green-200',
      rejete: 'bg-red-100 text-red-800 border-red-200'
    }
    const labels = {
      en_attente: 'En attente',
      traite: 'Traité',
      rejete: 'Rejeté'
    }
    return (
      <Badge className={styles[status as keyof typeof styles]}>
        {labels[status as keyof typeof labels]}
      </Badge>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-background to-green-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Tableau de Bord Assurance Maladie</h1>
            <p className="text-muted-foreground">Gestion des remboursements et CMU</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">Filtres</Button>
            <Button variant="outline">Traitement par lot</Button>
            <Button>Nouvel Assuré</Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Demandes en Attente</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.pendingClaims}</div>
              <p className="text-xs text-muted-foreground">À traiter</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Remboursements Traités</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.processedClaims}</div>
              <p className="text-xs text-muted-foreground">Ce mois</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Montant Remboursé</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalReimbursed.toLocaleString()} F</div>
              <p className="text-xs text-muted-foreground">Total mensuel</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Cartes CMU Créées</CardTitle>
              <CreditCard className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.cmuCards}</div>
              <p className="text-xs text-muted-foreground">Actives</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="claims" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="claims">Demandes</TabsTrigger>
            <TabsTrigger value="cmu">Gestion CMU</TabsTrigger>
            <TabsTrigger value="patients">Patients</TabsTrigger>
            <TabsTrigger value="reports">Rapports</TabsTrigger>
          </TabsList>

          <TabsContent value="claims" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Demandes de Remboursement</CardTitle>
                    <CardDescription>Traitement des demandes de prise en charge</CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" className="bg-green-50 text-green-700">Approuver</Button>
                    <Button variant="outline" className="bg-blue-50 text-blue-700">Réviser</Button>
                    <Button variant="outline" className="bg-red-50 text-red-700">Rejeter</Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {claims.map((claim) => (
                    <div key={claim.id} className="border rounded-lg p-4 space-y-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-semibold">{claim.id}</h4>
                          <p className="text-sm text-muted-foreground">{claim.patient}</p>
                          <p className="text-xs text-muted-foreground">{claim.pharmacy}</p>
                        </div>
                        <div className="text-right">
                          {getStatusBadge(claim.status)}
                          <p className="text-sm font-semibold mt-1">{claim.amount.toLocaleString()} F</p>
                          <p className="text-xs text-muted-foreground">{claim.date}</p>
                        </div>
                      </div>
                      <div className="flex gap-2 pt-2">
                        <Button size="sm" variant="outline">Voir détails</Button>
                        <Button size="sm" className="bg-green-600 hover:bg-green-700">Approuver</Button>
                        <Button size="sm" variant="outline" className="text-red-600 border-red-200">Rejeter</Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="cmu" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Gestion des cartes CMU</CardTitle>
                    <CardDescription>Statistiques et validation CMU</CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline">Approuver</Button>
                    <Button variant="outline">Rejeter</Button>
                    <Button>Voir carte</Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
                  <Card>
                    <CardContent className="p-6 text-center">
                      <Users className="h-12 w-12 text-primary mx-auto mb-4" />
                      <h3 className="font-semibold mb-2">Total bénéficiaires</h3>
                      <div className="text-2xl font-bold">1,245</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-6 text-center">
                      <FileText className="h-12 w-12 text-primary mx-auto mb-4" />
                      <h3 className="font-semibold mb-2">Nouvelles demandes</h3>
                      <div className="text-2xl font-bold">23</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-6 text-center">
                      <Clock className="h-12 w-12 text-primary mx-auto mb-4" />
                      <h3 className="font-semibold mb-2">En attente validation</h3>
                      <div className="text-2xl font-bold">8</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-6 text-center">
                      <Shield className="h-12 w-12 text-primary mx-auto mb-4" />
                      <h3 className="font-semibold mb-2">Taux validation</h3>
                      <div className="text-2xl font-bold">94%</div>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="patients" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Gestion des Patients</CardTitle>
                    <CardDescription>Recherche et suivi des assurés</CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline">Rechercher un patient</Button>
                    <Button>Gérer les assurés</Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <Card>
                    <CardContent className="p-6 text-center">
                      <Users className="h-12 w-12 text-primary mx-auto mb-4" />
                      <h3 className="font-semibold mb-2">Total patients</h3>
                      <div className="text-2xl font-bold">2,456</div>
                      <p className="text-sm text-muted-foreground">Assurés actifs</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-6 text-center">
                      <FileText className="h-12 w-12 text-primary mx-auto mb-4" />
                      <h3 className="font-semibold mb-2">Actifs du mois</h3>
                      <div className="text-2xl font-bold">345</div>
                      <p className="text-sm text-muted-foreground">Nouvelles activités</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-6 text-center">
                      <CreditCard className="h-12 w-12 text-primary mx-auto mb-4" />
                      <h3 className="font-semibold mb-2">Nouvelles cartes</h3>
                      <div className="text-2xl font-bold">67</div>
                      <p className="text-sm text-muted-foreground">Ce mois</p>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reports" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Rapports et Statistiques</CardTitle>
                    <CardDescription>Analyses et évolution CMU</CardDescription>
                  </div>
                  <Button>Générer rapport</Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <Card>
                    <CardContent className="p-6 text-center">
                      <FileText className="h-12 w-12 text-primary mx-auto mb-4" />
                      <h3 className="font-semibold mb-2">Rapports mensuels</h3>
                      <div className="text-2xl font-bold">12</div>
                      <p className="text-sm text-muted-foreground">Générés</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-6 text-center">
                      <CheckCircle className="h-12 w-12 text-primary mx-auto mb-4" />
                      <h3 className="font-semibold mb-2">Taux de validation</h3>
                      <div className="text-2xl font-bold">94%</div>
                      <p className="text-sm text-muted-foreground">CMU approuvées</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-6 text-center">
                      <Shield className="h-12 w-12 text-primary mx-auto mb-4" />
                      <h3 className="font-semibold mb-2">Évolution CMU</h3>
                      <div className="text-2xl font-bold">+15%</div>
                      <p className="text-sm text-muted-foreground">vs mois dernier</p>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}