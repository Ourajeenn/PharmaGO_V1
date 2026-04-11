export interface FamilyMember {
    id: string;
    firstName: string;
    relation: 'moi' | 'conjoint' | 'enfant' | 'parent' | 'autre';
    birthDate: string;
    weightKg: number;
    knownAllergies: string[];
    chronicConditions: string[];
    currentMedications: {
        medicineId: string;
        name: string;
        frequency: string;
        startDate: string;
        remainingDays: number;
    }[];
}

class FamilyService {
    private mockProfiles: FamilyMember[] = [
        {
            id: 'fam-1',
            firstName: 'Moi',
            relation: 'moi',
            birthDate: '1985-06-15',
            weightKg: 78,
            knownAllergies: ['Pénicilline'],
            chronicConditions: ['Hypertension'],
            currentMedications: [
                {
                    medicineId: 'amlo-10',
                    name: 'Amlodipine 10mg',
                    frequency: '1 cp/jour',
                    startDate: '2024-01-01',
                    remainingDays: 12
                }
            ]
        },
        {
            id: 'fam-2',
            firstName: 'Mariama',
            relation: 'parent',
            birthDate: '1955-03-22',
            weightKg: 65,
            knownAllergies: [],
            chronicConditions: ['Diabète Type 2'],
            currentMedications: [
                {
                    medicineId: 'metformine-1000',
                    name: 'Metformine 1000mg',
                    frequency: '2 cp/jour',
                    startDate: '2024-01-01',
                    remainingDays: 7 // Triggering the "7 days left" reminder
                }
            ]
        }
    ];

    async getFamilyProfiles(userId: string): Promise<FamilyMember[]> {
        // Return mock for now
        return this.mockProfiles;
    }

    async addFamilyMember(userId: string, member: Omit<FamilyMember, 'id'>): Promise<FamilyMember> {
        const newMember = { ...member, id: `fam-${Date.now()}` };
        this.mockProfiles.push(newMember);
        return newMember;
    }
}

export const familyService = new FamilyService();
