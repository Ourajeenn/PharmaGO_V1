import sqlite3

def check_db():
    conn = sqlite3.connect("pharmacies_garde.db")
    cursor = conn.cursor()
    
    cursor.execute("SELECT count(*) FROM pharmacies_garde")
    count = cursor.fetchone()[0]
    print(f"Total pharmacies: {count}")
    
    if count > 0:
        cursor.execute("SELECT nom, commune, telephone FROM pharmacies_garde ORDER BY id DESC LIMIT 5")
        rows = cursor.fetchall()
        print("\nLast 5 entries:")
        for row in rows:
            print(row)
            
    cursor.execute("SELECT * FROM sync_history ORDER BY id DESC LIMIT 3")
    syncs = cursor.fetchall()
    print("\nSync History (Last 3):")
    for sync in syncs:
        print(sync)
        
    conn.close()

if __name__ == "__main__":
    check_db()
