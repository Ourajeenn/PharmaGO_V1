import { FamilyMember } from './familyService';

export interface InteractionAlert {
    level: 'warning' | 'danger';
    message: string;
    preventCheckout: boolean;
}

/**
 * Checks for interactions between new cart items and a family member's known profile.
 */
export const checkDrugInteractions = (
    familyMember: FamilyMember,
    cartItemNames: string[]
): InteractionAlert | null => {

    // Simulate DrugBank / Theriaque heuristic check
    const newItems = cartItemNames.map(name => name.toLowerCase());

    // 1. Check Allergies
    for (const item of newItems) {
        if (item.includes('amoxi') || item.includes('clamoxyl') || item.includes('péni')) {
            if (familyMember.knownAllergies.some(a => a.toLowerCase().includes('pénicilline'))) {
                return {
                    level: 'danger',
                    message: `${familyMember.firstName} a une allergie connue à la Pénicilline. L'ajout de ce médicament est bloqué sans l'avis du pharmacien.`,
                    preventCheckout: true
                };
            }
        }
    }

    // 2. Check Conditions Context (e.g. Ibuprofen + Hypertension)
    for (const item of newItems) {
        if (item.includes('ibuprofen') || item.includes('advil')) {
            if (familyMember.chronicConditions.some(c => c.toLowerCase().includes('hypertension'))) {
                return {
                    level: 'warning',
                    message: `Attention: Les AINS (comme l'Ibuprofène) peuvent interagir avec l'hypertension de ${familyMember.firstName}. Veuillez consulter le pharmacien virtuel.`,
                    preventCheckout: false
                };
            }
        }
    }

    // 3. Drug-to-Drug interaction
    for (const item of newItems) {
        if (item.includes('aspirine')) {
            const hasBloodThinners = familyMember.currentMedications.some(m =>
                m.name.toLowerCase().includes('kardegic') || m.name.toLowerCase().includes('previscan')
            );
            if (hasBloodThinners) {
                return {
                    level: 'danger',
                    message: "Interaction médicamenteuse SÉVÈRE détectée entre l'Aspirine commandée et les traitements actuels. Risque hémorragique.",
                    preventCheckout: true
                };
            }
        }
    }

    return null; // No interactions
};
