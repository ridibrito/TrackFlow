'use client';

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { Project } from "@/lib/supabase/projects";
import { Disclosure, Transition } from "@headlessui/react";
import { CheckCircleIcon, ChevronUpIcon, ServerIcon, GlobeAltIcon } from "@heroicons/react/24/solid";
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

interface ServerSideConfigProps {
  project: Project;
}

// Componente para o estado "Não Configurado"
const NotConfiguredState = ({ 
  onCreate, 
  isCreating, 
  timer 
}: { 
  onCreate: (customDomain?: string) => void; 
  isCreating: boolean; 
  timer: number;
}) => {
  const [showCustomDomain, setShowCustomDomain] = useState(false);
  const [customDomain, setCustomDomain] = useState('');

  const handleCreate = () => {
    onCreate(showCustomDomain ? customDomain : undefined);
  };

  return (
    <div className="text-center">
      <div className="flex items-center justify-center mb-4">
        <ServerIcon className="h-12 w-12 text-purple-600" />
        <div className="ml-3">
          <h3 className="text-lg font-semibold text-gray-800">Container Server-Side</h3>
          <p className="text-sm text-gray-600">Melhore a performance com tags server-side</p>
        </div>
      </div>
      
      <div className="max-w-md mx-auto space-y-4">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-left">
          <h4 className="text-sm font-medium text-blue-800 mb-1">Benefícios do Server-Side:</h4>
          <ul className="text-xs text-blue-700 space-y-1">
            <li>• Melhor performance e velocidade de carregamento</li>
            <li>• Maior precisão no rastreamento</li>
            <li>• Controle total sobre os dados enviados</li>
            <li>• Compatibilidade com bloqueadores de anúncios</li>
          </ul>
        </div>

        <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-left">
          <h4 className="text-sm font-medium text-green-800 mb-1">Gerenciado pela TagMage:</h4>
          <ul className="text-xs text-green-700 space-y-1">
            <li>• Configuração automática e segura</li>
            <li>• Sem necessidade de contas adicionais</li>
            <li>• Suporte técnico incluído</li>
            <li>• Integração perfeita com seu container web</li>
          </ul>
        </div>

        {/* Opção de Domínio Próprio */}
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-3 text-left">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-medium text-purple-800">Domínio Próprio (Opcional)</h4>
            <button
              onClick={() => setShowCustomDomain(!showCustomDomain)}
              className="text-xs text-purple-600 hover:text-purple-700 underline"
            >
              {showCustomDomain ? 'Remover' : 'Configurar'}
            </button>
          </div>
          
          {showCustomDomain && (
            <div className="space-y-2">
              <p className="text-xs text-purple-700">
                Use seu próprio domínio para o container server-side (ex: gtm.seudominio.com)
              </p>
              <div className="flex items-center space-x-2">
                <GlobeAltIcon className="h-4 w-4 text-purple-600" />
                <Input
                  type="text"
                  placeholder="gtm.seudominio.com"
                  value={customDomain}
                  onChange={(e) => setCustomDomain(e.target.value)}
                  className="text-sm"
                />
              </div>
              <p className="text-xs text-purple-600">
                ⚠️ Você precisará configurar o DNS do seu domínio
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="mt-6">
        {isCreating ? (
          <div className="flex items-center justify-center space-x-2">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-600"></div>
            <p className="text-sm text-gray-600">
              Criando container server-side...
              <span className="font-semibold ml-2">({timer}s)</span>
            </p>
          </div>
        ) : (
          <Button
            onClick={handleCreate}
            className="px-6 py-3 text-base font-semibold text-white bg-gradient-to-r from-purple-600 to-indigo-600 rounded-lg hover:shadow-lg hover:shadow-purple-500/40 transition-all duration-300"
          >
            Criar Container Server-Side
          </Button>
        )}
      </div>
    </div>
  );
};

// Componente para o estado "Configurado"
const ConfiguredState = ({ project }: { project: Project }) => {
  const isCustomDomain = project.stape_domain && !project.stape_domain.includes('stape.io');
  
  return (
    <div className="space-y-4">
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <CheckCircleIcon className="h-6 w-6 text-green-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-green-800">Container Server-Side Criado com Sucesso</p>
            <p className="text-base text-gray-900 font-mono tracking-wider mt-1">
              {project.stape_container_id}
            </p>
            {project.stape_domain && (
              <div className="mt-2">
                <p className="text-sm text-gray-600">
                  Domínio: <span className="font-mono">{project.stape_domain}</span>
                </p>
                {isCustomDomain && (
                  <div className="mt-1 flex items-center space-x-1">
                    <GlobeAltIcon className="h-4 w-4 text-purple-600" />
                    <span className="text-xs text-purple-700 font-medium">Domínio Próprio Configurado</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
      
      {isCustomDomain && (
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <h4 className="text-sm font-medium text-purple-800 mb-2">Domínio Próprio Ativo</h4>
          <p className="text-sm text-purple-700 mb-2">
            Seu container server-side está usando o domínio próprio: <strong>{project.stape_domain}</strong>
          </p>
          <div className="text-xs text-purple-600 space-y-1">
            <p>✅ DNS configurado automaticamente</p>
            <p>✅ SSL/HTTPS ativo</p>
            <p>✅ Performance otimizada</p>
          </div>
        </div>
      )}
      
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="text-sm font-medium text-blue-800 mb-2">Próximos Passos:</h4>
        <ol className="text-sm text-blue-700 space-y-1 list-decimal list-inside">
          <li>Configure suas plataformas de marketing (Google Ads, Meta, etc.)</li>
          <li>Adicione eventos de conversão personalizados</li>
          <li>Instale o snippet de código no seu site</li>
          <li>Teste os eventos no painel de monitoramento</li>
        </ol>
      </div>
    </div>
  );
};

export default function ServerSideConfig({ project }: ServerSideConfigProps) {
  const { session } = useAuth();
  const router = useRouter();
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState('');
  const [timer, setTimer] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

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

  const handleCreateContainer = async (customDomain?: string) => {
    setIsCreating(true);
    startTimer();
    setError('');

    try {
      const response = await fetch('/api/stape/create-container', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          projectId: project.id,
          customDomain
        }),
      });

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Falha ao criar container server-side.');
      }

      router.refresh();
      
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsCreating(false);
      stopTimer();
    }
  };

  const handleConfigureTags = async () => {
    try {
      const response = await fetch('/api/stape/configure-tags', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          projectId: project.id
        }),
      });

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Falha ao configurar tags.');
      }

      router.refresh();
      
    } catch (err: any) {
      setError(err.message);
    }
  };

  const isCompleted = !!project.stape_container_id;

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <Disclosure defaultOpen={!isCompleted}>
        {({ open }) => (
          <>
            <Disclosure.Button className="flex w-full items-center justify-between text-left">
              <div className="flex items-center space-x-3">
                <div className={`flex items-center justify-center w-10 h-10 rounded-full ${
                  isCompleted ? 'bg-green-100' : 'bg-gray-100'
                }`}>
                  <ServerIcon className={`h-6 w-6 ${
                    isCompleted ? 'text-green-600' : 'text-gray-600'
                  }`} />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Container Server-Side
                  </h3>
                  <p className="text-sm text-gray-600">
                    {isCompleted ? 'Configurado e ativo' : 'Melhore a performance com tags server-side'}
                  </p>
                </div>
              </div>
              <ChevronUpIcon
                className={`${
                  open ? 'transform rotate-180' : ''
                } w-5 h-5 text-gray-500`}
              />
            </Disclosure.Button>

            <Transition
              enter="transition duration-100 ease-out"
              enterFrom="transform scale-95 opacity-0"
              enterTo="transform scale-100 opacity-100"
              leave="transition duration-75 ease-out"
              leaveFrom="transform scale-100 opacity-100"
              leaveTo="transform scale-95 opacity-0"
            >
              <Disclosure.Panel className="mt-6">
                {error && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm text-red-700">{error}</p>
                  </div>
                )}

                {isCompleted ? (
                  <ConfiguredState project={project} />
                ) : (
                  <NotConfiguredState 
                    onCreate={handleCreateContainer}
                    isCreating={isCreating}
                    timer={timer}
                  />
                )}

                {isCompleted && (
                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <h4 className="text-sm font-medium text-gray-800 mb-3">
                      Configurar Tags Automaticamente
                    </h4>
                    <p className="text-sm text-gray-600 mb-3">
                      Configure automaticamente tags para todas as plataformas conectadas ao projeto.
                    </p>
                    <Button
                      onClick={handleConfigureTags}
                      className="px-4 py-2 text-sm font-medium text-white bg-purple-600 rounded-lg hover:bg-purple-700"
                    >
                      Configurar Tags
                    </Button>
                  </div>
                )}
              </Disclosure.Panel>
            </Transition>
          </>
        )}
      </Disclosure>
    </div>
  );
} 
