import { useAuth } from './useAuth';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

export const useLoyalty = () => {
    const { profile, fetchProfile } = useAuth();

    const points = profile?.loyalty_points || 0;

    /**
     * Calculate points that will be earned for a given amount
     * Rate: 1% of the amount
     */
    const calculateEarnedPoints = (amount: number): number => {
        return Math.floor(amount * 0.01);
    };

    /**
     * Update user points in Supabase
     */
    const updatePoints = async (newPoints: number) => {
        if (!profile?.id) return;

        try {
            const { error } = await supabase
                .from('user_profiles')
                .update({ loyalty_points: newPoints })
                .eq('id', profile.id);

            if (error) throw error;

            // Refresh profile to reflect changes
            await fetchProfile(profile.id);
            return true;
        } catch (error) {
            console.error('Error updating loyalty points:', error);
            toast.error('Erreur lors de la mise à jour des points de fidélité');
            return false;
        }
    };

    /**
     * Earn points based on an order amount
     */
    const earnPoints = async (orderAmount: number) => {
        const earned = calculateEarnedPoints(orderAmount);
        const total = points + earned;
        return await updatePoints(total);
    };

    /**
     * Use points to get a discount
     */
    const redeemPoints = async (pointsToUse: number) => {
        if (pointsToUse > points) {
            toast.error('Points insuffisants');
            return false;
        }
        const total = points - pointsToUse;
        return await updatePoints(total);
    };

    return {
        points,
        calculateEarnedPoints,
        earnPoints,
        redeemPoints,
        updatePoints
    };
};
