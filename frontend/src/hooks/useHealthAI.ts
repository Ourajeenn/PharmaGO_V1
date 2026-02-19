/**
 * useHealthAI — Moteur IA local pour conseils santé
 * Fonctionne 100% hors-ligne, aucun appel réseau nécessaire
 * Contexte Côte d'Ivoire / Afrique de l'Ouest
 */

type Intent =
    | 'greeting'
    | 'order_tracking'
    | 'pharmacy_search'
    | 'medicine_info'
    | 'emergency'
    | 'prescription'
    | 'reminder'
    | 'malaria'
    | 'pain'
    | 'fever'
    | 'diabetes'
    | 'hypertension'
    | 'allergy'
    | 'delivery'
    | 'payment'
    | 'unknown';

interface AIResponse {
    message: string;
    suggestedChips?: string[];
}

// ─── Intent Detection ─────────────────────────────────────────────────────────

const intentPatterns: Record<Intent, RegExp> = {
    greeting: /\b(bonjour|salut|bonsoir|hello|hi|allô|allo)\b/i,
    order_tracking: /\b(commande|suivi|livraison|où est|tracker|colis|arrivée)\b/i,
    pharmacy_search: /\b(pharmacie|officine|garde|proche|autour|trouver)\b/i,
    medicine_info: /\b(médicament|ordonnance|posologie|dose|comprimé|sirop|prise|générique)\b/i,
    emergency: /\b(urgence|urgent|ambulance|pompier|hôpital|danger|grave|critique|samu|secours)\b/i,
    prescription: /\b(ordonnance|prescription|renouvellement|médecin|docteur|renouveler)\b/i,
    reminder: /\b(rappel|alarm|oublié|oubli|prise|planifier|programmer)\b/i,
    malaria: /\b(paludisme|malaria|palu|plasmodium|moustique|artémisinin|coartem)\b/i,
    pain: /\b(douleur|mal|douleurs|maux|tête|dos|ventre|abdomen|crampe|migraine)\b/i,
    fever: /\b(fièvre|température|chaud|frisson|transpiration|℃|°c|38|39|40)\b/i,
    diabetes: /\b(diabète|glycémie|insuline|sucre|glucose|hyperglycémie|metformine)\b/i,
    hypertension: /\b(tension|hypertension|pression|cardio|cœur|amlodipine|losartan)\b/i,
    allergy: /\b(allergie|allergique|démangeaison|urticaire|éruption|antihistaminique)\b/i,
    delivery: /\b(livrer|livraison|domicile|délai|heure|quand|retard)\b/i,
    payment: /\b(payer|paiement|orange money|wave|mtn|prix|coût|tarif|facture)\b/i,
    unknown: /.*/,
};

function detectIntent(text: string): Intent {
    const lower = text.toLowerCase();
    for (const [intent, pattern] of Object.entries(intentPatterns)) {
        if (intent === 'unknown') continue;
        if (pattern.test(lower)) return intent as Intent;
    }
    return 'unknown';
}

// ─── Response Database ────────────────────────────────────────────────────────

const responses: Record<Intent, AIResponse> = {
    greeting: {
        message: "Bonjour ! 👋 Je suis Leslie, votre assistant santé PharmaGo. Je peux vous aider avec vos commandes, trouver une pharmacie, vous conseiller sur vos médicaments ou répondre à vos questions de santé. Comment puis-je vous aider ?",
        suggestedChips: ["📦 Ma commande", "🏥 Pharmacie garde", "💊 Conseil médicament", "🆘 Urgence"],
    },

    order_tracking: {
        message: "Pour suivre votre commande, rendez-vous dans l'onglet **Suivi** de votre tableau de bord. Vous y verrez la position de votre livreur en temps réel sur la carte. Si vous avez un numéro de commande, vous pouvez aussi le saisir directement sur la page de suivi.",
        suggestedChips: ["📍 Voir sur la carte", "📞 Contacter le livreur", "⚠️ Signaler un problème"],
    },

    pharmacy_search: {
        message: "Je peux vous aider à trouver une pharmacie ! En Côte d'Ivoire, les pharmacies de garde sont accessibles 24h/24. Utilisez la carte PharmaGo pour localiser les pharmacies ouvertes autour de vous. Activez votre géolocalisation pour un résultat optimal. 📍",
        suggestedChips: ["🗺️ Ouvrir la carte", "🌙 Pharmacie de garde", "📞 Appeler une pharmacie"],
    },

    medicine_info: {
        message: "Pour toute information sur un médicament (posologie, effets secondaires, contre-indications), je vous recommande de consulter votre médecin ou pharmacien. Sur PharmaGo, recherchez le médicament dans la boutique pour voir sa fiche complète. ⚠️ Ne modifiez jamais votre traitement sans avis médical.",
        suggestedChips: ["🔍 Chercher un médicament", "📄 Envoyer une ordonnance", "👨‍⚕️ Consulter un médecin"],
    },

    emergency: {
        message: "🆘 **URGENCE MÉDICALE** — Appelez immédiatement le **185** (SAMU Côte d'Ivoire) ou le **18** (pompiers). Ne tardez pas. Si vous pouvez vous déplacer, le CHU de Cocody, le CHU de Treichville et la Clinique Farah ont des urgences 24h/24. PharmaGo peut aussi livrer des médicaments d'urgence en mode express.",
        suggestedChips: ["📞 Appeler le 185", "🏥 CHU le plus proche", "⚡ Livraison express"],
    },

    prescription: {
        message: "Pour renouveler votre ordonnance, utilisez la section **Renouvellement** dans votre tableau de bord. Vous pouvez scanner ou photographier votre ordonnance et la soumettre directement à votre médecin partenaire PharmaGo. Le délai de traitement est généralement de 24h.",
        suggestedChips: ["📸 Scanner ordonnance", "🔄 Renouveler", "👨‍⚕️ Contacter médecin"],
    },

    reminder: {
        message: "Les rappels de médicaments sont configurables dans l'onglet **Rappels** de votre tableau de bord. Vous pouvez définir des horaires personnalisés pour chaque traitement et recevoir des notifications push à l'heure souhaitée. 💊",
        suggestedChips: ["⏰ Configurer rappels", "💊 Mes traitements"],
    },

    malaria: {
        message: "⚠️ **Paludisme (Palu)** — Symptômes : fièvre, frissons, maux de tête, fatigue. Si vous suspectez un paludisme, **consultez immédiatement** un médecin pour un test TDR. Le traitement recommandé en Côte d'Ivoire est généralement à base d'artémisinine (Coartem, Artefan). N'automédiqiez pas. Prévenez avec une moustiquaire imprégnée.",
        suggestedChips: ["🏥 Trouver un médecin", "💊 Médicaments palu", "📞 SAMU 185"],
    },

    fever: {
        message: "🌡️ **Fièvre** — Pour une fièvre légère (38-38.5°C) : reposez-vous, hydratez-vous et prenez du paracétamol (1g tous les 6h pour un adulte). Pour une fièvre > 39°C ou persistant plus de 48h, consultez un médecin. En Côte d'Ivoire, toute fièvre peut être liée au paludisme — faites un test.",
        suggestedChips: ["💊 Commande Paracétamol", "🏥 Consulter médecin", "🦟 Test paludisme"],
    },

    pain: {
        message: "💊 **Douleurs** — Pour les douleurs légères à modérées, le paracétamol (Doliprane, Panadol) est souvent recommandé en première intention. L'ibuprofène (Advil, Nurofen) peut aider pour les douleurs inflammatoires mais est contre-indiqué en cas de grossesse et d'ulcère. Pour des douleurs intenses ou persistantes, consultez un médecin.",
        suggestedChips: ["💊 Commander antidouleur", "👨‍⚕️ Consulter", "🔍 Plus d'infos"],
    },

    diabetes: {
        message: "🩺 **Diabète** — Surveillez votre glycémie régulièrement. En Côte d'Ivoire, la Metformine et l'Insuline sont disponibles en pharmacie sur ordonnance. Adoptez une alimentation pauvre en sucres raffinés. Evitez le riz blanc en grande quantité, le pain blanc et les sodas. Consultez un endocrinologue pour un suivi adapté.",
        suggestedChips: ["📊 Saisir glycémie", "💊 Mes médicaments", "👨‍⚕️ Consulter spécialiste"],
    },

    hypertension: {
        message: "❤️ **Hypertension** — Objectif : tension < 130/80 mmHg. Limitez le sel, l'alcool et le tabac. Les médicaments courants en Côte d'Ivoire : Amlodipine, Losartan, Hydrochlorothiazide. Ne stoppez jamais votre traitement sans avis médical. Mesurez votre tension régulièrement.",
        suggestedChips: ["📏 Saisir tension", "💊 Renouveler traitement", "👨‍⚕️ Consulter cardiologue"],
    },

    allergy: {
        message: "🤧 **Allergie** — Pour les allergies légères (rhinite, urticaire) : les antihistaminiques de 2e génération (Cétirizine, Loratadine) sont disponibles sans ordonnance. Pour les réactions sévères (gonflement du visage, difficultés à respirer) : appelez le 185 immédiatement — c'est une urgence anaphylactique.",
        suggestedChips: ["💊 Antihistaminiques", "🆘 Urgence allergique", "📞 185"],
    },

    delivery: {
        message: "🛵 **Livraisons PharmaGo** — Délais habituels :\n• Standard : 45-90 minutes\n• Express : 20-30 minutes (+frais)\n• Nuit (20h-8h) : selon disponibilité du livreur\n\nVous recevrez une notification et pourrez suivre votre livreur en temps réel sur la carte.",
        suggestedChips: ["📦 Suivre ma commande", "⚡ Mode express", "📞 Contacter livreur"],
    },

    payment: {
        message: "💳 **Paiements acceptés sur PharmaGo** :\n• 🟠 Orange Money (`*144#`)\n• 🌊 Wave (`*222#`)\n• 📱 MTN Mobile Money (`*133#`)\n• 🔹 Moov Money (`*155#`)\n• 💵 Paiement à la livraison\n\nTous les paiements Mobile Money sont traités via notre simulateur USSD sécurisé.",
        suggestedChips: ["💳 Payer maintenant", "🔍 Voir ma facture"],
    },

    unknown: {
        message: "Bonne question ! Je suis votre assistant santé PharmaGo. Je peux vous aider avec : vos commandes, trouver une pharmacie, des conseils médicaux généraux (paludisme, fièvre, douleurs...), vos ordonnances ou vos paiements. Que souhaitez-vous savoir ? 😊",
        suggestedChips: ["📦 Ma commande", "🏥 Pharmacie garde", "💊 Conseil santé", "💳 Paiement"],
    },
};

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useHealthAI() {
    const getLocalResponse = (userMessage: string): AIResponse => {
        const intent = detectIntent(userMessage);
        return responses[intent] ?? responses.unknown;
    };

    return { getLocalResponse };
}

export default useHealthAI;
