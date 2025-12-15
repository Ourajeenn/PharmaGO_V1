// Offline Synchronization Library for PharmaGo Express

interface QueuedAction {
    id: string;
    type: 'order' | 'update' | 'delete';
    timestamp: number;
    data: any;
    retryCount: number;
}

class OfflineSyncManager {
    private dbName = 'pharmago_offline';
    private dbVersion = 1;
    private db: IDBDatabase | null = null;

    // Initialize IndexedDB
    async initialize(): Promise<void> {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.dbName, this.dbVersion);

            request.onerror = () => reject(request.error);
            request.onsuccess = () => {
                this.db = request.result;
                resolve();
            };

            request.onupgradeneeded = (event) => {
                const db = (event.target as IDBOpenDBRequest).result;

                // Create object stores
                if (!db.objectStoreNames.contains('actions')) {
                    const actionStore = db.createObjectStore('actions', { keyPath: 'id' });
                    actionStore.createIndex('timestamp', 'timestamp', { unique: false });
                    actionStore.createIndex('type', 'type', { unique: false });
                }

                if (!db.objectStoreNames.contains('cache')) {
                    const cacheStore = db.createObjectStore('cache', { keyPath: 'key' });
                    cacheStore.createIndex('expiry', 'expiry', { unique: false });
                }

                if (!db.objectStoreNames.contains('medicines')) {
                    db.createObjectStore('medicines', { keyPath: 'id' });
                }

                if (!db.objectStoreNames.contains('pharmacies')) {
                    db.createObjectStore('pharmacies', { keyPath: 'id' });
                }
            };
        });
    }

    // Queue an action for later synchronization
    async queueAction(action: Omit<QueuedAction, 'id' | 'timestamp' | 'retryCount'>): Promise<void> {
        if (!this.db) await this.initialize();

        const queuedAction: QueuedAction = {
            ...action,
            id: `${action.type}_${Date.now()}_${Math.random()}`,
            timestamp: Date.now(),
            retryCount: 0,
        };

        return new Promise((resolve, reject) => {
            const transaction = this.db!.transaction(['actions'], 'readwrite');
            const store = transaction.objectStore('actions');
            const request = store.add(queuedAction);

            request.onsuccess = () => {
                console.log('[OfflineSync] Action queued:', queuedAction);
                resolve();
            };
            request.onerror = () => reject(request.error);
        });
    }

    // Get all queued actions
    async getQueuedActions(): Promise<QueuedAction[]> {
        if (!this.db) await this.initialize();

        return new Promise((resolve, reject) => {
            const transaction = this.db!.transaction(['actions'], 'readonly');
            const store = transaction.objectStore('actions');
            const request = store.getAll();

            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    // Remove an action from the queue
    async removeAction(id: string): Promise<void> {
        if (!this.db) await this.initialize();

        return new Promise((resolve, reject) => {
            const transaction = this.db!.transaction(['actions'], 'readwrite');
            const store = transaction.objectStore('actions');
            const request = store.delete(id);

            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
    }

    // Synchronize all queued actions
    async syncAll(): Promise<void> {
        const actions = await this.getQueuedActions();
        console.log(`[OfflineSync] Syncing ${actions.length} actions...`);

        for (const action of actions) {
            try {
                await this.syncAction(action);
                await this.removeAction(action.id);
                console.log('[OfflineSync] Action synced:', action.id);
            } catch (error) {
                console.error('[OfflineSync] Failed to sync action:', action.id, error);

                // Increment retry count
                action.retryCount++;

                // Remove if too many retries
                if (action.retryCount > 3) {
                    await this.removeAction(action.id);
                    console.log('[OfflineSync] Action removed after max retries:', action.id);
                }
            }
        }
    }

    // Sync a single action
    private async syncAction(action: QueuedAction): Promise<void> {
        const endpoint = this.getEndpoint(action.type);
        const method = this.getMethod(action.type);

        const response = await fetch(endpoint, {
            method,
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(action.data),
        });

        if (!response.ok) {
            throw new Error(`Failed to sync action: ${response.statusText}`);
        }
    }

    // Cache data for offline use
    async cacheData(key: string, data: any, expiryMs: number = 3600000): Promise<void> {
        if (!this.db) await this.initialize();

        const cacheEntry = {
            key,
            data,
            expiry: Date.now() + expiryMs,
        };

        return new Promise((resolve, reject) => {
            const transaction = this.db!.transaction(['cache'], 'readwrite');
            const store = transaction.objectStore('cache');
            const request = store.put(cacheEntry);

            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
    }

    // Get cached data
    async getCachedData(key: string): Promise<any | null> {
        if (!this.db) await this.initialize();

        return new Promise((resolve, reject) => {
            const transaction = this.db!.transaction(['cache'], 'readonly');
            const store = transaction.objectStore('cache');
            const request = store.get(key);

            request.onsuccess = () => {
                const result = request.result;

                if (!result) {
                    resolve(null);
                    return;
                }

                // Check if expired
                if (result.expiry < Date.now()) {
                    // Delete expired entry
                    this.deleteCachedData(key);
                    resolve(null);
                } else {
                    resolve(result.data);
                }
            };
            request.onerror = () => reject(request.error);
        });
    }

    // Delete cached data
    async deleteCachedData(key: string): Promise<void> {
        if (!this.db) await this.initialize();

        return new Promise((resolve, reject) => {
            const transaction = this.db!.transaction(['cache'], 'readwrite');
            const store = transaction.objectStore('cache');
            const request = store.delete(key);

            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
    }

    // Save medicines for offline browsing
    async saveMedicines(medicines: any[]): Promise<void> {
        if (!this.db) await this.initialize();

        const transaction = this.db!.transaction(['medicines'], 'readwrite');
        const store = transaction.objectStore('medicines');

        for (const medicine of medicines) {
            store.put(medicine);
        }

        return new Promise((resolve, reject) => {
            transaction.oncomplete = () => resolve();
            transaction.onerror = () => reject(transaction.error);
        });
    }

    // Get offline medicines
    async getOfflineMedicines(): Promise<any[]> {
        if (!this.db) await this.initialize();

        return new Promise((resolve, reject) => {
            const transaction = this.db!.transaction(['medicines'], 'readonly');
            const store = transaction.objectStore('medicines');
            const request = store.getAll();

            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    // Save pharmacies for offline browsing
    async savePharmacies(pharmacies: any[]): Promise<void> {
        if (!this.db) await this.initialize();

        const transaction = this.db!.transaction(['pharmacies'], 'readwrite');
        const store = transaction.objectStore('pharmacies');

        for (const pharmacy of pharmacies) {
            store.put(pharmacy);
        }

        return new Promise((resolve, reject) => {
            transaction.oncomplete = () => resolve();
            transaction.onerror = () => reject(transaction.error);
        });
    }

    // Get offline pharmacies
    async getOfflinePharmacies(): Promise<any[]> {
        if (!this.db) await this.initialize();

        return new Promise((resolve, reject) => {
            const transaction = this.db!.transaction(['pharmacies'], 'readonly');
            const store = transaction.objectStore('pharmacies');
            const request = store.getAll();

            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    // Helper methods
    private getEndpoint(type: string): string {
        const endpoints: Record<string, string> = {
            order: '/api/orders',
            update: '/api/orders/update',
            delete: '/api/orders/delete',
        };
        return endpoints[type] || '/api/sync';
    }

    private getMethod(type: string): string {
        const methods: Record<string, string> = {
            order: 'POST',
            update: 'PATCH',
            delete: 'DELETE',
        };
        return methods[type] || 'POST';
    }
}

// Event listeners for online/offline status
export const setupOfflineSync = () => {
    const syncManager = new OfflineSyncManager();

    // Sync when coming back online
    window.addEventListener('online', async () => {
        console.log('[OfflineSync] Online - starting sync...');
        try {
            await syncManager.syncAll();
            console.log('[OfflineSync] Sync completed');
        } catch (error) {
            console.error('[OfflineSync] Sync failed:', error);
        }
    });

    // Log offline status
    window.addEventListener('offline', () => {
        console.log('[OfflineSync] Offline mode activated');
    });

    return syncManager;
};

export const offlineSync = new OfflineSyncManager();
export default offlineSync;
