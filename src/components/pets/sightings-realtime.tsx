'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/layout/auth-provider';

export function SightingsRealtimeBridge() {
  const { pb } = useAuth();
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = pb.collection('sightings').subscribe('*', () => {
      router.refresh();
    });
    return () => {
      pb.collection('sightings').unsubscribe('*');
      unsubscribe?.();
    };
  }, [pb, router]);

  return null;
}
