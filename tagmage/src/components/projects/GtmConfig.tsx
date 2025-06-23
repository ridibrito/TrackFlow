'use client';

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { Project } from "@/lib/supabase/projects";
import { Disclosure, Transition } from "@headlessui/react";
import { CheckCircleIcon, ChevronUpIcon } from "@heroicons/react/24/solid";
import Image from "next/image";

interface GtmConfigProps {
  project: Project;
}

// Componente para o estado "Não Configurado"
const NotConfiguredState = ({ onCreate, isCreating, timer }: { onCreate: () => void, isCreating: boolean, timer: number }) => (
  <div className="text-center">
    <Image 
      src="/logos/gtm.svg" 
      alt="Google Tag Manager Logo" 
      width={64} 
      height={64} 
      className="mx-auto mb-4"
    />
    <h3 className="text-lg font-semibold text-gray-800">1. Crie seu Contêiner GTM</h3>
    <p className="mt-2 text-sm text-gray-600 max-w-md mx-auto">
      O primeiro passo é criar um contêiner no Google Tag Manager.
      Você precisará autenticar com sua conta Google.
    </p>
    
    <div className="mt-6">
      {isCreating ? (
        <div className="flex items-center justify-center space-x-2">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600"></div>
          <p className="text-sm text-gray-600">
            Criando seu contêiner...
            <span className="font-semibold ml-2">({timer}s)</span>
          </p>
        </div>
      ) : (
        <button
          onClick={onCreate}
          className="px-6 py-3 text-base font-semibold text-white bg-gradient-to-r from-indigo-600 to-blue-600 rounded-lg hover:shadow-lg hover:shadow-indigo-500/40 transition-all duration-300"
        >
          Conectar com Google e Criar Contêiner
        </button>
      )}
    </div>
  </div>
);

// Componente para o estado "Configurado"
const ConfiguredState = ({ project }: { project: Project }) => (
  <div className="space-y-4">
    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
      <div className="flex items-start space-x-3">
        <CheckCircleIcon className="h-6 w-6 text-green-600 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-medium text-green-800">Contêiner GTM Criado com Sucesso</p>
          <p className="text-base text-gray-900 font-mono tracking-wider mt-1">{project.gtm_id}</p>
        </div>
      </div>
    </div>
    <div className="text-center text-sm text-gray-600 pt-2">
      <p>
        Ótimo! Agora vá para a seção <strong>"Configuração de Plataformas"</strong> abaixo para adicionar os IDs e instalar as tags.
      </p>
    </div>
  </div>
);

export default function GtmConfig({ project }: GtmConfigProps) {
  const { session, signInWithGooglePopup } = useAuth();
  const router = useRouter();
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState('');
  const [timer, setTimer] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const popupRef = useRef<Window | null>(null);

  const startTimer = () => {
    setTimer(0);
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setTimer(prev => prev + 1);
    }, 1000);
  };

  const stopTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const handleCreateContainer = async () => {
    setIsCreating(true);
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

      // O popup será gerenciado pelo AuthContext
      // Vamos aguardar a sessão ser atualizada
      
    } catch (err: any) {
      setError(err.message);
      setIsCreating(false);
      stopTimer();
    }
  };

  // Verificar quando a sessão é atualizada após o popup
  useEffect(() => {
    if (isCreating && session?.provider_token) {
      // Sessão atualizada, criar o container
      createContainerAfterAuth();
    }
  }, [session, isCreating]);

  const createContainerAfterAuth = async () => {
    if (!session?.provider_token) return;

    try {
      const response = await fetch('/api/gtm/create-container', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          projectId: project.id,
          providerToken: session.provider_token 
        }),
      });
      
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Falha ao criar o contêiner.');
      
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsCreating(false);
      stopTimer();
    }
  };

  const isCompleted = !!project.gtm_id;

  return (
    <div className="w-full">
      <Disclosure defaultOpen={true}>
        {({ open }) => (
          <div className="border rounded-2xl shadow-sm bg-white">
            <Disclosure.Button className="w-full flex justify-between items-center p-6 md:p-8 text-left">
              <div className="flex items-center space-x-3">
                <h2 className="text-2xl font-bold text-gray-900">1. Configuração GTM</h2>
                {isCompleted && <CheckCircleIcon className="h-6 w-6 text-green-600" />}
              </div>
              <ChevronUpIcon className={`${open ? 'rotate-180' : ''} h-6 w-6 text-gray-500 transition-transform`} />
            </Disclosure.Button>

            <Transition
              show={open}
              enter="transition duration-100 ease-out"
              enterFrom="transform scale-95 opacity-0"
              enterTo="transform scale-100 opacity-100"
              leave="transition duration-75 ease-out"
              leaveFrom="transform scale-100 opacity-100"
              leaveTo="transform scale-95 opacity-0"
            >
              <Disclosure.Panel as="div" className="px-6 md:px-8 pb-8 border-t border-gray-200 pt-6">
                {isCompleted ? (
                  <ConfiguredState project={project} />
                ) : (
                  <NotConfiguredState onCreate={handleCreateContainer} isCreating={isCreating} timer={timer} />
                )}
                {error && (
                  <div className="mt-4 bg-red-50 border-l-4 border-red-400 p-4 rounded-r-lg">
                    <p className="text-sm text-red-700">{error}</p>
                  </div>
                )}
              </Disclosure.Panel>
            </Transition>
          </div>
        )}
      </Disclosure>
    </div>
  );
} 
