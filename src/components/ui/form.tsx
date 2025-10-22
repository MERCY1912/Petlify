'use client';

import * as React from 'react';
import { Controller, FormProvider, useFormContext } from 'react-hook-form';
import { Slot } from '@radix-ui/react-slot';
import { cn } from '@/lib/utils';
import { Label } from './label';

const FormFieldContext = React.createContext<{ name: string } | undefined>(undefined);

const FormItemContext = React.createContext<{
  id: string;
  descriptionId?: string;
  messageId?: string;
} | null>(null);

export function useFormField() {
  const fieldContext = React.useContext(FormFieldContext);
  const itemContext = React.useContext(FormItemContext);
  const { getFieldState, formState } = useFormContext();

  if (!fieldContext) {
    throw new Error('useFormField should be used within <FormField>');
  }

  const fieldState = getFieldState(fieldContext.name, formState);

  return {
    id: itemContext?.id,
    name: fieldContext.name,
    formItemId: itemContext?.id,
    formDescriptionId: itemContext?.descriptionId,
    formMessageId: itemContext?.messageId,
    ...fieldState,
  };
}

export const Form = FormProvider;

interface FormFieldProps {
  name: string;
  render: Controller['props']['render'];
}

export function FormField({ name, render }: FormFieldProps) {
  const { control } = useFormContext();
  return (
    <FormFieldContext.Provider value={{ name }}>
      <Controller name={name as any} control={control} render={render} />
    </FormFieldContext.Provider>
  );
}

export const FormItem = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => {
    const id = React.useId();

    return (
      <FormItemContext.Provider value={{ id, descriptionId: `${id}-description`, messageId: `${id}-message` }}>
        <div ref={ref} className={cn('flex flex-col gap-2', className)} {...props} />
      </FormItemContext.Provider>
    );
  },
);
FormItem.displayName = 'FormItem';

export const FormLabel = React.forwardRef<React.ElementRef<typeof Label>, React.ComponentPropsWithoutRef<typeof Label>>(
  ({ className, ...props }, ref) => {
    const { formItemId } = useFormField();

    return <Label ref={ref} className={cn('text-sm font-semibold text-forest', className)} htmlFor={formItemId} {...props} />;
  },
);
FormLabel.displayName = 'FormLabel';

export const FormControl = React.forwardRef<React.ElementRef<typeof Slot>, React.ComponentPropsWithoutRef<typeof Slot>>(
  ({ className, ...props }, ref) => {
    const { formItemId, formDescriptionId, formMessageId, error } = useFormField();

    return (
      <Slot
        ref={ref}
        id={formItemId}
        aria-describedby={[formDescriptionId, formMessageId].filter(Boolean).join(' ') || undefined}
        aria-invalid={!!error}
        className={className}
        {...props}
      />
    );
  },
);
FormControl.displayName = 'FormControl';

export const FormDescription = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) => {
    const { formDescriptionId } = useFormField();

    return <p ref={ref} id={formDescriptionId} className={cn('text-xs text-forest/60', className)} {...props} />;
  },
);
FormDescription.displayName = 'FormDescription';

export const FormMessage = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  ({ className, children, ...props }, ref) => {
    const { formMessageId, error } = useFormField();
    const body = error ? String(error.message) : children;

    if (!body) {
      return null;
    }

    return (
      <p ref={ref} id={formMessageId} className={cn('text-xs font-medium text-red-500', className)} {...props}>
        {body}
      </p>
    );
  },
);
FormMessage.displayName = 'FormMessage';
