import { supabase } from '@/integrations/supabase/client';

export interface Driver {
    id: string;
    name: string;
    phone: string;
    status: 'available' | 'busy' | 'offline';
    rating?: number;
}

export const DriverService = {
    async getAvailableDrivers(): Promise<Driver[]> {
        try {
            const { data, error } = await supabase
                .from('user_profiles')
                .select('user_id, name, phone, stats')
                .eq('role', 'driver');

            if (error) throw error;

            return data.map((d: any) => ({
                id: d.user_id,
                name: d.name,
                phone: d.phone,
                status: 'available', // Simplification for now
                rating: d.stats?.rating || 4.5
            }));
        } catch (err) {
            console.error('DriverService: Error fetching drivers', err);
            return [];
        }
    },

    async assignDriverToOrder(orderId: string, driverId: string) {
        try {
            // Update tracking
            const { error: trackingError } = await supabase
                .from('delivery_tracking')
                .update({
                    driver_id: driverId,
                    status: 'assigned',
                    updated_at: new Date().toISOString()
                })
                .eq('order_id', orderId);

            if (trackingError) throw trackingError;

            // Update order status to ready (waiting for pickup)
            const { error: orderError } = await supabase
                .from('orders')
                .update({ status: 'ready' })
                .eq('id', orderId);

            if (orderError) throw orderError;

            return true;
        } catch (err) {
            console.error('DriverService: Error assigning driver', err);
            throw err;
        }
    }
};
