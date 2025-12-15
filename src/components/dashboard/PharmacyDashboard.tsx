import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Progress } from '@/components/ui/progress'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Switch } from '@/components/ui/switch'
import { 
  Package, 
  ShoppingCart, 
  AlertTriangle, 
  TrendingUp, 
  Users,
  Plus,
  Search,
  Clock,
  MapPin,
  CheckCircle,
  XCircle,
  Eye,
  Edit,
  DollarSign,
  Star,
  Calendar,
  Pill,
  CreditCard
} from 'lucide-react'

export const PharmacyDashboard = () => {
  const [isOpen, setIsOpen] = useState(true)
  const [orders] = useState([
    {
      id: 'CMD001',
      patient: 'Marie Kouassi',
      status: 'en_preparation',
      total: 25500,
      items: 3,
      time: '10:30',
      address: 'Cocody, Angré',
      driver: 'Jean Kouadio',
      phone: '+225 07 XX XX XX'
    },
    {
      id: 'CMD002',
      patient: 'Aya Traoré',
      status: 'pret',
      total: 18750,
      items: 2,
      time: '11:15',
      address: 'Plateau, Zone 4',
      phone: '+225 05 XX XX XX'
    },
    {
      id: 'CMD003',
      patient: 'Koffi Mensah',
      status: 'livre',
      total: 35200,
      items: 5,
      time: '09:45',
      address: 'Marcory, Zone 4',
      driver: 'Marie Yao',
      deliveredAt: '12:30'
    }
  ])

  const [inventory] = useState([
    {
      id: 'MED001',
      name: 'Paracétamol 500mg',
      stock: 150,
      minStock: 50,
      price: 750,
      category: 'Antalgique',
      expiry: '2025-06-15'
    },
    {
      id: 'MED002',
      name: 'Amoxicilline 250mg',
      stock: 25,
      minStock: 30,
      price: 2500,
      category: 'Antibiotique',
      expiry: '2024-12-31'
    },
    {
      id: 'MED003',
      name: 'Doliprane 1000mg',
      stock: 89,
      minStock: 40,
      price: 1200,
      category: 'Antalgique',
      expiry: '2025-03-20'
    }
  ])

  const stats = {
    todayOrders: 12,
    weeklyRevenue: 485000,
    averageRating: 4.7,
    lowStockItems: 3
  }

  const getStatusBadge = (status: string) => {
    const styles = {
      en_preparation: 'bg-orange-100 text-orange-800 border-orange-200',
      pret: 'bg-blue-100 text-blue-800 border-blue-200',
      en_livraison: 'bg-purple-100 text-purple-800 border-purple-200',
      livre: 'bg-green-100 text-green-800 border-green-200',
      annule: 'bg-red-100 text-red-800 border-red-200'
    }
    const labels = {
      en_preparation: 'En préparation',
      pret: 'Prêt',
      en_livraison: 'En livraison',
      livre: 'Livré',
      annule: 'Annulé'
    }
    return (
      <Badge className={styles[status as keyof typeof styles]}>
        {labels[status as keyof typeof labels]}
      </Badge>
    )
  }

  const getStockStatus = (current: number, min: number) => {
    if (current <= min) return 'text-red-600'
    if (current <= min * 1.5) return 'text-orange-600'
    return 'text-green-600'
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-background to-blue-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Tableau de Bord Pharmacie</h1>
            <p className="text-muted-foreground">Gestion des commandes et inventaire</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium">Pharmacie ouverte</span>
              <Switch
                checked={isOpen}
                onCheckedChange={setIsOpen}
              />
              <Badge variant={isOpen ? 'default' : 'secondary'}>
                {isOpen ? 'OUVERTE' : 'FERMÉE'}
              </Badge>
            </div>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Ajouter médicament
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Commandes Aujourd'hui</CardTitle>
              <ShoppingCart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.todayOrders}</div>
              <p className="text-xs text-muted-foreground">+3 depuis hier</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Chiffre d'affaires</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.weeklyRevenue.toLocaleString()} F</div>
              <p className="text-xs text-muted-foreground">Cette semaine</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Note moyenne</CardTitle>
              <Star className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">⭐ {stats.averageRating}</div>
              <p className="text-xs text-muted-foreground">Sur 127 avis</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Stock faible</CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{stats.lowStockItems}</div>
              <p className="text-xs text-muted-foreground">Articles à réapprovisionner</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="orders" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="orders">Commandes</TabsTrigger>
            <TabsTrigger value="inventory">Stock</TabsTrigger>
            <TabsTrigger value="patients">Patients</TabsTrigger>
            <TabsTrigger value="cmu">CMU</TabsTrigger>
          </TabsList>

          <TabsContent value="orders" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Commandes en Cours</CardTitle>
                    <CardDescription>Validation et préparation des commandes</CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button>Traiter Tout</Button>
                    <Button variant="outline">Filtres</Button>
                    <Input placeholder="Rechercher..." className="w-64" />
                    <Button variant="outline" size="icon">
                      <Search className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {orders.map((order) => (
                    <div key={order.id} className="border rounded-lg p-4 space-y-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-semibold">{order.id}</h4>
                          <p className="text-sm text-muted-foreground">{order.patient}</p>
                          <p className="text-xs text-muted-foreground">{order.phone}</p>
                        </div>
                        <div className="text-right">
                          {getStatusBadge(order.status)}
                          <p className="text-sm font-semibold mt-1">{order.total.toLocaleString()} F</p>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div className="flex items-center gap-2">
                          <Pill className="h-4 w-4 text-blue-500" />
                          {order.items} articles
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-orange-500" />
                          {order.time}
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-purple-500" />
                          {order.address}
                        </div>
                        {order.driver && (
                          <div className="flex items-center gap-2">
                            <Users className="h-4 w-4 text-green-500" />
                            {order.driver}
                          </div>
                        )}
                      </div>

                      <div className="flex gap-2 pt-2">
                        {order.status === 'en_preparation' && (
                          <>
                            <Button size="sm" variant="outline">
                              <Eye className="h-4 w-4 mr-1" />
                              Voir détails
                            </Button>
                            <Button size="sm">
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Marquer prêt
                            </Button>
                          </>
                        )}
                        {order.status === 'pret' && (
                          <>
                            <Button size="sm" variant="outline">
                              <Users className="h-4 w-4 mr-1" />
                              Assigner livreur
                            </Button>
                            <Button size="sm">
                              <Package className="h-4 w-4 mr-1" />
                              Confirmer retrait
                            </Button>
                          </>
                        )}
                        {order.status === 'livre' && order.deliveredAt && (
                          <Badge variant="secondary" className="text-green-600">
                            Livré à {order.deliveredAt}
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="inventory" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Gestion du Stock</CardTitle>
                    <CardDescription>Inventaire et réapprovisionnement</CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Input placeholder="Rechercher un médicament..." className="w-64" />
                    <Button variant="outline">
                      <Plus className="h-4 w-4 mr-2" />
                      Ajouter
                    </Button>
                    <Button variant="outline">Réapprovisionner</Button>
                    <Button>Modifier</Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Médicament</TableHead>
                      <TableHead>Catégorie</TableHead>
                      <TableHead>Stock</TableHead>
                      <TableHead>Prix</TableHead>
                      <TableHead>Expiration</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {inventory.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{item.name}</div>
                            <div className="text-sm text-muted-foreground">{item.id}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{item.category}</Badge>
                        </TableCell>
                        <TableCell>
                          <div className={`font-medium ${getStockStatus(item.stock, item.minStock)}`}>
                            {item.stock} unités
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Min: {item.minStock}
                          </div>
                        </TableCell>
                        <TableCell className="font-medium">
                          {item.price.toLocaleString()} F
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            {new Date(item.expiry).toLocaleDateString('fr-FR')}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm">
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="outline" size="sm">
                              <Package className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="patients" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Gestion Patients</CardTitle>
                <CardDescription>Suivi des patients et cartes vitales</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                  <Card>
                    <CardContent className="p-6 text-center">
                      <Users className="h-12 w-12 text-primary mx-auto mb-4" />
                      <h3 className="font-semibold mb-2">Patients assurés</h3>
                      <div className="text-2xl font-bold">245</div>
                      <p className="text-sm text-muted-foreground">Cartes vitales actives</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-6 text-center">
                      <TrendingUp className="h-12 w-12 text-primary mx-auto mb-4" />
                      <h3 className="font-semibold mb-2">Total patients</h3>
                      <div className="text-2xl font-bold">567</div>
                      <p className="text-sm text-muted-foreground">Tous confondus</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-6 text-center">
                      <Calendar className="h-12 w-12 text-primary mx-auto mb-4" />
                      <h3 className="font-semibold mb-2">Actifs ce mois</h3>
                      <div className="text-2xl font-bold">89</div>
                      <p className="text-sm text-muted-foreground">Nouvelles consultations</p>
                    </CardContent>
                  </Card>
                </div>
                <Button>Voir la liste complète</Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="cmu" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Patients CMU</CardTitle>
                    <CardDescription>Gestion des cartes CMU</CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline">Statistiques</Button>
                    <Button>Gérer CMU</Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
                  <Card>
                    <CardContent className="p-6 text-center">
                      <CreditCard className="h-12 w-12 text-primary mx-auto mb-4" />
                      <h3 className="font-semibold mb-2">Cartes CMU créées</h3>
                      <div className="text-2xl font-bold">45</div>
                      <p className="text-sm text-muted-foreground">Automatiquement</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-6 text-center">
                      <DollarSign className="h-12 w-12 text-primary mx-auto mb-4" />
                      <h3 className="font-semibold mb-2">Nombre créés</h3>
                      <div className="text-2xl font-bold">23</div>
                      <p className="text-sm text-muted-foreground">Ce mois</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-6 text-center">
                      <Clock className="h-12 w-12 text-primary mx-auto mb-4" />
                      <h3 className="font-semibold mb-2">En attente validation</h3>
                      <div className="text-2xl font-bold">8</div>
                      <p className="text-sm text-muted-foreground">À traiter</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-6 text-center">
                      <CheckCircle className="h-12 w-12 text-primary mx-auto mb-4" />
                      <h3 className="font-semibold mb-2">Validées</h3>
                      <div className="text-2xl font-bold">156</div>
                      <p className="text-sm text-muted-foreground">Total</p>
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