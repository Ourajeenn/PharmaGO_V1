# 🏥 Pharmacies de Garde - Guide d'Intégration

## Vue d'ensemble

Le système de **Pharmacies de Garde** a été intégré dans l'application PharmaGo. Il permet de :
- ✅ Afficher toutes les pharmacies de garde d'Abidjan
- ✅ Filtrer par commune (13 communes couvertes)
- ✅ Rechercher par nom, quartier ou adresse
- ✅ Trouver les pharmacies les plus proches avec géolocalisation
- ✅ Appeler directement une pharmacie
- ✅ Obtenir l'itinéraire vers une pharmacie

## 📁 Fichiers Créés

### Frontend (React/TypeScript)
1. **`src/services/PharmacieGardeService.ts`** - Service API avec types TypeScript
2. **`src/hooks/usePharmaciesGarde.ts`** - Hooks React personnalisés
3. **`src/components/pharmacie-garde/PharmacieCard.tsx`** - Composant carte de pharmacie
4. **`src/pages/PharmaciesGardePage.tsx`** - Page principale
5. **Route ajoutée** : `/pharmacies-garde` dans `App.tsx`

### Backend (Python)
Les fichiers Python sont dans : `c:\Users\jenra\Downloads\PHARMA-GO_FINALE\DOSSIER_TECH_pharma\doc_pharcie de garde\`

## 🚀 Démarrage

### Étape 1 : Démarrer l'API Python

```bash
# Aller dans le dossier de l'API
cd "c:\Users\jenra\Downloads\PHARMA-GO_FINALE\DOSSIER_TECH_pharma\doc_pharcie de garde"

# Installer les dépendances Python
pip install -r requirements.txt

# Démarrer l'API
python pharmacie_api.py
```

L'API sera disponible sur : **http://localhost:5000**

### Étape 2 : L'Application React est déjà configurée

L'application React est déjà en cours d'exécution et configurée pour utiliser l'API.

### Étape 3 : Accéder à la Page

Ouvrez votre navigateur et allez sur :
```
http://localhost:8080/pharmacies-garde
```

## 📊 Endpoints API Disponibles

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| GET | `/api/pharmacies` | Toutes les pharmacies |
| GET | `/api/pharmacies/<commune>` | Pharmacies par commune |
| GET | `/api/pharmacies/search?q=nom` | Recherche |
| POST | `/api/pharmacies/nearest` | Plus proches (GPS) |
| GET | `/api/communes` | Liste des communes |
| POST | `/api/sync` | Synchronisation |
| GET | `/api/stats` | Statistiques |
| GET | `/api/health` | État du service |

## 🗺️ Communes Couvertes

1. Abobo
2. Adjamé
3. Anyama
4. Attécoubé
5. Bingerville
6. Cocody
7. Koumassi
8. Marcory
9. Plateau
10. Port-Bouët
11. Songon
12. Treichville
13. Yopougon

## 🎯 Fonctionnalités

### 1. Affichage des Pharmacies
- Grille responsive (1, 2 ou 3 colonnes selon l'écran)
- Cartes avec toutes les informations
- Badges colorés par commune

### 2. Recherche et Filtres
- **Recherche textuelle** : Par nom, quartier, adresse
- **Filtre par commune** : Dropdown avec toutes les communes
- **Badges actifs** : Affiche les filtres appliqués

### 3. Géolocalisation
- Bouton "Trouver les pharmacies les plus proches"
- Demande l'autorisation de géolocalisation
- Affiche les 5 pharmacies les plus proches
- Calcul de la distance en km

### 4. Actions sur les Pharmacies
- **Appeler** : Ouvre l'application téléphone
- **Itinéraire** : Ouvre Google Maps avec directions

### 5. Statistiques
- Total de pharmacies
- Nombre de communes
- Service 24h/24
- Disponibilité

## 🎨 Design

### Couleurs par Commune
- **Cocody** : Bleu
- **Plateau** : Violet
- **Marcory** : Vert
- **Yopougon** : Orange
- **Abobo** : Rouge
- **Adjamé** : Jaune
- **Treichville** : Rose
- **Koumassi** : Indigo
- **Port-Bouët** : Cyan
- **Attécoubé** : Teal
- **Bingerville** : Lime
- **Anyama** : Amber
- **Songon** : Rose

### Responsive
- **Mobile** : 1 colonne
- **Tablet** : 2 colonnes
- **Desktop** : 3 colonnes

## 🔧 Configuration

### Variables d'Environnement

Créez un fichier `.env` à la racine du projet React :

```env
VITE_PHARMACIE_GARDE_API_URL=http://localhost:5000/api
```

Pour la production, changez l'URL :
```env
VITE_PHARMACIE_GARDE_API_URL=https://votre-domaine.com/api
```

## 🐛 Dépannage

### Problème : L'API ne démarre pas

**Solution** :
```bash
# Vérifier que Python est installé
python --version

# Installer les dépendances
pip install flask flask-cors requests beautifulsoup4 selenium

# Redémarrer l'API
python pharmacie_api.py
```

### Problème : Erreur CORS

**Solution** : L'API a déjà `flask-cors` activé. Vérifiez que l'API tourne sur le bon port (5000).

### Problème : Géolocalisation ne fonctionne pas

**Solution** :
1. Vérifiez que vous utilisez HTTPS (ou localhost)
2. Autorisez la géolocalisation dans votre navigateur
3. Vérifiez les permissions du site

### Problème : Aucune pharmacie affichée

**Solution** :
1. Vérifiez que l'API Python est démarrée
2. Testez l'API : `http://localhost:5000/api/health`
3. Synchronisez les données : `POST http://localhost:5000/api/sync`

## 📱 Utilisation

### Rechercher une Pharmacie
1. Tapez dans la barre de recherche
2. Ou sélectionnez une commune
3. Les résultats se filtrent automatiquement

### Trouver les Plus Proches
1. Cliquez sur "Trouver les pharmacies les plus proches"
2. Autorisez la géolocalisation
3. Les 5 pharmacies les plus proches s'affichent avec la distance

### Appeler une Pharmacie
1. Cliquez sur le bouton "Appeler"
2. Votre application téléphone s'ouvre

### Obtenir l'Itinéraire
1. Cliquez sur le bouton "Itinéraire"
2. Google Maps s'ouvre avec les directions

## 🔄 Synchronisation des Données

L'API synchronise automatiquement les données toutes les 6 heures depuis pratik-ci.com.

Pour forcer une synchronisation :
```bash
curl -X POST http://localhost:5000/api/sync \
  -H "Content-Type: application/json" \
  -d '{"method": "auto"}'
```

## 📊 Statistiques

Accédez aux statistiques :
```bash
curl http://localhost:5000/api/stats
```

Réponse :
```json
{
  "success": true,
  "total_pharmacies": 156,
  "repartition_par_commune": [
    {"commune": "Cocody", "count": 25},
    {"commune": "Yopougon", "count": 20},
    ...
  ],
  "derniere_synchronisation": {
    "date": "2026-01-28T19:00:00",
    "nb_pharmacies": 156,
    "statut": "success"
  }
}
```

## 🚀 Déploiement en Production

### Option 1 : Docker

```bash
cd "c:\Users\jenra\Downloads\PHARMA-GO_FINALE\DOSSIER_TECH_pharma\doc_pharcie de garde"
docker-compose up -d
```

### Option 2 : Serveur Linux

```bash
# Installer Gunicorn
pip install gunicorn

# Démarrer l'API
gunicorn -w 4 -b 0.0.0.0:5000 pharmacie_api:app
```

### Option 3 : Service systemd

Créez `/etc/systemd/system/pharmacie-api.service` :
```ini
[Unit]
Description=Pharmacie Garde API
After=network.target

[Service]
User=www-data
WorkingDirectory=/chemin/vers/app
ExecStart=/usr/bin/gunicorn -w 4 -b 0.0.0.0:5000 pharmacie_api:app
Restart=always

[Install]
WantedBy=multi-user.target
```

Activez et démarrez :
```bash
sudo systemctl enable pharmacie-api
sudo systemctl start pharmacie-api
```

## 📝 Notes Importantes

1. **Données en temps réel** : Les données sont synchronisées depuis pratik-ci.com
2. **Géolocalisation** : Nécessite HTTPS en production
3. **Performance** : L'API utilise SQLite (pour production, migrer vers PostgreSQL)
4. **Sécurité** : Ajoutez une authentification pour les endpoints sensibles en production

## 🎁 Fonctionnalités Futures

- [ ] Notifications push pour nouvelles pharmacies
- [ ] Favoris utilisateur
- [ ] Historique des recherches
- [ ] Partage de pharmacie
- [ ] Évaluation et avis
- [ ] Carte interactive
- [ ] Mode hors ligne

---

**🎉 Le système de Pharmacies de Garde est maintenant intégré et fonctionnel !**

Pour démarrer :
1. Lancez l'API Python : `python pharmacie_api.py`
2. Accédez à : `http://localhost:8080/pharmacies-garde`
