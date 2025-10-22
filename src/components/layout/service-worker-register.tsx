'use client';

import { useEffect } from 'react';

export function ServiceWorkerRegister() {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      const register = async () => {
        try {
          await navigator.serviceWorker.register('/sw.js');
        } catch (error) {
          console.error('Failed to register service worker', error);
        }
      };
      register();
    }
  }, []);

  return null;
}
