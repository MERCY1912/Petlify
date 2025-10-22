import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getPocketBaseServer, type PetRecord, type PetPhotoRecord, type SubscriptionRecord, type UserRecord } from '@/lib/pb';
import { PetCard } from '@/components/pets/pet-card';
import { SubscriptionsPanel } from '@/components/pets/subscriptions-panel';

export const dynamic = 'force-dynamic';

export default async function ProfilePage() {
  const pb = await getPocketBaseServer();
  const user = pb.authStore.model as UserRecord | null;
  if (!user) {
    redirect('/');
  }

  const pets = await pb.collection('pets').getFullList<PetRecord>({
    filter: `owner = "${user.id}"`,
    expand: 'pet_photos',
    sort: '-created',
  });

  const subscriptions = await pb.collection('subscriptions').getFullList<SubscriptionRecord>({
    filter: `user = "${user.id}"`,
    sort: '-created',
  });

  const petCards = pets.map((pet) => {
    const photo = (pet.expand?.pet_photos?.[0] as PetPhotoRecord | undefined) ?? null;
    const photoUrl = photo ? pb.files.getUrl(photo, photo.image, { thumb: '400x0' }) : undefined;
    return { pet, photoUrl };
  });

  return (
    <div className="space-y-8">
      <section className="rounded-3xl bg-white/90 p-8 shadow-card">
        <h1 className="text-3xl font-bold text-forest">{user.name ?? 'Профиль'}</h1>
        {user.email && <p className="mt-2 text-sm text-forest/70">{user.email}</p>}
        {user.city && <p className="text-sm text-forest/70">{user.city}</p>}
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <Link href="/new" className="rounded-full bg-brand-500 px-5 py-2 text-sm font-semibold text-white">
            Новое объявление
          </Link>
        </div>
      </section>
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold text-forest">Мои объявления</h2>
          <Link href="/new" className="text-sm font-semibold text-brand-600 hover:underline">
            Добавить
          </Link>
        </div>
        {petCards.length === 0 ? (
          <p className="rounded-3xl border border-dashed border-brand-200 bg-white/70 p-8 text-center text-sm text-forest/60">
            У вас пока нет объявлений.
          </p>
        ) : (
          <div className="grid gap-6">
            {petCards.map(({ pet, photoUrl }) => (
              <PetCard key={pet.id} pet={pet} photoUrl={photoUrl} />
            ))}
          </div>
        )}
      </section>
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-forest">Подписки на уведомления</h2>
        <SubscriptionsPanel initialSubscriptions={subscriptions} />
      </section>
    </div>
  );
}
