import React from 'react';
import { formatCOP } from '../../lib/format';
import { cn } from '../../lib/cn';

export interface MoneyProps {
  amount: number;
  className?: string;
}

export const Money: React.FC<MoneyProps> = ({ amount, className }) => {
  return (
    <span className={cn('font-semibold text-[#1E1E1E] tabular-nums', className)}>
      {formatCOP(amount)}
    </span>
  );
};
