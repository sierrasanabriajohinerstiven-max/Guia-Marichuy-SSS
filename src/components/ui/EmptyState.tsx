import React from 'react';
import { Button } from './Button';
import { PackageOpen } from 'lucide-react';
import { cn } from '../../lib/cn';

export interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  actionLabel,
  onAction,
  className,
}) => {
  return (
    <div
      className={cn(
        'glass flex flex-col items-center justify-center text-center p-8 sm:p-12 max-w-lg mx-auto my-8 [--g-radius:28px]',
        className
      )}
    >
      <div className="w-16 h-16 rounded-2xl bg-white/60 border border-white/80 flex items-center justify-center text-[#3E2723] mb-4">
        {icon || <PackageOpen className="w-8 h-8 opacity-70" />}
      </div>
      <h3 className="text-lg font-bold text-[#3E2723] mb-2">{title}</h3>
      <p className="text-sm text-[#6B6B6B] max-w-sm mb-6 leading-relaxed">
        {description}
      </p>
      {actionLabel && onAction && (
        <Button onClick={onAction} variant="primary" size="md">
          {actionLabel}
        </Button>
      )}
    </div>
  );
};
