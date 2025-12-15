import { useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { EditablePatientProfile } from './EditablePatientProfile'
import { OrderHistory } from '@/components/orders/OrderHistory'
import { 
  Package, 
  Clock, 
  MapPin, 
  CreditCard, 
  FileText, 
  Bell,
  User,
  Shield,
  Pill,
  ShoppingCart,
  MessageCircle,
  Calendar
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'

export const PatientDashboard = () => {
  const { user, profile } = useAuth()
  const navigate = useNavigate()
  const [orders] = useState([
    {
      id: 'CMD001',
      status: 'en_cours',
      total: 25500,
      pharmacy: 'Pharmacie Centrale',
      items: 3,
      estimatedTime: '25 min',
      driver: 'Kouassi Jean'
    },
    {
      id: 'CMD002', 
      status: 'livre',
      total: 12000,
      pharmacy: 'Pharmacie du Plateau',
      items: 2,
      deliveredAt: '2024-01-10'
    }
  ])

  const [insurance] = useState({
    number: 'ASS123456789',
    coverage: 85,
    remaining: 250000,
    provider: 'CNPS'
  })

  const getStatusBadge = (status: string) => {
    const styles = {
      en_cours: 'bg-blue-100 text-blue-800 border-blue-200',
      livre: 'bg-green-100 text-green-800 border-green-200',
      annule: 'bg-red-100 text-red-800 border-red-200'
    }
    const labels = {
      en_cours: 'En cours',
      livre: 'Livrée',
      annule: 'Annulée'
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
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Tableau de Bord Patient</h1>
            <p className="text-muted-foreground">Gérez vos commandes et ordonnances</p>
          </div>
          <Button className="flex items-center gap-2">
            <ShoppingCart className="h-4 w-4" />
            Nouvelle Commande
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Commandes Actives</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">1</div>
              <p className="text-xs text-muted-foreground">En cours de livraison</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Économies ce mois</CardTitle>
              <CreditCard className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">45 000 F</div>
              <p className="text-xs text-muted-foreground">Grâce à l'assurance</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Ordonnances</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">3</div>
              <p className="text-xs text-muted-foreground">En attente</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Messages</CardTitle>
              <MessageCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">2</div>
              <p className="text-xs text-muted-foreground">Non lus</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="orders" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="orders">Commandes</TabsTrigger>
            <TabsTrigger value="history" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Historique
            </TabsTrigger>
            <TabsTrigger value="insurance">Assurance</TabsTrigger>
            <TabsTrigger value="prescriptions">Ordonnances</TabsTrigger>
            <TabsTrigger value="profile">Profil</TabsTrigger>
          </TabsList>

          <TabsContent value="orders" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Mes Commandes</CardTitle>
                <CardDescription>Historique et suivi de vos commandes</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {orders.map((order) => (
                  <div key={order.id} className="border rounded-lg p-4 space-y-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-semibold">{order.id}</h4>
                        <p className="text-sm text-muted-foreground">{order.pharmacy}</p>
                      </div>
                      {getStatusBadge(order.status)}
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <Pill className="h-4 w-4 text-blue-500" />
                        {order.items} articles
                      </div>
                      <div className="flex items-center gap-2">
                        <CreditCard className="h-4 w-4 text-green-500" />
                        {order.total.toLocaleString()} F
                      </div>
                      {order.estimatedTime && (
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-orange-500" />
                          {order.estimatedTime}
                        </div>
                      )}
                      {order.driver && (
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-purple-500" />
                          {order.driver}
                        </div>
                      )}
                    </div>

                    {order.status === 'en_cours' && (
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Progression</span>
                          <span>75%</span>
                        </div>
                        <Progress value={75} className="h-2" />
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline">
                            <MapPin className="h-4 w-4 mr-1" />
                            Suivre
                          </Button>
                          <Button size="sm" variant="outline">
                            <MessageCircle className="h-4 w-4 mr-1" />
                            Contacter
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="history" className="space-y-6">
            <OrderHistory 
              userId={user?.id || ''} 
              userName={profile?.name || ''} 
              userEmail={profile?.email || ''} 
            />
          </TabsContent>

          <TabsContent value="insurance" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Ma Couverture Assurance</CardTitle>
                <CardDescription>Informations sur votre assurance santé</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg">
                      <Shield className="h-8 w-8 text-blue-500" />
                      <div>
                        <h3 className="font-semibold">{insurance.provider}</h3>
                        <p className="text-sm text-muted-foreground">N° {insurance.number}</p>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Taux de couverture</span>
                        <span className="font-semibold">{insurance.coverage}%</span>
                      </div>
                      <Progress value={insurance.coverage} className="h-2" />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="p-4 border rounded-lg">
                      <h4 className="font-semibold mb-2">Plafond restant</h4>
                      <div className="text-2xl font-bold text-green-600">
                        {insurance.remaining.toLocaleString()} F
                      </div>
                      <p className="text-sm text-muted-foreground">Sur 500 000 F annuel</p>
                    </div>

                    <Button className="w-full">
                      <FileText className="h-4 w-4 mr-2" />
                      Demander un remboursement
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="prescriptions" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Mes Ordonnances</CardTitle>
                <CardDescription>Gérez vos prescriptions médicales</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Aucune ordonnance</h3>
                  <p className="text-muted-foreground mb-4">
                    Uploadez ou recevez vos ordonnances de votre médecin
                  </p>
                  <Button>
                    <FileText className="h-4 w-4 mr-2" />
                    Ajouter une ordonnance
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="profile" className="space-y-6">
            <EditablePatientProfile />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}