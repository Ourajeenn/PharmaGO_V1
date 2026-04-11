"""
Script amélioré pour synchroniser les pharmacies de garde depuis pratik-ci.com
Contourne les blocages 403 et permet la synchronisation automatique
"""

import requests
from bs4 import BeautifulSoup
from datetime import datetime
import json
import time
import sqlite3
from typing import List, Dict
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from webdriver_manager.chrome import ChromeDriverManager
import logging

# Configuration du logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

class PratikCIScraper:
    """Scraper amélioré pour pratik-ci.com avec contournement du blocage 403"""
    
    def __init__(self, db_path: str = "pharmacies_garde.db"):
        self.db_path = db_path
        self.url_source = "https://pratik-ci.com/pharmacies-de-garde"
        self.init_database()
    
    def init_database(self):
        """Initialise la base de données"""
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
        logger.info("✅ Base de données initialisée")
    
    def scrape_with_selenium_advanced(self) -> List[Dict]:
        """
        Scraping avancé avec Selenium: navigation par communes et parsing des tableaux
        """
        logger.info("🔄 Démarrage du scraping avancé avec Selenium...")
        
        chrome_options = Options()
        chrome_options.add_argument("--headless")
        chrome_options.add_argument("--no-sandbox")
        chrome_options.add_argument("--disable-dev-shm-usage")
        chrome_options.add_argument("--disable-blink-features=AutomationControlled")
        chrome_options.add_experimental_option("excludeSwitches", ["enable-automation"])
        chrome_options.add_experimental_option('useAutomationExtension', False)
        
        # User agent réaliste
        chrome_options.add_argument("user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36")
        
        pharmacies = []
        
        try:
            # Utiliser webdriver-manager pour gérer ChromeDriver automatiquement
            service = Service(ChromeDriverManager().install())
            driver = webdriver.Chrome(service=service, options=chrome_options)
            
            # Masquer l'automatisation
            driver.execute_script("Object.defineProperty(navigator, 'webdriver', {get: () => undefined})")
            
            logger.info(f"📡 Connexion à la page principale: {self.url_source}...")
            driver.get(self.url_source)
            
            # Attendre la résolution du challenge DDoS
            logger.info("⏳ Attente de résolution du challenge DDoS (10s)...")
            time.sleep(10)
            
            # Gérer le popup de consentement
            try:
                consent_btn = WebDriverWait(driver, 5).until(
                    EC.element_to_be_clickable((By.XPATH, "//button[contains(., 'Autoriser')]"))
                )
                consent_btn.click()
                logger.info("✅ Consentement accepté")
                time.sleep(2)
            except:
                logger.info("ℹ️ Pas de popup de consentement détecté")
            
            # 1. Récupérer les liens des communes
            soup_main = BeautifulSoup(driver.page_source, 'html.parser')
            commune_links = []
            
            # Chercher dans la liste trivia (comme vu dans le HTML)
            trivia_items = soup_main.find_all('li', class_='trivia-item')
            for item in trivia_items:
                parent_a = item.find_parent('a')
                if parent_a and 'href' in parent_a.attrs:
                    commune_name = item.get_text(strip=True)
                    commune_url = parent_a['href']
                    if not commune_url.startswith('http'):
                        commune_url = "https://pratik-ci.com" + commune_url
                    commune_links.append((commune_name, commune_url))
            
            if not commune_links:
                # Tentative alternative via les liens directs
                for a in soup_main.find_all('a', href=True):
                    if '/pharmacies-de-garde/' in a['href'] and len(a['href'].split('/')) > 2:
                        name = a.get_text(strip=True)
                        if name and name.lower() != 'pharmacies de garde':
                            url = a['href']
                            if not url.startswith('http'):
                                url = "https://pratik-ci.com" + url
                            commune_links.append((name, url))
            
            logger.info(f"📍 Trouvé {len(commune_links)} communes à explorer")
            
            # 2. Explorer chaque commune
            for commune_name, commune_url in commune_links:
                logger.info(f"🏙️ Scraping commune: {commune_name} ({commune_url})")
                try:
                    driver.get(commune_url)
                    
                    # Attendre chargement et gérer potentiel popup
                    time.sleep(5)
                    try:
                        consent_btn = driver.find_element(By.XPATH, "//button[contains(., 'Autoriser')]")
                        if consent_btn.is_displayed():
                            consent_btn.click()
                            time.sleep(2)
                    except:
                        pass
                        
                    soup_commune = BeautifulSoup(driver.page_source, 'html.parser')
                    
                    # Chercher tous les tableaux et trouver celui qui contient des pharmacies
                    tables = soup_commune.find_all('table')
                    commune_count = 0
                    
                    for table in tables:
                        rows = table.find_all('tr')
                        for row in rows:
                            cols = row.find_all('td')
                            if len(cols) >= 2:
                                text_cols = [c.get_text(strip=True) for c in cols]
                                nom = ""
                                idx_nom = -1
                                for i, text in enumerate(text_cols):
                                    if 'pharmacie' in text.lower():
                                        nom = text
                                        idx_nom = i
                                        break
                                
                                if nom:
                                    adresse = ""
                                    if idx_nom + 1 < len(text_cols):
                                        adresse = text_cols[idx_nom + 1]
                                    
                                    telephones = []
                                    for a_tel in row.find_all('a', href=True):
                                        if 'tel:' in a_tel['href']:
                                            tel = a_tel.get_text(strip=True).replace(' ', '')
                                            if tel: telephones.append(tel)
                                    
                                    telephone = " / ".join(telephones) if telephones else text_cols[-1]
                                    
                                    pharmacie = {
                                        'nom': nom,
                                        'commune': commune_name,
                                        'adresse': adresse,
                                        'telephone': telephone,
                                        'date_garde': datetime.now().strftime("%Y-%m-%d"),
                                        'horaires': '24h/24'
                                    }
                                    pharmacies.append(pharmacie)
                                    commune_count += 1
                        
                        if commune_count > 0:
                            break # On a trouvé le bon tableau pour cette commune
                    
                    logger.info(f"  ✅ {commune_name}: {commune_count} pharmacies trouvées")
                    
                    if commune_count == 0:
                        driver.save_screenshot(f"zero_{commune_name}.png")
                                
                except Exception as e:
                    logger.error(f"  ❌ Erreur sur {commune_name}: {e}")
                    continue
            
            driver.quit()
            logger.info(f"🎉 Scraping terminé: {len(pharmacies)} pharmacies trouvées au total")
            
        except Exception as e:
            logger.error(f"❌ Erreur critique Selenium: {e}")
            if 'driver' in locals():
                driver.quit()
        
        return pharmacies
    
    def scrape_with_requests_advanced(self) -> List[Dict]:
        """
        Scraping avec requests (fallback, souvent bloqué par le DDoS protection)
        """
        logger.info("🔄 Tentative de fallback avec requests...")
        # Note: requests a peu de chances de passer le challenge DDoS d'Anubis,
        # mais on garde la structure au cas où.
        return []
    
    def sync_from_pratik(self) -> int:
        """
        Synchronise les données depuis pratik-ci.com
        """
        logger.info("\n" + "="*60)
        logger.info("🚀 DÉBUT DE LA SYNCHRONISATION AVEC PRATIK-CI.COM")
        logger.info("="*60 + "\n")
        
        pharmacies = self.scrape_with_selenium_advanced()
        
        if pharmacies:
            count = self.save_to_database(pharmacies)
            logger.info(f"\n✅ Synchronisation terminée avec succès: {count} pharmacies mises à jour")
            return count
        else:
            logger.warning("\n⚠️ Échec du scraping: Aucune donnée récupérée")
            return 0
    
    def save_to_database(self, pharmacies: List[Dict]) -> int:
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
                    pharmacie.get('nom', ''),
                    pharmacie.get('commune', ''),
                    pharmacie.get('quartier', ''),
                    pharmacie.get('adresse', ''),
                    pharmacie.get('telephone', ''),
                    pharmacie.get('date_garde', datetime.now().strftime("%Y-%m-%d")),
                    pharmacie.get('horaires', '24h/24'),
                    pharmacie.get('latitude'),
                    pharmacie.get('longitude'),
                    datetime.now().isoformat()
                ))
                saved_count += 1
            except Exception as e:
                logger.error(f"⚠️ Erreur sauvegarde: {e}")
        
        # Historique
        cursor.execute("""
            INSERT INTO sync_history (nb_pharmacies, statut, message)
            VALUES (?, ?, ?)
        """, (saved_count, "SUCCESS" if saved_count > 0 else "FAILED", 
              f"{saved_count} pharmacies synchronisées depuis pratik-ci.com"))
        
        conn.commit()
        conn.close()
        
        return saved_count


if __name__ == "__main__":
    scraper = PratikCIScraper()
    scraper.sync_from_pratik()
