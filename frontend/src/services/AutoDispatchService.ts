export interface Driver {
    id: string;
    name: string;
    status: 'idle' | 'busy' | 'offline';
    location: { lat: number; lng: number };
    currentLoads: number;
    rating: number;
}

export interface DeliveryMission {
    id: string;
    priority: 'low' | 'medium' | 'high' | 'urgent';
    pickupLocation: string;
    deliveryLocation: string;
    status: 'pending' | 'assigned' | 'in_transit' | 'delivered';
}

class AutoDispatchService {
    private drivers: Driver[] = [
        { id: 'D1', name: 'Moussa K.', status: 'idle', location: { lat: 5.3484, lng: -4.0152 }, currentLoads: 0, rating: 4.8 },
        { id: 'D2', name: 'Jean P.', status: 'idle', location: { lat: 5.3167, lng: -4.0333 }, currentLoads: 0, rating: 4.9 },
        { id: 'D3', name: 'Awa D.', status: 'busy', location: { lat: 5.3500, lng: -3.9800 }, currentLoads: 2, rating: 4.7 },
        { id: 'D4', name: 'Koffi Y.', status: 'idle', location: { lat: 5.3333, lng: -4.0000 }, currentLoads: 0, rating: 4.5 },
    ];

    calculateDispatch(mission: DeliveryMission): Driver | null {
        // Simple algorithm: find closest idle driver with best rating
        const availableDrivers = this.drivers.filter(d => d.status === 'idle');

        if (availableDrivers.length === 0) return null;

        // Sorting by a combined score (hypothetical distance + rating * 10)
        // For simulation, we'll just pick the one with highest rating for priority 'urgent'
        return availableDrivers.sort((a, b) => b.rating - a.rating)[0];
    }

    getLiveFleetStatus() {
        return this.drivers;
    }

    simulateDispatchUpdate(missionId: string) {
        return new Promise((resolve) => {
            setTimeout(() => {
                const driver = this.calculateDispatch({ id: missionId } as DeliveryMission);
                resolve({
                    missionId,
                    assignedDriver: driver,
                    timestamp: new Date().toISOString(),
                    optimizationMethod: 'Greedy Randomized Dispatch'
                });
            }, 1500);
        });
    }
}

export const autoDispatch = new AutoDispatchService();
