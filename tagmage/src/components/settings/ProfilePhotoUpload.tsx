'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import UserAvatar from '@/components/shared/UserAvatar';
import { ArrowUpTrayIcon, CameraIcon } from '@heroicons/react/24/solid';
import { getSupabase } from '@/lib/supabase/client';

export default function ProfilePhotoUpload() {
  const { user, updateUser } = useAuth();
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const supabase = getSupabase();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };
  
  const handleUpload = async () => {
    if (!selectedFile || !user) return;

    setUploading(true);
    setError(null);

    try {
      // 1. Upload da imagem para o Storage
      const fileExt = selectedFile.name.split('.').pop();
      const filePath = `${user.id}-${Date.now()}.${fileExt}`;
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, selectedFile);

      if (uploadError) throw uploadError;

      // 2. Obter a URL pública
      const { data: urlData } = supabase.storage.from('avatars').getPublicUrl(filePath);
      const publicUrl = urlData.publicUrl;

      // 3. Atualizar metadados do usuário
      const { error: updateError } = await supabase.auth.updateUser({
        data: { avatar_url: publicUrl }
      });

      if (updateError) throw updateError;
      
      // 4. Atualizar o estado do usuário no app
      await updateUser();

      // Resetar o estado
      setPreviewUrl(null);
      setSelectedFile(null);

    } catch (err: any) {
      setError(err.message);
      console.error(err);
    } finally {
      setUploading(false);
    }
  };

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-3 items-center gap-4">
        <label className="text-sm font-semibold text-gray-700 md:col-span-1">
          Sua foto
        </label>
        <div className="md:col-span-2 flex items-center space-x-6">
          <div className="relative">
            {previewUrl ? (
              <img src={previewUrl} alt="Preview" className="w-20 h-20 rounded-full object-cover" />
            ) : (
              <UserAvatar size="lg" />
            )}
            <label 
              htmlFor="photo-upload" 
              className="absolute -bottom-1 -right-1 bg-white p-1.5 rounded-full border border-gray-300 shadow-sm cursor-pointer hover:bg-gray-100 transition-colors"
            >
              <CameraIcon className="w-5 h-5 text-gray-600" />
              <input
                id="photo-upload"
                name="photo-upload"
                type="file"
                className="sr-only"
                accept="image/png, image/jpeg"
                onChange={handleFileChange}
                disabled={uploading}
              />
            </label>
          </div>
          {previewUrl && (
            <button
              onClick={handleUpload}
              disabled={uploading || !selectedFile}
              className="flex items-center px-4 py-2 text-sm font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ArrowUpTrayIcon className="w-5 h-5 mr-2" />
              {uploading ? 'Enviando...' : 'Salvar foto'}
            </button>
          )}
        </div>
      </div>
      {error && (
        <div className="grid grid-cols-1 md:grid-cols-3">
          <div className="md:col-start-2 md:col-span-2">
            <p className="text-sm text-red-600 mt-2">{error}</p>
          </div>
        </div>
      )}
    </>
  );
} 