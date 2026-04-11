/**
 * useI18n.ts — Lightweight i18n for PharmaGo
 * Supports: Francais (fr), English (en), Dioula (dz)
 */

import { useState, useCallback } from 'react';

export type Lang = 'fr' | 'en' | 'dz';

export const LANG_LABELS: Record<Lang, string> = {
    fr: 'Francais',
    en: 'English',
    dz: 'Dioula',
};

export const LANG_FLAGS: Record<Lang, string> = {
    fr: '🇫🇷',
    en: '🇬🇧',
    dz: '🟢',
};

// ─── Translations ─────────────────────────────────────────────────────────────
const translations = {
    // Landing / Hero
    heroTitle: {
        fr: 'Votre pharmacie a portee de main',
        en: 'Your pharmacy at your fingertips',
        dz: 'I farmasi kera i bolo la',
    },
    heroSubtitle: {
        fr: 'Commandez vos medicaments, consultez un medecin et suivez vos livraisons — tout en un.',
        en: 'Order medicines, consult a doctor and track your deliveries — all in one.',
        dz: 'Fura soro, dokotor so ani i sorofenw laje — bee kelen na.',
    },
    // Navigation
    navHome: { fr: 'Accueil', en: 'Home', dz: 'Sugu' },
    navPharmacies: { fr: 'Pharmacies', en: 'Pharmacies', dz: 'Farmasiw' },
    navConsultation: { fr: 'Consultation', en: 'Consultation', dz: 'Dokotoroso' },
    navMedicines: { fr: 'Medicaments', en: 'Medicines', dz: 'Furaw' },
    navContact: { fr: 'Contact', en: 'Contact', dz: 'Weretaabolo' },
    // Auth
    login: { fr: 'Se connecter', en: 'Sign in', dz: 'Segin' },
    logout: { fr: 'Se deconnecter', en: 'Sign out', dz: 'Bo' },
    register: { fr: 'Creer un compte', en: 'Create account', dz: 'Konto ke' },
    // Common actions
    search: { fr: 'Rechercher', en: 'Search', dz: 'Yini' },
    order: { fr: 'Commander', en: 'Order', dz: 'Don' },
    cancel: { fr: 'Annuler', en: 'Cancel', dz: 'Bali' },
    confirm: { fr: 'Confirmer', en: 'Confirm', dz: 'Dafa' },
    back: { fr: 'Retour', en: 'Back', dz: 'Kosegi' },
    // Features
    featureDelivery: { fr: 'Livraison rapide', en: 'Fast delivery', dz: 'Labenaral siye la' },
    featureGuard: { fr: 'Pharmacies de garde', en: 'On-call pharmacies', dz: 'Farmasi sigilikela' },
    featureTeleconsult: { fr: 'Teleconsultation', en: 'Teleconsultation', dz: 'Dokotor weele' },
    featurePrescription: { fr: "Scanner d'ordonnance", en: 'Prescription scanner', dz: 'Sebe kalan' },
    // Footer
    footerRights: {
        fr: '© 2026 PharmaGo CI. Tous droits reserves.',
        en: '© 2026 PharmaGo CI. All rights reserved.',
        dz: '© 2026 PharmaGo CI. Hakew bee mara.',
    },
    // Dashboard
    dashWelcome: { fr: 'Bienvenue', en: 'Welcome', dz: 'Aw na soro' },
    dashOrders: { fr: 'Mes commandes', en: 'My orders', dz: 'N ka donw' },
    dashWallet: { fr: 'Mon portefeuille', en: 'My wallet', dz: 'N ka wariko' },
    // OCR Scanner
    scanTitle: { fr: 'Scanner une ordonnance', en: 'Scan a prescription', dz: 'Laje sebe' },
    scanUpload: { fr: 'Importer une image', en: 'Upload an image', dz: 'Jaayi ye' },
    scanCamera: { fr: 'Prendre une photo', en: 'Take a photo', dz: 'Jaayi ta' },
    scanAnalyzing: { fr: 'Analyse en cours…', en: 'Analyzing…', dz: 'Kalan be tuma la…' },
    scanResult: { fr: 'Medicaments detectes', en: 'Detected medications', dz: 'Furaw sorora' },
    // Parapharmacy
    paraTitle: { fr: 'Produits Parapharmacie', en: 'Parapharmacy Products', dz: 'Para-furaw' },
    paraSubtitle: { fr: 'Prenez soin de vous au meilleur prix', en: 'Take care of yourself at the best price', dz: 'I yere laka fura ye' },
    paraPromoTitle: { fr: 'Mois de la Sante & Beaute', en: 'Health & Beauty Month', dz: 'Kelenya ani Ceyelen kalo' },
    paraPromoDesc: { fr: "Jusqu'a -25% sur les vitamines et soins du visage.", en: 'Up to -25% on vitamins and face care.', dz: 'Dogo don 25% vitaminiw la.' },
    paraCategories: { fr: 'Categories', en: 'Categories', dz: 'Suguw' },
    catBaby: { fr: 'Bebe, enfant et maternite', en: 'Baby, child and maternity', dz: 'Denmisenn fura' },
    catTeeth: { fr: 'Bouche et dents', en: 'Mouth and teeth', dz: 'Da ani nyinn fura' },
    catHair: { fr: 'Cheveux', en: 'Hair care', dz: 'Kunsigi fura' },
    catBody: { fr: 'Corps', en: 'Body care', dz: 'Fari fura' },
    catMedical: { fr: 'Materiel medical', en: 'Medical equipment', dz: 'Dokotoro minanw' },
    catHealth: { fr: 'Sante', en: 'Health', dz: 'Kelenya' },
    catSexy: { fr: 'Sexualite et intimite', en: 'Sexuality and intimacy', dz: 'Muso ani tce ko' },
    catFace: { fr: 'Visage', en: 'Face care', dz: 'Nya fura' },
    catVeterinary: { fr: 'Veterinaire', en: 'Veterinary', dz: 'Bagon fura' },
} as const;

export type TranslationKey = keyof typeof translations;

// ─── Hook ─────────────────────────────────────────────────────────────────────
const STORAGE_KEY = 'pharma_lang';

function getInitialLang(): Lang {
    const saved = localStorage.getItem(STORAGE_KEY) as Lang | null;
    if (saved && saved in LANG_LABELS) return saved;
    const browser = navigator.language.split('-')[0] as Lang;
    return browser === 'en' ? 'en' : 'fr';
}

export function useI18n() {
    const [lang, setLangState] = useState<Lang>(getInitialLang);

    const setLang = useCallback((l: Lang) => {
        localStorage.setItem(STORAGE_KEY, l);
        setLangState(l);
    }, []);

    const t = useCallback(
        (key: TranslationKey): string => {
            return translations[key][lang] ?? translations[key]['fr'];
        },
        [lang],
    );

    return { lang, setLang, t, langs: LANG_LABELS, flags: LANG_FLAGS };
}

export default useI18n;
