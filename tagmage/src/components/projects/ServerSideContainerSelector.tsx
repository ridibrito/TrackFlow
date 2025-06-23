'use client';

import { useState, useEffect } from 'react';
import { Project, updateProject } from '@/lib/supabase/projects';
import { useAuth } from '@/contexts/AuthContext';
import { ServerIcon, CheckCircleIcon, ExclamationTriangleIcon } from '@heroicons/react/24/solid';

interface StapeContainer {
  id: string;
  name: string;
  domain: string;
  status: 'active' | 'inactive';
  created_at: string;
  updated_at: string;
}

interface ServerSideContainerSelectorProps {
  project: Project;
  onContainerSelected: (containerId: string) => void;
}

export default function ServerSideContainerSelector({ project, onContainerSelected }: ServerSideContainerSelectorProps) {
  const { user } = useAuth();
  const [containers, setContainers] = useState<StapeContainer[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedContainer, setSelectedContainer] = useState<string | null>(null);

  const fetchContainers = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/stape/list-containers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Falha ao buscar containers.');
      }

      setContainers(result.containers || []);
      
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleContainerSelect = async (containerId: string) => {
    if (!user) return;

    setSelectedContainer(containerId);
    
    try {
      // Atualizar o projeto com o container selecionado
      await updateProject(project.id, { 
        stape_container_id: containerId 
      }, user.id);
      
      onContainerSelected(containerId);
      
    } catch (err: any) {
      setError('Erro ao salvar container selecionado: ' + err.message);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2 mb-4">
        <ServerIcon className="h-5 w-5 text-purple-600" />
        <h3 className="text-lg font-semibold text-gray-900">Selecionar Container Existente</h3>
      </div>

      <div className="space-y-4">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="text-sm font-medium text-blue-800 mb-2">Containers Disponíveis</h4>
          <p className="text-sm text-blue-700 mb-3">
            Selecione um container existente da sua conta TagMage ou crie um novo.
          </p>
          <button
            onClick={fetchContainers}
            disabled={loading}
            className="px-4 py-2 text-sm font-medium text-white bg-purple-600 rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Buscando...' : 'Buscar Containers'}
          </button>
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center space-x-2">
              <ExclamationTriangleIcon className="h-5 w-5 text-red-600" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        )}

        {containers.length > 0 && (
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-gray-800">
              Containers Disponíveis ({containers.length})
            </h4>
            <div className="grid gap-3">
              {containers.map((container) => (
                <div
                  key={container.id}
                  className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                    selectedContainer === container.id
                      ? 'border-purple-500 bg-purple-50'
                      : 'border-gray-200 hover:border-purple-300 hover:bg-purple-25'
                  }`}
                  onClick={() => handleContainerSelect(container.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h5 className="font-medium text-gray-900">{container.name}</h5>
                      <p className="text-sm text-gray-600">Domínio: {container.domain}</p>
                      <div className="flex items-center space-x-2 mt-1">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          container.status === 'active' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {container.status === 'active' ? 'Ativo' : 'Inativo'}
                        </span>
                        <span className="text-xs text-gray-500">
                          Criado em: {new Date(container.created_at).toLocaleDateString('pt-BR')}
                        </span>
                      </div>
                    </div>
                    {selectedContainer === container.id && (
                      <CheckCircleIcon className="h-5 w-5 text-purple-600" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {containers.length === 0 && !loading && !error && (
          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800">
              Clique em "Buscar Containers" para ver os containers disponíveis na sua conta TagMage.
            </p>
          </div>
        )}
      </div>
    </div>
  );
} 
