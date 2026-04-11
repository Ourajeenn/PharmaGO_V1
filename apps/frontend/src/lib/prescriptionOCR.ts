/**
 * prescriptionOCR.ts
 * Client-side OCR for prescription images using Tesseract.js.
 * Tesseract is loaded dynamically to avoid bloating the main bundle (~6MB WASM).
 * Falls back gracefully when OpenAI Vision is unavailable.
 */

// ─── Types ────────────────────────────────────────────────────────────────────
export interface Medication {
    name: string;
    dosage: string;
    frequency: string;
    duration: string;
    confidence: number;
}

export interface PrescriptionAnalysis {
    medications: Medication[];
    doctorName?: string;
    patientName?: string;
    date?: string;
    warnings: string[];
    interactions: string[];
    rawText?: string;
}

// ─── Known medications (Côte d'Ivoire context) ────────────────────────────────
const CIV_MEDICATIONS = [
    // Antipaludéens
    'arthemether', 'artémether', 'luméfantrine', 'artesunate', 'artésunate',
    'quinine', 'chloroquine', 'mefloquine', 'méfloquine', 'coartem',
    // Antibiotiques
    'amoxicilline', 'amoxicillin', 'ampicilline', 'ceftriaxone', 'ciprofloxacine',
    'metronidazole', 'metronidazol', 'flagyl', 'cotrimoxazole', 'azithromycine',
    'doxycycline', 'clindamycine', 'erythromycine',
    // Analgésiques / Antipyrétiques
    'paracétamol', 'paracetamol', 'ibuprofène', 'ibuprofen', 'aspirine',
    'diclofénac', 'diclofenac', 'tramadol', 'codéine',
    // Antihypertenseurs
    'amlodipine', 'lisinopril', 'losartan', 'hydrochlorothiazide', 'furosémide',
    'furosemide', 'captopril', 'atenolol', 'aténolol', 'bisoprolol',
    // Antidiabétiques
    'metformine', 'metformin', 'glibenclamide', 'insuline', 'glimepiride',
    // Vitamines / Suppléments
    'vitamine c', 'fer', 'acide folique', 'zinc', 'calcium', 'vitamine d',
    'multivitamines', 'sélénium',
    // Autres courants
    'omeprazole', 'oméprazole', 'ranitidine', 'antacid', 'hydroxyde',
    'salbutamol', 'prednisolone', 'hydrocortisone', 'dexamethasone', 'déxaméthasone',
];

// Known interaction pairs
const INTERACTION_MAP: [string, string, string][] = [
    ['aspirine', 'ibuprofène', 'Association déconseillée : risque hémorragique accru'],
    ['ceftriaxone', 'ciprofloxacine', 'Association à surveiller : potentialisation des effets'],
    ['metformine', 'alcool', 'Éviter l\'alcool avec la metformine'],
    ['chloroquine', 'quinine', 'Contre-indication : allongement QT'],
];

// ─── OCR Engine ───────────────────────────────────────────────────────────────
export async function runOCR(
    imageSource: string | File,
    onProgress?: (p: number) => void,
): Promise<string> {
    // Dynamic import — tesseract.js (~6MB WASM) loaded only when needed
    const { createWorker } = await import('tesseract.js');
    const worker = await createWorker('fra+eng', 1, {
        logger: (m) => {
            if (m.status === 'recognizing text' && onProgress) {
                onProgress(Math.round(m.progress * 100));
            }
        },
    });

    let text = '';
    try {
        const { data } = await worker.recognize(imageSource);
        text = data.text;
    } finally {
        await worker.terminate();
    }
    return text;
}

// ─── Parser ───────────────────────────────────────────────────────────────────
export function parsePrescription(rawText: string): PrescriptionAnalysis {
    const lines = rawText
        .toLowerCase()
        .split('\n')
        .map((l) => l.trim())
        .filter(Boolean);

    const medications: Medication[] = [];
    const foundNames = new Set<string>();

    for (const line of lines) {
        for (const med of CIV_MEDICATIONS) {
            if (line.includes(med) && !foundNames.has(med)) {
                foundNames.add(med);

                // Dosage: digits followed by mg/g/ml/UI
                const dosageMatch = line.match(/\d+\s*(?:mg|g|ml|ui|µg|mcg)/i);
                // Frequency: 1x, 2x, matin, soir, toutes les X heures
                const freqMatch = line.match(
                    /(\d+\s*(?:x|fois|comprimé[s]?|cp|gél).*?(?:par jour|\/j|\/d)?|matin[^,]*)(?=[,\s]|$)/i,
                );
                // Duration: X jours/semaines/mois
                const durMatch = line.match(/\d+\s*(?:jour[s]?|semaine[s]?|mois)/i);

                medications.push({
                    name: capitalize(med),
                    dosage: dosageMatch ? dosageMatch[0].trim() : 'À préciser',
                    frequency: freqMatch ? freqMatch[0].trim() : '1 fois/jour',
                    duration: durMatch ? durMatch[0].trim() : 'À préciser',
                    confidence: 0.75,
                });
            }
        }
    }

    // Doctor name: "Dr." or "Docteur"
    const doctorMatch = rawText.match(/(?:Dr\.?|Docteur)\s+([A-ZÀÁÂÄÉÈÊËÍÎÏÔÙÛÜ][a-zàáâäéèêëíîïôùûü]+(?:\s+[A-ZÀÁÂÄÉÈÊËÍÎÏÔÙÛÜ][a-zàáâäéèêëíîïôùûü]+)*)/);
    const doctorName = doctorMatch ? doctorMatch[0] : undefined;

    // Date: DD/MM/YYYY or YYYY-MM-DD
    const dateMatch = rawText.match(/\b(\d{1,2}[/-]\d{1,2}[/-]\d{2,4})\b/);
    const date = dateMatch ? dateMatch[1] : undefined;

    // Interaction detection
    const interactions: string[] = [];
    const medNamesLower = medications.map((m) => m.name.toLowerCase());
    for (const [a, b, msg] of INTERACTION_MAP) {
        if (medNamesLower.includes(a) && medNamesLower.includes(b)) {
            interactions.push(msg);
        }
    }

    // Warnings
    const warnings: string[] = [];
    if (medications.length === 0) {
        warnings.push('Aucun médicament reconnu automatiquement — vérifiez et complétez manuellement.');
    }
    if (medications.some((m) => m.dosage === 'À préciser')) {
        warnings.push('Certains dosages n\'ont pas pu être extraits automatiquement.');
    }

    return { medications, doctorName, date, warnings, interactions, rawText };
}

// ─── Helpers ─────────────────────────────────────────────────────────────────
function capitalize(s: string) {
    return s.charAt(0).toUpperCase() + s.slice(1);
}

/**
 * High-level helper: run OCR then parse.
 */
export async function analyzeWithOCR(
    imageSource: string | File,
    onProgress?: (p: number) => void,
): Promise<PrescriptionAnalysis> {
    const text = await runOCR(imageSource, onProgress);
    return parsePrescription(text);
}
