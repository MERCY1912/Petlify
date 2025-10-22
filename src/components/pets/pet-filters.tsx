'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useMemo, useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';

const speciesOptions = [
  { value: '', label: 'Все животные' },
  { value: 'dog', label: 'Собаки' },
  { value: 'cat', label: 'Коты' },
  { value: 'other', label: 'Другие' },
];

const sexOptions = [
  { value: '', label: 'Любой пол' },
  { value: 'm', label: 'Мальчик' },
  { value: 'f', label: 'Девочка' },
  { value: 'unk', label: 'Неизвестно' },
];

const statusOptions = [
  { value: '', label: 'Все статусы' },
  { value: 'lost', label: 'Пропавшие' },
  { value: 'found', label: 'Найденные' },
];

export function PetFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const formValues = useMemo(() => ({
    species: searchParams.get('species') ?? '',
    sex: searchParams.get('sex') ?? '',
    status: searchParams.get('status') ?? '',
    city: searchParams.get('city') ?? '',
  }), [searchParams]);

  const updateQuery = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    params.delete('page');
    startTransition(() => {
      const query = params.toString();
      router.replace(query ? `${pathname}?${query}` : pathname);
    });
  };

  return (
    <div className="rounded-3xl border border-brand-100 bg-white/70 p-4 shadow-card">
      <div className="grid gap-4 md:grid-cols-4">
        <Select
          value={formValues.species}
          onChange={(event) => updateQuery('species', event.target.value)}
          aria-label="Фильтр по виду"
        >
          {speciesOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </Select>
        <Select value={formValues.sex} onChange={(event) => updateQuery('sex', event.target.value)} aria-label="Фильтр по полу">
          {sexOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </Select>
        <Select
          value={formValues.status}
          onChange={(event) => updateQuery('status', event.target.value)}
          aria-label="Фильтр по статусу"
        >
          {statusOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </Select>
        <Input
          placeholder="Город"
          defaultValue={formValues.city}
          onBlur={(event) => updateQuery('city', event.target.value)}
        />
      </div>
      <div className="mt-3 flex justify-end">
        <Button variant="ghost" size="sm" onClick={() => router.replace(pathname)} disabled={isPending}>
          Сбросить фильтры
        </Button>
      </div>
    </div>
  );
}
