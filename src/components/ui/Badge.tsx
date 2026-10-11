import React from 'react';
import { cn } from '@/lib/utils';

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'emerald' | 'amber' | 'rose' | 'sky' | 'indigo' | 'purple' | 'slate' | 'default';
  children: React.ReactNode;
  dot?: boolean;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  variant = 'default',
  children,
  dot = false,
  className,
  ...props
}) => {
  const variantMap = {
    emerald: 'bg-emerald-500/10 text-emerald-700 border-emerald-500/25',
    amber: 'bg-amber-500/10 text-amber-700 border-amber-500/25',
    rose: 'bg-rose-500/10 text-rose-700 border-rose-500/25',
    sky: 'bg-sky-500/10 text-sky-700 border-sky-500/25',
    indigo: 'bg-indigo-500/10 text-indigo-700 border-indigo-500/25',
    purple: 'bg-purple-500/10 text-purple-700 border-purple-500/25',
    slate: 'bg-slate-500/10 text-slate-700 border-slate-300',
    default: 'bg-emerald-500/10 text-emerald-700 border-emerald-500/25',
  };

  const dotColorMap = {
    emerald: 'bg-emerald-500',
    amber: 'bg-amber-500',
    rose: 'bg-rose-500',
    sky: 'bg-sky-500',
    indigo: 'bg-indigo-500',
    purple: 'bg-purple-500',
    slate: 'bg-slate-400',
    default: 'bg-emerald-500',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border tracking-wide shadow-2xs backdrop-blur-xs transition-colors',
        variantMap[variant],
        className
      )}
      {...props}
    >
      {dot && <span className={cn('w-1.5 h-1.5 rounded-full animate-pulse', dotColorMap[variant])} />}
      {children}
    </span>
  );
};

