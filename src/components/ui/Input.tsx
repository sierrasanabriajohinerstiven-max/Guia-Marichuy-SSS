import React from 'react';
import { cn } from '../../lib/cn';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  helperText,
  className,
  id,
  leftIcon,
  rightIcon,
  disabled,
  ...props
}) => {
  const inputId = id || (label ? `input-${label.toLowerCase().replace(/\s+/g, '-')}` : undefined);

  return (
    <div className="w-full flex flex-col gap-1.5">
      {label && (
        <label
          htmlFor={inputId}
          className="text-xs font-semibold uppercase tracking-wider text-[#3E2723]/80"
        >
          {label}
        </label>
      )}
      <div className="relative flex items-center">
        {leftIcon && (
          <div className="absolute left-3 text-[#6B6B6B] pointer-events-none flex items-center justify-center">
            {leftIcon}
          </div>
        )}
        <input
          id={inputId}
          disabled={disabled}
          className={cn(
            'w-full min-h-[44px] px-3.5 py-2 text-sm bg-white border rounded-lg transition-colors text-[#1E1E1E] placeholder:text-[#6B6B6B]/60 focus:outline-none focus:ring-2 disabled:bg-[#F9F6F0] disabled:cursor-not-allowed',
            leftIcon ? 'pl-10' : '',
            rightIcon ? 'pr-10' : '',
            error
              ? 'border-[#C62828] focus:ring-[#C62828]/20 focus:border-[#C62828]'
              : 'border-[#3E2723]/20 focus:ring-[#D84315]/20 focus:border-[#D84315]',
            className
          )}
          {...props}
        />
        {rightIcon && (
          <div className="absolute right-3 text-[#6B6B6B] flex items-center justify-center">
            {rightIcon}
          </div>
        )}
      </div>
      {error ? (
        <p className="text-xs text-[#C62828] font-medium">{error}</p>
      ) : helperText ? (
        <p className="text-xs text-[#6B6B6B]">{helperText}</p>
      ) : null}
    </div>
  );
};
