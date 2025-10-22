0) Цель

Сайт «поиск пропавших питомцев» для Беларуси: лента объявлений, карта, фильтры, карточка питомца, добавление объявлений и «замечаний» (sightings), веб-пуш по радиусу.

1) Технологии (минимум, совместимые между собой)

Фронт: Next.js 14 (App Router, TypeScript, React 18)

UI: Tailwind CSS + shadcn/ui (базовые формы/карточки)

Карта: Leaflet + react-leaflet; тайлы — OpenStreetMap (через бесплатный провайдер)

Формы/валидация: React Hook Form + Zod

Аутентификация: e-mail magic link через PocketBase (встроенная auth)

Бэкенд/БД/файлы/realtime: PocketBase (последний stable) + SQLite (по умолчанию)

Пуш-уведомления: Firebase Cloud Messaging (веб-пуш)

Антибот: Cloudflare Turnstile

i18n/локаль: ru-BY (опционально be-BY)

Деплой: Front — Vercel; PocketBase — Fly.io/Render/VPS (любой один)

Мониторинг (минимум): Healthcheck PocketBase + Sentry (опционально на фронте)

Ничего дополнительно не поднимать: без отдельного Node-бэкенда, без очередей, без PostGIS, без SMS.

2) Домены данных (простые, под MVP)

Коллекции PocketBase и поля (названия — латиницей):

users (auth collection, стандарт PB)

name (text)

city (text, optional)

tg_handle (text, optional)

role (select: user | mod, default user)

pets

title (text, required)

species (select: dog | cat | other, required)

sex (select: m | f | unk, default unk)

color (text)

breed (text, optional)

lostAt (date)

lastLat (number)

lastLng (number)

reward (number, optional)

status (select: lost | found, default lost)

owner (relation → users, required, maxSelect=1)

pet_photos

pet (relation → pets, required)

image (file, required, accept: images, max 5MB)

sightings

pet (relation → pets, required)

lat (number, required)

lng (number, required)

seenAt (date, required)

comment (text, optional)

author (relation → users, required)

subscriptions (для веб-пушей по радиусу)

user (relation → users, required)

centerLat (number)

centerLng (number)

radiusKm (number, default 5)

species (select: any | dog | cat, default any)

3) Правила доступа (PocketBase Rules — просто)

pets

read: true

create: @request.auth.id != ""

update/delete: @request.auth.id = owner.id || @request.auth.role = "mod"

pet_photos

read: true

create: @request.auth.id != "" && pet.owner.id = @request.auth.id

sightings

read: true

create: @request.auth.id != ""

subscriptions

read: @request.auth.id != "" && user.id = @request.auth.id

create/update/delete: @request.auth.id != "" && user.id = @request.auth.id

4) Фичи и страницы (MVP)

/ (Лента): список pets с фильтрами (вид, пол, статус, дата, город). Пагинация. SSR.

/map (Карта): Leaflet + маркеры pets (только status=lost). Клик по маркеру → карточка.

/pet/[id] (Карточка): фото, описание, кнопки «Сообщить замечание», «Я нашёл/владелец». OG-теги.

/new (Создать объявление): форма с Turnstile, загрузка фото.

/sighting/new?pet=[id] (Новое замечание): выбор точки на карте, дата/время, комментарий.

/profile (Профиль): мои объявления и подписки по радиусу.

PWA: установка, кэш базовых роутов; офлайн-просмотр последней ленты.

5) Геопоиск (без PostGIS — прямо на клиенте)

В запросах к PB используем bounding box: minLat..maxLat, minLng..maxLng (фильтр коллекции).

Точный радиус и сортировку считаем в браузере (формула хаверсина).

Для карты — запрашиваем bbox текущего экрана.

6) Realtime и пуши

Realtime (PocketBase WS): подписка на pets и sightings для лайв-обновлений ленты/карты.

Веб-пуши (FCM): храним токен и subscriptions в PB. На создание pet/sighting фронт вызывает серверный API-роут Next.js (/api/notify), который читает подписчиков в радиусе и шлёт пуши через FCM.

7) Хуки PocketBase (минимум логики)

beforeCreate(pets): нормализовать строковые поля, троттлинг — не чаще 1 объявления/5 минут на пользователя.

afterCreate(pets|sightings): HTTP-вебхук на фронтовый /api/notify (или просто фронт сам дергает при успехе).

beforeCreate(pet_photos): проверка владельца и ограничение: не более 5 фото на питомца (или размер).

8) Команды и структура проекта

Фронт:

npx create-next-app@latest (TS, App Router)

npm i tailwindcss @tailwindcss/forms class-variance-authority lucide-react

npm i react-hook-form zod

npm i leafleт react-leaflet (внимание: корректный импорт CSS Leaflet)

npm i pocketbase (JS SDK)

npm i firebase (только для messaging)

npm i @vercel/og (OG-картинки, опционально)

npm i @types/leaflet -D

Папки (минимум):

/app
  /(public)/ (лента)
/app/pet/[id]
/app/new
/app/sighting/new
/app/map
/app/profile
/app/api/notify/route.ts   // рассылка пушей
/lib/pb.ts                 // клиент PocketBase
/lib/geo.ts                // bbox + хаверсин
/components/*              // карточки, формы
/styles/*                  // tailwind

9) Переменные окружения

Фронт (.env.local):

NEXT_PUBLIC_PB_URL=https://<pb-domain>
NEXT_PUBLIC_MAP_TILES_URL=<tiles-url>    # например, MapTiler/OSM
NEXT_PUBLIC_MAP_ATTRIBUTION='&copy; OpenStreetMap contributors'
NEXT_PUBLIC_FCM_VAPID_KEY=<public-vapid-key>
TURNSTILE_SITE_KEY=<site>
TURNSTILE_SECRET_KEY=<secret>            # использовать только в серверных роутах


PocketBase:

стандартные (порт, базовый admin), путь к файлам, CORS: добавить домен фронта.

10) UX/валидация (просто, чтобы ИИ сделал правильно)

Все формы через React Hook Form + Zod (схемы валидации прямо рядом с компонентами).

Turnstile в формах /new и /sighting/new.

Загрузка фото — через FormData в PB, предпросмотр, ресайз на клиенте (canvas) до ~1600px.

OG-теги на /pet/[id] (SSR): заголовок, описание, первая фотка.

11) SEO и i18n

Default locale: ru-BY.

Метаданные на страницах через generateMetadata.

ЧПУ для карточек: /pet/[id]-[slug] (slug из title на клиенте; в PB хранить не обязательно).

12) Критерии «готово» (простая приёмка)

Создание/редактирование/удаление объявления доступно только владельцу/модератору.

Карта показывает актуальные объявления и кликабельные маркеры.

Фильтры работают без перезагрузки, SSR не ломается.

Realtime: новые pets появляются в ленте без обновления страницы.

Пуш по радиусу приходит, если создан объект в зоне подписки.

PWA устанавливается; офлайн отображается последняя сохранённая лента.

Безошибочный билд и деплой на Vercel + запущенный PocketBase.

## Локальный запуск

```bash
npm install
npm run dev
```

Перед запуском заполните `.env.local` на основе `.env.example` и разверните PocketBase c коллекциями из раздела «Домены данных». Для пуш-уведомлений укажите `FCM_SERVER_KEY` и web push VAPID ключ.

## Структура

- `src/app` — страницы Next.js (App Router)
- `src/components` — UI-компоненты и формы
- `src/lib` — клиенты PocketBase, геолокация и Firebase
- `src/app/api` — серверные обработчики (Turnstile и рассылка FCM)
- `public/sw.js` — сервис-воркер для PWA
