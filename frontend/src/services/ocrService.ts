// Tesseract is imported dynamically below to reduce the initial bundle size
export interface ParsedMedication {
    name: string;
    dosage?: string;
    quantity?: number;
    rawText: string;
    confidence: number;
}

export interface OCRResult {
    medications: ParsedMedication[];
    overallConfidence: number;
    rawText: string;
}

/**
 * Extracts medications from raw OCR text using regex and heuristics.
 */
const parseMedications = (text: string): ParsedMedication[] => {
    const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 3);
    const results: ParsedMedication[] = [];

    // Simple heuristic for demo purposes:
    // Look for lines that might contain typical drug names or keywords
    const ignoreWords = ['ordonnance', 'docteur', 'dr', 'le', 'la', 'les', 'des', 'pharmacie', 'patient', 'date', 'signature'];

    lines.forEach(line => {
        const lowerLine = line.toLowerCase();

        // Skip obvious non-drug lines
        if (ignoreWords.some(w => lowerLine.startsWith(w) || lowerLine === w)) {
            return;
        }

        // Try to extract dosage (e.g., 500mg, 1g)
        const dosageMatch = line.match(/(\d+(?:\.\d+)?\s*(?:mg|g|ml|µg|cp|comprimés|gélules))/i);
        const dosage = dosageMatch ? dosageMatch[1] : undefined;

        // Try to extract quantity (e.g., 1 boite, 2 btes, x1, QSP 1 mois)
        let quantity = 1;
        const qteMatch = line.match(/(?:x|qte|quantité|boite(?:s)?)\s*(\d+)/i) || line.match(/(\d+)\s*(?:boite|bte)/i);
        if (qteMatch && qteMatch[1]) {
            quantity = parseInt(qteMatch[1], 10);
        }

        // Remove the matched dosage and quantity from the name to clean it up
        let name = line;
        if (dosage) name = name.replace(dosageMatch![0], '');
        if (qteMatch) name = name.replace(qteMatch[0], '');

        // Clean up symbols
        name = name.replace(/[^a-zA-ZÀ-ÿ0-9\s-]/g, '').trim();

        if (name.length > 2) {
            results.push({
                name: name,
                dosage: dosage,
                quantity: quantity,
                rawText: line,
                confidence: 85 // Mock confidence for parsing
            });
        }
    });

    return results;
};

export const scanPrescription = async (
    imageElementOrUrl: string | HTMLImageElement | File,
    onProgress?: (progress: number) => void
): Promise<OCRResult> => {
    try {
        const { createWorker } = await import('tesseract.js');
        const worker = await createWorker('fra', 1, {
            logger: m => {
                if (m.status === 'recognizing text' && onProgress) {
                    onProgress(Math.round(m.progress * 100));
                }
            }
        });

        const { data: { text, confidence } } = await worker.recognize(imageElementOrUrl);
        await worker.terminate();

        const medications = parseMedications(text);

        return {
            medications,
            overallConfidence: confidence,
            rawText: text
        };
    } catch (error) {
        console.error("OCR Error:", error);
        throw error;
    }
};

export interface OCRInsuranceResult {
    cardNumber: string | null;
    company: string | null;
    overallConfidence: number;
    rawText: string;
}

export const scanInsuranceCard = async (
    imageElementOrUrl: string | HTMLImageElement | File,
    onProgress?: (progress: number) => void
): Promise<OCRInsuranceResult> => {
    try {
        const { createWorker } = await import('tesseract.js');
        const worker = await createWorker('fra', 1, {
            logger: m => {
                if (m.status === 'recognizing text' && onProgress) {
                    onProgress(Math.round(m.progress * 100));
                }
            }
        });

        const { data: { text, confidence } } = await worker.recognize(imageElementOrUrl);
        await worker.terminate();

        // Regex routines for Insurance
        let cardNumber = null;
        let company = null;

        // Commonly, card numbers are sequences of 8-15 digits
        const numMatch = text.match(/\b\d{8,15}\b/);
        if (numMatch) {
            cardNumber = numMatch[0];
        }

        // Extremely simple heuristic for company names (CMU, ASCOMA, MCI)
        const upperText = text.toUpperCase();
        if (upperText.includes("CMU") || upperText.includes("COUVERTURE MALADIE UNIVERSELLE")) company = "CMU";
        else if (upperText.includes("ASCOMA")) company = "ASCOMA";
        else if (upperText.includes("MCI") || upperText.includes("MCI CARE")) company = "MCI CARE";
        else if (upperText.includes("ALLIANZ")) company = "ALLIANZ";

        return {
            cardNumber,
            company,
            overallConfidence: confidence,
            rawText: text
        };
    } catch (error) {
        console.error("OCR Insurance Error:", error);
        throw error;
    }
};
