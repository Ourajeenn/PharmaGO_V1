export type Currency = 'XOF' | 'EUR' | 'USD';

export const CURRENCY_RATES = {
    XOF: 1,
    EUR: 0.0015, // 1 XOF = 0.0015 EUR (approx 655 FCFA = 1 EUR)
    USD: 0.0016, // 1 XOF = 0.0016 USD
};

export const CURRENCY_SYMBOLS: Record<Currency, string> = {
    XOF: 'CFA',
    EUR: '€',
    USD: '$',
};

export interface GlobalInsurancePolicy {
    id: string;
    provider: 'Cigna' | 'Allianz' | 'Aetna' | 'Other';
    policyNumber: string;
    coverageRate: number; // 0 to 1
    validUntil: string;
    status: 'active' | 'expired' | 'pending';
}

class ExpatService {
    formatPrice(amountXOF: number, currency: Currency): string {
        const converted = amountXOF * CURRENCY_RATES[currency];
        const symbol = CURRENCY_SYMBOLS[currency];

        if (currency === 'XOF') {
            return `${Math.round(converted).toLocaleString()} ${symbol}`;
        }

        return `${converted.toFixed(2)} ${symbol}`;
    }

    getGlobalPolicies(): GlobalInsurancePolicy[] {
        return [
            {
                id: 'POL-CG-99',
                provider: 'Cigna',
                policyNumber: 'CIG-8822-XP',
                coverageRate: 0.90, // Tiers-payant international 90%
                validUntil: '2026-12-31',
                status: 'active'
            },
            {
                id: 'POL-AL-44',
                provider: 'Allianz',
                policyNumber: 'ALZ-0011-INT',
                coverageRate: 0.85,
                validUntil: '2025-10-15',
                status: 'active'
            }
        ];
    }

    simulateMedicalReportPDF(): Promise<string> {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve('Rapport_Medical_PharmaGO_2024.pdf');
            }, 2500);
        });
    }
}

export const expatService = new ExpatService();
