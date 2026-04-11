import { Vaccination, VaccineStatus } from '@/types/ecarnet';
import { differenceInDays, addMonths, addYears, parseISO, format } from 'date-fns';

// ============================================
// CALENDRIER VACCINAL IVOIRIEN
// ============================================

export interface VaccineSchedule {
    vaccineName: string;
    disease: string;
    isRequired: boolean;
    doses: {
        doseNumber: number;
        ageMonths: number;
        description: string;
    }[];
    boosterIntervalMonths?: number;
}

export const VACCINE_SCHEDULE: VaccineSchedule[] = [
    {
        vaccineName: 'BCG',
        disease: 'Tuberculose',
        isRequired: true,
        doses: [{ doseNumber: 1, ageMonths: 0, description: 'À la naissance' }],
    },
    {
        vaccineName: 'Polio (VPO)',
        disease: 'Poliomyélite',
        isRequired: true,
        doses: [
            { doseNumber: 1, ageMonths: 0, description: 'À la naissance' },
            { doseNumber: 2, ageMonths: 2, description: '2 mois' },
            { doseNumber: 3, ageMonths: 3, description: '3 mois' },
            { doseNumber: 4, ageMonths: 4, description: '4 mois' },
        ],
    },
    {
        vaccineName: 'Pentavalent (DTC-HepB-Hib)',
        disease: 'Diphtérie, Tétanos, Coqueluche, Hépatite B, Haemophilus',
        isRequired: true,
        doses: [
            { doseNumber: 1, ageMonths: 2, description: '2 mois' },
            { doseNumber: 2, ageMonths: 3, description: '3 mois' },
            { doseNumber: 3, ageMonths: 4, description: '4 mois' },
        ],
    },
    {
        vaccineName: 'Pneumocoque',
        disease: 'Infections à pneumocoque',
        isRequired: true,
        doses: [
            { doseNumber: 1, ageMonths: 2, description: '2 mois' },
            { doseNumber: 2, ageMonths: 3, description: '3 mois' },
            { doseNumber: 3, ageMonths: 4, description: '4 mois' },
        ],
    },
    {
        vaccineName: 'Rotavirus',
        disease: 'Gastro-entérite à rotavirus',
        isRequired: true,
        doses: [
            { doseNumber: 1, ageMonths: 2, description: '2 mois' },
            { doseNumber: 2, ageMonths: 3, description: '3 mois' },
        ],
    },
    {
        vaccineName: 'Rougeole-Rubéole',
        disease: 'Rougeole et Rubéole',
        isRequired: true,
        doses: [
            { doseNumber: 1, ageMonths: 9, description: '9 mois' },
            { doseNumber: 2, ageMonths: 15, description: '15 mois' },
        ],
    },
    {
        vaccineName: 'Fièvre Jaune',
        disease: 'Fièvre jaune',
        isRequired: true,
        doses: [{ doseNumber: 1, ageMonths: 9, description: '9 mois' }],
    },
    {
        vaccineName: 'Méningite A',
        disease: 'Méningite à méningocoque A',
        isRequired: true,
        doses: [{ doseNumber: 1, ageMonths: 9, description: '9 mois' }],
    },
    {
        vaccineName: 'Vitamine A',
        disease: 'Carence en vitamine A',
        isRequired: true,
        doses: [
            { doseNumber: 1, ageMonths: 6, description: '6 mois' },
            { doseNumber: 2, ageMonths: 12, description: '12 mois' },
            { doseNumber: 3, ageMonths: 18, description: '18 mois' },
            { doseNumber: 4, ageMonths: 24, description: '24 mois' },
        ],
        boosterIntervalMonths: 6,
    },
    {
        vaccineName: 'HPV (Papillomavirus)',
        disease: 'Cancer du col de l\'utérus',
        isRequired: false,
        doses: [
            { doseNumber: 1, ageMonths: 108, description: '9 ans (filles)' },
            { doseNumber: 2, ageMonths: 114, description: '6 mois après dose 1' },
        ],
    },
];

// ============================================
// CALCUL DU STATUT VACCINAL
// ============================================

export const calculateVaccineStatus = (
    vaccination: Vaccination,
    patientBirthDate: string
): VaccineStatus => {
    if (!vaccination.administrationDate) {
        if (vaccination.nextDueDate) {
            const dueDate = parseISO(vaccination.nextDueDate);
            const today = new Date();
            if (today > dueDate) {
                return 'En retard';
            } else {
                return 'À venir';
            }
        }
        return 'Non fait';
    }

    if (vaccination.nextDueDate) {
        const dueDate = parseISO(vaccination.nextDueDate);
        const today = new Date();
        if (today > dueDate) {
            return 'En retard';
        }
    }

    return 'À jour';
};

// ============================================
// CALCUL DE LA PROCHAINE DATE DE RAPPEL
// ============================================

export const calculateNextDueDate = (
    vaccineName: string,
    administrationDate: string,
    doseNumber: number
): string | undefined => {
    const schedule = VACCINE_SCHEDULE.find(v => v.vaccineName === vaccineName);
    if (!schedule) return undefined;

    const adminDate = parseISO(administrationDate);

    // Si c'est un vaccin avec rappels réguliers
    if (schedule.boosterIntervalMonths) {
        return format(addMonths(adminDate, schedule.boosterIntervalMonths), 'yyyy-MM-dd');
    }

    // Sinon, chercher la prochaine dose dans le calendrier
    const nextDose = schedule.doses.find(d => d.doseNumber === doseNumber + 1);
    if (nextDose) {
        // Calculer en fonction de l'âge attendu
        const currentDose = schedule.doses.find(d => d.doseNumber === doseNumber);
        if (currentDose && nextDose) {
            const monthsDiff = nextDose.ageMonths - currentDose.ageMonths;
            return format(addMonths(adminDate, monthsDiff), 'yyyy-MM-dd');
        }
    }

    return undefined;
};

// ============================================
// GÉNÉRATION DU CALENDRIER VACCINAL COMPLET
// ============================================

export const generateVaccinationSchedule = (birthDate: string): Vaccination[] => {
    const birth = parseISO(birthDate);
    const vaccinations: Vaccination[] = [];

    VACCINE_SCHEDULE.forEach(schedule => {
        schedule.doses.forEach(dose => {
            const dueDate = addMonths(birth, dose.ageMonths);

            vaccinations.push({
                id: `${schedule.vaccineName}_${dose.doseNumber}_${Date.now()}`,
                patientId: '', // Will be set when added to patient
                vaccineName: `${schedule.vaccineName} (Dose ${dose.doseNumber})`,
                disease: schedule.disease,
                isRequired: schedule.isRequired,
                nextDueDate: format(dueDate, 'yyyy-MM-dd'),
                status: 'À venir',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            });
        });
    });

    return vaccinations.sort((a, b) => {
        const dateA = a.nextDueDate ? parseISO(a.nextDueDate) : new Date();
        const dateB = b.nextDueDate ? parseISO(b.nextDueDate) : new Date();
        return dateA.getTime() - dateB.getTime();
    });
};

// ============================================
// VÉRIFICATION DES VACCINS EN RETARD
// ============================================

export const getOverdueVaccinations = (
    vaccinations: Vaccination[]
): Vaccination[] => {
    const today = new Date();
    return vaccinations.filter(v => {
        if (!v.nextDueDate) return false;
        const dueDate = parseISO(v.nextDueDate);
        return today > dueDate && v.status !== 'À jour';
    });
};

// ============================================
// VACCINS À VENIR (PROCHAINS 30 JOURS)
// ============================================

export const getUpcomingVaccinations = (
    vaccinations: Vaccination[],
    daysAhead: number = 30
): Vaccination[] => {
    const today = new Date();
    const futureDate = addMonths(today, 1);

    return vaccinations.filter(v => {
        if (!v.nextDueDate || v.status === 'À jour') return false;
        const dueDate = parseISO(v.nextDueDate);
        return dueDate >= today && dueDate <= futureDate;
    });
};

// ============================================
// POURCENTAGE DE COMPLÉTION VACCINAL
// ============================================

export const calculateVaccinationCompletionRate = (
    vaccinations: Vaccination[]
): number => {
    if (vaccinations.length === 0) return 0;

    const requiredVaccines = vaccinations.filter(v => v.isRequired);
    if (requiredVaccines.length === 0) return 100;

    const completedVaccines = requiredVaccines.filter(v => v.status === 'À jour');
    return Math.round((completedVaccines.length / requiredVaccines.length) * 100);
};
