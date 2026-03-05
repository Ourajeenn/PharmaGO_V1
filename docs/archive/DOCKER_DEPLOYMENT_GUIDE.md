# 🐳 Guide de Déploiement Docker - Pharmacies de Garde

## Vue d'ensemble

Ce guide vous permet de déployer l'API Pharmacies de Garde avec **Docker** pour une mise en production facile et portable.

---

## 📋 Prérequis

### Windows
- **Docker Desktop** : https://www.docker.com/products/docker-desktop/
- **WSL 2** (recommandé) : https://docs.microsoft.com/en-us/windows/wsl/install

### Linux/Mac
- **Docker** : https://docs.docker.com/get-docker/
- **Docker Compose** : https://docs.docker.com/compose/install/

---

## 📁 Fichiers Docker

### 1. **Dockerfile**
Construit l'image de l'API avec:
- ✅ Python 3.11
- ✅ Chromium + ChromeDriver (pour Selenium)
- ✅ SQLite
- ✅ Gunicorn (serveur WSGI)
- ✅ Healthcheck automatique

### 2. **docker-compose.yml**
Orchestre le déploiement avec:
- ✅ Configuration des ports
- ✅ Volumes persistants
- ✅ Variables d'environnement
- ✅ Restart automatique

---

## 🚀 Déploiement Rapide

### Méthode 1: Docker Compose (Recommandé)

```bash
# Aller dans le dossier
cd "c:\Users\jenra\Downloads\PHARMA-GO_FINALE\DOSSIER_TECH_pharma\doc_pharcie de garde"

# Construire et démarrer
docker-compose up -d

# Vérifier les logs
docker-compose logs -f

# Arrêter
docker-compose down
```

### Méthode 2: Docker seul

```bash
# Construire l'image
docker build -t pharmacie-garde-api .

# Démarrer le conteneur
docker run -d \
  --name pharmacie-api \
  -p 5000:5000 \
  -v $(pwd)/data:/app/data \
  pharmacie-garde-api

# Vérifier les logs
docker logs -f pharmacie-api

# Arrêter
docker stop pharmacie-api
docker rm pharmacie-api
```

---

## 🔧 Configuration

### Variables d'Environnement

Créez un fichier `.env` dans le même dossier que `docker-compose.yml`:

```env
# Port de l'API
API_PORT=5000

# Intervalle de synchronisation (en secondes)
SYNC_INTERVAL=21600  # 6 heures

# Niveau de log
LOG_LEVEL=INFO

# Base de données
DB_PATH=/app/data/pharmacies_garde.db
```

### Modifier docker-compose.yml

```yaml
version: '3.8'

services:
  pharmacie-api:
    build: .
    container_name: pharmacie-garde-api
    ports:
      - "${API_PORT:-5000}:5000"
    volumes:
      - ./data:/app/data
    environment:
      - SYNC_INTERVAL=${SYNC_INTERVAL:-21600}
      - LOG_LEVEL=${LOG_LEVEL:-INFO}
      - DB_PATH=${DB_PATH:-/app/data/pharmacies_garde.db}
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "python", "-c", "import requests; requests.get('http://localhost:5000/api/health')"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s
```

---

## 📊 Vérification du Déploiement

### 1. Vérifier que le conteneur tourne

```bash
docker ps
```

Vous devriez voir:
```
CONTAINER ID   IMAGE                    STATUS         PORTS
abc123def456   pharmacie-garde-api      Up 2 minutes   0.0.0.0:5000->5000/tcp
```

### 2. Tester l'API

```bash
# Health check
curl http://localhost:5000/api/health

# Pharmacies
curl http://localhost:5000/api/pharmacies

# Statistiques
curl http://localhost:5000/api/stats
```

### 3. Voir les logs

```bash
# Logs en temps réel
docker-compose logs -f

# Dernières 100 lignes
docker-compose logs --tail=100

# Logs d'un service spécifique
docker-compose logs -f pharmacie-api
```

---

## 🔄 Gestion du Conteneur

### Démarrer/Arrêter

```bash
# Démarrer
docker-compose start

# Arrêter
docker-compose stop

# Redémarrer
docker-compose restart

# Arrêter et supprimer
docker-compose down
```

### Mettre à jour

```bash
# Reconstruire l'image
docker-compose build

# Redémarrer avec la nouvelle image
docker-compose up -d

# Ou en une commande
docker-compose up -d --build
```

### Accéder au conteneur

```bash
# Shell interactif
docker-compose exec pharmacie-api /bin/bash

# Exécuter une commande
docker-compose exec pharmacie-api python -c "import sqlite3; print('DB OK')"
```

---

## 💾 Gestion des Données

### Volumes Persistants

Les données sont sauvegardées dans `./data/`:
- `pharmacies_garde.db` - Base de données SQLite
- Logs de synchronisation
- Fichiers HTML sauvegardés

### Sauvegarder les Données

```bash
# Créer un backup
docker-compose exec pharmacie-api sqlite3 /app/data/pharmacies_garde.db ".backup /app/data/backup.db"

# Copier le backup localement
docker cp pharmacie-garde-api:/app/data/backup.db ./backup_$(date +%Y%m%d).db
```

### Restaurer les Données

```bash
# Copier le backup dans le conteneur
docker cp ./backup.db pharmacie-garde-api:/app/data/backup.db

# Restaurer
docker-compose exec pharmacie-api sqlite3 /app/data/pharmacies_garde.db ".restore /app/data/backup.db"
```

---

## 🌐 Déploiement en Production

### 1. Serveur Cloud (AWS, Azure, GCP)

#### A. Installer Docker sur le serveur

```bash
# Ubuntu/Debian
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Installer Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/download/v2.20.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
```

#### B. Transférer les fichiers

```bash
# Depuis votre machine locale
scp -r "c:\Users\jenra\Downloads\PHARMA-GO_FINALE\DOSSIER_TECH_pharma\doc_pharcie de garde" user@serveur:/opt/pharmacie-api/
```

#### C. Démarrer sur le serveur

```bash
ssh user@serveur
cd /opt/pharmacie-api
docker-compose up -d
```

### 2. Nginx Reverse Proxy

Créez `/etc/nginx/sites-available/pharmacie-api`:

```nginx
server {
    listen 80;
    server_name api.votre-domaine.com;

    location / {
        proxy_pass http://localhost:5000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Activez et redémarrez Nginx:

```bash
sudo ln -s /etc/nginx/sites-available/pharmacie-api /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### 3. SSL avec Let's Encrypt

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d api.votre-domaine.com
```

### 4. Monitoring avec Portainer

```bash
docker run -d \
  -p 9000:9000 \
  --name portainer \
  --restart=always \
  -v /var/run/docker.sock:/var/run/docker.sock \
  -v portainer_data:/data \
  portainer/portainer-ce
```

Accédez à `http://votre-serveur:9000`

---

## 🔐 Sécurité

### 1. Limiter l'accès à l'API

Dans `docker-compose.yml`:

```yaml
environment:
  - API_KEY=votre-cle-secrete-ici
```

Dans `pharmacie_api.py`, ajoutez:

```python
from functools import wraps
from flask import request, jsonify
import os

def require_api_key(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        api_key = request.headers.get('X-API-Key')
        if api_key != os.getenv('API_KEY'):
            return jsonify({'error': 'Invalid API key'}), 401
        return f(*args, **kwargs)
    return decorated_function

# Protéger les endpoints sensibles
@app.route('/api/sync', methods=['POST'])
@require_api_key
def force_sync():
    # ...
```

### 2. Rate Limiting

Installez Flask-Limiter:

```bash
pip install Flask-Limiter
```

Dans `pharmacie_api.py`:

```python
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address

limiter = Limiter(
    app=app,
    key_func=get_remote_address,
    default_limits=["200 per day", "50 per hour"]
)

@app.route('/api/pharmacies')
@limiter.limit("10 per minute")
def get_all_pharmacies():
    # ...
```

### 3. CORS Sécurisé

Dans `pharmacie_api.py`:

```python
from flask_cors import CORS

CORS(app, resources={
    r"/api/*": {
        "origins": ["https://votre-domaine.com"],
        "methods": ["GET", "POST"],
        "allow_headers": ["Content-Type", "X-API-Key"]
    }
})
```

---

## 📈 Monitoring et Logs

### 1. Logs Centralisés

Créez `docker-compose.override.yml`:

```yaml
version: '3.8'

services:
  pharmacie-api:
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"
```

### 2. Prometheus + Grafana

Ajoutez à `docker-compose.yml`:

```yaml
  prometheus:
    image: prom/prometheus
    volumes:
      - ./prometheus.yml:/etc/prometheus/prometheus.yml
    ports:
      - "9090:9090"

  grafana:
    image: grafana/grafana
    ports:
      - "3000:3000"
    environment:
      - GF_SECURITY_ADMIN_PASSWORD=admin
```

### 3. Alertes

Configurez des alertes pour:
- Conteneur arrêté
- Healthcheck échoué
- Synchronisation échouée
- Espace disque faible

---

## 🐛 Dépannage

### Problème: Le conteneur ne démarre pas

```bash
# Voir les logs détaillés
docker-compose logs pharmacie-api

# Vérifier la configuration
docker-compose config

# Reconstruire sans cache
docker-compose build --no-cache
```

### Problème: Erreur de permissions

```bash
# Donner les permissions au dossier data
chmod -R 777 ./data

# Ou changer le propriétaire
sudo chown -R 1000:1000 ./data
```

### Problème: Port déjà utilisé

```bash
# Trouver le processus utilisant le port 5000
netstat -ano | findstr :5000

# Changer le port dans docker-compose.yml
ports:
  - "5001:5000"  # Utiliser le port 5001 au lieu de 5000
```

### Problème: Base de données verrouillée

```bash
# Arrêter tous les conteneurs
docker-compose down

# Supprimer le fichier de lock
rm ./data/pharmacies_garde.db-journal

# Redémarrer
docker-compose up -d
```

---

## 📊 Commandes Utiles

### Docker

```bash
# Voir les images
docker images

# Supprimer les images inutilisées
docker image prune -a

# Voir l'utilisation des ressources
docker stats

# Inspecter un conteneur
docker inspect pharmacie-garde-api

# Copier des fichiers
docker cp pharmacie-garde-api:/app/data/pharmacies_garde.db ./local_backup.db
```

### Docker Compose

```bash
# Voir les services
docker-compose ps

# Voir les logs en temps réel
docker-compose logs -f --tail=100

# Redémarrer un service spécifique
docker-compose restart pharmacie-api

# Mettre à l'échelle (plusieurs instances)
docker-compose up -d --scale pharmacie-api=3
```

---

## 🎯 Checklist de Déploiement

### Avant le déploiement
- [ ] Tester localement avec Docker
- [ ] Vérifier les variables d'environnement
- [ ] Configurer les volumes persistants
- [ ] Tester les backups
- [ ] Configurer le monitoring

### Déploiement
- [ ] Transférer les fichiers sur le serveur
- [ ] Construire l'image Docker
- [ ] Démarrer les conteneurs
- [ ] Vérifier les healthchecks
- [ ] Tester tous les endpoints

### Après le déploiement
- [ ] Configurer Nginx reverse proxy
- [ ] Installer SSL (Let's Encrypt)
- [ ] Configurer les alertes
- [ ] Documenter les procédures
- [ ] Former l'équipe

---

## 📚 Ressources

- **Docker Documentation** : https://docs.docker.com/
- **Docker Compose** : https://docs.docker.com/compose/
- **Gunicorn** : https://gunicorn.org/
- **Nginx** : https://nginx.org/en/docs/
- **Let's Encrypt** : https://letsencrypt.org/

---

## 🎉 Conclusion

Votre API Pharmacies de Garde est maintenant prête pour le déploiement Docker !

### Commandes rapides :

```bash
# Démarrer
docker-compose up -d

# Voir les logs
docker-compose logs -f

# Arrêter
docker-compose down
```

### Accès :
- **API** : `http://localhost:5000`
- **Health** : `http://localhost:5000/api/health`
- **Stats** : `http://localhost:5000/api/stats`

---

**Créé le** : 28 janvier 2026  
**Version** : 1.0.0  
**Statut** : ✅ Production Ready
