/**
 * useHealthAI — Moteur IA local pour conseils santé
 * Fonctionne 100% hors-ligne
 * Phase 12 : Évolution vers une assistante empathique, proactive et orientée patient.
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
    | 'appointment_booking'
    | 'pharmacy_routing'
    | 'unknown';

interface AIResponse {
    message: string;
    suggestedChips?: string[];
    isAlert?: boolean;
    action?: 'NAVIGATE_PHARMACY' | 'NAVIGATE_CONSULTATION' | 'NAVIGATE_CART';
}

// ─── Intent Detection ─────────────────────────────────────────────────────────

const intentPatterns: Record<Intent, RegExp> = {
    greeting: /\b(bonjour|salut|bonsoir|hello|hi|allô|allo|coucou)\b/i,
    order_tracking: /\b(commande|suivi|livraison|où est|tracker|colis|arrivée)\b/i,
    pharmacy_search: /\b(pharmacie|officine|garde|proche|autour|trouver)\b/i,
    medicine_info: /\b(médicament|ordonnance|posologie|dose|comprimé|sirop|prise|générique)\b/i,
    emergency: /\b(urgence|urgent|ambulance|pompier|hôpital|danger|grave|critique|samu|secours|mal|sauver)\b/i,
    prescription: /\b(ordonnance|prescription|renouvellement|médecin|docteur|renouveler)\b/i,
    reminder: /\b(rappel|alarm|oublié|oubli|prise|planifier|programmer)\b/i,
    malaria: /\b(paludisme|malaria|palu|plasmodium|moustique|artémisinin|coartem)\b/i,
    pain: /\b(douleur|mal|douleurs|maux|tête|dos|ventre|abdomen|crampe|migraine|souffre|aie)\b/i,
    fever: /\b(fièvre|température|chaud|frisson|transpiration|℃|°c|38|39|40)\b/i,
    diabetes: /\b(diabète|glycémie|insuline|sucre|glucose|hyperglycémie|metformine)\b/i,
    hypertension: /\b(tension|hypertension|pression|cardio|cœur|amlodipine|losartan)\b/i,
    allergy: /\b(allergie|allergique|démangeaison|urticaire|éruption|antihistaminique|gratte)\b/i,
    delivery: /\b(livrer|livraison|domicile|délai|heure|quand|retard)\b/i,
    payment: /\b(payer|paiement|orange money|wave|mtn|prix|coût|tarif|facture)\b/i,
    insurance: /\b(assurance|mugef|gna|nsia|allianz|aig|tiers-payant|tiers payant)\b/i,
    location: /\b(abidjan|cocody|angré|angre|riviera|yopougon|yop|marcory|plateau|abobo|treichville|quartier|secteur)\b/i,
    typhoid: /\b(typhoïde|typhoide|widal|bactérie|eau contaminée)\b/i,
    local_tips: /\b(dioula|baoulé|baoule|langue|ethnie|dialecte|traduction|ivoirien|mousso|tché|kènègnè|kenegne)\b/i,
    parapharmacy: /\b(vitamine|complément|peau|cosmétique|savon|shampoing|bébé|lait|soin|beauté|crème|parapharmacie)\b/i,
    health_analysis: /\b(analyse|résultats|mesure|santé|bilan|données|état|comment va)\b/i,
    appointment_booking: /\b(rendez-vous|rdv|consulter|consultation|voir un médecin|spécialiste|prendre rdv|docteur|medecin|médecin|voir un docteur|prendre un rendez-vous|prendre un rdv)\b/i,
    pharmacy_routing: /\b(aller à|itinéraire|chemin|diriger|vers la pharmacie)\b/i,
    unknown: /.*/,
};

function detectIntent(text: string): Intent {
    const lower = text.toLowerCase();

    // Check multiple patterns to handle mixed intents. Return the most specific.
    // Order matters somewhat if multiple match, though realistically one will dominate.
    for (const [intent, pattern] of Object.entries(intentPatterns)) {
        if (intent === 'unknown') continue;
        if (pattern.test(lower)) return intent as Intent;
    }
    return 'unknown';
}

// ─── Response Database (Empathetic Persona) ───────────────────────────────────

const responses: Record<Intent, AIResponse> = {
    greeting: {
        message: "Bonjour ! 👋 Je suis Leslie, votre assistante santé. Je suis là pour veiller sur vous et faciliter vos démarches. Comment vous sentez-vous aujourd'hui ? Avez-vous besoin d'un conseil, de trouver un médicament ou de prendre un rendez-vous ?",
        suggestedChips: ["🤍 Je ne me sens pas bien", "🏥 Trouver une pharmacie", "🩺 Prendre RDV"],
    },

    order_tracking: {
        message: "Je vois que vous attendez une commande. Ne vous inquiétez pas, je veille dessus ! Vous pouvez suivre l'avancée de votre livraison directement depuis votre tableau de bord. Votre santé n'attend pas, nos livreurs font de leur mieux.",
        suggestedChips: ["📍 Voir sur la carte", "📞 Appeler mon livreur", "📦 Ma commande"],
    },

    pharmacy_search: {
        message: "Vous cherchez une pharmacie ? Je vais vous aider à trouver la plus proche, surtout en cas d'urgence. Nos pharmacies partenaires en Côte d'Ivoire sont prêtes à vous accueillir. Voulez-vous que je vous affiche la carte pour vous guider ?",
        suggestedChips: ["🗺️ Afficher les pharmacies", "🌙 Afficher celles de garde"],
        action: 'NAVIGATE_PHARMACY'
    },

    medicine_info: {
        message: "Je comprends que vous cherchez des informations sur votre traitement. C'est normal de se poser des questions ! Je peux vous donner des détails basiques, mais s'il vous plaît, ne modifiez jamais votre traitement sans en parler à votre médecin. Voulez-vous que je vous aide à contacter un spécialiste ?",
        suggestedChips: ["👨‍⚕️ Prendre RDV", "🔍 Chercher sur la boutique", "📄 Envoyer mon ordonnance"],
    },

    emergency: {
        message: "🆘 **S'IL VOUS PLAÎT, NE RESTEZ PAS SEUL.** Si c'est une urgence grave, **appelez tout de suite le 185 (SAMU)** ou le 18 (Pompiers). Votre vie est précieuse. Si vous pouvez être transporté, allez au CHU le plus proche.",
        suggestedChips: ["📞 Appeler le 185", "🏥 Trouver le CHU", "⚡ Urgence Livraison"],
        isAlert: true
    },

    prescription: {
        message: "Vous avez besoin de renouveler votre ordonnance ? Pas de souci, je vais vous guider. C'est important de ne pas interrompre votre traitement. Vous pouvez nous envoyer une photo de l'ordonnance et nous nous occupons du reste.",
        suggestedChips: ["📸 Envoyer mon ordonnance", "👨‍⚕️ Contacter mon médecin"],
    },

    reminder: {
        message: "Oublier de prendre ses médicaments, ça arrive à tout le monde ! C'est pour ça que je suis là. Voulez-vous qu'on programme des petits rappels ensemble pour que je vous prévienne au bon moment ?",
        suggestedChips: ["⏰ Configurer mes rappels", "💊 Voir mes traitements"],
    },

    malaria: {
        message: "⚠️ **Attention au Paludisme.** Si vous ressentez de la fièvre, des courbatures ou une grande fatigue, je vous conseille vivement de faire un test rapide. Le paludisme se soigne très bien quand il est pris à temps, mais il ne faut pas attendre. Je peux vous orienter vers une pharmacie pour un test ou un médecin.",
        suggestedChips: ["👨‍⚕️ Voir un médecin", "🏥 Aller en pharmacie", "📞 Urgence (185)"],
        isAlert: true
    },

    fever: {
        message: "🌡️ Oh mince, vous avez de la fièvre ? Surtout, reposez-vous bien et buvez beaucoup d'eau. Un peu de paracétamol peut aider à faire baisser la température, mais si ça persiste plus de 48h, il faudra consulter. Promettez-moi de veiller sur vous !",
        suggestedChips: ["💊 Commander du Paracétamol", "👨‍⚕️ Voir un médecin"],
    },

    pain: {
        message: "💊 Je suis désolée que vous ayez mal. La douleur n'est jamais agréable... Le paracétamol est souvent une bonne solution de base. Mais dites-moi, est-ce que cette douleur est inhabituelle ou très forte ? Si oui, il vaut mieux prendre l'avis d'un professionnel.",
        suggestedChips: ["💊 Trouver un antidouleur", "👨‍⚕️ Consulter un médecin"],
    },

    diabetes: {
        message: "🩺 Gérer le diabète demande de la rigueur, je sais que ce n'est pas toujours facile. N'oubliez pas de bien surveiller votre glycémie. Si vous avez besoin de renouveler votre metformine ou insuline, ou de conseils sur l'alimentation à Abidjan, je suis là.",
        suggestedChips: ["📊 Saisir ma glycémie", "👨‍⚕️ Voir mon spécialiste"],
    },

    hypertension: {
        message: "❤️ Votre cœur est précieux ! Surveillons cette tension ensemble. Pensez à lever le pied, éviter le stress et limiter le sel. Vous prenez bien votre traitement ? Ne l'arrêtez jamais sans l'accord de votre cardiologue.",
        suggestedChips: ["📏 Saisir ma tension", "👨‍⚕️ Prendre RDV Cardio"],
    },

    allergy: {
        message: "🤧 Une allergie, ça peut vite devenir très gênant. Un antihistaminique peut vous soulager. **Attention cependant :** si vous sentez que votre gorge gonfle ou que vous avez du mal à respirer, c'est une urgence, appelez immédiatement le 185 !",
        suggestedChips: ["💊 Trouver un anti-allergique", "🆘 Urgence (185)"],
    },

    delivery: {
        message: "🛵 J'ai hâte que vous receviez vos produits ! Nos livreurs font vite. D'habitude, c'est entre 45 et 90 minutes. Voulez-vous voir où en est le livreur actuellement ?",
        suggestedChips: ["📦 Où est ma commande ?", "⚡ Livraison express"],
    },

    payment: {
        message: "💳 Pour vous faciliter la vie, nous acceptons presque tout : Orange Money, Wave, MTN, Moov, ou même payer à la livraison si vous préférez ! C'est sécurisé et rapide.",
        suggestedChips: ["💳 Voir mes paiements", "🔒 Info sécurité"],
    },

    insurance: {
        message: "🛡️ Saviez-vous que vous pouviez utiliser votre assurance (MUGEF-CI, NSIA, etc.) sur PharmaGo ? C'est un droit, profitez-en ! Scannez juste votre carte depuis votre profil et nous nous occuperons du tiers-payant.",
        suggestedChips: ["🪪 Ajouter ma carte", "📋 Voir mes remboursements"],
    },

    location: {
        message: "📍 Que vous soyez à Cocody, Yopougon ou ailleurs à Abidjan, nous venons à vous. La santé doit être accessible partout. Où vous trouvez-vous exactement ?",
        suggestedChips: ["🗺️ Trouver des pharmacies proches", "🚚 Infos livraison par quartier"],
    },

    typhoid: {
        message: "🌡️ Aïe, la fièvre typhoïde fatigue énormément. Ce n'est pas à prendre à la légère. Il vous faut beaucoup de repos et un traitement adapté prescrit par un médecin. Assurez-vous de boire de l'eau en bouteille. Avez-vous déjà vu un docteur ?",
        suggestedChips: ["👨‍⚕️ Prendre RDV", "💊 Mes antibiotiques"],
    },

    local_tips: {
        message: "Oho, i ka kènègnè ? 😊 Chez nous, la santé passe aussi par nos habitudes locales. Protégez-vous bien de la poussière avec l'harmattan, et n'oubliez pas que même nos remèdes traditionnels doivent être pris avec prudence. Je peux vous en dire plus si vous voulez !",
        suggestedChips: ["🗣️ Raconte-moi", "🍎 Conseils nutrition"],
    },

    parapharmacy: {
        message: "✨ Prendre soin de soi, c'est aussi de la santé ! Besoin d'une bonne crème hydratante, de vitamines pour garder la forme ou de produits pour bébé ? Notre rayon parapharmacie est là pour vous chouchouter.",
        suggestedChips: ["🧼 Espace Beauté", "👶 Coin Bébé", "⚡ Vitamines"],
    },

    health_analysis: {
        message: "📊 C'est une excellente idée de suivre vos mesures sanguines et votre tension. Je peux y jeter un œil et vous donner mon avis préventif. Cela vous rassurera, et s'il y a un souci, je vous orienterai tout de suite vers votre médecin.",
        suggestedChips: ["🩸 Analyser mes données", "📈 Voir l'historique"],
    },

    appointment_booking: {
        message: "📅 Je peux absolument prendre rendez-vous pour vous ! Pour transmettre votre demande au médecin, pourriez-vous me préciser : \n\n1. Vos disponibilités (quel jour/quelle heure ?)\n2. La spécialité dont vous avez besoin ou vos symptômes actuels ?",
        suggestedChips: ["✅ Prendre RDV maintenant", "👨‍⚕️ Voir les spécialistes"],
        action: 'NAVIGATE_CONSULTATION'
    },

    pharmacy_routing: {
        message: "📍 Bien sûr, c'est important de savoir où aller ! Je vous affiche la carte interactive. Vous pourrez y voir les pharmacies les plus proches, y compris celles de garde en ce moment. Suivez le guide !",
        suggestedChips: ["🗺️ Ouvrir la carte", "🚶‍♂️ Y aller maintenant"],
        action: 'NAVIGATE_PHARMACY'
    },

    unknown: {
        message: "Pardonnez-moi, je veux être sûre de bien comprendre pour bien vous conseiller. Pourriez-vous reformuler ? N'oubliez pas que je suis là pour vous aider avec vos médicaments, vos consultations médicales ou la livraison.",
        suggestedChips: ["🩺 Prendre RDV", "📦 Suivre ma commande", "🏥 Trouver une pharmacie"],
    },
};

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useHealthAI() {
    /**
     * analyzeHealthData — Analyse metrics and return insights with empathy
     */
    const analyzeHealthData = (metrics: any, context?: any): AIResponse => {
        let message = "J'ai pris le temps de regarder vos dernières mesures santé. Voici ce que j'ai remarqué : \n\n";
        let alertsCount = 0;
        const chips = ["🩺 Demander conseil", "🏥 Prendre RDV", "📋 Historique"];

        if (metrics.blood_pressure?.value) {
            const [sys, dia] = metrics.blood_pressure.value.split('/').map(Number);
            const age = context?.age || 35;

            if (sys > 140 || dia > 90) {
                message += "⚠️ **Tension un peu élevée** (" + metrics.blood_pressure.value + "). On ne s'affole pas, mais ce serait bien d'en parler à un professionnel pour être tranquillisé(e). Essayez de vous reposer un instant.\n";
                alertsCount++;
            } else if (sys < 90) {
                message += "🟡 **Tension un peu basse**. Avez-vous bien mangé et bu de l'eau ? Allongez-vous quelques minutes si vous vous sentez faible.\n";
            } else {
                message += "✅ **Excellente tension** ! (" + metrics.blood_pressure.value + "). Continuez comme ça, c'est très rassurant.\n";
            }
        }

        if (metrics.glucose?.value) {
            const val = parseFloat(metrics.glucose.value);
            if (val > 1.26) {
                message += "⚠️ **Votre glycémie est un peu haute** (" + val + " g/L). Faites attention aux féculents et aux sucres aujourd'hui. N'hésitez pas à consulter si c'est régulier.\n";
                alertsCount++;
            } else if (val < 0.7) {
                message += "🟡 **Attention à l'hypoglycémie**. Prenez vite un petit quelque chose de sucré, comme un jus de fruit.\n";
            } else {
                message += "✅ **Glycémie au top !** Parfait.\n";
            }
        }

        if (alertsCount === 0) {
            message += "\n🌟 Tout me semble aller très bien ! Quel soulagement. Continuez de prendre soin de vous tout en n'oubliant pas de bien vous hydrater.";
        } else {
            message += "\n💡 *Petit rappel de Leslie : Je suis une intelligence artificielle. Mon rôle est de vous prévenir, mais seul un médecin peut poser un diagnostic. Prudence est mère de sûreté !*";
        }

        return {
            message,
            suggestedChips: chips,
            isAlert: alertsCount > 0
        };
    };

    /**
     * persistentMemory — Save and load user preferences to simulate "knowing" them
     */
    const updatePatientMemory = (userId: string, key: string, value: any) => {
        try {
            const memoryKey = `leslie_memory_${userId}`;
            const mem = JSON.parse(localStorage.getItem(memoryKey) || '{}');
            mem[key] = value;
            localStorage.setItem(memoryKey, JSON.stringify(mem));
        } catch (e) { console.error("Memory saving failed", e); }
    };

    const getPatientMemory = (userId: string) => {
        try {
            const memoryKey = `leslie_memory_${userId}`;
            return JSON.parse(localStorage.getItem(memoryKey) || '{}');
        } catch { return {}; }
    };

    /**
     * submitFeedback — Enregistrer le retour utilisateur
     */
    const submitFeedback = async (score: number, comment?: string) => {
        console.log(`Leslie Feedback: ${score}/5 - ${comment || 'No comment'}`);
    };

    /**
     * getLocalResponse — Get response from the local engine with deep personalization
     */
    const getLocalResponse = (userMessage: string, context?: { id?: string; name?: string; allergies?: string; metrics?: any }): AIResponse => {
        const intent = detectIntent(userMessage);

        if (intent === 'health_analysis' && context?.metrics) {
            return analyzeHealthData(context.metrics, context);
        }

        const response = { ...(responses[intent] ?? responses.unknown) };
        const lowerMessage = userMessage.toLowerCase();

        // 1. Apprendre de la conversation (Mémoire)
        if (context?.id) {
            if (lowerMessage.includes("suis allergique") || lowerMessage.includes("fait mal") || lowerMessage.includes("je préfère")) {
                updatePatientMemory(context.id, 'last_concern', userMessage);
            }
        }

        // 2. Personnalisation profonde (Intégrer le nom)
        if (context?.name && response.message.includes("Bonjour !")) {
            const memory = context?.id ? getPatientMemory(context.id) : {};
            let welcomeExtension = "";

            if (memory.last_concern) {
                welcomeExtension = ` Comment allez-vous depuis la dernière fois ? J'espère que ça va mieux. `;
            }

            response.message = response.message.replace(
                "Bonjour !",
                `Bonjour **${context.name}** ! 👋${welcomeExtension}`
            );
        }

        // 3. Alerte Allergies très prononcée (Empathie)
        if (intent === 'medicine_info' && context?.allergies) {
            response.message += `\n\n🚨 **ATTENTION :** Je tiens à vous rappeler que j'ai noté une allergie à : *${context.allergies}* sur votre profil. S'il vous plaît, vérifiez *absolument* l'étiquette avant de prendre quoi que ce soit. Je ne veux pas qu'il vous arrive malheur.`;
            response.isAlert = true;
        }

        return response;
    };

    return { getLocalResponse, analyzeHealthData, submitFeedback, updatePatientMemory, getPatientMemory };
}

export default useHealthAI;

