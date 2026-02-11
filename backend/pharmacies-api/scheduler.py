
import os
import time
import schedule
import logging
from datetime import datetime
from pharmacie_garde_sync import PharmacieGardeSync

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler("scheduler.log"),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger("Scheduler")

def run_sync():
    logger.info("🔄 Starting scheduled sync...")
    try:
        sync = PharmacieGardeSync()
        count = sync.sync(method="auto")
        logger.info(f"✅ Sync completed. Total pharmacies: {count}")
    except Exception as e:
        logger.error(f"❌ Sync failed: {e}", exc_info=True)

if __name__ == "__main__":
    # Get interval from env or default to 6 hours
    interval = int(os.getenv('AUTO_SYNC_INTERVAL', 21600))
    
    logger.info(f"🚀 Scheduler started. Sync interval: {interval} seconds")
    
    # Run immediately on startup
    run_sync()
    
    # Schedule future runs
    schedule.every(interval).seconds.do(run_sync)
    
    while True:
        schedule.run_pending()
        time.sleep(1)
