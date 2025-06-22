'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { addProject } from '@/lib/supabase/projects';
import { useRouter } from 'next/navigation';
import LogoUpload from '@/components/shared/LogoUpload';

interface AddProjectFormProps {
  setIsOpen: (isOpen: boolean) => void;
}

export default function AddProjectForm({ setIsOpen }: AddProjectFormProps) {
  const { user } = useAuth();
  const router = useRouter();
  const [projectName, setProjectName] = useState('');
  const [projectUrl, setProjectUrl] = useState('');
  const [clientLogoUrl, setClientLogoUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [scanResults, setScanResults] = useState<{ gtmIds: string[], metaPixelIds: string[], ga4Ids: string[] } | null>(null);
  const [error, setError] = useState('');

  const handleUrlBlur = async () => {
    if (!projectUrl || !projectUrl.includes('.')) {
      setScanResults(null);
      return;
    }
    
    setIsScanning(true);
    setScanResults(null);

    try {
      const response = await fetch('/api/scan-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: projectUrl }),
      });

      if (!response.ok) {
        throw new Error('A resposta da verificação da URL não foi bem-sucedida.');
      }

      const results = await response.json();
      setScanResults(results);

    } catch (err) {
      console.error("Erro ao escanear URL:", err);
      // Não mostrar erro para o usuário, apenas logar
    } finally {
      setIsScanning(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!projectName || !projectUrl) {
      setError('Por favor, preencha todos os campos.');
      return;
    }
    if (!user) {
      setError('Você precisa estar autenticado para criar um projeto.');
      return;
    }

    setIsSubmitting(true);

    const { error: addError } = await addProject({
      name: projectName,
      url: projectUrl,
      user_id: user.id,
      client_logo_url: clientLogoUrl || null,
      gtm_id: scanResults?.gtmIds?.[0] || null,
      meta_pixel_id: scanResults?.metaPixelIds?.[0] || null,
      ga4_measurement_id: scanResults?.ga4Ids?.[0] || null,
    });

    setIsSubmitting(false);

    if (addError) {
      console.error('Supabase error creating project:', addError);
      setError(`Erro do servidor: ${addError.message}`);
    } else {
      setIsOpen(false);
      // Idealmente, poderíamos ter uma forma de recarregar os dados da página
      // sem um refresh completo, mas por enquanto isso garante que a lista seja atualizada.
      router.refresh(); 
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <label htmlFor="projectName" className="text-sm font-semibold text-gray-700">
          Nome do Projeto
        </label>
        <input
          id="projectName"
          type="text"
          value={projectName}
          onChange={(e) => setProjectName(e.target.value)}
          className="w-full px-4 py-3 text-base text-gray-900 placeholder:text-gray-500 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
          placeholder="Ex: Cliente Sapatos Inc."
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="projectUrl" className="text-sm font-semibold text-gray-700">
          URL do Site
        </label>
        <input
          id="projectUrl"
          type="url"
          value={projectUrl}
          onChange={(e) => setProjectUrl(e.target.value)}
          onBlur={handleUrlBlur}
          className="w-full px-4 py-3 text-base text-gray-900 placeholder:text-gray-500 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
          placeholder="https://www.sapatosinc.com.br"
        />
        {isScanning && (
          <div className="flex items-center mt-2 text-sm text-gray-500">
            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-indigo-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Verificando tags...
          </div>
        )}
        {scanResults && (
           <div className="mt-3 p-4 bg-gray-50 border border-gray-200 rounded-lg">
             <h4 className="text-sm font-semibold text-gray-800 mb-2">Tags Encontradas no Site:</h4>
             {scanResults.gtmIds.length === 0 && scanResults.metaPixelIds.length === 0 && scanResults.ga4Ids.length === 0 ? (
               <p className="text-sm text-gray-500">Nenhuma tag do GTM, Meta ou GA4 foi encontrada.</p>
             ) : (
               <ul className="space-y-2">
                 {scanResults.gtmIds.map(id => (
                   <li key={id} className="flex items-center text-sm">
                     <img src="/logos/gtm.svg" alt="GTM" className="w-4 h-4 mr-2" />
                     <span className="font-medium text-gray-700">GTM:</span>
                     <span className="ml-1.5 text-gray-900 bg-gray-100 px-2 py-0.5 rounded-md">{id}</span>
                   </li>
                 ))}
                 {scanResults.metaPixelIds.map(id => (
                   <li key={id} className="flex items-center text-sm">
                     <img src="/logos/meta-ads.svg" alt="Meta Pixel" className="w-4 h-4 mr-2" />
                     <span className="font-medium text-gray-700">Meta Pixel:</span>
                     <span className="ml-1.5 text-gray-900 bg-gray-100 px-2 py-0.5 rounded-md">{id}</span>
                   </li>
                 ))}
                 {scanResults.ga4Ids.map(id => (
                   <li key={id} className="flex items-center text-sm">
                     <img src="/logos/google-analytics.svg" alt="GA4" className="w-4 h-4 mr-2" />
                     <span className="font-medium text-gray-700">GA4:</span>
                     <span className="ml-1.5 text-gray-900 bg-gray-100 px-2 py-0.5 rounded-md">{id}</span>
                   </li>
                 ))}
               </ul>
             )}
           </div>
        )}
      </div>

      <div className="space-y-2">
        <LogoUpload
          currentLogoUrl={clientLogoUrl}
          onLogoChange={setClientLogoUrl}
          onLogoRemove={() => setClientLogoUrl('')}
          label="Logo do Cliente (opcional)"
          placeholder="Logo do cliente"
        />
      </div>

      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}

      <div className="flex justify-end gap-4 pt-4">
        <button
          type="button"
          onClick={() => setIsOpen(false)}
          className="px-6 py-2.5 text-sm font-semibold text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-6 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-indigo-600 to-blue-600 rounded-lg hover:shadow-lg hover:shadow-indigo-500/40 transition-all duration-300 disabled:opacity-50"
        >
          {isSubmitting ? 'Criando...' : 'Criar Projeto'}
        </button>
      </div>
    </form>
  );
} 