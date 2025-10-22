import { Metadata } from 'next';
import { Suspense } from 'react';
import { getPocketBaseServer, type PetRecord, type PetPhotoRecord } from '@/lib/pb';
import { PetCard } from '@/components/pets/pet-card';
import { PetFilters } from '@/components/pets/pet-filters';
import { Pagination } from '@/components/pets/pagination';
import { PetsRealtimeBridge } from '@/components/pets/pets-realtime';

const PAGE_SIZE = 12;

export const metadata: Metadata = {
  title: 'Поиск пропавших питомцев',
};

interface PageProps {
  searchParams: { [key: string]: string | string[] | undefined };
}

async function fetchPets(searchParams: PageProps['searchParams']) {
  const pb = await getPocketBaseServer();
  const page = Number(searchParams.page ?? '1');
  const species = typeof searchParams.species === 'string' ? searchParams.species : undefined;
  const sex = typeof searchParams.sex === 'string' ? searchParams.sex : undefined;
  const status = typeof searchParams.status === 'string' ? searchParams.status : undefined;
  const city = typeof searchParams.city === 'string' ? searchParams.city : undefined;

  const filterParts: string[] = [];
  if (species) filterParts.push(`species = "${species}"`);
  if (sex) filterParts.push(`sex = "${sex}"`);
  if (status) filterParts.push(`status = "${status}"`);
  if (city) filterParts.push(`city ~ "${city}"`);

  try {
    const list = await pb.collection('pets').getList<PetRecord>(page || 1, PAGE_SIZE, {
      filter: filterParts.join(' && ') || undefined,
      expand: 'owner,pet_photos',
      sort: '-created',
    });
    const items = list.items.map((pet) => {
      const photo = (pet.expand?.pet_photos?.[0] as PetPhotoRecord | undefined) ?? null;
      const photoUrl = photo ? pb.files.getUrl(photo, photo.image, { thumb: '400x0' }) : undefined;
      return { pet, photoUrl };
    });
    return {
      items,
      totalPages: list.totalPages,
      page: list.page,
    };
  } catch (error) {
    console.error('Failed to fetch pets', error);
    return {
      items: [] as { pet: PetRecord; photoUrl?: string }[],
      totalPages: 1,
      page: 1,
    };
  }
}

export default async function HomePage({ searchParams }: PageProps) {
  const { items, totalPages, page } = await fetchPets(searchParams);
  const paramsRecord = Object.fromEntries(
    Object.entries(searchParams).map(([key, value]) => [key, typeof value === 'string' ? value : value?.[0]]),
  );

  return (
    <div className="space-y-8">
      <PetsRealtimeBridge />
      <section className="rounded-3xl bg-white/90 p-8 shadow-card">
        <h1 className="text-3xl font-bold text-forest">Помогаем питомцам вернуться домой</h1>
        <p className="mt-3 max-w-2xl text-base text-forest/80">
          Лента объявлений от хозяев и очевидцев по всей Беларуси. Используйте фильтры, чтобы найти нужного питомца, подпишитесь
          на пуш-уведомления и следите за обновлениями в реальном времени.
        </p>
      </section>
      <Suspense fallback={<div className="h-32 animate-pulse rounded-3xl bg-white/60" />}>
        <PetFilters />
      </Suspense>
      <div className="grid gap-6">
        {items.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-brand-200 bg-white/70 p-12 text-center text-forest/60">
            Пока нет объявлений, подходящих под выбранные фильтры.
          </div>
        ) : (
          <div className="grid gap-6">
            {items.map(({ pet, photoUrl }) => (
              <PetCard key={pet.id} pet={pet} photoUrl={photoUrl} />
            ))}
          </div>
        )}
      </div>
      <Pagination currentPage={page} totalPages={totalPages} searchParams={paramsRecord} />
    </div>
  );
}
