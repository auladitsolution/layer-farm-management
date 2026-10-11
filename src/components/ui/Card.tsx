import React from 'react';
import { cn } from '@/lib/utils';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
}

export const Card: React.FC<CardProps> = ({ children, className, ...props }) => {
  return (
    <div
      className={cn(
        'bg-white/95 rounded-2xl border border-slate-200/80 shadow-xs p-5 md:p-6 transition-all duration-300 hover:shadow-md hover:border-slate-300/80 backdrop-blur-xs',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

export const CardHeader: React.FC<CardProps> = ({ children, className, ...props }) => {
  return (
    <div
      className={cn(
        'flex items-center justify-between pb-3.5 border-b border-slate-100/90 mb-4.5',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

export const CardTitle: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className,
}) => {
  return (
    <h3 className={cn('font-bold text-slate-800 text-lg tracking-tight', className)}>
      {children}
    </h3>
  );
};

export const CardDescription: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className,
}) => {
  return (
    <p className={cn('text-xs text-slate-500 mt-0.5 tracking-normal', className)}>
      {children}
    </p>
  );
};

