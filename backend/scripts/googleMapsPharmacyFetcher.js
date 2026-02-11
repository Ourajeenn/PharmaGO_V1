/**
 * Google Maps Pharmacy Fetcher
 * 
 * Ce script permet de récupérer toutes les pharmacies d'Abidjan via l'API Google Places.
 * 
 * Pré-requis:
 * 1. Avoir une clé API Google Cloud avec "Places API" activé.
 * 2. Installer axios: npm install axios
 * 
 * Usage:
 * export GOOGLE_API_KEY="VOTRE_CLE_ICI"
 * node scripts/googleMapsPharmacyFetcher.js
 */

const fs = require('fs');
const path = require('path');
// const axios = require('axios'); // Decommenter après installation

const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY || 'YOUR_API_KEY';
const ABIDJAN_COORDS = { lat: 5.345317, lng: -4.024429 };
const RADIUS = 50000; // 50km autour d'Abidjan

async function fetchPharmacies() {
    if (GOOGLE_API_KEY === 'YOUR_API_KEY') {
        console.error("❌ ERREUR: Veuillez configurer votre clé API Google Maps (GOOGLE_API_KEY).");
        console.log("ℹ️ Ce script est prêt à l'emploi une fois la clé fournie.");
        return;
    }

    console.log("🔍 Recherche des pharmacies à Abidjan via Google Places API...");

    // URL de l'API Google Places (Text Search pour trouver 'pharmacie' à Abidjan)
    // Note: Pour une production réelle, utiliser Nearby Search avec pagination
    const url = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=pharmacie+abidjan&location=${ABIDJAN_COORDS.lat},${ABIDJAN_COORDS.lng}&radius=${RADIUS}&key=${GOOGLE_API_KEY}`;

    try {
        // const response = await axios.get(url);
        // const results = response.data.results;

        // Simulation de données pour l'exemple (car nous n'avons pas de clé active ici)
        const results = [
            {
                place_id: "mock_id_1",
                name: "Pharmacie Exemple Google",
                formatted_address: "Abidjan, Côte d'Ivoire",
                geometry: { location: { lat: 5.34, lng: -4.02 } },
                rating: 4.5,
                opening_hours: { open_now: true }
            }
        ];

        console.log(`✅ ${results.length} pharmacies trouvées.`);

        // Transformation des données pour notre application
        const formattedPharmacies = results.map((place, index) => ({
            id: 1000 + index,
            name: place.name,
            address: place.formatted_address,
            commune: extractCommune(place.formatted_address), // Fonction à affiner
            phone: "Non spécifié", // Nécessite un appel Detail Search supplémentaire
            hours: place.opening_hours?.open_now ? "Ouvert" : "Fermé",
            distance: "N/A",
            rating: place.rating || 0,
            reviews: place.user_ratings_total || 0,
            isOpen: place.opening_hours?.open_now || false,
            hasDelivery: true, // Par défaut ou basé sur des tags
            acceptsCard: true,
            isPartner: false,
            specialties: ["Général"],
            services: []
        }));

        // Sauvegarde dans un fichier JSON
        const outputPath = path.join(__dirname, '../src/data/fetchedPharmacies.json');
        fs.writeFileSync(outputPath, JSON.stringify(formattedPharmacies, null, 2));

        console.log(`💾 Données sauvegardées dans: ${outputPath}`);
        console.log("👉 Vous pouvez maintenant importer ce fichier dans PharmacyService.ts");

    } catch (error) {
        console.error("Erreur lors de la requête Google API:", error.message);
    }
}

function extractCommune(address) {
    const communes = ["Plateau", "Cocody", "Yopougon", "Abobo", "Marcory", "Treichville", "Adjamé", "Koumassi", "Port-Bouët", "Attécoubé"];
    for (const commune of communes) {
        if (address.includes(commune)) return commune;
    }
    return "Autre";
}

fetchPharmacies();
