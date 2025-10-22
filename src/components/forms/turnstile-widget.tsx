'use client';

import { useEffect, useRef } from 'react';

declare global {
  interface Window {
    turnstile?: {
      render: (selector: string | HTMLElement, options: { sitekey: string; callback?: (token: string) => void }) => void;
      reset: (id?: string) => void;
    };
    onTurnstileLoad?: () => void;
  }
}

interface TurnstileWidgetProps {
  onSuccess: (token: string) => void;
}

export function TurnstileWidget({ onSuccess }: TurnstileWidgetProps) {
  const ref = useRef<HTMLDivElement>(null);
  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

  useEffect(() => {
    if (!siteKey) return;
    const loadScript = () => {
      if (typeof window === 'undefined' || !ref.current) return;
      window.turnstile?.render(ref.current, {
        sitekey: siteKey,
        callback: (token) => onSuccess(token),
      });
    };

    if (window.turnstile) {
      loadScript();
      return;
    }

    window.onTurnstileLoad = loadScript;

    const script = document.createElement('script');
    script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?onload=onTurnstileLoad';
    script.async = true;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
      window.onTurnstileLoad = undefined;
    };
  }, [onSuccess, siteKey]);

  return <div ref={ref} className="turnstile" />;
}
