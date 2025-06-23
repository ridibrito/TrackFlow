'use client';

import { useState } from 'react';
import { 
  CheckCircleIcon, 
  DocumentDuplicateIcon,
  EyeIcon,
  CodeBracketIcon,
  CogIcon,
  ChartBarIcon,
  InformationCircleIcon,
} from '@heroicons/react/24/outline';

interface ProjectResult {
  project: {
    id: string;
    name: string;
    url: string;
  };
  analysis: {
    businessType: string;
    platforms: string[];
    conversionElements: any[];
    recommendedEvents: any[];
  };
  gtmConfig: {
    containerConfig: any;
    triggers: any[];
    tags: any[];
    variables: any[];
  };
  implementationCodes: {
    gtmSnippet: string;
    dataLayer: string;
    customEvents: string[];
    instructions: string;
  };
}

type ResultTab = 'overview' | 'analysis' | 'gtm' | 'code';

interface ProjectResultCardProps {
  result: ProjectResult;
  onViewProject: () => void;
  onViewAllProjects: () => void;
}

export default function ProjectResultCard({ result, onViewProject, onViewAllProjects }: ProjectResultCardProps) {
  const [activeTab, setActiveTab] = useState<ResultTab>('overview');
  const [copied, setCopied] = useState<string | null>(null);

  const copyToClipboard = async (text: string, type: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(type);
      setTimeout(() => setCopied(null), 2000);
    } catch (err) {
      console.error('Erro ao copiar:', err);
    }
  };

  const tabs = [
    { id: 'overview', name: 'Visão Geral', icon: EyeIcon },
    { id: 'analysis', name: 'Análise', icon: ChartBarIcon },
    { id: 'gtm', name: 'Configuração GTM', icon: CogIcon },
    { id: 'code', name: 'Códigos', icon: CodeBracketIcon },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <div className="space-y-6">
            <div className="bg-green-50 border border-green-200 rounded-lg p-6">
              <div className="flex items-center">
                <CheckCircleIcon className="w-8 h-8 text-green-500 mr-3" />
                <div>
                  <h3 className="text-lg font-semibold text-green-900">Projeto Criado com Sucesso!</h3>
                  <p className="text-green-700">Seu projeto está pronto para implementação.</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-3">Detalhes do Projeto</h4>
                <div className="space-y-2 text-sm text-gray-800">
                  <p><span className="font-medium text-gray-500">Nome:</span> {result.project.name}</p>
                  <p><span className="font-medium text-gray-500">URL:</span> {result.project.url}</p>
                  <p><span className="font-medium text-gray-500">ID:</span> {result.project.id}</p>
                </div>
              </div>

              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-3">Resumo da Análise</h4>
                <div className="space-y-2 text-sm text-gray-800">
                  <p><span className="font-medium text-gray-500">Tipo:</span> {result.analysis.businessType}</p>
                  <p><span className="font-medium text-gray-500">Plataformas:</span> {result.analysis.platforms?.join(', ')}</p>
                  <p><span className="font-medium text-gray-500">Elementos:</span> {result.analysis.conversionElements?.length || 0} detectados</p>
                </div>
              </div>
            </div>

            <div className="flex space-x-4">
              <button
                onClick={onViewProject}
                className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 flex items-center justify-center cursor-pointer"
              >
                <EyeIcon className="w-5 h-5 mr-2" />
                Ver Projeto
              </button>
              <button
                onClick={onViewAllProjects}
                className="flex-1 bg-gray-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-gray-700 flex items-center justify-center cursor-pointer"
              >
                Ver Todos os Projetos
              </button>
            </div>
          </div>
        );

      case 'analysis':
        return (
          <div className="space-y-6">
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h4 className="font-medium text-gray-900 mb-4">Análise do Site</h4>
              
              <div className="space-y-4">
                <div>
                  <h5 className="font-medium text-gray-700 mb-2">Tipo de Negócio</h5>
                  <p className="text-sm text-gray-600">{result.analysis.businessType}</p>
                </div>

                <div>
                  <h5 className="font-medium text-gray-700 mb-2">Plataformas Detectadas</h5>
                  <div className="flex flex-wrap gap-2">
                    {result.analysis.platforms?.map((platform, index) => (
                      <span key={index} className="px-3 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                        {platform}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <h5 className="font-medium text-gray-700 mb-2">Elementos de Conversão</h5>
                  <div className="space-y-2">
                    {result.analysis.conversionElements?.map((element, index) => (
                      <div key={index} className="text-sm text-gray-600 p-2 bg-gray-50 rounded">
                        <strong>{element.type}:</strong> {element.description}
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h5 className="font-medium text-gray-700 mb-2">Eventos Recomendados</h5>
                  <div className="space-y-2">
                    {result.analysis.recommendedEvents?.map((event, index) => (
                      <div key={index} className="text-sm text-gray-600 p-2 bg-gray-50 rounded">
                        <strong>{event.name}:</strong> {event.description}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'gtm':
        if (!result.gtmConfig) {
          return (
            <div className="bg-white border border-gray-200 rounded-lg p-6 text-center">
              <InformationCircleIcon className="h-12 w-12 text-blue-500 mx-auto mb-4" />
              <h4 className="font-medium text-gray-900 mb-2">GTM já instalado</h4>
              <p className="text-sm text-gray-600">
                Detectamos que o Google Tag Manager já está presente no site. Portanto, nenhuma nova configuração GTM foi gerada.
              </p>
              <p className="text-sm text-gray-600 mt-2">
                O projeto foi criado e você pode prosseguir com a configuração avançada na página de detalhes do projeto.
              </p>
            </div>
          );
        }
        return (
          <div className="space-y-6">
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h4 className="font-medium text-gray-900 mb-4">Configuração GTM Gerada</h4>
              
              <div className="space-y-4">
                <div>
                  <h5 className="font-medium text-gray-700 mb-2">Container</h5>
                  <div className="text-sm text-gray-600 p-2 bg-gray-50 rounded">
                    <p><strong>Nome:</strong> {result.gtmConfig.containerConfig?.containerName}</p>
                    <p><strong>ID:</strong> {result.gtmConfig.containerConfig?.containerId}</p>
                  </div>
                </div>

                <div>
                  <h5 className="font-medium text-gray-700 mb-2">Triggers ({result.gtmConfig.triggers?.length || 0})</h5>
                  <div className="space-y-2">
                    {result.gtmConfig.triggers?.map((trigger, index) => (
                      <div key={index} className="text-sm text-gray-600 p-2 bg-gray-50 rounded">
                        <strong>{trigger.name}</strong> ({trigger.type})
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h5 className="font-medium text-gray-700 mb-2">Tags ({result.gtmConfig.tags?.length || 0})</h5>
                  <div className="space-y-2">
                    {result.gtmConfig.tags?.map((tag, index) => (
                      <div key={index} className="text-sm text-gray-600 p-2 bg-gray-50 rounded">
                        <strong>{tag.name}</strong> ({tag.type})
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h5 className="font-medium text-gray-700 mb-2">Variáveis ({result.gtmConfig.variables?.length || 0})</h5>
                  <div className="space-y-2">
                    {result.gtmConfig.variables?.map((variable, index) => (
                      <div key={index} className="text-sm text-gray-600 p-2 bg-gray-50 rounded">
                        <strong>{variable.name}</strong> ({variable.type})
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'code':
        if (!result.implementationCodes) {
          return (
            <div className="bg-white border border-gray-200 rounded-lg p-6 text-center">
              <InformationCircleIcon className="h-12 w-12 text-blue-500 mx-auto mb-4" />
              <h4 className="font-medium text-gray-900 mb-2">Código não gerado</h4>
              <p className="text-sm text-gray-600">
                Como um GTM já foi detectado no site, o snippet de implementação não foi gerado. 
                O rastreamento deve ser feito usando o contêiner GTM já existente.
              </p>
            </div>
          );
        }
        return (
          <div className="space-y-6">
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h4 className="font-medium text-gray-900 mb-4">Códigos de Implementação</h4>
              
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h5 className="font-medium text-gray-700">Snippet GTM</h5>
                    <button
                      onClick={() => copyToClipboard(result.implementationCodes.gtmSnippet, 'gtm')}
                      className="flex items-center text-sm text-blue-600 hover:text-blue-700 cursor-pointer"
                    >
                      <DocumentDuplicateIcon className="w-4 h-4 mr-1" />
                      {copied === 'gtm' ? 'Copiado!' : 'Copiar'}
                    </button>
                  </div>
                  <pre className="text-xs bg-gray-900 text-gray-100 p-4 rounded overflow-x-auto">
                    {result.implementationCodes.gtmSnippet}
                  </pre>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h5 className="font-medium text-gray-700">DataLayer</h5>
                    <button
                      onClick={() => copyToClipboard(result.implementationCodes.dataLayer, 'dataLayer')}
                      className="flex items-center text-sm text-blue-600 hover:text-blue-700 cursor-pointer"
                    >
                      <DocumentDuplicateIcon className="w-4 h-4 mr-1" />
                      {copied === 'dataLayer' ? 'Copiado!' : 'Copiar'}
                    </button>
                  </div>
                  <pre className="text-xs bg-gray-900 text-gray-100 p-4 rounded overflow-x-auto">
                    {result.implementationCodes.dataLayer}
                  </pre>
                </div>

                <div>
                  <h5 className="font-medium text-gray-700 mb-2">Instruções</h5>
                  <div className="text-sm text-gray-600 p-4 bg-gray-50 rounded">
                    {result.implementationCodes.instructions}
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200">
        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6" aria-label="Tabs">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center cursor-pointer ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="w-4 h-4 mr-2" />
                  {tab.name}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {renderTabContent()}
        </div>
      </div>
    </div>
  );
} 
