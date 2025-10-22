'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { formatISO } from 'date-fns';
import { TurnstileWidget } from '@/components/forms/turnstile-widget';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/components/layout/auth-provider';
import { createSlug } from '@/lib/utils';

const schema = z.object({
  title: z.string().min(5, 'Минимум 5 символов'),
  species: z.enum(['dog', 'cat', 'other'], { required_error: 'Выберите вид' }),
  sex: z.enum(['m', 'f', 'unk']).default('unk'),
  color: z.string().min(2, 'Укажите окрас или особые приметы'),
  description: z.string().min(10, 'Опишите ситуацию подробнее'),
  breed: z.string().optional(),
  city: z.string().min(2, 'Укажите город'),
  lostAt: z.string().optional(),
  lastLat: z
    .union([z.string(), z.number()])
    .optional()
    .transform((value) => (value === undefined || value === '' ? undefined : Number(value)))
    .refine((value) => value === undefined || !Number.isNaN(value), 'Неверная широта'),
  lastLng: z
    .union([z.string(), z.number()])
    .optional()
    .transform((value) => (value === undefined || value === '' ? undefined : Number(value)))
    .refine((value) => value === undefined || !Number.isNaN(value), 'Неверная долгота'),
  reward: z
    .union([z.string(), z.number()])
    .optional()
    .transform((value) => (value === undefined || value === '' ? undefined : Number(value)))
    .refine((value) => value === undefined || !Number.isNaN(value), 'Неверное вознаграждение'),
});

type FormValues = z.infer<typeof schema>;

export default function NewPetPage() {
  const { pb, user } = useAuth();
  const router = useRouter();
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [photos, setPhotos] = useState<{ file: File; preview: string }[]>([]);
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      species: 'dog',
      sex: 'unk',
    },
  });

  usePhotoCleanup(photos);

  const handleFiles = async (fileList: FileList | null) => {
    if (!fileList) return;
    photos.forEach((photo) => URL.revokeObjectURL(photo.preview));
    const resized: { file: File; preview: string }[] = [];
    for (const file of Array.from(fileList).slice(0, 5)) {
      const prepared = await resizeImage(file);
      resized.push({ file: prepared, preview: URL.createObjectURL(prepared) });
    }
    setPhotos(resized);
  };

  const onSubmit = async (values: FormValues) => {
    setError(null);
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
        throw new Error('Не удалось подтвердить проверку Turnstile');
      }
      const payload: Record<string, unknown> = {
        ...values,
        owner: pb.authStore.model?.id,
        lostAt: values.lostAt ? formatISO(new Date(values.lostAt)) : undefined,
      };
      const record = await pb.collection('pets').create(payload);
      if (photos.length > 0) {
        for (const photo of photos) {
          const fd = new FormData();
          fd.append('pet', record.id);
          fd.append('image', photo.file);
          await pb.collection('pet_photos').create(fd);
        }
      }
      const slug = `${record.id}-${createSlug(values.title)}`;
      router.push(`/pet/${slug}`);
    } catch (submissionError) {
      console.error(submissionError);
      setError('Не удалось создать объявление. Попробуйте позже.');
    }
  };

  if (!user) {
    return (
      <div className="rounded-3xl bg-white/90 p-12 text-center shadow-card">
        <h1 className="text-2xl font-semibold text-forest">Войдите, чтобы разместить объявление</h1>
        <p className="mt-2 text-sm text-forest/70">
          Используйте форму в шапке сайта, чтобы получить ссылку для входа по e-mail.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <header className="rounded-3xl bg-white/90 p-8 shadow-card">
        <h1 className="text-3xl font-bold text-forest">Разместить объявление</h1>
        <p className="mt-3 max-w-2xl text-base text-forest/80">
          Заполните форму, чтобы создать объявление о пропаже питомца. Чем подробнее информация, тем быстрее найдётся хвостик.
        </p>
      </header>
      <Form {...form}>
        <form
          className="space-y-6 rounded-3xl bg-white/90 p-8 shadow-card"
          onSubmit={form.handleSubmit(onSubmit)}
        >
          <section className="grid gap-6 md:grid-cols-2">
            <FormField
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Заголовок</FormLabel>
                  <FormControl>
                    <Input placeholder="Пропал кот Рыжик" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              name="city"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Город</FormLabel>
                  <FormControl>
                    <Input placeholder="Минск" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              name="species"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Вид</FormLabel>
                  <FormControl>
                    <Select value={field.value} onChange={(event) => field.onChange(event.target.value)}>
                      <option value="dog">Собака</option>
                      <option value="cat">Кот</option>
                      <option value="other">Другое животное</option>
                    </Select>
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              name="sex"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Пол</FormLabel>
                  <FormControl>
                    <Select value={field.value} onChange={(event) => field.onChange(event.target.value)}>
                      <option value="m">Мальчик</option>
                      <option value="f">Девочка</option>
                      <option value="unk">Неизвестно</option>
                    </Select>
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              name="color"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Окрас и приметы</FormLabel>
                  <FormControl>
                    <Input placeholder="Рыжий, белые лапы" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              name="breed"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Порода</FormLabel>
                  <FormControl>
                    <Input placeholder="Шотландская" {...field} />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              name="lostAt"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Дата пропажи</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              name="reward"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Вознаграждение, BYN</FormLabel>
                  <FormControl>
                    <Input type="number" min={0} step={10} {...field} />
                  </FormControl>
                </FormItem>
              )}
            />
          </section>
          <section className="grid gap-6 md:grid-cols-2">
            <FormField
              name="lastLat"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Последняя широта</FormLabel>
                  <FormControl>
                    <Input type="number" step="0.0001" {...field} />
                  </FormControl>
                  <FormDescription>Укажите координаты, чтобы питомец появился на карте.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              name="lastLng"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Последняя долгота</FormLabel>
                  <FormControl>
                    <Input type="number" step="0.0001" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </section>
          <FormField
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Описание ситуации</FormLabel>
                <FormControl>
                  <Textarea rows={5} placeholder="Расскажите, когда и где пропал питомец, как он себя ведёт, что любит..." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="space-y-2">
            <FormLabel>Фотографии</FormLabel>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={(event) => handleFiles(event.target.files)}
              className="block w-full text-sm text-forest"
            />
            <p className="text-xs text-forest/60">До 5 фотографий, каждая до 5 МБ. Изображения автоматически уменьшаются до 1600px.</p>
            {photos.length > 0 && (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {photos.map((photo) => (
                  <div key={photo.preview} className="relative h-24 overflow-hidden rounded-2xl border border-brand-100">
                    <img src={photo.preview} alt={photo.file.name} className="h-full w-full object-cover" />
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="flex flex-col gap-3">
            <TurnstileWidget onSuccess={setTurnstileToken} />
            {error && <p className="text-sm text-red-500">{error}</p>}
            <Button type="submit" className="self-start" disabled={form.formState.isSubmitting}>
              Опубликовать объявление
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}

async function resizeImage(file: File): Promise<File> {
  const bitmap = await createImageBitmap(file);
  const maxSize = 1600;
  const scale = Math.min(maxSize / bitmap.width, maxSize / bitmap.height, 1);
  const canvas = document.createElement('canvas');
  canvas.width = bitmap.width * scale;
  canvas.height = bitmap.height * scale;
  const ctx = canvas.getContext('2d');
  if (!ctx) return file;
  ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/jpeg', 0.85));
  if (!blob) return file;
  return new File([blob], file.name.replace(/\.[^.]+$/, '.jpg'), { type: 'image/jpeg' });
}

type PreviewPhoto = { file: File; preview: string };

function usePhotoCleanup(photos: PreviewPhoto[]) {
  useEffect(() => {
    return () => {
      photos.forEach((photo) => URL.revokeObjectURL(photo.preview));
    };
  }, [photos]);
}
