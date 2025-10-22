import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { getPocketBaseServer, type PetRecord, type PetPhotoRecord, type SightingRecord } from '@/lib/pb';
import { createSlug } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { SightingsRealtimeBridge } from '@/components/pets/sightings-realtime';

interface PageProps {
  params: { id: string };
}

async function fetchPet(petId: string) {
  const pb = await getPocketBaseServer();
  try {
    const pet = await pb.collection('pets').getOne<PetRecord>(petId, {
      expand: 'owner,pet_photos',
    });
    const sightings = await pb.collection('sightings').getList<SightingRecord>(1, 20, {
      filter: `pet = "${petId}"`,
      expand: 'author',
      sort: '-seenAt',
    });
    const photos = (pet.expand?.pet_photos as PetPhotoRecord[] | undefined) ?? [];
    const photoUrls = photos.map((photo) => pb.files.getUrl(photo, photo.image));
    return { pet, sightings: sightings.items, photoUrls };
  } catch (error) {
    console.error('Failed to load pet', error);
    return null;
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const recordId = params.id.split('-')[0];
  const data = await fetchPet(recordId);
  if (!data) {
    return {
      title: 'Питомец не найден',
    };
  }
  const { pet, photoUrls } = data;
  const title = `${pet.title} · Petlify`;
  const description = `${pet.color ?? 'Описание отсутствует'} — ${pet.city ?? 'Беларусь'}`;
  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'article',
      images: photoUrls.length > 0 ? [{ url: photoUrls[0], width: 1200, height: 630 }] : undefined,
    },
  };
}

export default async function PetPage({ params }: PageProps) {
  const recordId = params.id.split('-')[0];
  const data = await fetchPet(recordId);
  if (!data) {
    notFound();
  }

  const { pet, sightings, photoUrls } = data;
  const slug = `${pet.id}-${createSlug(pet.title)}`;
  const lostAt = pet.lostAt ? format(new Date(pet.lostAt), 'dd MMMM yyyy', { locale: ru }) : 'Неизвестно';

  return (
    <div className="space-y-10">
      <SightingsRealtimeBridge />
      <nav className="text-sm text-forest/70">
        <Link href="/">← Назад к ленте</Link>
      </nav>
      <header className="grid gap-8 lg:grid-cols-[2fr,1fr]">
        <div className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            {photoUrls.length > 0 ? (
              photoUrls.map((url, index) => (
                <div key={index} className="relative h-64 overflow-hidden rounded-3xl">
                  <Image src={url} alt={`${pet.title} фото ${index + 1}`} fill className="object-cover" />
                </div>
              ))
            ) : (
              <div className="flex h-64 items-center justify-center rounded-3xl bg-brand-50 text-brand-200">
                Фото пока нет
              </div>
            )}
          </div>
          <section className="space-y-4 rounded-3xl bg-white/90 p-6 shadow-card">
            <Badge>{pet.status === 'found' ? 'Нашёлся' : 'Пропал'}</Badge>
            <h1 className="text-4xl font-bold text-forest">{pet.title}</h1>
            <p className="text-lg text-forest/80">
              {pet.species === 'dog' ? 'Собака' : pet.species === 'cat' ? 'Кот' : 'Питомец'} ·{' '}
              {pet.sex === 'm' ? 'Мальчик' : pet.sex === 'f' ? 'Девочка' : 'Пол неизвестен'}
            </p>
            <div className="grid gap-3 text-sm text-forest/80 sm:grid-cols-2">
              <div>Пропал: {lostAt}</div>
              {pet.city && <div>Город: {pet.city}</div>}
              {pet.color && <div>Окрас: {pet.color}</div>}
              {pet.breed && <div>Порода: {pet.breed}</div>}
              {typeof pet.reward === 'number' && pet.reward > 0 && <div>Вознаграждение: {pet.reward} BYN</div>}
            </div>
            {pet.description && <p className="text-sm leading-relaxed text-forest/80">{pet.description}</p>}
            <div className="flex flex-wrap items-center gap-3">
              <Button asChild size="lg">
                <Link href={`/sighting/new?pet=${pet.id}`}>Сообщить замечание</Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href={`/pet/${slug}?found=1`}>Я нашёл питомца</Link>
              </Button>
            </div>
          </section>
        </div>
        <aside className="space-y-6">
          <section className="rounded-3xl bg-white/90 p-6 shadow-card">
            <h2 className="text-xl font-semibold text-forest">Контактная информация</h2>
            <p className="mt-2 text-sm text-forest/70">
              Владелец: {pet.expand?.owner?.name ?? 'Не указано'}
            </p>
            {pet.expand?.owner?.tg_handle && (
              <p className="text-sm text-forest/70">Telegram: {pet.expand.owner.tg_handle}</p>
            )}
          </section>
          <section className="rounded-3xl bg-white/90 p-6 shadow-card">
            <h2 className="text-xl font-semibold text-forest">Последние замечания</h2>
            <div className="mt-4 space-y-4">
              {sightings.length === 0 ? (
                <p className="text-sm text-forest/60">Пока нет замечаний. Будьте первым, кто сообщит!</p>
              ) : (
                sightings.map((sighting) => (
                  <article key={sighting.id} className="rounded-2xl border border-brand-100 bg-white/70 p-4">
                    <p className="text-sm font-semibold text-forest">
                      {format(new Date(sighting.seenAt), 'dd MMMM yyyy HH:mm', { locale: ru })}
                    </p>
                    {sighting.comment && <p className="mt-2 text-sm text-forest/80">{sighting.comment}</p>}
                    {sighting.expand?.author && (
                      <p className="mt-2 text-xs text-forest/60">{sighting.expand.author.name ?? 'Неизвестный очевидец'}</p>
                    )}
                  </article>
                ))
              )}
            </div>
          </section>
        </aside>
      </header>
    </div>
  );
}
