'use client';

import React, { useState, useRef, useEffect } from 'react';

// Componente para ícones
const Icon = ({ name, className }: { name: string; className?: string }) => {
    const icons: { [key: string]: React.ReactNode } = {
        send: <path d="M22 2 11 13H2l9 9 9-22z" />,
        user: <><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></>,
        bot: <><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" /><path d="M19 10v2a7 7 0 0 1-14 0v-2" /><line x1="12" y1="19" x2="12" y2="23" /><line x1="8" y1="23" x2="16" y2="23" /></>,
        loading: (
            <>
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" opacity="0.25" />
                <path d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" fill="currentColor" />
            </>
        ),
        sparkles: <><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" /><path d="M5 3v4" /><path d="M19 17v4" /><path d="M3 5h4" /><path d="M17 19h4" /></>,
    };
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
            {icons[name]}
        </svg>
    );
};

// Componente para mensagens do usuário
const UserMessage = ({ text }: { text: string }) => (
    <div className="flex justify-end mb-6">
        <div className="flex items-start space-x-3 max-w-2xl">
            <div className="bg-indigo-600 text-white rounded-2xl rounded-br-md py-3 px-4 shadow-lg">
                <p className="text-sm leading-relaxed">{text}</p>
            </div>
            <div className="w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center flex-shrink-0">
                <Icon name="user" className="w-4 h-4 text-white" />
            </div>
        </div>
    </div>
);

// Componente para mensagens da IA
const AIMessage = ({ text, isLoading = false }: { text: string; isLoading?: boolean }) => (
    <div className="flex justify-start mb-6">
        <div className="flex items-start space-x-3 max-w-2xl">
            <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-600 rounded-full flex items-center justify-center flex-shrink-0">
                {isLoading ? (
                    <Icon name="loading" className="w-4 h-4 text-white animate-spin" />
                ) : (
                    <Icon name="bot" className="w-4 h-4 text-white" />
                )}
            </div>
            <div className="bg-white border border-gray-200 rounded-2xl rounded-bl-md py-3 px-4 shadow-lg">
                <p className="text-sm text-gray-900 leading-relaxed whitespace-pre-wrap">{text}</p>
            </div>
        </div>
    </div>
);

// Componente para sugestões rápidas
const QuickSuggestions = ({ suggestions, onSelect }: { suggestions: string[]; onSelect: (suggestion: string) => void }) => (
    <div className="flex flex-wrap gap-2 mb-6">
        {suggestions.map((suggestion, index) => (
            <button
                key={index}
                onClick={() => onSelect(suggestion)}
                className="px-4 py-2 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full transition-colors duration-200"
            >
                {suggestion}
            </button>
        ))}
    </div>
);

// Componente para status do Gemini
const GeminiStatus = ({ isConnected }: { isConnected: boolean }) => (
    <div className="flex items-center space-x-2 text-xs">
        <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
        <span className={isConnected ? 'text-green-600' : 'text-red-600'}>
            {isConnected ? 'Gemini Conectado' : 'Gemini Desconectado'}
        </span>
    </div>
);

export default function ChatPage() {
    const [messages, setMessages] = useState([
        { 
            from: 'ai', 
            text: 'Olá! Sou seu especialista em tracking com IA. Para começarmos, sobre o que é o site deste projeto?',
            id: '1'
        }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isGeminiConnected, setIsGeminiConnected] = useState(false);
    const messagesEndRef = useRef<null | HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const quickSuggestions = [
        "É um e-commerce",
        "É um site institucional",
        "É uma landing page",
        "É um blog",
        "É um SaaS"
    ];

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    useEffect(() => {
        // Focar no input quando a página carrega
        inputRef.current?.focus();
        
        // Verificar se o Gemini está conectado
        checkGeminiConnection();
    }, []);

    const checkGeminiConnection = async () => {
        try {
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ messages: [{ text: 'test' }] })
            });
            setIsGeminiConnected(response.ok);
        } catch (error) {
            setIsGeminiConnected(false);
        }
    };

    const handleSendMessage = async (messageText: string) => {
        if (!messageText.trim()) return;

        const userMessageId = Date.now().toString();
        const newMessages = [...messages, { from: 'user', text: messageText, id: userMessageId }];
        setMessages(newMessages);
        setInput('');
        setIsLoading(true);

        try {
            // Chamada para a API do backend
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ messages: newMessages })
            });
            
            if (!response.ok) {
                throw new Error('Erro na resposta da API');
            }
            
            const data = await response.json();
            
            setMessages(prev => [...prev, { 
                from: 'ai', 
                text: data.reply, 
                id: (Date.now() + 1).toString() 
            }]);
            
            setIsGeminiConnected(true);
        } catch (error) {
            console.error('Erro ao enviar mensagem:', error);
            setMessages(prev => [...prev, { 
                from: 'ai', 
                text: 'Desculpe, ocorreu um erro ao processar sua mensagem. Verifique se a chave da API do Gemini está configurada corretamente.', 
                id: (Date.now() + 1).toString() 
            }]);
            setIsGeminiConnected(false);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        handleSendMessage(input);
    };

    const handleSuggestionClick = (suggestion: string) => {
        handleSendMessage(suggestion);
    };

    return (
        <div className="flex flex-col h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white border-b border-gray-200 px-6 py-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-600 rounded-full flex items-center justify-center">
                            <Icon name="bot" className="w-4 h-4 text-white" />
                        </div>
                        <div>
                            <h1 className="text-lg font-semibold text-gray-900">Assistente de Tracking IA</h1>
                            <p className="text-sm text-gray-600">Powered by Google Gemini</p>
                        </div>
                    </div>
                    <GeminiStatus isConnected={isGeminiConnected} />
                </div>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 p-6 overflow-y-auto">
                <div className="max-w-4xl mx-auto">
                    {messages.map((msg) => (
                        msg.from === 'ai' 
                            ? <AIMessage key={msg.id} text={msg.text} />
                            : <UserMessage key={msg.id} text={msg.text} />
                    ))}
                    
                    {isLoading && (
                        <AIMessage text="Analisando suas informações com IA..." isLoading={true} />
                    )}
                    
                    <div ref={messagesEndRef} />
                </div>
            </div>

            {/* Quick Suggestions */}
            {messages.length === 1 && !isLoading && (
                <div className="px-6 pb-4">
                    <div className="max-w-4xl mx-auto">
                        <p className="text-sm text-gray-600 mb-3">Sugestões rápidas:</p>
                        <QuickSuggestions suggestions={quickSuggestions} onSelect={handleSuggestionClick} />
                    </div>
                </div>
            )}

            {/* Input Form */}
            <div className="bg-white border-t border-gray-200 p-6">
                <div className="max-w-4xl mx-auto">
                    <form onSubmit={handleSubmit} className="flex items-end space-x-4">
                        <div className="flex-1">
                            <input
                                ref={inputRef}
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder="Descreva seu objetivo aqui... (ex: 'É um e-commerce de roupas')"
                                className="w-full py-3 px-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 resize-none placeholder-gray-500 text-gray-900"
                                disabled={isLoading}
                            />
                        </div>
                        <button 
                            type="submit" 
                            disabled={!input.trim() || isLoading}
                            className="bg-indigo-600 text-white p-3 rounded-xl hover:bg-indigo-700 transition-colors shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <Icon name="send" className="h-5 w-5" />
                        </button>
                    </form>
                    <div className="flex items-center justify-between mt-2">
                        <p className="text-xs text-gray-600">
                            Pressione Enter para enviar • A IA analisará suas informações e criará um setup personalizado
                        </p>
                        <div className="flex items-center space-x-1 text-xs text-gray-500">
                            <Icon name="sparkles" className="w-3 h-3" />
                            <span>Powered by Gemini</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
} 
