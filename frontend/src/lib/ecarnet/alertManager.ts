import { Alert, Vaccination, MedicalVisit } from '@/types/ecarnet';
import { parseISO, isBefore, addDays, differenceInDays } from 'date-fns';

// ============================================
// GÉNÉRATION D'ALERTES VACCINS
// ============================================

export const generateVaccineAlerts = (
    patientId: string,
    vaccinations: Vaccination[]
): Alert[] => {
    const alerts: Alert[] = [];
    const today = new Date();

    vaccinations.forEach(vaccine => {
        if (!vaccine.nextDueDate) return;

        const dueDate = parseISO(vaccine.nextDueDate);
        const daysUntilDue = differenceInDays(dueDate, today);

        // Vaccin en retard
        if (daysUntilDue < 0 && vaccine.status !== 'À jour') {
            alerts.push({
                id: `alert_vaccine_overdue_${vaccine.id}`,
                patientId,
                type: 'Vaccin',
                priority: 'Haute',
                title: 'Vaccin en retard',
                message: `Le vaccin "${vaccine.vaccineName}" est en retard de ${Math.abs(daysUntilDue)} jours`,
                dueDate: vaccine.nextDueDate,
                isRead: false,
                isDismissed: false,
                actionUrl: `/ecarnet/vaccinations`,
                createdAt: new Date().toISOString(),
            });
        }
        // Vaccin à venir dans les 7 jours
        else if (daysUntilDue >= 0 && daysUntilDue <= 7 && vaccine.status !== 'À jour') {
            alerts.push({
                id: `alert_vaccine_upcoming_${vaccine.id}`,
                patientId,
                type: 'Vaccin',
                priority: 'Moyenne',
                title: 'Vaccin à venir',
                message: `Le vaccin "${vaccine.vaccineName}" est prévu dans ${daysUntilDue} jours`,
                dueDate: vaccine.nextDueDate,
                isRead: false,
                isDismissed: false,
                actionUrl: `/ecarnet/vaccinations`,
                createdAt: new Date().toISOString(),
            });
        }
    });

    return alerts;
};

// ============================================
// GÉNÉRATION D'ALERTES VISITES
// ============================================

export const generateVisitAlerts = (
    patientId: string,
    visits: MedicalVisit[]
): Alert[] => {
    const alerts: Alert[] = [];
    const today = new Date();

    visits.forEach(visit => {
        if (!visit.nextVisitDate) return;

        const nextVisitDate = parseISO(visit.nextVisitDate);
        const daysUntilVisit = differenceInDays(nextVisitDate, today);

        // Visite à venir dans les 3 jours
        if (daysUntilVisit >= 0 && daysUntilVisit <= 3) {
            alerts.push({
                id: `alert_visit_upcoming_${visit.id}`,
                patientId,
                type: 'Visite',
                priority: daysUntilVisit === 0 ? 'Urgente' : 'Haute',
                title: daysUntilVisit === 0 ? 'Visite aujourd\'hui' : 'Visite à venir',
                message: daysUntilVisit === 0
                    ? `Visite médicale prévue aujourd'hui : ${visit.nextVisitReason || 'Consultation'}`
                    : `Visite médicale dans ${daysUntilVisit} jours : ${visit.nextVisitReason || 'Consultation'}`,
                dueDate: visit.nextVisitDate,
                isRead: false,
                isDismissed: false,
                actionUrl: `/ecarnet/visits`,
                createdAt: new Date().toISOString(),
            });
        }
    });

    return alerts;
};

// ============================================
// GÉNÉRATION D'ALERTES MÉDICAMENTS
// ============================================

export const generateMedicationAlerts = (
    patientId: string,
    visits: MedicalVisit[]
): Alert[] => {
    const alerts: Alert[] = [];
    const today = new Date();

    visits.forEach(visit => {
        if (!visit.prescriptions || visit.prescriptions.length === 0) return;

        visit.prescriptions.forEach(prescription => {
            // Extraire la durée du traitement (format: "7 jours", "2 semaines", etc.)
            const durationMatch = prescription.duration.match(/(\d+)\s*(jour|semaine|mois)/i);
            if (!durationMatch) return;

            const amount = parseInt(durationMatch[1]);
            const unit = durationMatch[2].toLowerCase();

            let durationDays = amount;
            if (unit.includes('semaine')) durationDays = amount * 7;
            if (unit.includes('mois')) durationDays = amount * 30;

            const visitDate = parseISO(visit.visitDate);
            const endDate = addDays(visitDate, durationDays);
            const daysRemaining = differenceInDays(endDate, today);

            // Traitement se termine bientôt
            if (daysRemaining >= 0 && daysRemaining <= 2) {
                alerts.push({
                    id: `alert_medication_ending_${visit.id}_${prescription.medication}`,
                    patientId,
                    type: 'Médicament',
                    priority: 'Moyenne',
                    title: 'Fin de traitement',
                    message: `Le traitement "${prescription.medication}" se termine dans ${daysRemaining} jours`,
                    dueDate: endDate.toISOString(),
                    isRead: false,
                    isDismissed: false,
                    createdAt: new Date().toISOString(),
                });
            }
        });
    });

    return alerts;
};

// ============================================
// GÉNÉRATION DE TOUTES LES ALERTES
// ============================================

export const generateAllAlerts = (
    patientId: string,
    vaccinations: Vaccination[],
    visits: MedicalVisit[]
): Alert[] => {
    const vaccineAlerts = generateVaccineAlerts(patientId, vaccinations);
    const visitAlerts = generateVisitAlerts(patientId, visits);
    const medicationAlerts = generateMedicationAlerts(patientId, visits);

    return [...vaccineAlerts, ...visitAlerts, ...medicationAlerts]
        .sort((a, b) => {
            // Trier par priorité puis par date
            const priorityOrder = { 'Urgente': 0, 'Haute': 1, 'Moyenne': 2, 'Basse': 3 };
            const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority];
            if (priorityDiff !== 0) return priorityDiff;

            if (a.dueDate && b.dueDate) {
                return parseISO(a.dueDate).getTime() - parseISO(b.dueDate).getTime();
            }
            return 0;
        });
};

// ============================================
// FILTRAGE DES ALERTES
// ============================================

export const getActiveAlerts = (alerts: Alert[]): Alert[] => {
    return alerts.filter(alert => !alert.isDismissed);
};

export const getUnreadAlerts = (alerts: Alert[]): Alert[] => {
    return alerts.filter(alert => !alert.isRead && !alert.isDismissed);
};

export const getAlertsByPriority = (alerts: Alert[], priority: Alert['priority']): Alert[] => {
    return alerts.filter(alert => alert.priority === priority && !alert.isDismissed);
};

export const getAlertsByType = (alerts: Alert[], type: Alert['type']): Alert[] => {
    return alerts.filter(alert => alert.type === type && !alert.isDismissed);
};
