'use client';

import { Project } from '@/lib/supabase/projects';
import CodeGenerator from '../CodeGenerator';

interface InstallationStepProps {
  project: Project;
}

const InstallationStep = ({ project }: InstallationStepProps) => {

  if (!project.gtm_id) {
    return (
        <div className="text-center p-6 bg-yellow-50 border border-yellow-300 rounded-lg">
            <h3 className="text-lg font-bold text-yellow-900">Aguardando Configuração</h3>
            <p className="text-yellow-800 mt-2">
                O script de instalação estará disponível assim que a configuração do Google Tag Manager for concluída no passo anterior.
            </p>
        </div>
    );
  }

  return (
    <div>
        <h3 className="text-xl font-bold text-gray-900 mb-4">Instalação do Script</h3>
        <p className="text-gray-600 mb-6">
            Copie e cole o código abaixo na seção `&lt;head&gt;` de todas as páginas do seu site. Este é o único script que você precisará instalar.
        </p>
        
        <CodeGenerator project={project} />

        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h4 className="font-semibold text-blue-900">E agora?</h4>
            <p className="text-blue-800 mt-2">
                Após instalar o script, as tags de rastreamento que você configurou começarão a funcionar automaticamente. Você pode gerenciar suas tags e configurações a qualquer momento através do painel do Google Tag Manager.
            </p>
        </div>
    </div>
  );
};

export default InstallationStep; 