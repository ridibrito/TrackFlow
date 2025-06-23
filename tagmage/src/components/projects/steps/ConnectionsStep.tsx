'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/Button';

interface ConnectionsStepProps {
  onConnected: () => void;
}

const ConnectionsStep = ({ onConnected }: ConnectionsStepProps) => {
  const { signInWithGoogle } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleConnect = async () => {
    setIsLoading(true);
    setError('');

    try {
      // Solicitamos os escopos do GTM e do Google Ads de uma vez
      const { error } = await signInWithGoogle([
        'https://www.googleapis.com/auth/tagmanager.manage.accounts',
        'https://www.googleapis.com/auth/tagmanager.edit.containers',
        'https://www.googleapis.com/auth/tagmanager.manage.users',
        'https://www.googleapis.com/auth/adwords'
      ]);

      if (error) {
        throw new Error(error.message || 'Falha ao autenticar com o Google.');
      }
      
      // Se a conexão for bem-sucedida, chamamos a função para avançar o passo
      onConnected();

    } catch (err: any) {
      console.error("Erro na conexão com Google:", err);
      setError(err.message || 'Ocorreu um erro. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="text-center">
      <h3 className="text-xl font-bold text-gray-900 mb-2">Conecte sua Conta Google</h3>
      <p className="text-gray-600 mb-6">
        Para automatizar a criação de contas e tags, precisamos de permissão para acessar o Google Tag Manager e o Google Ads em seu nome.
      </p>
      
      <Button 
        onClick={handleConnect} 
        disabled={isLoading}
      >
        {isLoading ? 'Conectando...' : 'Conectar com Google'}
      </Button>

      {error && (
        <p className="mt-4 text-sm text-red-600">
          <strong>Erro:</strong> {error}
        </p>
      )}

       <div className="mt-6 text-left text-sm text-gray-500 bg-gray-50 p-4 rounded-lg border">
            <p className="font-semibold">Quais permissões estamos solicitando?</p>
            <ul className="list-disc list-inside mt-2 space-y-1">
                <li><strong>Google Tag Manager:</strong> Para criar e gerenciar contas, contêineres e tags de rastreamento.</li>
                <li><strong>Google Ads:</strong> Para criar e gerenciar ações de conversão na sua conta de anúncios.</li>
            </ul>
            <p className="mt-3">O Tag Mage apenas realizará ações quando solicitado por você e nunca armazenará sua senha do Google.</p>
        </div>
    </div>
  );
};

export default ConnectionsStep; 
