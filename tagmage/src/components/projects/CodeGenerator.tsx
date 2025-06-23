'use client';

import { useState } from "react";
import { Project, ConversionEvent } from "@/lib/supabase/projects";
import { CheckCircleIcon, DocumentDuplicateIcon, CodeBracketIcon, ChevronDownIcon, ChevronRightIcon } from "@heroicons/react/24/solid";

interface CodeGeneratorProps {
  project: Project;
}

const CodeSnippet = ({ title, code, language = 'javascript' }: { title: string; code: string, language?: string }) => {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Erro ao copiar código:', err);
    }
  };

  return (
    <div className="bg-gray-800 rounded-lg overflow-hidden my-4">
        <div className="flex justify-between items-center px-4 py-2 bg-gray-700">
            <p className="text-sm font-semibold text-gray-300">{title}</p>
            <button
                onClick={copyToClipboard}
                className="flex items-center space-x-2 px-3 py-1 text-xs font-medium text-white bg-gray-600 hover:bg-gray-500 rounded cursor-pointer"
            >
                {copied ? <CheckCircleIcon className="h-4 w-4 text-green-400" /> : <DocumentDuplicateIcon className="h-4 w-4" />}
                <span>{copied ? 'Copiado!' : 'Copiar'}</span>
            </button>
        </div>
        <pre className="p-4 text-sm overflow-x-auto">
            <code className={`language-${language} text-white`}>
                {code}
            </code>
        </pre>
    </div>
  );
};


export default function CodeGenerator({ project }: CodeGeneratorProps) {
  const [openSection, setOpenSection] = useState<string>('gtm');
  
  // Função para garantir que os eventos sejam sempre um array
  const getEventsArray = (): ConversionEvent[] => {
    const eventsData = project.conversion_events;
    if (!eventsData) return [];

    if (typeof eventsData === 'string') {
      try {
        const parsed = JSON.parse(eventsData);
        return Array.isArray(parsed) ? parsed : [];
      } catch (e) {
        console.error('Falha ao parsear os eventos de conversão no CodeGenerator:', e);
        return [];
      }
    }
    
    return Array.isArray(eventsData) ? eventsData : [];
  }

  const toggleSection = (section: string) => {
    setOpenSection(openSection === section ? '' : section);
  };
  
  const gtmHeadCode = `<!-- Google Tag Manager -->
<script>(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','${project.gtm_id}');</script>
<!-- End Google Tag Manager -->`;

  const gtmBodyCode = `<!-- Google Tag Manager (noscript) -->
<noscript><iframe src="https://www.googletagmanager.com/ns.html?id=${project.gtm_id}"
height="0" width="0" style="display:none;visibility:hidden"></iframe></noscript>
<!-- End Google Tag Manager (noscript) -->`;

  const generateEventSnippet = (event: ConversionEvent) => {
    // Escapa apóstrofos no nome do evento para evitar quebrar a string
    const eventName = event.name.replace(/'/g, "\\'");
    return `// Snippet para o evento: '${eventName}'
window.dataLayer = window.dataLayer || [];
window.dataLayer.push({
  'event': '${event.id}'
});`;
  };

  const isGtmConfigured = project.gtm_id;
  const events = getEventsArray();

  if (!isGtmConfigured) {
    return null; // Simplificado, a mensagem de aviso principal está em outros componentes.
  }

  return (
    <div className="bg-white border border-gray-200 rounded-2xl shadow-sm">
      <div className="p-6 md:p-8">
        <div className="flex items-center space-x-3">
          <h2 className="text-2xl font-bold text-gray-900">Gerador de Código</h2>
          <CodeBracketIcon className="h-6 w-6 text-indigo-600" />
        </div>
        <p className="mt-1 text-gray-600">
          Copie e cole estes códigos no seu site para ativar o tracking.
        </p>
      </div>

      <div className="border-t border-gray-200">
        {/* Seção GTM */}
        <div className="border-b border-gray-200">
            <button onClick={() => toggleSection('gtm')} className="w-full flex justify-between items-center p-4 hover:bg-gray-50 cursor-pointer">
                <span className="font-semibold text-gray-800">1. Script Principal do GTM</span>
                {openSection === 'gtm' ? <ChevronDownIcon className="h-5 w-5 text-gray-500"/> : <ChevronRightIcon className="h-5 w-5 text-gray-500"/>}
            </button>
            {openSection === 'gtm' && (
                <div className="p-4 bg-gray-50">
                    <p className="text-sm text-gray-600 mb-2">Copie e cole o código abaixo na tag <code className="text-xs bg-gray-200 p-1 rounded">&lt;head&gt;</code> de todas as páginas do seu site.</p>
                    <CodeSnippet title="Código para o <head>" code={gtmHeadCode} language="html" />
                    
                    <p className="text-sm text-gray-600 mb-2 mt-4">Copie e cole o código abaixo logo após a abertura da tag <code className="text-xs bg-gray-200 p-1 rounded">&lt;body&gt;</code>.</p>
                    <CodeSnippet title="Código para o <body>" code={gtmBodyCode} language="html" />
                </div>
            )}
        </div>

        {/* Seção Eventos de Conversão */}
        <div className="border-b border-gray-200">
            <button onClick={() => toggleSection('events')} className="w-full flex justify-between items-center p-4 hover:bg-gray-50 cursor-pointer">
                <span className="font-semibold text-gray-800">2. Snippets de Eventos de Conversão</span>
                {openSection === 'events' ? <ChevronDownIcon className="h-5 w-5 text-gray-500"/> : <ChevronRightIcon className="h-5 w-5 text-gray-500"/>}
            </button>
            {openSection === 'events' && (
                <div className="p-4 bg-gray-50">
                    {events.length > 0 ? (
                        events.map(event => (
                            <div key={event.id} className="mb-6">
                                <h4 className="font-medium text-gray-800">{event.name}</h4>
                                <p className="text-sm text-gray-600 mb-2">{event.description || 'Use este snippet para disparar o evento.'}</p>
                                <CodeSnippet title={`Snippet para '${event.name}'`} code={generateEventSnippet(event)} />
                            </div>
                        ))
                    ) : (
                        <p className="text-sm text-gray-500">Nenhum evento de conversão foi definido. Adicione eventos na seção "Eventos de Conversão" para gerar os snippets de código.</p>
                    )}
                </div>
            )}
        </div>
      </div>
    </div>
  );
} 
