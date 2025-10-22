import { cn } from '@/lib/utils';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'success' | 'warning';
}

export function Badge({ className, variant = 'default', ...props }: BadgeProps) {
  const styles: Record<BadgeProps['variant'], string> = {
    default: 'bg-brand-100 text-brand-700',
    success: 'bg-emerald-100 text-emerald-700',
    warning: 'bg-amber-100 text-amber-700',
  };
  return (
    <span
      className={cn('inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide', styles[variant], className)}
      {...props}
    />
  );
}
