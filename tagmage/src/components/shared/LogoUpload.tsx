'use client';

import { useState, useRef } from "react";
import { PhotoIcon, XMarkIcon } from "@heroicons/react/24/solid";

interface LogoUploadProps {
  currentLogoUrl?: string | null;
  onLogoChange: (logoUrl: string) => void;
  onLogoRemove: () => void;
  label: string;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

export default function LogoUpload({ 
  currentLogoUrl, 
  onLogoChange, 
  onLogoRemove, 
  label, 
  placeholder = "Clique ou arraste uma imagem aqui",
  className = "",
  disabled = false
}: LogoUploadProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (file: File) => {
    if (!file) return;

    // Validar tipo de arquivo
    if (!file.type.startsWith('image/')) {
      alert('Por favor, selecione apenas arquivos de imagem.');
      return;
    }

    // Validar tamanho (máximo 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('A imagem deve ter no máximo 5MB.');
      return;
    }

    setIsUploading(true);

    try {
      // Em uma implementação real, você faria upload para um serviço como Supabase Storage
      // Por enquanto, vamos usar uma URL temporária
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        onLogoChange(result);
        setIsUploading(false);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Erro ao processar imagem:', error);
      setIsUploading(false);
      alert('Erro ao processar a imagem. Tente novamente.');
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    if (disabled) return;

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleClick = () => {
    if (disabled) return;
    fileInputRef.current?.click();
  };

  return (
    <div className={`space-y-3 ${className}`}>
      <label className="text-sm font-semibold text-gray-700">
        {label}
      </label>
      
      {currentLogoUrl ? (
        <div className="relative">
          <div className="w-24 h-24 border-2 border-gray-200 rounded-lg overflow-hidden bg-gray-50 flex items-center justify-center">
            <img
              src={currentLogoUrl}
              alt="Logo"
              className="w-full h-full object-contain"
            />
          </div>
          <button
            onClick={onLogoRemove}
            className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
            disabled={disabled}
          >
            <XMarkIcon className="h-3 w-3" />
          </button>
        </div>
      ) : (
        <div
          onClick={handleClick}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`
            w-24 h-24 border-2 border-dashed rounded-lg flex flex-col items-center justify-center cursor-pointer transition-colors
            ${isDragOver && !disabled
              ? 'border-indigo-400 bg-indigo-50' 
              : 'border-gray-300'
            }
            ${!disabled ? 'cursor-pointer hover:border-gray-400 hover:bg-gray-50' : 'cursor-not-allowed bg-gray-100'}
            ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}
          `}
        >
          {isUploading ? (
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600"></div>
          ) : (
            <>
              <PhotoIcon className="h-6 w-6 text-gray-400" />
              <p className="text-xs text-gray-500 text-center mt-1 px-2">
                {placeholder}
              </p>
            </>
          )}
        </div>
      )}
      
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileInputChange}
        className="hidden"
        disabled={disabled}
      />
      
      <p className="text-xs text-gray-500">
        Formatos aceitos: JPG, PNG, GIF. Máximo 5MB.
      </p>
    </div>
  );
} 
