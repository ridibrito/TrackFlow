'use client';

import { Project } from '@/lib/supabase/projects';
import { PlusCircleIcon } from '@heroicons/react/24/outline';
import TimeAgo from 'react-timeago';
// @ts-ignore
import pt_br from 'react-timeago/lib/language-strings/pt-br';
// @ts-ignore
import buildFormatter from 'react-timeago/lib/formatters/buildFormatter';

interface RecentActivityCardProps {
  projects: Project[];
}

export default function RecentActivityCard({ projects }: RecentActivityCardProps) {
  const formatter = buildFormatter(pt_br);

  // Pega os 5 projetos mais recentes para exibir como atividade
  const recentProjects = projects
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 5);
  
  const hasActivity = recentProjects.length > 0;

  return (
    <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm h-full flex flex-col">
      <h3 className="text-lg font-bold text-gray-900 mb-4">Atividade Recente</h3>
      <div className="flex-1">
        {hasActivity ? (
          <ul role="list" className="space-y-4">
            {recentProjects.map((project) => (
              <li key={project.id} className="flex items-start">
                <div className="flex-shrink-0">
                  <span className={`flex h-8 w-8 items-center justify-center rounded-full bg-green-100`}>
                    <PlusCircleIcon className={`h-5 w-5 text-green-500`} aria-hidden="true" />
                  </span>
                </div>
                <div className="ml-4 flex-1">
                  <p className="text-sm font-medium text-gray-800">{project.name}</p>
                  <p className="text-sm text-gray-600">Projeto adicionado com sucesso.</p>
                  <p className="mt-1 text-xs text-gray-400">
                    <TimeAgo date={project.created_at} formatter={formatter} />
                  </p>
                </div>
              </li>
            ))}
          </ul>
        ) : (
           <div className="flex-1 flex items-center justify-center text-center h-full">
            <div>
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">Nenhuma atividade recente</h3>
              <p className="mt-1 text-sm text-gray-500">As atividades aparecerão aqui.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 