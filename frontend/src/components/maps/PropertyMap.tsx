'use client';

import { divIcon } from 'leaflet';
import { MapContainer, Marker, Popup, TileLayer } from 'react-leaflet';

type PropertyMapProps = {
  latitude: number;
  longitude: number;
  name: string;
  address: string;
};

const markerIcon = divIcon({
  className: '',
  html: '<span class="property-map-marker"><span></span></span>',
  iconSize: [36, 44],
  iconAnchor: [18, 42],
  popupAnchor: [0, -38],
});

export default function PropertyMap({ latitude, longitude, name, address }: PropertyMapProps) {
  return (
    <MapContainer
      center={[latitude, longitude]}
      zoom={16}
      scrollWheelZoom={false}
      className="h-72 w-full rounded-xl"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <Marker position={[latitude, longitude]} icon={markerIcon}>
        <Popup>
          <strong>{name}</strong>
          <br />
          {address}
        </Popup>
      </Marker>
    </MapContainer>
  );
}
