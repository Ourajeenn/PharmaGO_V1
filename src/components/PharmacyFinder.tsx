import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  MapPin,
  Phone,
  Clock,
  Navigation,
  Star,
  Search,
  Filter,
  ArrowLeft,
  Truck,
  CreditCard,
  Heart,
  Verified,
  Map
} from "lucide-react";
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { realPharmacies, communes as communesList, Pharmacy } from '@/data/pharmacyData';
import { PharmacyService } from '@/services/PharmacyService';

// Using imported real pharmacy data from pharmacyData.ts
// Initial data for SSR/Static, but we will use state
// const pharmacies = realPharmacies;

// Using imported communes list from pharmacyData.ts
const communes = communesList;

interface PharmacyFinderProps {
  onBackToHome?: () => void;
}


const PharmacyFinder = ({ onBackToHome }: PharmacyFinderProps) => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCommune, setSelectedCommune] = useState("Toutes");
  const [showOnlyOpen, setShowOnlyOpen] = useState(false);
  const [showOnlyDelivery, setShowOnlyDelivery] = useState(false);
  const [favorites, setFavorites] = useState<number[]>([]);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);

  // State for data from API
  const [pharmacies, setPharmacies] = useState<Pharmacy[]>(realPharmacies); // Default to local data initially
  const [isLoading, setIsLoading] = useState(true);

  // Load pharmacies via Service (API simulation)
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        const data = await PharmacyService.getAllPharmacies();
        setPharmacies(data);
      } catch (error) {
        console.error("Failed to fetch pharmacies", error);
        // Fallback to static data is already handled by initial state, but explicit handling is good
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  useEffect(() => {
    // Simuler la géolocalisation
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => console.log("Géolocalisation désactivée")
      );
    }
  }, []);

  const toggleFavorite = (id: number) => {
    setFavorites(prev =>
      prev.includes(id)
        ? prev.filter(fav => fav !== id)
        : [...prev, id]
    );
  };

  const filteredPharmacies = pharmacies.filter(pharmacy => {
    const matchesSearch = pharmacy.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pharmacy.address.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCommune = selectedCommune === "Toutes" || pharmacy.commune === selectedCommune;
    const matchesOpenStatus = !showOnlyOpen || pharmacy.isOpen;
    const matchesDelivery = !showOnlyDelivery || pharmacy.hasDelivery;

    return matchesSearch && matchesCommune && matchesOpenStatus && matchesDelivery;
  });

  const openPharmacies = pharmacies.filter(p => p.isOpen).length;
  const deliveryPharmacies = pharmacies.filter(p => p.hasDelivery).length;

  const handleDirection = (pharmacy: Pharmacy) => {
    // Get coordinates from commune mapping
    const communeCoords: { [key: string]: [number, number] } = {
      "Plateau": [5.3200, -4.0200],
      "Cocody": [5.3600, -3.9800],
      "Adjamé": [5.3500, -4.0300],
      "Marcory": [5.2900, -3.9900],
      "Treichville": [5.2800, -4.0100],
      "Yopougon": [5.3400, -4.0900],
      "Abobo": [5.4200, -4.0200],
      "Koumassi": [5.2900, -3.9500],
      "Port-Bouët": [5.2500, -3.9200],
      "Attécoubé": [5.3300, -4.0500],
      "Bingerville": [5.3600, -3.8900],
      "Songon": [5.3000, -4.2500],
      "Anyama": [5.4900, -4.0500]
    };

    const coords = communeCoords[pharmacy.commune] || [5.345317, -4.024429];
    const [lat, lng] = coords;

    // Add small random offset for each pharmacy to differentiate exact locations
    const uniqueLat = lat + (pharmacy.id * 0.001);
    const uniqueLng = lng + ((pharmacy.id % 7) * 0.001);

    // Open Google Maps with exact coordinates and pharmacy name
    const mapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${uniqueLat},${uniqueLng}&destination_place_id=${encodeURIComponent(pharmacy.name)}`;
    window.open(mapsUrl, '_blank');
  };

  const handleOrder = () => {
    navigate('/medicaments');
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary to-secondary text-white">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-4 mb-4">
            {onBackToHome && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onBackToHome}
                className="text-white hover:bg-white/10"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Retour
              </Button>
            )}
            <h1 className="text-3xl font-bold">Trouver une Pharmacie</h1>
          </div>
          <div className="flex justify-end mb-4">
            <Button
              variant="outline"
              className="bg-white/10 text-white border-white/20 hover:bg-white/20"
              onClick={() => navigate('/suivi')}
            >
              <Truck className="h-4 w-4 mr-2" />
              Suivre ma commande
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-white/10 backdrop-blur-sm rounded-lg p-4">
            <div className="text-center">
              <div className="text-2xl font-bold">{pharmacies.length}</div>
              <div className="text-sm text-white/80">Pharmacies disponibles</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-secondary">{openPharmacies}</div>
              <div className="text-sm text-white/80">Ouvertes maintenant</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-accent">{deliveryPharmacies}</div>
              <div className="text-sm text-white/80">Avec livraison</div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <Tabs defaultValue="list" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="list">Liste des pharmacies</TabsTrigger>
            <TabsTrigger value="garde">Pharmacies de Garde</TabsTrigger>
            <TabsTrigger value="map">Vue carte</TabsTrigger>
          </TabsList>

          <div className="space-y-6">
            {/* Filters - Visible for List and Map */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Filter className="h-5 w-5" />
                  Filtres de recherche
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Rechercher une pharmacie..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>

                  <Select value={selectedCommune} onValueChange={setSelectedCommune}>
                    <SelectTrigger>
                      <SelectValue placeholder="Commune" />
                    </SelectTrigger>
                    <SelectContent>
                      {communes.map(commune => (
                        <SelectItem key={commune} value={commune}>
                          {commune}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Button
                    variant={showOnlyOpen ? "default" : "outline"}
                    onClick={() => setShowOnlyOpen(!showOnlyOpen)}
                    className="justify-start"
                  >
                    <div className={`w-2 h-2 rounded-full mr-2 ${showOnlyOpen ? 'bg-white' : 'bg-secondary'}`}></div>
                    Ouvertes uniquement
                  </Button>

                  <Button
                    variant={showOnlyDelivery ? "default" : "outline"}
                    onClick={() => setShowOnlyDelivery(!showOnlyDelivery)}
                    className="justify-start"
                  >
                    <Truck className="h-4 w-4 mr-2" />
                    Avec livraison
                  </Button>
                </div>

                <div className="mt-4 text-sm text-muted-foreground">
                  {filteredPharmacies.length} pharmacie(s) trouvée(s)
                </div>
              </CardContent>
            </Card>

            <TabsContent value="list" className="space-y-6">
              {/* Pharmacies List */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {filteredPharmacies.map(pharmacy => (
                  <Card
                    key={pharmacy.id}
                    className={`group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 ${pharmacy.isOpen
                      ? 'border-secondary/30 bg-gradient-to-br from-card to-secondary/5'
                      : 'border-muted bg-gradient-to-br from-card to-muted/10'
                      }`}
                  >
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <CardTitle className="text-lg group-hover:text-primary transition-colors">
                              {pharmacy.name}
                            </CardTitle>
                            {pharmacy.isPartner && (
                              <Verified className="h-5 w-5 text-primary" />
                            )}
                          </div>

                          <div className="flex flex-wrap gap-2">
                            <Badge
                              className={`${pharmacy.isOpen
                                ? 'bg-secondary/10 text-secondary border-secondary/20'
                                : 'bg-muted text-muted-foreground border-muted'
                                }`}
                            >
                              {pharmacy.isOpen ? "🟢 Ouverte" : "🔴 Fermée"}
                            </Badge>
                            {pharmacy.hasDelivery && (
                              <Badge className="bg-primary/10 text-primary border-primary/20">
                                <Truck className="h-3 w-3 mr-1" />
                                Livraison
                              </Badge>
                            )}
                            {pharmacy.acceptsCard && (
                              <Badge className="bg-accent/10 text-accent border-accent/20">
                                <CreditCard className="h-3 w-3 mr-1" />
                                Carte
                              </Badge>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleFavorite(pharmacy.id)}
                            className={favorites.includes(pharmacy.id) ? 'text-red-500' : 'text-muted-foreground'}
                          >
                            <Heart className={`h-4 w-4 ${favorites.includes(pharmacy.id) ? 'fill-current' : ''}`} />
                          </Button>
                          <div className="flex items-center gap-1">
                            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                            <span className="text-sm font-medium">{pharmacy.rating}</span>
                            <span className="text-xs text-muted-foreground">({pharmacy.reviews})</span>
                          </div>
                        </div>
                      </div>
                    </CardHeader>

                    <CardContent className="space-y-4">
                      <div className="space-y-3">
                        <div className="flex items-start gap-2">
                          <MapPin className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                          <div className="text-sm">
                            <div>{pharmacy.address}</div>
                            <div className="text-muted-foreground">{pharmacy.commune} • {pharmacy.distance}</div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 text-sm">
                          <Phone className="h-4 w-4 text-secondary" />
                          <span>{pharmacy.phone}</span>
                        </div>

                        <div className="flex items-center gap-2 text-sm">
                          <Clock className="h-4 w-4 text-accent" />
                          <span>{pharmacy.hours}</span>
                          {pharmacy.hasDelivery && pharmacy.isOpen && (
                            <span className="text-secondary">• Livraison: {pharmacy.estimatedDelivery}</span>
                          )}
                        </div>
                      </div>

                      {pharmacy.hasDelivery && pharmacy.isOpen && (
                        <div className="bg-secondary/10 rounded-lg p-3 border border-secondary/20">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">Frais de livraison</span>
                            <span className="text-secondary font-bold">{pharmacy.deliveryFee} FCFA</span>
                          </div>
                        </div>
                      )}

                      <div>
                        <h4 className="text-sm font-semibold mb-2">Spécialités</h4>
                        <div className="flex flex-wrap gap-1">
                          {pharmacy.specialties.map(specialty => (
                            <Badge key={specialty} variant="outline" className="text-xs">
                              {specialty}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      <div>
                        <h4 className="text-sm font-semibold mb-2">Services</h4>
                        <div className="flex flex-wrap gap-1">
                          {pharmacy.services.map(service => (
                            <Badge key={service} className="bg-muted text-muted-foreground text-xs">
                              {service}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      <div className="flex gap-2 pt-2">
                        <Button size="sm" className="flex-1" disabled={!pharmacy.isOpen}>
                          <Phone className="h-4 w-4 mr-2" />
                          Appeler
                        </Button>
                        <Button variant="outline" size="sm" className="flex-1" onClick={() => handleDirection(pharmacy)}>
                          <Navigation className="h-4 w-4 mr-2" />
                          Itinéraire
                        </Button>
                        {pharmacy.hasDelivery && pharmacy.isOpen && (
                          <Button variant="secondary" size="sm" className="flex-1" onClick={handleOrder}>
                            <Truck className="h-4 w-4 mr-2" />
                            Commander
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {filteredPharmacies.length === 0 && (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">🔍</div>
                  <h3 className="text-xl font-semibold mb-2">Aucune pharmacie trouvée</h3>
                  <p className="text-muted-foreground">Essayez de modifier vos critères de recherche</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="map">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Map className="h-5 w-5" />
                    Carte des Pharmacies
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="h-[600px] relative bg-muted/20 rounded-lg overflow-hidden">
                    {/* Simple map embed using OpenStreetMap */}
                    <iframe
                      width="100%"
                      height="100%"
                      style={{ border: 0 }}
                      loading="lazy"
                      src="https://www.openstreetmap.org/export/embed.html?bbox=-4.1,5.2,-3.9,5.5&layer=mapnik&marker=5.345317,-4.024429"
                      className="rounded-lg"
                    />

                    {/* Overlay with pharmacy list */}
                    <div className="absolute top-4 left-4 w-80 max-h-[560px] overflow-y-auto bg-white dark:bg-card rounded-lg shadow-lg border p-4">
                      <h3 className="font-semibold mb-3 sticky top-0 bg-white dark:bg-card pb-2">
                        Pharmacies ({filteredPharmacies.length})
                      </h3>
                      <div className="space-y-2">
                        {filteredPharmacies.slice(0, 10).map((pharmacy) => (
                          <Card key={pharmacy.id} className="hover:shadow-md transition-shadow">
                            <CardContent className="p-3">
                              <div className="space-y-2">
                                <div>
                                  <h4 className="font-semibold text-sm">{pharmacy.name}</h4>
                                  <div className="text-xs text-muted-foreground mt-1">
                                    <div className="flex items-start gap-1">
                                      <MapPin className="h-3 w-3 mt-0.5 flex-shrink-0" />
                                      <span>{pharmacy.commune}</span>
                                    </div>
                                  </div>
                                </div>
                                <div className="flex gap-1">
                                  <Badge
                                    className={`text-xs ${pharmacy.isOpen
                                      ? 'bg-green-100 text-green-800'
                                      : 'bg-red-100 text-red-800'
                                      }`}
                                  >
                                    {pharmacy.isOpen ? "Ouvert" : "Fermé"}
                                  </Badge>
                                  {pharmacy.hasDelivery && (
                                    <Badge className="text-xs bg-blue-100 text-blue-800">
                                      <Truck className="h-2 w-2 mr-1" />
                                      Livraison
                                    </Badge>
                                  )}
                                </div>
                                <Button
                                  size="sm"
                                  className="w-full"
                                  onClick={() => handleDirection(pharmacy)}
                                >
                                  <Navigation className="h-3 w-3 mr-1" />
                                  Itinéraire
                                </Button>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="garde" className="space-y-6">
              <Card className="bg-gradient-to-r from-secondary/10 to-primary/10">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-6 w-6 text-secondary" />
                    Pharmacies de Garde
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">
                    Les pharmacies de garde sont disponibles en dehors des horaires normaux pour les urgences médicales.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-white dark:bg-card p-4 rounded-lg border">
                      <h4 className="font-semibold mb-2 flex items-center gap-2">
                        <div className="w-3 h-3 bg-secondary rounded-full animate-pulse"></div>
                        Pharmacies 24h/24
                      </h4>
                      <p className="text-sm text-muted-foreground">Ouvertes en permanence</p>
                    </div>
                    <div className="bg-white dark:bg-card p-4 rounded-lg border">
                      <h4 className="font-semibold mb-2 flex items-center gap-2">
                        <div className="w-3 h-3 bg-primary rounded-full"></div>
                        Pharmacies de nuit
                      </h4>
                      <p className="text-sm text-muted-foreground">Ouvertes jusqu'à minuit</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* 24/7 Pharmacies */}
              <div>
                <h3 className="text-xl font-semibold mb-4">Pharmacies ouvertes 24h/24</h3>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {pharmacies.filter(p => p.hours === "24h/24").map(pharmacy => (
                    <Card
                      key={pharmacy.id}
                      className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-secondary/30 bg-gradient-to-br from-card to-secondary/5"
                    >
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <CardTitle className="text-lg group-hover:text-primary transition-colors">
                                {pharmacy.name}
                              </CardTitle>
                              {pharmacy.isPartner && (
                                <Verified className="h-5 w-5 text-primary" />
                              )}
                            </div>

                            <div className="flex flex-wrap gap-2">
                              <Badge className="bg-secondary/10 text-secondary border-secondary/20">
                                🟢 Ouverte 24h/24
                              </Badge>
                              {pharmacy.hasDelivery && (
                                <Badge className="bg-primary/10 text-primary border-primary/20">
                                  <Truck className="h-3 w-3 mr-1" />
                                  Livraison
                                </Badge>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => toggleFavorite(pharmacy.id)}
                              className={favorites.includes(pharmacy.id) ? 'text-red-500' : 'text-muted-foreground'}
                            >
                              <Heart className={`h-4 w-4 ${favorites.includes(pharmacy.id) ? 'fill-current' : ''}`} />
                            </Button>
                            <div className="flex items-center gap-1">
                              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                              <span className="text-sm font-medium">{pharmacy.rating}</span>
                            </div>
                          </div>
                        </div>
                      </CardHeader>

                      <CardContent className="space-y-4">
                        <div className="space-y-3">
                          <div className="flex items-start gap-2">
                            <MapPin className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                            <div className="text-sm">
                              <div>{pharmacy.address}</div>
                              <div className="text-muted-foreground">{pharmacy.commune} • {pharmacy.distance}</div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 text-sm">
                            <Phone className="h-4 w-4 text-secondary" />
                            <span>{pharmacy.phone}</span>
                          </div>

                          <div className="flex items-center gap-2 text-sm">
                            <Clock className="h-4 w-4 text-accent" />
                            <span className="font-semibold text-secondary">{pharmacy.hours}</span>
                          </div>
                        </div>

                        <div className="flex gap-2 pt-2">
                          <Button size="sm" className="flex-1">
                            <Phone className="h-4 w-4 mr-2" />
                            Appeler
                          </Button>
                          <Button variant="outline" size="sm" className="flex-1" onClick={() => handleDirection(pharmacy)}>
                            <Navigation className="h-4 w-4 mr-2" />
                            Itinéraire
                          </Button>
                          {pharmacy.hasDelivery && (
                            <Button variant="secondary" size="sm" className="flex-1" onClick={handleOrder}>
                              <Truck className="h-4 w-4 mr-2" />
                              Commander
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Night Pharmacies */}
              <div>
                <h3 className="text-xl font-semibold mb-4">Pharmacies de nuit (ouvertes tard)</h3>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {pharmacies.filter(p => p.hours.includes("22h00") || p.hours.includes("21h00")).slice(0, 6).map(pharmacy => (
                    <Card
                      key={pharmacy.id}
                      className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
                    >
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <CardTitle className="text-lg group-hover:text-primary transition-colors mb-2">
                              {pharmacy.name}
                            </CardTitle>
                            <Badge className={pharmacy.isOpen ? "bg-secondary/10 text-secondary border-secondary/20" : "bg-muted"}>
                              {pharmacy.isOpen ? "🟢 Ouverte" : "🔴 Fermée"}
                            </Badge>
                          </div>
                        </div>
                      </CardHeader>

                      <CardContent>
                        <div className="space-y-2 text-sm">
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-primary" />
                            <span>{pharmacy.address}, {pharmacy.commune}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-accent" />
                            <span className="font-medium">{pharmacy.hours}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Phone className="h-4 w-4 text-secondary" />
                            <span>{pharmacy.phone}</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
};

export default PharmacyFinder;

