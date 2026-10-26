import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import { cn } from '../../lib/cn';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  description?: React.ReactNode;
  children: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '4xl';
  className?: string;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  description,
  children,
  maxWidth = 'md',
  className,
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const maxWidthStyles = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    '4xl': 'max-w-4xl',
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="mc-app mc-fade fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#2E1C18]/35 backdrop-blur-sm"
    >
      <div
        className="fixed inset-0"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        className={cn(
          'glass glass--strong mc-modal relative w-full overflow-hidden z-10 flex flex-col max-h-[90vh] [--g-radius:28px]',
          maxWidthStyles[maxWidth],
          className
        )}
      >
        {(title || description) && (
          <div className="flex items-start justify-between p-5 border-b border-white/60">
            <div>
              {title && (
                <h3 className="text-lg font-bold text-[#3E2723] tracking-tight">
                  {title}
                </h3>
              )}
              {description && (
                <p className="text-xs text-[#6B6B6B] mt-1">{description}</p>
              )}
            </div>
            <button
              onClick={onClose}
              type="button"
              className="text-[#6B6B6B] hover:text-[#1E1E1E] p-1.5 rounded-full hover:bg-white/60 hover:rotate-90 transition-all duration-300"
              aria-label="Cerrar modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        )}
        <div className="p-5 overflow-y-auto flex-1">{children}</div>
      </div>
    </div>
  );
};
