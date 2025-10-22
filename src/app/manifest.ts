import { MetadataRoute } from 'next';

const manifest = (): MetadataRoute.Manifest => ({
  name: 'Petlify',
  short_name: 'Petlify',
  description: 'Поиск пропавших питомцев в Беларуси',
  start_url: '/',
  display: 'standalone',
  background_color: '#f8f4ec',
  theme_color: '#ff6f0f',
  lang: 'ru-BY',
  icons: [
    {
      src: '/icons/icon-192.svg',
      sizes: '192x192',
      type: 'image/svg+xml',
    },
    {
      src: '/icons/icon-512.svg',
      sizes: '512x512',
      type: 'image/svg+xml',
    },
  ],
});

export default manifest;
