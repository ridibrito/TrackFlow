'use client';

import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Project, updateProject, ConversionEvent } from "@/lib/supabase/projects";
import { CheckCircleIcon, PlusIcon, TrashIcon, PencilIcon, ChevronDownIcon, ChevronRightIcon, XMarkIcon, CheckIcon, ExclamationTriangleIcon } from "@heroicons/react/24/solid";
import { nanoid } from 'nanoid';

interface ConversionEventsProps {
  project: Project;
}

const EventForm = ({
  event,
  onSave,
  onCancel,
  isSaving,
}: {
  event: Partial<ConversionEvent>;
  onSave: (event: ConversionEvent) => void;
  onCancel: () => void;
  isSaving: boolean;
}) => {
  const [name, setName] = useState(event.name || '');
  const [description, setDescription] = useState(event.description || '');

  const handleSave = () => {
    if (!name.trim() || isSaving) return;
    onSave({
      id: event.id || nanoid(10),
      name,
      description,
    });
  };

  return (
    <div className="p-4 border border-indigo-200 rounded-lg bg-indigo-50/50 space-y-4">
      <h3 className="font-semibold text-gray-900">{event.id ? 'Editar Evento' : 'Adicionar Novo Evento'}</h3>
      <div>
        <label className="text-sm font-medium text-gray-700">Nome do Evento</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="mt-1 w-full px-3 py-2 text-sm text-gray-900 placeholder:text-gray-500 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
          placeholder="Ex: Compra Finalizada"
          disabled={isSaving}
        />
      </div>
      <div>
        <label className="text-sm font-medium text-gray-700">Descrição (opcional)</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={2}
          className="mt-1 w-full px-3 py-2 text-sm text-gray-900 placeholder:text-gray-500 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
          placeholder="Ex: Disparado na página de obrigado após uma compra."
          disabled={isSaving}
        />
      </div>
      <div className="flex justify-end space-x-3">
        <button onClick={onCancel} disabled={isSaving} className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50">
            <XMarkIcon className="h-4 w-4 mr-1.5"/> Cancelar
        </button>
        <button onClick={handleSave} disabled={isSaving} className="flex items-center px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:opacity-50">
            {isSaving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Salvando...
                </>
              ) : (
                <>
                  <CheckIcon className="h-4 w-4 mr-1.5"/> Salvar Evento
                </>
              )}
        </button>
      </div>
    </div>
  );
};

const DeleteEventConfirmationModal = ({
  isOpen,
  onClose,
  onConfirm,
  eventName,
  isDeleting,
}: {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  eventName: string;
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
                <h3 className="text-lg font-medium leading-6 text-gray-900">Excluir Evento</h3>
                <div className="mt-2">
                  <p className="text-sm text-gray-500">
                    Tem certeza que deseja excluir o evento <strong>"{eventName}"</strong>?
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
            <button type="button" onClick={onConfirm} disabled={isDeleting} className="inline-flex w-full justify-center rounded-md border border-transparent bg-red-600 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 sm:ml-3 sm:w-auto sm:text-sm disabled:bg-red-400">
              {isDeleting ? 'Excluindo...' : 'Excluir'}
            </button>
            <button type="button" onClick={onClose} disabled={isDeleting} className="mt-3 inline-flex w-full justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-base font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50">
              Cancelar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function ConversionEvents({ project }: ConversionEventsProps) {
  const { user } = useAuth();
  
  const getInitialState = (): ConversionEvent[] => {
    const eventsData = project.conversion_events;
    if (!eventsData) return [];
    if (typeof eventsData === 'string') {
      try {
        const parsed = JSON.parse(eventsData);
        return Array.isArray(parsed) ? parsed : [];
      } catch (e) {
        console.error('Falha ao parsear os eventos de conversão:', e);
        return [];
      }
    }
    return Array.isArray(eventsData) ? eventsData : [];
  }
  
  const [events, setEvents] = useState<ConversionEvent[]>(getInitialState());
  const [editingEvent, setEditingEvent] = useState<Partial<ConversionEvent> | null>(null);
  const [eventToDelete, setEventToDelete] = useState<ConversionEvent | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [isMainAccordionOpen, setIsMainAccordionOpen] = useState(true);
  
  const handleSaveEvent = async (eventToSave: ConversionEvent) => {
    if (!user) return;
    setError('');
    setIsSubmitting(true);

    const originalEvents = events;
    const exists = originalEvents.some(e => e.id === eventToSave.id);
    const newEvents = exists 
      ? originalEvents.map(e => e.id === eventToSave.id ? eventToSave : e)
      : [...originalEvents, eventToSave];
    
    setEvents(newEvents);
    setEditingEvent(null);

    const { error: updateError } = await updateProject(
      project.id, 
      { conversion_events: newEvents }, 
      user.id
    );
    
    setIsSubmitting(false);

    if (updateError) {
      setError('Erro ao salvar o evento. A alteração foi desfeita.');
      setEvents(originalEvents);
    }
  };
  
  const handleRemoveEvent = (eventId: string) => {
    const event = events.find(e => e.id === eventId);
    if (event) {
      setEventToDelete(event);
    }
  };

  const confirmRemoveEvent = async () => {
    if (!eventToDelete || !user) return;
    setError('');
    setIsSubmitting(true);

    const originalEvents = events;
    const newEvents = originalEvents.filter(e => e.id !== eventToDelete.id);
    
    setEvents(newEvents);
    setEventToDelete(null);

    const { error: updateError } = await updateProject(
      project.id, 
      { conversion_events: newEvents }, 
      user.id
    );

    setIsSubmitting(false);

    if (updateError) {
        setError('Erro ao remover o evento. A ação foi desfeita.');
        setEvents(originalEvents);
    }
  };

  const isGtmConfigured = project.gtm_id;

  if (!isGtmConfigured) {
    return null;
  }

  return (
    <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
      <button 
        className="w-full flex items-center justify-between p-6 md:p-8 hover:bg-gray-50 transition-colors"
        onClick={() => setIsMainAccordionOpen(!isMainAccordionOpen)}
      >
        <div className="flex items-center space-x-3">
          <h2 className="text-2xl font-bold text-gray-900">Eventos de Conversão</h2>
          {events.length > 0 && (
            <CheckCircleIcon className="h-6 w-6 text-green-600" />
          )}
        </div>
        <div className="flex items-center space-x-2">
           <p className="text-sm text-gray-600 hidden md:block">
            Defina os eventos que serão usados no gerador de código.
           </p>
           {isMainAccordionOpen ? <ChevronDownIcon className="h-6 w-6 text-gray-500" /> : <ChevronRightIcon className="h-6 w-6 text-gray-500" />}
        </div>
      </button>

      {isMainAccordionOpen && (
        <div className="px-6 md:px-8 pb-8 pt-4 border-t border-gray-200">
            <div className="space-y-4">
              {events.map((event) => (
                <div key={event.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg bg-white">
                  <div>
                      <h3 className="font-semibold text-gray-900">{event.name}</h3>
                      <p className="text-sm text-gray-600">{event.description || 'Sem descrição.'}</p>
                      <p className="mt-1 text-xs text-gray-400 font-mono">ID: {event.id}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                        onClick={() => setEditingEvent(event)}
                        disabled={isSubmitting}
                        className="p-2 text-gray-500 hover:text-gray-800 hover:bg-gray-100 rounded-md disabled:opacity-50"
                      >
                        <PencilIcon className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleRemoveEvent(event.id)}
                      disabled={isSubmitting}
                      className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-md disabled:opacity-50"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}

              {events.length === 0 && !editingEvent && (
                <div className="text-center py-8 px-4 border-2 border-dashed border-gray-200 rounded-lg">
                    <h3 className="text-base font-medium text-gray-800">Nenhum evento de conversão definido.</h3>
                    <p className="text-sm text-gray-500 mt-1">Comece adicionando seu primeiro evento.</p>
                </div>
              )}

              {editingEvent && (
                <EventForm 
                  event={editingEvent}
                  onSave={handleSaveEvent}
                  onCancel={() => setEditingEvent(null)}
                  isSaving={isSubmitting}
                />
              )}
            </div>

            <div className="mt-6 flex justify-between items-center">
              <div>
                <button
                  onClick={() => setEditingEvent({})}
                  disabled={!!editingEvent || isSubmitting}
                  className="inline-flex items-center px-4 py-2 text-sm font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:bg-indigo-300 disabled:cursor-not-allowed"
                >
                  <PlusIcon className="h-4 w-4 mr-2" />
                  Adicionar Evento
                </button>
              </div>
              
              {error && <p className="text-sm text-red-600">{error}</p>}
            </div>
          </div>
      )}
      <DeleteEventConfirmationModal
        isOpen={!!eventToDelete}
        onClose={() => setEventToDelete(null)}
        onConfirm={confirmRemoveEvent}
        eventName={eventToDelete?.name || ''}
        isDeleting={isSubmitting}
      />
    </div>
  );
} 