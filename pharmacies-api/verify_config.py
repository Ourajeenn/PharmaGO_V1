import os
import sys
import logging
from dotenv import load_dotenv

print("=== Verification du Module API Pharmacie ===")

# 1. Verification des dependances
print("\n[1] Verification des dependances...")
missing = []
dependencies = [
    "redis", "python-json-logger", "supabase", 
    "prometheus_flask_exporter", "flask_caching", "requests"
]

for dep in dependencies:
    try:
        __import__(dep.replace("-", "_").replace("python_", "").replace("flask_", "flask_"))
        print(f"✅ {dep} installe")
    except ImportError:
        # Special handling for package names that differ from import names
        try:
            if dep == "python-json-logger": from pythonjsonlogger import jsonlogger
            elif dep == "prometheus-flask-exporter": import prometheus_flask_exporter
            elif dep == "flask-caching": from flask_caching import Cache
            else: raise ImportError
            print(f"✅ {dep} installe")
        except ImportError:
            missing.append(dep)
            print(f"❌ {dep} MANQUANT")

if missing:
    print(f"⚠️  Veuillez installer les dependances manquantes: pip install {' '.join(missing)}")
else:
    print("✅ Toutes les dependances sont presentes")

# 2. Verification de la configuration .env
print("\n[2] Verification de la configuration .env...")
if os.path.exists('.env'):
    load_dotenv()
    print("✅ Fichier .env trouve et charge")
    
    # Check config
    config_keys = [
        'DEBUG', 'LOG_LEVEL', 'ALLOWED_ORIGINS', 'RATE_LIMIT_STORAGE',
        'SUPABASE_URL', 'SUPABASE_KEY', 'CACHE_TYPE'
    ]
    for key in config_keys:
        val = os.getenv(key)
        if val:
            print(f"✅ {key}={val[:10]}..." if 'KEY' in key else f"✅ {key}={val}")
        else:
            print(f"⚠️  {key} non defini ou vide")
            
    # Check Redis URL
    redis_url = os.getenv('RATE_LIMIT_STORAGE', '')
    if 'redis' in redis_url:
        print("✅ Redis configure pour rate limiting")
    elif 'memory' in redis_url:
        print("ℹ️  Rate limiting en memoire (pas Redis)")
    else:
        print(f"⚠️  Configuration Rate Limit inconnue: {redis_url}")
else:
    print("❌ Fichier .env NON TROUVE")

# 3. Verification du Logging
print("\n[3] Verification du Logging...")
log_format = os.getenv('LOG_FORMAT', 'json').lower()
if log_format == 'json':
    try:
        from pythonjsonlogger import jsonlogger
        formatter = jsonlogger.JsonFormatter()
        print("✅ Logging JSON configure correctement")
    except ImportError:
        print("❌ Impossible de configurer le logging JSON (dependance manquante)")
else:
    print(f"ℹ️  Logging standard configure (format: {log_format})")

print("\n=== Fin de la verification ===")
