import { useState, useCallback } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { startOfDay, subDays } from 'date-fns'

export interface AnalyticsMetrics {
    totalOrders: number
    revenue: number
    newPatients: number
    prescriptions: number
    deliveries: number
    criticalStock: number
    topMedications: { name: string, value: number, percentage: number, trend: 'up' | 'down' | 'stable' }[]
}

export const useAnalytics = () => {
    const [metrics, setMetrics] = useState<AnalyticsMetrics | null>(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const fetchAnalytics = useCallback(async (timeRange: string = '7d') => {
        setLoading(true)
        setError(null)
        try {
            const days = timeRange === '24h' ? 1
                : timeRange === '7d' ? 7
                    : timeRange === '30d' ? 30
                        : timeRange === '90d' ? 90
                            : 365

            const startDate = subDays(new Date(), days).toISOString()

            // 1. Total Orders & Revenue
            const { data: orders, error: ordersError } = await supabase
                .from('orders')
                .select('id, total, created_at')
                .gte('created_at', startDate)

            if (ordersError) throw ordersError

            const totalOrders = orders?.length || 0
            const revenue = orders?.reduce((acc, order) => acc + (order.total || 0), 0) || 0

            // 2. New Patients
            const { count: newPatients, error: patientsError } = await supabase
                .from('user_profiles')
                .select('*', { count: 'exact', head: true })
                .eq('role', 'patient')
                .gte('created_at', startDate)

            if (patientsError) throw patientsError

            // 3. Prescriptions
            const { count: prescriptions, error: prescriptionsError } = await supabase
                .from('prescriptions')
                .select('*', { count: 'exact', head: true })
                .gte('created_at', startDate)

            if (prescriptionsError) throw prescriptionsError

            // 4. Deliveries
            const { count: deliveries, error: deliveriesError } = await supabase
                .from('delivery_tracking')
                .select('*', { count: 'exact', head: true })
                .gte('created_at', startDate)

            if (deliveriesError) throw deliveriesError

            // 5. Critical Stock
            const { count: criticalStock, error: stockError } = await supabase
                .from('pharmacy_inventory')
                .select('*', { count: 'exact', head: true })
                .lt('quantity', 10)

            if (stockError) throw stockError

            setMetrics({
                totalOrders,
                revenue,
                newPatients: newPatients || 0,
                prescriptions: prescriptions || 0,
                deliveries: deliveries || 0,
                criticalStock: criticalStock || 0,
                topMedications: [] // Placeholder for now, hard to aggregate client-side efficiently without helper function
            })

        } catch (err: any) {
            console.error('Error fetching analytics:', err)
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }, [])

    return { metrics, loading, error, fetchAnalytics }
}
