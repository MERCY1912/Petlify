'use client';

import Link from 'next/link';
import { PawPrint, MapPin } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from './auth-provider';
import { cn } from '@/lib/utils';

export function SiteHeader() {
  const { user, requestMagicLink, signOut, loading } = useAuth();
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage(null);
    try {
      await requestMagicLink(email);
      setMessage('Мы отправили ссылку для входа на вашу почту.');
      setEmail('');
    } catch (error) {
      setMessage('Не удалось отправить ссылку. Попробуйте позже.');
    }
  };

  return (
    <header className="border-b border-brand-100 bg-white/80 backdrop-blur">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2 text-lg font-semibold text-forest">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-100 text-brand-600">
              <PawPrint className="h-6 w-6" />
            </span>
            Petlify
          </Link>
          <nav className="hidden gap-3 text-sm font-medium text-forest/80 sm:flex">
            <Link href="/" className="hover:text-forest">
              Лента
            </Link>
            <Link href="/map" className="hover:text-forest">
              Карта
            </Link>
            <Link href="/profile" className="hover:text-forest">
              Профиль
            </Link>
          </nav>
        </div>
        <div className="flex flex-1 items-center justify-end gap-3">
          <Link href="/map" className="hidden items-center gap-1 text-sm font-medium text-forest/80 sm:flex">
            <MapPin className="h-4 w-4" />
            Минск и вся Беларусь
          </Link>
          <Button asChild variant="secondary">
            <Link href="/new">Разместить объявление</Link>
          </Button>
        </div>
      </div>
      <div className="border-t border-brand-100 bg-sand/60 px-4 py-3 sm:hidden">
        <nav className="flex items-center justify-between text-sm font-medium text-forest/80">
          <Link href="/">Лента</Link>
          <Link href="/map">Карта</Link>
          <Link href="/profile">Профиль</Link>
        </nav>
      </div>
      <div className="border-t border-brand-100 bg-white/80">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-3 px-4 py-3 sm:px-6 lg:px-8">
          {user ? (
            <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-semibold text-forest">Здравствуйте, {user.name ?? 'пользователь'}!</p>
                {user.city && <p className="text-xs text-forest/70">{user.city}</p>}
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Button asChild variant="outline" size="sm">
                  <Link href="/profile">Мои объявления</Link>
                </Button>
                <Button onClick={signOut} size="sm" disabled={loading}>
                  Выйти
                </Button>
              </div>
            </div>
          ) : (
            <form className="flex flex-col gap-2 sm:flex-row sm:items-center" onSubmit={handleSubmit}>
              <Input
                placeholder="Ваша почта для входа"
                type="email"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="sm:w-72"
              />
              <Button type="submit" disabled={loading}>
                Получить ссылку
              </Button>
              {message && <p className={cn('text-xs', message.includes('Не удалось') ? 'text-red-500' : 'text-forest/70')}>{message}</p>}
            </form>
          )}
        </div>
      </div>
    </header>
  );
}
