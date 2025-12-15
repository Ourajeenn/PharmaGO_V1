import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
    Patient,
    BirthRecord,
    Vaccination,
    GrowthRecord,
    DevelopmentMilestone,
    Allergy,
    FamilyHistory,
    Hospitalization,
    MedicalVisit,
    MedicalDocument,
    Alert,
    PatientSummary,
} from '@/types/ecarnet';

// ============================================
// CONTEXT TYPE
// ============================================

interface ECarnetContextType {
    // Current Patient
    currentPatient: Patient | null;
    setCurrentPatient: (patient: Patient | null) => void;

    // Patients
    patients: Patient[];
    addPatient: (patient: Omit<Patient, 'id' | 'createdAt' | 'updatedAt'>) => Patient;
    updatePatient: (id: string, updates: Partial<Patient>) => void;
    deletePatient: (id: string) => void;
    getPatient: (id: string) => Patient | undefined;

    // Birth Records
    birthRecords: BirthRecord[];
    addBirthRecord: (record: Omit<BirthRecord, 'id' | 'createdAt' | 'updatedAt'>) => void;
    updateBirthRecord: (id: string, updates: Partial<BirthRecord>) => void;
    getBirthRecord: (patientId: string) => BirthRecord | undefined;

    // Vaccinations
    vaccinations: Vaccination[];
    addVaccination: (vaccination: Omit<Vaccination, 'id' | 'createdAt' | 'updatedAt'>) => void;
    updateVaccination: (id: string, updates: Partial<Vaccination>) => void;
    deleteVaccination: (id: string) => void;
    getPatientVaccinations: (patientId: string) => Vaccination[];

    // Growth Records
    growthRecords: GrowthRecord[];
    addGrowthRecord: (record: Omit<GrowthRecord, 'id' | 'createdAt'>) => void;
    updateGrowthRecord: (id: string, updates: Partial<GrowthRecord>) => void;
    deleteGrowthRecord: (id: string) => void;
    getPatientGrowthRecords: (patientId: string) => GrowthRecord[];

    // Development Milestones
    developmentMilestones: DevelopmentMilestone[];
    addDevelopmentMilestone: (milestone: Omit<DevelopmentMilestone, 'id' | 'createdAt'>) => void;
    updateDevelopmentMilestone: (id: string, updates: Partial<DevelopmentMilestone>) => void;
    getPatientMilestones: (patientId: string) => DevelopmentMilestone[];

    // Allergies
    allergies: Allergy[];
    addAllergy: (allergy: Omit<Allergy, 'id' | 'createdAt' | 'updatedAt'>) => void;
    updateAllergy: (id: string, updates: Partial<Allergy>) => void;
    deleteAllergy: (id: string) => void;
    getPatientAllergies: (patientId: string) => Allergy[];

    // Family History
    familyHistory: FamilyHistory[];
    addFamilyHistory: (history: Omit<FamilyHistory, 'id' | 'createdAt'>) => void;
    updateFamilyHistory: (id: string, updates: Partial<FamilyHistory>) => void;
    deleteFamilyHistory: (id: string) => void;
    getPatientFamilyHistory: (patientId: string) => FamilyHistory[];

    // Hospitalizations
    hospitalizations: Hospitalization[];
    addHospitalization: (hospitalization: Omit<Hospitalization, 'id' | 'createdAt' | 'updatedAt'>) => void;
    updateHospitalization: (id: string, updates: Partial<Hospitalization>) => void;
    deleteHospitalization: (id: string) => void;
    getPatientHospitalizations: (patientId: string) => Hospitalization[];

    // Medical Visits
    medicalVisits: MedicalVisit[];
    addMedicalVisit: (visit: Omit<MedicalVisit, 'id' | 'createdAt' | 'updatedAt'>) => void;
    updateMedicalVisit: (id: string, updates: Partial<MedicalVisit>) => void;
    deleteMedicalVisit: (id: string) => void;
    getPatientVisits: (patientId: string) => MedicalVisit[];

    // Documents
    documents: MedicalDocument[];
    addDocument: (document: Omit<MedicalDocument, 'id' | 'createdAt'>) => void;
    deleteDocument: (id: string) => void;
    getPatientDocuments: (patientId: string) => MedicalDocument[];

    // Alerts
    alerts: Alert[];
    addAlert: (alert: Omit<Alert, 'id' | 'createdAt'>) => void;
    dismissAlert: (id: string) => void;
    markAlertAsRead: (id: string) => void;
    getPatientAlerts: (patientId: string) => Alert[];
    generateVaccinationAlerts: (patientId: string) => void;

    // Summary
    getPatientSummary: (patientId: string) => PatientSummary | null;

    // Utility
    clearAllData: () => void;
}

// ============================================
// CONTEXT CREATION
// ============================================

const ECarnetContext = createContext<ECarnetContextType | undefined>(undefined);

// ============================================
// PROVIDER
// ============================================

export const ECarnetProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    // State
    const [currentPatient, setCurrentPatient] = useState<Patient | null>(null);
    const [patients, setPatients] = useState<Patient[]>([]);
    const [birthRecords, setBirthRecords] = useState<BirthRecord[]>([]);
    const [vaccinations, setVaccinations] = useState<Vaccination[]>([]);
    const [growthRecords, setGrowthRecords] = useState<GrowthRecord[]>([]);
    const [developmentMilestones, setDevelopmentMilestones] = useState<DevelopmentMilestone[]>([]);
    const [allergies, setAllergies] = useState<Allergy[]>([]);
    const [familyHistory, setFamilyHistory] = useState<FamilyHistory[]>([]);
    const [hospitalizations, setHospitalizations] = useState<Hospitalization[]>([]);
    const [medicalVisits, setMedicalVisits] = useState<MedicalVisit[]>([]);
    const [documents, setDocuments] = useState<MedicalDocument[]>([]);
    const [alerts, setAlerts] = useState<Alert[]>([]);

    // Load from localStorage on mount
    useEffect(() => {
        const loadData = () => {
            try {
                const storedData = localStorage.getItem('ecarnet_data');
                if (storedData) {
                    const data = JSON.parse(storedData);
                    setPatients(data.patients || []);
                    setBirthRecords(data.birthRecords || []);
                    setVaccinations(data.vaccinations || []);
                    setGrowthRecords(data.growthRecords || []);
                    setDevelopmentMilestones(data.developmentMilestones || []);
                    setAllergies(data.allergies || []);
                    setFamilyHistory(data.familyHistory || []);
                    setHospitalizations(data.hospitalizations || []);
                    setMedicalVisits(data.medicalVisits || []);
                    setDocuments(data.documents || []);
                    setAlerts(data.alerts || []);
                }
            } catch (error) {
                console.error('Error loading E-Carnet data:', error);
            }
        };
        loadData();
    }, []);

    // Save to localStorage whenever data changes
    useEffect(() => {
        const saveData = () => {
            try {
                const data = {
                    patients,
                    birthRecords,
                    vaccinations,
                    growthRecords,
                    developmentMilestones,
                    allergies,
                    familyHistory,
                    hospitalizations,
                    medicalVisits,
                    documents,
                    alerts,
                };
                localStorage.setItem('ecarnet_data', JSON.stringify(data));
            } catch (error) {
                console.error('Error saving E-Carnet data:', error);
            }
        };
        saveData();
    }, [patients, birthRecords, vaccinations, growthRecords, developmentMilestones, allergies, familyHistory, hospitalizations, medicalVisits, documents, alerts]);

    // ============================================
    // PATIENT OPERATIONS
    // ============================================

    const addPatient = (patientData: Omit<Patient, 'id' | 'createdAt' | 'updatedAt'>): Patient => {
        const newPatient: Patient = {
            ...patientData,
            id: `patient_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };
        setPatients(prev => [...prev, newPatient]);
        return newPatient;
    };

    const updatePatient = (id: string, updates: Partial<Patient>) => {
        setPatients(prev => prev.map(p =>
            p.id === id ? { ...p, ...updates, updatedAt: new Date().toISOString() } : p
        ));
    };

    const deletePatient = (id: string) => {
        setPatients(prev => prev.filter(p => p.id !== id));
        // Also delete all related data
        setBirthRecords(prev => prev.filter(r => r.patientId !== id));
        setVaccinations(prev => prev.filter(v => v.patientId !== id));
        setGrowthRecords(prev => prev.filter(g => g.patientId !== id));
        setDevelopmentMilestones(prev => prev.filter(m => m.patientId !== id));
        setAllergies(prev => prev.filter(a => a.patientId !== id));
        setFamilyHistory(prev => prev.filter(f => f.patientId !== id));
        setHospitalizations(prev => prev.filter(h => h.patientId !== id));
        setMedicalVisits(prev => prev.filter(v => v.patientId !== id));
        setDocuments(prev => prev.filter(d => d.patientId !== id));
        setAlerts(prev => prev.filter(a => a.patientId !== id));
    };

    const getPatient = (id: string) => patients.find(p => p.id === id);

    // ============================================
    // BIRTH RECORD OPERATIONS
    // ============================================

    const addBirthRecord = (recordData: Omit<BirthRecord, 'id' | 'createdAt' | 'updatedAt'>) => {
        const newRecord: BirthRecord = {
            ...recordData,
            id: `birth_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };
        setBirthRecords(prev => [...prev, newRecord]);
    };

    const updateBirthRecord = (id: string, updates: Partial<BirthRecord>) => {
        setBirthRecords(prev => prev.map(r =>
            r.id === id ? { ...r, ...updates, updatedAt: new Date().toISOString() } : r
        ));
    };

    const getBirthRecord = (patientId: string) => birthRecords.find(r => r.patientId === patientId);

    // ============================================
    // VACCINATION OPERATIONS
    // ============================================

    const addVaccination = (vaccinationData: Omit<Vaccination, 'id' | 'createdAt' | 'updatedAt'>) => {
        const newVaccination: Vaccination = {
            ...vaccinationData,
            id: `vaccine_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };
        setVaccinations(prev => [...prev, newVaccination]);
    };

    const updateVaccination = (id: string, updates: Partial<Vaccination>) => {
        setVaccinations(prev => prev.map(v =>
            v.id === id ? { ...v, ...updates, updatedAt: new Date().toISOString() } : v
        ));
    };

    const deleteVaccination = (id: string) => {
        setVaccinations(prev => prev.filter(v => v.id !== id));
    };

    const getPatientVaccinations = (patientId: string) =>
        vaccinations.filter(v => v.patientId === patientId);

    // ============================================
    // GROWTH RECORD OPERATIONS
    // ============================================

    const addGrowthRecord = (recordData: Omit<GrowthRecord, 'id' | 'createdAt'>) => {
        const newRecord: GrowthRecord = {
            ...recordData,
            id: `growth_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            createdAt: new Date().toISOString(),
        };
        setGrowthRecords(prev => [...prev, newRecord]);
    };

    const updateGrowthRecord = (id: string, updates: Partial<GrowthRecord>) => {
        setGrowthRecords(prev => prev.map(r =>
            r.id === id ? { ...r, ...updates } : r
        ));
    };

    const deleteGrowthRecord = (id: string) => {
        setGrowthRecords(prev => prev.filter(r => r.id !== id));
    };

    const getPatientGrowthRecords = (patientId: string) =>
        growthRecords.filter(r => r.patientId === patientId).sort((a, b) =>
            new Date(a.measurementDate).getTime() - new Date(b.measurementDate).getTime()
        );

    // ============================================
    // DEVELOPMENT MILESTONE OPERATIONS
    // ============================================

    const addDevelopmentMilestone = (milestoneData: Omit<DevelopmentMilestone, 'id' | 'createdAt'>) => {
        const newMilestone: DevelopmentMilestone = {
            ...milestoneData,
            id: `milestone_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            createdAt: new Date().toISOString(),
        };
        setDevelopmentMilestones(prev => [...prev, newMilestone]);
    };

    const updateDevelopmentMilestone = (id: string, updates: Partial<DevelopmentMilestone>) => {
        setDevelopmentMilestones(prev => prev.map(m =>
            m.id === id ? { ...m, ...updates } : m
        ));
    };

    const getPatientMilestones = (patientId: string) =>
        developmentMilestones.filter(m => m.patientId === patientId);

    // ============================================
    // ALLERGY OPERATIONS
    // ============================================

    const addAllergy = (allergyData: Omit<Allergy, 'id' | 'createdAt' | 'updatedAt'>) => {
        const newAllergy: Allergy = {
            ...allergyData,
            id: `allergy_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };
        setAllergies(prev => [...prev, newAllergy]);
    };

    const updateAllergy = (id: string, updates: Partial<Allergy>) => {
        setAllergies(prev => prev.map(a =>
            a.id === id ? { ...a, ...updates, updatedAt: new Date().toISOString() } : a
        ));
    };

    const deleteAllergy = (id: string) => {
        setAllergies(prev => prev.filter(a => a.id !== id));
    };

    const getPatientAllergies = (patientId: string) =>
        allergies.filter(a => a.patientId === patientId && a.isActive);

    // ============================================
    // FAMILY HISTORY OPERATIONS
    // ============================================

    const addFamilyHistory = (historyData: Omit<FamilyHistory, 'id' | 'createdAt'>) => {
        const newHistory: FamilyHistory = {
            ...historyData,
            id: `family_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            createdAt: new Date().toISOString(),
        };
        setFamilyHistory(prev => [...prev, newHistory]);
    };

    const updateFamilyHistory = (id: string, updates: Partial<FamilyHistory>) => {
        setFamilyHistory(prev => prev.map(h =>
            h.id === id ? { ...h, ...updates } : h
        ));
    };

    const deleteFamilyHistory = (id: string) => {
        setFamilyHistory(prev => prev.filter(h => h.id !== id));
    };

    const getPatientFamilyHistory = (patientId: string) =>
        familyHistory.filter(h => h.patientId === patientId);

    // ============================================
    // HOSPITALIZATION OPERATIONS
    // ============================================

    const addHospitalization = (hospitalizationData: Omit<Hospitalization, 'id' | 'createdAt' | 'updatedAt'>) => {
        const newHospitalization: Hospitalization = {
            ...hospitalizationData,
            id: `hosp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };
        setHospitalizations(prev => [...prev, newHospitalization]);
    };

    const updateHospitalization = (id: string, updates: Partial<Hospitalization>) => {
        setHospitalizations(prev => prev.map(h =>
            h.id === id ? { ...h, ...updates, updatedAt: new Date().toISOString() } : h
        ));
    };

    const deleteHospitalization = (id: string) => {
        setHospitalizations(prev => prev.filter(h => h.id !== id));
    };

    const getPatientHospitalizations = (patientId: string) =>
        hospitalizations.filter(h => h.patientId === patientId).sort((a, b) =>
            new Date(b.admissionDate).getTime() - new Date(a.admissionDate).getTime()
        );

    // ============================================
    // MEDICAL VISIT OPERATIONS
    // ============================================

    const addMedicalVisit = (visitData: Omit<MedicalVisit, 'id' | 'createdAt' | 'updatedAt'>) => {
        const newVisit: MedicalVisit = {
            ...visitData,
            id: `visit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };
        setMedicalVisits(prev => [...prev, newVisit]);
    };

    const updateMedicalVisit = (id: string, updates: Partial<MedicalVisit>) => {
        setMedicalVisits(prev => prev.map(v =>
            v.id === id ? { ...v, ...updates, updatedAt: new Date().toISOString() } : v
        ));
    };

    const deleteMedicalVisit = (id: string) => {
        setMedicalVisits(prev => prev.filter(v => v.id !== id));
    };

    const getPatientVisits = (patientId: string) =>
        medicalVisits.filter(v => v.patientId === patientId).sort((a, b) =>
            new Date(b.visitDate).getTime() - new Date(a.visitDate).getTime()
        );

    // ============================================
    // DOCUMENT OPERATIONS
    // ============================================

    const addDocument = (documentData: Omit<MedicalDocument, 'id' | 'createdAt'>) => {
        const newDocument: MedicalDocument = {
            ...documentData,
            id: `doc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            createdAt: new Date().toISOString(),
        };
        setDocuments(prev => [...prev, newDocument]);
    };

    const deleteDocument = (id: string) => {
        setDocuments(prev => prev.filter(d => d.id !== id));
    };

    const getPatientDocuments = (patientId: string) =>
        documents.filter(d => d.patientId === patientId).sort((a, b) =>
            new Date(b.uploadDate).getTime() - new Date(a.uploadDate).getTime()
        );

    // ============================================
    // ALERT OPERATIONS
    // ============================================

    const addAlert = (alertData: Omit<Alert, 'id' | 'createdAt'>) => {
        const newAlert: Alert = {
            ...alertData,
            id: `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            createdAt: new Date().toISOString(),
        };
        setAlerts(prev => [...prev, newAlert]);
    };

    const dismissAlert = (id: string) => {
        setAlerts(prev => prev.map(a =>
            a.id === id ? { ...a, isDismissed: true } : a
        ));
    };

    const markAlertAsRead = (id: string) => {
        setAlerts(prev => prev.map(a =>
            a.id === id ? { ...a, isRead: true } : a
        ));
    };

    const getPatientAlerts = (patientId: string) =>
        alerts.filter(a => a.patientId === patientId && !a.isDismissed);

    const generateVaccinationAlerts = (patientId: string) => {
        const patientVaccinations = getPatientVaccinations(patientId);
        const overdueVaccines = patientVaccinations.filter(v => v.status === 'En retard');

        overdueVaccines.forEach(vaccine => {
            const existingAlert = alerts.find(a =>
                a.patientId === patientId &&
                a.type === 'Vaccin' &&
                a.message.includes(vaccine.vaccineName)
            );

            if (!existingAlert) {
                addAlert({
                    patientId,
                    type: 'Vaccin',
                    priority: 'Haute',
                    title: 'Vaccin en retard',
                    message: `Le vaccin ${vaccine.vaccineName} est en retard`,
                    dueDate: vaccine.nextDueDate,
                    isRead: false,
                    isDismissed: false,
                });
            }
        });
    };

    // ============================================
    // SUMMARY
    // ============================================

    const getPatientSummary = (patientId: string): PatientSummary | null => {
        const patient = getPatient(patientId);
        if (!patient) return null;

        const patientVisits = getPatientVisits(patientId);
        const patientVaccinations = getPatientVaccinations(patientId);
        const patientDocuments = getPatientDocuments(patientId);
        const patientAllergies = getPatientAllergies(patientId);
        const patientAlerts = getPatientAlerts(patientId);

        const overdueVaccinations = patientVaccinations.filter(v => v.status === 'En retard');
        const upcomingVisits = patientVisits.filter(v => v.nextVisitDate && new Date(v.nextVisitDate) > new Date());

        let vaccinationStatus: 'À jour' | 'En retard' | 'Incomplet' = 'À jour';
        if (overdueVaccinations.length > 0) {
            vaccinationStatus = 'En retard';
        } else if (patientVaccinations.length < 10) { // Arbitrary threshold
            vaccinationStatus = 'Incomplet';
        }

        return {
            patient,
            totalVisits: patientVisits.length,
            totalVaccinations: patientVaccinations.length,
            totalDocuments: patientDocuments.length,
            totalAllergies: patientAllergies.length,
            lastVisit: patientVisits[0],
            nextVisit: upcomingVisits[0],
            activeAlerts: patientAlerts,
            overdueVaccinations,
            vaccinationStatus,
            lastUpdated: new Date().toISOString(),
        };
    };

    // ============================================
    // UTILITY
    // ============================================

    const clearAllData = () => {
        if (window.confirm('Êtes-vous sûr de vouloir supprimer toutes les données ? Cette action est irréversible.')) {
            setPatients([]);
            setBirthRecords([]);
            setVaccinations([]);
            setGrowthRecords([]);
            setDevelopmentMilestones([]);
            setAllergies([]);
            setFamilyHistory([]);
            setHospitalizations([]);
            setMedicalVisits([]);
            setDocuments([]);
            setAlerts([]);
            setCurrentPatient(null);
            localStorage.removeItem('ecarnet_data');
        }
    };

    // ============================================
    // CONTEXT VALUE
    // ============================================

    const value: ECarnetContextType = {
        currentPatient,
        setCurrentPatient,
        patients,
        addPatient,
        updatePatient,
        deletePatient,
        getPatient,
        birthRecords,
        addBirthRecord,
        updateBirthRecord,
        getBirthRecord,
        vaccinations,
        addVaccination,
        updateVaccination,
        deleteVaccination,
        getPatientVaccinations,
        growthRecords,
        addGrowthRecord,
        updateGrowthRecord,
        deleteGrowthRecord,
        getPatientGrowthRecords,
        developmentMilestones,
        addDevelopmentMilestone,
        updateDevelopmentMilestone,
        getPatientMilestones,
        allergies,
        addAllergy,
        updateAllergy,
        deleteAllergy,
        getPatientAllergies,
        familyHistory,
        addFamilyHistory,
        updateFamilyHistory,
        deleteFamilyHistory,
        getPatientFamilyHistory,
        hospitalizations,
        addHospitalization,
        updateHospitalization,
        deleteHospitalization,
        getPatientHospitalizations,
        medicalVisits,
        addMedicalVisit,
        updateMedicalVisit,
        deleteMedicalVisit,
        getPatientVisits,
        documents,
        addDocument,
        deleteDocument,
        getPatientDocuments,
        alerts,
        addAlert,
        dismissAlert,
        markAlertAsRead,
        getPatientAlerts,
        generateVaccinationAlerts,
        getPatientSummary,
        clearAllData,
    };

    return <ECarnetContext.Provider value={value}>{children}</ECarnetContext.Provider>;
};

// ============================================
// HOOK
// ============================================

export const useECarnet = () => {
    const context = useContext(ECarnetContext);
    if (context === undefined) {
        throw new Error('useECarnet must be used within an ECarnetProvider');
    }
    return context;
};
