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
    'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap cursor-pointer select-none';

  const sizeStyles = {
    sm: 'text-xs px-3 py-1.5 gap-1.5 min-h-[36px]',
    md: 'text-sm px-4 py-2 gap-2 min-h-[44px]',
    lg: 'text-base px-6 py-3 gap-2.5 min-h-[48px]',
  };

  const variantStyles = {
    primary:
      'bg-[#D84315] hover:bg-[#BF360C] text-white focus:ring-[#D84315] shadow-sm active:translate-y-[0.5px]',
    brand:
      'bg-[#3E2723] hover:bg-[#2C1B18] text-[#F9F6F0] focus:ring-[#3E2723] shadow-sm active:translate-y-[0.5px]',
    secondary:
      'bg-[#558B2F] hover:bg-[#33691E] text-white focus:ring-[#558B2F] shadow-sm active:translate-y-[0.5px]',
    outline:
      'border border-[#3E2723]/30 text-[#3E2723] bg-transparent hover:bg-[#3E2723]/5 focus:ring-[#3E2723]',
    ghost:
      'text-[#3E2723] hover:bg-[#3E2723]/10 focus:ring-[#3E2723]',
    danger:
      'bg-[#C62828] hover:bg-[#B71C1C] text-white focus:ring-[#C62828] shadow-sm',
  };

  return (
    <button
      className={cn(baseStyles, sizeStyles[size], variantStyles[variant], className)}
      disabled={disabled || isLoading}
      {...props}
    >
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
