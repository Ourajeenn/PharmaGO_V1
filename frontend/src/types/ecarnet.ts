// ============================================
// E-CARNET DE SANTÉ - TYPE DEFINITIONS
// ============================================

export type BloodGroup = 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-' | 'Inconnu';
export type Gender = 'M' | 'F' | 'Autre';
export type VaccineStatus = 'À jour' | 'En retard' | 'À venir' | 'Non fait';
export type AllergySeverity = 'Légère' | 'Modérée' | 'Sévère' | 'Critique';
export type AllergyType = 'Alimentaire' | 'Médicamenteuse' | 'Environnementale' | 'Autre';
export type DocumentType = 'Ordonnance' | 'Radio' | 'Bilan' | 'Analyse' | 'Certificat' | 'Autre';

// ============================================
// PATIENT
// ============================================

export interface EmergencyContact {
    id: string;
    name: string;
    relationship: string;
    phone: string;
    email?: string;
    isPrimary: boolean;
}

export interface Patient {
    id: string;
    // Identité
    firstName: string;
    lastName: string;
    dateOfBirth: string;
    gender: Gender;
    photo?: string; // Base64 ou URL

    // Informations médicales
    bloodGroup: BloodGroup;
    height?: number; // cm
    weight?: number; // kg

    // Contacts
    phone?: string;
    email?: string;
    address?: string;
    city?: string;
    relationship?: string; // Relation avec le titulaire du compte (Moi, Enfant, etc.)
    chronicDiseases?: string[];
    allergies?: string[]; // Simplified list for profile
    treatmentsSummary?: string[]; // Simplified list of current meds
    insuranceType?: 'standard' | 'cmu' | 'insured' | 'premium';
    vaccinations?: Vaccination[];
    treatments?: { id: string; name: string; dosage: string; compliance: number }[];
    emergencyContacts: EmergencyContact[];

    // Métadonnées
    createdAt: string;
    updatedAt: string;
    createdBy?: string; // ID du médecin

    // Résumé
    notes?: string;
}

// ============================================
// NAISSANCE
// ============================================

export interface BirthRecord {
    id: string;
    patientId: string;

    // Mesures
    birthWeight: number; // grammes
    birthHeight: number; // cm
    headCircumference?: number; // cm

    // Scores
    apgarScore1min?: number; // 0-10
    apgarScore5min?: number; // 0-10
    apgarScore10min?: number; // 0-10

    // Informations
    gestationalAge?: number; // semaines
    deliveryType?: 'Voie basse' | 'Césarienne' | 'Assistée';
    complications?: string;

    // Dépistage
    neonatalScreening?: {
        done: boolean;
        date?: string;
        results?: string;
    };

    // Notes
    doctorNotes?: string;

    createdAt: string;
    updatedAt: string;
}

// ============================================
// VACCINATIONS
// ============================================

export interface Vaccination {
    id: string;
    patientId: string;

    // Informations vaccin
    vaccineName: string;
    disease: string; // Maladie ciblée
    isRequired: boolean; // Obligatoire ou recommandé

    // Administration
    administrationDate?: string;
    nextDueDate?: string;
    batchNumber?: string;
    administeredBy?: string; // Nom du médecin

    // Statut
    status: VaccineStatus;

    // Rappels
    boosterDates?: string[]; // Dates des rappels

    // Notes
    notes?: string;
    sideEffects?: string;

    createdAt: string;
    updatedAt: string;
}

// ============================================
// CROISSANCE
// ============================================

export interface GrowthRecord {
    id: string;
    patientId: string;

    // Date de mesure
    measurementDate: string;
    ageInMonths: number; // Calculé automatiquement

    // Mesures
    weight: number; // kg
    height: number; // cm
    headCircumference?: number; // cm
    bmi?: number; // Calculé automatiquement

    // Percentiles (calculés)
    weightPercentile?: number;
    heightPercentile?: number;
    headPercentile?: number;

    // Notes
    notes?: string;
    measuredBy?: string;

    createdAt: string;
}

export interface DevelopmentMilestone {
    id: string;
    patientId: string;

    category: 'Moteur' | 'Cognitif' | 'Langage' | 'Social' | 'Autre';
    milestone: string;
    expectedAgeMonths: number;
    achievedDate?: string;
    achieved: boolean;
    notes?: string;

    createdAt: string;
}

// ============================================
// ALLERGIES
// ============================================

export interface Allergy {
    id: string;
    patientId: string;

    // Type et détails
    allergyType: AllergyType;
    allergen: string; // Nom de l'allergène

    // Sévérité
    severity: AllergySeverity;

    // Réactions
    symptoms: string[];
    reactions?: string;

    // Dates
    diagnosedDate?: string;
    firstReactionDate?: string;

    // Protocole d'urgence
    emergencyProtocol?: string;
    medication?: string; // Médicament d'urgence (ex: EpiPen)

    // Statut
    isActive: boolean;

    notes?: string;
    createdAt: string;
    updatedAt: string;
}

// ============================================
// ANTÉCÉDENTS FAMILIAUX
// ============================================

export interface FamilyHistory {
    id: string;
    patientId: string;

    // Relation
    relationship: 'Père' | 'Mère' | 'Frère' | 'Sœur' | 'Grand-parent' | 'Oncle/Tante' | 'Autre';

    // Condition
    condition: string;
    diagnosisAge?: number;

    // Détails
    severity?: 'Légère' | 'Modérée' | 'Sévère';
    notes?: string;

    // Facteurs de risque
    isHereditaryRisk: boolean;

    createdAt: string;
}

// ============================================
// HOSPITALISATIONS
// ============================================

export interface Hospitalization {
    id: string;
    patientId: string;

    // Dates
    admissionDate: string;
    dischargeDate?: string;

    // Diagnostic
    diagnosis: string;
    icd10Code?: string; // Code CIM-10

    // Établissement
    hospital: string;
    department?: string;
    attendingPhysician?: string;

    // Traitement
    treatment?: string;
    surgery?: string;
    medications?: string[];

    // Examens
    exams?: string[];

    // Suivi
    followUpRequired: boolean;
    followUpDate?: string;
    followUpNotes?: string;

    // Complications
    complications?: string;

    notes?: string;
    createdAt: string;
    updatedAt: string;
}

// ============================================
// VISITES MÉDICALES
// ============================================

export interface MedicalVisit {
    id: string;
    patientId: string;

    // Date et lieu
    visitDate: string;
    visitType: 'Consultation' | 'Contrôle' | 'Urgence' | 'Vaccination' | 'Autre';

    // Médecin
    doctorName: string;
    specialty?: string;

    // Motif
    reason: string;

    // Examen
    symptoms?: string[];
    vitalSigns?: {
        temperature?: number;
        bloodPressure?: string;
        heartRate?: number;
        respiratoryRate?: number;
        oxygenSaturation?: number;
    };

    // Diagnostic
    diagnosis?: string;

    // Examens complémentaires
    examsOrdered?: string[];

    // Traitement
    prescriptions?: {
        medication: string;
        dosage: string;
        duration: string;
        instructions?: string;
    }[];

    // Recommandations
    recommendations?: string;

    // Suivi
    nextVisitDate?: string;
    nextVisitReason?: string;

    // Notes
    notes?: string;

    createdAt: string;
    updatedAt: string;
}

// ============================================
// DOCUMENTS MÉDICAUX
// ============================================

export interface MedicalDocument {
    id: string;
    patientId: string;

    // Informations document
    title: string;
    documentType: DocumentType;
    description?: string;

    // Fichier
    fileName: string;
    fileType: string; // MIME type
    fileSize: number; // bytes
    fileData: string; // Base64 pour démo (URL S3 en production)

    // Métadonnées
    uploadDate: string;
    documentDate?: string; // Date du document médical
    uploadedBy?: string;

    // Catégorisation
    tags?: string[];
    relatedVisitId?: string;

    // Sécurité
    isConfidential: boolean;

    createdAt: string;
}

// ============================================
// ALERTES ET NOTIFICATIONS
// ============================================

export interface Alert {
    id: string;
    patientId: string;

    type: 'Vaccin' | 'Visite' | 'Médicament' | 'Examen' | 'Autre';
    priority: 'Basse' | 'Moyenne' | 'Haute' | 'Urgente';

    title: string;
    message: string;

    dueDate?: string;

    isRead: boolean;
    isDismissed: boolean;

    actionUrl?: string;

    createdAt: string;
}

// ============================================
// STATISTIQUES ET RÉSUMÉS
// ============================================

export interface PatientSummary {
    patient: Patient;

    // Compteurs
    totalVisits: number;
    totalVaccinations: number;
    totalDocuments: number;
    totalAllergies: number;

    // Dernières activités
    lastVisit?: MedicalVisit;
    nextVisit?: MedicalVisit;

    // Alertes
    activeAlerts: Alert[];
    overdueVaccinations: Vaccination[];

    // Statut vaccinal global
    vaccinationStatus: 'À jour' | 'En retard' | 'Incomplet';

    // Dernière mise à jour
    lastUpdated: string;
}

// ============================================
// EXPORT
// ============================================

export interface ExportOptions {
    includePersonalInfo: boolean;
    includeBirthRecord: boolean;
    includeVaccinations: boolean;
    includeGrowth: boolean;
    includeAllergies: boolean;
    includeFamilyHistory: boolean;
    includeHospitalizations: boolean;
    includeVisits: boolean;
    includeDocuments: boolean;

    dateRange?: {
        start: string;
        end: string;
    };
}
