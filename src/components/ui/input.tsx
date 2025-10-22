import * as React from 'react';
import { cn } from '@/lib/utils';

export type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

export const Input = React.forwardRef<HTMLInputElement, InputProps>(({ className, type = 'text', ...props }, ref) => {
  return (
    <input
      type={type}
      className={cn(
        'flex h-11 w-full rounded-xl border border-brand-200 bg-white px-4 py-2 text-sm text-forest shadow-sm transition focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-200 disabled:cursor-not-allowed disabled:bg-sand',
        className,
      )}
      ref={ref}
      {...props}
    />
  );
});
Input.displayName = 'Input';
