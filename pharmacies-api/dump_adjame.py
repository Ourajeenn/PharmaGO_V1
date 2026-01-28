from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.chrome.service import Service
from webdriver_manager.chrome import ChromeDriverManager
import time

def dump_html(url, filename):
    options = Options()
    options.add_argument("--headless")
    options.add_argument("--no-sandbox")
    options.add_argument("--disable-dev-shm-usage")
    # Added some common headers to bypass detection
    options.add_argument("user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36")
    
    service = Service(ChromeDriverManager().install())
    driver = webdriver.Chrome(service=service, options=options)
    
    print(f"Opening {url}...")
    driver.get(url)
    
    # Wait for the challenge to be solved (LWS usually takes 5-10 seconds)
    print("Waiting 15 seconds for DDoS challenge/page load...")
    time.sleep(15)
    
    with open(filename, "w", encoding="utf-8") as f:
        f.write(driver.page_source)
    
    # Take a screenshot to see if we got through
    driver.save_screenshot(filename.replace(".html", ".png"))
    
    driver.quit()
    print(f"Dumped to {filename}")

if __name__ == "__main__":
    dump_html("https://pratik-ci.com/pharmacies-de-garde/adjame", "adjame_raw.html")
