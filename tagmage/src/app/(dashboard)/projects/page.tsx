'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { getProjectsForUser, Project } from '@/lib/supabase/projects';
import Link from 'next/link';
import ProjectStatusCard from '@/components/dashboard/ProjectStatusCard';
import { PlusIcon, SparklesIcon } from '@heroicons/react/24/outline';

export default function ProjectsPage() {
  const { user } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  // Esta função de status é um mock. No futuro, pode ser substituída por dados reais.
  const getMockStatus = (projectId: string): 'attention' | 'warning' | 'ok' => {
    const hash = projectId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    if (hash % 5 === 0) return 'attention';
    if (hash % 3 === 0) return 'warning';
    return 'ok';
  };

  useEffect(() => {
    const fetchProjects = async () => {
      if (user) {
        setLoading(true);
        try {
          const projectsData = await getProjectsForUser(user.id);
          setProjects(projectsData || []);
        } catch (error) {
          console.error("Erro ao buscar projetos:", error);
          setProjects([]);
        } finally {
          setLoading(false);
        }
      }
    };
    fetchProjects();
  }, [user]);

  const projectsWithStatus = projects.map(p => ({
    ...p,
    status: getMockStatus(p.id)
  }));

  if (loading) {
    return (
      <div className="text-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
        <p className="mt-4 text-gray-700">Carregando projetos...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Meus Projetos</h1>
        <div className="flex space-x-4">
            <Link href="/auto-create" className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700">
                <SparklesIcon className="w-5 h-5 mr-2" />
                Novo Projeto com IA
            </Link>
             <Link href="/projects/new" className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
                <PlusIcon className="w-5 h-5 mr-2" />
                Novo Projeto Manual
            </Link>
        </div>
      </div>

      {projectsWithStatus.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projectsWithStatus.map((project) => (
            <ProjectStatusCard key={project.id} project={project} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-white border-2 border-dashed border-gray-300 rounded-lg mt-6">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h4l2 2h4a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
          </svg>
          <h3 className="mt-2 text-lg font-medium text-gray-900">Nenhum projeto encontrado</h3>
          <p className="mt-1 text-sm text-gray-500">Comece a monitorar suas campanhas adicionando seu primeiro projeto.</p>
        </div>
      )}
    </div>
  );
} 