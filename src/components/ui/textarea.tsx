import * as React from 'react';
import { cn } from '@/lib/utils';

export type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement>;

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(({ className, ...props }, ref) => {
  return (
    <textarea
      className={cn(
        'flex min-h-[120px] w-full rounded-xl border border-brand-200 bg-white px-4 py-3 text-sm text-forest shadow-sm transition focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-200 disabled:cursor-not-allowed disabled:bg-sand',
        className,
      )}
      ref={ref}
      {...props}
    />
  );
});
Textarea.displayName = 'Textarea';
