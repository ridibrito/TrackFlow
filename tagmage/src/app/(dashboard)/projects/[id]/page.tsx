'use client';

import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { getProjectById, Project, updateProject, deleteProject } from '@/lib/supabase/projects';
import Link from 'next/link';
import LogoUpload from '@/components/shared/LogoUpload';
import { PencilIcon, CheckIcon, XMarkIcon, ExclamationTriangleIcon, TrashIcon, InformationCircleIcon, ChevronDownIcon, CameraIcon } from '@heroicons/react/24/solid';
import { useRouter, useParams } from 'next/navigation';
import { FC, Dispatch, SetStateAction } from 'react';
import AIAgent from '@/components/projects/AIAgent';
import Image from 'next/image';

// Modal de Confirmação de Exclusão
const DeleteConfirmationModal = ({
  isOpen,
  onClose,
  onConfirm,
  projectName,
  isDeleting,
}: {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  projectName: string;
  isDeleting: boolean;
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={onClose}></div>
        
        <div className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-md">
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="sm:flex sm:items-start">
              <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                <ExclamationTriangleIcon className="h-6 w-6 text-red-600" />
              </div>
              <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left">
                <h3 className="text-lg font-medium leading-6 text-gray-900">
                  Excluir Projeto
                </h3>
                <div className="mt-2">
                  <p className="text-sm text-gray-500">
                    Tem certeza que deseja excluir o projeto <strong>"{projectName}"</strong>? 
                    Esta ação não pode ser desfeita e removerá permanentemente todos os dados associados.
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
            <button
              type="button"
              onClick={onConfirm}
              disabled={isDeleting}
              className="inline-flex w-full justify-center rounded-md border border-transparent bg-red-600 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 sm:ml-3 sm:w-auto sm:text-sm disabled:bg-red-400 disabled:cursor-not-allowed"
            >
              {isDeleting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Excluindo...
                </>
              ) : (
                <>
                  <TrashIcon className="h-4 w-4 mr-2" />
                  Excluir Projeto
                </>
              )}
            </button>
            <button
              type="button"
              onClick={onClose}
              disabled={isDeleting}
              className="mt-3 inline-flex w-full justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-base font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50"
            >
              Cancelar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const DangerZone = ({
  projectName,
  onDelete,
  isDeleting,
}: {
  projectName: string;
  onDelete: () => Promise<void>;
  isDeleting: boolean;
}) => {
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const handleDeleteClick = () => {
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    await onDelete();
    setShowDeleteModal(false);
  };

  return (
    <>
      <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-md">
        <div className="flex">
          <div className="flex-shrink-0">
            <ExclamationTriangleIcon className="h-5 w-5 text-red-400" />
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">Zona de Perigo</h3>
            <div className="mt-2 text-sm text-red-700">
              <p>A exclusão de um projeto é uma ação permanente e irreversível.</p>
            </div>
            <div className="mt-4">
               <button
                onClick={handleDeleteClick}
                disabled={isDeleting}
                className="inline-flex items-center px-3 py-1.5 border border-red-600 text-sm font-medium rounded-md text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
              >
                <TrashIcon className="h-4 w-4 mr-2" />
                Excluir projeto
              </button>
            </div>
          </div>
        </div>
      </div>

      <DeleteConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleConfirmDelete}
        projectName={projectName}
        isDeleting={isDeleting}
      />
    </>
  );
};

interface ProjectHeaderProps {
  project: Project;
  isEditing: boolean;
  formData: Partial<Project>;
  handleInputChange: (field: keyof Partial<Project>, value: string | null) => void;
  handleSave: () => void;
  handleCancel: () => void;
  setIsEditing: Dispatch<SetStateAction<boolean>>;
  isSubmitting: boolean;
  handleDeleteProject?: () => Promise<void>;
}

// ProjectHeader com modo de visualização e edição distintos
const ProjectHeader: FC<ProjectHeaderProps> = ({ project, isEditing, formData, handleInputChange, handleSave, handleCancel, setIsEditing, isSubmitting, handleDeleteProject }) => {
  if (!isEditing) {
    return (
      <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border border-gray-200 flex items-center justify-between mb-8">
        <div className="flex items-center gap-4 overflow-hidden">
          {project.client_logo_url ? (
            <Image src={project.client_logo_url} alt={`Logo de ${project.name}`} width={48} height={48} className="rounded-md object-cover w-12 h-12 flex-shrink-0" />
          ) : (
            <div className="w-12 h-12 bg-gray-100 rounded-md flex items-center justify-center border flex-shrink-0">
              <CameraIcon className="w-6 h-6 text-gray-400" />
            </div>
          )}
          <div className="overflow-hidden">
            <h1 className="text-xl font-bold text-gray-900 truncate">{project.name}</h1>
            {project.url && (
              <a href={project.url} target="_blank" rel="noopener noreferrer" className="text-sm text-indigo-600 hover:underline break-all">
                {project.url}
              </a>
            )}
          </div>
        </div>
        <button 
          onClick={() => setIsEditing(true)} 
          className="ml-4 flex-shrink-0 flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          <PencilIcon className="w-4 h-4" />
          <span className="hidden sm:inline">Editar</span>
        </button>
      </div>
    );
  }

  // Modo de Edição
  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 flex flex-col gap-6 mb-8">
      <div className="flex flex-col sm:flex-row items-start gap-6">
        <LogoUpload 
          currentLogoUrl={formData.client_logo_url} 
          onLogoChange={(url) => handleInputChange('client_logo_url', url)}
          onLogoRemove={() => handleInputChange('client_logo_url', null)}
          label="Logo do Cliente"
          disabled={isSubmitting}
        />
        <div className="flex-1 w-full">
          <div className="space-y-4">
            <div>
              <label htmlFor="projectName" className="block text-sm font-medium text-gray-700">Nome do Projeto</label>
              <input 
                id="projectName"
                type="text"
                value={formData.name || ''}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                disabled={isSubmitting}
              />
            </div>
            <div>
              <label htmlFor="projectUrl" className="block text-sm font-medium text-gray-700">URL do Site</label>
              <input
                id="projectUrl"
                type="text"
                value={formData.url || ''}
                onChange={(e) => handleInputChange('url', e.target.value)}
                className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                disabled={isSubmitting}
              />
            </div>
          </div>
        </div>
      </div>
      
      {handleDeleteProject && (
        <DangerZone 
          projectName={project.name || ''}
          onDelete={handleDeleteProject}
          isDeleting={isSubmitting}
        />
      )}

      <div className="flex justify-end gap-3 border-t border-gray-200 pt-6">
        <button onClick={handleCancel} disabled={isSubmitting} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50">
          Cancelar
        </button>
        <button onClick={handleSave} disabled={isSubmitting} className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-lg shadow-sm hover:bg-indigo-700 disabled:opacity-50 w-36">
          {isSubmitting ? (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
          ) : 'Salvar Alterações'}
        </button>
      </div>
    </div>
  );
};

// AnalysisCard: mostra ícones mesmo fechado
const AnalysisCard = ({ project }: { project: Project }) => {
  const [isOpen, setIsOpen] = useState(false);
  const analysis = project.site_analysis_data;
  const hasAnalysisData = project.business_type || 
                          (project.existing_tags && project.existing_tags.length > 0) ||
                          (analysis && (analysis.conversion_elements?.length > 0 || analysis.recommended_events?.length > 0));
  if (!hasAnalysisData) return null;
  const getPlatformIcon = (platformName: string): string => {
    const name = platformName.toLowerCase();
    if (name.includes('google tag manager') || name.includes('gtm')) return '/logos/gtm.svg';
    if (name.includes('google analytics') || name.includes('ga4')) return '/logos/google-analytics.svg';
    if (name.includes('google ads')) return '/logos/google-ads.svg';
    if (name.includes('meta') || name.includes('facebook')) return '/logos/meta-ads.svg';
    if (name.includes('tiktok')) return '/logos/tiktok-ads.svg';
    if (name.includes('linkedin')) return '/logos/linkedin-ads.svg';
    return '/file.svg';
  };
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-8">
      <button 
        className="w-full flex justify-between items-center p-6 text-left"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center gap-3">
          <InformationCircleIcon className="w-6 h-6 text-indigo-600" />
          <span className="text-lg font-semibold text-gray-900">Análise do Site</span>
          {/* Ícones das plataformas detectadas */}
          {project.existing_tags && project.existing_tags.length > 0 && (
            <div className="flex gap-2 ml-4">
              {project.existing_tags.map(tag => (
                <Image key={tag} src={getPlatformIcon(tag)} alt={tag} width={22} height={22} title={tag} className="inline-block" />
              ))}
            </div>
          )}
        </div>
        <ChevronDownIcon 
            className={`w-6 h-6 text-gray-500 transition-transform duration-200 ${isOpen ? 'transform rotate-180' : ''}`} 
        />
      </button>
      {isOpen && (
        <div className="px-6 pb-6 pt-0 border-t border-gray-200">
          <div className="space-y-6 mt-6">
            {project.business_type && (
              <div>
                <p className="font-medium text-gray-800 mb-2 text-base">Tipo de Negócio</p>
                <p className="text-gray-600">{project.business_type}</p>
              </div>
            )}
            {project.existing_tags && project.existing_tags.length > 0 && (
              <div>
                <p className="font-medium text-gray-800 mb-2 text-base">Plataformas Detectadas</p>
                <div className="flex flex-wrap gap-3">
                  {project.existing_tags.map(tag => (
                    <div key={tag} className="flex items-center px-3 py-1 bg-gray-100 text-gray-800 text-sm rounded-full font-medium">
                      <Image 
                        src={getPlatformIcon(tag)} 
                        alt={`${tag} logo`} 
                        width={16} 
                        height={16} 
                        className="mr-2"
                      />
                      {tag}
                    </div>
                  ))}
                </div>
              </div>
            )}
            {analysis?.conversion_elements?.length > 0 && (
              <div>
                <p className="font-medium text-gray-800 mb-2 text-base">Elementos de Conversão Detectados</p>
                <ul className="space-y-3">
                  {analysis.conversion_elements.map((element: { element: string, description: string }, index: number) => (
                    <li key={index} className="p-3 bg-gray-50 rounded-md border border-gray-200">
                      <p className="font-semibold text-gray-700">{element.element}</p>
                      <p className="text-gray-600 text-sm">{element.description}</p>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {analysis?.recommended_events?.length > 0 && (
              <div>
                <p className="font-medium text-gray-800 mb-2 text-base">Eventos Recomendados</p>
                <ul className="space-y-3">
                  {analysis.recommended_events.map((event: { event: string, description: string }, index: number) => (
                    <li key={index} className="p-3 bg-gray-50 rounded-md border border-gray-200">
                      <p className="font-semibold text-gray-700">{event.event}</p>
                      <p className="text-gray-600 text-sm">{event.description}</p>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default function ProjectDetailsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const params = useParams();
  const projectId = params?.id as string;

  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<Partial<Project>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchProject = useCallback(() => {
    if (!user || !projectId) return;

    setLoading(true);
    getProjectById(projectId, user.id)
      .then((proj) => {
        if (proj) {
          setProject(proj);
          setFormData({
            name: proj.name || '',
            url: proj.url || '',
            client_logo_url: proj.client_logo_url || '',
          });
        } else {
          setProject(null); // Explicitly set to null if not found
        }
      })
      .catch(() => setProject(null)) // Handle errors
      .finally(() => setLoading(false));
  }, [user, projectId]);

  useEffect(() => {
    fetchProject();
  }, [fetchProject]);

  const handleInputChange = (field: keyof Partial<Project>, value: string | null) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    if (!project || !user) return;
    setIsSubmitting(true);
    await updateProject(project.id, formData, user.id);
    const updated = await getProjectById(project.id, user.id);
    setProject(updated);
    setIsEditing(false);
    setIsSubmitting(false);
  };

  const handleCancel = () => {
    if (!project) return;
    setFormData({
      name: project.name,
      url: project.url,
      client_logo_url: project.client_logo_url,
    });
    setIsEditing(false);
  };

  const handleDeleteProject = async () => {
    if (!project || !user) return;
    setIsSubmitting(true);
    await deleteProject(project.id, user.id);
    setIsSubmitting(false);
    router.push('/painel');
  };

  const handleAIAgentComplete = () => {
    fetchProject(); // Recarrega os dados do projeto
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }
  if (!project) {
    return (
      <div className="text-center text-gray-500 py-12">Projeto não encontrado.</div>
    );
  }

  const headerProps = {
    project,
    isEditing,
    formData,
    handleInputChange,
    handleSave,
    handleCancel,
    setIsEditing,
    isSubmitting,
    handleDeleteProject,
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <ProjectHeader {...headerProps} />
      <AnalysisCard project={project} />
      <div className="mt-8">
        <AIAgent project={project} onComplete={handleAIAgentComplete} />
      </div>
    </div>
  );
}
