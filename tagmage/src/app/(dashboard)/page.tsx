'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { getProjectsForUser, Project } from '@/lib/supabase/projects';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import ProjectStatusCard from '@/components/dashboard/ProjectStatusCard';
import Link from 'next/link';
import RecentActivityCard from '@/components/dashboard/RecentActivityCard';
import dynamic from 'next/dynamic';

const ProjectsStatusChart = dynamic(() => import('@/components/dashboard/ProjectsStatusChart'), { 
  ssr: false,
  loading: () => <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm h-full flex items-center justify-center"><p>Carregando gráfico...</p></div>
});

export default function DashboardPage() {
  const { user } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  // Mock de status para cada projeto
  const getMockStatus = (projectId: string): 'attention' | 'warning' | 'ok' => {
    // Simples lógica para variar o status
    const hash = projectId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    if (hash % 3 === 0) return 'attention';
    if (hash % 2 === 0) return 'warning';
    return 'ok';
  };

  useEffect(() => {
    const fetchProjects = async () => {
      if (user) {
        setLoading(true);
        const userProjects = await getProjectsForUser(user.id);
        setProjects(userProjects);
        setLoading(false);
      }
    };
    fetchProjects();
  }, [user]);

  const projectsWithStatus = projects.map(p => ({
    ...p,
    status: getMockStatus(p.id)
  }));
  
  const attentionCount = projectsWithStatus.filter(p => p.status === 'attention').length;
  const okCount = projectsWithStatus.filter(p => p.status === 'ok').length;
  const warningCount = projectsWithStatus.filter(p => p.status === 'warning').length;

  const chartData = [
    { name: 'OK', value: 5 },
    { name: 'Warning', value: 2 },
    { name: 'Attention', value: 1 },
  ];

  if (loading) {
    return (
      <div className="text-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
        <p className="mt-4 text-gray-700">Carregando dashboard...</p>
      </div>
    );
  }

  return (
    <div>
      <DashboardHeader 
        projectCount={projects.length} 
        attentionCount={attentionCount} 
      />

      {projects.length > 0 ? (
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content - Project Cards */}
          <div className="lg:col-span-2">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Meus Projetos</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {projectsWithStatus.map((project) => (
                <ProjectStatusCard key={project.id} project={project} />
              ))}
            </div>
          </div>

          {/* Sidebar - Charts and Activity */}
          <div className="space-y-8">
            <ProjectsStatusChart data={chartData} />
            <RecentActivityCard />
          </div>
        </div>
      ) : (
        <div className="mt-12 text-center">
           <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
          </svg>
          <h3 className="mt-4 text-lg font-semibold text-gray-900">Bem-vindo ao Tag Mage!</h3>
          <p className="mt-2 text-sm text-gray-600">Você ainda não tem nenhum projeto. Que tal adicionar o primeiro?</p>
          <div className="mt-6 space-x-4">
            <Link 
              href="/auto-create" 
              className="inline-flex items-center px-5 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-indigo-600 to-blue-600 rounded-lg hover:shadow-lg"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Criação Automática com IA
            </Link>
            <Link 
              href="/projects" 
              className="inline-flex items-center px-5 py-2.5 text-sm font-semibold text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
            >
              Criar Manualmente
            </Link>
          </div>
        </div>
      )}
    </div>
  );
} 