import { NextResponse } from 'next/server';
import { createBoundingBox, haversineDistanceKm } from '@/lib/geo';
import { getPocketBaseServer, type SubscriptionRecord } from '@/lib/pb';

type NotifyType = 'pet' | 'sighting';

interface NotifyPayload {
  type: NotifyType;
  recordId: string;
  title: string;
  body: string;
  species?: string;
  lat: number;
  lng: number;
}

export async function POST(request: Request) {
  const payload = (await request.json()) as NotifyPayload;
  if (typeof payload.lat !== 'number' || typeof payload.lng !== 'number') {
    return NextResponse.json({ error: 'missing-location' }, { status: 400 });
  }

  const pb = await getPocketBaseServer();
  const bbox = createBoundingBox(payload.lat, payload.lng, 50);

  const filter = `centerLat >= ${bbox.minLat} && centerLat <= ${bbox.maxLat} && centerLng >= ${bbox.minLng} && centerLng <= ${bbox.maxLng}`;

  const subscriptions = await pb.collection('subscriptions').getFullList<SubscriptionRecord>({
    filter,
  });

  const tokens = subscriptions
    .filter((sub) => {
      if (!sub.token) return false;
      if (sub.species !== 'any' && payload.species && sub.species !== payload.species) return false;
      const distance = haversineDistanceKm(payload.lat, payload.lng, sub.centerLat, sub.centerLng);
      return distance <= (sub.radiusKm ?? 5);
    })
    .map((sub) => sub.token as string);

  if (tokens.length === 0) {
    return NextResponse.json({ success: true, delivered: 0 });
  }

  const serverKey = process.env.FCM_SERVER_KEY;
  if (!serverKey) {
    console.warn('FCM server key is missing');
    return NextResponse.json({ error: 'missing-server-key' }, { status: 500 });
  }

  const response = await fetch('https://fcm.googleapis.com/fcm/send', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `key=${serverKey}`,
    },
    body: JSON.stringify({
      registration_ids: tokens,
      notification: {
        title: payload.title,
        body: payload.body,
      },
      data: {
        type: payload.type,
        recordId: payload.recordId,
      },
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    console.error('FCM error', text);
    return NextResponse.json({ error: 'fcm-failed', details: text }, { status: 502 });
  }

  return NextResponse.json({ success: true, delivered: tokens.length });
}
