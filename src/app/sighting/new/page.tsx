'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { MapContainer, Marker, TileLayer, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { formatISO } from 'date-fns';
import { TurnstileWidget } from '@/components/forms/turnstile-widget';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/components/layout/auth-provider';

const schema = z.object({
  seenAt: z.string({ required_error: 'Укажите дату и время' }),
  comment: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

const icon = new L.Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  shadowSize: [41, 41],
  shadowAnchor: [13, 41],
});

const DEFAULT_CENTER: [number, number] = [53.9, 27.5667];

export default function NewSightingPage() {
  const searchParams = useSearchParams();
  const petId = searchParams.get('pet');
  const { pb, user } = useAuth();
  const router = useRouter();
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const [location, setLocation] = useState<[number, number] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      seenAt: formatISO(new Date()).slice(0, 16),
    },
  });

  const handleSubmitForm = async (values: FormValues) => {
    if (!petId) {
      setError('Не указан питомец.');
      return;
    }
    if (!location) {
      setError('Выберите точку на карте.');
      return;
    }
    if (!turnstileToken) {
      setError('Подтвердите, что вы не робот.');
      return;
    }
    try {
      const verify = await fetch('/api/turnstile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: turnstileToken }),
      });
      if (!verify.ok) {
        throw new Error('Проверка Turnstile не пройдена');
      }
      const record = await pb.collection('sightings').create({
        pet: petId,
        author: pb.authStore.model?.id,
        lat: location[0],
        lng: location[1],
        seenAt: formatISO(new Date(values.seenAt)),
        comment: values.comment,
      });
      await fetch('/api/notify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'sighting',
          recordId: record.id,
          title: 'Новое замечание питомца',
          body: values.comment ?? 'Добавлено новое замечание поблизости',
          lat: location[0],
          lng: location[1],
        }),
      });
      router.push(`/pet/${petId}`);
    } catch (submissionError) {
      console.error(submissionError);
      setError('Не удалось сохранить замечание. Попробуйте позже.');
    }
  };

  if (!user) {
    return (
      <div className="rounded-3xl bg-white/90 p-12 text-center shadow-card">
        <h1 className="text-2xl font-semibold text-forest">Войдите, чтобы добавить замечание</h1>
        <p className="mt-2 text-sm text-forest/70">Для безопасности публикация замечаний доступна только авторизованным пользователям.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <header className="rounded-3xl bg-white/90 p-8 shadow-card">
        <h1 className="text-3xl font-bold text-forest">Новое замечание</h1>
        <p className="mt-3 max-w-2xl text-base text-forest/80">
          Выберите точку на карте и укажите, когда видели питомца. Это поможет владельцу быстрее отреагировать.
        </p>
      </header>
      <div className="overflow-hidden rounded-3xl border border-brand-100 shadow-card">
        <MapContainer center={location ?? DEFAULT_CENTER} zoom={12} scrollWheelZoom className="h-[60vh] w-full">
          <TileLayer url={process.env.NEXT_PUBLIC_MAP_TILES_URL || 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'} attribution={process.env.NEXT_PUBLIC_MAP_ATTRIBUTION || '&copy; OpenStreetMap contributors'} />
          <LocationMarker location={location} onChange={setLocation} />
          {location && <Marker position={location} icon={icon} />}
        </MapContainer>
      </div>
      <Form {...form}>
        <form className="space-y-6 rounded-3xl bg-white/90 p-8 shadow-card" onSubmit={form.handleSubmit(handleSubmitForm)}>
          <FormField
            name="seenAt"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Когда видели питомца?</FormLabel>
                <FormControl>
                  <Input type="datetime-local" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            name="comment"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Комментарий</FormLabel>
                <FormControl>
                  <Textarea rows={4} placeholder="Например: видел рядом с парком, выглядел испуганным" {...field} />
                </FormControl>
              </FormItem>
            )}
          />
          <div className="flex flex-col gap-3">
            <TurnstileWidget onSuccess={setTurnstileToken} />
            {error && <p className="text-sm text-red-500">{error}</p>}
            <Button type="submit" className="self-start">
              Отправить замечание
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}

function LocationMarker({
  location,
  onChange,
}: {
  location: [number, number] | null;
  onChange: (value: [number, number]) => void;
}) {
  useMapEvents({
    click(event) {
      onChange([event.latlng.lat, event.latlng.lng]);
    },
  });
  return null;
}
