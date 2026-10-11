import React from 'react';
import { cn } from '@/lib/utils';
import { Inbox } from 'lucide-react';

export const Skeleton: React.FC<{ className?: string }> = ({ className }) => {
  return <div className={cn('animate-pulse bg-slate-200/80 rounded-xl', className)} />;
};

interface EmptyStateProps {
  title: string;
  description?: string;
  action?: React.ReactNode;
  icon?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  action,
  icon,
}) => {
  return (
    <div className="flex flex-col items-center justify-center py-14 px-4 text-center rounded-2xl border-2 border-dashed border-slate-200/80 bg-white/60 backdrop-blur-xs transition-all">
      <div className="w-14 h-14 mb-3.5 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center ring-4 ring-slate-50 shadow-inner">
        {icon || <Inbox className="w-7 h-7" />}
      </div>
      <h3 className="text-base font-bold text-slate-800 tracking-tight">{title}</h3>
      {description && <p className="text-xs md:text-sm text-slate-500 max-w-sm mt-1 mb-5 leading-relaxed">{description}</p>}
      {action && <div>{action}</div>}
    </div>
  );
};

