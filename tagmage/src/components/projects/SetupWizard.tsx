'use client';

import { useState, useEffect } from 'react';
import { Project } from '@/lib/supabase/projects';
import { CheckIcon } from '@heroicons/react/24/solid';
import { useAuth } from '@/contexts/AuthContext';
import ConnectionsStep from './steps/ConnectionsStep';
import ConfigurationStep from './steps/ConfigurationStep';
import InstallationStep from './steps/InstallationStep';

// Definição dos nossos passos
const steps = [
  { id: '01', name: 'Conexões', description: 'Conecte sua conta Google.' },
  { id: '02', name: 'Configuração', description: 'Crie e configure seus ativos de marketing.' },
  { id: '03', name: 'Instalação', description: 'Instale o script em seu site.' },
];

function classNames(...classes: any[]) {
  return classes.filter(Boolean).join(' ');
}

interface SetupWizardProps {
  project: Project;
}

const SetupWizard = ({ project }: SetupWizardProps) => {
  const { session } = useAuth();
  const [currentStepId, setCurrentStepId] = useState('01'); 

  useEffect(() => {
    // Lógica para determinar o passo atual
    const googleConnected = !!session?.provider_token;
    const gtmConfigured = !!project.gtm_id;

    if (!googleConnected) {
      setCurrentStepId('01'); // Precisa conectar
    } else if (!gtmConfigured) {
      setCurrentStepId('02'); // Conectado, precisa configurar
    } else {
      setCurrentStepId('03'); // Tudo pronto, ir para instalação
    }
  }, [session, project]);

  const currentStepIndex = steps.findIndex(step => step.id === currentStepId);

  const handleNextStep = () => {
    const nextStepIndex = Math.min(currentStepIndex + 1, steps.length - 1);
    setCurrentStepId(steps[nextStepIndex].id);
  };

  const renderStepContent = () => {
    switch (currentStepId) {
      case '01':
        return <ConnectionsStep onConnected={handleNextStep} />;
      case '02':
        return <ConfigurationStep project={project} onConfigurationComplete={handleNextStep} />;
      case '03':
        return <InstallationStep project={project} />;
      default:
        return <div>Passo inicial</div>;
    }
  }

  return (
    <div className="lg:border-t lg:border-b lg:border-gray-200">
      <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8" aria-label="Progress">
        <ol
          role="list"
          className="overflow-hidden rounded-md lg:flex lg:rounded-none lg:border-l lg:border-r lg:border-gray-200"
        >
          {steps.map((step, stepIdx) => (
            <li key={step.id} className="relative overflow-hidden lg:flex-1">
              <div
                className={classNames(
                  stepIdx === 0 ? 'rounded-t-md border-b-0' : '',
                  stepIdx === steps.length - 1 ? 'rounded-b-md border-t-0' : '',
                  'overflow-hidden border border-gray-200 lg:border-0'
                )}
              >
                <a href="#" className="group">
                  <span
                    className="absolute top-0 left-0 h-full w-1 bg-transparent group-hover:bg-gray-200 lg:bottom-0 lg:top-auto lg:h-1 lg:w-full"
                    aria-hidden="true"
                  />
                  <span
                    className={classNames(
                      stepIdx < currentStepIndex ? 'bg-indigo-600' : 'bg-transparent',
                      'absolute top-0 left-0 h-full w-1 lg:bottom-0 lg:top-auto lg:h-1 lg:w-full'
                    )}
                    aria-hidden="true"
                  />
                  <div className="flex items-start px-6 py-5 text-sm font-medium">
                    <span className="flex-shrink-0">
                      {stepIdx < currentStepIndex ? (
                        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-600">
                          <CheckIcon className="h-6 w-6 text-white" aria-hidden="true" />
                        </span>
                      ) : (
                        <span className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-gray-300">
                          <span className="text-gray-500">{step.id}</span>
                        </span>
                      )}
                    </span>
                    <span className="ml-4 mt-0.5 flex min-w-0 flex-col">
                      <span className="text-sm font-medium">{step.name}</span>
                      <span className="text-sm font-medium text-gray-500">{step.description}</span>
                    </span>
                  </div>
                </a>

                {stepIdx !== 0 ? (
                  <>
                    {/* Separator */}
                    <div className="absolute inset-0 top-0 left-0 hidden w-3 lg:block" aria-hidden="true">
                      <svg
                        className="h-full w-full text-gray-300"
                        viewBox="0 0 12 82"
                        fill="none"
                        preserveAspectRatio="none"
                      >
                        <path d="M0.5 0V31L10.5 41L0.5 51V82" stroke="currentcolor" vectorEffect="non-scaling-stroke" />
                      </svg>
                    </div>
                  </>
                ) : null}
              </div>
            </li>
          ))}
        </ol>
      </nav>

        {/* Conteúdo do passo atual será renderizado aqui */}
        <div className="mt-8 p-6 bg-white rounded-lg shadow-sm border">
            {renderStepContent()}
        </div>
    </div>
  );
};

export default SetupWizard; 
