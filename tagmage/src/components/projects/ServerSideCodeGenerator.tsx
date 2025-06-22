'use client';

import { useState } from "react";
import { Project } from "@/lib/supabase/projects";
import { CheckCircleIcon, DocumentDuplicateIcon, CodeBracketIcon, ChevronDownIcon, ChevronRightIcon, ServerIcon } from "@heroicons/react/24/solid";

interface ServerSideCodeGeneratorProps {
  project: Project;
}

export default function ServerSideCodeGenerator({ project }: ServerSideCodeGeneratorProps) {
  const [copiedSection, setCopiedSection] = useState<string | null>(null);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['snippet']));

  if (!project.stape_container_id) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex items-center space-x-2">
          <ServerIcon className="h-5 w-5 text-yellow-600" />
          <p className="text-sm text-yellow-800">
            Configure um container server-side primeiro para gerar o código de implementação.
          </p>
        </div>
      </div>
    );
  }

  const toggleSection = (section: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(section)) {
      newExpanded.delete(section);
    } else {
      newExpanded.add(section);
    }
    setExpandedSections(newExpanded);
  };

  const copyToClipboard = async (text: string, section: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedSection(section);
      setTimeout(() => setCopiedSection(null), 2000);
    } catch (err) {
      console.error('Erro ao copiar para clipboard:', err);
    }
  };

  // Gerar o snippet do container server-side
  const generateServerSideSnippet = () => {
    const domain = project.stape_domain || project.stape_container_id;
    
    return `<!-- Container Server-Side TagMage -->
<script>
(function() {
  var stape = window.stape = window.stape || [];
  stape.push(['init', '${project.stape_container_id}']);
  
  // Carregar o script do container server-side
  var script = document.createElement('script');
  script.async = true;
  script.src = 'https://${domain}/gtm.js';
  var firstScript = document.getElementsByTagName('script')[0];
  firstScript.parentNode.insertBefore(script, firstScript);
})();
</script>`;
  };

  // Gerar código para eventos customizados
  const generateCustomEvents = () => {
    const events = project.conversion_events || [];
    
    if (events.length === 0) {
      return `// Exemplo de como disparar eventos customizados
// stape('event', 'event_name', { parameter1: 'value1' });

// Exemplo de evento de compra
stape('event', 'purchase', {
  transaction_id: 'T_12345',
  value: 99.99,
  currency: 'BRL',
  items: [
    {
      item_id: 'SKU_12345',
      item_name: 'Produto Exemplo',
      price: 99.99,
      quantity: 1
    }
  ]
});

// Exemplo de evento de lead
stape('event', 'lead', {
  value: 0,
  currency: 'BRL',
  content_name: 'Formulário de Contato'
});`;
    }

    return events.map(event => {
      const eventName = event.name || event.id;
      const parameters = event.parameters || {};
      
      return `// ${event.description || `Evento: ${eventName}`}
stape('event', '${eventName}', ${JSON.stringify(parameters, null, 2)});`;
    }).join('\n\n');
  };

  // Gerar código para data layer
  const generateDataLayer = () => {
    return `// Configuração do Data Layer para Container Server-Side
window.dataLayer = window.dataLayer || [];

// Exemplo de push de dados
dataLayer.push({
  event: 'page_view',
  page_title: document.title,
  page_location: window.location.href,
  user_agent: navigator.userAgent
});

// Exemplo de evento de conversão
dataLayer.push({
  event: 'purchase',
  ecommerce: {
    transaction_id: 'T_12345',
    value: 99.99,
    currency: 'BRL',
    items: [
      {
        item_id: 'SKU_12345',
        item_name: 'Produto Exemplo',
        price: 99.99,
        quantity: 1
      }
    ]
  }
});`;
  };

  const sections = [
    {
      id: 'snippet',
      title: 'Snippet de Implementação',
      description: 'Cole este código no <head> do seu site',
      code: generateServerSideSnippet(),
      language: 'html'
    },
    {
      id: 'events',
      title: 'Eventos Customizados',
      description: 'Use estas funções para disparar eventos de conversão',
      code: generateCustomEvents(),
      language: 'javascript'
    },
    {
      id: 'datalayer',
      title: 'Data Layer',
      description: 'Configure o data layer para enviar dados estruturados',
      code: generateDataLayer(),
      language: 'javascript'
    }
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2 mb-4">
        <ServerIcon className="h-6 w-6 text-purple-600" />
        <h3 className="text-lg font-semibold text-gray-900">Código de Implementação Server-Side</h3>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="text-sm font-medium text-blue-800 mb-2">Instruções de Instalação:</h4>
        <ol className="text-sm text-blue-700 space-y-1 list-decimal list-inside">
          <li>Cole o snippet no <code className="bg-blue-100 px-1 rounded">&lt;head&gt;</code> do seu site</li>
          <li>Use as funções de eventos para disparar conversões</li>
          <li>Configure o data layer para dados estruturados</li>
          <li>Teste os eventos no painel de monitoramento</li>
        </ol>
      </div>

      {sections.map((section) => (
        <div key={section.id} className="border border-gray-200 rounded-lg overflow-hidden">
          <button
            onClick={() => toggleSection(section.id)}
            className="w-full px-4 py-3 bg-gray-50 hover:bg-gray-100 flex items-center justify-between text-left transition-colors"
          >
            <div className="flex items-center space-x-3">
              <CodeBracketIcon className="h-5 w-5 text-gray-600" />
              <div>
                <h4 className="font-medium text-gray-900">{section.title}</h4>
                <p className="text-sm text-gray-600">{section.description}</p>
              </div>
            </div>
            {expandedSections.has(section.id) ? (
              <ChevronDownIcon className="h-5 w-5 text-gray-500" />
            ) : (
              <ChevronRightIcon className="h-5 w-5 text-gray-500" />
            )}
          </button>

          {expandedSections.has(section.id) && (
            <div className="p-4 bg-gray-900">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-gray-400">{section.language}</span>
                <button
                  onClick={() => copyToClipboard(section.code, section.id)}
                  className="flex items-center space-x-2 px-3 py-1 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded text-sm transition-colors"
                >
                  {copiedSection === section.id ? (
                    <>
                      <CheckCircleIcon className="h-4 w-4 text-green-400" />
                      <span>Copiado!</span>
                    </>
                  ) : (
                    <>
                      <DocumentDuplicateIcon className="h-4 w-4" />
                      <span>Copiar</span>
                    </>
                  )}
                </button>
              </div>
              <pre className="text-sm text-gray-300 overflow-x-auto">
                <code>{section.code}</code>
              </pre>
            </div>
          )}
        </div>
      ))}

      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <h4 className="text-sm font-medium text-green-800 mb-2">✅ Container Configurado</h4>
        <p className="text-sm text-green-700">
          Seu container server-side está ativo e pronto para receber eventos. 
          Acesse o painel de monitoramento para acompanhar os dados em tempo real.
        </p>
        <a
          href="https://app.stape.io"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center mt-2 text-sm text-green-600 hover:text-green-700 underline"
        >
          Abrir Painel de Monitoramento →
        </a>
      </div>
    </div>
  );
} 