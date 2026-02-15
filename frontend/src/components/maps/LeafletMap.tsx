import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default marker icon
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

const DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

interface LeafletMapProps {
    position: { lat: number; lng: number } | null;
    destination?: { lat: number; lng: number } | null;
    height?: string;
}

const RecenterAutomatically = ({ lat, lng }: { lat: number; lng: number }) => {
    const map = useMap();
    useEffect(() => {
        map.setView([lat, lng]);
    }, [lat, lng, map]);
    return null;
};

const LeafletMap: React.FC<LeafletMapProps> = ({ position, destination, height = "300px" }) => {
    // Default to Abidjan if no position
    const center = position ? [position.lat, position.lng] : [5.3600, -4.0083];

    if (!position && !destination) {
        return (
            <div style={{ height, width: '100%', background: '#f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <p>En attente de localisation...</p>
            </div>
        );
    }

    return (
        <MapContainer
            center={center as [number, number]}
            zoom={13}
            style={{ height, width: '100%', borderRadius: '0.5rem', zIndex: 0 }}
        >
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {position && (
                <>
                    <Marker position={[position.lat, position.lng]}>
                        <Popup>
                            Livreur
                        </Popup>
                    </Marker>
                    <RecenterAutomatically lat={position.lat} lng={position.lng} />
                </>
            )}

            {destination && (
                <Marker position={[destination.lat, destination.lng]}>
                    <Popup>
                        Destination
                    </Popup>
                </Marker>
            )}
        </MapContainer>
    );
};

export default LeafletMap;
