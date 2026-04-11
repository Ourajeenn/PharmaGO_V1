"""
API REST Modernisée pour les pharmacies de garde d'Abidjan
Version 2.0 - Intégration avec PharmaGo

Nouvelles fonctionnalités:
- Configuration via variables d'environnement
- Logging structuré
- Rate limiting
- Intégration Supabase optionnelle
- Meilleure gestion d'erreurs

Installation:
pip install flask flask-cors python-dotenv flask-limiter

Démarrage:
python pharmacie_api.py
"""

from flask import Flask, jsonify, request
from flask_cors import CORS
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
from pharmacie_garde_sync import PharmacieGardeSync, get_pharmacies_garde_api
from datetime import datetime, timedelta
from dotenv import load_dotenv
import threading
import time
import re
import os
import logging
from logging.handlers import RotatingFileHandler
from prometheus_flask_exporter import PrometheusMetrics
from flask_caching import Cache
from fido2.webauthn import PublicKeyCredentialRpEntity, PublicKeyCredentialUserEntity
from fido2.server import Fido2Server
from fido2.utils import websafe_decode, websafe_encode

# Charger les variables d'environnement
env_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), '.env')
load_dotenv(env_path)

print(f"DEBUG: env_path={env_path}")
print(f"DEBUG: RATE_LIMIT_STORAGE={os.getenv('RATE_LIMIT_STORAGE')}")
print(f"DEBUG: CACHE_TYPE={os.getenv('CACHE_TYPE')}")
print(f"DEBUG: DB_PATH={os.getenv('DB_PATH')}")

# Configuration du logging
def setup_logging():
    """Configure le système de logging avec support JSON"""
    log_level = os.getenv('LOG_LEVEL', 'INFO')
    log_file = os.getenv('LOG_FILE', 'pharmacie_api.log')
    log_format = os.getenv('LOG_FORMAT', 'json').lower()

    logger = logging.getLogger()
    logger.setLevel(getattr(logging, log_level))
    
    # Supprimer les handlers existants pour éviter les doublons
    if logger.handlers:
        logger.handlers = []

    # Choix du formateur
    if log_format == 'json':
        from pythonjsonlogger import jsonlogger
        formatter = jsonlogger.JsonFormatter(
            '%(asctime)s %(name)s %(levelname)s %(message)s'
        )
    else:
        formatter = logging.Formatter(
            '%(asctime)s - %(name)s - %(levelname)s - %(message)s'
        )

    # Handler fichier
    file_handler = RotatingFileHandler(log_file, maxBytes=10485760, backupCount=5)
    file_handler.setFormatter(formatter)
    logger.addHandler(file_handler)

    # Handler console
    console_handler = logging.StreamHandler()
    console_handler.setFormatter(formatter)
    logger.addHandler(console_handler)

    return logging.getLogger(__name__)

logger = setup_logging()

# Création de l'application Flask
app = Flask(__name__)
app.config['JSON_SORT_KEYS'] = False
app.config['JSONIFY_PRETTYPRINT_REGULAR'] = True
app.config['RATELIMIT_STORAGE_URI'] = 'memory://'
app.config['RATELIMIT_STORAGE_URL'] = 'memory://'
app.config['RATELIMIT_STRATEGY'] = 'fixed-window'

app.config['JSONIFY_PRETTYPRINT_REGULAR'] = True

# Prometheus Metrics
metrics = PrometheusMetrics(app)
metrics.info('app_info', 'Application info', version='2.0.0')

# Caching
cache_type = os.getenv('CACHE_TYPE', 'SimpleCache')
cache_config = {'CACHE_TYPE': cache_type}
if cache_type == 'RedisCache':
    cache_config['CACHE_REDIS_URL'] = os.getenv('CACHE_REDIS_URL')

cache = Cache(app, config=cache_config)

# CORS avec configuration
CORS(app, resources={
    r"/api/*": {
        "origins": os.getenv('ALLOWED_ORIGINS', '*').split(','),
        "methods": ["GET", "POST", "PUT", "DELETE"],
        "allow_headers": ["Content-Type", "Authorization"]
    }
})

# Force memory storage to avoid Redis connection attempts
os.environ['RATELIMIT_STORAGE_URI'] = 'memory://'

# Rate limiting
limiter = Limiter(
    app=app,
    key_func=get_remote_address,
    default_limits=[os.getenv('RATE_LIMIT_DEFAULT', "200 per day, 50 per hour")],
    storage_uri="memory://"
)

# Sécurité: En-têtes de sécurité renforcés
@app.after_request
def add_security_headers(response):
    """Ajoute les en-têtes de sécurité HTTP"""
    response.headers['X-Content-Type-Options'] = 'nosniff'
    response.headers['X-Frame-Options'] = 'DENY'
    response.headers['X-XSS-Protection'] = '1; mode=block'
    
    # HSTS seulement en production
    if not app.debug:
        response.headers['Strict-Transport-Security'] = 'max-age=31536000; includeSubDomains'
    
    # CSP configurable
    csp = os.getenv('CONTENT_SECURITY_POLICY', "default-src 'self'")
    response.headers['Content-Security-Policy'] = csp
    
    return response

def sanitize_input(text):
    """
    Nettoie les entrées utilisateur pour prévenir les injections
    
    Args:
        text: Texte à nettoyer
        
    Returns:
        str: Texte nettoyé
    """
    if not text:
        return ""
    # Supprimer les caractères suspects
    cleaned = re.sub(r'[;\'"<>%]', '', str(text))
    logger.debug(f"Input sanitized: {text} -> {cleaned}")
    return cleaned

# Instance du synchroniseur
sync_manager = PharmacieGardeSync()

# Configuration de l'auto-sync
AUTO_SYNC_ENABLED = os.getenv('AUTO_SYNC_ENABLED', 'true').lower() == 'true'
AUTO_SYNC_INTERVAL = int(os.getenv('AUTO_SYNC_INTERVAL', '21600'))  # 6 heures par défaut


# Auto-sync thread removed in favor of standalone scheduler.py
# AUTO_SYNC_ENABLED env var is now used by scheduler.py


# ============================================================================
# FIDO2 Configuration & Storage (In-Memory for demo)
# ============================================================================

rp = PublicKeyCredentialRpEntity(name="PharmaGo Express", id="localhost")
server = Fido2Server(rp)

# Stockage temporaire (À remplacer par DB/Redis en prod)
challenges = {}  # user_id -> challenge
users = {}       # user_id -> credential_data (bytes)

def to_dict(data):
    """Helper to convert FIDO2 objects/bytes to JSON-serializable dict"""
    if isinstance(data, bytes):
        return websafe_encode(data)
    if isinstance(data, dict):
        return {k: to_dict(v) for k, v in data.items()}
    if hasattr(data, "public_key"): # Credential
        return to_dict(dict(data))
    if hasattr(data, "__dict__"):
        return to_dict(data.__dict__)
    if isinstance(data, list):
        return [to_dict(i) for i in data]
    return data

@app.route('/api/auth/register-challenge', methods=['POST'])
def register_challenge():
    """Génère un challenge pour la création de passkey"""
    try:
        data = request.json
        user_id = data.get('userId')
        username = data.get('username')
        
        if not user_id or not username:
             return jsonify({'status': 'error', 'message': 'Missing userId or username'}), 400

        user = PublicKeyCredentialUserEntity(
            id=user_id.encode('utf-8'),
            name=username,
            display_name=username
        )
        
        options, state = server.register_begin(
            user,
            user_verification="preferred",
            authenticator_attachment="platform"
        )
        
        challenges[user_id] = state
        
        return jsonify(to_dict(dict(options)))
    except Exception as e:
        logger.error(f"FIDO2 Register Challenge Error: {e}")
        return jsonify({'status': 'error', 'message': str(e)}), 500

@app.route('/api/auth/register-verify', methods=['POST'])
def register_verify():
    """Vérifie la réponse d'attestation et stocke la clé publique"""
    try:
        data = request.json
        user_id = data.get('userId')
        
        if not user_id or user_id not in challenges:
            return jsonify({'status': 'error', 'message': 'Invalid session or challenge expired'}), 400
            
        # Decode fields that came back as URL-safe base64
        credential = data.get('credential')
        if 'id' in credential:
            # id is usually base64url string in JSON, fido2 expects bytes? 
            # Actually fido2.server.register_complete expects the credential dict structure 
            # similar to what navigator.credentials.create returns but mapped.
            pass

        # Use helper from fido2 (if available) or just pass data and hope fido2 handles it?
        # fido2 lib expects the attestation object to be bytes.
        
        # Simple fix: We need to reconstruct the credential object or pass specific args.
        # server.register_complete takes (state, response_data)
        # response_data should be a dict with clientDataJSON (bytes), attestationObject (bytes), etc.
        
        # We need to decode base64 fields from frontend
        cred_data = {
            'id': websafe_decode(credential['id']),
            'rawId': websafe_decode(credential['rawId']),
            'type': credential['type'],
            'response': {
                'clientDataJSON': websafe_decode(credential['response']['clientDataJSON']),
                'attestationObject': websafe_decode(credential['response']['attestationObject'])
            }
        }
        
        auth_data = server.register_complete(
            challenges.pop(user_id),
            cred_data
        )
        
        users[user_id] = auth_data.credential_data
        
        logger.info(f"FIDO2: User {user_id} registered successfully")
        return jsonify({'status': 'success'})
    except Exception as e:
        logger.error(f"FIDO2 Register Verify Error: {e}", exc_info=True)
        return jsonify({'status': 'error', 'message': str(e)}), 500

@app.route('/api/auth/login-challenge', methods=['POST'])
def login_challenge():
    """Génère un challenge pour l'authentification"""
    try:
        data = request.json
        user_id = data.get('userId')
        
        if not user_id or user_id not in users:
             return jsonify({'status': 'error', 'message': 'User not found'}), 404
             
        credential_data = users[user_id]
        
        options, state = server.authenticate_begin([credential_data])
        challenges[user_id] = state
        
        return jsonify(to_dict(dict(options)))
    except Exception as e:
        logger.error(f"FIDO2 Login Challenge Error: {e}")
        return jsonify({'status': 'error', 'message': str(e)}), 500

@app.route('/api/auth/login-verify', methods=['POST'])
def login_verify():
    """Vérifie la réponse d'assertion"""
    try:
        data = request.json
        user_id = data.get('userId')
        
        if not user_id or user_id not in challenges:
            return jsonify({'status': 'error', 'message': 'Invalid session'}), 400
            
        credential_data = users[user_id]
        credential = data.get('credential')
        
        cred_data = {
            'id': websafe_decode(credential['id']),
            'rawId': websafe_decode(credential['rawId']),
            'type': credential['type'],
            'response': {
                'clientDataJSON': websafe_decode(credential['response']['clientDataJSON']),
                'authenticatorData': websafe_decode(credential['response']['authenticatorData']),
                'signature': websafe_decode(credential['response']['signature']),
                'userHandle': websafe_decode(credential['response']['userHandle']) if credential['response'].get('userHandle') else None
            }
        }

        server.authenticate_complete(
            challenges.pop(user_id),
            [credential_data],
            cred_data
        )
        
        logger.info(f"FIDO2: User {user_id} authenticated successfully")
        return jsonify({'status': 'success'})
    except Exception as e:
         logger.error(f"FIDO2 Login Verify Error: {e}", exc_info=True)
         return jsonify({'status': 'error', 'message': str(e)}), 500



# ============================================================================
# ROUTES API
# ============================================================================

@app.route('/')
@limiter.exempt
def index():
    """
    Page d'accueil de l'API avec documentation
    
    Returns:
        JSON: Documentation des endpoints disponibles
    """
    return jsonify({
        'service': 'API Pharmacies de Garde - Abidjan',
        'version': '2.0',
        'status': 'operational',
        'documentation': '/api/docs',
        'endpoints': {
            'GET /api/pharmacies': 'Toutes les pharmacies de garde',
            'GET /api/pharmacies/<commune>': 'Pharmacies par commune',
            'GET /api/pharmacies/search': 'Recherche de pharmacies',
            'POST /api/pharmacies/nearest': 'Pharmacies les plus proches',
            'GET /api/communes': 'Liste des communes disponibles',
            'POST /api/sync': 'Forcer une synchronisation',
            'GET /api/stats': 'Statistiques',
            'GET /api/health': 'État du service'
        },
        'features': {
            'auto_sync': AUTO_SYNC_ENABLED,
            'rate_limiting': True,
            'cors': True,
            'metrics': True,
            'caching': True
        }
    })


@app.route('/api/health')
@limiter.exempt
def health():
    """
    Endpoint de santé pour monitoring
    
    Returns:
        JSON: État du service et dépendances
    """
    try:
        # Vérifier la connexion DB
        import sqlite3
        conn = sqlite3.connect(sync_manager.db_path)
        conn.close()
        db_status = 'connected'
    except Exception as e:
        logger.error(f"Database health check failed: {e}")
        db_status = 'error'
    
    health_status = {
        'status': 'healthy' if db_status == 'connected' else 'degraded',
        'timestamp': datetime.now().isoformat(),
        'database': db_status,
        'auto_sync': 'enabled' if AUTO_SYNC_ENABLED else 'disabled',
        'uptime': time.time()  # You'd track actual uptime in production
    }
    
    status_code = 200 if health_status['status'] == 'healthy' else 503
    return jsonify(health_status), status_code


@app.route('/api/communes')
@limiter.limit("100 per hour")
def get_communes():
    """
    Liste des communes d'Abidjan disponibles
    
    Returns:
        JSON: Liste des communes avec compteur
    """
    try:
        logger.info("GET /api/communes")
        return jsonify({
            'success': True,
            'count': len(sync_manager.COMMUNES_ABIDJAN),
            'communes': sorted(sync_manager.COMMUNES_ABIDJAN)
        })
    except Exception as e:
        logger.error(f"Error in get_communes: {e}", exc_info=True)
        return jsonify({'success': False, 'error': str(e)}), 500


@app.route('/api/pharmacies')
@limiter.limit("100 per hour")
@cache.cached(timeout=3600, query_string=True)
def get_all_pharmacies():
    """
    Récupère toutes les pharmacies de garde
    
    Query params:
        date (str, optional): Filtre par date (YYYY-MM-DD)
        limit (int, optional): Nombre maximum de résultats
        offset (int, optional): Offset pour pagination
    
    Returns:
        JSON: Liste des pharmacies avec métadonnées
    """
    try:
        date_filter = sanitize_input(request.args.get('date'))
        limit = request.args.get('limit', type=int)
        offset = request.args.get('offset', 0, type=int)
        
        logger.info(f"GET /api/pharmacies - filters: date={date_filter}, limit={limit}, offset={offset}")
        
        data = get_pharmacies_garde_api()
        pharmacies = data['pharmacies']
        
        # Filtrer par date si spécifié
        if date_filter:
            pharmacies = [p for p in pharmacies if p.get('date_garde') == date_filter]
        
        total = len(pharmacies)
        
        # Pagination
        if offset:
            pharmacies = pharmacies[offset:]
        if limit:
            pharmacies = pharmacies[:limit]
        
        return jsonify({
            'success': True,
            'count': len(pharmacies),
            'total': total,
            'offset': offset,
            'timestamp': datetime.now().isoformat(),
            'pharmacies': pharmacies
        })
    
    except Exception as e:
        logger.error(f"Error in get_all_pharmacies: {e}", exc_info=True)
        return jsonify({'success': False, 'error': str(e)}), 500


@app.route('/api/pharmacies/<commune>')
@limiter.limit("100 per hour")
@cache.cached(timeout=3600)
def get_pharmacies_by_commune(commune):
    """
    Récupère les pharmacies de garde pour une commune spécifique
    
    Args:
        commune (str): Nom de la commune
    
    Returns:
        JSON: Pharmacies de la commune ou erreur 404
    
    Example:
        GET /api/pharmacies/Cocody
    """
    try:
        # Normaliser le nom de la commune
        commune_normalized = sanitize_input(commune).strip().title()
        
        logger.info(f"GET /api/pharmacies/{commune_normalized}")
        
        if commune_normalized not in sync_manager.COMMUNES_ABIDJAN:
            logger.warning(f"Commune not found: {commune}")
            return jsonify({
                'success': False,
                'error': f'Commune "{commune}" non trouvée',
                'communes_disponibles': sorted(sync_manager.COMMUNES_ABIDJAN)
            }), 404
        
        data = get_pharmacies_garde_api(commune_normalized)
        return jsonify(data)
    
    except Exception as e:
        logger.error(f"Error in get_pharmacies_by_commune: {e}", exc_info=True)
        return jsonify({'success': False, 'error': str(e)}), 500


@app.route('/api/pharmacies/search')
@limiter.limit("50 per hour")
def search_pharmacies():
    """
    Recherche de pharmacies
    
    Query params:
        q (str): Terme de recherche (nom, quartier, adresse)
        commune (str, optional): Filtrer par commune
        limit (int, optional): Limite de résultats
    
    Returns:
        JSON: Résultats de la recherche
    """
    try:
        query = sanitize_input(request.args.get('q', '')).lower()
        commune_filter = sanitize_input(request.args.get('commune'))
        limit = request.args.get('limit', 50, type=int)
        
        logger.info(f"GET /api/pharmacies/search - q={query}, commune={commune_filter}")
        
        if not query:
            return jsonify({
                'success': False,
                'error': 'Paramètre "q" requis pour la recherche'
            }), 400
        
        data = get_pharmacies_garde_api(commune_filter)
        pharmacies = data['pharmacies']
        
        # Recherche dans nom, quartier, adresse
        pharmacies = [
            p for p in pharmacies
            if query in p.get('nom', '').lower() or
               query in p.get('quartier', '').lower() or
               query in p.get('adresse', '').lower()
        ][:limit]
        
        return jsonify({
            'success': True,
            'query': query,
            'commune_filter': commune_filter,
            'count': len(pharmacies),
            'pharmacies': pharmacies
        })
    
    except Exception as e:
        logger.error(f"Error in search_pharmacies: {e}", exc_info=True)
        return jsonify({'success': False, 'error': str(e)}), 500


@app.route('/api/pharmacies/nearest', methods=['POST'])
@limiter.limit("30 per hour")
def get_nearest_pharmacies():
    """
    Trouve les pharmacies les plus proches d'une position GPS
    
    Request Body (JSON):
        {
            "latitude": float,   # Latitude de l'utilisateur
            "longitude": float,  # Longitude de l'utilisateur
            "limit": int         # Nombre de résultats (optionnel, défaut: 5)
        }
    
    Returns:
        JSON: Pharmacies triées par distance avec distance_km
    """
    try:
        data = request.get_json()
        
        if not data or 'latitude' not in data or 'longitude' not in data:
            return jsonify({
                'success': False,
                'error': 'Latitude et longitude requises'
            }), 400
        
        user_lat = float(data['latitude'])
        user_lon = float(data['longitude'])
        limit = data.get('limit', 5)
        
        logger.info(f"POST /api/pharmacies/nearest - lat={user_lat}, lon={user_lon}, limit={limit}")
        
        # Récupérer toutes les pharmacies
        all_pharmacies = get_pharmacies_garde_api()['pharmacies']
        
        # Fonction de calcul de distance (Haversine)
        def calculate_distance(lat1, lon1, lat2, lon2):
            from math import radians, sin, cos, sqrt, atan2
            
            R = 6371  # Rayon de la Terre en km
            
            lat1, lon1, lat2, lon2 = map(radians, [lat1, lon1, lat2, lon2])
            dlat = lat2 - lat1
            dlon = lon2 - lon1
            
            a = sin(dlat/2)**2 + cos(lat1) * cos(lat2) * sin(dlon/2)**2
            c = 2 * atan2(sqrt(a), sqrt(1-a))
            
            return R * c
        
        # Filtrer pharmacies avec coordonnées et calculer distance
        pharmacies_with_distance = []
        for p in all_pharmacies:
            if p.get('latitude') and p.get('longitude'):
                try:
                    distance = calculate_distance(
                        user_lat, user_lon,
                        float(p['latitude']), float(p['longitude'])
                    )
                    p_copy = p.copy()
                    p_copy['distance_km'] = round(distance, 2)
                    pharmacies_with_distance.append(p_copy)
                except (ValueError, TypeError) as e:
                    logger.warning(f"Invalid coordinates for pharmacy {p.get('nom')}: {e}")
                    continue
        
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
    
    except ValueError as e:
        logger.error(f"Invalid input in get_nearest_pharmacies: {e}")
        return jsonify({'success': False, 'error': 'Coordonnées invalides'}), 400
    except Exception as e:
        logger.error(f"Error in get_nearest_pharmacies: {e}", exc_info=True)
        return jsonify({'success': False, 'error': str(e)}), 500


@app.route('/api/sync', methods=['POST'])
@limiter.limit("10 per hour")
def force_sync():
    """
    Force une synchronisation immédiate des données
    
    Request Body (JSON, optional):
        {
            "method": str  # "auto", "selenium", "requests", ou "api"
        }
    
    Returns:
        JSON: Résultat de la synchronisation
    """
    try:
        data = request.get_json() or {}
        method = data.get('method', 'auto')
        
        logger.info(f"POST /api/sync - method={method}")
        
        count = sync_manager.sync(method=method)
        
        return jsonify({
            'success': True,
            'message': 'Synchronisation effectuée',
            'pharmacies_synchronisees': count,
            'method': method,
            'timestamp': datetime.now().isoformat()
        })
    
    except Exception as e:
        logger.error(f"Error in force_sync: {e}", exc_info=True)
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@app.route('/api/stats')
@limiter.limit("50 per hour")
def get_stats():
    """
    Statistiques sur les pharmacies de garde
    
    Returns:
        JSON: Statistiques complètes (total, par commune, dernière sync)
    """
    try:
        import sqlite3
        
        logger.info("GET /api/stats")
        
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
        
        # Dernières 10 syncs
        cursor.execute("""
            SELECT date_sync, nb_pharmacies, statut, methode
            FROM sync_history 
            ORDER BY date_sync DESC 
            LIMIT 10
        """)
        sync_history = [
            {
                'date': row[0],
                'pharmacies': row[1],
                'statut': row[2],
                'methode': row[3] if len(row) > 3 else None
            }
            for row in cursor.fetchall()
        ]
        
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
            'historique_syncs': sync_history,
            'timestamp': datetime.now().isoformat()
        })
    
    except Exception as e:
        logger.error(f"Error in get_stats: {e}", exc_info=True)
        return jsonify({'success': False, 'error': str(e)}), 500


@app.route('/api/export')
@limiter.limit("5 per hour")
def export_data():
    """
    Exporte les données en JSON
    
    Returns:
        JSON: Chemin du fichier exporté
    """
    try:
        logger.info("GET /api/export")
        
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        filename = f"export_pharmacies_{timestamp}.json"
        filepath = sync_manager.export_to_json(filename)
        
        return jsonify({
            'success': True,
            'message': 'Export réussi',
            'filepath': filepath,
            'timestamp': datetime.now().isoformat()
        })
    
    except Exception as e:
        logger.error(f"Error in export_data: {e}", exc_info=True)
        return jsonify({'success': False, 'error': str(e)}), 500


# ============================================================================
# GESTIONNAIRES D'ERREURS
# ============================================================================

@app.errorhandler(404)
def not_found(error):
    """Gestionnaire d'erreur 404"""
    return jsonify({
        'success': False,
        'error': 'Endpoint non trouvé',
        'code': 404,
        'available_endpoints': [rule.rule for rule in app.url_map.iter_rules() if rule.rule.startswith('/api')]
    }), 404


@app.errorhandler(500)
def internal_error(error):
    """Gestionnaire d'erreur 500"""
    logger.error(f"Internal server error: {error}", exc_info=True)
    return jsonify({
        'success': False,
        'error': 'Erreur serveur interne',
        'code': 500
    }), 500


@app.errorhandler(429)
def ratelimit_handler(e):
    """Gestionnaire de rate limiting"""
    return jsonify({
        'success': False,
        'error': 'Trop de requêtes. Veuillez réessayer plus tard.',
        'code': 429
    }), 429


# ============================================================================
# POINT D'ENTRÉE
# ============================================================================

if __name__ == '__main__':
    port = int(os.getenv('PORT', 5000))
    host = os.getenv('HOST', '0.0.0.0')
    debug = os.getenv('DEBUG', 'False').lower() == 'true'
    
    print(f"""
    ╔══════════════════════════════════════════════════════╗
    ║   API Pharmacies de Garde - Abidjan v2.0             ║
    ║   Démarrage sur http://{host}:{port}{'             '[:max(0, 15-len(str(port))-len(host))]}║
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
       GET  /api/export                  - Export JSON
    
    ⚙️  Configuration:
       🔄 Auto-sync: {'✅ Actif' if AUTO_SYNC_ENABLED else '❌ Désactivé'}
       ⏱️  Intervalle: {AUTO_SYNC_INTERVAL/3600:.1f}h
       🚦 Rate limiting: ✅ Actif
       🔒 CORS: ✅ Configuré
       📝 Logging: {os.getenv('LOG_LEVEL', 'INFO')}
       🐛 Debug: {'✅' if debug else '❌'}
    """)
    
    app.run(host=host, port=port, debug=debug, threaded=True)
