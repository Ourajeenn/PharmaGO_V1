import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Phone, Clock, Navigation, Star, AlertCircle, Loader2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

const guardPharmacies = [
  {
    id: 1,
    name: "Pharmacie de Garde Plateau",
    address: "Boulevard Clozel, Plateau",
    commune: "Plateau",
    phone: "+225 21 32 45 67",
    hours: "19h00 - 08h00",
    distance: "2.1 km",
    rating: 4.8,
    isOpen: true,
    specialties: ["Urgences", "Pédiatrie", "Cardiologie"],
    services: ["Livraison 24h", "Téléconsultation", "Ordonnance en ligne"]
  },
  {
    id: 2,
    name: "Pharmacie Nuit Cocody",
    address: "Rue des Jardins, Cocody",
    commune: "Cocody",
    phone: "+225 22 44 55 66",
    hours: "20h00 - 07h00",
    distance: "3.5 km",
    rating: 4.9,
    isOpen: true,
    specialties: ["Diabétologie", "Dermatologie"],
    services: ["Drive", "Livraison express", "Conseil pharmaceutique"]
  },
  {
    id: 3,
    name: "Pharmacie Express Adjamé",
    address: "Marché d'Adjamé, Adjamé",
    commune: "Adjamé",
    phone: "+225 23 66 77 88",
    hours: "18h30 - 08h30",
    distance: "4.2 km",
    rating: 4.6,
    isOpen: false,
    specialties: ["Médecine générale", "Gynécologie"],
    services: ["Livraison", "Stock important"]
  },
  {
    id: 4,
    name: "Pharmacie de Garde Marcory",
    address: "Zone 4, Marcory",
    commune: "Marcory",
    phone: "+225 21 75 89 90",
    hours: "19h00 - 08h00",
    distance: "5.8 km",
    rating: 4.7,
    isOpen: true,
    specialties: ["Pneumologie", "Rhumatologie"],
    services: ["Livraison 24h", "Matériel médical"]
  },
  {
    id: 5,
    name: "Pharmacie Nuit Treichville",
    address: "Avenue 7, Treichville",
    commune: "Treichville",
    phone: "+225 21 24 35 46",
    hours: "20h00 - 07h30",
    distance: "3.9 km",
    rating: 4.5,
    isOpen: true,
    specialties: ["Ophtalmologie", "ORL"],
    services: ["Conseil", "Livraison rapide"]
  }
];

const communes = ["Toutes", "Plateau", "Cocody", "Adjamé", "Marcory", "Treichville", "Yopougon", "Abobo", "Port-Bouët", "Koumassi", "Attécoubé"];

const PharmacyGuard = () => {
  const [selectedCommune, setSelectedCommune] = useState("Toutes");
  const [showOnlyOpen, setShowOnlyOpen] = useState(false);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [loadingLocation, setLoadingLocation] = useState(false);
  const { toast } = useToast();

  const getCurrentLocation = useCallback(() => {
    setLoadingLocation(true);
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
          setLoadingLocation(false);
          toast({
            title: "Position détectée",
            description: "Pharmacies triées par proximité"
          });
        },
        (error) => {
          setLoadingLocation(false);
          console.error("Error getting location:", error);
        }
      );
    }
  }, [toast]);

  useEffect(() => {
    getCurrentLocation();
  }, [getCurrentLocation]);

  const handleCall = (phone: string) => {
    window.location.href = `tel:${phone}`;
  };

  const handleGetDirections = (address: string) => {
    const encodedAddress = encodeURIComponent(address);
    window.open(`https://www.google.com/maps/search/?api=1&query=${encodedAddress}`, '_blank');
  };

  const filteredPharmacies = guardPharmacies.filter(pharmacy => {
    const matchesCommune = selectedCommune === "Toutes" || pharmacy.commune === selectedCommune;
    const matchesOpenStatus = !showOnlyOpen || pharmacy.isOpen;
    return matchesCommune && matchesOpenStatus;
  });

  const openPharmacies = guardPharmacies.filter(p => p.isOpen).length;

  return (
    <section className="py-16 bg-muted/30" id="garde">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-2 mb-4">
            <AlertCircle className="h-8 w-8 text-accent" />
            <h2 className="text-3xl md:text-4xl font-bold">
              Pharmacies de Garde
            </h2>
          </div>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-6">
            Service 24h/24 pour vos urgences médicales dans toutes les communes d'Abidjan
          </p>

          <div className="bg-card p-4 rounded-lg border inline-flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-secondary rounded-full animate-pulse"></div>
              <span className="font-semibold text-secondary">{openPharmacies} pharmacies ouvertes</span>
            </div>
            <div className="text-sm text-muted-foreground">
              Mise à jour en temps réel
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-card p-6 rounded-lg border shadow-sm mb-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap gap-2">
              {communes.map(commune => (
                <Button
                  key={commune}
                  variant={selectedCommune === commune ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCommune(commune)}
                  className="text-xs"
                >
                  {commune}
                </Button>
              ))}
            </div>

            <Button
              variant={showOnlyOpen ? "default" : "outline"}
              size="sm"
              onClick={() => setShowOnlyOpen(!showOnlyOpen)}
              className="flex items-center gap-2"
            >
              <div className={`w-2 h-2 rounded-full ${showOnlyOpen ? 'bg-white' : 'bg-secondary'}`}></div>
              Ouvertes uniquement
            </Button>
          </div>

          <div className="mt-4 text-sm text-muted-foreground">
            {filteredPharmacies.length} pharmacie(s) de garde trouvée(s)
          </div>
        </div>

        {/* Pharmacies Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPharmacies.map(pharmacy => (
            <Card
              key={pharmacy.id}
              className={`group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 ${pharmacy.isOpen
                ? 'border-secondary/30 bg-gradient-to-br from-card to-secondary/5'
                : 'border-destructive/30 bg-gradient-to-br from-card to-destructive/5'
                }`}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg group-hover:text-primary transition-colors">
                      {pharmacy.name}
                    </CardTitle>
                    <Badge
                      className={`mt-2 ${pharmacy.isOpen
                        ? 'bg-secondary/10 text-secondary border-secondary/20'
                        : 'bg-destructive/10 text-destructive border-destructive/20'
                        }`}
                    >
                      {pharmacy.isOpen ? "🟢 Ouverte" : "🔴 Fermée"}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span className="text-sm font-medium">{pharmacy.rating}</span>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-start gap-2 text-sm">
                    <MapPin className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                    <div>
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
                    <span className="font-medium">{pharmacy.hours}</span>
                  </div>
                </div>

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
                      <Badge key={service} className="bg-primary/10 text-primary border-primary/20 text-xs">
                        {service}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  <Button
                    size="sm"
                    className="flex-1"
                    disabled={!pharmacy.isOpen}
                    onClick={() => handleCall(pharmacy.phone)}
                  >
                    <Phone className="h-4 w-4 mr-2" />
                    Appeler
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => handleGetDirections(pharmacy.address)}
                  >
                    <Navigation className="h-4 w-4 mr-2" />
                    Itinéraire
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredPharmacies.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🏥</div>
            <h3 className="text-xl font-semibold mb-2">Aucune pharmacie de garde trouvée</h3>
            <p className="text-muted-foreground">Essayez de modifier vos critères de recherche</p>
          </div>
        )}

        {/* Emergency Notice */}
        <div className="mt-12 bg-accent/10 border border-accent/20 rounded-lg p-6">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-6 w-6 text-accent flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-accent mb-2">Information importante</h3>
              <p className="text-sm">
                En cas d'urgence médicale grave, contactez le <strong>SAMU au 185</strong> ou
                rendez-vous directement aux urgences de l'hôpital le plus proche.
                Les pharmacies de garde sont ouvertes pour les besoins pharmaceutiques urgents.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PharmacyGuard;