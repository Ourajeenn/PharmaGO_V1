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

interface MapMarker {
    lat: number;
    lng: number;
    label?: string;
    description?: string;
    isUser?: boolean;
}

interface LeafletMapProps {
    position?: { lat: number; lng: number } | null;
    destination?: { lat: number; lng: number } | null;
    markers?: MapMarker[];
    height?: string;
    zoom?: number;
}

const UserIcon = L.icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

const PharmacyIcon = L.icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

const RecenterAutomatically = ({ lat, lng }: { lat: number; lng: number }) => {
    const map = useMap();
    useEffect(() => {
        map.setView([lat, lng]);
    }, [lat, lng, map]);
    return null;
};

const LeafletMap: React.FC<LeafletMapProps> = ({
    position,
    destination,
    markers = [],
    height = "300px",
    zoom = 13
}) => {
    // Default to Abidjan if no position
    const center = position ? [position.lat, position.lng] : [5.3600, -4.0083];

    return (
        <MapContainer
            center={center as [number, number]}
            zoom={zoom}
            style={{ height, width: '100%', borderRadius: '0.5rem', zIndex: 0 }}
        >
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {position && (
                <>
                    <Marker position={[position.lat, position.lng]} icon={UserIcon}>
                        <Popup>Votre position</Popup>
                    </Marker>
                    <RecenterAutomatically lat={position.lat} lng={position.lng} />
                </>
            )}

            {destination && (
                <Marker position={[destination.lat, destination.lng]}>
                    <Popup>Destination</Popup>
                </Marker>
            )}

            {markers.map((marker, idx) => (
                <Marker
                    key={idx}
                    position={[marker.lat, marker.lng]}
                    icon={marker.isUser ? UserIcon : PharmacyIcon}
                >
                    {marker.label && (
                        <Popup>
                            <div className="font-bold">{marker.label}</div>
                            {marker.description && <div className="text-xs">{marker.description}</div>}
                        </Popup>
                    )}
                </Marker>
            ))}
        </MapContainer>
    );
};

export default LeafletMap;
