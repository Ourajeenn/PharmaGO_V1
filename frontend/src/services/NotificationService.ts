import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

export type NotificationType = 'info' | 'success' | 'warning' | 'error' | 'medication';

export interface Notification {
    id: string;
    userId: string;
    title: string;
    message: string;
    type: NotificationType;
    isRead: boolean;
    actionUrl?: string;
    createdAt: string;
}

export class NotificationService {
    /**
     * Send a real Web Push notification via the Service Worker
     */
    private static async sendPushNotification(title: string, body: string, actionUrl?: string) {
        try {
            if (typeof Notification === 'undefined' || Notification.permission !== 'granted') return;

            const sw = await navigator.serviceWorker?.ready;
            if (sw?.showNotification) {
                await sw.showNotification(title, {
                    body,
                    icon: '/pwa-192x192.png',
                    badge: '/pwa-192x192.png',
                    vibrate: [200, 100, 200],
                    tag: `pharmago-${Date.now()}`,
                    data: { url: actionUrl || '/' },
                } as NotificationOptions);
            } else {
                new Notification(title, { body, icon: '/pwa-192x192.png' });
            }
        } catch (e) {
            console.warn('[NotificationService] Push failed, toast used as fallback:', e);
        }
    }

    /**
     * Create a new notification — persists to Supabase + triggers Web Push
     */
    static async createNotification(userId: string, title: string, message: string, type: NotificationType = 'info', actionUrl?: string) {
        try {
            const { error } = await supabase
                .from('notifications')
                .insert({
                    user_id: userId,
                    title,
                    message,
                    type,
                    action_url: actionUrl,
                    is_read: false
                });

            if (error) throw error;

            // Trigger real push notification
            await this.sendPushNotification(title, message, actionUrl);
        } catch (error: any) {
            console.error('[NotificationService] Error creating notification:', error.message);
        }
    }

    /**
     * Fetch user notifications
     */
    static async getUserNotifications(userId: string): Promise<Notification[]> {
        try {
            const { data, error } = await supabase
                .from('notifications')
                .select('*')
                .eq('user_id', userId)
                .order('created_at', { ascending: false });

            if (error) throw error;

            return (data || []).map(n => ({
                id: n.id,
                userId: n.user_id,
                title: n.title,
                message: n.message,
                type: n.type as NotificationType,
                isRead: n.is_read,
                actionUrl: n.action_url,
                createdAt: n.created_at
            }));
        } catch (error) {
            console.error('[NotificationService] Error fetching notifications:', error);
            return [];
        }
    }

    /**
     * Mark a notification as read
     */
    static async markAsRead(id: string) {
        try {
            const { error } = await supabase
                .from('notifications')
                .update({ is_read: true })
                .eq('id', id);

            if (error) throw error;
        } catch (error) {
            console.error('[NotificationService] Error marking as read:', error);
        }
    }

    /**
     * Mark all notifications as read for a user
     */
    static async markAllAsRead(userId: string) {
        try {
            const { error } = await supabase
                .from('notifications')
                .update({ is_read: true })
                .eq('user_id', userId)
                .eq('is_read', false);

            if (error) throw error;
        } catch (error) {
            console.error('[NotificationService] Error marking all as read:', error);
        }
    }

    /**
     * Schedule a medication reminder — with real push + toast
     */
    static async scheduleMedicationReminder(userId: string, medicationName: string, time: string) {
        const title = "💊 Rappel de Médicament";
        const message = `C'est l'heure de prendre votre ${medicationName} (${time}).`;

        await this.createNotification(userId, title, message, 'medication', '/ecarnet');

        toast(title, {
            description: message,
            duration: 5000,
            action: {
                label: "Confirmé",
                onClick: () => console.log(`Prise de ${medicationName} confirmée`)
            }
        });
    }
}
