import React, { useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

export interface DriverMapProps {
  token: string;
  position: { lat: number; lng: number } | null;
  height?: number;
}

const DriverMap: React.FC<DriverMapProps> = ({ token, position, height = 320 }) => {
  const mapContainer = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const markerRef = useRef<mapboxgl.Marker | null>(null);

  useEffect(() => {
    if (!mapContainer.current || !token) return;

    mapboxgl.accessToken = token;

    const map = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/light-v11",
      center: position ? [position.lng, position.lat] : [-4.0083, 5.3599], // Abidjan default
      zoom: position ? 13 : 10,
      pitch: 45,
    });

    map.addControl(new mapboxgl.NavigationControl({ visualizePitch: true }), "top-right");

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
      markerRef.current = null;
    };
  }, [token]);

  useEffect(() => {
    if (!mapRef.current || !position) return;

    if (!markerRef.current) {
      markerRef.current = new mapboxgl.Marker({ color: "#16a34a" })
        .setLngLat([position.lng, position.lat])
        .addTo(mapRef.current);
    } else {
      markerRef.current.setLngLat([position.lng, position.lat]);
    }

    mapRef.current.flyTo({ center: [position.lng, position.lat], zoom: 14, speed: 1.2 });
  }, [position]);

  return (
    <div className="relative w-full rounded-lg overflow-hidden shadow-sm" style={{ height }}>
      <div ref={mapContainer} className="absolute inset-0" />
      <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-transparent to-background/5" />
    </div>
  );
};

export default DriverMap;
