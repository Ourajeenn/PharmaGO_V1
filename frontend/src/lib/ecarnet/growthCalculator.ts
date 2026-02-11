import { GrowthRecord } from '@/types/ecarnet';
import { differenceInMonths, parseISO } from 'date-fns';

// ============================================
// CALCUL DE L'ÂGE EN MOIS
// ============================================

export const calculateAgeInMonths = (birthDate: string, measurementDate: string): number => {
    const birth = parseISO(birthDate);
    const measurement = parseISO(measurementDate);
    return differenceInMonths(measurement, birth);
};

// ============================================
// CALCUL DU BMI
// ============================================

export const calculateBMI = (weightKg: number, heightCm: number): number => {
    const heightM = heightCm / 100;
    return Number((weightKg / (heightM * heightM)).toFixed(2));
};

// ============================================
// CALCUL DES PERCENTILES (SIMPLIFIÉ - OMS)
// ============================================

// Données simplifiées des percentiles OMS pour garçons (0-60 mois)
// En production, utiliser les tables complètes de l'OMS
const WHO_WEIGHT_PERCENTILES_BOYS = {
    0: { p3: 2.5, p15: 2.9, p50: 3.3, p85: 3.9, p97: 4.4 },
    3: { p3: 5.0, p15: 5.7, p50: 6.4, p85: 7.2, p97: 8.0 },
    6: { p3: 6.4, p15: 7.1, p50: 7.9, p85: 8.8, p97: 9.8 },
    12: { p3: 7.7, p15: 8.6, p50: 9.6, p85: 10.8, p97: 12.0 },
    24: { p3: 9.7, p15: 10.8, p50: 12.2, p85: 13.6, p97: 15.3 },
    36: { p3: 11.3, p15: 12.7, p50: 14.3, p85: 16.2, p97: 18.3 },
    48: { p3: 12.8, p15: 14.4, p50: 16.3, p85: 18.6, p97: 21.2 },
    60: { p3: 14.1, p15: 16.0, p50: 18.3, p85: 21.0, p97: 24.2 },
};

const WHO_HEIGHT_PERCENTILES_BOYS = {
    0: { p3: 46.1, p15: 48.0, p50: 49.9, p85: 51.8, p97: 53.7 },
    3: { p3: 56.7, p15: 59.4, p50: 61.4, p85: 63.5, p97: 65.5 },
    6: { p3: 63.3, p15: 65.7, p50: 67.6, p85: 69.8, p97: 71.9 },
    12: { p3: 71.0, p15: 73.4, p50: 75.7, p85: 78.1, p97: 80.5 },
    24: { p3: 81.7, p15: 84.8, p50: 87.8, p85: 90.9, p97: 94.0 },
    36: { p3: 88.7, p15: 92.4, p50: 96.1, p85: 99.8, p97: 103.5 },
    48: { p3: 94.9, p15: 99.1, p50: 103.3, p85: 107.5, p97: 111.7 },
    60: { p3: 100.7, p15: 105.3, p50: 109.9, p85: 114.5, p97: 119.1 },
};

export const calculateWeightPercentile = (
    ageMonths: number,
    weightKg: number,
    gender: 'M' | 'F' = 'M'
): number => {
    // Trouver l'âge le plus proche dans les données
    const ages = Object.keys(WHO_WEIGHT_PERCENTILES_BOYS).map(Number);
    const closestAge = ages.reduce((prev, curr) =>
        Math.abs(curr - ageMonths) < Math.abs(prev - ageMonths) ? curr : prev
    );

    const percentiles = WHO_WEIGHT_PERCENTILES_BOYS[closestAge as keyof typeof WHO_WEIGHT_PERCENTILES_BOYS];

    if (weightKg <= percentiles.p3) return 3;
    if (weightKg <= percentiles.p15) return 15;
    if (weightKg <= percentiles.p50) return 50;
    if (weightKg <= percentiles.p85) return 85;
    if (weightKg <= percentiles.p97) return 97;
    return 99;
};

export const calculateHeightPercentile = (
    ageMonths: number,
    heightCm: number,
    gender: 'M' | 'F' = 'M'
): number => {
    const ages = Object.keys(WHO_HEIGHT_PERCENTILES_BOYS).map(Number);
    const closestAge = ages.reduce((prev, curr) =>
        Math.abs(curr - ageMonths) < Math.abs(prev - ageMonths) ? curr : prev
    );

    const percentiles = WHO_HEIGHT_PERCENTILES_BOYS[closestAge as keyof typeof WHO_HEIGHT_PERCENTILES_BOYS];

    if (heightCm <= percentiles.p3) return 3;
    if (heightCm <= percentiles.p15) return 15;
    if (heightCm <= percentiles.p50) return 50;
    if (heightCm <= percentiles.p85) return 85;
    if (heightCm <= percentiles.p97) return 97;
    return 99;
};

// ============================================
// DÉTECTION D'ANOMALIES DE CROISSANCE
// ============================================

export const detectGrowthAnomalies = (records: GrowthRecord[]): {
    hasWeightAnomaly: boolean;
    hasHeightAnomaly: boolean;
    message: string;
} => {
    if (records.length < 2) {
        return { hasWeightAnomaly: false, hasHeightAnomaly: false, message: '' };
    }

    const sortedRecords = [...records].sort((a, b) =>
        new Date(a.measurementDate).getTime() - new Date(b.measurementDate).getTime()
    );

    const latest = sortedRecords[sortedRecords.length - 1];
    const previous = sortedRecords[sortedRecords.length - 2];

    // Vérifier une perte de poids significative
    const weightLoss = previous.weight - latest.weight;
    const hasWeightAnomaly = weightLoss > 0.5; // Perte > 500g

    // Vérifier une stagnation de la taille
    const heightGain = latest.height - previous.height;
    const monthsDiff = latest.ageInMonths - previous.ageInMonths;
    const expectedHeightGain = monthsDiff * 0.5; // ~0.5cm par mois en moyenne
    const hasHeightAnomaly = heightGain < expectedHeightGain * 0.5;

    let message = '';
    if (hasWeightAnomaly) {
        message += 'Perte de poids détectée. ';
    }
    if (hasHeightAnomaly) {
        message += 'Croissance en taille ralentie. ';
    }
    if (message) {
        message += 'Consultation médicale recommandée.';
    }

    return { hasWeightAnomaly, hasHeightAnomaly, message };
};

// ============================================
// PRÉPARATION DES DONNÉES POUR GRAPHIQUES
// ============================================

export interface ChartDataPoint {
    age: number; // mois
    value: number;
    label: string;
}

export const prepareWeightChartData = (records: GrowthRecord[]): ChartDataPoint[] => {
    return records
        .sort((a, b) => a.ageInMonths - b.ageInMonths)
        .map(record => ({
            age: record.ageInMonths,
            value: record.weight,
            label: `${record.ageInMonths} mois`,
        }));
};

export const prepareHeightChartData = (records: GrowthRecord[]): ChartDataPoint[] => {
    return records
        .sort((a, b) => a.ageInMonths - b.ageInMonths)
        .map(record => ({
            age: record.ageInMonths,
            value: record.height,
            label: `${record.ageInMonths} mois`,
        }));
};

export const prepareHeadCircumferenceChartData = (records: GrowthRecord[]): ChartDataPoint[] => {
    return records
        .filter(record => record.headCircumference !== undefined)
        .sort((a, b) => a.ageInMonths - b.ageInMonths)
        .map(record => ({
            age: record.ageInMonths,
            value: record.headCircumference!,
            label: `${record.ageInMonths} mois`,
        }));
};

// ============================================
// COURBES DE RÉFÉRENCE OMS
// ============================================

export const getWHOWeightReferenceCurve = (maxAgeMonths: number = 60): {
    p3: ChartDataPoint[];
    p50: ChartDataPoint[];
    p97: ChartDataPoint[];
} => {
    const ages = Object.keys(WHO_WEIGHT_PERCENTILES_BOYS)
        .map(Number)
        .filter(age => age <= maxAgeMonths);

    return {
        p3: ages.map(age => ({
            age,
            value: WHO_WEIGHT_PERCENTILES_BOYS[age as keyof typeof WHO_WEIGHT_PERCENTILES_BOYS].p3,
            label: `${age} mois`,
        })),
        p50: ages.map(age => ({
            age,
            value: WHO_WEIGHT_PERCENTILES_BOYS[age as keyof typeof WHO_WEIGHT_PERCENTILES_BOYS].p50,
            label: `${age} mois`,
        })),
        p97: ages.map(age => ({
            age,
            value: WHO_WEIGHT_PERCENTILES_BOYS[age as keyof typeof WHO_WEIGHT_PERCENTILES_BOYS].p97,
            label: `${age} mois`,
        })),
    };
};

export const getWHOHeightReferenceCurve = (maxAgeMonths: number = 60): {
    p3: ChartDataPoint[];
    p50: ChartDataPoint[];
    p97: ChartDataPoint[];
} => {
    const ages = Object.keys(WHO_HEIGHT_PERCENTILES_BOYS)
        .map(Number)
        .filter(age => age <= maxAgeMonths);

    return {
        p3: ages.map(age => ({
            age,
            value: WHO_HEIGHT_PERCENTILES_BOYS[age as keyof typeof WHO_HEIGHT_PERCENTILES_BOYS].p3,
            label: `${age} mois`,
        })),
        p50: ages.map(age => ({
            age,
            value: WHO_HEIGHT_PERCENTILES_BOYS[age as keyof typeof WHO_HEIGHT_PERCENTILES_BOYS].p50,
            label: `${age} mois`,
        })),
        p97: ages.map(age => ({
            age,
            value: WHO_HEIGHT_PERCENTILES_BOYS[age as keyof typeof WHO_HEIGHT_PERCENTILES_BOYS].p97,
            label: `${age} mois`,
        })),
    };
};
