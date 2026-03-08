import { supabase } from '@/integrations/supabase/client';

export interface OrderItem {
    medicine_id: string;
    quantity: number;
    unit_price: number;
    pharmacy_id: string;
    pharmacy_inventory_id?: string;
}

export interface CreateOrderParams {
    patient_id: string;
    total: number;
    payment_method: string;
    payment_status: string;
    delivery_address: string;
    notes?: string;
    items: OrderItem[];
    insurance_id?: string;
    insurance_card_number?: string;
    coverage_rate?: number;
    delivery_lat?: number;
    delivery_lng?: number;
}

export const OrderService = {
    async createOrder(params: CreateOrderParams) {
        try {
            // 1. Create the main order
            const { data: order, error: orderError } = await supabase
                .from('orders')
                .insert({
                    patient_id: params.patient_id,
                    total: params.total,
                    payment_method: params.payment_method,
                    payment_status: params.payment_status,
                    delivery_address: params.delivery_address,
                    notes: params.notes,
                    status: 'pending',
                    pharmacy_id: params.items[0]?.pharmacy_id,
                    insurance_id: params.insurance_id,
                    insurance_card_number: params.insurance_card_number,
                    coverage_rate: params.coverage_rate,
                    delivery_lat: params.delivery_lat,
                    delivery_lng: params.delivery_lng
                })
                .select()
                .single();

            if (orderError) throw orderError;

            // 2. Create order items
            const itemsToInsert = params.items.map(item => ({
                order_id: order.id,
                medicine_id: item.medicine_id,
                quantity: item.quantity,
                unit_price: item.unit_price,
                total_price: item.unit_price * item.quantity,
                pharmacy_inventory_id: item.pharmacy_inventory_id
            }));

            const { error: itemsError } = await supabase
                .from('order_items')
                .insert(itemsToInsert);

            if (itemsError) throw itemsError;

            // 3. Update Inventory (Decrement)
            for (const item of params.items) {
                // We need to find the inventory record first to get current quantity
                const { data: invData } = await supabase
                    .from('pharmacy_inventory')
                    .select('id, quantity')
                    .eq('pharmacy_id', item.pharmacy_id)
                    .eq('medicine_id', item.medicine_id)
                    .single();

                if (invData) {
                    const newQuantity = Math.max(0, invData.quantity - item.quantity);
                    await supabase
                        .from('pharmacy_inventory')
                        .update({ quantity: newQuantity })
                        .eq('id', invData.id);
                }
            }

            // 4. Create initial delivery tracking record
            await supabase
                .from('delivery_tracking')
                .insert({
                    order_id: order.id,
                    status: 'pending',
                    driver_id: 'SYSTEM_PENDING' // Placeholder until assigned
                });

            // 5. Notify available drivers (internal simulation)
            try {
                const { data: drivers } = await supabase
                    .from('user_profiles')
                    .select('id')
                    .eq('role', 'driver');

                if (drivers && drivers.length > 0) {
                    const driverNotifications = drivers.map(driver => ({
                        user_id: driver.id,
                        title: '🏁 Nouvelle livraison disponible',
                        message: `Une nouvelle commande #${(order as any).id.substring(0, 8).toUpperCase()} est prête à être récupérée.`,
                        type: 'info',
                        metadata: { order_id: (order as any).id }
                    }));
                    await (supabase as any).from('notifications').insert(driverNotifications);
                }
            } catch (driverErr) {
                console.warn('Driver service notification error (non-blocking):', driverErr);
            }

            return order;
        } catch (err) {
            console.error('OrderService: Error creating order', err);
            throw err;
        }
    }
};
