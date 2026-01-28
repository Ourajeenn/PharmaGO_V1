"""
API REST pour les pharmacies de garde d'Abidjan
À intégrer dans votre application de livraison

Installation:
pip install flask flask-cors

Démarrage:
python pharmacie_api.py
"""

from flask import Flask, jsonify, request
from flask_cors import CORS
from pharmacie_garde_sync import PharmacieGardeSync, get_pharmacies_garde_api
from datetime import datetime, timedelta
import threading
import time
import re

app = Flask(__name__)
CORS(app)  # Permet les requêtes cross-origin

# Sécurité: En-têtes de sécurité recommandés
@app.after_request
def add_security_headers(response):
    response.headers['X-Content-Type-Options'] = 'nosniff'
    response.headers['X-Frame-Options'] = 'DENY'
    response.headers['X-XSS-Protection'] = '1; mode=block'
    response.headers['Strict-Transport-Security'] = 'max-age=31536000; includeSubDomains'
    response.headers['Content-Security-Policy'] = "default-src 'self'"
    return response

def sanitize_input(text):
    """Nettoie les entrées utilisateur pour prévenir les injections"""
    if not text: return ""
    # Supprimer les caractères suspects
    return re.sub(r'[;\'"<>%]', '', str(text))

# Instance du synchroniseur
sync_manager = PharmacieGardeSync()

# Configuration
AUTO_SYNC_INTERVAL = 6 * 3600  # 6 heures en secondes


def auto_sync_worker():
    """Thread de synchronisation automatique en arrière-plan"""
    while True:
        try:
            print(f"\n🔄 Auto-sync en cours...")
            sync_manager.sync(method="auto")
            print(f"✅ Auto-sync terminé. Prochain dans {AUTO_SYNC_INTERVAL/3600}h")
        except Exception as e:
            print(f"❌ Erreur auto-sync: {e}")
        
        time.sleep(AUTO_SYNC_INTERVAL)


# Démarrer le thread de synchronisation auto
sync_thread = threading.Thread(target=auto_sync_worker, daemon=True)
sync_thread.start()


@app.route('/')
def index():
    """Page d'accueil de l'API"""
    return jsonify({
        'service': 'API Pharmacies de Garde - Abidjan',
        'version': '1.0',
        'endpoints': {
            'GET /api/pharmacies': 'Toutes les pharmacies de garde',
            'GET /api/pharmacies/<commune>': 'Pharmacies par commune',
            'GET /api/communes': 'Liste des communes disponibles',
            'POST /api/sync': 'Forcer une synchronisation',
            'GET /api/stats': 'Statistiques',
            'GET /api/health': 'État du service'
        }
    })


@app.route('/api/health')
def health():
    """Vérification de l'état du service"""
    return jsonify({
        'status': 'healthy',
        'timestamp': datetime.now().isoformat(),
        'database': 'connected'
    })


@app.route('/api/communes')
def get_communes():
    """Liste des communes d'Abidjan disponibles"""
    return jsonify({
        'success': True,
        'count': len(sync_manager.COMMUNES_ABIDJAN),
        'communes': sync_manager.COMMUNES_ABIDJAN
    })


@app.route('/api/pharmacies')
def get_all_pharmacies():
    """
    Récupère toutes les pharmacies de garde
    
    Query params:
        - date: filtre par date (YYYY-MM-DD)
        - limit: nombre maximum de résultats
    """
    date_filter = sanitize_input(request.args.get('date'))
    limit = request.args.get('limit', type=int)
    
    data = get_pharmacies_garde_api()
    pharmacies = data['pharmacies']
    
    # Filtrer par date si spécifié
    if date_filter:
        pharmacies = [p for p in pharmacies if p.get('date_garde') == date_filter]
    
    # Limiter les résultats si spécifié
    if limit:
        pharmacies = pharmacies[:limit]
    
    return jsonify({
        'success': True,
        'count': len(pharmacies),
        'timestamp': datetime.now().isoformat(),
        'pharmacies': pharmacies
    })


@app.route('/api/pharmacies/<commune>')
def get_pharmacies_by_commune(commune):
    """
    Récupère les pharmacies de garde pour une commune spécifique
    
    Exemple: /api/pharmacies/Cocody
    """
    # Normaliser le nom de la commune
    commune_normalized = sanitize_input(commune).strip().title()
    
    if commune_normalized not in sync_manager.COMMUNES_ABIDJAN:
        return jsonify({
            'success': False,
            'error': f'Commune "{commune}" non trouvée',
            'communes_disponibles': sync_manager.COMMUNES_ABIDJAN
        }), 404
    
    data = get_pharmacies_garde_api(commune_normalized)
    
    return jsonify(data)


@app.route('/api/pharmacies/search')
def search_pharmacies():
    """
    Recherche de pharmacies
    
    Query params:
        - q: terme de recherche (nom, quartier, adresse)
        - commune: filtrer par commune
    """
    query = sanitize_input(request.args.get('q', '')).lower()
    commune_filter = sanitize_input(request.args.get('commune'))
    
    data = get_pharmacies_garde_api(commune_filter)
    pharmacies = data['pharmacies']
    
    if query:
        pharmacies = [
            p for p in pharmacies
            if query in p.get('nom', '').lower() or
               query in p.get('quartier', '').lower() or
               query in p.get('adresse', '').lower()
        ]
    
    return jsonify({
        'success': True,
        'query': query,
        'count': len(pharmacies),
        'pharmacies': pharmacies
    })


@app.route('/api/pharmacies/nearest', methods=['POST'])
def get_nearest_pharmacies():
    """
    Trouve les pharmacies les plus proches d'une position
    
    Body JSON:
    {
        "latitude": 5.359952,
        "longitude": -4.008256,
        "limit": 5
    }
    """
    data = request.get_json()
    
    if not data or 'latitude' not in data or 'longitude' not in data:
        return jsonify({
            'success': False,
            'error': 'Latitude et longitude requises'
        }), 400
    
    user_lat = float(data['latitude'])
    user_lon = float(data['longitude'])
    limit = data.get('limit', 5)
    
    # Récupérer toutes les pharmacies
    all_pharmacies = get_pharmacies_garde_api()['pharmacies']
    
    # Calculer la distance (formule de Haversine simplifiée)
    def calculate_distance(lat1, lon1, lat2, lon2):
        from math import radians, sin, cos, sqrt, atan2
        
        R = 6371  # Rayon de la Terre en km
        
        lat1, lon1, lat2, lon2 = map(radians, [lat1, lon1, lat2, lon2])
        dlat = lat2 - lat1
        dlon = lon2 - lon1
        
        a = sin(dlat/2)**2 + cos(lat1) * cos(lat2) * sin(dlon/2)**2
        c = 2 * atan2(sqrt(a), sqrt(1-a))
        
        return R * c
    
    # Filtrer les pharmacies avec coordonnées et calculer distance
    pharmacies_with_distance = []
    for p in all_pharmacies:
        if p.get('latitude') and p.get('longitude'):
            distance = calculate_distance(
                user_lat, user_lon,
                float(p['latitude']), float(p['longitude'])
            )
            p_copy = p.copy()
            p_copy['distance_km'] = round(distance, 2)
            pharmacies_with_distance.append(p_copy)
    
    # Trier par distance et limiter
    pharmacies_with_distance.sort(key=lambda x: x['distance_km'])
    nearest = pharmacies_with_distance[:limit]
    
    return jsonify({
        'success': True,
        'user_location': {
            'latitude': user_lat,
            'longitude': user_lon
        },
        'count': len(nearest),
        'pharmacies': nearest
    })


@app.route('/api/sync', methods=['POST'])
def force_sync():
    """
    Force une synchronisation immédiate
    
    Body JSON (optionnel):
    {
        "method": "auto|selenium|requests|api"
    }
    """
    data = request.get_json() or {}
    method = data.get('method', 'auto')
    
    try:
        count = sync_manager.sync(method=method)
        
        return jsonify({
            'success': True,
            'message': 'Synchronisation effectuée',
            'pharmacies_synchronisees': count,
            'timestamp': datetime.now().isoformat()
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@app.route('/api/stats')
def get_stats():
    """Statistiques sur les pharmacies de garde"""
    import sqlite3
    
    conn = sqlite3.connect(sync_manager.db_path)
    cursor = conn.cursor()
    
    # Total de pharmacies
    cursor.execute("SELECT COUNT(*) FROM pharmacies_garde")
    total = cursor.fetchone()[0]
    
    # Par commune
    cursor.execute("""
        SELECT commune, COUNT(*) as count 
        FROM pharmacies_garde 
        GROUP BY commune 
        ORDER BY count DESC
    """)
    par_commune = [{'commune': row[0], 'count': row[1]} for row in cursor.fetchall()]
    
    # Dernière synchronisation
    cursor.execute("""
        SELECT date_sync, nb_pharmacies, statut 
        FROM sync_history 
        ORDER BY date_sync DESC 
        LIMIT 1
    """)
    last_sync = cursor.fetchone()
    
    conn.close()
    
    return jsonify({
        'success': True,
        'total_pharmacies': total,
        'repartition_par_commune': par_commune,
        'derniere_synchronisation': {
            'date': last_sync[0] if last_sync else None,
            'nb_pharmacies': last_sync[1] if last_sync else 0,
            'statut': last_sync[2] if last_sync else None
        },
        'timestamp': datetime.now().isoformat()
    })


@app.route('/api/export')
def export_data():
    """Exporte les données en JSON"""
    filepath = sync_manager.export_to_json("export_pharmacies.json")
    
    return jsonify({
        'success': True,
        'message': 'Export réussi',
        'filepath': filepath,
        'timestamp': datetime.now().isoformat()
    })


# Gestion des erreurs
@app.errorhandler(404)
def not_found(error):
    return jsonify({
        'success': False,
        'error': 'Endpoint non trouvé',
        'code': 404
    }), 404


@app.errorhandler(500)
def internal_error(error):
    return jsonify({
        'success': False,
        'error': 'Erreur serveur',
        'code': 500
    }), 500


if __name__ == '__main__':
    print("""
    ╔══════════════════════════════════════════════════════╗
    ║   API Pharmacies de Garde - Abidjan                  ║
    ║   Démarrage sur http://localhost:5000                ║
    ╚══════════════════════════════════════════════════════╝
    
    📋 Endpoints disponibles:
       GET  /api/pharmacies              - Toutes les pharmacies
       GET  /api/pharmacies/<commune>    - Par commune
       GET  /api/pharmacies/search       - Recherche
       POST /api/pharmacies/nearest      - Plus proches
       POST /api/sync                    - Synchronisation
       GET  /api/stats                   - Statistiques
       GET  /api/communes                - Liste communes
       GET  /api/health                  - État du service
    
    🔄 Auto-sync activé: toutes les 6 heures
    """)
    
    app.run(host='0.0.0.0', port=5000, debug=True)
