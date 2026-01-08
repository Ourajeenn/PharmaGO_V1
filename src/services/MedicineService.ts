import { supabase } from "@/lib/supabase";
import { Medicine } from "@/lib/supabase";

export const MedicineService = {
    /**
   * Fetch medicines from Supabase with optional type filtering
   * @param type Optional product type
   * @param limit Maximum number of records
   * @returns List of medicines
   */
    getMedicines: async (
        type?: 'medication' | 'phytomedicine' | 'supplement',
        page: number = 1,
        pageSize: number = 20,
        airpOnly: boolean = false
    ): Promise<{ data: Medicine[], count: number }> => {
        const offset = (page - 1) * pageSize;

        let query = supabase
            .from('medicines')
            .select('*', { count: 'exact' })
            .order('name', { ascending: true });

        if (type) {
            query = query.eq('product_type', type);
        }

        if (airpOnly) {
            query = query.eq('airp_source', true);
        }

        const { data, error, count } = await query
            .range(offset, offset + pageSize - 1);

        if (error) {
            console.error("Error fetching medicines:", error);
            throw error;
        }

        return { data: data || [], count: count || 0 };
    },

    /**
     * Search medicines by name or generic name
     * @param query Search term
     * @returns List of matching medicines
     */
    searchMedicines: async (query: string): Promise<Medicine[]> => {
        if (!query) return [];

        const { data, error } = await supabase
            .from('medicines')
            .select('*')
            .or(`name.ilike.%${query}%,generic_name.ilike.%${query}%,dci.ilike.%${query}%,amm_number.ilike.%${query}%`)
            .order('name', { ascending: true })
            .limit(50);

        if (error) {
            console.error("Error searching medicines:", error);
            throw error;
        }

        return data || [];
    },

    /**
     * Get medicines by category
     * @param category Category name
     * @returns List of medicines in category
     */
    getByCategory: async (category: string): Promise<Medicine[]> => {
        const { data, error } = await supabase
            .from('medicines')
            .select('*')
            .eq('category', category)
            .order('name', { ascending: true });

        if (error) {
            console.error("Error fetching medicines by category:", error);
            throw error;
        }

        return data || [];
    }
};
