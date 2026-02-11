import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, Package, Users, DollarSign } from 'lucide-react';
import {
    LineChart,
    Line,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
} from 'recharts';

const salesData = [
    { month: 'Jan', sales: 4000, orders: 240 },
    { month: 'Fév', sales: 3000, orders: 198 },
    { month: 'Mar', sales: 5000, orders: 320 },
    { month: 'Avr', sales: 4500, orders: 280 },
    { month: 'Mai', sales: 6000, orders: 390 },
    { month: 'Juin', sales: 5500, orders: 350 },
];

const categoryData = [
    { name: 'Antibiotiques', value: 400, color: '#0EA5E9' },
    { name: 'Antalgiques', value: 300, color: '#10B981' },
    { name: 'Vitamines', value: 200, color: '#F59E0B' },
    { name: 'Autres', value: 100, color: '#8B5CF6' },
];

const topMedicines = [
    { name: 'Paracétamol 500mg', sales: 1234, trend: +12 },
    { name: 'Amoxicilline 500mg', sales: 987, trend: +8 },
    { name: 'Vitamine C', sales: 765, trend: -3 },
    { name: 'Doliprane', sales: 654, trend: +15 },
    { name: 'Aspirine', sales: 543, trend: +5 },
];

export const AnalyticsDashboard = () => {
    return (
        <div className="space-y-6">
            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Ventes totales</CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">28,000 FCFA</div>
                        <p className="text-xs text-muted-foreground">
                            <span className="text-green-600">+12%</span> depuis le mois dernier
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Commandes</CardTitle>
                        <Package className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">1,778</div>
                        <p className="text-xs text-muted-foreground">
                            <span className="text-green-600">+8%</span> depuis le mois dernier
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Clients</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">573</div>
                        <p className="text-xs text-muted-foreground">
                            <span className="text-green-600">+24%</span> nouveaux ce mois
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Tendance</CardTitle>
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">+15.2%</div>
                        <p className="text-xs text-muted-foreground">Croissance mensuelle</p>
                    </CardContent>
                </Card>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Ventes mensuelles</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                            <LineChart data={salesData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="month" />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Line
                                    type="monotone"
                                    dataKey="sales"
                                    stroke="#0EA5E9"
                                    strokeWidth={2}
                                    name="Ventes (FCFA)"
                                />
                                <Line
                                    type="monotone"
                                    dataKey="orders"
                                    stroke="#10B981"
                                    strokeWidth={2}
                                    name="Commandes"
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Catégories par ventes</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie
                                    data={categoryData}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    label={(entry) => entry.name}
                                    outerRadius={80}
                                    fill="#8884d8"
                                    dataKey="value"
                                >
                                    {categoryData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </div>

            {/* Top Medicines */}
            <Card>
                <CardHeader>
                    <CardTitle>Top 5 médicaments</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-3">
                        {topMedicines.map((medicine, index) => (
                            <div
                                key={index}
                                className="flex items-center justify-between p-3 bg-secondary/20 rounded-lg"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="font-bold text-lg text-muted-foreground">
                                        #{index + 1}
                                    </div>
                                    <div>
                                        <p className="font-medium">{medicine.name}</p>
                                        <p className="text-sm text-muted-foreground">
                                            {medicine.sales} ventes
                                        </p>
                                    </div>
                                </div>
                                <div
                                    className={`flex items-center gap-1 px-2 py-1 rounded ${medicine.trend > 0
                                            ? 'bg-green-100 text-green-700'
                                            : 'bg-red-100 text-red-700'
                                        }`}
                                >
                                    <TrendingUp
                                        className={`h-4 w-4 ${medicine.trend < 0 ? 'rotate-180' : ''}`}
                                    />
                                    <span className="text-sm font-medium">
                                        {medicine.trend > 0 ? '+' : ''}
                                        {medicine.trend}%
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};
