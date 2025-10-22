import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function createSlug(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9\s\-а-яё]/g, '')
    .trim()
    .replace(/\s+/g, '-');
}
