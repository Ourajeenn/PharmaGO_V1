/**
 * Service pour l'intégration des pharmacies de garde dans React/React Native
 * 
 * Installation:
 * npm install axios
 */

import axios from 'axios';

// Configuration de l'API
const API_BASE_URL = 'http://localhost:5000/api';
// Pour production: const API_BASE_URL = 'https://votre-domaine.com/api';

// Instance axios avec configuration par défaut
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  }
});

// Service des pharmacies de garde
export const PharmacieService = {
  
  /**
   * Récupère toutes les pharmacies de garde
   * @param {Object} options - Options de filtrage
   * @param {string} options.date - Filtrer par date (YYYY-MM-DD)
   * @param {number} options.limit - Nombre maximum de résultats
   */
  async getAllPharmacies(options = {}) {
    try {
      const params = new URLSearchParams();
      if (options.date) params.append('date', options.date);
      if (options.limit) params.append('limit', options.limit);
      
      const response = await apiClient.get(`/pharmacies?${params}`);
      return response.data;
    } catch (error) {
      console.error('Erreur getAllPharmacies:', error);
      throw error;
    }
  },

  /**
   * Récupère les pharmacies d'une commune
   * @param {string} commune - Nom de la commune
   */
  async getPharmaciesByCommune(commune) {
    try {
      const response = await apiClient.get(`/pharmacies/${commune}`);
      return response.data;
    } catch (error) {
      console.error('Erreur getPharmaciesByCommune:', error);
      throw error;
    }
  },

  /**
   * Recherche de pharmacies
   * @param {string} query - Terme de recherche
   * @param {string} commune - Filtrer par commune (optionnel)
   */
  async searchPharmacies(query, commune = null) {
    try {
      const params = new URLSearchParams({ q: query });
      if (commune) params.append('commune', commune);
      
      const response = await apiClient.get(`/pharmacies/search?${params}`);
      return response.data;
    } catch (error) {
      console.error('Erreur searchPharmacies:', error);
      throw error;
    }
  },

  /**
   * Trouve les pharmacies les plus proches
   * @param {number} latitude - Latitude
   * @param {number} longitude - Longitude
   * @param {number} limit - Nombre de résultats
   */
  async getNearestPharmacies(latitude, longitude, limit = 5) {
    try {
      const response = await apiClient.post('/pharmacies/nearest', {
        latitude,
        longitude,
        limit
      });
      return response.data;
    } catch (error) {
      console.error('Erreur getNearestPharmacies:', error);
      throw error;
    }
  },

  /**
   * Récupère la liste des communes disponibles
   */
  async getCommunes() {
    try {
      const response = await apiClient.get('/communes');
      return response.data;
    } catch (error) {
      console.error('Erreur getCommunes:', error);
      throw error;
    }
  },

  /**
   * Force une synchronisation
   * @param {string} method - Méthode de sync (auto, selenium, requests, api)
   */
  async forceSync(method = 'auto') {
    try {
      const response = await apiClient.post('/sync', { method });
      return response.data;
    } catch (error) {
      console.error('Erreur forceSync:', error);
      throw error;
    }
  },

  /**
   * Récupère les statistiques
   */
  async getStats() {
    try {
      const response = await apiClient.get('/stats');
      return response.data;
    } catch (error) {
      console.error('Erreur getStats:', error);
      throw error;
    }
  },

  /**
   * Vérifie l'état du service
   */
  async checkHealth() {
    try {
      const response = await apiClient.get('/health');
      return response.data;
    } catch (error) {
      console.error('Erreur checkHealth:', error);
      throw error;
    }
  }
};

// Hook React personnalisé pour utiliser le service
export function usePharmaciesGarde() {
  const [pharmacies, setPharmacies] = React.useState([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState(null);

  const loadPharmacies = async (commune = null) => {
    setLoading(true);
    setError(null);
    
    try {
      const data = commune 
        ? await PharmacieService.getPharmaciesByCommune(commune)
        : await PharmacieService.getAllPharmacies();
      
      setPharmacies(data.pharmacies || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return { pharmacies, loading, error, loadPharmacies };
}

// Exemple de composant React
export function PharmaciesGardeList({ commune }) {
  const { pharmacies, loading, error, loadPharmacies } = usePharmaciesGarde();

  React.useEffect(() => {
    loadPharmacies(commune);
  }, [commune]);

  if (loading) {
    return <div className="loading">Chargement des pharmacies...</div>;
  }

  if (error) {
    return <div className="error">Erreur: {error}</div>;
  }

  return (
    <div className="pharmacies-list">
      <h2>Pharmacies de garde {commune ? `- ${commune}` : ''}</h2>
      <p className="count">{pharmacies.length} pharmacie(s) disponible(s)</p>
      
      <div className="pharmacies-grid">
        {pharmacies.map((pharmacie, index) => (
          <PharmacieCard key={index} pharmacie={pharmacie} />
        ))}
      </div>
    </div>
  );
}

function PharmacieCard({ pharmacie }) {
  const handleCall = () => {
    window.location.href = `tel:${pharmacie.telephone}`;
  };

  const handleNavigate = () => {
    if (pharmacie.latitude && pharmacie.longitude) {
      const url = `https://www.google.com/maps/dir/?api=1&destination=${pharmacie.latitude},${pharmacie.longitude}`;
      window.open(url, '_blank');
    }
  };

  return (
    <div className="pharmacie-card">
      <div className="card-header">
        <h3>{pharmacie.nom}</h3>
        <span className="badge">{pharmacie.commune}</span>
      </div>
      
      <div className="card-body">
        <p className="quartier">📍 {pharmacie.quartier}</p>
        <p className="adresse">{pharmacie.adresse}</p>
        <p className="telephone">📞 {pharmacie.telephone}</p>
        {pharmacie.horaires && (
          <p className="horaires">🕐 {pharmacie.horaires}</p>
        )}
        {pharmacie.distance_km && (
          <p className="distance">📏 À {pharmacie.distance_km} km</p>
        )}
      </div>
      
      <div className="card-actions">
        <button onClick={handleCall} className="btn btn-primary">
          Appeler
        </button>
        {pharmacie.latitude && (
          <button onClick={handleNavigate} className="btn btn-secondary">
            Itinéraire
          </button>
        )}
      </div>
    </div>
  );
}

// Composant de recherche avec géolocalisation
export function PharmaciesFinder() {
  const [nearestPharmacies, setNearestPharmacies] = React.useState([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState(null);

  const findNearest = async () => {
    setLoading(true);
    setError(null);

    if (!navigator.geolocation) {
      setError('La géolocalisation n\'est pas supportée');
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const data = await PharmacieService.getNearestPharmacies(
            position.coords.latitude,
            position.coords.longitude,
            5
          );
          setNearestPharmacies(data.pharmacies || []);
        } catch (err) {
          setError(err.message);
        } finally {
          setLoading(false);
        }
      },
      (err) => {
        setError('Impossible d\'obtenir votre position');
        setLoading(false);
      }
    );
  };

  return (
    <div className="pharmacies-finder">
      <button 
        onClick={findNearest} 
        disabled={loading}
        className="btn btn-large btn-primary"
      >
        {loading ? 'Recherche...' : '📍 Trouver les pharmacies les plus proches'}
      </button>

      {error && <div className="error">{error}</div>}

      {nearestPharmacies.length > 0 && (
        <div className="results">
          <h3>Pharmacies les plus proches</h3>
          <div className="pharmacies-grid">
            {nearestPharmacies.map((pharmacie, index) => (
              <PharmacieCard key={index} pharmacie={pharmacie} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// Composant de sélection de commune
export function CommuneSelector({ onSelect }) {
  const [communes, setCommunes] = React.useState([]);
  const [selectedCommune, setSelectedCommune] = React.useState('');

  React.useEffect(() => {
    PharmacieService.getCommunes()
      .then(data => setCommunes(data.communes || []))
      .catch(err => console.error(err));
  }, []);

  const handleChange = (e) => {
    const commune = e.target.value;
    setSelectedCommune(commune);
    if (onSelect) onSelect(commune);
  };

  return (
    <div className="commune-selector">
      <label htmlFor="commune-select">Sélectionner une commune:</label>
      <select 
        id="commune-select"
        value={selectedCommune} 
        onChange={handleChange}
        className="form-select"
      >
        <option value="">Toutes les communes</option>
        {communes.map(commune => (
          <option key={commune} value={commune}>
            {commune}
          </option>
        ))}
      </select>
    </div>
  );
}

// Exemple d'utilisation complète
export function PharmacieGardeApp() {
  const [selectedCommune, setSelectedCommune] = React.useState('');

  return (
    <div className="app">
      <header>
        <h1>🏥 Pharmacies de Garde - Abidjan</h1>
      </header>

      <main>
        <section className="search-section">
          <PharmaciesFinder />
        </section>

        <section className="filter-section">
          <CommuneSelector onSelect={setSelectedCommune} />
        </section>

        <section className="list-section">
          <PharmaciesGardeList commune={selectedCommune} />
        </section>
      </main>
    </div>
  );
}

// Styles CSS suggérés
export const styles = `
.pharmacie-card {
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 16px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  transition: transform 0.2s;
}

.pharmacie-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0,0,0,0.15);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.card-header h3 {
  margin: 0;
  color: #2c3e50;
  font-size: 18px;
}

.badge {
  background: #3498db;
  color: white;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
}

.card-body p {
  margin: 8px 0;
  color: #555;
  font-size: 14px;
}

.card-actions {
  display: flex;
  gap: 8px;
  margin-top: 16px;
}

.btn {
  padding: 10px 20px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  transition: background 0.2s;
}

.btn-primary {
  background: #27ae60;
  color: white;
}

.btn-primary:hover {
  background: #229954;
}

.btn-secondary {
  background: #3498db;
  color: white;
}

.btn-secondary:hover {
  background: #2980b9;
}

.pharmacies-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 16px;
}

.loading, .error {
  text-align: center;
  padding: 20px;
  font-size: 16px;
}

.error {
  color: #e74c3c;
}
`;

export default PharmacieService;
