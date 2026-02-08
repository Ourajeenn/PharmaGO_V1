// Push Notifications Library for PharmaGo Express
import { logger } from '@/utils/logger';
interface PushSubscriptionOptions {
    userVisibleOnly: boolean;
    applicationServerKey: string;
}

class PushNotificationManager {
    private swRegistration: ServiceWorkerRegistration | null = null;
    private vapidPublicKey: string;

    constructor(vapidPublicKey: string) {
        this.vapidPublicKey = vapidPublicKey;
    }

    // Initialize push notifications
    async initialize(): Promise<void> {
        if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
            throw new Error('Les notifications push ne sont pas supportées');
        }

        try {
            this.swRegistration = await navigator.serviceWorker.ready;
            logger.log('[Push] Service Worker ready');
        } catch (error) {
            logger.error('[Push] Service Worker initialization failed:', error);
            throw error;
        }
    }

    // Request permission for notifications
    async requestPermission(): Promise<NotificationPermission> {
        if (!('Notification' in window)) {
            throw new Error('Les notifications ne sont pas supportées');
        }

        const permission = await Notification.requestPermission();
        logger.log('[Push] Notification permission:', permission);
        return permission;
    }

    // Check current permission status
    getPermissionStatus(): NotificationPermission {
        if (!('Notification' in window)) {
            return 'denied';
        }
        return Notification.permission;
    }

    // Subscribe to push notifications
    async subscribe(): Promise<PushSubscription> {
        if (!this.swRegistration) {
            throw new Error('Service Worker non initialisé');
        }

        // Check if already subscribed
        let subscription = await this.swRegistration.pushManager.getSubscription();

        if (subscription) {
            logger.log('[Push] Already subscribed');
            return subscription;
        }

        // Subscribe to push notifications
        const options: PushSubscriptionOptions = {
            userVisibleOnly: true,
            applicationServerKey: this.urlBase64ToUint8Array(this.vapidPublicKey),
        };

        subscription = await this.swRegistration.pushManager.subscribe(options);
        logger.log('[Push] New subscription created');

        return subscription;
    }

    // Unsubscribe from push notifications
    async unsubscribe(): Promise<boolean> {
        if (!this.swRegistration) {
            throw new Error('Service Worker non initialisé');
        }

        const subscription = await this.swRegistration.pushManager.getSubscription();

        if (!subscription) {
            logger.log('[Push] No subscription found');
            return false;
        }

        const result = await subscription.unsubscribe();
        logger.log('[Push] Unsubscribed:', result);
        return result;
    }

    // Get current subscription
    async getSubscription(): Promise<PushSubscription | null> {
        if (!this.swRegistration) {
            return null;
        }

        return await this.swRegistration.pushManager.getSubscription();
    }

    // Send subscription to server
    async sendSubscriptionToServer(subscription: PushSubscription): Promise<void> {
        const response = await fetch('/api/push/subscribe', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(subscription),
        });

        if (!response.ok) {
            throw new Error('Failed to send subscription to server');
        }

        logger.log('[Push] Subscription sent to server');
    }

    // Helper to convert VAPID key
    private urlBase64ToUint8Array(base64String: string): Uint8Array {
        const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
        const base64 = (base64String + padding)
            .replace(/-/g, '+')
            .replace(/_/g, '/');

        const rawData = window.atob(base64);
        const outputArray = new Uint8Array(rawData.length);

        for (let i = 0; i < rawData.length; ++i) {
            outputArray[i] = rawData.charCodeAt(i);
        }

        return outputArray;
    }

    // Show a local notification (for testing)
    async showNotification(title: string, options?: NotificationOptions): Promise<void> {
        if (!this.swRegistration) {
            throw new Error('Service Worker non initialisé');
        }

        const defaultOptions: NotificationOptions = {
            icon: '/icon-192x192.png',
            badge: '/icon-72x72.png',
            vibrate: [200, 100, 200],
            ...options,
        };

        await this.swRegistration.showNotification(title, defaultOptions);
    }
}

// Notification templates for common scenarios
export const NotificationTemplates = {
    orderConfirmed: (orderNumber: string) => ({
        title: '✅ Commande confirmée',
        body: `Votre commande #${orderNumber} a été confirmée et est en préparation`,
        icon: '/icon-192x192.png',
        tag: `order-${orderNumber}`,
        data: { url: `/suivi?order=${orderNumber}`, type: 'order_confirmed' },
        actions: [
            { action: 'view', title: 'Voir la commande', icon: '/icon-96x96.png' },
            { action: 'close', title: 'Fermer', icon: '/icon-96x96.png' },
        ],
    }),

    driverAssigned: (driverName: string, orderNumber: string) => ({
        title: '🛵 Livreur assigné',
        body: `${driverName} va livrer votre commande #${orderNumber}`,
        icon: '/icon-192x192.png',
        tag: `order-${orderNumber}`,
        data: { url: `/suivi?order=${orderNumber}`, type: 'driver_assigned' },
        actions: [
            { action: 'track', title: 'Suivre', icon: '/icon-96x96.png' },
            { action: 'close', title: 'Fermer', icon: '/icon-96x96.png' },
        ],
    }),

    nearbyDelivery: (minutes: number, orderNumber: string) => ({
        title: '📍 Livreur proche',
        body: `Votre livreur arrive dans ${minutes} minutes`,
        icon: '/icon-192x192.png',
        tag: `order-${orderNumber}`,
        requireInteraction: true,
        data: { url: `/suivi?order=${orderNumber}`, type: 'nearby_delivery' },
        actions: [
            { action: 'open', title: 'Voir', icon: '/icon-96x96.png' },
            { action: 'close', title: 'OK', icon: '/icon-96x96.png' },
        ],
    }),

    delivered: (orderNumber: string) => ({
        title: '🎉 Commande livrée',
        body: `Votre commande #${orderNumber} a été livrée avec succès`,
        icon: '/icon-192x192.png',
        tag: `order-${orderNumber}`,
        data: { url: `/suivi?order=${orderNumber}`, type: 'delivered' },
        actions: [
            { action: 'rate', title: 'Noter', icon: '/icon-96x96.png' },
            { action: 'close', title: 'Fermer', icon: '/icon-96x96.png' },
        ],
    }),

    pharmacyOnDuty: (pharmacyName: string, address: string) => ({
        title: '🏥 Pharmacie de garde proche',
        body: `${pharmacyName} est de garde\n${address}`,
        icon: '/icon-192x192.png',
        tag: 'pharmacy-on-duty',
        data: { url: '/pharmacies', type: 'pharmacy_on_duty' },
        actions: [
            { action: 'directions', title: 'Itinéraire', icon: '/icon-96x96.png' },
            { action: 'close', title: 'Fermer', icon: '/icon-96x96.png' },
        ],
    }),

    medicineReminder: (medicineName: string) => ({
        title: '💊 Rappel de renouvellement',
        body: `Il est temps de renouveler votre ${medicineName}`,
        icon: '/icon-192x192.png',
        tag: 'medicine-reminder',
        data: { url: '/medicaments', type: 'medicine_reminder' },
        actions: [
            { action: 'order', title: 'Commander', icon: '/icon-96x96.png' },
            { action: 'later', title: 'Plus tard', icon: '/icon-96x96.png' },
        ],
    }),
};

// Export singleton instance
export const pushNotifications = new PushNotificationManager(
    // VAPID public key (should be stored in environment variable in production)
    'YOUR_VAPID_PUBLIC_KEY_HERE'
);

export default pushNotifications;
