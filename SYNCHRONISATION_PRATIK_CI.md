# 🔄 Synchronisation Automatique avec Pratik-CI.com

## Vue d'ensemble

Ce système permet de synchroniser automatiquement les pharmacies de garde depuis **pratik-ci.com** vers votre application PharmaGo, garantissant des **données en temps réel**.

## 🎯 Objectif

- ✅ Récupérer les données réelles depuis pratik-ci.com
- ✅ Synchronisation automatique toutes les X heures
- ✅ Mise à jour en temps réel de votre application
- ✅ Contournement des blocages anti-bot (403)

## 📁 Fichiers de Synchronisation

### 1. **`pratik_scraper_advanced.py`**
Scraper avancé avec:
- Contournement anti-bot
- Selenium avec ChromeDriver automatique
- Sauvegarde HTML pour analyse
- Logging détaillé

### 2. **`pharmacie_api.py`**
API Flask qui:
- Sert les données aux clients
- Lance une synchronisation automatique toutes les 6h
- Expose les endpoints REST

### 3. **`pharmacie_garde_sync.py`**
Module de synchronisation avec:
- 3 méthodes de scraping (API, Selenium, Requests)
- Gestion de la base de données SQLite
- Historique des synchronisations

## 🚀 Configuration de la Synchronisation Automatique

### Méthode 1: Synchronisation intégrée à l'API (Recommandé)

L'API `pharmacie_api.py` lance automatiquement une synchronisation toutes les 6 heures.

**Modifier l'intervalle** dans `pharmacie_api.py`:
```python
# Ligne 26
AUTO_SYNC_INTERVAL = 6 * 3600  # 6 heures

# Pour synchroniser toutes les 2 heures:
AUTO_SYNC_INTERVAL = 2 * 3600  # 2 heures

# Pour synchroniser toutes les 30 minutes:
AUTO_SYNC_INTERVAL = 30 * 60  # 30 minutes
```

### Méthode 2: Tâche planifiée Windows

#### A. Créer un script batch `sync_pharmacies.bat`:
```batch
@echo off
cd "c:\Users\jenra\Downloads\PHARMA-GO_FINALE\DOSSIER_TECH_pharma\doc_pharcie de garde"
python pratik_scraper_advanced.py
```

#### B. Planifier avec le Planificateur de tâches Windows:

1. **Ouvrir le Planificateur de tâches** :
   - Appuyez sur `Win + R`
   - Tapez `taskschd.msc`
   - Appuyez sur Entrée

2. **Créer une nouvelle tâche** :
   - Clic droit sur "Bibliothèque du Planificateur de tâches"
   - Sélectionnez "Créer une tâche..."

3. **Onglet Général** :
   - Nom : `Sync Pharmacies Garde`
   - Description : `Synchronisation automatique des pharmacies de garde depuis pratik-ci.com`
   - Cochez "Exécuter même si l'utilisateur n'est pas connecté"

4. **Onglet Déclencheurs** :
   - Cliquez sur "Nouveau..."
   - Sélectionnez "Selon une planification"
   - Choisissez la fréquence :
     - **Quotidien** : Tous les jours à 6h00
     - **Répéter la tâche toutes les** : 6 heures
     - **Pendant** : Indéfiniment

5. **Onglet Actions** :
   - Cliquez sur "Nouveau..."
   - Action : "Démarrer un programme"
   - Programme/script : `C:\Users\jenra\Downloads\PHARMA-GO_FINALE\DOSSIER_TECH_pharma\doc_pharcie de garde\sync_pharmacies.bat`

6. **Onglet Conditions** :
   - Décochez "Démarrer la tâche uniquement si l'ordinateur est relié au secteur"
   - Cochez "Démarrer la tâche même si l'ordinateur fonctionne sur batterie"

7. **Cliquez sur OK**

### Méthode 3: Cron Job (Linux/Mac)

```bash
# Éditer le crontab
crontab -e

# Ajouter cette ligne pour synchroniser toutes les 6 heures
0 */6 * * * cd /chemin/vers/doc_pharcie\ de\ garde && python pratik_scraper_advanced.py

# Ou toutes les 2 heures
0 */2 * * * cd /chemin/vers/doc_pharcie\ de\ garde && python pratik_scraper_advanced.py
```

## 🔍 Analyse de la Structure du Site

Le scraper sauvegarde automatiquement:

1. **`pratik_ci_page.html`** - HTML complet de la page
2. **`pratik_ci_page.png`** - Capture d'écran de la page
3. **`pratik_ci_requests.html`** - HTML via requests

### Analyser la structure:

```python
# Ouvrir le fichier HTML sauvegardé
with open("pratik_ci_page.html", "r", encoding="utf-8") as f:
    html = f.read()

from bs4 import BeautifulSoup
soup = BeautifulSoup(html, 'html.parser')

# Chercher les pharmacies
pharmacies = soup.find_all('div', class_='nom-de-la-classe')
```

## 📊 Vérifier la Synchronisation

### 1. Vérifier le nombre de pharmacies:
```bash
python -c "import sqlite3; conn = sqlite3.connect('pharmacies_garde.db'); cursor = conn.cursor(); cursor.execute('SELECT COUNT(*) FROM pharmacies_garde'); print(f'Total: {cursor.fetchone()[0]} pharmacies')"
```

### 2. Voir l'historique des synchronisations:
```bash
python -c "import sqlite3; conn = sqlite3.connect('pharmacies_garde.db'); cursor = conn.cursor(); cursor.execute('SELECT * FROM sync_history ORDER BY date_sync DESC LIMIT 5'); [print(row) for row in cursor.fetchall()]"
```

### 3. Tester l'API:
```powershell
Invoke-WebRequest -Uri "http://localhost:5000/api/stats"
```

## 🛠️ Personnaliser le Scraper

### Adapter les sélecteurs CSS

Modifiez `pratik_scraper_advanced.py` ligne 90-96:

```python
patterns = [
    {'tag': 'div', 'class': 'votre-classe-ici'},
    {'tag': 'article', 'class': 'pharmacy-item'},
    # Ajoutez vos propres patterns
]
```

### Fonction de parsing personnalisée

Modifiez la fonction `parse_pharmacy_text()` ligne 120:

```python
def parse_pharmacy_text(self, text: str) -> Dict:
    """Parse le texte selon la structure réelle du site"""
    # Votre logique de parsing ici
    return {
        'nom': '...',
        'commune': '...',
        'quartier': '...',
        'adresse': '...',
        'telephone': '...',
    }
```

## 🔄 Forcer une Synchronisation Manuelle

### Via Python:
```bash
cd "c:\Users\jenra\Downloads\PHARMA-GO_FINALE\DOSSIER_TECH_pharma\doc_pharcie de garde"
python pratik_scraper_advanced.py
```

### Via l'API:
```powershell
Invoke-WebRequest -Uri "http://localhost:5000/api/sync" -Method POST -ContentType "application/json" -Body '{"method":"auto"}'
```

## 📝 Logs et Débogage

### Activer les logs détaillés:

Dans `pratik_scraper_advanced.py`, ligne 18:
```python
logging.basicConfig(level=logging.DEBUG)  # Au lieu de INFO
```

### Fichiers de log:

Créez un fichier de log:
```python
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('sync_pharmacies.log'),
        logging.StreamHandler()
    ]
)
```

## 🚨 Résolution des Problèmes

### Problème: Erreur 403 (Forbidden)

**Solutions**:
1. Le scraper avancé contourne déjà ce problème
2. Vérifiez que Selenium et ChromeDriver sont installés
3. Essayez d'augmenter les délais d'attente

### Problème: ChromeDriver non trouvé

**Solution**:
```bash
pip install webdriver-manager
```

Le scraper télécharge automatiquement ChromeDriver.

### Problème: Aucune pharmacie trouvée

**Solutions**:
1. Vérifiez les fichiers HTML sauvegardés
2. Analysez la structure du site
3. Adaptez les sélecteurs CSS
4. Vérifiez que le site est accessible

### Problème: Base de données verrouillée

**Solution**:
```bash
# Arrêter l'API
# Puis relancer la synchronisation
python pratik_scraper_advanced.py
```

## 📈 Monitoring de la Synchronisation

### Script de monitoring:

```python
import sqlite3
from datetime import datetime, timedelta

conn = sqlite3.connect('pharmacies_garde.db')
cursor = conn.cursor()

# Dernière synchronisation
cursor.execute("SELECT * FROM sync_history ORDER BY date_sync DESC LIMIT 1")
last_sync = cursor.fetchone()

if last_sync:
    print(f"Dernière sync: {last_sync[1]}")
    print(f"Pharmacies: {last_sync[2]}")
    print(f"Statut: {last_sync[3]}")
    
    # Vérifier si la sync est récente (< 7 heures)
    sync_date = datetime.fromisoformat(last_sync[1])
    if datetime.now() - sync_date > timedelta(hours=7):
        print("⚠️ ALERTE: Dernière synchronisation > 7 heures!")
else:
    print("❌ Aucune synchronisation trouvée")

conn.close()
```

## 🎯 Bonnes Pratiques

1. **Fréquence de synchronisation** :
   - Minimum : 2 heures (pour ne pas surcharger le site source)
   - Recommandé : 6 heures
   - Maximum : 24 heures

2. **Gestion des erreurs** :
   - Toujours vérifier les logs
   - Conserver un historique des synchronisations
   - Alertes en cas d'échec

3. **Performance** :
   - Utiliser SQLite pour le développement
   - Migrer vers PostgreSQL pour la production
   - Indexer les colonnes commune et date_garde

4. **Sécurité** :
   - Ne pas exposer l'endpoint `/api/sync` publiquement
   - Ajouter une authentification pour les endpoints sensibles
   - Limiter le taux de requêtes (rate limiting)

## 📚 Ressources

- **Documentation Selenium**: https://selenium-python.readthedocs.io/
- **BeautifulSoup**: https://www.crummy.com/software/BeautifulSoup/bs4/doc/
- **Flask**: https://flask.palletsprojects.com/
- **SQLite**: https://www.sqlite.org/docs.html

---

**🎉 Votre système est maintenant configuré pour se synchroniser automatiquement avec pratik-ci.com !**

Pour toute question ou problème, consultez les logs et les fichiers HTML sauvegardés.
