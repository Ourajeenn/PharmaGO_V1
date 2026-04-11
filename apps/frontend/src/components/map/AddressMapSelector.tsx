import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';

// Fix Leaflet marker icon issue
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

interface AddressMapSelectorProps {
    onLocationSelect: (lat: number, lng: number) => void;
    defaultLat?: number;
    defaultLng?: number;
}

const LocationMarker = ({ position, setPosition, onLocationSelect }: any) => {
    useMapEvents({
        click(e) {
            setPosition(e.latlng);
            onLocationSelect(e.latlng.lat, e.latlng.lng);
        },
    });

    return position === null ? null : (
        <Marker position={position} />
    );
};

export const AddressMapSelector: React.FC<AddressMapSelectorProps> = ({
    onLocationSelect,
    defaultLat = 5.359951, // Abidjan par défaut
    defaultLng = -4.008256
}) => {
    const [position, setPosition] = useState<L.LatLng | null>(null);

    // set default if provided initially
    useEffect(() => {
        if (defaultLat && defaultLng && !position) {
            setPosition(new L.LatLng(defaultLat, defaultLng));
        }
    }, [defaultLat, defaultLng]);

    return (
        <div className="h-[300px] w-full rounded-xl overflow-hidden border border-slate-200 mt-4 relative z-0">
            <MapContainer
                center={[defaultLat, defaultLng]}
                zoom={13}
                scrollWheelZoom={true}
                style={{ height: '100%', width: '100%' }}
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <LocationMarker position={position} setPosition={setPosition} onLocationSelect={onLocationSelect} />
            </MapContainer>
            <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm px-3 py-2 rounded-lg text-xs font-semibold shadow-sm border border-slate-100 z-[1000] text-slate-700 pointer-events-none">
                📍 Cliquez pour placer le repère exact
            </div>
        </div>
    );
};
