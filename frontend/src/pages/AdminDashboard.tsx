import { useState, useEffect } from "react";
import { AdminService, AdminStats, ChartData, Pharmacy, Review, UserProfile } from "@/services/AdminService";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import {
    TrendingUp,
    ShoppingCart,
    Building2,
    AlertTriangle,
    MessageSquare,
    ArrowUpRight,
    Loader2,
    Filter,
    Star,
    Check,
    X,
    ShieldCheck,
    Mail,
    UserPlus,
    Ban,
    Unlock,
    User,
    Search
} from "lucide-react";
import {
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    AreaChart,
    Area
} from "recharts";

const AdminDashboard = () => {
    const [stats, setStats] = useState<AdminStats | null>(null);
    const [chartData, setChartData] = useState<ChartData[]>([]);
    const [pendingPharmacies, setPendingPharmacies] = useState<Pharmacy[]>([]);
    const [pendingReviews, setPendingReviews] = useState<Review[]>([]);
    const [users, setUsers] = useState<UserProfile[]>([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            const [s, c, p, r, u] = await Promise.all([
                AdminService.getDashboardStats(),
                AdminService.getRevenueChartData(),
                AdminService.getPendingPharmacies(),
                AdminService.getPendingReviews(),
                AdminService.getUsers()
            ]);
            setStats(s);
            setChartData(c);
            setPendingPharmacies(p);
            setPendingReviews(r);
            setUsers(u);
            setLoading(false);
        };
        fetchData();
    }, []);

    const handleApprovePharmacy = async (id: string) => {
        const success = await AdminService.approvePharmacy(id);
        if (success) {
            toast.success("Pharmacie approuvée avec succès");
            setPendingPharmacies(prev => prev.filter(p => p.id !== id));
            setStats(prev => prev ? { ...prev, activePharmacies: prev.activePharmacies + 1 } : null);
        }
    };

    const handleModerateReview = async (id: string, status: 'approved' | 'rejected') => {
        const success = await AdminService.moderateReview(id, status);
        if (success) {
            toast.success(status === 'approved' ? "Avis approuvé" : "Avis rejeté");
            setPendingReviews(prev => prev.filter(r => r.id !== id));
            setStats(prev => prev ? { ...prev, pendingReviews: Math.max(0, prev.pendingReviews - 1) } : null);
        }
    };

    const handleToggleUserBlock = async (userId: string, currentlyBlocked: boolean) => {
        const success = await AdminService.toggleUserBlockStatus(userId, !currentlyBlocked);
        if (success) {
            toast.success(currentlyBlocked ? "Utilisateur débloqué" : "Utilisateur bloqué");
            setUsers(prev => prev.map(u => u.id === userId ? { ...u, verified: currentlyBlocked } : u));
        }
    };

    const filteredUsers = users.filter(u =>
        u.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.name?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50/50">
            <Header />

            <main className="container mx-auto px-4 py-8">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-slate-900 font-outfit">Super-Admin Dashboard</h1>
                        <p className="text-slate-500 mt-1">Vue d'ensemble et pilotage de la plateforme PharmaGo</p>
                    </div>
                    <div className="flex gap-3">
                        <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors shadow-sm">
                            <Filter className="h-4 w-4" />
                            Filtrer par date
                        </button>
                    </div>
                </div>

                <Tabs defaultValue="overview" className="space-y-6">
                    <TabsList className="bg-white border p-1 h-12 shadow-sm rounded-xl">
                        <TabsTrigger value="overview" className="rounded-lg data-[state=active]:bg-primary data-[state=active]:text-white">
                            Vue d'ensemble
                        </TabsTrigger>
                        <TabsTrigger value="pharmacies" className="rounded-lg data-[state=active]:bg-primary data-[state=active]:text-white">
                            Pharmacies ({pendingPharmacies.length})
                        </TabsTrigger>
                        <TabsTrigger value="moderation" className="rounded-lg data-[state=active]:bg-primary data-[state=active]:text-white">
                            Modération ({pendingReviews.length})
                        </TabsTrigger>
                        <TabsTrigger value="users" className="rounded-lg data-[state=active]:bg-primary data-[state=active]:text-white">
                            Utilisateurs ({users.length})
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="overview" className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                        {/* Stats Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                            <StatCard
                                title="Chiffre d'Affaires"
                                value={`${stats?.totalRevenue.toLocaleString()} FCFA`}
                                icon={<TrendingUp className="h-5 w-5 text-emerald-600" />}
                                trend="+12.5% vs mois dernier"
                                variant="emerald"
                            />
                            <StatCard
                                title="Commandes Totales"
                                value={stats?.totalOrders.toString() || "0"}
                                icon={<ShoppingCart className="h-5 w-5 text-blue-600" />}
                                trend="+5% aujourd'hui"
                                variant="blue"
                            />
                            <StatCard
                                title="Pharmacies Actives"
                                value={stats?.activePharmacies.toString() || "0"}
                                icon={<Building2 className="h-5 w-5 text-purple-600" />}
                                trend="2 nouvelles ce mois"
                                variant="purple"
                            />
                            <StatCard
                                title="Avis à Modérer"
                                value={stats?.pendingReviews.toString() || "0"}
                                icon={<MessageSquare className="h-5 w-5 text-orange-600" />}
                                trend={`${stats?.pendingReviews} actions requises`}
                                variant="orange"
                            />
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            {/* Revenue Chart */}
                            <Card className="lg:col-span-2 shadow-sm border-slate-200 overflow-hidden">
                                <CardHeader className="bg-white border-b border-slate-100">
                                    <CardTitle className="text-lg font-bold flex items-center gap-2">
                                        <TrendingUp className="h-5 w-5 text-primary" />
                                        Évolution des Revenus
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="pt-6">
                                    <div className="h-[300px] w-full">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <AreaChart data={chartData}>
                                                <defs>
                                                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                                        <stop offset="5%" stopColor="#2563eb" stopOpacity={0.1} />
                                                        <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                                                    </linearGradient>
                                                </defs>
                                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                                <XAxis
                                                    dataKey="date"
                                                    axisLine={false}
                                                    tickLine={false}
                                                    tick={{ fill: '#64748b', fontSize: 12 }}
                                                    dy={10}
                                                />
                                                <YAxis
                                                    axisLine={false}
                                                    tickLine={false}
                                                    tick={{ fill: '#64748b', fontSize: 12 }}
                                                    tickFormatter={(value) => `${value / 1000}k`}
                                                />
                                                <Tooltip
                                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                                    formatter={(value: any) => [`${value.toLocaleString()} FCFA`, 'Revenue']}
                                                />
                                                <Area
                                                    type="monotone"
                                                    dataKey="revenue"
                                                    stroke="#2563eb"
                                                    strokeWidth={3}
                                                    fillOpacity={1}
                                                    fill="url(#colorRevenue)"
                                                />
                                            </AreaChart>
                                        </ResponsiveContainer>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Critical Orders / Alerts */}
                            <Card className="shadow-sm border-slate-200">
                                <CardHeader className="bg-white border-b border-slate-100">
                                    <CardTitle className="text-lg font-bold flex items-center gap-2">
                                        <AlertTriangle className="h-5 w-5 text-red-500" />
                                        Alertes Critiques
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="pt-6">
                                    <div className="space-y-4">
                                        {stats?.criticalOrders && stats.criticalOrders > 0 ? (
                                            Array.from({ length: stats.criticalOrders }).map((_, i) => (
                                                <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-red-50 border border-red-100 animate-pulse">
                                                    <div className="bg-red-500 p-2 rounded-full mt-0.5">
                                                        <AlertTriangle className="h-3 w-3 text-white" />
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-bold text-red-900">Commande #CMD-249{i} retardée</p>
                                                        <p className="text-xs text-red-700">Pharmacie de Garde • Depuis 45 min</p>
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="text-center py-8">
                                                <div className="bg-emerald-100 h-10 w-10 rounded-full flex items-center justify-center mx-auto mb-3">
                                                    <ArrowUpRight className="h-6 w-6 text-emerald-600" />
                                                </div>
                                                <p className="text-sm font-medium text-slate-900">Tout est sous contrôle</p>
                                                <p className="text-xs text-slate-500">Aucune commande critique pour le moment</p>
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>

                    <TabsContent value="pharmacies" className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                        <Card className="shadow-sm border-slate-200">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Building2 className="h-5 w-5 text-primary" />
                                    Pharmacies en attente d'approbation
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                {pendingPharmacies.length > 0 ? (
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Nom</TableHead>
                                                <TableHead>Adresse</TableHead>
                                                <TableHead>Licence</TableHead>
                                                <TableHead>Date d'inscription</TableHead>
                                                <TableHead className="text-right">Actions</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {pendingPharmacies.map((p) => (
                                                <TableRow key={p.id}>
                                                    <TableCell className="font-bold">{p.name}</TableCell>
                                                    <TableCell>{p.address}</TableCell>
                                                    <TableCell>
                                                        <Badge variant="outline">{p.license_number}</Badge>
                                                    </TableCell>
                                                    <TableCell>{new Date(p.created_at).toLocaleDateString()}</TableCell>
                                                    <TableCell className="text-right">
                                                        <div className="flex justify-end gap-2">
                                                            <Button size="sm" variant="outline" className="text-red-600 hover:bg-red-50 hover:text-red-600 border-red-100">
                                                                Rejeter
                                                            </Button>
                                                            <Button size="sm" onClick={() => handleApprovePharmacy(p.id)} className="bg-emerald-600 hover:bg-emerald-700">
                                                                Approuver
                                                            </Button>
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                ) : (
                                    <div className="text-center py-12">
                                        <div className="bg-slate-100 h-12 w-12 rounded-full flex items-center justify-center mx-auto mb-4">
                                            <Building2 className="h-6 w-6 text-slate-400" />
                                        </div>
                                        <p className="text-slate-500 font-medium">Aucune pharmacie en attente</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="moderation" className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                        <Card className="shadow-sm border-slate-200">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <MessageSquare className="h-5 w-5 text-primary" />
                                    Avis à modérer
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                {pendingReviews.length > 0 ? (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {pendingReviews.map((r) => (
                                            <Card key={r.id} className="bg-slate-50/50 border-slate-200 overflow-hidden hover:border-primary/20 transition-colors">
                                                <CardContent className="p-4">
                                                    <div className="flex justify-between items-start mb-3">
                                                        <div className="flex gap-1">
                                                            {[1, 2, 3, 4, 5].map((s) => (
                                                                <Star key={s} className={`h-4 w-4 ${r.rating >= s ? "fill-yellow-400 text-yellow-400" : "text-slate-200"}`} />
                                                            ))}
                                                        </div>
                                                        <Badge variant="secondary" className="text-[10px] capitalize bg-white">
                                                            {r.target_type === 'pharmacy' ? 'Pharmacie' : 'Livreur'}
                                                        </Badge>
                                                    </div>
                                                    <p className="text-sm text-slate-700 italic mb-4 min-h-[40px]">"{r.comment || "Aucun commentaire"}"</p>
                                                    <div className="flex justify-between items-center pt-4 border-t border-slate-200">
                                                        <span className="text-xs text-slate-400">{new Date(r.created_at).toLocaleDateString()}</span>
                                                        <div className="flex gap-2">
                                                            <Button size="icon" variant="ghost" onClick={() => handleModerateReview(r.id, 'rejected')} className="h-8 w-8 text-red-500 hover:bg-red-50 hover:text-red-500">
                                                                <X className="h-4 w-4" />
                                                            </Button>
                                                            <Button size="icon" variant="ghost" onClick={() => handleModerateReview(r.id, 'approved')} className="h-8 w-8 text-emerald-500 hover:bg-emerald-50 hover:text-emerald-500">
                                                                <Check className="h-4 w-4" />
                                                            </Button>
                                                        </div>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-12">
                                        <div className="bg-slate-100 h-12 w-12 rounded-full flex items-center justify-center mx-auto mb-4">
                                            <MessageSquare className="h-6 w-6 text-slate-400" />
                                        </div>
                                        <p className="text-slate-500 font-medium">Aucun avis en attente de modération</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="users" className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                        <Card className="shadow-sm border-slate-200">
                            <CardHeader className="flex flex-row items-center justify-between">
                                <CardTitle className="flex items-center gap-2">
                                    <User className="h-5 w-5 text-primary" />
                                    Gestion des Utilisateurs
                                </CardTitle>
                                <div className="relative w-64">
                                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
                                    <Input
                                        placeholder="Rechercher par nom/email..."
                                        className="pl-9 h-9"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                    />
                                </div>
                            </CardHeader>
                            <CardContent>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Utilisateur</TableHead>
                                            <TableHead>Email</TableHead>
                                            <TableHead>Rôle</TableHead>
                                            <TableHead>Statut</TableHead>
                                            <TableHead className="text-right">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {filteredUsers.map((u) => (
                                            <TableRow key={u.id}>
                                                <TableCell>
                                                    <div className="flex items-center gap-2">
                                                        <div className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-bold text-xs">
                                                            {u.name?.charAt(0) || u.email?.charAt(0) || 'U'}
                                                        </div>
                                                        <span className="font-medium text-slate-900">{u.name || "Inconnu"}</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-slate-600">{u.email}</TableCell>
                                                <TableCell>
                                                    <Badge variant="outline" className="capitalize">{u.role}</Badge>
                                                </TableCell>
                                                <TableCell>
                                                    {u.verified ? (
                                                        <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-emerald-200">Actif</Badge>
                                                    ) : (
                                                        <Badge className="bg-red-100 text-red-700 hover:bg-red-100 border-red-200">Bloqué</Badge>
                                                    )}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <div className="flex justify-end gap-2">
                                                        <Button size="icon" variant="ghost" className="h-8 w-8 text-slate-400">
                                                            <Mail className="h-4 w-4" />
                                                        </Button>
                                                        {u.verified ? (
                                                            <Button
                                                                size="icon"
                                                                variant="ghost"
                                                                onClick={() => handleToggleUserBlock(u.id, true)}
                                                                className="h-8 w-8 text-red-500 hover:bg-red-50"
                                                            >
                                                                <Ban className="h-4 w-4" />
                                                            </Button>
                                                        ) : (
                                                            <Button
                                                                size="icon"
                                                                variant="ghost"
                                                                onClick={() => handleToggleUserBlock(u.id, false)}
                                                                className="h-8 w-8 text-emerald-500 hover:bg-emerald-50"
                                                            >
                                                                <Unlock className="h-4 w-4" />
                                                            </Button>
                                                        )}
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </main>

            <Footer />
        </div>
    );
};

const StatCard = ({ title, value, icon, trend, variant }: {
    title: string;
    value: string;
    icon: React.ReactNode;
    trend: string;
    variant: 'emerald' | 'blue' | 'purple' | 'orange'
}) => {
    const colors = {
        emerald: 'bg-emerald-50 text-emerald-600',
        blue: 'bg-blue-50 text-blue-600',
        purple: 'bg-purple-50 text-purple-600',
        orange: 'bg-orange-50 text-orange-600'
    };

    return (
        <Card className="shadow-sm border-slate-200 hover:shadow-md transition-shadow">
            <CardContent className="pt-6">
                <div className="flex justify-between items-start mb-4">
                    <div className={`p-2 rounded-xl ${colors[variant]}`}>
                        {icon}
                    </div>
                    <Badge variant="secondary" className="bg-slate-100 text-slate-600 hover:bg-slate-100 text-[10px]">
                        TEMPS RÉEL
                    </Badge>
                </div>
                <div>
                    <p className="text-sm font-medium text-slate-500">{title}</p>
                    <h3 className="text-2xl font-bold text-slate-900 my-1 font-outfit">{value}</h3>
                    <p className={`text-xs font-medium flex items-center gap-1 ${variant === 'orange' ? 'text-orange-600' : 'text-emerald-600'}`}>
                        {trend}
                    </p>
                </div>
            </CardContent>
        </Card>
    );
};

export default AdminDashboard;
