import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { useAuth } from '@/hooks/useAuth'
import { 
  MapPin, 
  Package, 
  Clock, 
  DollarSign, 
  Navigation, 
  Star,
  TrendingUp,
  Calendar,
  Eye,
  CheckCircle,
  Phone,
  MessageCircle,
  Route,
  User
} from 'lucide-react'

export const DriverDashboard = () => {
  const { profile } = useAuth()
  const [isAvailable, setIsAvailable] = useState(true)
  const [activeDeliveries] = useState([
    {
      id: '1',
      orderId: 'CMD-001',
      pharmacy: 'Pharmacie Central',
      customer: 'Marie Kouadio',
      address: 'Cocody, Angré 7ème Tranche, Villa 15 - Appartement au 2ème étage',
      phone: '+225 07 XX XX XX',
      distance: '3.2 km',
      fee: 2000,
      status: 'assigned',
      estimatedTime: '15 min',
      pickupTime: '14:30',
      customerNotes: 'Sonnez à l\'interphone, code : 1234',
      medications: [
        { name: 'Doliprane 1000mg', quantity: 2, prescription: 'ORD-001' },
        { name: 'Amoxicilline 500mg', quantity: 1, prescription: 'ORD-001' },
        { name: 'Vitamine C 500mg', quantity: 1, prescription: 'ORD-002' }
      ]
    },
    {
      id: '2', 
      orderId: 'CMD-002',
      pharmacy: 'Pharmacie du Plateau',
      customer: 'Koffi Yao',
      address: 'Plateau, Zone 4, Immeuble Nour Al Hayat, Bureau 205',
      phone: '+225 05 XX XX XX',
      distance: '1.8 km',
      fee: 1500,
      status: 'picked_up',
      estimatedTime: '8 min',
      pickupTime: '15:00',
      customerNotes: 'Livraison urgente - Client diabétique',
      medications: [
        { name: 'Insuline Lantus', quantity: 1, prescription: 'ORD-003' },
        { name: 'Glucomètre strips', quantity: 1, prescription: 'ORD-003' }
      ]
    },
    {
      id: '3',
      orderId: 'CMD-003', 
      pharmacy: 'Pharmacie de la Paix',
      customer: 'Aya Traoré',
      address: 'Adjamé, Marché, près de la gare routière',
      phone: '+225 01 XX XX XX',
      distance: '2.5 km',
      fee: 1800,
      status: 'assigned',
      estimatedTime: '12 min',
      pickupTime: '15:30',
      medications: [
        { name: 'Paracétamol 500mg', quantity: 2, prescription: 'ORD-004' },
        { name: 'Sirop contre la toux', quantity: 1, prescription: 'ORD-004' }
      ]
    }
  ])

  const [todayHistory] = useState([
    {
      id: 'DEL001',
      orderId: 'CMD-003',
      customer: 'Aya Traoré',
      pharmacy: 'Pharmacie Centrale',
      completedAt: '12:45',
      fee: 2500,
      rating: 5,
      distance: '4.1 km'
    },
    {
      id: 'DEL002',
      orderId: 'CMD-004',
      customer: 'Jean Kouassi',
      pharmacy: 'Pharmacie du Plateau',
      completedAt: '11:20',
      fee: 1800,
      rating: 4,
      distance: '2.3 km'
    }
  ])

  const stats = {
    todayDeliveries: 8,
    todayEarnings: 16800,
    weeklyEarnings: 95500,
    rating: 4.8,
    completionRate: 98,
    totalDistance: 45.2
  }

  const getStatusBadge = (status: string) => {
    const styles = {
      assigned: 'bg-orange-100 text-orange-800 border-orange-200',
      picked_up: 'bg-blue-100 text-blue-800 border-blue-200',
      in_transit: 'bg-purple-100 text-purple-800 border-purple-200',
      delivered: 'bg-green-100 text-green-800 border-green-200'
    }
    const labels = {
      assigned: 'Assignée',
      picked_up: 'Récupéré',
      in_transit: 'En livraison',
      delivered: 'Livré'
    }
    return (
      <Badge className={styles[status as keyof typeof styles]}>
        {labels[status as keyof typeof labels]}
      </Badge>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-background to-blue-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Tableau de Bord Livreur</h1>
            <p className="text-muted-foreground">Bonjour {profile?.name}, gérez vos livraisons</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium">Disponible</span>
              <Switch
                checked={isAvailable}
                onCheckedChange={setIsAvailable}
              />
              <Badge variant={isAvailable ? 'default' : 'secondary'}>
                {isAvailable ? 'EN LIGNE' : 'HORS LIGNE'}
              </Badge>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Livraisons Aujourd'hui</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.todayDeliveries}</div>
              <p className="text-xs text-muted-foreground">+3 depuis hier</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Gains du Jour</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.todayEarnings.toLocaleString()} F</div>
              <p className="text-xs text-muted-foreground">Semaine: {stats.weeklyEarnings.toLocaleString()} F</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Note Moyenne</CardTitle>
              <Star className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">⭐ {stats.rating}</div>
              <p className="text-xs text-muted-foreground">Sur 127 livraisons</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Distance Parcourue</CardTitle>
              <Route className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalDistance} km</div>
              <p className="text-xs text-muted-foreground">Aujourd'hui</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="active" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="active">En cours</TabsTrigger>
            <TabsTrigger value="route">Tournée</TabsTrigger>
            <TabsTrigger value="history">Historique</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
          </TabsList>

          <TabsContent value="active" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Livraisons Assignées</CardTitle>
                    <CardDescription>Gérez vos livraisons actives</CardDescription>
                  </div>
                  <Button className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700">
                    <Route className="h-4 w-4 mr-2" />
                    Optimiser Tournée
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {activeDeliveries.length > 0 ? (
                  <div className="space-y-6">
                    {activeDeliveries.map((delivery) => (
                      <div key={delivery.id} className="border-2 rounded-xl p-6 space-y-4 bg-white shadow-lg">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h4 className="text-xl font-bold text-primary">#{delivery.orderId}</h4>
                              {getStatusBadge(delivery.status)}
                            </div>
                            <div className="space-y-1">
                              <p className="font-semibold text-lg">{delivery.customer}</p>
                              <p className="text-sm text-muted-foreground flex items-center gap-1">
                                <Phone className="h-4 w-4" />
                                {delivery.phone}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-2xl font-bold text-green-600">{delivery.fee.toLocaleString()} F</div>
                            <p className="text-sm text-muted-foreground">Frais de livraison</p>
                          </div>
                        </div>
                        
                        {/* Adresse de livraison complète */}
                        <div className="bg-blue-50 p-4 rounded-lg space-y-2">
                          <h5 className="font-semibold text-blue-900 flex items-center gap-2">
                            <MapPin className="h-4 w-4" />
                            Adresse de Livraison Complète
                          </h5>
                          <p className="text-blue-800 font-medium">{delivery.address}</p>
                          {delivery.customerNotes && (
                            <div className="mt-2 p-2 bg-blue-100 rounded border-l-4 border-blue-500">
                              <p className="text-sm text-blue-800">
                                <strong>🚨 Note importante:</strong> {delivery.customerNotes}
                              </p>
                            </div>
                          )}
                        </div>

                        {/* Liste des médicaments */}
                        <div className="bg-green-50 p-4 rounded-lg space-y-3">
                          <h5 className="font-semibold text-green-900 flex items-center gap-2">
                            <Package className="h-4 w-4" />
                            Liste des Médicaments à Livrer
                          </h5>
                          <div className="space-y-2">
                            {delivery.medications.map((med, index) => (
                              <div key={index} className="flex items-center justify-between p-3 bg-white rounded-lg border border-green-200">
                                <div className="flex items-center gap-3">
                                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                                  <div>
                                    <p className="font-medium text-green-800">{med.name}</p>
                                    <p className="text-xs text-green-600">Ordonnance: {med.prescription}</p>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-sm font-medium">
                                    Qté: {med.quantity}
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                          <p className="text-sm text-green-700 font-medium">
                            📍 Récupérer à: <span className="text-green-800">{delivery.pharmacy}</span>
                          </p>
                        </div>

                        {/* Informations de trajet */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm bg-orange-50 p-4 rounded-lg">
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-orange-600" />
                            <div>
                              <p className="font-medium text-orange-800">Distance</p>
                              <p className="text-orange-700 font-semibold">{delivery.distance}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-orange-600" />
                            <div>
                              <p className="font-medium text-orange-800">Temps estimé</p>
                              <p className="text-orange-700 font-semibold">{delivery.estimatedTime}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-orange-600" />
                            <div>
                              <p className="font-medium text-orange-800">Récupération</p>
                              <p className="text-orange-700 font-semibold">{delivery.pickupTime}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Package className="h-4 w-4 text-orange-600" />
                            <div>
                              <p className="font-medium text-orange-800">Statut</p>
                              <p className="text-orange-700 font-semibold">
                                {delivery.status === 'assigned' ? 'À récupérer' : 
                                 delivery.status === 'picked_up' ? 'À livrer' : 'En cours'}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Boutons d'action */}
                        <div className="flex flex-wrap gap-3 pt-4 border-t-2 border-gray-100">
                          {delivery.status === 'assigned' && (
                            <Button className="flex-1 min-w-fit bg-green-600 hover:bg-green-700">
                              <CheckCircle className="h-4 w-4 mr-2" />
                              Commencer Livraison
                            </Button>
                          )}
                          {delivery.status === 'picked_up' && (
                            <Button className="flex-1 min-w-fit bg-purple-600 hover:bg-purple-700">
                              <Navigation className="h-4 w-4 mr-2" />
                              Commencer Trajet
                            </Button>
                          )}
                          <Button size="default" variant="outline" className="min-w-fit">
                            <Eye className="h-4 w-4 mr-2" />
                            Détails
                          </Button>
                          <Button size="default" variant="outline" className="min-w-fit">
                            <Navigation className="h-4 w-4 mr-2" />
                            GPS
                          </Button>
                          <Button size="default" variant="outline" className="min-w-fit">
                            <Phone className="h-4 w-4 mr-2" />
                            Appeler
                          </Button>
                          <Button size="default" variant="outline" className="min-w-fit">
                            <MessageCircle className="h-4 w-4 mr-2" />
                            Message
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Package className="h-20 w-20 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-xl font-semibold mb-2">Aucune livraison assignée</h3>
                    <p className="text-muted-foreground mb-6">
                      Restez en ligne pour recevoir de nouvelles commandes
                    </p>
                    {!isAvailable && (
                      <Button onClick={() => setIsAvailable(true)} size="lg">
                        Se mettre en ligne
                      </Button>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="route" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Optimisation de Tournée</CardTitle>
                    <CardDescription>Ordre suggéré pour minimiser le temps de trajet</CardDescription>
                  </div>
                  <Button className="bg-gradient-to-r from-purple-500 to-blue-600 hover:from-purple-600 hover:to-blue-700">
                    <Route className="h-4 w-4 mr-2" />
                    Optimiser Tournée
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* Tournée optimisée */}
                  <div className="border-2 border-purple-200 rounded-xl p-6 bg-gradient-to-br from-purple-50 to-blue-50">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-2 bg-purple-100 rounded-full">
                        <Route className="h-6 w-6 text-purple-600" />
                      </div>
                      <h4 className="text-xl font-bold text-purple-900">Tournée Optimisée - 3 livraisons</h4>
                    </div>
                    
                    <div className="space-y-4">
                      {/* Livraison 1 */}
                      <div className="flex items-center p-4 bg-white rounded-lg border-l-4 border-green-500 shadow-sm">
                        <div className="flex-shrink-0 w-10 h-10 bg-green-500 text-white rounded-full flex items-center justify-center font-bold">
                          1
                        </div>
                        <div className="ml-4 flex-1">
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="font-semibold text-lg">Marie Kouadio</p>
                              <p className="text-sm text-muted-foreground">📍 Cocody, Angré 7ème Tranche</p>
                              <p className="text-xs text-blue-600 font-medium">🏥 Pharmacie Central → CMD-001</p>
                            </div>
                            <div className="text-right">
                              <p className="text-lg font-bold text-green-600">3.2 km</p>
                              <p className="text-sm text-green-700">⏱️ 12 min</p>
                              <p className="text-xs text-muted-foreground">Priorité: Urgent</p>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Flèche de direction */}
                      <div className="flex justify-center">
                        <div className="w-8 h-8 bg-purple-500 text-white rounded-full flex items-center justify-center">
                          ↓
                        </div>
                      </div>

                      {/* Livraison 2 */}
                      <div className="flex items-center p-4 bg-white rounded-lg border-l-4 border-blue-500 shadow-sm">
                        <div className="flex-shrink-0 w-10 h-10 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold">
                          2
                        </div>
                        <div className="ml-4 flex-1">
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="font-semibold text-lg">Koffi Yao</p>
                              <p className="text-sm text-muted-foreground">📍 Plateau, Zone 4, Immeuble Nour Al Hayat</p>
                              <p className="text-xs text-blue-600 font-medium">🏥 Pharmacie du Plateau → CMD-002</p>
                            </div>
                            <div className="text-right">
                              <p className="text-lg font-bold text-blue-600">1.8 km</p>
                              <p className="text-sm text-blue-700">⏱️ 8 min</p>
                              <p className="text-xs text-red-500 font-medium">⚠️ Diabétique</p>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Flèche de direction */}
                      <div className="flex justify-center">
                        <div className="w-8 h-8 bg-purple-500 text-white rounded-full flex items-center justify-center">
                          ↓
                        </div>
                      </div>

                      {/* Livraison 3 */}
                      <div className="flex items-center p-4 bg-white rounded-lg border-l-4 border-orange-500 shadow-sm">
                        <div className="flex-shrink-0 w-10 h-10 bg-orange-500 text-white rounded-full flex items-center justify-center font-bold">
                          3
                        </div>
                        <div className="ml-4 flex-1">
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="font-semibold text-lg">Aya Traoré</p>
                              <p className="text-sm text-muted-foreground">📍 Adjamé, Marché, près de la gare routière</p>
                              <p className="text-xs text-blue-600 font-medium">🏥 Pharmacie de la Paix → CMD-003</p>
                            </div>
                            <div className="text-right">
                              <p className="text-lg font-bold text-orange-600">2.5 km</p>
                              <p className="text-sm text-orange-700">⏱️ 15 min</p>
                              <p className="text-xs text-muted-foreground">Standard</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Résumé de la tournée */}
                    <div className="mt-6 p-6 bg-gradient-to-r from-green-50 to-blue-50 rounded-xl border-2 border-green-200">
                      <h5 className="text-lg font-bold text-green-900 mb-4 flex items-center gap-2">
                        📊 Résumé de la Tournée Optimisée
                      </h5>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="text-center p-3 bg-white rounded-lg shadow-sm">
                          <div className="text-2xl font-bold text-green-600">7.5 km</div>
                          <p className="text-sm text-green-700 font-medium">Distance totale</p>
                        </div>
                        <div className="text-center p-3 bg-white rounded-lg shadow-sm">
                          <div className="text-2xl font-bold text-blue-600">35 min</div>
                          <p className="text-sm text-blue-700 font-medium">Temps estimé</p>
                        </div>
                        <div className="text-center p-3 bg-white rounded-lg shadow-sm">
                          <div className="text-2xl font-bold text-purple-600">5,300 F</div>
                          <p className="text-sm text-purple-700 font-medium">Gains totaux</p>
                        </div>
                        <div className="text-center p-3 bg-white rounded-lg shadow-sm">
                          <div className="text-2xl font-bold text-orange-600">3</div>
                          <p className="text-sm text-orange-700 font-medium">Livraisons</p>
                        </div>
                      </div>
                      
                      {/* Économies réalisées */}
                      <div className="mt-4 p-4 bg-green-100 rounded-lg border border-green-300">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-semibold text-green-800">💡 Optimisation réussie !</p>
                            <p className="text-sm text-green-700">
                              Vous économisez <strong>12 min</strong> et <strong>2.3 km</strong> par rapport à l'ordre initial
                            </p>
                          </div>
                          <div className="text-right">
                            <div className="text-lg font-bold text-green-600">-25%</div>
                            <p className="text-xs text-green-700">Temps réduit</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Boutons d'action */}
                    <div className="flex gap-4 mt-6">
                      <Button className="flex-1 bg-green-600 hover:bg-green-700" size="lg">
                        <CheckCircle className="h-5 w-5 mr-2" />
                        Sauvegarder Tournée
                      </Button>
                      <Button variant="outline" size="lg" className="min-w-fit">
                        <Navigation className="h-5 w-5 mr-2" />
                        Démarrer GPS
                      </Button>
                      <Button variant="outline" size="lg" className="min-w-fit">
                        <Route className="h-5 w-5 mr-2" />
                        Nouvelle Optimisation
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="history" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Historique des Livraisons</CardTitle>
                    <CardDescription>Performance et statistiques détaillées</CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" className="bg-green-50 hover:bg-green-100 border-green-200">
                      <TrendingUp className="h-4 w-4 mr-2" />
                      Exporter
                    </Button>
                    <Button variant="outline">Jour</Button>
                    <Button variant="outline">Semaine</Button>
                    <Button variant="outline">Mois</Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Statistiques de performance */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-green-800">Aujourd'hui</p>
                          <p className="text-2xl font-bold text-green-600">8</p>
                          <p className="text-xs text-green-700">Livraisons</p>
                        </div>
                        <Package className="h-8 w-8 text-green-600" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-blue-800">Cette Semaine</p>
                          <p className="text-2xl font-bold text-blue-600">47</p>
                          <p className="text-xs text-blue-700">Livraisons</p>
                        </div>
                        <Calendar className="h-8 w-8 text-blue-600" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-purple-800">Ce Mois</p>
                          <p className="text-2xl font-bold text-purple-600">186</p>
                          <p className="text-xs text-purple-700">Livraisons</p>
                        </div>
                        <TrendingUp className="h-8 w-8 text-purple-600" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-orange-800">Taux Réussite</p>
                          <p className="text-2xl font-bold text-orange-600">98%</p>
                          <p className="text-xs text-orange-700">Performance</p>
                        </div>
                        <Star className="h-8 w-8 text-orange-600" />
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Performance détaillée */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Performance du Jour</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                          <span className="font-medium text-green-800">Livraisons réussies</span>
                          <div className="text-right">
                            <div className="text-lg font-bold text-green-600">8/8</div>
                            <Progress value={100} className="w-20 mt-1" />
                          </div>
                        </div>
                        
                        <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                          <span className="font-medium text-blue-800">Temps moyen par livraison</span>
                          <div className="text-right">
                            <div className="text-lg font-bold text-blue-600">18 min</div>
                            <p className="text-xs text-blue-700">-3 min vs hier</p>
                          </div>
                        </div>
                        
                        <div className="flex justify-between items-center p-3 bg-orange-50 rounded-lg">
                          <span className="font-medium text-orange-800">Distance parcourue</span>
                          <div className="text-right">
                            <div className="text-lg font-bold text-orange-600">45.2 km</div>
                            <p className="text-xs text-orange-700">Optimal</p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Gains & Évaluations</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                          <span className="font-medium text-green-800">Gains aujourd'hui</span>
                          <div className="text-right">
                            <div className="text-lg font-bold text-green-600">16,800 F</div>
                            <p className="text-xs text-green-700">+2,100 F vs hier</p>
                          </div>
                        </div>
                        
                        <div className="flex justify-between items-center p-3 bg-yellow-50 rounded-lg">
                          <span className="font-medium text-yellow-800">Note moyenne</span>
                          <div className="text-right">
                            <div className="text-lg font-bold text-yellow-600 flex items-center gap-1">
                              <Star className="h-5 w-5 fill-current" />
                              4.8/5
                            </div>
                            <p className="text-xs text-yellow-700">127 évaluations</p>
                          </div>
                        </div>
                        
                        <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
                          <span className="font-medium text-purple-800">Pourboires reçus</span>
                          <div className="text-right">
                            <div className="text-lg font-bold text-purple-600">3,200 F</div>
                            <p className="text-xs text-purple-700">4 clients généreux</p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Historique détaillé */}
                <Card>
                  <CardHeader>
                    <CardTitle>Historique Détaillé - Aujourd'hui</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Heure</TableHead>
                          <TableHead>Commande</TableHead>
                          <TableHead>Client</TableHead>
                          <TableHead>Pharmacie</TableHead>
                          <TableHead>Distance</TableHead>
                          <TableHead>Durée</TableHead>
                          <TableHead>Gains</TableHead>
                          <TableHead>Note</TableHead>
                          <TableHead>Statut</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {todayHistory.map((delivery) => (
                          <TableRow key={delivery.id}>
                            <TableCell className="font-medium">{delivery.completedAt}</TableCell>
                            <TableCell>
                              <Badge variant="outline" className="bg-blue-50 text-blue-700">
                                {delivery.orderId}
                              </Badge>
                            </TableCell>
                            <TableCell>{delivery.customer}</TableCell>
                            <TableCell>{delivery.pharmacy}</TableCell>
                            <TableCell>
                              <div className="flex items-center gap-1">
                                <MapPin className="h-4 w-4 text-blue-500" />
                                {delivery.distance}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-1">
                                <Clock className="h-4 w-4 text-orange-500" />
                                18 min
                              </div>
                            </TableCell>
                            <TableCell className="font-semibold text-green-600">
                              {delivery.fee.toLocaleString()} F
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-1">
                                <Star className="h-4 w-4 text-yellow-500 fill-current" />
                                <span className="font-medium">{delivery.rating}</span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge className="bg-green-100 text-green-800 border-green-200">
                                ✅ Livré
                              </Badge>
                            </TableCell>
                          </TableRow>
                        ))}
                        
                        {/* Ligne de résumé */}
                        <TableRow className="bg-gray-50 border-t-2">
                          <TableCell className="font-bold">Total</TableCell>
                          <TableCell className="font-bold">8 commandes</TableCell>
                          <TableCell>-</TableCell>
                          <TableCell>-</TableCell>
                          <TableCell className="font-bold">45.2 km</TableCell>
                          <TableCell className="font-bold">144 min</TableCell>
                          <TableCell className="font-bold text-green-600">16,800 F</TableCell>
                          <TableCell className="font-bold">
                            <div className="flex items-center gap-1">
                              <Star className="h-4 w-4 text-yellow-500 fill-current" />
                              4.8
                            </div>
                          </TableCell>
                          <TableCell className="font-bold text-green-600">100%</TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="performance" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Gains de la Semaine</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold mb-2">{stats.weeklyEarnings.toLocaleString()} F</div>
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-green-500" />
                    <span className="text-sm text-green-600">+12% vs semaine dernière</span>
                  </div>
                  <Progress value={68} className="mt-4" />
                  <p className="text-sm text-muted-foreground mt-2">
                    68% de votre objectif hebdomadaire
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Performance</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Taux de réussite</span>
                      <div className="flex items-center gap-2">
                        <Progress value={stats.completionRate} className="w-24" />
                        <span className="text-sm font-medium">{stats.completionRate}%</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Note moyenne</span>
                      <div className="flex items-center gap-2">
                        <Progress value={(stats.rating / 5) * 100} className="w-24" />
                        <span className="text-sm font-medium">{stats.rating}/5</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Temps moyen</span>
                      <div className="flex items-center gap-2">
                        <Progress value={85} className="w-24" />
                        <span className="text-sm font-medium">18 min</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}