"""
Système de synchronisation des pharmacies de garde d'Abidjan
Source: https://pratik-ci.com/pharmacies-de-garde

Ce script propose plusieurs méthodes pour synchroniser les données
"""

import requests
from bs4 import BeautifulSoup
from datetime import datetime
import json
import time
from typing import List, Dict, Optional
import sqlite3
import os
from dataclasses import dataclass, asdict
try:
    from supabase import create_client, Client
except ImportError:
    create_client = None
    Client = None
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC


@dataclass
class PharmacieGarde:
    """Modèle de données pour une pharmacie de garde"""
    nom: str
    commune: str
    quartier: str
    adresse: str
    telephone: str
    date_garde: str
    horaires: str
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    derniere_maj: str = None


class PharmacieGardeSync:
    """Gestionnaire de synchronisation des pharmacies de garde"""
    
    COMMUNES_ABIDJAN = [
        "Abobo", "Adjamé", "Anyama", "Attécoubé", "Bingerville",
        "Cocody", "Koumassi", "Marcory", "Plateau", "Port-Bouët",
        "Songon", "Treichville", "Yopougon"
    ]
    
    def __init__(self, db_path: str = None):
        if db_path is None:
            # Use default from env or file
            env_path = os.environ.get("DB_PATH", "pharmacies_garde.db")
            # If path is not absolute, make it relative to this script
            if not os.path.isabs(env_path):
                base_dir = os.path.dirname(os.path.abspath(__file__))
                self.db_path = os.path.join(base_dir, env_path)
            else:
                self.db_path = env_path
        else:
            self.db_path = db_path
            
        self.url_source = "https://pratik-ci.com/pharmacies-de-garde"
        self.supabase: Optional[Client] = None
        self.init_database()
        self.init_supabase()

    def init_supabase(self):
        """Initialise la connexion Supabase"""
        url = os.environ.get("SUPABASE_URL")
        key = os.environ.get("SUPABASE_KEY")
        if url and key and create_client:
            try:
                self.supabase = create_client(url, key)
                print("✅ Supabase configuré")
            except Exception as e:
                print(f"⚠️ Erreur config Supabase: {e}")
    
    def init_database(self):
        """Initialise la base de données SQLite"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS pharmacies_garde (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                nom TEXT NOT NULL,
                commune TEXT NOT NULL,
                quartier TEXT,
                adresse TEXT,
                telephone TEXT,
                date_garde TEXT,
                horaires TEXT,
                latitude REAL,
                longitude REAL,
                derniere_maj TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                UNIQUE(nom, commune, date_garde)
            )
        """)
        
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS sync_history (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                date_sync TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                nb_pharmacies INTEGER,
                statut TEXT,
                message TEXT
            )
        """)
        
        conn.commit()
        conn.close()
    
    # MÉTHODE 1: Scraping avec Selenium (pour sites JavaScript)
    def scrape_with_selenium(self) -> List[PharmacieGarde]:
        """
        Scrape le site avec Selenium pour gérer le JavaScript
        Cette méthode est la plus robuste pour les sites modernes
        """
        print("🔄 Démarrage du scraping avec Selenium...")
        
        # Configuration Chrome headless
        chrome_options = Options()
        chrome_options.add_argument("--headless")
        chrome_options.add_argument("--no-sandbox")
        chrome_options.add_argument("--disable-dev-shm-usage")
        chrome_options.add_argument("--user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36")
        
        pharmacies = []
        
        try:
            driver = webdriver.Chrome(options=chrome_options)
            driver.get(self.url_source)
            
            # Attendre que le contenu se charge
            wait = WebDriverWait(driver, 10)
            wait.until(EC.presence_of_element_located((By.CLASS_NAME, "pharmacy-item")))
            
            # Extraire les données (adapter les sélecteurs selon le site réel)
            elements = driver.find_elements(By.CLASS_NAME, "pharmacy-item")
            
            for element in elements:
                try:
                    nom = element.find_element(By.CLASS_NAME, "pharmacy-name").text
                    commune = element.find_element(By.CLASS_NAME, "pharmacy-commune").text
                    
                    # Vérifier si la commune est dans notre liste
                    if any(c.lower() in commune.lower() for c in self.COMMUNES_ABIDJAN):
                        pharmacie = PharmacieGarde(
                            nom=nom,
                            commune=commune,
                            quartier=element.find_element(By.CLASS_NAME, "pharmacy-quartier").text,
                            adresse=element.find_element(By.CLASS_NAME, "pharmacy-address").text,
                            telephone=element.find_element(By.CLASS_NAME, "pharmacy-phone").text,
                            date_garde=datetime.now().strftime("%Y-%m-%d"),
                            horaires="24h/24",
                            derniere_maj=datetime.now().isoformat()
                        )
                        pharmacies.append(pharmacie)
                except Exception as e:
                    print(f"⚠️ Erreur extraction élément: {e}")
                    continue
            
            driver.quit()
            
        except Exception as e:
            print(f"❌ Erreur Selenium: {e}")
        
        return pharmacies
    
    # MÉTHODE 2: Scraping avec requests + BeautifulSoup
    def scrape_with_requests(self) -> List[PharmacieGarde]:
        """
        Scraping simple avec requests et BeautifulSoup
        Fonctionne si le site n'utilise pas trop de JavaScript
        """
        print("🔄 Démarrage du scraping avec requests...")
        
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
            'Accept-Language': 'fr-FR,fr;q=0.9,en;q=0.8',
            'Referer': 'https://pratik-ci.com/'
        }
        
        pharmacies = []
        
        try:
            response = requests.get(self.url_source, headers=headers, timeout=10)
            response.raise_for_status()
            
            soup = BeautifulSoup(response.content, 'html.parser')
            
            # Adapter ces sélecteurs selon la structure réelle du site
            pharmacy_cards = soup.find_all('div', class_='pharmacy-card')
            
            for card in pharmacy_cards:
                try:
                    nom = card.find('h3', class_='pharmacy-name').text.strip()
                    commune = card.find('span', class_='commune').text.strip()
                    
                    if any(c.lower() in commune.lower() for c in self.COMMUNES_ABIDJAN):
                        pharmacie = PharmacieGarde(
                            nom=nom,
                            commune=commune,
                            quartier=card.find('span', class_='quartier').text.strip(),
                            adresse=card.find('p', class_='address').text.strip(),
                            telephone=card.find('a', class_='phone').text.strip(),
                            date_garde=datetime.now().strftime("%Y-%m-%d"),
                            horaires="24h/24",
                            derniere_maj=datetime.now().isoformat()
                        )
                        pharmacies.append(pharmacie)
                except AttributeError:
                    continue
        
        except Exception as e:
            print(f"❌ Erreur scraping: {e}")
        
        return pharmacies
    
    # MÉTHODE 3: API REST si disponible
    def fetch_from_api(self) -> List[PharmacieGarde]:
        """
        Récupère les données via API si disponible
        À utiliser si pratik-ci.com expose une API
        """
        print("🔄 Tentative de récupération via API...")
        
        # URL d'API hypothétique
        api_url = "https://pratik-ci.com/api/pharmacies-de-garde"
        
        headers = {
            'Accept': 'application/json',
            'User-Agent': 'PharmacieGardeApp/1.0'
        }
        
        pharmacies = []
        
        try:
            response = requests.get(api_url, headers=headers, timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                
                for item in data.get('pharmacies', []):
                    if item.get('commune') in self.COMMUNES_ABIDJAN:
                        pharmacie = PharmacieGarde(
                            nom=item['nom'],
                            commune=item['commune'],
                            quartier=item.get('quartier', ''),
                            adresse=item.get('adresse', ''),
                            telephone=item.get('telephone', ''),
                            date_garde=item.get('date_garde', ''),
                            horaires=item.get('horaires', '24h/24'),
                            latitude=item.get('latitude'),
                            longitude=item.get('longitude'),
                            derniere_maj=datetime.now().isoformat()
                        )
                        pharmacies.append(pharmacie)
        
        except Exception as e:
            print(f"⚠️ API non disponible: {e}")
        
        return pharmacies
    
    def save_to_database(self, pharmacies: List[PharmacieGarde]) -> int:
        """Sauvegarde les pharmacies dans la base de données"""
        if not pharmacies:
            return 0
        
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        saved_count = 0
        
        for pharmacie in pharmacies:
            try:
                cursor.execute("""
                    INSERT OR REPLACE INTO pharmacies_garde 
                    (nom, commune, quartier, adresse, telephone, date_garde, horaires, latitude, longitude, derniere_maj)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """, (
                    pharmacie.nom,
                    pharmacie.commune,
                    pharmacie.quartier,
                    pharmacie.adresse,
                    pharmacie.telephone,
                    pharmacie.date_garde,
                    pharmacie.horaires,
                    pharmacie.latitude,
                    pharmacie.longitude,
                    pharmacie.derniere_maj
                ))
                saved_count += 1
            except Exception as e:
                print(f"⚠️ Erreur sauvegarde {pharmacie.nom}: {e}")
        
        # Enregistrer l'historique de sync
        cursor.execute("""
            INSERT INTO sync_history (nb_pharmacies, statut, message)
            VALUES (?, ?, ?)
        """, (saved_count, "SUCCESS", f"{saved_count} pharmacies synchronisées"))
        
        conn.commit()
        conn.close()
        
        return saved_count
    
    def get_pharmacies_by_commune(self, commune: str) -> List[Dict]:
        """Récupère les pharmacies de garde pour une commune"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute("""
            SELECT nom, commune, quartier, adresse, telephone, date_garde, horaires, latitude, longitude
            FROM pharmacies_garde
            WHERE commune = ?
            ORDER BY derniere_maj DESC
        """, (commune,))
        
        columns = [description[0] for description in cursor.description]
        pharmacies = [dict(zip(columns, row)) for row in cursor.fetchall()]
        
        conn.close()
        return pharmacies
    
    def export_to_json(self, filepath: str = "pharmacies_garde.json"):
        """Exporte toutes les pharmacies en JSON"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute("""
            SELECT nom, commune, quartier, adresse, telephone, date_garde, horaires, latitude, longitude, derniere_maj
            FROM pharmacies_garde
            ORDER BY commune, nom
        """)
        
        columns = [description[0] for description in cursor.description]
        pharmacies = [dict(zip(columns, row)) for row in cursor.fetchall()]
        
        conn.close()
        
        with open(filepath, 'w', encoding='utf-8') as f:
            json.dump({
                'date_export': datetime.now().isoformat(),
                'nb_pharmacies': len(pharmacies),
                'pharmacies': pharmacies
            }, f, ensure_ascii=False, indent=2)
        
        print(f"✅ Export JSON: {filepath}")
        return filepath

    def sync_to_supabase(self, pharmacies: List[PharmacieGarde]) -> int:
        """Synchronise les données vers Supabase"""
        if not self.supabase or not pharmacies:
            return 0
        
        print("☁️ Sync vers Supabase...")
        count = 0
        data = [asdict(p) for p in pharmacies]
        
        try:
            # Upsert données (assurez-vous d'avoir une contrainte unique sur nom+commune+date)
            response = self.supabase.table('pharmacies_garde').upsert(data).execute()
            if len(response.data) > 0:
                count = len(response.data)
                print(f"✅ {count} pharmacies envoyées à Supabase")
        except Exception as e:
            print(f"❌ Erreur sync Supabase: {e}")
            
        return count
    
    def sync(self, method: str = "auto") -> int:
        """
        Synchronise les données des pharmacies de garde
        
        Args:
            method: "auto", "selenium", "requests", ou "api"
        
        Returns:
            Nombre de pharmacies synchronisées
        """
        print(f"\n🚀 Début de la synchronisation ({method})...")
        print(f"📅 Date: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        print(f"🏥 Communes cibles: {', '.join(self.COMMUNES_ABIDJAN[:3])}... ({len(self.COMMUNES_ABIDJAN)} total)\n")
        
        pharmacies = []
        
        if method == "auto":
            # Essayer d'abord l'API, puis Selenium, puis requests
            pharmacies = self.fetch_from_api()
            if not pharmacies:
                pharmacies = self.scrape_with_selenium()
            if not pharmacies:
                pharmacies = self.scrape_with_requests()
        elif method == "selenium":
            pharmacies = self.scrape_with_selenium()
        elif method == "requests":
            pharmacies = self.scrape_with_requests()
        elif method == "api":
            pharmacies = self.fetch_from_api()
        
        if pharmacies:
            count = self.save_to_database(pharmacies)
            
            # Sync Supabase si activé
            if os.environ.get("SUPABASE_SYNC_ENABLED", 'false').lower() == 'true':
                self.sync_to_supabase(pharmacies)
                
            print(f"\n✅ Synchronisation réussie: {count} pharmacies")
            
            # Afficher un résumé par commune
            print("\n📊 Résumé par commune:")
            for commune in self.COMMUNES_ABIDJAN:
                pharma_commune = [p for p in pharmacies if p.commune == commune]
                if pharma_commune:
                    print(f"  • {commune}: {len(pharma_commune)} pharmacie(s)")
            
            return count
        else:
            print("\n❌ Aucune pharmacie trouvée")
            return 0


# Fonction pour intégration dans une application
def get_pharmacies_garde_api(commune: str = None) -> Dict:
    """
    API simple pour récupérer les pharmacies de garde
    À utiliser dans votre application de livraison
    
    Args:
        commune: Nom de la commune (optionnel)
    
    Returns:
        Dict avec les pharmacies de garde
    """
    sync = PharmacieGardeSync()
    
    if commune:
        pharmacies = sync.get_pharmacies_by_commune(commune)
    else:
        # Récupérer toutes les pharmacies
        conn = sqlite3.connect(sync.db_path)
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM pharmacies_garde ORDER BY commune, nom")
        columns = [description[0] for description in cursor.description]
        pharmacies = [dict(zip(columns, row)) for row in cursor.fetchall()]
        conn.close()
    
    return {
        'success': True,
        'count': len(pharmacies),
        'commune': commune,
        'pharmacies': pharmacies,
        'timestamp': datetime.now().isoformat()
    }


if __name__ == "__main__":
    # Exemple d'utilisation
    sync = PharmacieGardeSync()
    
    # Synchronisation automatique
    sync.sync(method="auto")
    
    # Exporter en JSON pour votre application
    sync.export_to_json("pharmacies_garde_abidjan.json")
    
    # Exemple de récupération pour une commune spécifique
    pharmacies_cocody = sync.get_pharmacies_by_commune("Cocody")
    print(f"\n🏥 Pharmacies de garde à Cocody: {len(pharmacies_cocody)}")
    for p in pharmacies_cocody:
        print(f"  • {p['nom']} - {p['adresse']}")
