# Extraction des Données AIRP - Guide d'Utilisation

Ce guide explique comment extraire et intégrer les données de médicaments depuis le site de l'AIRP (Autorité Ivoirienne de Régulation Pharmaceutique).

## 📊 Données Disponibles

L'extraction récupère **7,039 produits pharmaceutiques** depuis deux sources AIRP :

1. **Médicaments classiques** : 6,625 produits
   - URL : https://airp.ci/datapharma/liste-des-medicaments-enregistres

2. **Phytomédicaments et compléments alimentaires** : 414 produits
   - URL : https://airp.ci/datapharma/liste-des-phytomedicaments-enregistres-et-complenments-alimentaires

## 🔧 Prérequis

1. **Variables d'environnement** : Assurez-vous que votre fichier `.env` contient :
   ```env
   VITE_SUPABASE_URL=votre_url_supabase
   VITE_SUPABASE_ANON_KEY=votre_cle_anon_supabase
   ```

2. **Migration de base de données** : Appliquez d'abord la migration pour ajouter les champs AIRP :
   ```bash
   # Via Supabase CLI (si installé)
   supabase db push
   
   # OU manuellement via le dashboard Supabase
   # Copiez et exécutez le contenu de :
   # supabase/migrations/20251221_add_airp_medication_fields.sql
   ```

## 🚀 Installation des Dépendances

```bash
npm install
```

Cela installera automatiquement :
- `puppeteer` : Pour l'automatisation du navigateur
- `tsx` : Pour exécuter le script TypeScript
- `dotenv` : Pour charger les variables d'environnement

## ▶️ Exécution de l'Extraction

### Commande Simple

```bash
npm run extract-airp-data
```

### Ce que fait le script

1. ✅ Lance un navigateur headless (Puppeteer)
2. ✅ Navigue vers les deux pages AIRP
3. ✅ Sélectionne "Tous" pour afficher toutes les entrées
4. ✅ Extrait les données du tableau HTML
5. ✅ Transforme les dates au format ISO
6. ✅ Insère les données dans Supabase par lots de 100
7. ✅ Affiche un rapport de progression

### Sortie Attendue

```
🚀 Starting AIRP medication data extraction...
============================================================

🌐 Extracting medications from: https://airp.ci/datapharma/liste-des-medicaments-enregistres
⏳ Waiting for page to load...
📊 Loading all entries...
📥 Extracting data from table...
✅ Extracted 6625 medications

🌐 Extracting phytomedicines from: https://airp.ci/datapharma/liste-des-phytomedicaments-enregistres-et-complenments-alimentaires
⏳ Waiting for page to load...
📊 Loading all entries...
📥 Extracting data from table...
✅ Extracted 414 phytomedicines

📦 Total medications to insert: 7039

💾 Inserting 7039 medications into database...
✅ Inserted batch 1/71 (100/7039)
✅ Inserted batch 2/71 (200/7039)
...
✅ Inserted batch 71/71 (7039/7039)

📊 Summary:
   ✅ Successfully inserted: 7039
   ❌ Errors: 0
   📈 Total processed: 7039

✅ Extraction and insertion completed successfully!
============================================================
```

## 📋 Données Extraites

Pour chaque médicament, les informations suivantes sont capturées :

| Champ | Description | Exemple |
|-------|-------------|---------|
| `amm_number` | Numéro AMM | E-2015-335 |
| `amm_acquisition_date` | Date d'acquisition | 2015-07-29 |
| `amm_expiration_date` | Date d'expiration | 2020-07-29 |
| `name` | Dénomination complète | PARACETAMOL 500MG COMPRIME BOITE DE 20 |
| `dci` | Principes actifs | PARACETAMOL |
| `manufacturer` | Laboratoire titulaire | SANOFI |
| `country_of_origin` | Pays d'origine | FRANCE |
| `product_type` | Type de produit | medication / phytomedicine / supplement |
| `airp_source` | Source AIRP | true |

## ⚠️ Notes Importantes

1. **Durée d'exécution** : L'extraction complète peut prendre 5-10 minutes selon votre connexion internet

2. **Doublons** : Si vous exécutez le script plusieurs fois, des doublons peuvent être créés. Pour éviter cela :
   ```sql
   -- Supprimer les médicaments AIRP existants avant de réexécuter
   DELETE FROM medicines WHERE airp_source = true;
   ```

3. **Connexion requise** : Le script nécessite une connexion internet stable pour accéder au site AIRP

4. **Limites de taux** : Le script respecte les délais raisonnables pour ne pas surcharger le serveur AIRP

## 🔍 Vérification des Données

Après l'extraction, vérifiez les données dans Supabase :

```sql
-- Compter les médicaments par type
SELECT product_type, COUNT(*) 
FROM medicines 
WHERE airp_source = true 
GROUP BY product_type;

-- Vérifier quelques exemples
SELECT name, amm_number, manufacturer, country_of_origin 
FROM medicines 
WHERE airp_source = true 
LIMIT 10;
```

## 🐛 Dépannage

### Erreur : "Missing Supabase credentials"
- Vérifiez que votre fichier `.env` contient les bonnes variables

### Erreur : "Table medicines does not exist"
- Appliquez d'abord la migration de base de données

### Erreur : "Navigation timeout"
- Vérifiez votre connexion internet
- Le site AIRP peut être temporairement indisponible

### Erreur d'insertion Supabase
- Vérifiez les permissions RLS (Row Level Security)
- Assurez-vous que la clé API a les droits d'insertion

## 📞 Support

Pour toute question ou problème, consultez :
- Documentation Supabase : https://supabase.com/docs
- Documentation Puppeteer : https://pptr.dev/
