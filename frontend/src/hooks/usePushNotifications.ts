/**
 * usePushNotifications.ts — Hook for local PWA notifications
 * 
 * This hook uses the browser's Notification API and ServiceWorkerRegistration
 * to show local notifications without needing a VAPID server.
 */

import { useState, useCallback, useEffect } from 'react';
import { pushNotifications, NotificationTemplates } from '@/lib/pushNotifications';
import { toast } from 'sonner';

export type NotificationType = keyof typeof NotificationTemplates;

export function usePushNotifications() {
    const [permission, setPermission] = useState<NotificationPermission>(
        typeof Notification !== 'undefined' ? Notification.permission : 'default'
    );

    const requestPermission = useCallback(async () => {
        if (typeof Notification === 'undefined') {
            toast.error("Les notifications ne sont pas supportées par votre navigateur.");
            return 'denied';
        }

        try {
            const result = await pushNotifications.requestPermission();
            setPermission(result);
            if (result === 'granted') {
                toast.success("Notifications activées !");
            } else if (result === 'denied') {
                toast.warning("Notifications bloquées. Vous pouvez les réactiver dans les paramètres du navigateur.");
            }
            return result;
        } catch (error) {
            console.error('[Push] Permission request failed:', error);
            return 'default';
        }
    }, []);

    const notify = useCallback(async (type: NotificationType, ...args: any[]) => {
        if (permission !== 'granted') return;

        try {
            const templateFunc = (NotificationTemplates as any)[type];
            if (!templateFunc) return;

            const options = templateFunc(...args);

            // Try to show via Service Worker first (background capable)
            const sw = await navigator.serviceWorker.ready;
            if (sw && 'showNotification' in sw) {
                await sw.showNotification(options.title, options as NotificationOptions);
            } else {
                // Fallback to standard Notification
                new Notification(options.title, options);
            }
        } catch (error) {
            console.error('[Push] Notification failed:', error);
        }
    }, [permission]);

    // Initial setup
    useEffect(() => {
        if ('serviceWorker' in navigator && 'PushManager' in window) {
            pushNotifications.initialize().catch(console.error);
        }
    }, []);

    return {
        permission,
        requestPermission,
        notify
    };
}

export default usePushNotifications;
