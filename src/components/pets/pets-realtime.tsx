'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/layout/auth-provider';

export function PetsRealtimeBridge() {
  const { pb } = useAuth();
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = pb.collection('pets').subscribe('*', () => {
      router.refresh();
    });
    return () => {
      pb.collection('pets').unsubscribe('*');
      unsubscribe?.();
    };
  }, [pb, router]);

  return null;
}
