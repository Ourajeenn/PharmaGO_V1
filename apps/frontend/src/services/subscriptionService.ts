export interface SubscriptionPlan {
    id: string;
    tier: 'Essentiel' | 'Confort' | 'Premium';
    price: number;
    benefits: string[];
}

export interface UserSubscription {
    id: string;
    userId: string;
    planId: string;
    status: 'active' | 'cancelled' | 'pending';
    nextRefillDate: string;
    savings: number;
    medications: string[];
}

export const PLANS: SubscriptionPlan[] = [
    {
        id: 'plan_essentiel',
        tier: 'Essentiel',
        price: 4900,
        benefits: [
            "Livraison mensuelle gratuite",
            "Rappels SMS automatiques",
            "Garantie stock prioritaire"
        ]
    },
    {
        id: 'plan_confort',
        tier: 'Confort',
        price: 9900,
        benefits: [
            "Toutes les options Essentiel",
            "Livraisons illimitées 24/7",
            "Consultation virtuelle (1x/mois)",
            "Découpage des piluliers"
        ]
    },
    {
        id: 'plan_premium',
        tier: 'Premium',
        price: 19900, // VIP / Expat / Chronic specific
        benefits: [
            "Toutes les options Confort",
            "Livraison internationale ou régionale",
            "Infirmier à domicile",
            "Bilan sanguin trimestriel inclus"
        ]
    }
];

class SubscriptionService {
    private mockSubscription: UserSubscription | null = null;

    async getPlans(): Promise<SubscriptionPlan[]> {
        return PLANS;
    }

    async subscribe(userId: string, planId: string, medications: string[]): Promise<UserSubscription> {
        this.mockSubscription = {
            id: `sub_${Date.now()}`,
            userId,
            planId,
            status: 'active',
            nextRefillDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            savings: 0,
            medications
        };
        return this.mockSubscription;
    }

    async getSubscription(userId: string): Promise<UserSubscription | null> {
        return this.mockSubscription; // Returns active subscription or null
    }

    async simulateRefill(): Promise<void> {
        if (this.mockSubscription) {
            this.mockSubscription.savings += 3000; // Simulated savings from free delivery
            // Advance next refill date
            const current = new Date(this.mockSubscription.nextRefillDate);
            current.setDate(current.getDate() + 30);
            this.mockSubscription.nextRefillDate = current.toISOString().split('T')[0];
        }
    }
}

export const subscriptionService = new SubscriptionService();
