'use client';

import { useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

export default function PopupCallback() {
  const supabase = createClientComponentClient();

  useEffect(() => {
    const handlePopupCallback = async () => {
      try {
        // Trocar o código pela sessão
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Erro na autenticação:', error);
          window.close();
          return;
        }

        if (session) {
          // Autenticação bem-sucedida, fechar o popup
          window.close();
        } else {
          window.close();
        }
      } catch (error) {
        console.error('Erro no callback:', error);
        window.close();
      }
    };

    handlePopupCallback();
  }, [supabase.auth]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
        <p className="text-gray-600 mb-2">Conectando com Google...</p>
        <p className="text-sm text-gray-500">Esta janela fechará automaticamente.</p>
      </div>
    </div>
  );
} 
