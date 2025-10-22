import { NextResponse } from 'next/server';

interface TurnstileResponse {
  success: boolean;
  errorCodes?: string[];
}

export async function POST(request: Request) {
  const body = await request.json();
  const token = body?.token as string | undefined;
  if (!token) {
    return NextResponse.json({ success: false, error: 'missing-token' }, { status: 400 });
  }
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) {
    return NextResponse.json({ success: false, error: 'missing-secret' }, { status: 500 });
  }

  const form = new URLSearchParams();
  form.append('secret', secret);
  form.append('response', token);

  const response = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
    method: 'POST',
    body: form,
  });
  const data = (await response.json()) as TurnstileResponse;
  if (!data.success) {
    return NextResponse.json({ success: false, errors: data.errorCodes ?? [] }, { status: 400 });
  }
  return NextResponse.json({ success: true });
}
