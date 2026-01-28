# 🏥 Système de Synchronisation des Pharmacies de Garde - Abidjan

Solution complète pour synchroniser automatiquement les données des pharmacies de garde depuis [pratik-ci.com](https://pratik-ci.com/pharmacies-de-garde) vers votre application de livraison.

## 📋 Communes Couvertes

- Abobo
- Adjamé
- Anyama
- Attécoubé
- Bingerville
- Cocody
- Koumassi
- Marcory
- Plateau
- Port-Bouët
- Songon
- Treichville
- Yopougon

## 🚀 Installation

### Prérequis

```bash
# Python 3.8+
python3 --version

# Installer les dépendances
pip install -r requirements.txt
```

### Fichier requirements.txt

```
requests>=2.31.0
beautifulsoup4>=4.12.0
selenium>=4.15.0
flask>=3.0.0
flask-cors>=4.0.0
lxml>=4.9.0
```

### Installation de ChromeDriver (pour Selenium)

```bash
# Ubuntu/Debian
sudo apt-get update
sudo apt-get install chromium-chromedriver

# macOS
brew install chromedriver

# Vérifier l'installation
chromedriver --version
```

## 📁 Structure des Fichiers

```
pharmacie-garde-sync/
├── pharmacie_garde_sync.py    # Script principal de synchronisation
├── pharmacie_api.py            # API REST Flask
├── sync_cron.sh                # Script pour tâche cron
├── requirements.txt            # Dépendances Python
├── pharmacies_garde.db         # Base de données SQLite (auto-créée)
└── README.md                   # Cette documentation
```

## 🔧 Utilisation

### 1. Synchronisation Manuelle

```python
from pharmacie_garde_sync import PharmacieGardeSync

# Créer une instance
sync = PharmacieGardeSync()

# Synchronisation automatique (essaie API, puis Selenium, puis requests)
sync.sync(method="auto")

# Ou spécifier une méthode
sync.sync(method="selenium")  # Recommandé pour sites JavaScript
sync.sync(method="requests")  # Rapide mais limité
sync.sync(method="api")       # Si API disponible
```

### 2. Récupérer les Données

```python
# Toutes les pharmacies
from pharmacie_garde_sync import get_pharmacies_garde_api

data = get_pharmacies_garde_api()
print(f"Total: {data['count']} pharmacies")

# Pharmacies d'une commune spécifique
data = get_pharmacies_garde_api(commune="Cocody")
for pharmacie in data['pharmacies']:
    print(f"{pharmacie['nom']} - {pharmacie['adresse']}")
```

### 3. API REST

```bash
# Démarrer l'API
python pharmacie_api.py

# L'API sera disponible sur http://localhost:5000
```

#### Endpoints API

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| GET | `/api/pharmacies` | Toutes les pharmacies |
| GET | `/api/pharmacies/<commune>` | Pharmacies par commune |
| GET | `/api/pharmacies/search?q=nom` | Recherche |
| POST | `/api/pharmacies/nearest` | Plus proches (avec GPS) |
| GET | `/api/communes` | Liste des communes |
| POST | `/api/sync` | Forcer une synchronisation |
| GET | `/api/stats` | Statistiques |
| GET | `/api/health` | État du service |

#### Exemples d'Appels API

```bash
# Toutes les pharmacies
curl http://localhost:5000/api/pharmacies

# Pharmacies de Cocody
curl http://localhost:5000/api/pharmacies/Cocody

# Recherche
curl "http://localhost:5000/api/pharmacies/search?q=centrale"

# Pharmacies les plus proches (avec position GPS)
curl -X POST http://localhost:5000/api/pharmacies/nearest \
  -H "Content-Type: application/json" \
  -d '{
    "latitude": 5.359952,
    "longitude": -4.008256,
    "limit": 5
  }'

# Forcer une synchronisation
curl -X POST http://localhost:5000/api/sync \
  -H "Content-Type: application/json" \
  -d '{"method": "auto"}'

# Statistiques
curl http://localhost:5000/api/stats
```

### 4. Synchronisation Automatique avec Cron

```bash
# Rendre le script exécutable
chmod +x sync_cron.sh

# Éditer le crontab
crontab -e

# Ajouter une des lignes suivantes:

# Synchroniser 2 fois par jour (8h et 20h)
0 8,20 * * * /chemin/vers/sync_cron.sh

# Synchroniser toutes les 6 heures
0 */6 * * * /chemin/vers/sync_cron.sh

# Synchroniser tous les jours à minuit
0 0 * * * /chemin/vers/sync_cron.sh
```

## 🔌 Intégration dans Votre Application

### Option 1: Utiliser l'API REST

```javascript
// Exemple en JavaScript/React
async function getPharmaciesGarde(commune) {
  const response = await fetch(`http://localhost:5000/api/pharmacies/${commune}`);
  const data = await response.json();
  
  if (data.success) {
    return data.pharmacies;
  }
  return [];
}

// Utilisation
const pharmacies = await getPharmaciesGarde("Cocody");
console.log(pharmacies);
```

### Option 2: Accès Direct à la Base de Données

```python
import sqlite3

def get_pharmacies_from_db(commune=None):
    conn = sqlite3.connect('pharmacies_garde.db')
    cursor = conn.cursor()
    
    if commune:
        cursor.execute("""
            SELECT nom, adresse, telephone, quartier 
            FROM pharmacies_garde 
            WHERE commune = ?
        """, (commune,))
    else:
        cursor.execute("SELECT * FROM pharmacies_garde")
    
    results = cursor.fetchall()
    conn.close()
    
    return results
```

### Option 3: Export JSON

```python
# Exporter en JSON pour utilisation statique
sync = PharmacieGardeSync()
sync.export_to_json("pharmacies_garde.json")

# Ensuite dans votre app
import json

with open('pharmacies_garde.json', 'r') as f:
    data = json.load(f)
    pharmacies = data['pharmacies']
```

## 📊 Structure de la Base de Données

### Table `pharmacies_garde`

| Colonne | Type | Description |
|---------|------|-------------|
| id | INTEGER | Clé primaire |
| nom | TEXT | Nom de la pharmacie |
| commune | TEXT | Commune (Cocody, Abobo, etc.) |
| quartier | TEXT | Quartier |
| adresse | TEXT | Adresse complète |
| telephone | TEXT | Numéro de téléphone |
| date_garde | TEXT | Date de garde (YYYY-MM-DD) |
| horaires | TEXT | Horaires (ex: "24h/24") |
| latitude | REAL | Latitude GPS (optionnel) |
| longitude | REAL | Longitude GPS (optionnel) |
| derniere_maj | TIMESTAMP | Dernière mise à jour |

### Table `sync_history`

Historique des synchronisations pour monitoring.

## 🎯 Stratégies de Synchronisation

### Méthode 1: Selenium (Recommandée)
✅ Fonctionne avec JavaScript  
✅ Le plus fiable  
❌ Plus lent  
❌ Nécessite ChromeDriver  

**Usage:** Sites modernes avec chargement dynamique

### Méthode 2: Requests + BeautifulSoup
✅ Rapide  
✅ Léger  
❌ Ne fonctionne pas avec JavaScript  

**Usage:** Sites statiques simples

### Méthode 3: API REST
✅ Le plus rapide  
✅ Le plus fiable  
❌ Nécessite que pratik-ci.com expose une API  

**Usage:** Si disponible

### Mode Auto
Essaie les 3 méthodes dans l'ordre: API → Selenium → Requests

## 🔍 Dépannage

### Problème: Site bloque l'accès (403)

**Solution 1:** Utiliser Selenium au lieu de requests
```python
sync.sync(method="selenium")
```

**Solution 2:** Ajuster les headers dans le code
```python
headers = {
    'User-Agent': 'Mozilla/5.0...',
    'Referer': 'https://pratik-ci.com/'
}
```

### Problème: ChromeDriver non trouvé

```bash
# Installer ChromeDriver
sudo apt-get install chromium-chromedriver

# Ou télécharger manuellement
# https://chromedriver.chromium.org/downloads
```

### Problème: Sélecteurs CSS ne fonctionnent pas

1. Inspecter le site web réel
2. Identifier les bons sélecteurs CSS
3. Modifier dans `pharmacie_garde_sync.py`:

```python
# Exemple
nom = element.find_element(By.CLASS_NAME, "nom-reel-de-la-classe").text
```

### Problème: Base de données verrouillée

```bash
# Fermer toutes les connexions
pkill -f pharmacie_garde_sync.py

# Ou supprimer le fichier de lock
rm pharmacies_garde.db-journal
```

## 📈 Monitoring et Logs

### Logs de Synchronisation

```bash
# Voir les logs du cron
tail -f /var/log/pharmacie_garde_sync.log

# Historique de synchronisation en base
sqlite3 pharmacies_garde.db "SELECT * FROM sync_history ORDER BY date_sync DESC LIMIT 10;"
```

### Statistiques

```python
from pharmacie_garde_sync import PharmacieGardeSync

sync = PharmacieGardeSync()

# Via Python
import sqlite3
conn = sqlite3.connect('pharmacies_garde.db')
cursor = conn.cursor()
cursor.execute("SELECT commune, COUNT(*) FROM pharmacies_garde GROUP BY commune")
print(cursor.fetchall())

# Ou via API
# GET http://localhost:5000/api/stats
```

## 🔐 Sécurité

### Pour Production

1. **Ne pas exposer l'API publiquement sans authentification**

```python
# Ajouter une authentification simple
from functools import wraps
from flask import request

def require_api_key(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        api_key = request.headers.get('X-API-Key')
        if api_key != 'VOTRE_CLE_API_SECRETE':
            return jsonify({'error': 'Unauthorized'}), 401
        return f(*args, **kwargs)
    return decorated_function

@app.route('/api/sync', methods=['POST'])
@require_api_key
def force_sync():
    # ...
```

2. **Utiliser HTTPS en production**

3. **Limiter le taux de requêtes** (rate limiting)

## 🚀 Déploiement en Production

### Avec Gunicorn (recommandé)

```bash
# Installer Gunicorn
pip install gunicorn

# Démarrer l'API
gunicorn -w 4 -b 0.0.0.0:5000 pharmacie_api:app

# Avec systemd
sudo nano /etc/systemd/system/pharmacie-api.service
```

Contenu du fichier service:
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

```bash
# Activer et démarrer
sudo systemctl enable pharmacie-api
sudo systemctl start pharmacie-api
```

### Avec Docker

```dockerfile
FROM python:3.11-slim

WORKDIR /app

RUN apt-get update && apt-get install -y \
    chromium-driver \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 5000

CMD ["gunicorn", "-w", "4", "-b", "0.0.0.0:5000", "pharmacie_api:app"]
```

```bash
# Build
docker build -t pharmacie-garde-api .

# Run
docker run -d -p 5000:5000 pharmacie-garde-api
```

## 💡 Exemples d'Utilisation dans Votre App de Livraison

### 1. Afficher les Pharmacies de Garde par Commune

```javascript
// React/React Native
import React, { useState, useEffect } from 'react';

function PharmaciesGarde({ commune }) {
  const [pharmacies, setPharmacies] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`http://votre-serveur:5000/api/pharmacies/${commune}`)
      .then(res => res.json())
      .then(data => {
        setPharmacies(data.pharmacies);
        setLoading(false);
      });
  }, [commune]);

  if (loading) return <div>Chargement...</div>;

  return (
    <div>
      <h2>Pharmacies de garde - {commune}</h2>
      {pharmacies.map(p => (
        <div key={p.id} className="pharmacy-card">
          <h3>{p.nom}</h3>
          <p>📍 {p.adresse}</p>
          <p>📞 {p.telephone}</p>
          <button>Commander</button>
        </div>
      ))}
    </div>
  );
}
```

### 2. Trouver la Pharmacie la Plus Proche

```javascript
// Avec géolocalisation
async function findNearestPharmacy() {
  // Obtenir position utilisateur
  navigator.geolocation.getCurrentPosition(async (position) => {
    const { latitude, longitude } = position.coords;
    
    const response = await fetch('http://votre-serveur:5000/api/pharmacies/nearest', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ latitude, longitude, limit: 3 })
    });
    
    const data = await response.json();
    console.log('Pharmacies les plus proches:', data.pharmacies);
  });
}
```

### 3. Widget de Recherche

```javascript
async function searchPharmacies(query) {
  const response = await fetch(
    `http://votre-serveur:5000/api/pharmacies/search?q=${encodeURIComponent(query)}`
  );
  const data = await response.json();
  return data.pharmacies;
}

// Utilisation
const results = await searchPharmacies("centrale");
```

## 📞 Support

Pour toute question ou problème:

1. Vérifier les logs: `/var/log/pharmacie_garde_sync.log`
2. Tester l'API: `http://localhost:5000/api/health`
3. Vérifier la base de données: `sqlite3 pharmacies_garde.db ".tables"`

## 📝 Licence

MIT - Libre d'utilisation et de modification

## 🤝 Contribution

Les améliorations sont les bienvenues! N'hésitez pas à adapter le code selon vos besoins spécifiques.

---

**Note importante:** Le site pratik-ci.com peut modifier sa structure à tout moment. Si la synchronisation échoue, il faudra adapter les sélecteurs CSS dans le code pour correspondre à la nouvelle structure HTML.

**Conseil:** Commencez avec une synchronisation manuelle pour vérifier que tout fonctionne, puis activez la synchronisation automatique.
