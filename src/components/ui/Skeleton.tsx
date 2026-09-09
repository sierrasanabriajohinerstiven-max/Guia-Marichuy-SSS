import React from 'react';
import { cn } from '../../lib/cn';

export interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'rect' | 'circle' | 'card';
}

export const Skeleton: React.FC<SkeletonProps> = ({ className, variant = 'text' }) => {
  const variantStyles = {
    text: 'h-4 w-full rounded-md',
    rect: 'h-24 w-full rounded-lg',
    circle: 'w-10 h-10 rounded-full shrink-0',
    card: 'h-72 w-full rounded-xl',
  };

  return (
    <div
      className={cn(
        'animate-pulse bg-[#3E2723]/10',
        variantStyles[variant],
        className
      )}
    />
  );
};
