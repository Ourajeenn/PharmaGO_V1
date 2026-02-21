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
    | 'insurance'
    | 'location'
    | 'typhoid'
    | 'local_tips'
    | 'parapharmacy'
    | 'health_analysis'
    | 'unknown';

interface AIResponse {
    message: string;
    suggestedChips?: string[];
    isAlert?: boolean;
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
    insurance: /\b(assurance|mugef|gna|nsia|allianz|aig|tiers-payant|tiers payant)\b/i,
    location: /\b(abidjan|cocody|angré|angre|riviera|yopougon|yop|marcory|plateau|abobo|treichville|quartier|secteur)\b/i,
    typhoid: /\b(typhoïde|typhoide|widal|bactérie|eau contaminée)\b/i,
    local_tips: /\b(dioula|baoulé|baoule|langue|ethnie|dialecte|traduction|ivoirien|mousso|tché|kènègnè|kenegne)\b/i,
    parapharmacy: /\b(vitamine|complément|peau|cosmétique|savon|shampoing|bébé|lait|soin|beauté|crème|parapharmacie)\b/i,
    health_analysis: /\b(analyse|résultats|mesure|santé|bilan|données|état|comment va)\b/i,
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
        message: "Bonjour ! 👋 Je suis Leslie, votre assistant santé PharmaGo. Je peux vous conseiller sur vos médicaments, trouver une parapharmacie, analyser votre historique ou gérer vos **assurances (MUGEF-CI, NSIA, etc.)**. Comment puis-je vous aider ?",
        suggestedChips: ["📦 Ma commande", "🏥 Pharmacie garde", "🩸 Analyse santé", "🛡️ Assurances"],
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
        message: "💊 **Douleurs** — Pour les douleurs légères à modérées, le paracétamol (Doliprane, Panadol) est often recommandé en première intention. L'ibuprofène (Advil, Nurofen) peut aider pour les douleurs inflammatoires mais est contre-indiqué en cas de grossesse et d'ulcère. Pour des douleurs intenses ou persistantes, consultez un médecin.",
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

    insurance: {
        message: "PharmaGo accepte plusieurs assurances santé en Côte d'Ivoire : **MUGEF-CI**, **GNA Assurance**, **NSIA**, **Allianz**, et **AIG**. Pour utiliser votre assurance, scannez votre carte de tiers-payant dans votre profil. La prise en charge est instantanée pour les médicaments éligibles.",
        suggestedChips: ["🪪 Scanner ma carte", "📄 Liste médicaments éligibles", "🔍 Vérifier ma couverture"],
    },

    location: {
        message: "PharmaGo livre dans tout Abidjan ! Que vous soyez à **Cocody** (Angré, Riviera), **Yopougon**, **Marcory** (Zone 4), **Plateau** ou **Abobo**, nos livreurs vous trouvent grâce au GPS. Précisez votre quartier pour une estimation plus précise.",
        suggestedChips: ["📍 Ma position", "🚚 Délais par quartier", "🏥 Pharmacie à proximité"],
    },

    typhoid: {
        message: "🌡️ **Fièvre Typhoïde** — Symptômes : forte fièvre persistante, maux de tête, fatigue intense, douleurs abdominales. C'est une infection bactérienne sérieuse. **Consultez un médecin** pour un bilan sanguin (Widal). Le traitement nécessite des antibiotiques spécifiques. Hydratez-vous bien et évitez les aliments crus.",
        suggestedChips: ["👨‍⚕️ Voir un médecin", "💊 Antibiotiques prescrits", "🏥 Laboratoire proche"],
    },

    local_tips: {
        message: "PharmaGo se rapproche de vous ! Voici quelques conseils de santé dans nos langues locales :\n\n• **Dioula** : *'I ka kènègnè ?'* (Comment va ta santé ?) — Pensez à boire beaucoup de l'eau pendant l'harmattan.\n• **Baoulé** : *'A kènè kpa ?'* (Tu te portes bien ?) — N'oubliez pas de bien laver les fruits avant de manger.\n\nJe peux vous donner d'autres conseils si vous le souhaitez ! 😊",
        suggestedChips: ["🗣️ Plus de conseils", "🍎 Hygiène de vie"],
    },

    parapharmacy: {
        message: "Besoin de soins ? PharmaGo propose une large gamme de parapharmacie :\n• **Vitamines** (C, D, Zinc) pour booster l'immunité.\n• **Soins Bébé** (Lait, couches, crèmes de change).\n• **Dermocosmétique** (Savons médicaux, protections solaires).\n\nConsultez notre section **Parapharmacie** pour découvrir les promotions du moment ! ✨",
        suggestedChips: ["🧼 Voir la boutique", "👶 Espace Bébé", "🧴 Soins de la peau"],
    },

    health_analysis: {
        message: "Je peux analyser vos dernières mesures santé ! Jetez un œil à votre tableau de bord ou demandez-moi une analyse précise de votre tension ou glycémie. 📊",
        suggestedChips: ["🩸 Analyser ma tension", "🩸 Analyser ma glycémie", "📈 Voir tendances"],
    },

    unknown: {
        message: "Bonne question ! En tant qu'assistant PharmaGo, je peux analyser vos besoins basés sur votre historique d'achats (renouvellements, allergies) ou vous conseiller sur la parapharmacie. Que souhaitez-vous savoir ? 😊",
        suggestedChips: ["📦 Ma commande", "🏥 Pharmacie garde", "🧼 Parapharmacie", "🛡️ Assurances"],
    },
};

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useHealthAI() {
    /**
     * analyzeHealthData — Analyse metrics and return insights
     * @param metrics Dashboard health metrics
     */
    const analyzeHealthData = (metrics: any): AIResponse => {
        let message = "Voici l'analyse de vos dernières mesures santé : \n\n";
        let alertsCount = 0;
        const chips = ["🩺 Conseil prévention", "🏥 Prendre RDV"];

        // Blood Pressure Analysis
        if (metrics.blood_pressure?.value) {
            const [sys, dia] = metrics.blood_pressure.value.split('/').map(Number);
            if (sys > 140 || dia > 90) {
                message += "⚠️ **Hypertension détectée** : Votre tension est élevée (" + metrics.blood_pressure.value + "). Je vous recommande de vous reposer et de consulter un médecin si cela persiste.\n";
                alertsCount++;
            } else if (sys < 90) {
                message += "🟡 **Hypotension détectée** : Votre tension est basse. Pensez à bien vous hydrater.\n";
            } else {
                message += "✅ **Tension** : Optimale (" + metrics.blood_pressure.value + "). Continuez ainsi !\n";
            }
        }

        // Glucose Analysis
        if (metrics.glucose?.value) {
            const val = parseFloat(metrics.glucose.value);
            if (val > 1.26) {
                message += "⚠️ **Glycémie élevée** : Votre taux est de " + val + " g/L. Surveillez votre consommation de sucre.\n";
                alertsCount++;
            } else if (val < 0.7) {
                message += "🟡 **Hypoglycémie** : Votre taux est bas. Prenez une collation sucrée si vous ressentez une faiblesse.\n";
            } else {
                message += "✅ **Glycémie** : Normale.\n";
            }
        }

        // SpO2 Analysis
        if (metrics.spO2?.value) {
            const val = parseInt(metrics.spO2.value);
            if (val < 95) {
                message += "⚠️ **Saturation O2 basse** : Votre SpO2 est à " + val + "%. Si vous avez des difficultés respiratoires, contactez un médecin.\n";
                alertsCount++;
            } else {
                message += "✅ **Saturation O2** : Excellente (" + val + "%).\n";
            }
        }

        if (alertsCount === 0) {
            message += "\nGlobalement, vos paramètres sont excellents. PharmaGo est fier de votre assiduité ! 😊";
        }

        return {
            message,
            suggestedChips: chips,
            isAlert: alertsCount > 0
        };
    };

    /**
     * getLocalResponse — Get response from the local engine
     * @param userMessage Message from the user
     * @param context Optional patient context (name, allergies, metrics, etc.)
     */
    const getLocalResponse = (userMessage: string, context?: { name?: string; allergies?: string; metrics?: any }): AIResponse => {
        const intent = detectIntent(userMessage);

        // Priority to health analysis if metrics are present and intent is health_analysis
        if (intent === 'health_analysis' && context?.metrics) {
            return analyzeHealthData(context.metrics);
        }

        const response = { ...(responses[intent] ?? responses.unknown) };

        // Personalization: Inject name if available
        if (context?.name && response.message.includes("Bonjour !")) {
            response.message = response.message.replace("Bonjour !", `Bonjour **${context.name}** ! 👋`);
        }

        // Contextual warning: If user asks about medicine and has allergies
        if (intent === 'medicine_info' && context?.allergies) {
            response.message += `\n\n⚠️ **Rappel Allergies** : Votre profil indique des allergies à : *${context.allergies}*. Vérifiez bien la composition.`;
        }

        return response;
    };

    return { getLocalResponse, analyzeHealthData };
}

export default useHealthAI;
