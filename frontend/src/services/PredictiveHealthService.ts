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

            // Real logic: Calculate based on dosage/frequency
            orders.forEach(order => {
                order.order_items.forEach((item: any) => {
                    if (!processedMedicines.has(item.medicine_id)) {
                        processedMedicines.add(item.medicine_id);

                        const purchaseDate = new Date(order.created_at);

                        // Default values if frequency is unknown
                        let dailyDose = 1;

                        // Simple parser for frequency (e.g., "3x/jour" -> 3)
                        const freqString = item.frequency || "";
                        const freqMatch = freqString.match(/(\d+)\s*x\s*\/\s*(?:jour|j)/i);
                        if (freqMatch) {
                            dailyDose = parseInt(freqMatch[1], 10);
                        } else if (freqString.toLowerCase().includes("matin et soir")) {
                            dailyDose = 2;
                        } else if (freqString.toLowerCase().includes("matin midi et soir")) {
                            dailyDose = 3;
                        }

                        const totalUnits = item.quantity * 30; // Assuming 1 box = 30 units (could be improved with DB metadata)
                        const daysSupplied = totalUnits / dailyDose;

                        const daysSincePurchase = differenceInDays(new Date(), purchaseDate);
                        const remainingDays = daysSupplied - daysSincePurchase;

                        if (remainingDays < 7) {
                            predictions.push({
                                id: item.medicine_id,
                                medicineName: item.medicine.name,
                                remainingDays: Math.max(0, Math.floor(remainingDays)),
                                renewalDate: addDays(new Date(), remainingDays),
                                quantityRemaining: Math.max(0, Math.floor(remainingDays * dailyDose))
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
            const { data: allergies } = await (supabase as any)
                .from('medical_alerts')
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
