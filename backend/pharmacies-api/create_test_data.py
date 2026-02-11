"""
Script pour créer des données de test pour les pharmacies de garde
"""

import sqlite3
from datetime import datetime

# Données de test pour les pharmacies de garde d'Abidjan
PHARMACIES_TEST = [
    # Cocody
    {"nom": "Pharmacie Riviera Palmeraie", "commune": "Cocody", "quartier": "Riviera Palmeraie", "adresse": "Boulevard Latrille", "telephone": "+225 27 22 41 23 45", "latitude": 5.359952, "longitude": -4.008256},
    {"nom": "Pharmacie des Deux Plateaux", "commune": "Cocody", "quartier": "Deux Plateaux", "adresse": "Carrefour Solibra", "telephone": "+225 27 22 42 15 78", "latitude": 5.366789, "longitude": -3.998765},
    {"nom": "Pharmacie Angré", "commune": "Cocody", "quartier": "Angré", "adresse": "Boulevard Latrille", "telephone": "+225 27 22 43 67 89", "latitude": 5.378456, "longitude": -4.012345},
    
    # Plateau
    {"nom": "Pharmacie Centrale du Plateau", "commune": "Plateau", "quartier": "Centre-ville", "adresse": "Avenue Franchet d'Esperey", "telephone": "+225 27 20 21 34 56", "latitude": 5.320156, "longitude": -4.025789},
    {"nom": "Pharmacie de la République", "commune": "Plateau", "quartier": "Plateau", "adresse": "Boulevard de la République", "telephone": "+225 27 20 22 45 67", "latitude": 5.318234, "longitude": -4.023456},
    
    # Yopougon
    {"nom": "Pharmacie Siporex", "commune": "Yopougon", "quartier": "Siporex", "adresse": "Rue Principale", "telephone": "+225 27 23 45 67 89", "latitude": 5.335678, "longitude": -4.078901},
    {"nom": "Pharmacie Maroc", "commune": "Yopougon", "quartier": "Maroc", "adresse": "Carrefour Maroc", "telephone": "+225 27 23 46 78 90", "latitude": 5.342345, "longitude": -4.089012},
    {"nom": "Pharmacie Niangon", "commune": "Yopougon", "quartier": "Niangon", "adresse": "Rond-point Niangon", "telephone": "+225 27 23 47 89 01", "latitude": 5.328901, "longitude": -4.095678},
    
    # Marcory
    {"nom": "Pharmacie Zone 4", "commune": "Marcory", "quartier": "Zone 4", "adresse": "Boulevard VGE", "telephone": "+225 27 21 34 56 78", "latitude": 5.298765, "longitude": -3.989012},
    {"nom": "Pharmacie Biétry", "commune": "Marcory", "quartier": "Biétry", "adresse": "Avenue 7", "telephone": "+225 27 21 35 67 89", "latitude": 5.305432, "longitude": -3.995678},
    
    # Abobo
    {"nom": "Pharmacie Abobo Gare", "commune": "Abobo", "quartier": "Abobo Gare", "adresse": "Carrefour Gare", "telephone": "+225 27 24 56 78 90", "latitude": 5.423456, "longitude": -4.012345},
    {"nom": "Pharmacie Anador", "commune": "Abobo", "quartier": "Anador", "adresse": "Rue Principale", "telephone": "+225 27 24 57 89 01", "latitude": 5.431234, "longitude": -4.023456},
    
    # Adjamé
    {"nom": "Pharmacie Adjamé Liberté", "commune": "Adjamé", "quartier": "Liberté", "adresse": "Boulevard de la Liberté", "telephone": "+225 27 20 45 67 89", "latitude": 5.356789, "longitude": -4.028901},
    {"nom": "Pharmacie Williamsville", "commune": "Adjamé", "quartier": "Williamsville", "adresse": "Carrefour Williamsville", "telephone": "+225 27 20 46 78 90", "latitude": 5.362345, "longitude": -4.034567},
    
    # Treichville
    {"nom": "Pharmacie Treichville Centre", "commune": "Treichville", "quartier": "Centre", "adresse": "Boulevard Giscard d'Estaing", "telephone": "+225 27 21 23 45 67", "latitude": 5.289012, "longitude": -4.012345},
    {"nom": "Pharmacie Belleville", "commune": "Treichville", "quartier": "Belleville", "adresse": "Rue 12", "telephone": "+225 27 21 24 56 78", "latitude": 5.295678, "longitude": -4.018901},
    
    # Koumassi
    {"nom": "Pharmacie Koumassi Grand Marché", "commune": "Koumassi", "quartier": "Grand Marché", "adresse": "Avenue Principale", "telephone": "+225 27 21 56 78 90", "latitude": 5.289012, "longitude": -3.956789},
    {"nom": "Pharmacie Remblais", "commune": "Koumassi", "quartier": "Remblais", "adresse": "Boulevard des Remblais", "telephone": "+225 27 21 57 89 01", "latitude": 5.295678, "longitude": -3.962345},
    
    # Port-Bouët
    {"nom": "Pharmacie Vridi", "commune": "Port-Bouët", "quartier": "Vridi", "adresse": "Boulevard de Vridi", "telephone": "+225 27 21 67 89 01", "latitude": 5.256789, "longitude": -3.956789},
    {"nom": "Pharmacie Aéroport", "commune": "Port-Bouët", "quartier": "Zone Aéroportuaire", "adresse": "Route de l'Aéroport", "telephone": "+225 27 21 68 90 12", "latitude": 5.262345, "longitude": -3.962345},
    
    # Attécoubé
    {"nom": "Pharmacie Attécoubé Santé", "commune": "Attécoubé", "quartier": "Attécoubé", "adresse": "Rue Principale", "telephone": "+225 27 20 78 90 12", "latitude": 5.345678, "longitude": -4.045678},
    {"nom": "Pharmacie Locodjro", "commune": "Attécoubé", "quartier": "Locodjro", "adresse": "Carrefour Locodjro", "telephone": "+225 27 20 79 01 23", "latitude": 5.351234, "longitude": -4.051234},
    
    # Bingerville
    {"nom": "Pharmacie Bingerville Centre", "commune": "Bingerville", "quartier": "Centre", "adresse": "Avenue Principale", "telephone": "+225 27 22 89 01 23", "latitude": 5.356789, "longitude": -3.889012},
    
    # Anyama
    {"nom": "Pharmacie Anyama Carrefour", "commune": "Anyama", "quartier": "Carrefour", "adresse": "Rond-point Anyama", "telephone": "+225 27 22 90 12 34", "latitude": 5.495678, "longitude": -4.056789},
    
    # Songon
    {"nom": "Pharmacie Songon", "commune": "Songon", "quartier": "Centre", "adresse": "Route Principale", "telephone": "+225 27 23 01 23 45", "latitude": 5.289012, "longitude": -4.256789},
]

def create_test_data():
    """Crée des données de test dans la base de données"""
    db_path = "pharmacies_garde.db"
    
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    # Vider les tables existantes
    cursor.execute("DELETE FROM pharmacies_garde")
    cursor.execute("DELETE FROM sync_history")
    
    # Insérer les pharmacies de test
    date_garde = datetime.now().strftime("%Y-%m-%d")
    derniere_maj = datetime.now().isoformat()
    
    for pharmacie in PHARMACIES_TEST:
        cursor.execute("""
            INSERT INTO pharmacies_garde 
            (nom, commune, quartier, adresse, telephone, date_garde, horaires, latitude, longitude, derniere_maj)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            pharmacie["nom"],
            pharmacie["commune"],
            pharmacie["quartier"],
            pharmacie["adresse"],
            pharmacie["telephone"],
            date_garde,
            "24h/24",
            pharmacie.get("latitude"),
            pharmacie.get("longitude"),
            derniere_maj
        ))
    
    # Ajouter un enregistrement dans l'historique
    cursor.execute("""
        INSERT INTO sync_history (nb_pharmacies, statut, message)
        VALUES (?, ?, ?)
    """, (len(PHARMACIES_TEST), "SUCCESS", f"Données de test créées: {len(PHARMACIES_TEST)} pharmacies"))
    
    conn.commit()
    conn.close()
    
    print(f"✅ {len(PHARMACIES_TEST)} pharmacies de test créées!")
    print("\n📊 Répartition par commune:")
    
    # Compter par commune
    communes_count = {}
    for p in PHARMACIES_TEST:
        commune = p["commune"]
        communes_count[commune] = communes_count.get(commune, 0) + 1
    
    for commune, count in sorted(communes_count.items()):
        print(f"  • {commune}: {count} pharmacie(s)")

if __name__ == "__main__":
    create_test_data()
