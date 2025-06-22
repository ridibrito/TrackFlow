'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Project } from '@/lib/supabase/projects';
import { useAuth } from '@/contexts/AuthContext';
import { ChatBubbleLeftRightIcon, PaperAirplaneIcon } from '@heroicons/react/24/outline';

interface Message {
  id: string;
  type: 'ai' | 'user';
  content: string;
  timestamp: Date;
  render?: () => React.ReactNode;
  actions?: Action[];
}

interface Action {
  id: string;
  label: string;
  action: () => void;
  variant?: 'primary' | 'secondary';
}

interface AIAgentProps {
  project: Project;
  onComplete: () => void;
}

const AIAgent = ({ project, onComplete }: AIAgentProps) => {
  const { session, signInWithGoogle, signOut } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [isWaitingForAuth, setIsWaitingForAuth] = useState<string | null>(null);
  const conversationStarted = useRef(false);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Previne que a conversa inicie duas vezes no Strict Mode do React
    if (conversationStarted.current) {
      return;
    }
    conversationStarted.current = true;
    startConversation();
  }, []);

  useEffect(() => {
    // Listener para o callback do popup
    const handleAuthMessage = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) {
        return;
      }
      if (event.data.type === 'auth-success') {
        // O AuthProvider do Supabase irá detectar a mudança e atualizar a sessão.
        // O useEffect abaixo, que depende da `session`, cuidará do próximo passo.
        // Apenas para feedback visual imediato:
        addMessage({ type: 'ai', content: '✅ Conta Google conectada com sucesso! Verificando seus contêineres...' });
        // O ideal é que o `AuthProvider` atualize a sessão e o `useEffect` abaixo dispare.
      } else if (event.data.type === 'auth-error') {
        addMessage({ type: 'ai', content: `❌ Ocorreu um erro na autenticação: ${event.data.error}` });
      }
    };
    
    window.addEventListener('message', handleAuthMessage);

    return () => {
      window.removeEventListener('message', handleAuthMessage);
    };
  }, []);

  useEffect(() => {
    if (!project) return;
    
    const checkFlag = `initialCheckDone_${project.id}`;
    if (sessionStorage.getItem(checkFlag)) {
      return;
    }

    const initialFlow = async () => {
      sessionStorage.setItem(checkFlag, 'true'); 
      if (session) {
        await checkForExistingGTM();
      } else {
        await simulateTyping(
          `Olá! Sou o assistente IA do Tag Mage. Vou te ajudar a configurar o rastreamento para o projeto "${project.name}".\n\nPrimeiro, vamos conectar sua conta Google.`,
          [{ id: 'connect_google', label: 'Conectar com Google', action: handleConnectGoogle, variant: 'primary' }]
        );
      }
    };
    
    initialFlow();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [project, session]);

  const addMessage = (newMessage: Omit<Message, 'id' | 'timestamp'>) => {
    setMessages(prevMessages => [...prevMessages, {
      ...newMessage,
      id: `${Date.now()}-${Math.random()}`,
      timestamp: new Date()
    }]);
  };

  const simulateTyping = async (content: string, actions?: Action[]) => {
    setIsTyping(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    addMessage({ type: 'ai', content, actions });
    setIsTyping(false);
  };

  const startConversation = async () => {
    await simulateTyping(
      `Olá! Sou o assistente IA do Tag Mage. Vou te ajudar a configurar o rastreamento para o projeto "${project.name}".\n\nPrimeiro, vamos conectar sua conta Google. Isso me permitirá criar e gerenciar recursos no Google Tag Manager e Google Ads para você.`,
      [
        {
          id: 'connect_google_initial',
          label: 'Conectar com Google',
          action: () => connectGoogle('initial_flow'),
          variant: 'primary'
        }
      ]
    );
  };
  
  const connectGoogle = async (flow: 'initial_flow' | 'create_new') => {
    addMessage({ type: 'user', content: 'Conectar com Google' });

    if (session?.provider_token) {
        await simulateTyping('Ótimo! Sua conta Google já está conectada. Vamos prosseguir.');
        if(flow === 'create_new') {
            await createGTMContainer();
        } else {
            await checkForExistingGTM();
        }
        return;
    }
    
    await simulateTyping('Ok, vou te redirecionar para a tela de login do Google. Por favor, conceda as permissões solicitadas para que eu possa continuar.');
    setIsWaitingForAuth('list_gtm'); 
    await initiateGoogleAuth();
  };
  
  const initiateGoogleAuth = async () => {
    await signInWithGoogle([
      'https://www.googleapis.com/auth/tagmanager.manage.accounts',
      'https://www.googleapis.com/auth/tagmanager.edit.containers',
      'https://www.googleapis.com/auth/tagmanager.manage.users',
      'https://www.googleapis.com/auth/adwords'
    ], window.location.pathname);
  };
  
  // Roda após o retorno do OAuth
  useEffect(() => {
    if(session?.provider_token && isWaitingForAuth === 'list_gtm') {
        setIsWaitingForAuth(null);
        simulateTyping('Excelente, sua conta foi conectada com sucesso! Agora, deixe-me verificar seus contêineres do GTM...')
          .then(checkForExistingGTM);
    }
  }, [session, isWaitingForAuth]);

  const checkForExistingGTM = async () => {
    if (!session?.provider_token || !session?.access_token) {
        await simulateTyping("Sua sessão parece ter expirado. Por favor, conecte-se com o Google novamente.");
        // Opcionalmente, mostrar o botão de conectar de novo
        return;
    }

    await simulateTyping("Buscando seus contêineres do Google Tag Manager... um momento.");

    try {
        const response = await fetch('/api/gtm/list-containers', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${session.access_token}`
            },
            body: JSON.stringify({ providerToken: session.provider_token })
        });

        const data = await response.json();

        if (!response.ok) {
            // Tratar diferentes tipos de erro de autenticação
            if (data.code === 'TOKEN_EXPIRED' || data.code === 'INVALID_CREDENTIALS' || data.requiresReauth) {
                const revocationUrl = "https://myaccount.google.com/permissions";
                
                await simulateTyping(
                  `🔐 **Autenticação necessária**\n\nSeu token do Google expirou ou é inválido. Para resolver isso:\n\n1. **[Clique aqui para acessar a segurança da sua Conta Google](${revocationUrl})** (abrirá em nova aba).\n2. Encontre **Tag Mage** na lista de apps e clique em **"Remover Acesso"**.\n3. Volte para esta página e clique no botão 'Conectar com Google' novamente.`,
                  [
                    { id: 'connect_google_after_revoke', label: 'Conectar com Google', action: handleConnectGoogle, variant: 'primary' },
                  ]
                );
                return;
            }
            
            if (data.code === 'INSUFFICIENT_PERMISSIONS') {
                await simulateTyping(
                  `🚫 **Permissões insuficientes**\n\nVocê não tem permissão para acessar o Google Tag Manager. Verifique se:\n\n1. Você tem acesso ao Google Tag Manager\n2. Sua conta tem as permissões necessárias\n3. O projeto no Google Cloud Console está configurado corretamente`,
                  [
                    { id: 'connect_google_retry', label: 'Tentar Novamente', action: handleConnectGoogle, variant: 'primary' },
                  ]
                );
                return;
            }
            
            throw new Error(data.error || "Falha ao buscar contêineres.");
        }

        const containers = data.containers || [];
        
        if (containers.length === 0) {
            await simulateTyping(
              "✅ Conectado com sucesso! Mas não encontrei nenhum contêiner GTM na sua conta.\n\nVou criar um novo contêiner para você. Isso é normal se você ainda não usa o Google Tag Manager.",
              [
                { id: 'create_new_container', label: 'Criar Novo Contêiner', action: createGTMContainer, variant: 'primary' },
              ]
            );
        } else {
            await simulateTyping(
              `✅ Encontrei ${containers.length} contêiner(s) GTM na sua conta!\n\n${containers.map((c: { name: string; containerId: string }) => `• ${c.name} (${c.containerId})`).join('\n')}\n\nQual você gostaria de usar para este projeto?`,
              [
                ...containers.map((container: { name: string; containerId: string }) => ({
                  id: `use_container_${container.containerId}`,
                  label: `Usar ${container.name}`,
                  action: () => useExistingContainer(container),
                  variant: 'primary' as const
                })),
                { id: 'create_new_container', label: 'Criar Novo Contêiner', action: createGTMContainer, variant: 'secondary' as const },
              ]
            );
        }
    } catch {
      console.error('Erro ao verificar GTM');
      await simulateTyping(
        `❌ Erro inesperado.\n\nVamos tentar novamente ou você pode configurar manualmente.`,
        [
          { id: 'retry_gtm_check', label: 'Tentar Novamente', action: checkForExistingGTM, variant: 'primary' },
          { id: 'manual_setup', label: 'Configuração Manual', action: () => finishSetup(), variant: 'secondary' },
        ]
      );
    }
  };

  const useExistingContainer = async (container: { name: string; containerId: string }) => {
    await simulateTyping(
      `✅ Perfeito! Vou usar o contêiner "${container.name}" (${container.containerId}) para este projeto.\n\nAgora vou configurar as tags e eventos de conversão.`,
      []
    );
    
    // Aqui você pode adicionar lógica para associar o container existente ao projeto
    // Por exemplo, atualizar o projeto no banco de dados com o container ID
    
    await simulateTyping(
      "Agora vou te ajudar a configurar as plataformas de marketing. Quais plataformas você usa para anúncios?",
      [
        {
          id: 'google_ads',
          label: 'Google Ads',
          action: () => configureGoogleAds(),
          variant: 'primary'
        },
        {
          id: 'meta_ads',
          label: 'Meta Ads',
          action: () => configureMetaAds(),
          variant: 'primary'
        },
        {
          id: 'tiktok_ads',
          label: 'TikTok Ads',
          action: () => configureTikTokAds(),
          variant: 'primary'
        },
        {
          id: 'skip_platforms',
          label: 'Pular por enquanto',
          action: () => finishSetup(),
          variant: 'secondary'
        }
      ]
    );
  };

  const createGTMContainer = async () => {
    addMessage({type: 'user', content: 'Criar um Novo Contêiner'});
    
    if (!session?.provider_token) {
      await simulateTyping('Preciso que você conecte sua conta Google primeiro. Clique em "Conectar com Google" acima.');
      return;
    }

    await simulateTyping('Criando contêiner GTM... Isso pode levar alguns segundos.');
    
    try {
      const response = await fetch('/api/gtm/create-container', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          projectName: project.name,
          projectUrl: project.url,
          providerToken: session.provider_token,
        }),
      });

      const result = await response.json();
      
      if (response.ok) {
        await simulateTyping(
          `✅ Contêiner GTM criado com sucesso!\n\nID: ${result.containerId}\n\nAgora vou te ajudar a configurar as plataformas de marketing. Quais plataformas você usa para anúncios?`,
          [
            {
              id: 'google_ads',
              label: 'Google Ads',
              action: () => configureGoogleAds(),
              variant: 'primary'
            },
            {
              id: 'meta_ads',
              label: 'Meta Ads',
              action: () => configureMetaAds(),
              variant: 'primary'
            },
            {
              id: 'tiktok_ads',
              label: 'TikTok Ads',
              action: () => configureTikTokAds(),
              variant: 'primary'
            },
            {
              id: 'skip_platforms',
              label: 'Pular por enquanto',
              action: () => finishSetup(),
              variant: 'secondary'
            }
          ]
        );
      } else {
        await simulateTyping(`❌ Erro ao criar contêiner: ${result.error}\n\nVamos tentar novamente ou você pode inserir manualmente o ID do seu contêiner GTM.`);
      }
    } catch {
      await simulateTyping('❌ Erro inesperado. Vamos tentar novamente.');
    }
  };

  const configureGoogleAds = async () => {
    addMessage({ type: 'user', content: 'Google Ads' });
    await simulateTyping(
      'Ótimo! Para o Google Ads, preciso do seu ID de Cliente (formato: 000-000-0000).\n\nVocê pode encontrá-lo no canto superior direito do seu painel do Google Ads.',
      [
        {
          id: 'help_google_ads',
          label: 'Ajuda para encontrar',
          action: () => showGoogleAdsHelp(),
          variant: 'secondary'
        }
      ]
    );
  };

  const configureMetaAds = async () => {
    addMessage({ type: 'user', content: 'Meta Ads' });
    await simulateTyping(
      'Para o Meta Ads, preciso do ID do seu Pixel (formato: 0000000000000000).\n\nVocê pode encontrá-lo no Gerenciador de Eventos do Facebook.',
      [
        {
          id: 'help_meta',
          label: 'Ajuda para encontrar',
          action: () => showMetaHelp(),
          variant: 'secondary'
        }
      ]
    );
  };

  const configureTikTokAds = async () => {
    addMessage({ type: 'user', content: 'TikTok Ads' });
    await simulateTyping(
      'Para o TikTok Ads, preciso do ID do seu Pixel (formato: C00000000000000000).\n\nVocê pode encontrá-lo no TikTok Events Manager.',
      [
        {
          id: 'help_tiktok',
          label: 'Ajuda para encontrar',
          action: () => showTikTokHelp(),
          variant: 'secondary'
        }
      ]
    );
  };

  const showGoogleAdsHelp = async () => {
    addMessage({ type: 'user', content: 'Ajuda para encontrar' });
    await simulateTyping(
      `Para encontrar o ID de Cliente do Google Ads:\n\n1. Acesse ads.google.com\n2. Faça login na sua conta\n3. No canto superior direito, clique no ícone da conta\n4. O ID de Cliente aparece no formato 000-000-0000\n\nQual é o seu ID de Cliente?`
    );
  };

  const showMetaHelp = async () => {
    addMessage({ type: 'user', content: 'Ajuda para encontrar' });
    await simulateTyping(
      `Para encontrar o ID do Pixel do Meta:\n\n1. Acesse business.facebook.com\n2. Vá em "Eventos" > "Gerenciador de Eventos"\n3. Selecione seu Pixel\n4. O ID aparece no formato 0000000000000000\n\nQual é o ID do seu Pixel?`
    );
  };

  const showTikTokHelp = async () => {
    addMessage({ type: 'user', content: 'Ajuda para encontrar' });
    await simulateTyping(
      `Para encontrar o ID do Pixel do TikTok:\n\n1. Acesse ads.tiktok.com\n2. Vá em "Assets" > "Events"\n3. Selecione seu Pixel\n4. O ID aparece no formato C00000000000000000\n\nQual é o ID do seu Pixel?`
    );
  };

  const finishSetup = async () => {
    addMessage({ type: 'user', content: 'Pular por enquanto' });
    await simulateTyping(
      'Perfeito! Sua configuração básica está pronta. Agora vou gerar o script que você precisa instalar no seu site.',
      [
        {
          id: 'show_script',
          label: 'Mostrar Script',
          action: () => showInstallationScript(),
          variant: 'primary'
        }
      ]
    );
  };

  const showInstallationScript = async () => {
    addMessage({ type: 'user', content: 'Mostrar Script' });
    await simulateTyping(
      `Configuração concluída!\n\nAgora você precisa instalar o script no seu site. Copie e cole o código abaixo na seção <head> de todas as páginas:\n\n\`\`\`html\n<script async src="https://www.googletagmanager.com/gtag/js?id=GTM-XXXXXXX"></script>\n<script>\n  window.dataLayer = window.dataLayer || [];\n  function gtag(){dataLayer.push(arguments);}\n  gtag('js', new Date());\n  gtag('config', 'GTM-XXXXXXX');\n</script>\`\`\`\n\nApós instalar, suas tags começarão a funcionar automaticamente!`,
      [
        {
          id: 'complete',
          label: 'Concluir',
          action: () => onComplete(),
          variant: 'primary'
        }
      ]
    );
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isTyping) return;

    const userMessage = inputValue;
    setInputValue('');
    addMessage({ type: 'user', content: userMessage });

    // Simular resposta da IA baseada na mensagem do usuário
    await simulateTyping('Entendi! Vou processar sua resposta e continuar com a configuração...');
  };

  const handleConnectGoogle = async () => {
    addMessage({ type: 'user', content: 'Conectar com Google' });
    
    localStorage.setItem('auth_redirect_path', window.location.pathname);

    // Lista final e completa de escopos para garantir todas as permissões
    await signInWithGoogle([
      'https://www.googleapis.com/auth/tagmanager.manage.accounts',
      'https://www.googleapis.com/auth/tagmanager.edit.containers',
      'https://www.googleapis.com/auth/tagmanager.publish',
      'https://www.googleapis.com/auth/tagmanager.readonly',
      'https://www.googleapis.com/auth/adwords'
    ]);
  };

  return (
    <div className="flex flex-col h-[40rem] bg-white rounded-lg border">
      {/* Header */}
      <div className="p-4 border-b bg-gray-50">
        <h3 className="text-lg font-semibold text-gray-900">Assistente IA - Tag Mage</h3>
        <p className="text-sm text-gray-600">Configurando rastreamento para {project.name}</p>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                message.type === 'user'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-900'
              }`}
            >
              <div className="whitespace-pre-wrap">{message.content}</div>
              
              {message.actions && (
                <div className="mt-3 space-y-2">
                  {message.actions.map((action) => (
                    <button
                      key={action.id}
                      onClick={action.action}
                      className={`w-full px-3 py-2 text-sm font-medium rounded-md ${
                        action.variant === 'primary'
                          ? 'bg-blue-600 text-white hover:bg-blue-700'
                          : 'bg-gray-200 text-gray-900 hover:bg-gray-300'
                      } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
                    >
                      {action.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
        
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-gray-100 text-gray-900 px-4 py-2 rounded-lg">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t">
        <div className="flex space-x-2">
          <input
            type="text"
            value={inputValue}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setInputValue(e.target.value)}
            onKeyPress={(e: React.KeyboardEvent<HTMLInputElement>) => e.key === 'Enter' && handleSendMessage()}
            placeholder="Digite sua resposta..."
            disabled={isTyping}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 placeholder-gray-500 text-gray-900"
          />
          <button
            onClick={handleSendMessage}
            disabled={!inputValue.trim() || isTyping}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Enviar
          </button>
        </div>
      </div>
    </div>
  );
};

export default AIAgent; 