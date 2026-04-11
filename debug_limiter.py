
import os
import sys

# Add the directory to sys.path
sys.path.append(os.path.join(os.getcwd(), 'pharma-go-express-main', 'pharmacies-api'))

from pharmacie_api import app, limiter

print(f"DEBUG: app.config keys: {list(app.config.keys())}")
if 'RATELIMIT_STORAGE_URL' in app.config:
    print(f"DEBUG: RATELIMIT_STORAGE_URL in config: {app.config['RATELIMIT_STORAGE_URL']}")

print(f"DEBUG: limiter.storage_uri: {limiter._storage_uri}")
# In Flask-Limiter 3+, storage is accessed differently, but let's try to inspect
try:
    print(f"DEBUG: limiter._storage_options: {limiter._storage_options}")
except:
    pass

try:
    print(f"DEBUG: limiter.storage_uri (public): {getattr(limiter, 'storage_uri', 'N/A')}")
except:
    pass

sys.stdout.flush()
