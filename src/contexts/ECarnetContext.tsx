import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';
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
import { toast } from 'sonner';

interface ECarnetContextType {
    currentPatient: Patient | null;
    setCurrentPatient: (patient: Patient | null) => void;
    patients: Patient[];
    loading: boolean;
    refreshData: () => Promise<void>;

    // Operations
    addPatient: (patient: Omit<Patient, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Patient | null>;
    updatePatient: (id: string, updates: Partial<Patient>) => Promise<void>;
    deletePatient: (id: string) => Promise<void>;

    // Specific Getters
    getPatientAlerts: (patientId: string) => Alert[];
    getPatientSummary: (patientId: string) => PatientSummary | null;
}

const ECarnetContext = createContext<ECarnetContextType | undefined>(undefined);

export const ECarnetProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const { user } = useAuth();
    const [currentPatient, setCurrentPatient] = useState<Patient | null>(null);
    const [patients, setPatients] = useState<Patient[]>([]);
    const [vaccinations, setVaccinations] = useState<Vaccination[]>([]);
    const [medicalVisits, setMedicalVisits] = useState<MedicalVisit[]>([]);
    const [alerts, setAlerts] = useState<Alert[]>([]);
    const [loading, setLoading] = useState(false);

    // Sync from Supabase
    const refreshData = useCallback(async () => {
        if (!user) return;
        setLoading(true);
        try {
            // 1. Fetch Patients (Mapped from 'patients' table)
            const { data: pts, error: ptsError } = await supabase
                .from('patients')
                .select('*')
                .eq('user_id', user.id);

            if (ptsError) throw ptsError;

            const mappedPatients: Patient[] = pts.map(p => ({
                id: p.id,
                firstName: p.name?.split(' ')[0] || 'Patient',
                lastName: p.name?.split(' ').slice(1).join(' ') || '',
                dateOfBirth: p.birth_date || '',
                gender: (p.gender as any) || 'M',
                bloodGroup: (p.blood_type as any) || 'Inconnu',
                phone: p.phone,
                email: p.email,
                address: p.address,
                insuranceType: (p.insurance_type as any) || 'standard',
                emergencyContacts: [], // Needs separate table or JSONB
                createdAt: p.created_at,
                updatedAt: p.updated_at
            }));

            setPatients(mappedPatients);
            if (mappedPatients.length > 0 && !currentPatient) {
                setCurrentPatient(mappedPatients[0]);
            }

            // 2. Fetch specific E-Carnet data for all patients of this user
            const patientIds = mappedPatients.map(p => p.id);
            if (patientIds.length > 0) {
                const [vaxRes, visitsRes, alertsRes] = await Promise.all([
                    supabase.from('vaccinations').select('*').in('patient_id', patientIds),
                    supabase.from('medical_visits').select('*').in('patient_id', patientIds),
                    supabase.from('medical_alerts').select('*').in('patient_id', patientIds)
                ]);

                setVaccinations((vaxRes.data || []).map(v => ({
                    id: v.id,
                    patientId: v.patient_id,
                    vaccineName: v.vaccine_name,
                    disease: v.disease,
                    isRequired: v.is_required,
                    administrationDate: v.administration_date,
                    nextDueDate: v.next_due_date,
                    status: v.status as any,
                    createdAt: v.created_at,
                    updatedAt: v.updated_at
                })));

                setMedicalVisits((visitsRes.data || []).map(v => ({
                    id: v.id,
                    patientId: v.patient_id,
                    visitDate: v.visit_date,
                    visitType: v.visit_type as any,
                    doctorName: v.doctor_name,
                    specialty: v.specialty,
                    reason: v.reason,
                    diagnosis: v.diagnosis,
                    createdAt: v.created_at,
                    updatedAt: v.updated_at
                })));

                setAlerts((alertsRes.data || []).map(a => ({
                    id: a.id,
                    patientId: a.patient_id,
                    type: a.type as any,
                    priority: a.priority as any,
                    title: a.title,
                    message: a.message,
                    dueDate: a.due_date,
                    isRead: a.is_read,
                    isDismissed: a.is_dismissed,
                    createdAt: a.created_at
                })));
            }
        } catch (error: any) {
            console.error('Error refreshing E-Carnet data:', error);
            toast.error("Erreur de synchronisation Cloud");
        } finally {
            setLoading(false);
        }
    }, [user, currentPatient]);

    useEffect(() => {
        if (user) refreshData();
    }, [user]);

    const addPatient = async (patientData: Omit<Patient, 'id' | 'createdAt' | 'updatedAt'>) => {
        if (!user) return null;
        try {
            const { data, error } = await supabase
                .from('patients')
                .insert({
                    user_id: user.id,
                    name: `${patientData.firstName} ${patientData.lastName}`,
                    birth_date: patientData.dateOfBirth,
                    gender: patientData.gender,
                    blood_type: patientData.bloodGroup,
                    address: patientData.address,
                    insurance_type: patientData.insuranceType
                })
                .select()
                .single();

            if (error) throw error;

            const newPatient: Patient = {
                ...patientData,
                id: data.id,
                createdAt: data.created_at,
                updatedAt: data.updated_at
            };

            setPatients(prev => [...prev, newPatient]);
            toast.success("Profil patient créé");
            return newPatient;
        } catch (error: any) {
            toast.error(error.message);
            return null;
        }
    };

    const updatePatient = async (id: string, updates: Partial<Patient>) => {
        try {
            const { error } = await supabase
                .from('patients')
                .update({
                    name: updates.firstName && updates.lastName ? `${updates.firstName} ${updates.lastName}` : undefined,
                    birth_date: updates.dateOfBirth,
                    blood_type: updates.bloodGroup,
                    address: updates.address
                })
                .eq('id', id);

            if (error) throw error;

            setPatients(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
            toast.success("Profil mis à jour");
        } catch (error: any) {
            toast.error(error.message);
        }
    };

    const deletePatient = async (id: string) => {
        try {
            const { error } = await supabase.from('patients').delete().eq('id', id);
            if (error) throw error;
            setPatients(prev => prev.filter(p => p.id !== id));
            toast.success("Profil supprimé");
        } catch (error: any) {
            toast.error(error.message);
        }
    };

    const getPatientAlerts = (patientId: string) => alerts.filter(a => a.patientId === patientId);

    const getPatientSummary = (patientId: string): PatientSummary | null => {
        const patient = patients.find(p => p.id === patientId);
        if (!patient) return null;

        const pVisits = medicalVisits.filter(v => v.patientId === patientId);
        const pVax = vaccinations.filter(v => v.patientId === patientId);
        const pAlerts = alerts.filter(a => a.patientId === patientId);

        return {
            patient,
            totalVisits: pVisits.length,
            totalVaccinations: pVax.length,
            totalDocuments: 0,
            totalAllergies: 0,
            lastVisit: pVisits[0],
            activeAlerts: pAlerts,
            overdueVaccinations: pVax.filter(v => v.status === 'En retard'),
            vaccinationStatus: pVax.some(v => v.status === 'En retard') ? 'En retard' : 'À jour',
            lastUpdated: new Date().toISOString()
        };
    };

    return (
        <ECarnetContext.Provider value={{
            currentPatient,
            setCurrentPatient,
            patients,
            loading,
            refreshData,
            addPatient,
            updatePatient,
            deletePatient,
            getPatientAlerts,
            getPatientSummary
        }}>
            {children}
        </ECarnetContext.Provider>
    );
};

export const useECarnet = () => {
    const context = useContext(ECarnetContext);
    if (!context) throw new Error('useECarnet must be used within ECarnetProvider');
    return context;
};
