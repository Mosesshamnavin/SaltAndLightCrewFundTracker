'use client';

import { Toaster as Sonner } from 'sonner';

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      theme="dark"
      className="toaster group"
      position="top-right"
      toastOptions={{
        classNames: {
          toast:
            'group toast group-[.toaster]:bg-slate-900 group-[.toaster]:text-slate-100 group-[.toaster]:border-slate-800 group-[.toaster]:shadow-2xl group-[.toaster]:rounded-2xl group-[.toaster]:backdrop-blur-xl',
          description: 'group-[.toast]:text-slate-400',
          actionButton:
            'group-[.toast]:bg-cyan-600 group-[.toast]:text-white group-[.toast]:rounded-xl group-[.toast]:font-semibold',
          cancelButton:
            'group-[.toast]:bg-slate-800 group-[.toast]:text-slate-400 group-[.toast]:rounded-xl',
          success: 'group-[.toast]:border-emerald-500/40 group-[.toast]:text-emerald-300',
          error: 'group-[.toast]:border-rose-500/40 group-[.toast]:text-rose-300',
        },
      }}
      {...props}
    />
  );
};

export { Toaster };
