import { supabase } from '@/integrations/supabase/client';

export interface InsurancePartner {
    id: string;
    name: string;
    logo?: string;
    defaultCoverage: number; // Percentage (e.g. 70)
    description?: string;
}

export const InsuranceService = {
    /**
     * Fetch the list of partner insurances from the database
     */
    async getPartners(): Promise<InsurancePartner[]> {
        try {
            // For now, we return a hardcoded list linked to the Ivorian context
            // In the future, this should fetch from a 'insurance_partners' table
            return [
                { id: 'mugefci', name: 'MUGEF-CI', defaultCoverage: 70 },
                { id: 'nsia', name: 'NSIA Vie Assurances', defaultCoverage: 80 },
                { id: 'axa', name: 'AXA Côte d\'Ivoire', defaultCoverage: 75 },
                { id: 'saham', name: 'Saham Assurance', defaultCoverage: 70 },
                { id: 'aig', name: 'AIG Assurance', defaultCoverage: 60 },
                { id: 'allianz', name: 'Allianz CI', defaultCoverage: 85 }
            ];
        } catch (error) {
            console.error('Error fetching insurance partners:', error);
            return [];
        }
    },

    /**
     * Verify if a patient is registered with an insurance (mock for now)
     */
    async verifyCoverage(insuranceId: string, cardNumber: string): Promise<{ active: boolean; rate: number }> {
        console.log(`Verifying coverage for ${insuranceId} with card ${cardNumber}`);
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 800));

        // Logic: If card number starts with '00', it's active.
        if (cardNumber.startsWith('00')) {
            const partners = await this.getPartners();
            const partner = partners.find(p => p.id === insuranceId);
            return { active: true, rate: partner?.defaultCoverage || 70 };
        }

        return { active: false, rate: 0 };
    }
};
