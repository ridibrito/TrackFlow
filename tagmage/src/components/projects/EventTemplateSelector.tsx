'use client';

import { eventTemplates, EventTemplate } from "@/lib/templates/conversion_events";
import { BookOpenIcon, SparklesIcon } from '@heroicons/react/24/outline';

interface EventTemplateSelectorProps {
  onSelectTemplate: (events: EventTemplate[]) => void;
}

export default function EventTemplateSelector({ onSelectTemplate }: EventTemplateSelectorProps) {
  return (
    <div className="mb-8">
      <div className="flex items-center space-x-2 mb-4">
        <SparklesIcon className="h-6 w-6 text-indigo-600" />
        <h3 className="text-lg font-bold text-gray-800">Usar um Template</h3>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {eventTemplates.map((template) => (
          <div key={template.id} className="border border-gray-200 rounded-lg p-4 flex flex-col justify-between hover:border-indigo-500 hover:shadow-sm transition-all">
            <div>
              <h4 className="font-bold text-gray-900">{template.name}</h4>
              <p className="text-sm text-gray-600 mt-1">{template.description}</p>
            </div>
            <button
              onClick={() => onSelectTemplate(template.events)}
              className="mt-4 w-full flex items-center justify-center px-3 py-2 text-sm font-semibold text-indigo-700 bg-indigo-100 rounded-lg hover:bg-indigo-200"
            >
              <BookOpenIcon className="h-4 w-4 mr-2" />
              Usar este template
            </button>
          </div>
        ))}
      </div>
    </div>
  );
} 