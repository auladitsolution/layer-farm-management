import React from 'react';
import { cn } from '@/lib/utils';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
}

export const Card: React.FC<CardProps> = ({ children, className, ...props }) => {
  return (
    <div
      className={cn('bg-white rounded-xl border border-slate-200/80 shadow-xs p-5 transition-shadow hover:shadow-sm', className)}
      {...props}
    >
      {children}
    </div>
  );
};

export const CardHeader: React.FC<CardProps> = ({ children, className, ...props }) => {
  return (
    <div className={cn('flex items-center justify-between pb-3 border-b border-slate-100 mb-4', className)} {...props}>
      {children}
    </div>
  );
};

export const CardTitle: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className,
}) => {
  return <h3 className={cn('font-semibold text-slate-800 text-lg tracking-tight', className)}>{children}</h3>;
};
