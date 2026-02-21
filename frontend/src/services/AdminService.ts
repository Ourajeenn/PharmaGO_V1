import { supabase } from "@/integrations/supabase/client";

export interface AdminStats {
    totalRevenue: number;
    totalOrders: number;
    activePharmacies: number;
    pendingReviews: number;
    criticalOrders: number;
}

export interface ChartData {
    date: string;
    revenue: number;
}

export interface Pharmacy {
    id: string;
    name: string;
    address: string;
    license_number: string;
    created_at: string;
    verified: boolean;
}

export interface Review {
    id: string;
    rating: number;
    comment: string | null;
    target_id: string;
    target_type: 'pharmacy' | 'driver';
    created_at: string;
    status: 'pending' | 'approved' | 'rejected';
}

export interface UserProfile {
    id: string;
    email: string | null;
    name: string | null;
    phone: string | null;
    role: string;
    created_at: string;
    verified: boolean;
}

export const AdminService = {
    async getDashboardStats(): Promise<AdminStats> {
        try {
            // Fetch total revenue and order count
            const { data: orders, error: ordersError } = await supabase
                .from('orders')
                .select('total, status');

            if (ordersError) throw ordersError;

            const totalRevenue = orders?.reduce((acc, order) => acc + (order.total || 0), 0) || 0;
            const totalOrders = orders?.length || 0;
            const criticalOrders = orders?.filter(o => o.status === 'delayed' || o.status === 'reported').length || 0;

            // Fetch active pharmacies
            const { count: pharmacyCount, error: pharmacyError } = await supabase
                .from('pharmacies')
                .select('*', { count: 'exact', head: true })
                .eq('verified', true);

            if (pharmacyError) throw pharmacyError;

            // Fetch pending reviews
            const { count: reviewCount, error: reviewError } = await (supabase as any)
                .from('reviews')
                .select('*', { count: 'exact', head: true })
                .eq('status', 'pending');

            // If reviews table doesn't exist yet or has error, default to 0
            const pendingReviews = reviewCount || 0;

            return {
                totalRevenue,
                totalOrders,
                activePharmacies: pharmacyCount || 0,
                pendingReviews,
                criticalOrders
            };
        } catch (error) {
            console.error("Error fetching admin stats:", error);
            return {
                totalRevenue: 0,
                totalOrders: 0,
                activePharmacies: 0,
                pendingReviews: 0,
                criticalOrders: 0
            };
        }
    },

    async getRevenueChartData(): Promise<ChartData[]> {
        try {
            const { data, error } = await supabase
                .from('orders')
                .select('total, created_at')
                .order('created_at', { ascending: true });

            if (error) throw error;

            // Group by date
            const grouped = data.reduce((acc: any, order) => {
                const date = new Date(order.created_at).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' });
                acc[date] = (acc[date] || 0) + (order.total || 0);
                return acc;
            }, {});

            return Object.entries(grouped).map(([date, revenue]) => ({
                date,
                revenue: revenue as number
            }));
        } catch (error) {
            console.error("Error fetching chart data:", error);
            return [];
        }
    },

    async getPendingPharmacies(): Promise<Pharmacy[]> {
        try {
            const { data, error } = await supabase
                .from('pharmacies')
                .select('*')
                .eq('verified', false)
                .order('created_at', { ascending: false });

            if (error) throw error;
            return data || [];
        } catch (error) {
            console.error("Error fetching pending pharmacies:", error);
            return [];
        }
    },

    async approvePharmacy(pharmacyId: string): Promise<boolean> {
        try {
            const { error } = await supabase
                .from('pharmacies')
                .update({ verified: true })
                .eq('id', pharmacyId);

            if (error) throw error;
            return true;
        } catch (error) {
            console.error("Error approving pharmacy:", error);
            return false;
        }
    },

    async getPendingReviews(): Promise<Review[]> {
        try {
            const { data, error } = await (supabase as any)
                .from('reviews')
                .select('*')
                .eq('status', 'pending')
                .order('created_at', { ascending: false });

            if (error) throw error;
            return data || [];
        } catch (error) {
            console.error("Error fetching pending reviews:", error);
            return [];
        }
    },

    async moderateReview(reviewId: string, status: 'approved' | 'rejected'): Promise<boolean> {
        try {
            const { error } = await (supabase as any)
                .from('reviews')
                .update({ status })
                .eq('id', reviewId);

            if (error) throw error;
            return true;
        } catch (error) {
            console.error("Error moderating review:", error);
            return false;
        }
    },

    async getUsers(): Promise<UserProfile[]> {
        try {
            const { data, error } = await supabase
                .from('user_profiles')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            return (data || []) as UserProfile[];
        } catch (error) {
            console.error("Error fetching users:", error);
            return [];
        }
    },

    async toggleUserBlockStatus(userId: string, isBlocked: boolean): Promise<boolean> {
        try {
            // In this version, we use 'verified' as a proxy for 'active'
            // In a real app we would have a 'blocked' column
            const { error } = await supabase
                .from('user_profiles')
                .update({ verified: !isBlocked })
                .eq('id', userId);

            if (error) throw error;
            return true;
        } catch (error) {
            console.error("Error toggling user block status:", error);
            return false;
        }
    }
};
