import React from 'react';
import { AlertCircle, RotateCcw } from 'lucide-react';
import { Button } from './Button';
import { cn } from '../../lib/cn';

export interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  code?: number | string;
  className?: string;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'Ocurrió un problema',
  message = 'No pudimos cargar la información en este momento. Por favor verifica tu conexión o intenta nuevamente.',
  onRetry,
  code,
  className,
}) => {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center text-center p-8 sm:p-12 rounded-xl bg-[#FFEBEE]/60 border border-[#C62828]/20 shadow-xs max-w-lg mx-auto my-8',
        className
      )}
    >
      <div className="w-14 h-14 rounded-full bg-[#FFEBEE] border border-[#C62828]/30 flex items-center justify-center text-[#C62828] mb-4">
        <AlertCircle className="w-7 h-7" />
      </div>
      {code && (
        <span className="text-xs font-bold text-[#C62828] uppercase tracking-wider mb-1">
          Código {code}
        </span>
      )}
      <h3 className="text-lg font-bold text-[#3E2723] mb-2">{title}</h3>
      <p className="text-sm text-[#6B6B6B] max-w-sm mb-6 leading-relaxed">
        {message}
      </p>
      {onRetry && (
        <Button
          onClick={onRetry}
          variant="outline"
          leftIcon={<RotateCcw className="w-4 h-4" />}
        >
          Reintentar
        </Button>
      )}
    </div>
  );
};
