'use client';

import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { 
  CheckCircleIcon, 
  ExclamationTriangleIcon,
  ArrowRightIcon,
  DocumentTextIcon,
  CodeBracketIcon,
  CogIcon,
  CheckIcon,
  InformationCircleIcon,
  Squares2X2Icon,
} from '@heroicons/react/24/outline';
import ProjectResultCard from './ProjectResultCard';
import PlatformSelector from './PlatformSelector';

interface WizardStep {
  id: number;
  title: string;
  description: string;
  status: 'pending' | 'loading' | 'completed' | 'error';
  icon: React.ComponentType<any>;
}

interface ProjectData {
  projectName: string;
  url: string;
}

export default function AutoProjectWizard() {
  const { user, session } = useAuth();
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [projectData, setProjectData] = useState<ProjectData>({
    projectName: '',
    url: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [gtmChoice, setGtmChoice] = useState<'create' | 'use_existing' | null>(null);
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);

  const steps: WizardStep[] = [
    {
      id: 1,
      title: 'Informações',
      description: 'Digite o nome e URL',
      status: currentStep === 1 ? 'loading' : currentStep > 1 ? 'completed' : 'pending',
      icon: DocumentTextIcon
    },
    {
      id: 2,
      title: 'Plataformas',
      description: 'Selecione as plataformas',
      status: currentStep === 2 ? 'loading' : currentStep > 2 ? 'completed' : 'pending',
      icon: Squares2X2Icon
    },
    {
      id: 3,
      title: 'Análise do Site',
      description: 'IA analisando o site',
      status: currentStep === 3 ? 'loading' : currentStep > 3 ? 'completed' : 'pending',
      icon: CogIcon
    },
    {
      id: 4,
      title: analysisResult?.hasExistingGTM ? 'Decisão GTM' : 'Geração do GTM',
      description: analysisResult?.hasExistingGTM ? 'Escolha sua opção' : 'Criando configuração',
      status: currentStep === 4 ? 'loading' : currentStep > 4 ? 'completed' : 'pending',
      icon: analysisResult?.hasExistingGTM ? InformationCircleIcon : CodeBracketIcon
    },
    {
      id: 5,
      title: 'Projeto Criado!',
      description: 'Seu projeto está pronto',
      status: currentStep === 5 ? 'completed' : 'pending',
      icon: CheckCircleIcon
    }
  ];
  
  const handleUrlChange = (value: string) => {
    setProjectData(prev => ({ ...prev, url: value }));
  };

  const handleUrlBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    let url = e.target.value.trim();
    if (url && !/^(https?):\/\//i.test(url)) {
      url = `https://${url}`;
      setProjectData(prev => ({ ...prev, url }));
    }
  };

  const handlePlatformToggle = (platformId: string) => {
    setSelectedPlatforms(prev => 
      prev.includes(platformId) 
        ? prev.filter(id => id !== platformId) 
        : [...prev, platformId]
    );
  };

  const handleSubmit = async () => {
    if (!projectData.projectName.trim() || !projectData.url.trim()) {
      setError('Por favor, preencha todos os campos');
      return;
    }

    if (!user || !session) {
      setError('Usuário não autenticado');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      setCurrentStep(3);
      await new Promise(resolve => setTimeout(resolve, 1500));

      const response = await fetch('/api/auto-create-project', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          projectName: projectData.projectName,
          url: projectData.url,
          userId: user.id,
          selected_platforms: selectedPlatforms,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Erro ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      if (data.status === 'success') {
        setAnalysisResult(data);
        
        // Se há GTM existente, vai para etapa de decisão
        if (data.hasExistingGTM) {
          setCurrentStep(4);
        } else {
          // Se não há GTM, continua para criação
          setCurrentStep(4);
          await new Promise(resolve => setTimeout(resolve, 1500));
          setResult(data);
          setCurrentStep(5);
        }
      } else {
        throw new Error(data.error || 'Erro ao criar projeto');
      }

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
      setCurrentStep(1); 
    } finally {
      setIsLoading(false);
    }
  };

  const handleGtmChoice = async (choice: 'create' | 'use_existing') => {
    if (!session || !user) {
      setError('Usuário não autenticado');
      return;
    }

    setGtmChoice(choice);
    setIsLoading(true);

    try {
      setCurrentStep(4);
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Se escolheu usar existente, o projeto já foi criado
      // Se escolheu criar novo, precisamos fazer uma nova chamada
      if (choice === 'create') {
        // Fazer nova chamada para criar GTM
        const response = await fetch('/api/auto-create-project', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({
            projectName: projectData.projectName,
            url: projectData.url,
            userId: user.id,
            forceCreateGTM: true, // Nova flag para forçar criação
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || `Erro ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();
        setResult(data);
      } else {
        // Usar o resultado da análise original
        setResult(analysisResult);
      }

      setCurrentStep(5);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      setIsLoading(false);
    }
  };

  const getStepIcon = (step: WizardStep) => {
    const Icon = step.icon;
    
    // Define status com base no currentStep para os ícones
    const isCompleted = step.id < currentStep;
    const isLoadingStep = step.id === currentStep;

    if (isCompleted) {
      return <CheckIcon className="w-5 h-5 text-white" />;
    }
    if (isLoadingStep && (currentStep === 3 || currentStep === 4)) {
      return <div className="w-5 h-5 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />;
    }
    if (isLoadingStep) {
       return <div className="w-5 h-5 animate-pulse bg-blue-200 rounded-full" />;
    }
    return <Icon className="w-6 h-6 text-gray-400" />;
  };

  const renderStepContent = () => {
    const activeStep = steps.find(s => s.id === currentStep);
    
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6 mt-8">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Nome do Projeto</label>
              <input
                type="text"
                value={projectData.projectName}
                onChange={(e) => setProjectData(prev => ({ ...prev, projectName: e.target.value }))}
                placeholder="Ex: Meu E-commerce"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900"
                disabled={isLoading}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">URL do Site</label>
              <input
                type="url"
                value={projectData.url}
                onChange={(e) => handleUrlChange(e.target.value)}
                onBlur={handleUrlBlur}
                placeholder="www.seusite.com.br"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900"
                disabled={isLoading}
              />
            </div>
            {error && <div className="bg-red-50 p-4 rounded-lg"><p className="text-red-600 text-sm">{error}</p></div>}
            <button
              onClick={() => setCurrentStep(2)}
              disabled={!projectData.projectName || !projectData.url}
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center"
            >
              Próximo
            </button>
          </div>
        );
      case 2:
        return (
          <div className="space-y-6 mt-8">
            <h3 className="text-xl font-semibold text-gray-800">Quais plataformas de marketing e anúncios este cliente usa?</h3>
            <p className="text-sm text-gray-600">Selecione todas que se aplicam. O Tag Mage usará isso para personalizar a configuração.</p>
            <PlatformSelector
              selectedPlatforms={selectedPlatforms}
              onPlatformToggle={handlePlatformToggle}
            />
            <div className="flex justify-end pt-4">
              <button
                onClick={handleSubmit}
                disabled={isLoading || selectedPlatforms.length === 0}
                className="bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center"
              >
                {isLoading ? 'Analisando...' : 'Analisar Site e Criar Projeto'}
                <ArrowRightIcon className="w-5 h-5 ml-2" />
              </button>
            </div>
          </div>
        );
      case 3:
        return (
          <div className="text-center py-12 px-6">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto mb-6" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">{activeStep?.title}</h2>
            <p className="text-gray-600 max-w-sm mx-auto">{activeStep?.description}. Isso pode levar um momento...</p>
          </div>
        );
      case 4:
        // Se há GTM existente, mostrar tela de decisão
        if (analysisResult?.hasExistingGTM) {
          return (
            <div className="space-y-6 mt-8">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                <div className="flex items-start">
                  <InformationCircleIcon className="w-6 h-6 text-blue-600 mt-0.5 mr-3" />
                  <div>
                    <h3 className="text-lg font-semibold text-blue-900 mb-2">Google Tag Manager Detectado!</h3>
                    <p className="text-blue-800 mb-4">
                      Encontramos um Google Tag Manager já instalado no seu site. O que você gostaria de fazer?
                    </p>
                    <div className="bg-white rounded-lg p-4 border border-blue-200">
                      <h4 className="font-medium text-gray-900 mb-2">Tags encontradas:</h4>
                      <div className="flex flex-wrap gap-2">
                        {analysisResult.existingTags?.map((tag: string, index: number) => (
                          <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button
                  onClick={() => handleGtmChoice('use_existing')}
                  disabled={isLoading}
                  className="p-6 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors text-left"
                >
                  <h4 className="font-semibold text-gray-900 mb-2">Usar GTM Existente</h4>
                  <p className="text-sm text-gray-600">
                    Vou configurar tags adicionais no seu contêiner GTM atual. Ideal se você já tem uma configuração funcionando.
                  </p>
                </button>

                <button
                  onClick={() => handleGtmChoice('create')}
                  disabled={isLoading}
                  className="p-6 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors text-left"
                >
                  <h4 className="font-semibold text-gray-900 mb-2">Criar Novo GTM</h4>
                  <p className="text-sm text-gray-600">
                    Vou criar um novo contêiner GTM do zero. Ideal se você quer uma configuração limpa e otimizada.
                  </p>
                </button>
              </div>

              {isLoading && (
                <div className="text-center py-4">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
                  <p className="text-gray-600 mt-2">Processando sua escolha...</p>
                </div>
              )}
            </div>
          );
        } else {
          // Se não há GTM, mostrar loading normal
          return (
            <div className="text-center py-12 px-6">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto mb-6" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">{activeStep?.title}</h2>
              <p className="text-gray-600 max-w-sm mx-auto">{activeStep?.description}. Isso pode levar um momento...</p>
            </div>
          );
        }
      default:
        return null;
    }
  };

  return (
    <div className={currentStep === 5 ? "w-full" : "max-w-2xl mx-auto"}>
      {currentStep === 5 ? (
        <ProjectResultCard
          result={result}
          onViewProject={() => router.push(`/projects/${result.project.id}`)}
          onViewAllProjects={() => router.push('/projects')}
        />
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
          {/* Stepper */}
          <div className="flex items-start justify-between mb-8">
            {steps.map((step, index) => {
              const isCompleted = step.id < currentStep;
              const isActive = step.id === currentStep;
              
              if (currentStep > 1 && !isActive && !isCompleted) return null;

              return (
                <React.Fragment key={step.id}>
                  <div className="flex items-center text-center flex-col w-24">
                    <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${isCompleted ? 'bg-green-500 border-green-500' : isActive ? 'border-blue-500' : 'border-gray-300'}`}>
                      {getStepIcon(step)}
                    </div>
                    <p className={`mt-2 text-xs font-medium ${isActive ? 'text-blue-600' : 'text-gray-500'}`}>{step.title}</p>
                  </div>
                  {index < steps.length - 1 && (currentStep === 1 || isActive) && (
                    <div className={`flex-1 h-0.5 mt-5 ${isCompleted || isActive ? 'bg-blue-500' : 'bg-gray-200'}`}></div>
                  )}
                </React.Fragment>
              );
            })}
          </div>
          {currentStep === 1 && (
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900">Criação Automática de Projeto</h2>
              <p className="mt-2 text-gray-600">Nossa IA analisará seu site para criar um projeto completo.</p>
            </div>
          )}
          {renderStepContent()}
        </div>
      )}
    </div>
  );
} 