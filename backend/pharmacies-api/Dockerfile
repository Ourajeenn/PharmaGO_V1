# Dockerfile pour l'API Pharmacies de Garde
FROM python:3.11-slim

# Métadonnées
LABEL maintainer="votre-email@example.com"
LABEL description="API de synchronisation des pharmacies de garde d'Abidjan"

# Variables d'environnement
ENV PYTHONUNBUFFERED=1 \
    DEBIAN_FRONTEND=noninteractive

# Installation des dépendances système
RUN apt-get update && apt-get install -y \
    chromium \
    chromium-driver \
    sqlite3 \
    && rm -rf /var/lib/apt/lists/*

# Créer le répertoire de l'application
WORKDIR /app

# Copier les fichiers de requirements
COPY requirements.txt .

# Installer les dépendances Python
RUN pip install --no-cache-dir -r requirements.txt

# Copier le code de l'application
COPY pharmacie_garde_sync.py .
COPY pharmacie_api.py .

# Créer le répertoire pour la base de données
RUN mkdir -p /app/data

# Exposer le port de l'API
EXPOSE 5000

# Healthcheck
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD python -c "import requests; requests.get('http://localhost:5000/api/health')"

# Commande de démarrage
CMD ["gunicorn", "-w", "4", "-b", "0.0.0.0:5000", "--timeout", "120", "pharmacie_api:app"]
