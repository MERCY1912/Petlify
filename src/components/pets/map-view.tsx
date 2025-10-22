'use client';

import { MapContainer, Marker, Popup, TileLayer } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import Link from 'next/link';
import Image from 'next/image';
import { useMemo } from 'react';
import { createSlug } from '@/lib/utils';
import type { PetRecord } from '@/lib/pb';
import { Button } from '@/components/ui/button';

const icon = new L.Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  shadowSize: [41, 41],
  shadowAnchor: [13, 41],
});

export interface MapPetEntry {
  pet: PetRecord;
  photoUrl?: string;
}

const MINSK_CENTER: [number, number] = [53.9, 27.5667];

export function MapView({ pets }: { pets: MapPetEntry[] }) {
  const markers = useMemo(
    () =>
      pets
        .map((entry) => {
          if (typeof entry.pet.lastLat !== 'number' || typeof entry.pet.lastLng !== 'number') return null;
          return {
            position: [entry.pet.lastLat, entry.pet.lastLng] as [number, number],
            entry,
          };
        })
        .filter(Boolean) as { position: [number, number]; entry: MapPetEntry }[],
    [pets],
  );

  return (
    <div className="overflow-hidden rounded-3xl border border-brand-100 shadow-card">
      <MapContainer center={MINSK_CENTER} zoom={7} scrollWheelZoom className="h-[70vh] w-full">
        <TileLayer url={process.env.NEXT_PUBLIC_MAP_TILES_URL || 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'} attribution={process.env.NEXT_PUBLIC_MAP_ATTRIBUTION || '&copy; OpenStreetMap contributors'} />
        {markers.map(({ position, entry }) => {
          const slug = `${entry.pet.id}-${createSlug(entry.pet.title)}`;
          return (
            <Marker key={entry.pet.id} position={position} icon={icon}>
              <Popup>
                <div className="flex max-w-xs flex-col gap-2">
                  <strong className="text-sm text-forest">{entry.pet.title}</strong>
                  {entry.photoUrl && (
                    <div className="relative h-28 w-full overflow-hidden rounded-xl">
                      <Image src={entry.photoUrl} alt={entry.pet.title} fill className="object-cover" />
                    </div>
                  )}
                  {entry.pet.city && <span className="text-xs text-forest/70">{entry.pet.city}</span>}
                  <Button asChild size="sm">
                    <Link href={`/pet/${slug}`}>Подробнее</Link>
                  </Button>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}
