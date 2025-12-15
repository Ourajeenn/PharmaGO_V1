// OpenAI Vision API Integration for Prescription Analysis

interface PrescriptionAnalysis {
    medications: Array<{
        name: string;
        dosage: string;
        frequency: string;
        duration: string;
        confidence: number;
    }>;
    doctorName?: string;
    patientName?: string;
    date?: string;
    warnings: string[];
    interactions: string[];
}

class VisionAI {
    private apiKey: string;
    private baseUrl = 'https://api.openai.com/v1/chat/completions';

    constructor(apiKey: string) {
        this.apiKey = apiKey;
    }

    // Analyze prescription image
    async analyzePrescription(imageBase64: string): Promise<PrescriptionAnalysis> {
        try {
            const response = await fetch(this.baseUrl, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    model: 'gpt-4-vision-preview',
                    messages: [
                        {
                            role: 'system',
                            content: `Tu es un assistant médical spécialisé dans l'analyse d'ordonnances.
Analyse l'image de l'ordonnance et extrait les informations suivantes au format JSON:
- Liste des médicaments avec nom, dosage, fréquence, durée
- Nom du médecin si visible
- Nom du patient si visible
- Date de l'ordonnance
- Avertissements potentiels
- Interactions médicamenteuses possibles

Important: Réponds uniquement avec du JSON valide.`,
                        },
                        {
                            role: 'user',
                            content: [
                                {
                                    type: 'image_url',
                                    image_url: {
                                        url: `data:image/jpeg;base64,${imageBase64}`,
                                    },
                                },
                                {
                                    type: 'text',
                                    text: 'Analyse cette ordonnance médicale et extrais toutes les informations pertinentes.',
                                },
                            ],
                        },
                    ],
                    max_tokens: 1000,
                }),
            });

            if (!response.ok) {
                throw new Error(`API request failed: ${response.statusText}`);
            }

            const data = await response.json();
            const content = data.choices[0].message.content;

            // Parse JSON response
            const analysis = JSON.parse(content);

            return analysis;
        } catch (error) {
            console.error('[VisionAI] Analysis error:', error);
            throw new Error('Impossible d\'analyser l\'ordonnance');
        }
    }

    // Check medication interactions
    async checkInteractions(medications: string[]): Promise<string[]> {
        try {
            const response = await fetch(this.baseUrl, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    model: 'gpt-4',
                    messages: [
                        {
                            role: 'system',
                            content: 'Tu es un pharmacien expert en interactions médicamenteuses. Analyse la liste de médicaments et identifie toutes les interactions potentielles.',
                        },
                        {
                            role: 'user',
                            content: `Vérifie les interactions entre ces médicaments: ${medications.join(', ')}. Réponds uniquement avec une liste d'avertissements.`,
                        },
                    ],
                    max_tokens: 500,
                }),
            });

            const data = await response.json();
            const content = data.choices[0].message.content;

            // Parse interactions
            const interactions = content
                .split('\n')
                .filter((line: string) => line.trim().length > 0);

            return interactions;
        } catch (error) {
            console.error('[VisionAI] Interaction check error:', error);
            return [];
        }
    }

    // Suggest alternative medications
    async suggestAlternatives(medicationName: string): Promise<string[]> {
        try {
            const response = await fetch(this.baseUrl, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    model: 'gpt-4',
                    messages: [
                        {
                            role: 'system',
                            content: 'Tu es un pharmacien expert. Suggère des alternatives génériques ou similaires pour les médicaments.',
                        },
                        {
                            role: 'user',
                            content: `Suggère des alternatives pour ${medicationName}. Réponds avec une liste de max 5 alternatives avec une brève explication.`,
                        },
                    ],
                    max_tokens: 300,
                }),
            });

            const data = await response.json();
            const content = data.choices[0].message.content;

            const alternatives = content
                .split('\n')
                .filter((line: string) => line.trim().length > 0 && line.includes('-'));

            return alternatives;
        } catch (error) {
            console.error('[VisionAI] Alternative suggestions error:', error);
            return [];
        }
    }

    // Convert image file to base64
    static async imageToBase64(file: File): Promise<string> {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => {
                const base64 = (reader.result as string).split(',')[1];
                resolve(base64);
            };
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    }
}

// Create singleton instance
export const visionAI = new VisionAI(
    import.meta.env.VITE_OPENAI_API_KEY || ''
);

export default visionAI;
