'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Project } from '@/lib/supabase/projects';
import { InformationCircleIcon } from '@heroicons/react/24/solid';
import { useAuth } from '@/contexts/AuthContext';

interface GoogleAdsAutomationProps {
  project: Project;
  onCreateConversion: (customerId: string, conversionName: string) => Promise<void>;
}

const GoogleAdsAutomation = ({ project, onCreateConversion }: GoogleAdsAutomationProps) => {
  const { signInWithGoogle, session } = useAuth();
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false); // For connection button
  const [error, setError] = useState('');
  const [googleAdsCustomerId, setGoogleAdsCustomerId] = useState('');
  const [creatingEvent, setCreatingEvent] = useState<string | null>(null);

  useEffect(() => {
    // Atualiza o estado de conexão se encontrarmos um provider_token na sessão
    if (session?.provider_token) {
      setIsConnected(true);
    }
  }, [session]);

  const handleConnect = async () => {
    setError('');
    setIsLoading(true);
    sessionStorage.setItem('googleAdsProjectId', project.id);
    const { error: authError } = await signInWithGoogle(['https://www.googleapis.com/auth/adwords']);
    if (authError) {
      setError(`Erro de autenticação: ${authError.message}`);
      setIsLoading(false);
      sessionStorage.removeItem('googleAdsProjectId');
    }
  };

  const handleCreateConversion = async (eventName: string) => {
    if (!googleAdsCustomerId) {
      setError('Por favor, insira o ID da Conta de Cliente do Google Ads.');
      return;
    }
    setError('');
    setCreatingEvent(eventName);
    try {
      await onCreateConversion(googleAdsCustomerId, eventName);
    } catch (e: any) {
      setError(e.message || 'Falha ao criar a conversão.');
    } finally {
      setCreatingEvent(null);
    }
  };

  const recommendedEvents = project.site_analysis_data?.recommended_events || [];

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 mt-8">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Automação do Google Ads
      </h3>

      {!isConnected ? (
        <div className="flex items-center justify-between p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div>
            <h4 className="font-semibold text-blue-800">Conecte sua conta do Google Ads</h4>
            <p className="text-sm text-blue-700 mt-1">
              Para criar ações de conversão automaticamente, precisamos da sua permissão.
            </p>
          </div>
          <Button onClick={handleConnect} disabled={isLoading}>
            {isLoading ? 'Conectando...' : 'Conectar com Google Ads'}
          </Button>
        </div>
      ) : (
        <div className="space-y-6">
          <div>
            <p className="text-green-700 font-semibold mb-2 flex items-center">
              <InformationCircleIcon className="w-5 h-5 mr-2" />
              Conectado ao Google Ads.
            </p>
            <label htmlFor="gads-customer-id" className="block text-sm font-medium text-gray-700 mb-1">
              ID da Conta de Cliente do Google Ads
            </label>
            <Input
              id="gads-customer-id"
              type="text"
              value={googleAdsCustomerId}
              onChange={(e) => setGoogleAdsCustomerId(e.target.value)}
              placeholder="000-000-0000"
              className="max-w-xs"
            />
            <p className="text-xs text-gray-500 mt-1">O ID da conta onde as conversões serão criadas.</p>
          </div>

          <div>
            <h4 className="text-base font-semibold text-gray-800">Sugestões de Conversão</h4>
            <p className="text-sm text-gray-600 mb-3">Baseado na análise do seu site, sugerimos criar as seguintes ações de conversão:</p>
            {recommendedEvents.length > 0 ? (
              <ul className="space-y-3">
                {(recommendedEvents as any[]).map((event) => (
                  <li key={event.name} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg border">
                    <span className="text-sm font-medium text-gray-800">{event.name}</span>
                    <Button
                      onClick={() => handleCreateConversion(event.name)}
                      disabled={!googleAdsCustomerId || !!creatingEvent}
                      variant="outline"
                      size="sm"
                    >
                      {creatingEvent === event.name ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900 mr-2"></div>
                          Criando...
                        </>
                      ) : (
                        'Criar'
                      )}
                    </Button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-gray-500 p-3 bg-gray-50 rounded-lg border">
                Nenhuma sugestão de conversão foi gerada pela análise inicial do site.
              </p>
            )}
          </div>
        </div>
      )}

      {error && (
        <div className="mt-4 text-xs text-red-600">
          <p>Erro: {error}</p>
        </div>
      )}
    </div>
  );
};

export default GoogleAdsAutomation; 
