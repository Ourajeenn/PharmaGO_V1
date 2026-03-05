import { analyzeWithOCR, type PrescriptionAnalysis as OCRAnalysis } from './prescriptionOCR';
import { supabase } from './supabase';

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
    // API Key removed for security; calls will now be made via Supabase Edge Functions.

    constructor() {
    }

    // Analyze prescription image
    async analyzePrescription(imageBase64: string): Promise<PrescriptionAnalysis> {
        try {
            const { data, error } = await supabase.functions.invoke('analyze-prescription', {
                body: { action: 'analyze', imageBase64 }
            });

            if (error) throw error;
            if (!data || !data.content) throw new Error("No content received from Edge Function");

            const analysis = JSON.parse(data.content);
            return analysis;
        } catch (error) {
            console.warn('[VisionAI] Edge Function call failed, falling back to Tesseract OCR:', error);
            return this._ocrFallback(imageBase64);
        }
    }

    /** Tesseract.js offline fallback */
    private async _ocrFallback(imageBase64: string): Promise<PrescriptionAnalysis> {
        // Convert base64 back to a Blob so Tesseract can read it
        const byteString = atob(imageBase64);
        const ab = new ArrayBuffer(byteString.length);
        const ia = new Uint8Array(ab);
        for (let i = 0; i < byteString.length; i++) ia[i] = byteString.charCodeAt(i);
        const blob = new Blob([ab], { type: 'image/jpeg' });
        const result: OCRAnalysis = await analyzeWithOCR(blob as unknown as File);
        return result as unknown as PrescriptionAnalysis;
    }

    // Check medication interactions
    async checkInteractions(medications: string[]): Promise<string[]> {
        try {
            const { data, error } = await supabase.functions.invoke('analyze-prescription', {
                body: { action: 'check_interactions', medications }
            });

            if (error) throw error;
            if (!data || !data.content) return [];

            // Parse interactions
            const interactions = data.content
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
            const { data, error } = await supabase.functions.invoke('analyze-prescription', {
                body: { action: 'suggest_alternatives', medicationName }
            });

            if (error) throw error;
            if (!data || !data.content) return [];

            const alternatives = data.content
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
export const visionAI = new VisionAI();

export default visionAI;
