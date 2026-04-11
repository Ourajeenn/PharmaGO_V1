import { useState, useEffect } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { useAuth } from '@/hooks/useAuth'

export interface Notification {
    id: string
    user_id: string
    title: string
    message: string
    type: 'success' | 'info' | 'warning' | 'error'
    read: boolean
    created_at: string
    metadata?: any
}

export function useNotifications() {
    const { user } = useAuth()
    const [notifications, setNotifications] = useState<Notification[]>([])
    const [loading, setLoading] = useState(true)
    const [unreadCount, setUnreadCount] = useState(0)

    // Fetch notifications
    const fetchNotifications = async () => {
        if (!user?.id) return

        try {
            const { data, error } = await (supabase as any)
                .from('notifications')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false })
                .limit(50)

            if (error) throw error

            setNotifications(data || [])
            setUnreadCount(data?.filter((n: Notification) => !n.read).length || 0)
        } catch (error) {
            console.error('Error fetching notifications:', error)
        } finally {
            setLoading(false)
        }
    }

    // Mark as read
    const markAsRead = async (id: string) => {
        if (!user?.id) return

        try {
            const { error } = await (supabase as any)
                .from('notifications')
                .update({ read: true })
                .eq('id', id)
                .eq('user_id', user.id)

            if (error) throw error

            // Optimistic update
            setNotifications(prev =>
                prev.map(n => n.id === id ? { ...n, read: true } : n)
            )
            setUnreadCount(prev => Math.max(0, prev - 1))
        } catch (error) {
            console.error('Error marking notification as read:', error)
        }
    }

    // Mark all as read
    const markAllAsRead = async () => {
        if (!user?.id) return

        try {
            const { error } = await (supabase as any)
                .from('notifications')
                .update({ read: true })
                .eq('user_id', user.id)
                .eq('read', false)

            if (error) throw error

            // Optimistic update
            setNotifications(prev =>
                prev.map(n => ({ ...n, read: true }))
            )
            setUnreadCount(0)
        } catch (error) {
            console.error('Error marking all as read:', error)
        }
    }

    // Delete notification
    const deleteNotification = async (id: string) => {
        if (!user?.id) return

        try {
            const { error } = await (supabase as any)
                .from('notifications')
                .delete()
                .eq('id', id)
                .eq('user_id', user.id)

            if (error) throw error

            // Optimistic update
            const notification = notifications.find(n => n.id === id)
            setNotifications(prev => prev.filter(n => n.id !== id))
            if (notification && !notification.read) {
                setUnreadCount(prev => Math.max(0, prev - 1))
            }
        } catch (error) {
            console.error('Error deleting notification:', error)
        }
    }

    // Setup realtime subscription
    useEffect(() => {
        if (!user?.id) return

        fetchNotifications()

        // Subscribe to realtime changes
        const channel = supabase
            .channel('notifications-channel')
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'notifications',
                    filter: `user_id=eq.${user.id}`
                },
                (payload) => {
                    const newNotification = payload.new as Notification
                    setNotifications(prev => [newNotification, ...prev])
                    if (!newNotification.read) {
                        setUnreadCount(prev => prev + 1)
                    }
                }
            )
            .on(
                'postgres_changes',
                {
                    event: 'UPDATE',
                    schema: 'public',
                    table: 'notifications',
                    filter: `user_id=eq.${user.id}`
                },
                (payload) => {
                    const updated = payload.new as Notification
                    setNotifications(prev =>
                        prev.map(n => n.id === updated.id ? updated : n)
                    )
                    // Recalculate unread count
                    setNotifications(prev => {
                        setUnreadCount(prev.filter(n => !n.read).length)
                        return prev
                    })
                }
            )
            .on(
                'postgres_changes',
                {
                    event: 'DELETE',
                    schema: 'public',
                    table: 'notifications',
                    filter: `user_id=eq.${user.id}`
                },
                (payload) => {
                    const deleted = payload.old as Notification
                    setNotifications(prev =>
                        prev.filter(n => n.id !== deleted.id)
                    )
                    if (!deleted.read) {
                        setUnreadCount(prev => Math.max(0, prev - 1))
                    }
                }
            )
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }, [user?.id])

    return {
        notifications,
        unreadCount,
        loading,
        markAsRead,
        markAllAsRead,
        deleteNotification,
        refresh: fetchNotifications
    }
}

