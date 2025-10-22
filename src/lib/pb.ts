import PocketBase, { type RecordModel } from 'pocketbase';

const pbUrl = process.env.NEXT_PUBLIC_PB_URL || 'http://127.0.0.1:8090';

export function createPocketBase() {
  return new PocketBase(pbUrl);
}

let client: PocketBase<RecordModel> | null = null;

export function getPocketBaseClient() {
  if (!client) {
    client = createPocketBase();
    if (typeof window !== 'undefined') {
      const stored = window.localStorage.getItem('pb_auth');
      if (stored) {
        try {
          client.authStore.loadFromCookie(stored);
        } catch (error) {
          console.warn('Failed to restore auth store', error);
        }
      }
      client.authStore.onChange((token) => {
        if (token) {
          window.localStorage.setItem('pb_auth', client!.authStore.exportToCookie());
        } else {
          window.localStorage.removeItem('pb_auth');
        }
      });
    }
  }

  return client;
}

export async function getPocketBaseServer() {
  const pb = createPocketBase();
  if (typeof window === 'undefined') {
    const { cookies } = await import('next/headers');
    const cookie = cookies().get('pb_auth');
    if (cookie?.value) {
      try {
        pb.authStore.loadFromCookie(cookie.value);
      } catch (error) {
        console.error('Failed to load auth store from cookie', error);
      }
    }
  }
  return pb;
}

export type Species = 'dog' | 'cat' | 'other';
export type PetStatus = 'lost' | 'found';
export type PetSex = 'm' | 'f' | 'unk';

export interface PetRecord extends RecordModel {
  title: string;
  species: Species;
  sex: PetSex;
  color: string;
  description?: string;
  breed?: string;
  lostAt?: string;
  lastLat?: number;
  lastLng?: number;
  reward?: number;
  status: PetStatus;
  city?: string;
  owner: string;
  expand?: {
    owner?: UserRecord;
    pet_photos?: PetPhotoRecord[];
  };
}

export interface PetPhotoRecord extends RecordModel {
  image: string;
  pet: string;
}

export interface SightingRecord extends RecordModel {
  pet: string;
  lat: number;
  lng: number;
  seenAt: string;
  comment?: string;
  author: string;
  expand?: {
    author?: UserRecord;
  };
}

export interface UserRecord extends RecordModel {
  name?: string;
  email?: string;
  city?: string;
  tg_handle?: string;
  role: 'user' | 'mod';
}

export interface SubscriptionRecord extends RecordModel {
  user: string;
  centerLat: number;
  centerLng: number;
  radiusKm: number;
  species: 'any' | Species;
  token?: string;
}
