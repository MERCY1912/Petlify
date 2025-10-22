import './globals.css';
import type { Metadata, Viewport } from 'next';
import Link from 'next/link';
import { Inter } from 'next/font/google';
import { PropsWithChildren } from 'react';
import { cn } from '@/lib/utils';
import { SiteHeader } from '@/components/layout/site-header';
import { ServiceWorkerRegister } from '@/components/layout/service-worker-register';
import { AuthProvider } from '@/components/layout/auth-provider';

const inter = Inter({
  subsets: ['latin', 'cyrillic'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL('https://petlify.example'),
  title: {
    default: 'Petlify — поиск пропавших питомцев в Беларуси',
    template: '%s · Petlify',
  },
  description:
    'Petlify помогает быстро находить пропавших питомцев в Беларуси: объявления, карта, замечания и подписки на пуш-уведомления.',
  applicationName: 'Petlify',
  keywords: ['пропавшие животные', 'питомцы', 'Беларусь', 'Petlify'],
  authors: [{ name: 'Petlify' }],
  openGraph: {
    type: 'website',
    locale: 'ru_BY',
    title: 'Petlify — поиск пропавших питомцев',
    description:
      'Сообщайте о пропаже и находке домашних животных, делитесь замечаниями и подписывайтесь на уведомления по радиусу.',
    siteName: 'Petlify',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Petlify',
    description:
      'Лента объявлений, карта и пуш-уведомления — всё, чтобы питомцы быстрее возвращались домой.',
  },
};

export const viewport: Viewport = {
  themeColor: '#ff6f0f',
};

export default function RootLayout({ children }: PropsWithChildren) {
  return (
    <html lang="ru" className={cn(inter.variable, 'bg-sand')} suppressHydrationWarning>
      <body className="flex min-h-screen flex-col bg-sand text-forest">
        <ServiceWorkerRegister />
        <AuthProvider>
          <SiteHeader />
          <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col px-4 pb-16 pt-6 sm:px-6 lg:px-8">
            {children}
          </main>
        </AuthProvider>
        <footer className="border-t border-brand-100 bg-white/80">
          <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-8 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
            <p className="text-sm text-forest/80">
              © {new Date().getFullYear()} Petlify. Помогаем питомцам вернуться домой.
            </p>
            <nav className="flex flex-wrap items-center gap-4 text-sm">
              <Link href="/about" className="hover:underline">
                О проекте
              </Link>
              <Link href="/profile" className="hover:underline">
                Профиль
              </Link>
              <Link href="/new" className="hover:underline">
                Разместить объявление
              </Link>
            </nav>
          </div>
        </footer>
      </body>
    </html>
  );
}
