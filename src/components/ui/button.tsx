import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap rounded-full text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-300 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-60 ring-offset-white',
  {
    variants: {
      variant: {
        default: 'bg-brand-500 text-white shadow-sm hover:bg-brand-600',
        secondary: 'bg-forest text-white hover:bg-forest/90',
        outline: 'border border-brand-300 bg-transparent text-forest hover:bg-brand-50',
        ghost: 'text-forest hover:bg-brand-50',
      },
      size: {
        default: 'h-10 px-5 py-2',
        sm: 'h-9 px-4 text-sm',
        lg: 'h-12 px-6 text-base',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>((props, ref) => {
  const { className, variant, size, asChild = false, ...rest } = props;
  const Comp = asChild ? Slot : 'button';
  return <Comp className={cn(buttonVariants({ variant, size }), className)} ref={ref} {...rest} />;
});
Button.displayName = 'Button';

export { Button, buttonVariants };
