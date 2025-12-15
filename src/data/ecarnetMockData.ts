import { Patient, BirthRecord, Vaccination, GrowthRecord, MedicalVisit, Allergy } from '@/types/ecarnet';

// ============================================
// PATIENTS DE DÉMONSTRATION
// ============================================

export const mockPatients: Patient[] = [
    {
        id: 'patient_demo_1',
        firstName: 'Aya',
        lastName: 'Kouassi',
        dateOfBirth: '2022-03-15',
        gender: 'F',
        bloodGroup: 'O+',
        emergencyContacts: [
            {
                id: 'contact_1',
                name: 'Marie Kouassi',
                relationship: 'Mère',
                phone: '+225 07 12 34 56 78',
                email: 'marie.kouassi@email.com',
                isPrimary: true,
            },
        ],
        createdAt: '2022-03-15T10:00:00Z',
        updatedAt: '2024-12-03T20:00:00Z',
    },
    {
        id: 'patient_demo_2',
        firstName: 'Kofi',
        lastName: 'Yao',
        dateOfBirth: '2020-07-22',
        gender: 'M',
        bloodGroup: 'A+',
        emergencyContacts: [
            {
                id: 'contact_2',
                name: 'Jean Yao',
                relationship: 'Père',
                phone: '+225 05 98 76 54 32',
                isPrimary: true,
            },
        ],
        createdAt: '2020-07-22T14:30:00Z',
        updatedAt: '2024-12-03T20:00:00Z',
    },
];

// ============================================
// FICHES DE NAISSANCE
// ============================================

export const mockBirthRecords: BirthRecord[] = [
    {
        id: 'birth_demo_1',
        patientId: 'patient_demo_1',
        birthWeight: 3200,
        birthHeight: 49,
        headCircumference: 34,
        apgarScore1min: 9,
        apgarScore5min: 10,
        gestationalAge: 39,
        deliveryType: 'Voie basse',
        neonatalScreening: {
            done: true,
            date: '2022-03-17',
            results: 'Négatif - Aucune anomalie détectée',
        },
        doctorNotes: 'Accouchement sans complications. Bébé en bonne santé.',
        createdAt: '2022-03-15T12:00:00Z',
        updatedAt: '2022-03-15T12:00:00Z',
    },
    {
        id: 'birth_demo_2',
        patientId: 'patient_demo_2',
        birthWeight: 3450,
        birthHeight: 51,
        headCircumference: 35,
        apgarScore1min: 8,
        apgarScore5min: 9,
        gestationalAge: 40,
        deliveryType: 'Voie basse',
        neonatalScreening: {
            done: true,
            date: '2020-07-24',
            results: 'Normal',
        },
        createdAt: '2020-07-22T16:00:00Z',
        updatedAt: '2020-07-22T16:00:00Z',
    },
];

// ============================================
// VACCINATIONS
// ============================================

export const mockVaccinations: Vaccination[] = [
    {
        id: 'vaccine_demo_1',
        patientId: 'patient_demo_1',
        vaccineName: 'BCG',
        disease: 'Tuberculose',
        isRequired: true,
        administrationDate: '2022-03-15',
        batchNumber: 'BCG2022-A123',
        administeredBy: 'Dr. Koné',
        status: 'À jour',
        createdAt: '2022-03-15T12:00:00Z',
        updatedAt: '2022-03-15T12:00:00Z',
    },
    {
        id: 'vaccine_demo_2',
        patientId: 'patient_demo_1',
        vaccineName: 'Pentavalent (Dose 1)',
        disease: 'Diphtérie, Tétanos, Coqueluche, Hépatite B, Haemophilus',
        isRequired: true,
        administrationDate: '2022-05-15',
        nextDueDate: '2022-06-15',
        status: 'À jour',
        createdAt: '2022-05-15T10:00:00Z',
        updatedAt: '2022-05-15T10:00:00Z',
    },
    {
        id: 'vaccine_demo_3',
        patientId: 'patient_demo_1',
        vaccineName: 'Rougeole-Rubéole (Dose 1)',
        disease: 'Rougeole et Rubéole',
        isRequired: true,
        administrationDate: '2022-12-15',
        nextDueDate: '2023-06-15',
        status: 'À jour',
        createdAt: '2022-12-15T11:00:00Z',
        updatedAt: '2022-12-15T11:00:00Z',
    },
];

// ============================================
// CROISSANCE
// ============================================

export const mockGrowthRecords: GrowthRecord[] = [
    {
        id: 'growth_demo_1',
        patientId: 'patient_demo_1',
        measurementDate: '2022-03-15',
        ageInMonths: 0,
        weight: 3.2,
        height: 49,
        headCircumference: 34,
        createdAt: '2022-03-15T12:00:00Z',
    },
    {
        id: 'growth_demo_2',
        patientId: 'patient_demo_1',
        measurementDate: '2022-06-15',
        ageInMonths: 3,
        weight: 5.8,
        height: 60,
        headCircumference: 40,
        createdAt: '2022-06-15T10:00:00Z',
    },
    {
        id: 'growth_demo_3',
        patientId: 'patient_demo_1',
        measurementDate: '2022-09-15',
        ageInMonths: 6,
        weight: 7.2,
        height: 66,
        headCircumference: 43,
        createdAt: '2022-09-15T10:00:00Z',
    },
    {
        id: 'growth_demo_4',
        patientId: 'patient_demo_1',
        measurementDate: '2023-03-15',
        ageInMonths: 12,
        weight: 9.5,
        height: 75,
        headCircumference: 46,
        createdAt: '2023-03-15T10:00:00Z',
    },
    {
        id: 'growth_demo_5',
        patientId: 'patient_demo_1',
        measurementDate: '2024-03-15',
        ageInMonths: 24,
        weight: 12.3,
        height: 87,
        headCircumference: 48,
        createdAt: '2024-03-15T10:00:00Z',
    },
];

// ============================================
// VISITES MÉDICALES
// ============================================

export const mockMedicalVisits: MedicalVisit[] = [
    {
        id: 'visit_demo_1',
        patientId: 'patient_demo_1',
        visitDate: '2024-11-15',
        visitType: 'Contrôle',
        doctorName: 'Dr. Kouamé',
        specialty: 'Pédiatrie',
        reason: 'Contrôle de routine',
        symptoms: ['Aucun symptôme'],
        diagnosis: 'Enfant en bonne santé',
        vitalSigns: {
            temperature: 36.8,
            heartRate: 110,
        },
        recommendations: 'Continuer l\'alimentation équilibrée. Prochain contrôle dans 3 mois.',
        nextVisitDate: '2025-02-15',
        nextVisitReason: 'Contrôle de routine',
        createdAt: '2024-11-15T14:00:00Z',
        updatedAt: '2024-11-15T14:00:00Z',
    },
    {
        id: 'visit_demo_2',
        patientId: 'patient_demo_1',
        visitDate: '2024-08-20',
        visitType: 'Consultation',
        doctorName: 'Dr. Traoré',
        specialty: 'Pédiatrie',
        reason: 'Fièvre et toux',
        symptoms: ['Fièvre', 'Toux sèche', 'Fatigue'],
        diagnosis: 'Infection virale bénigne',
        vitalSigns: {
            temperature: 38.5,
            heartRate: 120,
        },
        prescriptions: [
            {
                medication: 'Paracétamol sirop',
                dosage: '5ml',
                duration: '5 jours',
                instructions: '3 fois par jour après les repas',
            },
        ],
        recommendations: 'Repos, hydratation abondante. Consulter si fièvre persiste après 3 jours.',
        createdAt: '2024-08-20T10:30:00Z',
        updatedAt: '2024-08-20T10:30:00Z',
    },
];

// ============================================
// ALLERGIES
// ============================================

export const mockAllergies: Allergy[] = [
    {
        id: 'allergy_demo_1',
        patientId: 'patient_demo_1',
        allergyType: 'Alimentaire',
        allergen: 'Arachides',
        severity: 'Modérée',
        symptoms: ['Éruption cutanée', 'Démangeaisons'],
        diagnosedDate: '2023-06-10',
        emergencyProtocol: 'Éviter tout contact. En cas de réaction, administrer antihistaminique et consulter immédiatement.',
        isActive: true,
        createdAt: '2023-06-10T15:00:00Z',
        updatedAt: '2023-06-10T15:00:00Z',
    },
];

// ============================================
// FONCTION D'INITIALISATION
// ============================================

export const initializeMockData = () => {
    const existingData = localStorage.getItem('ecarnet_data');

    if (!existingData) {
        const mockData = {
            patients: mockPatients,
            birthRecords: mockBirthRecords,
            vaccinations: mockVaccinations,
            growthRecords: mockGrowthRecords,
            developmentMilestones: [],
            allergies: mockAllergies,
            familyHistory: [],
            hospitalizations: [],
            medicalVisits: mockMedicalVisits,
            documents: [],
            alerts: [],
        };

        localStorage.setItem('ecarnet_data', JSON.stringify(mockData));
        console.log('✅ Données de démonstration E-Carnet initialisées');
    }
};
