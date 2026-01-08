# Extraction des Pharmacies AIRP (Abidjan) - Guide d'Utilisation

Ce guide explique comment extraire et intégrer les données des pharmacies d'Abidjan depuis le site de l'AIRP.

## 📊 Données Disponibles

L'extraction récupère les **pharmacies d'Abidjan uniquement** depuis :
- URL : https://airp.ci/datapharma/liste-des-etablissements/officines-privees-de-pharmacie
- Filtre : Région ABIDJAN

## 🔧 Prérequis

1. **Variables d'environnement** : Assurez-vous que votre fichier `.env` contient :
   ```env
   VITE_SUPABASE_URL=votre_url_supabase
   VITE_SUPABASE_ANON_KEY=votre_cle_anon_supabase
   ```

2. **Migration de base de données** : Appliquez d'abord la migration pour ajouter les champs AIRP :
   ```bash
   # Via le dashboard Supabase
   # Copiez et exécutez le contenu de :
   # supabase/migrations/20251221_add_airp_pharmacy_fields.sql
   ```

## ▶️ Exécution de l'Extraction

### Commande Simple

```bash
npm run extract-airp-pharmacies
```

### Ce que fait le script

1. ✅ Lance un navigateur headless (Puppeteer)
2. ✅ Navigue vers la page AIRP des pharmacies
3. ✅ Utilise la recherche pour filtrer "ABIDJAN"
4. ✅ Sélectionne "Tous" pour afficher toutes les entrées filtrées
5. ✅ Extrait les données du tableau HTML (avec pagination)
6. ✅ Filtre pour ne garder que les pharmacies d'Abidjan
7. ✅ Insère les données dans Supabase par lots de 50
8. ✅ Affiche un rapport de progression

### Sortie Attendue

```
🚀 Starting AIRP Abidjan pharmacy data extraction...
============================================================

🌐 Extracting Abidjan pharmacies from AIRP...
⏳ Waiting for page to load...
🔍 Filtering for Abidjan pharmacies...
📊 Loading all Abidjan entries...
⏳ Waiting for all data to load...
📥 Extracting pharmacy data...
   Page 1: Extracted 50 Abidjan pharmacies (Total: 50)
   Page 2: Extracted 45 Abidjan pharmacies (Total: 95)
   ...
✅ Extracted XXX Abidjan pharmacies total

💾 Inserting XXX pharmacies into database...
✅ Inserted batch 1/X (50/XXX)
...

📊 Summary:
   ✅ Successfully inserted: XXX
   ❌ Errors: 0
   📈 Total processed: XXX

✅ Extraction and insertion completed successfully!
============================================================
```

## 📋 Données Extraites

Pour chaque pharmacie, les informations suivantes sont capturées :

| Champ | Description | Exemple |
|-------|-------------|---------|
| `region` | Région administrative | ABIDJAN |
| `department` | Département | ABIDJAN |
| `city` | Ville/Commune | COCODY |
| `category` | Catégorie | OFFICINES PRIVEES DE PHARMACIE |
| `name` | Nom de la pharmacie | PHARMACIE MODERNE D'ANGRE |
| `manager_name` | Gérant | KOUAME KOUASSI JEAN |
| `address` | Adresse | COCODY (ou adresse spécifique) |
| `airp_source` | Source AIRP | true |
| `verified` | Vérifiée | true |

## ⚠️ Notes Importantes

1. **Durée d'exécution** : L'extraction peut prendre 2-5 minutes selon le nombre de pharmacies

2. **Doublons** : Si vous exécutez le script plusieurs fois, des doublons peuvent être créés. Pour éviter cela :
   ```sql
   -- Supprimer les pharmacies AIRP existantes avant de réexécuter
   DELETE FROM pharmacies WHERE airp_source = true;
   ```

3. **Connexion requise** : Le script nécessite une connexion internet stable

4. **user_id nullable** : Les pharmacies AIRP n'ont pas de `user_id` car elles ne sont pas encore enregistrées dans l'application

## 🔍 Vérification des Données

Après l'extraction, vérifiez les données dans Supabase :

```sql
-- Compter les pharmacies AIRP par ville
SELECT city, COUNT(*) 
FROM pharmacies 
WHERE airp_source = true 
GROUP BY city
ORDER BY COUNT(*) DESC;

-- Voir quelques exemples
SELECT name, city, manager_name, region 
FROM pharmacies 
WHERE airp_source = true 
LIMIT 10;
```

## 🐛 Dépannage

### Erreur : "Missing Supabase credentials"
- Vérifiez que votre fichier `.env` contient les bonnes variables

### Erreur : "column user_id violates not-null constraint"
- Appliquez d'abord la migration qui rend `user_id` nullable

### Erreur : "Navigation timeout"
- Vérifiez votre connexion internet
- Le site AIRP peut être temporairement indisponible

### Pas de pharmacies extraites
- Vérifiez que le filtre "ABIDJAN" fonctionne
- Le script filtre également côté client pour garantir que seules les pharmacies d'Abidjan sont importées

## 📝 Prochaines Étapes

1. **Géolocalisation** : Ajouter les coordonnées GPS (latitude/longitude) pour chaque pharmacie
2. **Heures d'ouverture** : Compléter les horaires d'ouverture
3. **Photos** : Ajouter des photos des pharmacies
4. **Numéros de téléphone** : Compléter les contacts
5. **Pharmacies de garde** : Mettre à jour le statut `is_on_duty` selon le calendrier
