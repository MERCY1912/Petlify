import Image from 'next/image';
import Link from 'next/link';
import { Calendar, MapPin, PawPrint } from 'lucide-react';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { createSlug } from '@/lib/utils';
import type { PetRecord } from '@/lib/pb';

const speciesLabels: Record<string, string> = {
  dog: 'Собака',
  cat: 'Кот',
  other: 'Другое',
};

const sexLabels: Record<string, string> = {
  m: 'Мальчик',
  f: 'Девочка',
  unk: 'Неизвестно',
};

const statusVariant: Record<string, 'default' | 'success'> = {
  lost: 'default',
  found: 'success',
};

export interface PetCardProps {
  pet: PetRecord;
  photoUrl?: string;
}

export function PetCard({ pet, photoUrl }: PetCardProps) {
  const lostAt = pet.lostAt ? format(new Date(pet.lostAt), 'dd MMMM yyyy', { locale: ru }) : 'Дата не указана';
  const slug = `${pet.id}-${createSlug(pet.title)}`;
  const statusLabel = pet.status === 'found' ? 'Нашёлся' : 'Пропал';

  return (
    <Card className="flex flex-col gap-4 md:flex-row md:items-start">
      <CardHeader className="md:w-56">
        <div className="relative h-40 w-full overflow-hidden rounded-2xl bg-brand-50">
          {photoUrl ? (
            <Image src={photoUrl} alt={pet.title} fill className="object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-brand-300">
              <PawPrint className="h-12 w-12" />
            </div>
          )}
        </div>
        <Badge variant={statusVariant[pet.status] ?? 'default'} className="mt-3 w-fit">
          {statusLabel}
        </Badge>
      </CardHeader>
      <CardContent className="flex-1">
        <CardTitle className="flex flex-col gap-1 text-2xl font-semibold text-forest">
          <Link href={`/pet/${slug}`}>{pet.title}</Link>
          <span className="text-sm font-medium text-forest/70">
            {speciesLabels[pet.species] || 'Питомец'} · {sexLabels[pet.sex] || 'Пол неизвестен'}
          </span>
        </CardTitle>
        <div className="mt-4 grid gap-3 text-sm text-forest/80 sm:grid-cols-2">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            <span>Пропал: {lostAt}</span>
          </div>
          {pet.city && (
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              <span>{pet.city}</span>
            </div>
          )}
          {pet.color && <div>Окрас: {pet.color}</div>}
          {pet.breed && <div>Порода: {pet.breed}</div>}
          {typeof pet.reward === 'number' && pet.reward > 0 && <div>Вознаграждение: {pet.reward} BYN</div>}
        </div>
        <div className="mt-6 flex flex-wrap items-center gap-2">
          <Button asChild>
            <Link href={`/pet/${slug}`}>Подробнее</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href={`/sighting/new?pet=${pet.id}`}>Сообщить замечание</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
