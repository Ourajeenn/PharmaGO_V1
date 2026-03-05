import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Bell, BellOff, Check } from 'lucide-react';
import pushNotifications, { NotificationTemplates } from '@/lib/pushNotifications';
import { useToast } from '@/hooks/use-toast';

export const NotificationPermission = () => {
    const [permission, setPermission] = useState<NotificationPermission>('default');
    const [isSubscribed, setIsSubscribed] = useState(false);
    const [loading, setLoading] = useState(false);
    const { toast } = useToast();

    useEffect(() => {
        // Check current permission status
        setPermission(pushNotifications.getPermissionStatus());

        // Check subscription status
        checkSubscriptionStatus();
    }, []);

    const checkSubscriptionStatus = async () => {
        try {
            await pushNotifications.initialize();
            const subscription = await pushNotifications.getSubscription();
            setIsSubscribed(!!subscription);
        } catch (error) {
            console.error('Failed to check subscription:', error);
        }
    };

    const handleEnableNotifications = async () => {
        setLoading(true);
        try {
            // Request permission
            const perm = await pushNotifications.requestPermission();
            setPermission(perm);

            if (perm === 'granted') {
                // Initialize and subscribe
                await pushNotifications.initialize();
                const subscription = await pushNotifications.subscribe();

                // Send subscription to server
                await pushNotifications.sendSubscriptionToServer(subscription);

                setIsSubscribed(true);

                toast({
                    title: '✅ Notifications activées',
                    description: 'Vous recevrez des notifications pour vos commandes',
                });

                // Show a test notification
                await pushNotifications.showNotification(
                    '🎉 Notifications activées',
                    {
                        body: 'Vous recevrez maintenant des mises à jour en temps réel',
                        tag: 'welcome',
                    }
                );
            } else {
                toast({
                    title: '❌ Permission refusée',
                    description: 'Vous pouvez activer les notifications dans les paramètres de votre navigateur',
                    variant: 'destructive',
                });
            }
        } catch (error) {
            console.error('Failed to enable notifications:', error);
            toast({
                title: 'Erreur',
                description: 'Impossible d\'activer les notifications',
                variant: 'destructive',
            });
        } finally {
            setLoading(false);
        }
    };

    const handleDisableNotifications = async () => {
        setLoading(true);
        try {
            await pushNotifications.initialize();
            const result = await pushNotifications.unsubscribe();

            if (result) {
                setIsSubscribed(false);
                toast({
                    title: 'Notifications désactivées',
                    description: 'Vous ne recevrez plus de notifications',
                });
            }
        } catch (error) {
            console.error('Failed to disable notifications:', error);
            toast({
                title: 'Erreur',
                description: 'Impossible de désactiver les notifications',
                variant: 'destructive',
            });
        } finally {
            setLoading(false);
        }
    };

    const handleTestNotification = async () => {
        try {
            await pushNotifications.showNotification(
                NotificationTemplates.orderConfirmed('TEST-123').title,
                NotificationTemplates.orderConfirmed('TEST-123')
            );
        } catch (error) {
            toast({
                title: 'Erreur',
                description: 'Impossible d\'envoyer la notification de test',
                variant: 'destructive',
            });
        }
    };

    if (permission === 'denied') {
        return (
            <Card className="border-destructive/50">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-destructive">
                        <BellOff className="h-5 w-5" />
                        Notifications bloquées
                    </CardTitle>
                    <CardDescription>
                        Les notifications sont bloquées dans votre navigateur.
                        Veuillez les activer dans les paramètres du navigateur.
                    </CardDescription>
                </CardHeader>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Bell className="h-5 w-5" />
                    Notifications push
                </CardTitle>
                <CardDescription>
                    Restez informé de l'état de vos commandes en temps réel
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                {!isSubscribed ? (
                    <>
                        <div className="space-y-2">
                            <p className="text-sm text-muted-foreground">
                                Activez les notifications pour recevoir :
                            </p>
                            <ul className="text-sm space-y-1 text-muted-foreground">
                                <li className="flex items-center gap-2">
                                    <Check className="h-4 w-4 text-primary" />
                                    Confirmation de commande
                                </li>
                                <li className="flex items-center gap-2">
                                    <Check className="h-4 w-4 text-primary" />
                                    Attribution du livreur
                                </li>
                                <li className="flex items-center gap-2">
                                    <Check className="h-4 w-4 text-primary" />
                                    Proximité de livraison
                                </li>
                                <li className="flex items-center gap-2">
                                    <Check className="h-4 w-4 text-primary" />
                                    Confirmation de livraison
                                </li>
                            </ul>
                        </div>
                        <Button
                            onClick={handleEnableNotifications}
                            className="w-full"
                            disabled={loading}
                        >
                            {loading ? 'Activation...' : 'Activer les notifications'}
                        </Button>
                    </>
                ) : (
                    <div className="space-y-3">
                        <div className="flex items-center gap-2 text-sm text-green-600">
                            <Check className="h-4 w-4" />
                            <span>Notifications activées</span>
                        </div>
                        <div className="flex gap-2">
                            <Button
                                onClick={handleTestNotification}
                                variant="outline"
                                className="flex-1"
                            >
                                Tester
                            </Button>
                            <Button
                                onClick={handleDisableNotifications}
                                variant="outline"
                                className="flex-1"
                                disabled={loading}
                            >
                                {loading ? 'Désactivation...' : 'Désactiver'}
                            </Button>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
};
