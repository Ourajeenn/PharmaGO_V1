#!/bin/bash
# Script de synchronisation automatique des pharmacies de garde
# À placer dans /etc/cron.d/ ou crontab -e

# Configuration
SCRIPT_DIR="/chemin/vers/votre/application"
PYTHON_PATH="/usr/bin/python3"
LOG_FILE="/var/log/pharmacie_garde_sync.log"

# Fonction de synchronisation
sync_pharmacies() {
    echo "=== Synchronisation $(date) ===" >> $LOG_FILE
    cd $SCRIPT_DIR
    $PYTHON_PATH pharmacie_garde_sync.py >> $LOG_FILE 2>&1
    echo "=== Fin $(date) ===" >> $LOG_FILE
    echo "" >> $LOG_FILE
}

# Exécuter la synchronisation
sync_pharmacies

# CONFIGURATION CRON RECOMMANDÉE:
# 
# Synchroniser 2 fois par jour (8h et 20h)
# 0 8,20 * * * /chemin/vers/sync_cron.sh
#
# Synchroniser toutes les 6 heures
# 0 */6 * * * /chemin/vers/sync_cron.sh
#
# Synchroniser tous les jours à minuit
# 0 0 * * * /chemin/vers/sync_cron.sh
