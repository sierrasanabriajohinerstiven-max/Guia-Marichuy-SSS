import React, { useRef } from 'react';
import { UploadCloud, Image as ImageIcon, X, AlertCircle, FileCheck } from 'lucide-react';
import { Button } from '../../../components/ui/Button';

export interface ProofUploaderProps {
  selectedFile: File | null;
  previewUrl: string | null;
  error: string | null;
  onFileChange: (file: File | null) => void;
  disabled?: boolean;
}

export const ProofUploader: React.FC<ProofUploaderProps> = ({
  selectedFile,
  previewUrl,
  error,
  onFileChange,
  disabled,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (disabled) return;
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      onFileChange(e.dataTransfer.files[0]);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onFileChange(e.target.files[0]);
    }
  };

  return (
    <div className="space-y-3">
      <label className="text-xs font-semibold uppercase tracking-wider text-[#3E2723]/80 block">
        Comprobante de Transferencia Nequi *
      </label>

      {error && (
        <div className="p-3 bg-[#FFEBEE] border border-[#C62828]/20 rounded-lg text-xs font-medium text-[#C62828] flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {!selectedFile ? (
        <div
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          onClick={() => !disabled && fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
            disabled
              ? 'bg-[#F9F6F0] border-[#3E2723]/10 cursor-not-allowed opacity-60'
              : 'bg-white border-[#3E2723]/25 hover:border-[#D84315] hover:bg-[#FFF3E0]/10'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".png,.jpg,.jpeg,.webp,image/png,image/jpeg,image/webp"
            className="hidden"
            onChange={handleInputChange}
            disabled={disabled}
          />
          <div className="w-12 h-12 rounded-full bg-[#3E2723]/5 text-[#3E2723] flex items-center justify-center mx-auto mb-3">
            <UploadCloud className="w-6 h-6" />
          </div>
          <p className="text-sm font-bold text-[#3E2723]">
            Haz clic o arrastra tu comprobante aquí
          </p>
          <p className="text-xs text-[#6B6B6B] mt-1">
            Formatos válidos: .PNG, .JPG o .WEBP (Máximo 5MB)
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-[#3E2723]/15 p-4 flex flex-col sm:flex-row items-center gap-4">
          {/* Thumbnail preview */}
          <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-lg overflow-hidden border border-[#3E2723]/10 bg-[#F9F6F0] shrink-0">
            {previewUrl ? (
              <img
                src={previewUrl}
                alt="Vista previa del comprobante"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-[#6B6B6B]">
                <ImageIcon className="w-8 h-8" />
              </div>
            )}
          </div>

          {/* Details */}
          <div className="flex-1 min-w-0 text-center sm:text-left">
            <div className="flex items-center justify-center sm:justify-start gap-1.5 text-xs font-semibold text-[#558B2F] mb-1">
              <FileCheck className="w-4 h-4" />
              <span>Archivo cargado y listo</span>
            </div>
            <p className="text-sm font-bold text-[#3E2723] truncate">
              {selectedFile.name}
            </p>
            <p className="text-xs text-[#6B6B6B] mt-0.5">
              {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB · {selectedFile.type || 'Imagen'}
            </p>

            <div className="mt-3 flex items-center justify-center sm:justify-start gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={disabled}
                onClick={() => onFileChange(null)}
                leftIcon={<X className="w-3.5 h-3.5" />}
              >
                Cambiar imagen
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
