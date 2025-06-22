import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Project } from '@/lib/supabase/projects';
import { Dna, Gem, CheckCircle, Hourglass } from 'lucide-react';

interface PlatformConfigProps {
  platform: 'meta-ads' | 'google-analytics' | 'google-ads' | 'tiktok-ads';
  project: Project;
  onSave: (platform: string, data: string | { id: string; label: string }) => Promise<void>;
}

const platformDetails = {
  'meta-ads': { name: 'Meta Ads', icon: '/integrations/meta.svg' },
  'google-analytics': { name: 'Google Analytics 4', icon: '/integrations/ga4.svg' },
  'google-ads': { name: 'Google Ads', icon: '/logos/google-ads.svg' },
  'tiktok-ads': { name: 'TikTok Ads', icon: '/logos/tiktok-ads.svg' },
};

const PlatformConfig = ({ platform, project, onSave }: PlatformConfigProps) => {
  const platformData = project.platform_ids?.[platform];
  
  const initialId = typeof platformData === 'object' && 'id' in platformData ? platformData.id : typeof platformData === 'string' ? platformData : '';
  const initialLabel = typeof platformData === 'object' && 'label' in platformData ? platformData.label : '';

  const [platformId, setPlatformId] = useState(initialId);
  const [conversionLabel, setConversionLabel] = useState(initialLabel);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSave = async () => {
    setIsLoading(true);
    try {
      if (platform === 'google-ads') {
        await onSave(platform, { id: platformId, label: conversionLabel });
      } else {
        await onSave(platform, platformId);
      }
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to save platform ID:', error);
      // TODO: Show error to user
    } finally {
      setIsLoading(false);
    }
  };
  
  const displayValue = () => {
    if (platform === 'google-ads') {
      if (typeof platformData === 'object' && platformData?.id) {
        return `ID: ${platformData.id} | Rótulo: ${platformData.label}`;
      }
    } else if (typeof platformData === 'string' && platformData) {
      return platformData;
    }
    return 'Não configurado';
  };

  return (
    <div className="p-4 border rounded-lg bg-white shadow-sm">
      <div className="flex justify-between items-start">
        <div className="flex items-center">
          <img src={platformDetails[platform].icon} alt={platformDetails[platform].name} className="w-8 h-8 mr-3" />
          <div>
            <h3 className="font-semibold text-lg">{platformDetails[platform].name}</h3>
            {isEditing ? (
              <div className="mt-2">
                <Input
                  id={`${platform}-id`}
                  type="text"
                  value={platformId}
                  onChange={(e) => setPlatformId(e.target.value)}
                  placeholder={`Cole seu ${platformDetails[platform].name} ID aqui`}
                  className="w-full"
                />
                {platform === 'google-ads' && (
                  <Input
                    id={`${platform}-label`}
                    type="text"
                    value={conversionLabel}
                    onChange={(e) => setConversionLabel(e.target.value)}
                    placeholder="Cole seu Rótulo de Conversão aqui"
                    className="w-full mt-2"
                  />
                )}
              </div>
            ) : (
              <p className="text-gray-600">{displayValue()}</p>
            )}
          </div>
        </div>
        
        {!isEditing && (
          <button onClick={() => setIsEditing(true)} className="text-gray-500 hover:text-gray-700">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L7.83 19.82a2.25 2.25 0 01-1.41 1.41L2.25 21l.71-4.123a2.25 2.25 0 011.41-1.41L16.862 4.487z" />
            </svg>
          </button>
        )}
      </div>

      {isEditing && (
        <div className="flex justify-end mt-4">
          <Button onClick={() => setIsEditing(false)} variant="ghost" className="mr-2">
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={isLoading}>
            {isLoading ? 'Salvando...' : 'Salvar'}
          </Button>
        </div>
      )}

      {!isEditing && (
        <>
          {platform === 'google-analytics' && (
            <div className="mt-2 text-sm text-gray-500">
              <p className="font-semibold mb-2">Como encontrar seu ID de métricas do GA4:</p>
              <ol className="list-decimal list-inside space-y-1">
                <li>Acesse sua conta do Google Analytics.</li>
                <li>Vá em <strong>Administrador</strong> &gt; <strong>Fluxos de dados</strong>.</li>
                <li>Selecione o fluxo de dados do seu site.</li>
                <li>Seu ID estará no formato "G-XXXXXXXXXX".</li>
              </ol>
            </div>
          )}
          {platform === 'google-ads' && (
            <div className="mt-2 text-sm text-gray-500">
              <p className="font-semibold mb-2">Como encontrar as informações da sua tag:</p>
              <ol className="list-decimal list-inside space-y-1">
                <li>No menu à esquerda, clique no ícone <strong>Metas</strong> (🏆).</li>
                <li>Clique em uma <strong>Ação de conversão</strong> que você já tenha criado.</li>
                <li>Na página de detalhes da ação, role para baixo e expanda a seção <strong>Configuração da tag</strong>.</li>
                <li>Selecione a opção <strong>Usar o Gerenciador de tags do Google</strong>.</li>
                <li>Você verá o <strong>ID de conversão</strong> e o <strong>Rótulo de conversão</strong>. Copie ambos.</li>
              </ol>
            </div>
          )}
          {platform === 'tiktok-ads' && (
            <div className="mt-2 text-sm text-gray-500">
              <p className="font-semibold mb-2">Como encontrar seu ID do Pixel do TikTok:</p>
              <ol className="list-decimal list-inside space-y-1">
                <li>Acesse o <strong>TikTok Ads Manager</strong>.</li>
                <li>Vá em <strong>Ativos</strong> &gt; <strong>Eventos</strong>.</li>
                <li>Selecione "Gerenciar" na seção de Eventos da Web.</li>
                <li>Seu ID do Pixel estará visível lá.</li>
              </ol>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default PlatformConfig;
