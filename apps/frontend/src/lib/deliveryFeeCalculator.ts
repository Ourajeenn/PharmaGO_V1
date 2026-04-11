interface DeliveryFeeOptions {
  distance?: number; // en km
  urgency?: 'standard' | 'express' | 'urgent';
  timeOfDay?: Date;
  weatherCondition?: 'sunny' | 'rainy' | 'stormy';
  pharmacyCount?: number;
}

interface DeliveryFeeBreakdown {
  baseFee: number;
  distanceFee: number;
  urgencyFee: number;
  nightFee: number;
  weatherFee: number;
  total: number;
  estimatedTime: string;
}

export const calculateDeliveryFee = (options: DeliveryFeeOptions): DeliveryFeeBreakdown => {
  const {
    distance = 5, // Distance par défaut en km
    urgency = 'standard',
    timeOfDay = new Date(),
    weatherCondition = 'sunny',
    pharmacyCount = 1
  } = options;

  // Frais de base par pharmacie
  const baseFee = 500 * pharmacyCount; // 500 FCFA par pharmacie
  
  // Frais de distance (100 FCFA/km après les 3 premiers km)
  const distanceFee = distance > 3 ? Math.ceil((distance - 3) * 100) : 0;
  
  // Frais d'urgence
  let urgencyFee = 0;
  let estimatedTime = '30-45 min';
  
  switch (urgency) {
    case 'express':
      urgencyFee = 1000;
      estimatedTime = '15-25 min';
      break;
    case 'urgent':
      urgencyFee = 2000;
      estimatedTime = '10-15 min';
      break;
    default:
      estimatedTime = '30-45 min';
  }
  
  // Frais de nuit (21h - 6h)
  const hours = timeOfDay.getHours();
  const isNight = hours >= 21 || hours < 6;
  const nightFee = isNight ? 500 : 0;
  
  // Frais météo
  let weatherFee = 0;
  switch (weatherCondition) {
    case 'rainy':
      weatherFee = 300;
      break;
    case 'stormy':
      weatherFee = 500;
      break;
  }
  
  const total = baseFee + distanceFee + urgencyFee + nightFee + weatherFee;
  
  return {
    baseFee,
    distanceFee,
    urgencyFee,
    nightFee,
    weatherFee,
    total,
    estimatedTime
  };
};

// Fonction pour estimer la distance (simplifiée sans Mapbox pour l'instant)
export const estimateDistance = (
  pharmacyLat?: number,
  pharmacyLng?: number,
  patientLat?: number,
  patientLng?: number
): number => {
  if (!pharmacyLat || !pharmacyLng || !patientLat || !patientLng) {
    return 5; // Distance par défaut
  }
  
  // Formule de Haversine pour calculer la distance
  const R = 6371; // Rayon de la Terre en km
  const dLat = (patientLat - pharmacyLat) * Math.PI / 180;
  const dLon = (patientLng - pharmacyLng) * Math.PI / 180;
  
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(pharmacyLat * Math.PI / 180) * 
    Math.cos(patientLat * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  
  return Math.round(distance * 10) / 10; // Arrondi à 1 décimale
};
