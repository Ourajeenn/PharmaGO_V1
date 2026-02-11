import json
import os
import sys
from datetime import datetime

# Ensure we can import modules from current directory
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from pharmacie_garde_sync import PharmacieGardeSync, PharmacieGarde

def import_pharmacies(json_file_path):
    print(f"📖 Lecture du fichier: {json_file_path}")
    
    try:
        with open(json_file_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
            
        sync = PharmacieGardeSync()
        total_imported = 0
        pharmacies_to_save = []
        
        current_date = datetime.now().strftime("%Y-%m-%d")
        
        print(f"🌍 Traitement de {len(data['communes'])} communes...")
        
        for item in data['communes']:
            commune = item['commune']
            pharmacy_names = item['pharmacies']
            print(f"  - {commune}: {len(pharmacy_names)} pharmacies")
            
            for name in pharmacy_names:
                # Cleanup name
                clean_name = name.strip().upper()
                if not clean_name.startswith("PHARMACIE"):
                    clean_name = f"PHARMACIE {clean_name}"
                
                # Create object
                pharmacie = PharmacieGarde(
                    nom=clean_name,
                    commune=commune,
                    quartier="",
                    adresse=f"{commune}, Abidjan",
                    telephone="",
                    date_garde=current_date, # Assume valid for today/general list
                    horaires="24h/24",
                    derniere_maj=datetime.now().isoformat()
                )
                pharmacies_to_save.append(pharmacie)
        
        # Save to DB
        if pharmacies_to_save:
            print(f"\n💾 Sauvegarde de {len(pharmacies_to_save)} pharmacies en base de données...")
            count = sync.save_to_database(pharmacies_to_save)
            print(f"✅ {count} pharmacies importées avec succès!")
            
            # Sync to Supabase if enabled
            if os.environ.get("SUPABASE_SYNC_ENABLED", 'false').lower() == 'true':
                print("☁️ Sync vers Supabase...")
                sync.sync_to_supabase(pharmacies_to_save)
        else:
            print("⚠️ Aucune pharmacie à importer.")
            
    except Exception as e:
        print(f"❌ Erreur lors de l'import: {e}")

if __name__ == "__main__":
    # Path to the JSON file
    # Assuming the script is run from pharmacies-api and the json is in the parent root
    base_json_path = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))), "base_pharmacies_abidjan.json")
    
    # If not found there, try the hardcoded path from user environment
    if not os.path.exists(base_json_path):
        base_json_path = r"c:\Users\jenra\Downloads\PHARMA-GO_FINALE\base_pharmacies_abidjan.json"
        
    if os.path.exists(base_json_path):
        import_pharmacies(base_json_path)
    else:
        print(f"❌ Fichier non trouvé: {base_json_path}")
