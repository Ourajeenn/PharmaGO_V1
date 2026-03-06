import { useEffect } from 'react';
import { PushNotifications } from '@capacitor/push-notifications';
import { supabase } from '@/integrations/supabase/client';
import { Capacitor } from '@capacitor/core';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

export const useNativePushNotifications = () => {
    const { user } = useAuth();

    useEffect(() => {
        // Les Push Notifications ne fonctionnent qu'en mode Natif (Android/iOS)
        if (!Capacitor.isNativePlatform()) {
            return;
        }

        let isMounted = true;

        const registerPush = async () => {
            try {
                // Demande la permission à l'utilisateur
                let permStatus = await PushNotifications.checkPermissions();

                if (permStatus.receive === 'prompt') {
                    permStatus = await PushNotifications.requestPermissions();
                }

                if (permStatus.receive !== 'granted') {
                    return;
                }

                // Si accordé, on s'enregistre auprès de FCM/APNS
                await PushNotifications.register();
            } catch (error) {
                console.error('Erreur lors de la configuration des notifications:', error);
            }
        };

        const setupListeners = async () => {
            // Succès de l'enregistrement, récupération du token
            await PushNotifications.addListener('registration', async (token) => {
                console.log('Push registration success, token: ' + token.value);
                if (user && isMounted) {
                    // Sauvegarde locale et dans Supabase
                    localStorage.setItem('fcm_token', token.value);

                    try {
                        await (supabase as any)
                            .from('user_profiles')
                            .update({ fcm_token: token.value })
                            .eq('user_id', user.id);
                    } catch (e) {
                        console.error('Erreur sauvegarde token FCM:', e);
                    }
                }
            });

            // Erreur lors de l'enregistrement
            await PushNotifications.addListener('registrationError', (error) => {
                console.error('Erreur d enregistrement Push:', JSON.stringify(error));
            });

            // Réception d'une notification alors que l'app est au premier plan
            await PushNotifications.addListener('pushNotificationReceived', (notification) => {
                toast(notification.title || 'Nouvelle notification', {
                    description: notification.body,
                    duration: 5000,
                });
            });

            // L'utilisateur a cliqué sur la notification
            await PushNotifications.addListener('pushNotificationActionPerformed', (notification) => {
                console.log('Action déclenchée:', JSON.stringify(notification));
                // Idéalement, redigérer en fonction du payload (ex: /suivi?order=123)
            });
        };

        registerPush();
        setupListeners();

        return () => {
            isMounted = false;
            PushNotifications.removeAllListeners();
        };
    }, [user]);

    return null;
};
