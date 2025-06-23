'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { getProjectsForUser, Project } from '@/lib/supabase/projects';
import ProjectStatusCard from '@/components/dashboard/ProjectStatusCard';
import Link from 'next/link';
import RecentActivityCard from '@/components/dashboard/RecentActivityCard';
import dynamic from 'next/dynamic';

const ProjectsStatusChart = dynamic(() => import('@/components/dashboard/ProjectsStatusChart'), { 
  ssr: false,
  loading: () => <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm h-full flex items-center justify-center"><p>Carregando gráfico...</p></div>
});

export default function PainelPage() {
  const { user } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  // A lógica de status será baseada em dados reais futuramente.
  // Por enquanto, manteremos uma lógica de exemplo.
  const getMockStatus = (projectId: string): 'attention' | 'warning' | 'ok' => {
    const hash = projectId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    if (hash % 5 === 0) return 'attention'; // Simula um erro crítico
    if (hash % 3 === 0) return 'warning'; // Simula um alerta
    return 'ok'; // Status normal
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
          setProjects([]); // Garante que o estado seja um array vazio em caso de erro
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
  
  const statusCounts = projectsWithStatus.reduce((acc, project) => {
    acc[project.status] = (acc[project.status] || 0) + 1;
    return acc;
  }, {} as Record<'ok' | 'warning' | 'attention', number>);

  const chartData = [
    { name: 'OK', value: statusCounts.ok || 0, color: '#22c55e' },
    { name: 'Alerta', value: statusCounts.warning || 0, color: '#f59e0b' },
    { name: 'Atenção', value: statusCounts.attention || 0, color: '#ef4444' },
  ];

  if (loading) {
    return (
      <div className="text-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
        <p className="mt-4 text-gray-700">Carregando painel...</p>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Painel Principal</h1>

      {/* Top Row: Chart and Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <ProjectsStatusChart title="Status Geral dos Projetos" data={chartData} />
        <RecentActivityCard projects={projects} />
      </div>

      {/* Bottom Section: Project Cards */}
      <div className="mt-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Visão Geral dos Projetos</h2>
        
        {projectsWithStatus.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
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
                <div className="mt-6">
                    <Link
                        href="/projects"
                        className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-[#008EF9] hover:bg-[#0078d4] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#008EF9]"
                    >
                         <svg className="mr-2 -ml-1 h-5 w-5" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                            <path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z" />
                        </svg>
                        Criar primeiro projeto
                    </Link>
                </div>
            </div>
        )}
      </div>
    </div>
  );
} 
