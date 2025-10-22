import { Metadata } from 'next';
import { getPocketBaseServer, type PetRecord, type PetPhotoRecord } from '@/lib/pb';
import { MapView, type MapPetEntry } from '@/components/pets/map-view';
import { PetsRealtimeBridge } from '@/components/pets/pets-realtime';

export const metadata: Metadata = {
  title: 'Карта пропавших питомцев',
};

async function fetchLostPets(): Promise<MapPetEntry[]> {
  const pb = await getPocketBaseServer();
  try {
    const list = await pb.collection('pets').getFullList<PetRecord>({
      filter: 'status = "lost"',
      expand: 'pet_photos',
      sort: '-updated',
    });
    return list
      .map((pet) => {
        const photo = (pet.expand?.pet_photos?.[0] as PetPhotoRecord | undefined) ?? null;
        const photoUrl = photo ? pb.files.getUrl(photo, photo.image, { thumb: '300x0' }) : undefined;
        return { pet, photoUrl };
      })
      .filter((entry) => typeof entry.pet.lastLat === 'number' && typeof entry.pet.lastLng === 'number');
  } catch (error) {
    console.error('Failed to fetch pets for map', error);
    return [];
  }
}

export default async function MapPage() {
  const pets = await fetchLostPets();
  return (
    <div className="space-y-6">
      <PetsRealtimeBridge />
      <header className="rounded-3xl bg-white/90 p-8 shadow-card">
        <h1 className="text-3xl font-bold text-forest">Карта последних замечаний</h1>
        <p className="mt-3 max-w-2xl text-base text-forest/80">
          Используйте карту, чтобы увидеть последние координаты пропавших питомцев и быстро связаться с владельцами.
        </p>
      </header>
      <MapView pets={pets} />
    </div>
  );
}
