import { useEffect, useRef, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import DriverMap from "@/components/maps/DriverMap";
import { MapPin, Satellite, Activity } from "lucide-react";

export default function DriverTrackingPanel() {
  const { user, profile } = useAuth();
  const { toast } = useToast();

  const [token, setToken] = useState<string>(() => localStorage.getItem("mapbox_token") || "");
  const [sharing, setSharing] = useState(false);
  const [position, setPosition] = useState<{ lat: number; lng: number } | null>(null);
  const [gpsOk, setGpsOk] = useState(false);

  const watchId = useRef<number | null>(null);
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

  useEffect(() => {
    if (!user) return;

    const channel = supabase.channel(`drivers:${user.id}`, {
      config: { presence: { key: user.id } },
    });

    channel
      .on("presence", { event: "sync" }, () => {
        // Optionally read presence state here
      })
      .subscribe(async (status) => {
        if (status === "SUBSCRIBED" && position) {
          await channel.track({
            lat: position.lat,
            lng: position.lng,
            updated_at: new Date().toISOString(),
            name: profile?.name || "",
          });
        }
      });

    channelRef.current = channel;

    return () => {
      channel.unsubscribe();
      channelRef.current = null;
    };
  }, [user]);

  useEffect(() => {
    if (!sharing || !user) return;

    if (!("geolocation" in navigator)) {
      toast({
        title: "GPS non disponible",
        description: "Votre appareil ne supporte pas la géolocalisation.",
        variant: "destructive",
      });
      return;
    }

    watchId.current = navigator.geolocation.watchPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setPosition({ lat: latitude, lng: longitude });
        setGpsOk(true);
        channelRef.current?.track({
          lat: latitude,
          lng: longitude,
          updated_at: new Date().toISOString(),
          name: profile?.name || "",
        });
      },
      (err) => {
        console.error(err);
        setGpsOk(false);
        toast({ title: "Erreur GPS", description: err.message, variant: "destructive" });
      },
      { enableHighAccuracy: true, maximumAge: 2000, timeout: 10000 }
    );

    return () => {
      if (watchId.current !== null) {
        navigator.geolocation.clearWatch(watchId.current);
        watchId.current = null;
      }
      channelRef.current?.untrack?.();
    };
  }, [sharing, user]);

  const handleSaveToken = () => {
    localStorage.setItem("mapbox_token", token.trim());
    toast({ title: "Clé Mapbox enregistrée", description: "La carte est prête." });
  };

  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle>Suivi GPS en temps réel</CardTitle>
        <CardDescription>
          Partagez votre position pour des livraisons plus rapides et un suivi en direct.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center justify-between p-3 rounded-md border bg-card">
              <div className="flex items-center gap-2">
                <Activity className={"h-4 w-4 " + (sharing ? "text-green-600" : "text-muted-foreground")} />
                <span className="text-sm">Partager ma position</span>
              </div>
              <Switch checked={sharing} onCheckedChange={setSharing} />
            </div>

            <DriverMap token={token} position={position} height={320} />

            <div className="text-xs text-muted-foreground flex items-center gap-2">
              <Satellite className={`h-4 w-4 ${gpsOk ? "text-green-600" : "text-muted-foreground"}`} />
              {gpsOk ? "GPS actif" : "En attente du signal GPS..."}
            </div>
          </div>

          <div className="space-y-3">
            <Label htmlFor="mapbox">Clé publique Mapbox</Label>
            <Input
              id="mapbox"
              placeholder="pk.eyJ..."
              value={token}
              onChange={(e) => setToken(e.target.value)}
            />
            <Button onClick={handleSaveToken} variant="secondary" size="sm">
              Enregistrer
            </Button>

            <div className="mt-4 text-sm text-muted-foreground">
              <p className="mb-2">Astuce:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>
                  Récupérez votre clé publique sur mapbox.com (tableau de bord &gt; Tokens)
                </li>
                <li>
                  Nous l’utilisons uniquement côté client pour afficher la carte.
                </li>
              </ul>
            </div>

            {position && (
              <div className="mt-4 p-3 rounded-md bg-muted text-xs flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                <span>
                  {position.lat.toFixed(5)}, {position.lng.toFixed(5)}
                </span>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
