import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Progress } from '@/components/ui/progress'
import { Input } from '@/components/ui/input'
import { 
  Users, 
  Building, 
  Truck, 
  Activity, 
  ShoppingCart,
  DollarSign,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  Search,
  Eye,
  Edit,
  Shield,
  BarChart
} from 'lucide-react'

export const AdminDashboard = () => {
  const [recentUsers] = useState([
    {
      id: 'USR001',
      name: 'Marie Kouassi',
      email: 'marie@example.com',
      role: 'patient',
      status: 'active',
      joinedAt: '2024-01-15'
    },
    {
      id: 'USR002',
      name: 'Pharmacie Centrale',
      email: 'contact@pharma-centrale.ci',
      role: 'pharmacy',
      status: 'pending',
      joinedAt: '2024-01-14'
    }
  ])

  const [recentOrders] = useState([
    {
      id: 'CMD001',
      patient: 'Aya Traoré',
      pharmacy: 'Pharmacie du Plateau',
      total: 25500,
      status: 'completed',
      date: '2024-01-15'
    },
    {
      id: 'CMD002',
      patient: 'Koffi Yao',
      pharmacy: 'Pharmacie Centrale',
      total: 18750,
      status: 'in_progress',
      date: '2024-01-15'
    }
  ])

  const stats = {
    totalUsers: 1247,
    pharmacies: 45,
    drivers: 89,
    todayOrders: 156,
    monthlyRevenue: 15750000,
    pendingVerifications: 12,
    systemHealth: 98
  }

  const getStatusBadge = (status: string) => {
    const styles = {
      active: 'bg-green-100 text-green-800 border-green-200',
      pending: 'bg-orange-100 text-orange-800 border-orange-200',
      suspended: 'bg-red-100 text-red-800 border-red-200',
      completed: 'bg-green-100 text-green-800 border-green-200',
      in_progress: 'bg-blue-100 text-blue-800 border-blue-200',
      cancelled: 'bg-red-100 text-red-800 border-red-200'
    }
    return <Badge className={styles[status as keyof typeof styles]}>{status}</Badge>
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-background to-orange-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Administration PharmaGo</h1>
            <p className="text-muted-foreground">Supervision et gestion de la plateforme</p>
          </div>
          <Button>
            <Shield className="h-4 w-4 mr-2" />
            Rapport Sécurité
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Utilisateurs Totaux</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalUsers.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">+47 ce mois</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Chiffre d'Affaires</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{(stats.monthlyRevenue / 1000000).toFixed(1)}M F</div>
              <p className="text-xs text-muted-foreground">Ce mois</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Commandes Aujourd'hui</CardTitle>
              <ShoppingCart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.todayOrders}</div>
              <p className="text-xs text-muted-foreground">+12% vs hier</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Vérifications</CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{stats.pendingVerifications}</div>
              <p className="text-xs text-muted-foreground">En attente</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
            <TabsTrigger value="users">Utilisateurs</TabsTrigger>
            <TabsTrigger value="orders">Commandes</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="settings">Paramètres</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Santé du Système</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold mb-2">{stats.systemHealth}%</div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm text-green-600">Système opérationnel</span>
                  </div>
                  <Progress value={stats.systemHealth} className="mt-4" />
                  <div className="mt-4 space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>API Response Time</span>
                      <span className="text-green-600">125ms</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Database Performance</span>
                      <span className="text-green-600">Optimal</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Croissance Mensuelle</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Nouveaux utilisateurs</span>
                      <div className="flex items-center gap-2">
                        <Progress value={75} className="w-24" />
                        <span className="text-sm font-medium">+47</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Pharmacies inscrites</span>
                      <div className="flex items-center gap-2">
                        <Progress value={60} className="w-24" />
                        <span className="text-sm font-medium">+8</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Livreurs validés</span>
                      <div className="flex items-center gap-2">
                        <Progress value={45} className="w-24" />
                        <span className="text-sm font-medium">+12</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="users" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Gestion des Utilisateurs</CardTitle>
                    <CardDescription>Administrer les comptes et permissions</CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Input placeholder="Rechercher..." className="w-64" />
                    <Button variant="outline" size="icon">
                      <Search className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Utilisateur</TableHead>
                      <TableHead>Rôle</TableHead>
                      <TableHead>Statut</TableHead>
                      <TableHead>Inscription</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recentUsers.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{user.name}</div>
                            <div className="text-sm text-muted-foreground">{user.email}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{user.role}</Badge>
                        </TableCell>
                        <TableCell>{getStatusBadge(user.status)}</TableCell>
                        <TableCell>{user.joinedAt}</TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button variant="outline" size="sm">
                              <Edit className="h-4 w-4" />
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

          <TabsContent value="orders" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Supervision des Commandes</CardTitle>
                <CardDescription>Monitoring en temps réel des commandes</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Commande</TableHead>
                      <TableHead>Patient</TableHead>
                      <TableHead>Pharmacie</TableHead>
                      <TableHead>Montant</TableHead>
                      <TableHead>Statut</TableHead>
                      <TableHead>Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recentOrders.map((order) => (
                      <TableRow key={order.id}>
                        <TableCell className="font-medium">{order.id}</TableCell>
                        <TableCell>{order.patient}</TableCell>
                        <TableCell>{order.pharmacy}</TableCell>
                        <TableCell className="font-semibold">
                          {order.total.toLocaleString()} F
                        </TableCell>
                        <TableCell>{getStatusBadge(order.status)}</TableCell>
                        <TableCell>{order.date}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardContent className="p-6 text-center">
                  <BarChart className="h-12 w-12 text-primary mx-auto mb-4" />
                  <h3 className="font-semibold mb-2">Revenus Mensuels</h3>
                  <div className="text-2xl font-bold">{(stats.monthlyRevenue / 1000000).toFixed(1)}M F</div>
                  <p className="text-sm text-muted-foreground">
                    +15% vs mois dernier
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6 text-center">
                  <TrendingUp className="h-12 w-12 text-primary mx-auto mb-4" />
                  <h3 className="font-semibold mb-2">Croissance Active</h3>
                  <div className="text-2xl font-bold">+23%</div>
                  <p className="text-sm text-muted-foreground">
                    Utilisateurs actifs
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6 text-center">
                  <Clock className="h-12 w-12 text-primary mx-auto mb-4" />
                  <h3 className="font-semibold mb-2">Temps Moyen</h3>
                  <div className="text-2xl font-bold">22 min</div>
                  <p className="text-sm text-muted-foreground">
                    Livraison moyenne
                  </p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Paramètres Système</CardTitle>
                <CardDescription>Configuration de la plateforme</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Shield className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Paramètres Avancés</h3>
                  <p className="text-muted-foreground">
                    Interface de configuration système
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}