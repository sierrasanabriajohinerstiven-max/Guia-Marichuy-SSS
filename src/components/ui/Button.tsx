import React from 'react';
import { cn } from '../../lib/cn';
import { Loader2 } from 'lucide-react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'brand';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  className,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  leftIcon,
  rightIcon,
  disabled,
  ...props
}) => {
  const baseStyles =
    'relative overflow-hidden isolate inline-flex items-center justify-center font-medium rounded-full transition-[transform,background-color,box-shadow,color] duration-300 ease-[cubic-bezier(.34,1.56,.64,1)] hover:-translate-y-0.5 active:scale-95 disabled:hover:translate-y-0 disabled:active:scale-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap cursor-pointer select-none';

  const sizeStyles = {
    sm: 'text-xs px-3.5 py-1.5 gap-1.5 min-h-[36px]',
    md: 'text-sm px-5 py-2 gap-2 min-h-[44px]',
    lg: 'text-base px-6 py-3 gap-2.5 min-h-[48px]',
  };

  const variantStyles = {
    primary:
      'bg-[#D84315] hover:bg-[#BF360C] text-white focus:ring-[#D84315] shadow-[0_8px_22px_-8px_rgba(216,67,21,.75)] hover:shadow-[0_12px_28px_-8px_rgba(216,67,21,.9)]',
    brand:
      'bg-[#3E2723] hover:bg-[#2C1B18] text-[#F9F6F0] focus:ring-[#3E2723] shadow-[0_8px_22px_-8px_rgba(62,39,35,.7)]',
    secondary:
      'bg-[#558B2F] hover:bg-[#33691E] text-white focus:ring-[#558B2F] shadow-[0_8px_22px_-8px_rgba(85,139,47,.7)]',
    outline:
      'border border-white/75 text-[#3E2723] bg-white/45 backdrop-blur-md hover:bg-white/70 focus:ring-[#3E2723]',
    ghost:
      'text-[#3E2723] hover:bg-white/50 focus:ring-[#3E2723]',
    danger:
      'bg-[#C62828] hover:bg-[#B71C1C] text-white focus:ring-[#C62828] shadow-sm',
  };

  return (
    <button
      className={cn(baseStyles, sizeStyles[size], variantStyles[variant], className)}
      disabled={disabled || isLoading}
      data-ripple
      {...props}
    >
      {(variant === 'primary' || variant === 'brand') && !disabled && !isLoading && <span className="g-shine" aria-hidden="true" />}
      {isLoading ? (
        <Loader2 className="w-4 h-4 animate-spin shrink-0" />
      ) : leftIcon ? (
        <span className="shrink-0">{leftIcon}</span>
      ) : null}
      <span>{children}</span>
      {!isLoading && rightIcon && <span className="shrink-0">{rightIcon}</span>}
    </button>
  );
};
