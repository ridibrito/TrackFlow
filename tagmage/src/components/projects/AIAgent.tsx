'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Project, updateProject } from '@/lib/supabase/projects';
import { useAuth } from '@/contexts/AuthContext';
import { ChatBubbleLeftRightIcon, PaperAirplaneIcon } from '@heroicons/react/24/outline';
import { Button } from '@components/ui/Button';
import Image from 'next/image';

interface Message {
  id: string;
  type: 'ai' | 'user' | 'bot';
  content: string;
  timestamp: Date;
  render?: () => React.ReactNode;
  actions?: Action[];
  showInput?: boolean;
}

interface Action {
  id: string;
  label: string;
  action: () => void;
  variant?: 'primary' | 'secondary';
  icon?: string;
}

interface AIAgentProps {
  project: Project;
  onComplete: () => void;
}

const AIAgent = ({ project, onComplete }: AIAgentProps) => {
  const { session, signInWithGooglePopup } = useAuth();
  const [messages, setMessages] = useState<any[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Mensagem inicial do assistente
    setMessages([
      {
        type: 'bot',
        content: `Olá! Sou o assistente da TagMage. O próximo passo é conectar sua conta do Google Ads para automatizar a criação de ações de conversão.`,
        actions: [
          {
            id: 'connect_google_ads',
            label: 'Conectar com Google Ads',
            action: connectGoogleAds,
            variant: 'outline',
            icon: '/logos/google-ads.svg',
          },
        ],
      },
    ]);
  }, [project]);

  const connectGoogleAds = async () => {
    addMessage({ type: 'user', content: 'Conectar com Google Ads' });
    await simulateTyping('Vou abrir um popup para você autorizar o acesso à sua conta do Google Ads...');

    try {
      const { error } = await signInWithGooglePopup(['https://www.googleapis.com/auth/adwords']);
      if (error) {
        throw new Error(`Authentication failed: ${error.message}`);
      }
      await simulateTyping(
        '✅ Conta conectada! Agora, por favor, insira o ID de Cliente do seu Google Ads (ex: 123-456-7890).',
        [],
        true
      );
    } catch (err: any) {
      await simulateTyping(`❌ Ops! Algo deu errado: ${err.message}`);
    }
  };
  
  const handleUserInput = async (input: string) => {
    addMessage({ type: 'user', content: input });
    await simulateTyping(`Ok, estou usando o ID: ${input}. Vou criar as ações de conversão recomendadas. Isso pode levar um momento...`);

    // Logic to create conversions via API
    // ...
    
    await simulateTyping(`✅ Ações de conversão criadas com sucesso no Google Ads!`);
    onComplete();
  };

  const addMessage = (message: any) => {
    setMessages(prev => [...prev.filter(m => !m.showInput), message]);
  };
  
  const simulateTyping = async (text: string, actions: any[] = [], showInput = false) => {
    setIsTyping(true);
    await new Promise(resolve => setTimeout(resolve, 600)); // Simulate delay
    addMessage({ type: 'bot', content: text, actions, showInput });
    setIsTyping(false);
  };
  
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="p-4 border-b">
        <h3 className="text-lg font-semibold text-gray-900">Assistente IA - Tag Mage</h3>
        <p className="text-sm text-gray-600">Configurando rastreamento para {project.name}</p>
      </div>
      <div className="p-4 h-96 overflow-y-auto space-y-4">
        {messages.map((msg, index) => (
          <Message key={index} message={msg} onAction={msg.action} onUserInput={handleUserInput} />
        ))}
        {isTyping && <TypingIndicator />}
        <div ref={messagesEndRef} />
      </div>
    </div>
  );
};

const Message = ({ message, onAction, onUserInput }: { message: any; onAction: any; onUserInput: (text: string) => void }) => {
  const [inputValue, setInputValue] = useState('');

  const handleSend = () => {
    if (inputValue.trim()) {
      onUserInput(inputValue);
      setInputValue('');
    }
  };

  return (
    <div className={`flex ${message.type === 'bot' ? 'justify-start' : 'justify-end'}`}>
      <div
        className={`p-3 rounded-lg max-w-lg ${
          message.type === 'bot'
            ? 'bg-gray-100 text-gray-800'
            : 'bg-blue-600 text-white'
        }`}
      >
        <p className="whitespace-pre-wrap">{message.content}</p>
        {message.actions && (
          <div className="mt-3 flex flex-wrap gap-2">
            {message.actions.map((action: any) => (
              <Button key={action.id} onClick={action.action} variant={action.variant || 'secondary'} size="sm" className="inline-flex items-center gap-2">
                {action.icon && <Image src={action.icon} alt="" width={16} height={16} />}
                <span>{action.label}</span>
              </Button>
            ))}
          </div>
        )}
        {message.showInput && (
          <div className="mt-3 flex gap-2">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              className="flex-grow p-2 border rounded-md"
              placeholder="Digite o ID do cliente aqui..."
            />
            <Button onClick={handleSend} size="sm">Enviar</Button>
          </div>
        )}
      </div>
    </div>
  );
};

const TypingIndicator = () => (
    <div className="flex justify-start">
        <div className="bg-gray-100 rounded-lg p-3 inline-flex items-center">
            <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce mr-1"></div>
            <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce delay-75 mr-1"></div>
            <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce delay-150"></div>
        </div>
    </div>
);

export default AIAgent; 