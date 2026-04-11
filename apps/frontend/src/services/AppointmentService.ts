import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/utils/logger';

export interface Appointment {
    id: string;
    patient_id: string;
    doctor_id: string;
    date: string;
    time: string;
    status: string;
    notes?: string | null;
    type: string;
    doctor_name?: string;
    specialty?: string;
}

export const AppointmentService = {
    /**
     * Fetch all appointments for a specific patient
     */
    async getPatientAppointments(patientId: string): Promise<Appointment[]> {
        try {
            const { data, error } = await supabase
                .from('appointments')
                .select(`
          *,
          doctor:user_profiles!doctor_id(name)
        `)
                .eq('patient_id', patientId)
                .order('date', { ascending: false });

            if (error) throw error;

            return (data || []).map((app: any) => ({
                ...app,
                doctor_name: app.doctor?.name,
                // Since specialty might not be in user_profiles, we handle it gracefully
                specialty: 'Médecin'
            }));
        } catch (err) {
            logger.error('AppointmentService: Error fetching patient appointments', { error: err });
            return [];
        }
    },

    /**
     * Create a new appointment
     */
    async createAppointment(appointment: Omit<Appointment, 'id' | 'status'>): Promise<Appointment | null> {
        try {
            const { data, error } = await supabase
                .from('appointments')
                .insert([{
                    ...appointment,
                    status: 'pending'
                }])
                .select()
                .single();

            if (error) throw error;
            return data;
        } catch (err) {
            logger.error('AppointmentService: Error creating appointment', { error: err });
            return null;
        }
    },

    /**
     * Cancel an appointment
     */
    async cancelAppointment(id: string): Promise<boolean> {
        try {
            const { error } = await supabase
                .from('appointments')
                .update({ status: 'cancelled' })
                .eq('id', id);

            if (error) throw error;
            return true;
        } catch (err) {
            logger.error('AppointmentService: Error cancelling appointment', { error: err });
            return false;
        }
    }
};
