'use client';

import { useState, useEffect } from 'react';
import { Project, updateProject } from '@/lib/supabase/projects';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@components/ui/Button';

interface ConfigurationStepProps {
  project: Project;
  onConfigurationComplete: () => void;
}

// Sub-componente para a criação de conversões
const GoogleAdsConversionCreator = ({ project }: { project: Project }) => {
  const { session } = useAuth();
  const [isCreating, setIsCreating] = useState<Record<string, boolean>>({});
  const [error, setError] = useState<Record<string, string>>({});

  const recommendedEvents = project.site_analysis_data?.recommended_events || [];

  if (recommendedEvents.length === 0) {
    return <p className="text-gray-600 mt-2">Nenhuma conversão recomendada pela IA.</p>;
  }

  const handleCreateConversion = async (eventName: string) => {
    if (!session?.provider_token || !project.google_ads_customer_id) {
      setError(prev => ({ ...prev, [eventName]: "ID de Cliente do Google Ads ou autenticação ausente."}));
      return;
    }

    setIsCreating(prev => ({ ...prev, [eventName]: true }));
    setError(prev => ({ ...prev, [eventName]: '' }));

    try {
      const response = await fetch('/api/google-ads/create-conversion', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
           'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          projectId: project.id,
          conversionName: eventName,
          customerId: project.google_ads_customer_id,
          providerToken: session.provider_token,
        }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Falha ao criar conversão.');
      
      // TODO: Atualizar UI para mostrar que foi criado com sucesso.
      console.log(`Conversão '${eventName}' criada:`, result);
      
    } catch (err: any) {
      setError(prev => ({ ...prev, [eventName]: err.message }));
    } finally {
      setIsCreating(prev => ({ ...prev, [eventName]: false }));
    }
  };

  return (
    <ul className="space-y-3 mt-4">
      {recommendedEvents.map((event: { event: string, description: string }, index: number) => (
        <li key={index} className="p-3 bg-gray-100 rounded-md border flex justify-between items-center">
          <div>
            <p className="font-semibold text-gray-800">{event.event}</p>
            <p className="text-sm text-gray-600">{event.description}</p>
            {error[event.event] && <p className="text-xs text-red-600 mt-1">Erro: {error[event.event]}</p>}
          </div>
          <Button
            onClick={() => handleCreateConversion(event.event)}
            disabled={isCreating[event.event]}
            size="sm"
          >
            {isCreating[event.event] ? 'Criando...' : 'Criar Conversão'}
          </Button>
        </li>
      ))}
    </ul>
  );
};

// Sub-componente para outras plataformas
const OtherPlatformsConfig = ({ project, onUpdate }: { project: Project, onUpdate: (updatedProject: Project) => void }) => {
  const { user } = useAuth();
  const [isSaving, setIsSaving] = useState(false);

  const handleInputChange = (field: keyof Project, value: string) => {
    onUpdate({ ...project, [field]: value });
  };

  const handleSave = async () => {
    if(!user) return;
    setIsSaving(true);
    const platformData = {
      meta_pixel_id: project.meta_pixel_id,
      tiktok_pixel_id: project.tiktok_pixel_id,
      linkedin_insight_tag_id: project.linkedin_insight_tag_id,
      ga4_id: project.ga4_id
    };
    await updateProject(project.id, platformData, user.id);
    setIsSaving(false);
    // TODO: Adicionar feedback de sucesso.
  };

  const platformFields = [
    { id: 'ga4_id', name: 'Google Analytics 4 ID', placeholder: 'G-XXXXXXXXXX' },
    { id: 'meta_pixel_id', name: 'Meta Pixel ID', placeholder: '0000000000000000' },
    { id: 'tiktok_pixel_id', name: 'TikTok Pixel ID', placeholder: 'C00000000000000000' },
    { id: 'linkedin_insight_tag_id', name: 'LinkedIn Insight Tag ID', placeholder: '0000000' },
  ];

  return (
    <div className="space-y-4 mt-4">
      {platformFields.map(field => (
        <div key={field.id}>
          <label htmlFor={field.id} className="block text-sm font-medium text-gray-700">{field.name}</label>
          <input
            type="text"
            name={field.id}
            id={field.id}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            placeholder={field.placeholder}
            value={project[field.id as keyof Project] as string || ''}
            onChange={(e) => handleInputChange(field.id as keyof Project, e.target.value)}
          />
        </div>
      ))}
      <div className="text-right">
        <Button onClick={handleSave} disabled={isSaving}>
          {isSaving ? 'Salvando...' : 'Salvar IDs das Plataformas'}
        </Button>
      </div>
    </div>
  )
}

const ConfigurationStep = ({ project, onConfigurationComplete }: ConfigurationStepProps) => {
  const { session, user } = useAuth();
  const [isCreatingGtm, setIsCreatingGtm] = useState(false);
  const [gtmError, setGtmError] = useState('');
  const [localProject, setLocalProject] = useState<Project>(project);
  const [isSavingCustomerId, setIsSavingCustomerId] = useState(false);

  // Lógica para criar o contêiner GTM
  const createGtmContainer = async () => {
    if (!session?.provider_token || !user) {
      setGtmError("Autenticação necessária. Por favor, volte ao passo anterior.");
      return;
    }

    setIsCreatingGtm(true);
    setGtmError('');

    try {
      const response = await fetch('/api/gtm/create-container', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          projectName: localProject.name,
          projectUrl: localProject.url,
          providerToken: session.provider_token,
        }),
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || 'Falha ao criar contêiner GTM.');
      }
      
      const updatedProjectData = { ...localProject, gtm_id: result.containerId };
      setLocalProject(updatedProjectData);

      await updateProject(localProject.id, { gtm_id: result.containerId }, user.id);
      
      console.log("Contêiner GTM criado com sucesso:", result.containerId);

    } catch (err: any) {
      console.error(err);
      setGtmError(err.message);
    } finally {
      setIsCreatingGtm(false);
    }
  };
  
  useEffect(() => {
    if (!localProject.gtm_id && !isCreatingGtm) {
      createGtmContainer();
    }
  }, []); // Executa apenas uma vez na montagem do componente

  const handleCustomerIdSave = async () => {
    if (!user || !localProject.google_ads_customer_id) return;
    setIsSavingCustomerId(true);
    await updateProject(localProject.id, { google_ads_customer_id: localProject.google_ads_customer_id }, user.id);
    setIsSavingCustomerId(false);
  };

  // Renderização do passo de configuração
  return (
    <div>
      <h3 className="text-xl font-bold text-gray-900 mb-4">Configuração Automática</h3>

      {/* Seção 1: GTM */}
      <div className="p-4 border rounded-lg bg-gray-50 mb-6">
        <h4 className="font-semibold text-gray-800">1. Google Tag Manager</h4>
        
        {isCreatingGtm && (
            <p className="text-gray-600 mt-2">Criando contêiner GTM para o seu projeto... Isso pode levar um momento.</p>
        )}

        {gtmError && (
            <p className="text-red-600 mt-2">Erro: {gtmError}</p>
        )}

        {localProject.gtm_id && !isCreatingGtm && (
            <p className="text-green-700 mt-2 font-medium">Contêiner GTM criado e conectado com sucesso!</p>
        )}
      </div>
      
      {/* Seção 2: Google Ads */}
      {localProject.gtm_id && (
        <div className="p-4 border rounded-lg bg-gray-50 mb-6">
          <h4 className="font-semibold text-gray-800">2. Conversões do Google Ads</h4>
          
          {!localProject.google_ads_customer_id ? (
            <div className="mt-2">
              <label htmlFor="customerId" className="block text-sm font-medium text-gray-700">
                Insira seu ID de Cliente do Google Ads
              </label>
              <div className="mt-1 flex rounded-md shadow-sm">
                <input
                  type="text"
                  name="customerId"
                  id="customerId"
                  className="block w-full flex-1 rounded-none rounded-l-md border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  placeholder="000-000-0000"
                  value={localProject.google_ads_customer_id || ''}
                  onChange={(e) => setLocalProject(p => ({ ...p, google_ads_customer_id: e.target.value }))}
                />
                <Button
                  onClick={handleCustomerIdSave}
                  disabled={isSavingCustomerId || !localProject.google_ads_customer_id}
                  className="rounded-l-none"
                >
                  {isSavingCustomerId ? 'Salvando...' : 'Salvar ID'}
                </Button>
              </div>
               <p className="mt-2 text-xs text-gray-500">
                  Você encontra este ID no canto superior direito do seu painel do Google Ads.
              </p>
            </div>
          ) : (
            <>
              <p className="text-sm text-gray-600 mt-1">Com base na análise do seu site, sugerimos criar as seguintes ações de conversão na sua conta do Google Ads.</p>
              <GoogleAdsConversionCreator project={localProject} />
            </>
          )}
        </div>
      )}

      {/* Seção 3: Outras Plataformas */}
      {localProject.gtm_id && (
        <div className="p-4 border rounded-lg bg-gray-50">
          <h4 className="font-semibold text-gray-800">3. Outras Plataformas (Opcional)</h4>
          <p className="text-sm text-gray-600 mt-1">Insira os IDs de outras plataformas que você utiliza. Nós configuraremos as tags para você no GTM.</p>
          <OtherPlatformsConfig project={localProject} onUpdate={setLocalProject} />
        </div>
      )}

      {/* Botão para finalizar */}
      <div className="mt-8 text-right">
        <Button onClick={onConfigurationComplete} size="lg">
            Concluir e Ir para Instalação
        </Button>
      </div>
    </div>
  );
};

export default ConfigurationStep; 