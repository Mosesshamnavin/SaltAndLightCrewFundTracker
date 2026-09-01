import * as React from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button-1';
import { cva, type VariantProps } from 'class-variance-authority';
import { X } from 'lucide-react';

const alertVariants = cva('flex items-center w-full gap-2 group-[.toaster]:w-(--width)', {
  variants: {
    variant: {
      secondary: '',
      primary: '',
      destructive: '',
      success: '',
      info: '',
      mono: '',
      warning: '',
    },
    icon: {
      primary: '',
      destructive: '',
      success: '',
      info: '',
      warning: '',
    },
    appearance: {
      solid: '',
      outline: '',
      light: '',
      stroke: 'text-foreground',
    },
    size: {
      lg: 'rounded-2xl p-4 gap-3 text-base [&>[data-slot=alert-icon]>svg]:size-6 *:data-slot=alert-icon:mt-0.5 [&_[data-slot=alert-close]]:mt-1',
      md: 'rounded-xl p-3 gap-2.5 text-sm [&>[data-slot=alert-icon]>svg]:size-5 *:data-slot=alert-icon:mt-0 [&_[data-slot=alert-close]]:mt-0.5',
      sm: 'rounded-xl px-3 py-2 gap-2 text-xs [&>[data-slot=alert-icon]>svg]:size-4 *:data-slot=alert-icon:mt-0.5 [&_[data-slot=alert-close]]:mt-0.25 [&_[data-slot=alert-close]_svg]:size-3.5',
    },
  },
  compoundVariants: [
    /* Solid */
    {
      variant: 'secondary',
      appearance: 'solid',
      className: 'bg-slate-100 text-slate-800',
    },
    {
      variant: 'primary',
      appearance: 'solid',
      className: 'bg-[#0F766E] text-white',
    },
    {
      variant: 'destructive',
      appearance: 'solid',
      className: 'bg-rose-600 text-white',
    },
    {
      variant: 'success',
      appearance: 'solid',
      className: 'bg-emerald-600 text-white',
    },
    {
      variant: 'info',
      appearance: 'solid',
      className: 'bg-blue-600 text-white',
    },
    {
      variant: 'warning',
      appearance: 'solid',
      className: 'bg-amber-500 text-white',
    },

    /* Outline */
    {
      variant: 'secondary',
      appearance: 'outline',
      className: 'border border-slate-200 bg-white text-slate-800',
    },
    {
      variant: 'primary',
      appearance: 'outline',
      className: 'border border-teal-200 bg-white text-[#0F766E]',
    },
    {
      variant: 'destructive',
      appearance: 'outline',
      className: 'border border-rose-200 bg-white text-rose-600',
    },
    {
      variant: 'success',
      appearance: 'outline',
      className: 'border border-emerald-200 bg-white text-emerald-600',
    },
    {
      variant: 'warning',
      appearance: 'outline',
      className: 'border border-amber-200 bg-white text-amber-600',
    },

    /* Light */
    {
      variant: 'secondary',
      appearance: 'light',
      className: 'bg-slate-100 border border-slate-200 text-slate-800',
    },
    {
      variant: 'primary',
      appearance: 'light',
      className: 'bg-teal-50 border border-teal-200 text-[#0F766E] [&_[data-slot=alert-icon]]:text-[#0F766E]',
    },
    {
      variant: 'destructive',
      appearance: 'light',
      className: 'bg-rose-50 border border-rose-200 text-rose-700 [&_[data-slot=alert-icon]]:text-rose-600',
    },
    {
      variant: 'success',
      appearance: 'light',
      className: 'bg-emerald-50 border border-emerald-200 text-emerald-700 [&_[data-slot=alert-icon]]:text-emerald-600',
    },
    {
      variant: 'warning',
      appearance: 'light',
      className: 'bg-amber-50 border border-amber-200 text-amber-800 [&_[data-slot=alert-icon]]:text-amber-600',
    },
  ],
  defaultVariants: {
    variant: 'secondary',
    appearance: 'solid',
    size: 'md',
  },
});

interface AlertProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof alertVariants> {
  close?: boolean;
  onClose?: () => void;
}

interface AlertIconProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof alertVariants> {}

function Alert({ className, variant, size = 'sm', icon, appearance = 'light', close = false, onClose, children, ...props }: AlertProps) {
  return (
    <div
      data-slot="alert"
      role="alert"
      className={cn(alertVariants({ variant, size, icon, appearance }), className)}
      {...props}
    >
      {children}
      {close && (
        <Button
          size="sm"
          variant="inverse"
          mode="icon"
          onClick={onClose}
          aria-label="Dismiss"
          data-slot="alert-close"
          className={cn('group shrink-0 size-4 ml-auto')}
        >
          <X className="opacity-60 group-hover:opacity-100 size-3.5" />
        </Button>
      )}
    </div>
  );
}

function AlertTitle({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return <div data-slot="alert-title" className={cn('grow font-semibold tracking-tight text-xs sm:text-sm', className)} {...props} />;
}

function AlertIcon({ children, className, ...props }: AlertIconProps) {
  return (
    <div data-slot="alert-icon" className={cn('shrink-0 flex items-center justify-center', className)} {...props}>
      {children}
    </div>
  );
}

function AlertToolbar({ children, className, ...props }: AlertIconProps) {
  return (
    <div data-slot="alert-toolbar" className={cn(className)} {...props}>
      {children}
    </div>
  );
}

function AlertDescription({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <div
      data-slot="alert-description"
      className={cn('text-xs [&_p]:leading-relaxed', className)}
      {...props}
    />
  );
}

function AlertContent({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <div
      data-slot="alert-content"
      className={cn('space-y-1 [&_[data-slot=alert-title]]:font-semibold', className)}
      {...props}
    />
  );
}

export { Alert, AlertContent, AlertDescription, AlertIcon, AlertTitle, AlertToolbar };
