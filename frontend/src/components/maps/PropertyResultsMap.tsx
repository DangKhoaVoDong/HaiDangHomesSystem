'use client';

import { divIcon, LatLngBoundsExpression, Marker as LeafletMarker } from 'leaflet';
import { Search, MapPin, X } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useMemo, useRef, useState } from 'react';
import { MapContainer, Marker, Popup, TileLayer, useMap } from 'react-leaflet';
import { PrimaryNavigationSection } from '@/components/PrimaryNavigationSection';

type MapProperty = {
  id: string;
  name?: string;
  address?: string;
  city?: string;
  categoryName?: string;
  thumbnailUrl?: string;
  latitude?: number | string | null;
  longitude?: number | string | null;
  minPrice?: number | string | null;
  totalRooms?: number;
};

type PropertyResultsMapProps = {
  properties: MapProperty[];
  onClose: () => void;
};

const defaultCenter: [number, number] = [16.047079, 108.20623];

function toCoordinate(value: number | string | null | undefined) {
  if (value === null || value === undefined || value === '') return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function formatPrice(value: number | string | null | undefined) {
  const price = Number(value);
  return price > 0 ? `${price.toLocaleString('vi-VN')} đ/đêm` : 'Liên hệ';
}

const areaCenters: Array<{ names: string[]; position: [number, number]; zoom: number }> = [
  { names: ['ho chi minh', 'hcm', 'sai gon'], position: [10.7769, 106.7009], zoom: 12 },
  { names: ['ha noi', 'hanoi'], position: [21.0278, 105.8342], zoom: 12 },
  { names: ['da nang', 'danang'], position: [16.0544, 108.2022], zoom: 12 },
  { names: ['hoi an'], position: [15.8801, 108.338], zoom: 13 },
  { names: ['nha trang'], position: [12.2388, 109.1967], zoom: 13 },
  { names: ['phu quoc'], position: [10.2899, 103.984], zoom: 11 },
  { names: ['da lat', 'dalat'], position: [11.9404, 108.4583], zoom: 12 },
];

function normalizeLocation(value: string) {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase('vi');
}

function getAreaCenter(property: MapProperty) {
  const location = normalizeLocation(`${property.city || ''} ${property.address || ''}`);
  return areaCenters.find((area) => area.names.some((name) => location.includes(name))) ?? null;
}

function MapViewport({ properties, selectedId }: { properties: MapProperty[]; selectedId: string | null }) {
  const map = useMap();
  const selected = properties.find((property) => property.id === selectedId);

  useEffect(() => {
    if (selected) {
      const latitude = toCoordinate(selected.latitude);
      const longitude = toCoordinate(selected.longitude);
      if (latitude !== null && longitude !== null) {
        map.flyTo([latitude, longitude], Math.max(map.getZoom(), 14), { duration: 0.5 });
      } else {
        const area = getAreaCenter(selected);
        if (area) map.flyTo(area.position, area.zoom, { duration: 0.5 });
      }
    }
  }, [map, selected]);

  return null;
}

export default function PropertyResultsMap({ properties, onClose }: PropertyResultsMapProps) {
  const [query, setQuery] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const markerRefs = useRef<Record<string, LeafletMarker | null>>({});

  const visibleProperties = useMemo(() => {
    const normalized = query.trim().toLocaleLowerCase('vi');
    if (!normalized) return properties;
    return properties.filter((property) =>
      [property.name, property.address, property.city, property.categoryName]
        .filter(Boolean)
        .some((value) => String(value).toLocaleLowerCase('vi').includes(normalized))
    );
  }, [properties, query]);

  const mappedProperties = useMemo(
    () => visibleProperties.filter((property) =>
      toCoordinate(property.latitude) !== null && toCoordinate(property.longitude) !== null
    ),
    [visibleProperties]
  );

  const bounds = useMemo<LatLngBoundsExpression | undefined>(() => {
    if (!mappedProperties.length) return undefined;
    return mappedProperties.map((property) => [
      toCoordinate(property.latitude) as number,
      toCoordinate(property.longitude) as number,
    ]);
  }, [mappedProperties]);

  useEffect(() => {
    if (!selectedId) return;
    const marker = markerRefs.current[selectedId];
    if (!marker) return;
    const timer = window.setTimeout(() => marker.openPopup(), 550);
    return () => window.clearTimeout(timer);
  }, [selectedId]);

  return (
    <section className="fixed inset-0 z-[100] flex h-[100dvh] flex-col bg-white">
      <PrimaryNavigationSection />
      <div className="flex min-h-0 flex-1 flex-col lg:flex-row">
        <div className="relative min-h-0 flex-[1.25] lg:flex-1">
        <MapContainer
          center={defaultCenter}
          bounds={bounds}
          boundsOptions={{ padding: [50, 50] }}
          zoom={6}
          className="h-full w-full"
          zoomControl
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <MapViewport properties={visibleProperties} selectedId={selectedId} />
          {mappedProperties.map((property) => {
            const selected = property.id === selectedId;
            const icon = divIcon({
              className: '',
              html: `<span class="results-map-marker${selected ? ' results-map-marker--selected' : ''}"><span></span></span>`,
              iconSize: [38, 46],
              iconAnchor: [19, 44],
            });
            return (
              <Marker
                key={property.id}
                ref={(marker) => { markerRefs.current[property.id] = marker; }}
                position={[toCoordinate(property.latitude) as number, toCoordinate(property.longitude) as number]}
                icon={icon}
                eventHandlers={{ click: () => setSelectedId(property.id) }}
              >
                <Popup className="property-result-popup" maxWidth={300} minWidth={270}>
                  <div className="overflow-hidden rounded-xl bg-white">
                    <div className="h-36 w-full bg-gray-100">
                      {property.thumbnailUrl ? (
                        <img
                          src={property.thumbnailUrl}
                          alt={property.name || 'Chỗ nghỉ'}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center text-xs text-gray-400">Chưa có ảnh</div>
                      )}
                    </div>
                    <div className="px-4 pb-4 pt-3">
                      <strong className="block text-base font-semibold leading-snug text-gray-950">{property.name}</strong>
                      <span className="mt-1.5 flex items-start gap-1 text-xs text-gray-500">
                        <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                        <span>{property.address || property.city || 'Chưa cập nhật địa chỉ'}</span>
                      </span>
                      <span className="mt-2 block text-base font-bold text-[#D24A15]">{formatPrice(property.minPrice)}</span>
                      <Link
                        className="mt-2 inline-flex items-center text-sm font-semibold text-[#D24A15] hover:underline"
                        href={`/properties/${property.id}`}
                      >
                        Xem chi tiết →
                      </Link>
                    </div>
                  </div>
                </Popup>
              </Marker>
            );
          })}
        </MapContainer>

        <div className="absolute left-1/2 top-4 z-[500] flex w-[calc(100%-2rem)] max-w-2xl -translate-x-1/2 items-center gap-3 rounded-full bg-white px-5 py-3 shadow-xl">
          <Search className="h-5 w-5 shrink-0 text-gray-400" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Tìm tên hoặc địa điểm..."
            className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-gray-400"
          />
        </div>
        </div>

        <aside className="flex min-h-0 flex-1 flex-col border-t border-gray-200 bg-white lg:w-[390px] lg:flex-none lg:border-l lg:border-t-0">
        <header className="flex items-start justify-between border-b border-gray-200 px-5 py-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-950">Danh sách chỗ nghỉ</h2>
            <p className="mt-0.5 text-sm text-gray-500">{visibleProperties.length} kết quả phù hợp</p>
          </div>
          <button onClick={onClose} aria-label="Đóng bản đồ" className="rounded-full p-2 text-gray-500 transition hover:bg-gray-100 hover:text-gray-900">
            <X className="h-5 w-5" />
          </button>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto">
          {visibleProperties.map((property) => {
            const selected = property.id === selectedId;
            const hasCoordinates = toCoordinate(property.latitude) !== null && toCoordinate(property.longitude) !== null;
            return (
              <article
                key={property.id}
                onClick={() => setSelectedId(property.id)}
                className={`cursor-pointer border-b border-gray-100 p-4 transition ${selected ? 'bg-orange-50' : 'hover:bg-gray-50'}`}
              >
                <div className="flex gap-3">
                  <div className="h-24 w-28 shrink-0 overflow-hidden rounded-xl bg-gray-100">
                    {property.thumbnailUrl ? (
                      <img src={property.thumbnailUrl} alt={property.name || 'Chỗ nghỉ'} className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full items-center justify-center text-xs text-gray-400">Chưa có ảnh</div>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="line-clamp-2 font-semibold text-gray-950">{property.name || 'Chỗ nghỉ'}</h3>
                    <p className="mt-1 flex items-start gap-1 text-xs text-gray-500">
                      <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                      <span className="line-clamp-2">{property.address || property.city || 'Chưa cập nhật địa chỉ'}</span>
                    </p>
                    <p className="mt-2 text-sm font-semibold text-[#D24A15]">{formatPrice(property.minPrice)}</p>
                    {!hasCoordinates && <p className="mt-1 text-[11px] text-amber-700">Chưa có tọa độ trên bản đồ</p>}
                  </div>
                </div>
              </article>
            );
          })}
          {!visibleProperties.length && (
            <div className="px-6 py-14 text-center text-sm text-gray-500">Không tìm thấy chỗ nghỉ phù hợp.</div>
          )}
        </div>
        </aside>
      </div>
    </section>
  );
}
