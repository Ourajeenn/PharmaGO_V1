import { getDistance } from 'geolib';

export interface Location {
    latitude: number;
    longitude: number;
}

export interface PharmacyStock {
    id: string;
    name: string;
    location: Location;
    availableItems: { [itemId: string]: number }; // itemId -> quantity
    isOnDuty?: boolean;
}

export interface RouteStop {
    pharmacyId: string;
    pharmacyName: string;
    location: Location;
    itemsToPickup: { itemId: string; quantity: number }[];
}

export interface RoutingResult {
    stops: RouteStop[];
    totalDistance: number;
    estimatedTimeParams: {
        baseHandlingMins: number; // 2 mins per stop
        travelMins: number; // roughly 2 mins per km in Abidjan traffic
    };
    isComplete: boolean;
    missingItems: { itemId: string; quantity: number }[];
}

// Mock database of pharmacies and their stock. 
// In production, this would be an API call to a Redis/PostgreSQL backend tracking real-time POS data.
export const mockPharmacies: PharmacyStock[] = [
    {
        id: "pharma-1",
        name: "Pharmacie de la Grâce (Plateau)",
        location: { latitude: 5.320357, longitude: -4.016107 },
        availableItems: { "doli-1000": 50, "amox-500": 10, "vit-c": 100 },
        isOnDuty: true
    },
    {
        id: "pharma-2",
        name: "Pharmacie Sainte-Marie (Cocody)",
        location: { latitude: 5.359951, longitude: -3.989745 },
        availableItems: { "doli-1000": 0, "amox-500": 50, "syrup-toux": 20 },
        isOnDuty: false
    },
    {
        id: "pharma-3",
        name: "Pharmacie Saint-Sauveur (Marcory)",
        location: { latitude: 5.303358, longitude: -3.987742 },
        availableItems: { "doli-1000": 20, "syrup-toux": 0, "vit-c": 5 },
        isOnDuty: true
    }
];

/**
 * Basic Greedy heuristic for the Traveling Salesperson Problem (Nearest Neighbor)
 * Adapté pour le "Pickup and Delivery" où l'on doit visiter un sous-ensemble de pharmacies.
 */
export const calculateOptimalRoute = (
    userLocation: Location,
    driverLocation: Location,
    requestedItems: { itemId: string; quantity: number }[]
): RoutingResult => {

    // 1. Identify which pharmacies carry which items
    let remainingRequests = [...requestedItems];
    const selectedStopsMap = new Map<string, RouteStop>();

    // For simplicity: loop through requested items, find the nearest pharmacy to the *previous* point 
    // that has the stock. But actually, it's better to greedily pick pharmacies that fulfill the MOST items first, 
    // or just find the set of pharmacies that completely fulfill the order.

    // Let's do a simple approach: 
    // Try to satisfy the order from a single pharmacy first (the closest one).
    // If not, add the next closest pharmacy that has the missing items.

    while (remainingRequests.length > 0) {
        let bestPharma: PharmacyStock | null = null;
        let maxItemsFulfilled = 0;
        let bestDistance = Infinity;

        // Compare pharmacies based on how many remaining items they can fulfill, ties broken by distance to delivery
        for (const pharma of mockPharmacies) {
            let itemsItCanFulfill = 0;
            remainingRequests.forEach(req => {
                if (pharma.availableItems[req.itemId] >= req.quantity) {
                    itemsItCanFulfill++;
                }
            });

            if (itemsItCanFulfill > 0) {
                const dist = getDistance(
                    { latitude: userLocation.latitude, longitude: userLocation.longitude },
                    { latitude: pharma.location.latitude, longitude: pharma.location.longitude }
                );

                if (itemsItCanFulfill > maxItemsFulfilled || (itemsItCanFulfill === maxItemsFulfilled && dist < bestDistance)) {
                    bestPharma = pharma;
                    maxItemsFulfilled = itemsItCanFulfill;
                    bestDistance = dist;
                }
            }
        }

        if (!bestPharma) {
            // Cannot find stock anywhere else
            break;
        }

        // Add this pharmacy to stops
        const itemsToPickupFromHere: { itemId: string; quantity: number }[] = [];
        const nextRemaining: { itemId: string; quantity: number }[] = [];

        remainingRequests.forEach(req => {
            if (bestPharma!.availableItems[req.itemId] >= req.quantity) {
                itemsToPickupFromHere.push(req);
            } else {
                nextRemaining.push(req);
            }
        });

        selectedStopsMap.set(bestPharma.id, {
            pharmacyId: bestPharma.id,
            pharmacyName: bestPharma.name,
            location: bestPharma.location,
            itemsToPickup: itemsToPickupFromHere
        });

        remainingRequests = nextRemaining;
    }

    // 2. We have a set of stops. Now order them using Nearest Neighbor starting from Driver's location.
    const orderedStops: RouteStop[] = [];
    const unorderedStops = Array.from(selectedStopsMap.values());
    let currentLocation = driverLocation;
    let totalDistance = 0;

    while (unorderedStops.length > 0) {
        let nearestIdx = 0;
        let minDest = Infinity;

        unorderedStops.forEach((stop, idx) => {
            const dist = getDistance(
                { latitude: currentLocation.latitude, longitude: currentLocation.longitude },
                { latitude: stop.location.latitude, longitude: stop.location.longitude }
            );
            if (dist < minDest) {
                minDest = dist;
                nearestIdx = idx;
            }
        });

        const nextStop = unorderedStops.splice(nearestIdx, 1)[0];
        orderedStops.push(nextStop);
        totalDistance += minDest;
        currentLocation = nextStop.location;
    }

    // Add distance from last stop to user
    if (orderedStops.length > 0) {
        const lastStop = orderedStops[orderedStops.length - 1];
        totalDistance += getDistance(
            { latitude: lastStop.location.latitude, longitude: lastStop.location.longitude },
            { latitude: userLocation.latitude, longitude: userLocation.longitude }
        );
    }

    // Travel time heuristic: Assume average speed of 30 km/h in Abidjan (500 meters per min) -> 2 mins per km
    const travelMins = Math.round((totalDistance / 1000) * 2);
    const handlingMins = orderedStops.length * 2; // 2 mins per pickup

    return {
        stops: orderedStops,
        totalDistance,
        estimatedTimeParams: {
            baseHandlingMins: handlingMins,
            travelMins
        },
        isComplete: remainingRequests.length === 0,
        missingItems: remainingRequests
    };
};

/**
 * Helper to determine single product status logic for UI
 */
export const getProductStockStatus = (itemId: string, userLocation: Location) => {
    // Find closest pharmacy with stock
    let closestPharma: PharmacyStock | null = null;
    let minDest = Infinity;

    for (const pharma of mockPharmacies) {
        if (pharma.availableItems[itemId] && pharma.availableItems[itemId] > 0) {
            const dist = getDistance(
                { latitude: userLocation.latitude, longitude: userLocation.longitude },
                { latitude: pharma.location.latitude, longitude: pharma.location.longitude }
            );
            if (dist < minDest) {
                minDest = dist;
                closestPharma = pharma;
            }
        }
    }

    if (!closestPharma) {
        return { isAvailable: false, message: "Rupture de stock complète", type: "error" };
    }

    const distKm = (minDest / 1000).toFixed(1);
    const travelMins = Math.round((minDest / 1000) * 2) + 5; // adding base time

    if (minDest < 3000) {
        return {
            isAvailable: true,
            message: `En stock — livraison en ~${travelMins} min`,
            type: "success",
            pharmacyName: closestPharma.name
        };
    } else {
        return {
            isAvailable: true,
            message: `Disponible à ${closestPharma.name} — +${travelMins} min de livraison`,
            type: "warning",
            pharmacyName: closestPharma.name
        };
    }
};
