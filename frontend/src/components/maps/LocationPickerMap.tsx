'use client';

import { divIcon, LatLng } from 'leaflet';
import { MapContainer, Marker, TileLayer, useMap, useMapEvents } from 'react-leaflet';
import { useEffect } from 'react';

type LocationPickerMapProps = {
  latitude?: number;
  longitude?: number;
  onChange: (latitude: number, longitude: number) => void;
};

const DEFAULT_POSITION: [number, number] = [16.047079, 108.20623];
const markerIcon = divIcon({
  className: '',
  html: '<span class="property-map-marker property-map-marker--draggable"><span></span></span>',
  iconSize: [36, 44],
  iconAnchor: [18, 42],
});

function MapInteraction({
  position,
  hasPosition,
  onChange,
}: {
  position: [number, number];
  hasPosition: boolean;
  onChange: LocationPickerMapProps['onChange'];
}) {
  const map = useMap();

  useEffect(() => {
    map.setView(position, map.getZoom(), { animate: false });
  }, [map, position]);

  useMapEvents({
    click(event) {
      onChange(event.latlng.lat, event.latlng.lng);
    },
  });

  return hasPosition ? (
    <Marker
      position={position}
      icon={markerIcon}
      draggable
      eventHandlers={{
        dragend(event) {
          const point = event.target.getLatLng() as LatLng;
          onChange(point.lat, point.lng);
        },
      }}
    />
  ) : null;
}

export default function LocationPickerMap({ latitude, longitude, onChange }: LocationPickerMapProps) {
  const hasPosition = Number.isFinite(latitude) && Number.isFinite(longitude);
  const position: [number, number] = hasPosition
    ? [latitude as number, longitude as number]
    : DEFAULT_POSITION;

  return (
    <div>
      <MapContainer center={position} zoom={hasPosition ? 16 : 6} scrollWheelZoom className="h-72 w-full rounded-xl">
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapInteraction position={position} hasPosition={hasPosition} onChange={onChange} />
      </MapContainer>
      <p className="mt-2 text-xs text-gray-500">
        Nhấn vào bản đồ hoặc kéo ghim để chọn chính xác vị trí căn nhà.
      </p>
    </div>
  );
}
