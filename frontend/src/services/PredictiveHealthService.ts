import { supabase } from '@/integrations/supabase/client';
import { addDays, differenceInDays } from 'date-fns';

export interface RenewalAlert {
    id: string;
    medicineName: string;
    remainingDays: number;
    renewalDate: Date;
    quantityRemaining: number;
}

export const PredictiveHealthService = {
    /**
     * Calculates when a patient will run out of a specific medicine
     * Based on the last purchase date and quantity.
     */
    async getRenewalPredictions(patientId: string): Promise<RenewalAlert[]> {
        try {
            // 1. Fetch last orders for this patient
            const { data: orders, error: ordersError } = await supabase
                .from('orders')
                .select(`
          id,
          created_at,
          order_items (
            medicine_id,
            quantity,
            medicine:medicines(name)
          )
        `)
                .eq('patient_id', patientId)
                .order('created_at', { ascending: false })
                .limit(10);

            if (ordersError) throw ordersError;

            const predictions: RenewalAlert[] = [];
            const processedMedicines = new Set<string>();

            // Mock logic: Assume 1 tablet/day for chronic meds
            // In a real app, this would use the 'prescription' dosage data
            orders.forEach(order => {
                order.order_items.forEach((item: any) => {
                    if (!processedMedicines.has(item.medicine_id)) {
                        processedMedicines.add(item.medicine_id);

                        const purchaseDate = new Date(order.created_at);
                        const totalSupplied = item.quantity * 30; // Assuming 1 box = 30 units
                        const daysSincePurchase = differenceInDays(new Date(), purchaseDate);
                        const remainingDays = totalSupplied - daysSincePurchase;

                        if (remainingDays < 7) { // Alert if less than a week remaining
                            predictions.push({
                                id: item.medicine_id,
                                medicineName: item.medicine.name,
                                remainingDays: Math.max(0, remainingDays),
                                renewalDate: addDays(new Date(), remainingDays),
                                quantityRemaining: Math.max(0, remainingDays)
                            });
                        }
                    }
                });
            });

            return predictions;
        } catch (error) {
            console.error('PredictiveHealthService: Error calculating renewals', error);
            return [];
        }
    },

    /**
     * Check for potential allergies based on order items
     */
    async checkAllergyRisk(patientId: string, medicineIds: string[]): Promise<string[]> {
        try {
            // 1. Get patient allergies
            const { data: allergies } = await (supabase.from('medical_alerts') as any)
                .select('title, message')
                .eq('patient_id', patientId)
                .eq('type', 'Allergie');

            if (!allergies || allergies.length === 0) return [];

            // 2. Mock cross-check
            // In production, this would use a pharmacology API (like Vidal or RxNorm)
            const risks: string[] = [];
            const allergyKeywords = (allergies as any[] || []).map(a => a.title?.toLowerCase() || "");

            // Fetch medicine details
            const { data: meds } = await (supabase.from('medicines') as any)
                .select('name')
                .in('id', medicineIds);

            (meds as any[])?.forEach(m => {
                if (allergyKeywords.some(keyword => m.name.toLowerCase().includes(keyword))) {
                    risks.push(`Attention : Le médicament ${m.name} pourrait provoquer une réaction allergique.`);
                }
            });

            return risks;
        } catch (error) {
            console.error('PredictiveHealthService: Allergy check failure', error);
            return [];
        }
    }
};
