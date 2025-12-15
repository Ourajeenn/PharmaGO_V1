import { useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useECarnet } from '@/contexts/ECarnetContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Bell, AlertCircle, CheckCircle, X, ArrowLeft } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

const AlertsPanel = () => {
    const navigate = useNavigate();
    const {
        currentPatient,
        getPatientAlerts,
        dismissAlert,
        markAlertAsRead
    } = useECarnet();

    if (!currentPatient) {
        navigate('/ecarnet');
        return null;
    }

    const alerts = getPatientAlerts(currentPatient.id);
    const unreadAlerts = alerts.filter(a => !a.isRead);

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'Urgente': return 'destructive';
            case 'Haute': return 'default';
            case 'Moyenne': return 'secondary';
            default: return 'outline';
        }
    };

    const getTypeIcon = (type: string) => {
        return <AlertCircle className="h-5 w-5" />;
    };

    const handleDismiss = (id: string) => {
        dismissAlert(id);
    };

    const handleMarkAsRead = (id: string) => {
        markAlertAsRead(id);
    };

    return (
        <div className="min-h-screen flex flex-col">
            <Header />

            <main className="flex-1 container mx-auto px-4 py-8">
                <div className="mb-6">
                    <Button
                        variant="ghost"
                        onClick={() => navigate('/ecarnet')}
                        className="mb-4"
                    >
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Retour au E-Carnet
                    </Button>

                    <div className="flex items-center gap-3">
                        <Bell className="h-8 w-8 text-primary" />
                        <div>
                            <h1 className="text-3xl font-bold">Alertes et Rappels</h1>
                            <p className="text-muted-foreground">
                                Gérez vos alertes médicales et rappels
                            </p>
                        </div>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <Card>
                        <CardContent className="p-6">
                            <div className="text-center">
                                <p className="text-sm text-muted-foreground mb-1">Total</p>
                                <p className="text-3xl font-bold">{alerts.length}</p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-6">
                            <div className="text-center">
                                <p className="text-sm text-muted-foreground mb-1">Non lues</p>
                                <p className="text-3xl font-bold text-orange-600">{unreadAlerts.length}</p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-6">
                            <div className="text-center">
                                <p className="text-sm text-muted-foreground mb-1">Urgentes</p>
                                <p className="text-3xl font-bold text-red-600">
                                    {alerts.filter(a => a.priority === 'Urgente').length}
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Alerts List */}
                <Card>
                    <CardHeader>
                        <CardTitle>Toutes les alertes</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {alerts.length === 0 ? (
                            <div className="text-center py-12">
                                <CheckCircle className="h-16 w-16 mx-auto mb-4 text-green-600" />
                                <h3 className="text-xl font-semibold mb-2">Aucune alerte</h3>
                                <p className="text-muted-foreground">
                                    Tout est à jour ! Aucune alerte pour le moment.
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {alerts.map((alert) => (
                                    <div
                                        key={alert.id}
                                        className={`border rounded-lg p-4 ${!alert.isRead ? 'bg-muted/50' : ''}`}
                                    >
                                        <div className="flex items-start justify-between mb-3">
                                            <div className="flex items-center gap-3 flex-1">
                                                {getTypeIcon(alert.type)}
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <h4 className="font-semibold">{alert.title}</h4>
                                                        {!alert.isRead && (
                                                            <Badge variant="secondary" className="text-xs">Nouveau</Badge>
                                                        )}
                                                    </div>
                                                    <p className="text-sm text-muted-foreground">{alert.message}</p>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-2">
                                                <Badge variant={getPriorityColor(alert.priority) as any}>
                                                    {alert.priority}
                                                </Badge>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleDismiss(alert.id)}
                                                >
                                                    <X className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                                <Badge variant="outline">{alert.type}</Badge>
                                                {alert.dueDate && (
                                                    <span>
                                                        Échéance: {format(new Date(alert.dueDate), 'dd MMM yyyy', { locale: fr })}
                                                    </span>
                                                )}
                                            </div>

                                            {!alert.isRead && (
                                                <Button
                                                    variant="link"
                                                    size="sm"
                                                    onClick={() => handleMarkAsRead(alert.id)}
                                                >
                                                    Marquer comme lu
                                                </Button>
                                            )}
                                        </div>

                                        {alert.actionUrl && (
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="mt-3"
                                                onClick={() => navigate(alert.actionUrl!)}
                                            >
                                                Voir les détails
                                            </Button>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </main>

            <Footer />
        </div>
    );
};

export default AlertsPanel;
