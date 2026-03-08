/**
 * Script de Rétention: Rappel de Traitement Chronique (PharmaGo+)
 * 
 * À configurer avec un Cron Job (ex: GitHub Actions, Supabase Cron via pg_cron, ou Vercel Cron)
 * S'exécute chaque jour à 09:00 AM.
 */

import { createClient } from '@supabase/supabase-js';

// Configuration
const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function runRetentionCron() {
    console.log("🚀 Lancement du traitement de rétention (Rappels de traitements chroniques)");

    try {
        // 1. Trouver les commandes passées il y a exactement 27 jours 
        // (En assumant un traitement standard de 30 jours, on relance à T-3)
        const targetDate = new Date();
        targetDate.setDate(targetDate.getDate() - 27);

        const startOfDay = new Date(targetDate.setHours(0, 0, 0, 0)).toISOString();
        const endOfDay = new Date(targetDate.setHours(23, 59, 59, 999)).toISOString();

        // Récupération des patients ayant des "Traitements continus"
        const { data: pastOrders, error: orderError } = await supabase
            .from('orders')
            .select(`
                id, 
                patient_id, 
                created_at,
                items:order_items(medicine_id, medicine:medicines(name, is_chronic))
            `)
            .gte('created_at', startOfDay)
            .lte('created_at', endOfDay)
            .eq('status', 'delivered');

        if (orderError) throw orderError;

        if (!pastOrders || pastOrders.length === 0) {
            console.log("ℹ️ Aucune commande ne requiert de renouvellement aujourd'hui.");
            return;
        }

        console.log(`🔍 Vérification de ${pastOrders.length} commande(s) potentiellement chroniques...`);

        // 2. Traitement des relances
        for (const order of pastOrders) {
            // Identifier les médicaments chroniques dans cette commande
            const chronicMedicines = order.items
                .map((item: any) => item.medicine)
                .filter((med: any) => med && med.is_chronic); // Assumant l'existence d'un flag is_chronic

            if (chronicMedicines.length > 0) {
                const medNames = chronicMedicines.map((m: any) => m.name).join(', ');

                console.log(`🔔 Envoi notification au patient ${order.patient_id} pour [${medNames}]`);

                // 3. Insérer une notification interne (In-App)
                await supabase.from('notifications').insert({
                    user_id: order.patient_id,
                    title: 'Rappel de Renouvellement 💊',
                    message: `Il ne vous reste que 3 jours de traitement pour : ${medNames}. Renouvelez en 1 clic !`,
                    type: 'info',
                    metadata: { cta_link: '/cart/renew', reference_order: order.id }
                });

                // 4. (Optionnel) Déclencher une Push Notification via OneSignal / FCM
                // Ici on simulerait l'appel à l'API Firebase Cloud Messaging 
                // en utilisant le fcm_tokens de la table profil de ce patient.
                /*
                const { data: tokens } = await supabase.from('fcm_tokens').select('token').eq('user_id', order.patient_id);
                if (tokens && tokens.length > 0) {
                    await sendFCMNotification(tokens[0].token, 'Rappel de Renouvellement 💊', `Renouvelez : ${medNames}`);
                }
                */
            }
        }

        console.log("✅ Traitement des rappels terminé avec succès.");

    } catch (error) {
        console.error("❌ Erreur critique lors de l'exécution du CRON :", error);
        process.exit(1);
    }
}

// Execution
runRetentionCron();
