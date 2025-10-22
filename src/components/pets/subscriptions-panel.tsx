'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { useAuth } from '@/components/layout/auth-provider';
import type { SubscriptionRecord } from '@/lib/pb';
import { requestNotificationPermission } from '@/lib/firebase';

interface SubscriptionsPanelProps {
  initialSubscriptions: SubscriptionRecord[];
}

const speciesOptions = [
  { value: 'any', label: 'Любой питомец' },
  { value: 'dog', label: 'Только собаки' },
  { value: 'cat', label: 'Только коты' },
];

export function SubscriptionsPanel({ initialSubscriptions }: SubscriptionsPanelProps) {
  const { pb } = useAuth();
  const [subscriptions, setSubscriptions] = useState(initialSubscriptions);
  const [form, setForm] = useState({
    centerLat: '',
    centerLng: '',
    radiusKm: '5',
    species: 'any',
    token: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleCreate = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const record = await pb.collection('subscriptions').create({
        user: pb.authStore.model?.id,
        centerLat: Number(form.centerLat),
        centerLng: Number(form.centerLng),
        radiusKm: Number(form.radiusKm) || 5,
        species: form.species,
        token: form.token || undefined,
      });
      setSubscriptions((prev) => [record as SubscriptionRecord, ...prev]);
      setForm({ centerLat: '', centerLng: '', radiusKm: '5', species: 'any', token: '' });
    } catch (creationError) {
      console.error(creationError);
      setError('Не удалось создать подписку. Проверьте данные и попробуйте снова.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      await pb.collection('subscriptions').delete(id);
      setSubscriptions((prev) => prev.filter((item) => item.id !== id));
    } catch (deletionError) {
      console.error(deletionError);
      setError('Не удалось удалить подписку.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 rounded-3xl bg-white/90 p-6 shadow-card">
      <form className="grid gap-4 md:grid-cols-2 lg:grid-cols-3" onSubmit={handleCreate}>
        <Input
          name="centerLat"
          value={form.centerLat}
          onChange={handleChange}
          placeholder="Широта"
          required
          type="number"
          step="0.0001"
        />
        <Input
          name="centerLng"
          value={form.centerLng}
          onChange={handleChange}
          placeholder="Долгота"
          required
          type="number"
          step="0.0001"
        />
        <Input
          name="radiusKm"
          value={form.radiusKm}
          onChange={handleChange}
          placeholder="Радиус, км"
          type="number"
          min={1}
        />
        <Select name="species" value={form.species} onChange={handleChange}>
          {speciesOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </Select>
        <Input
          name="token"
          value={form.token}
          onChange={handleChange}
          placeholder="FCM токен устройства"
        />
        <Button type="submit" disabled={loading}>
          Создать подписку
        </Button>
        <Button
          type="button"
          variant="ghost"
          onClick={async () => {
            try {
              const token = await requestNotificationPermission();
              if (token) {
                setForm((prev) => ({ ...prev, token }));
              }
            } catch (requestError) {
              console.error(requestError);
              setError('Не удалось получить токен браузера. Проверьте настройки Firebase.');
            }
          }}
        >
          Получить токен браузера
        </Button>
      </form>
      {error && <p className="text-sm text-red-500">{error}</p>}
      <div className="space-y-3">
        {subscriptions.length === 0 ? (
          <p className="text-sm text-forest/60">Пока нет подписок. Добавьте первую, чтобы получать уведомления.</p>
        ) : (
          subscriptions.map((subscription) => {
            const lat = Number(subscription.centerLat);
            const lng = Number(subscription.centerLng);
            const radius = Number(subscription.radiusKm ?? 5);
            return (
            <div
              key={subscription.id}
              className="flex flex-col gap-2 rounded-2xl border border-brand-100 bg-white/70 p-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="text-sm text-forest/80">
                Центр: {lat.toFixed(4)}, {lng.toFixed(4)} · Радиус: {radius} км · Вид:{' '}
                {speciesOptions.find((option) => option.value === subscription.species)?.label ?? subscription.species}
              </div>
              <Button variant="ghost" size="sm" onClick={() => handleDelete(subscription.id)} disabled={loading}>
                Удалить
              </Button>
            </div>
            );
          })
        )}
      </div>
    </div>
  );
}
