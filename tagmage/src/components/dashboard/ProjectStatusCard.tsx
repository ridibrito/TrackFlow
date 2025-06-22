'use client';

import { Project } from '@/lib/supabase/projects';
import Link from 'next/link';
import { 
  CheckCircleIcon, 
  ExclamationTriangleIcon,
  ExclamationCircleIcon,
  ArrowRightIcon
} from '@heroicons/react/24/solid';

interface ProjectWithStatus extends Project {
  status: 'ok' | 'warning' | 'attention';
}

interface ProjectStatusCardProps {
  project: ProjectWithStatus;
}

const statusConfig = {
  ok: {
    icon: <CheckCircleIcon className="h-6 w-6 text-green-500" />,
    label: 'Tudo certo',
    color: 'border-green-500',
    description: 'Nenhum problema detectado.'
  },
  warning: {
    icon: <ExclamationTriangleIcon className="h-6 w-6 text-yellow-500" />,
    label: 'Atenção',
    color: 'border-yellow-500',
    description: 'Algumas tags não estão sendo disparadas.'
  },
  attention: {
    icon: <ExclamationCircleIcon className="h-6 w-6 text-red-500" />,
    label: 'Crítico',
    color: 'border-red-500',
    description: 'Container GTM não encontrado ou falhas críticas.'
  }
};

export default function ProjectStatusCard({ project }: ProjectStatusCardProps) {
  const config = statusConfig[project.status];

  // Contagem mockada
  const platformCount = [project.google_ads_id, project.meta_pixel_id, project.tiktok_ads_id, project.linkedin_ads_id].filter(Boolean).length;
  const eventCount = project.conversion_events ? 
    (Array.isArray(project.conversion_events) ? project.conversion_events.length : 
     typeof project.conversion_events === 'string' ? JSON.parse(project.conversion_events).length : 0) : 0;

  return (
    <div className={`relative bg-white border-l-4 ${config.color} rounded-r-2xl rounded-l-md shadow-sm hover:shadow-lg transition-shadow duration-300`}>
      <div className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-4">
             {project.client_logo_url ? (
                <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-50 flex items-center justify-center border">
                  <img src={project.client_logo_url} alt={`Logo ${project.name}`} className="w-full h-full object-contain" />
                </div>
              ) : (
                <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center text-xl font-bold text-gray-500">
                  {(project.name || 'P').charAt(0).toUpperCase()}
                </div>
              )}
            <div>
              <h3 className="text-lg font-bold text-gray-900">{project.name}</h3>
              <p className="text-sm text-gray-600 truncate">{project.url}</p>
            </div>
          </div>
          {config.icon}
        </div>
        
        <p className="mt-4 text-sm text-gray-700">{config.description}</p>

        <div className="mt-4 pt-4 border-t border-gray-200 flex justify-between text-sm text-gray-600">
          <span className="font-medium">Plataformas: <span className="text-gray-900">{platformCount}</span></span>
          <span className="font-medium">Eventos: <span className="text-gray-900">{eventCount}</span></span>
          <span className="font-medium">GTM: <span className={project.gtm_id ? 'text-green-600' : 'text-red-600'}>{project.gtm_id ? 'OK' : 'Pendente'}</span></span>
        </div>
      </div>
       <Link href={`/projects/${project.id}`} className="absolute bottom-0 right-0">
         <div className="group bg-gray-50 hover:bg-indigo-100 transition-colors duration-200 px-4 py-3 rounded-br-2xl rounded-tl-2xl">
            <ArrowRightIcon className="h-5 w-5 text-gray-500 group-hover:text-indigo-600"/>
         </div>
       </Link>
    </div>
  );
} 