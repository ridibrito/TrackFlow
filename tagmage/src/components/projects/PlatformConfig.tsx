'use client';

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { Project, updateProject } from "@/lib/supabase/projects";
import { CheckCircleIcon, ExclamationTriangleIcon, ChevronDownIcon, ChevronRightIcon, EyeIcon, EyeSlashIcon, PencilIcon } from "@heroicons/react/24/solid";
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Dna, Gem } from 'lucide-react';

interface PlatformConfigProps {
  project: Project;
}

const platforms = [
  {
    id: 'google_ads',
    name: 'Google Ads',
    description: 'Configure o tracking para campanhas do Google Ads',
    icon: '/logos/google-ads.svg',
    fields: [
      { id: 'google_ads_id', label: 'ID de Conversão', placeholder: 'AW-123456789' },
      { id: 'google_ads_label', label: 'Rótulo de Conversão', placeholder: 'ABCD-efgHIJ-klm123' }
    ],
    instructions: [
      'Em Metas > Conversões, selecione sua ação de conversão.',
      'Vá em "Configuração da tag" e "Usar o Gerenciador de tags".',
      'Copie o ID de Conversão e o Rótulo de Conversão.'
    ]
  },
  {
    id: 'meta_ads',
    name: 'Meta Ads (Pixel)',
    description: 'Configure o tracking para campanhas do Facebook/Instagram Ads',
    icon: '/logos/meta-ads.svg',
    fields: [
      { id: 'meta_pixel_id', label: 'Meta Pixel ID', placeholder: '123456789012345' }
    ],
    instructions: [
      'Acesse o "Gerenciador de Eventos" do Facebook.',
      'No menu lateral, clique em "Fontes de Dados".',
      'Selecione seu Pixel. O ID é o número logo abaixo do nome do Pixel.'
    ]
  },
  {
    id: 'google_analytics',
    name: 'Google Analytics 4',
    description: 'Configure o tracking para o Google Analytics 4',
    icon: '/logos/google-analytics.svg',
    fields: [
      { id: 'ga4_measurement_id', label: 'GA4 Measurement ID', placeholder: 'G-XXXXXXXXXX' }
    ],
    instructions: [
      'Acesse sua propriedade do Google Analytics 4.',
      'Vá em "Administrador" (ícone de engrenagem).',
      'Na coluna "Propriedade", clique em "Fluxos de dados".',
      'Selecione o fluxo web. O "ID da métrica" estará no canto superior direito.'
    ]
  },
  {
    id: 'tiktok_ads',
    name: 'TikTok Ads',
    description: 'Configure o tracking para campanhas do TikTok Ads',
    icon: '/logos/tiktok-ads.svg',
    fields: [
      { id: 'tiktok_ads_id', label: 'TikTok Ads ID', placeholder: '123456789' }
    ]
  },
  {
    id: 'linkedin_ads',
    name: 'LinkedIn Ads',
    description: 'Configure o tracking para campanhas do LinkedIn Ads',
    icon: '/logos/linkedin-ads.svg',
    fields: [
      { id: 'linkedin_ads_id', label: 'LinkedIn Ads ID', placeholder: '123456789' }
    ]
  }
];

export default function PlatformConfig({ project }: PlatformConfigProps) {
  const { user, session, signInWithGooglePopup } = useAuth();
  const router = useRouter();
  
  const initialConfigsState = {
    google_ads_id: project.google_ads_id || '',
    google_ads_label: project.google_ads_label || '',
    meta_pixel_id: project.meta_pixel_id || '',
    ga4_measurement_id: project.ga4_measurement_id || '',
    tiktok_ads_id: project.tiktok_ads_id || '',
    linkedin_ads_id: project.linkedin_ads_id || ''
  };

  const [initialConfigs, setInitialConfigs] = useState(initialConfigsState);
  const [configs, setConfigs] = useState(initialConfigsState);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [expandedPlatform, setExpandedPlatform] = useState<string | null>(null);
  const [editingField, setEditingField] = useState<string | null>(null);
  const [isMainAccordionOpen, setIsMainAccordionOpen] = useState(true);
  const [isConfiguring, setIsConfiguring] = useState(false);
  const [timer, setTimer] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const startTimer = () => {
    setTimer(0);
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => setTimer(prev => prev + 1), 1000);
  };

  const stopTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const isDirty = JSON.stringify(initialConfigs) !== JSON.stringify(configs);

  const handleSave = async () => {
    if (!user) return;

    setError('');
    setSuccess('');
    setIsSubmitting(true);
    setEditingField(null); // Sai do modo de edição ao salvar

    const { error } = await updateProject(project.id, configs, user.id);

    setIsSubmitting(false);

    if (error) {
      setError('Erro ao salvar as configurações. Tente novamente.');
    } else {
      setSuccess('Configurações salvas com sucesso!');
      setInitialConfigs(configs); // Atualiza o estado inicial, desabilitando o botão
      setTimeout(() => setSuccess(''), 3000);
    }
  };

  const handleConfigureTags = async () => {
    setIsConfiguring(true);
    startTimer();
    setError('');
    
    try {
      // Usar popup para autenticação
      const { error: authError } = await signInWithGooglePopup([
        'https://www.googleapis.com/auth/tagmanager.edit.containers',
        'https://www.googleapis.com/auth/tagmanager.manage.accounts',
        'https://www.googleapis.com/auth/adsense.readonly',
        'https://www.googleapis.com/auth/analytics.readonly',
        'https://www.googleapis.com/auth/adwords'
      ]);

      if (authError) {
        throw new Error(`Erro de autenticação: ${authError.message}`);
      }

      // Aguardar a sessão ser atualizada
      
    } catch (err: any) {
      setError(err.message);
      setIsConfiguring(false);
      stopTimer();
    }
  };

  // Verificar quando a sessão é atualizada após o popup
  useEffect(() => {
    if (isConfiguring && session?.provider_token) {
      // Sessão atualizada, configurar as tags
      configureTagsAfterAuth();
    }
  }, [session, isConfiguring]);

  const configureTagsAfterAuth = async () => {
    if (!session?.provider_token) return;

    try {
      const response = await fetch('/api/gtm/configure-tags', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectId: project.id }),
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Falha ao configurar as tags.');

      setSuccess('Tags configuradas e publicadas com sucesso!');
      router.refresh();

    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsConfiguring(false);
      stopTimer();
      setTimeout(() => setSuccess(''), 4000);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setConfigs(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const togglePlatform = (platformId: string) => {
    setExpandedPlatform(expandedPlatform === platformId ? null : platformId);
  };

  const startEditing = (fieldId: string) => {
    setEditingField(fieldId);
  };

  const stopEditing = () => {
    setEditingField(null);
  };

  const hasAnyConfig = Object.values(configs).some(value => value.trim() !== '');
  const isGtmConfigured = project.gtm_id;

  if (!isGtmConfigured) {
    return (
      <div className="bg-amber-50 border border-amber-200 rounded-2xl shadow-sm">
        <div className="p-6 md:p-8">
          <div className="flex items-center space-x-3">
            <ExclamationTriangleIcon className="h-6 w-6 text-amber-600" />
            <h2 className="text-2xl font-bold text-gray-900">Configuração de Plataformas</h2>
          </div>
          <p className="mt-1 text-gray-600">
            Configure primeiro o GTM para prosseguir com as configurações das plataformas de anúncios.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
      <button 
        className="w-full flex items-center justify-between p-6 md:p-8 hover:bg-gray-50 transition-colors"
        onClick={() => setIsMainAccordionOpen(!isMainAccordionOpen)}
      >
        <div className="flex items-center space-x-3">
          <h2 className="text-2xl font-bold text-gray-900">2. Conectar Plataformas e Instalar Tags</h2>
          {hasAnyConfig && (
            <CheckCircleIcon className="h-6 w-6 text-green-600" />
          )}
        </div>
        <div className="flex items-center space-x-2">
           <p className="text-sm text-gray-600 hidden md:block">
            Configure os IDs das suas plataformas de anúncios para automatizar o tracking de conversões.
           </p>
           {isMainAccordionOpen ? (
                <ChevronDownIcon className="h-6 w-6 text-gray-500" />
            ) : (
                <ChevronRightIcon className="h-6 w-6 text-gray-500" />
            )}
        </div>
      </button>

     {isMainAccordionOpen && (
        <>
            <div className="px-6 md:px-8 pb-8 pt-4 border-t border-gray-200">
                <div className="space-y-4">
                {platforms.map((platform) => {
                    const platformConfigKey = platform.fields[0].id as keyof typeof configs;
                    const platformConfig = configs[platformConfigKey];
                    const isExpanded = expandedPlatform === platform.id;
                    const isConfigured = platformConfig && platformConfig.trim() !== '';

                    return (
                    <div key={platform.id} className="border border-gray-200 rounded-lg overflow-hidden">
                        <button
                        onClick={() => togglePlatform(platform.id)}
                        className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
                        >
                        <div className="flex items-center space-x-3">
                            <img 
                            src={platform.icon} 
                            alt={platform.name}
                            className="h-8 w-8"
                            />
                            <div className="text-left">
                            <h3 className="font-semibold text-gray-900">{platform.name}</h3>
                            <p className="text-sm text-gray-600">{platform.description}</p>
                            </div>
                        </div>
                        <div className="flex items-center space-x-2">
                            {isConfigured && (
                            <CheckCircleIcon className="h-5 w-5 text-green-600" />
                            )}
                            {isExpanded ? (
                            <ChevronDownIcon className="h-5 w-5 text-gray-400" />
                            ) : (
                            <ChevronRightIcon className="h-5 w-5 text-gray-400" />
                            )}
                        </div>
                        </button>

                        {isExpanded && (
                        <div className="border-t border-gray-200 p-4 bg-gray-50/50">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    {platform.fields.map((field) => {
                                    const fieldValue = configs[field.id as keyof typeof configs];
                                    const isEditing = editingField === field.id;

                                    return (
                                        <div key={field.id} className="space-y-2">
                                        <label htmlFor={field.id} className="text-sm font-medium text-gray-700">
                                            {field.label}
                                        </label>
                                        
                                        {isEditing || !fieldValue ? (
                                            <div className="flex space-x-2">
                                                <input
                                                    type="text"
                                                    id={field.id}
                                                    value={fieldValue}
                                                    onChange={(e) => handleInputChange(field.id, e.target.value)}
                                                    className="flex-1 w-full px-3 py-2 text-sm text-gray-900 placeholder:text-gray-500 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                                    placeholder={field.placeholder}
                                                    autoFocus
                                                />
                                                <button 
                                                    onClick={handleSave} 
                                                    disabled={isSubmitting}
                                                    className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:opacity-50"
                                                >
                                                    {isSubmitting ? '...' : 'Salvar'}
                                                </button>
                                            </div>
                                        ) : (
                                            <div className="flex items-center justify-between p-2 bg-white border border-gray-200 rounded-lg">
                                                <p className="text-sm text-gray-800 font-mono">{fieldValue}</p>
                                                <button
                                                    onClick={() => startEditing(field.id)}
                                                    className="flex items-center space-x-1 text-sm text-gray-500 hover:text-indigo-600"
                                                >
                                                    <PencilIcon className="h-3 w-3" />
                                                    <span>Editar</span>
                                                </button>
                                            </div>
                                        )}
                                        </div>
                                    );
                                    })}
                                </div>
                                {platform.instructions && (
                                    <div className="text-sm text-gray-600">
                                        <h4 className="font-semibold text-gray-800 mb-2">Como encontrar o ID:</h4>
                                        <ol className="list-decimal list-inside space-y-1">
                                            {platform.instructions.map((step, i) => <li key={i}>{step}</li>)}
                                        </ol>
                                    </div>
                                )}
                            </div>
                        </div>
                        )}
                    </div>
                    );
                })}
                </div>

                {error && <p className="mt-4 text-sm text-red-600">{error}</p>}
                {success && <p className="mt-4 text-sm text-green-600">{success}</p>}
            </div>

            {(isDirty && !editingField) || (hasAnyConfig && !isDirty) ? (
                 <div className="bg-gray-50 px-6 md:px-8 py-4 border-t border-gray-200 flex justify-end space-x-4 items-center">
                    {isDirty && <p className="text-sm text-gray-600">Você tem alterações não salvas.</p>}
                    
                    {isDirty && (
                      <button
                          onClick={handleSave}
                          disabled={isSubmitting}
                          className="px-6 py-2.5 text-sm font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:opacity-50"
                      >
                          {isSubmitting ? 'Salvando...' : 'Salvar IDs'}
                      </button>
                    )}

                    {hasAnyConfig && !isDirty && (
                       <button
                          onClick={handleConfigureTags}
                          disabled={isConfiguring}
                          className="px-6 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-teal-500 rounded-lg hover:shadow-lg hover:shadow-blue-500/40 transition-all duration-300 disabled:opacity-50"
                        >
                          {isConfiguring ? `Instalando... (${timer}s)` : 'Instalar Tags no GTM'}
                        </button>
                    )}
                </div>
            ) : null }

            {(error || success) && (
              <div className="px-6 md:px-8 pb-4">
                {error && (
                  <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-r-lg">
                    <p className="text-sm text-red-700">{error}</p>
                  </div>
                )}
                {success && (
                  <div className="bg-green-50 border-l-4 border-green-400 p-4 rounded-r-lg">
                    <p className="text-sm text-green-700">{success}</p>
                  </div>
                )}
              </div>
            )}
        </>
     )}
    </div>
  );
} 
