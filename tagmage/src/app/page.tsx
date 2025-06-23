import Link from 'next/link';
import React from 'react';
import Image from 'next/image';

// Componente para a logo principal do Tag Mage
const Logo = () => (
  <Link href="/" className="flex items-center space-x-2">
    <Image
      src="/logo-ai.svg"
      alt="Tag Mage AI Logo"
      width={140}
      height={35}
      className="w-auto h-auto"
      priority
    />
  </Link>
);

// Componente para ícones de funcionalidades
const FeatureIcon = ({ name, className }: { name: string; className?: string }) => {
  const icons: { [key: string]: React.ReactNode } = {
    check: <path d="M20 6 9 17l-5-5" />,
    clock: <><circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" /></>,
    server: <><rect width="20" height="8" x="2" y="2" rx="2" ry="2" /><rect width="20" height="8" x="2" y="14" rx="2" ry="2" /><path d="M6 6h.01" /><path d="M6 18h.01" /></>,
    box: <><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" /><path d="m3.3 7 8.7 5 8.7-5" /><path d="M12 22V12" /></>,
    dashboard: <><rect width="7" height="9" x="3" y="3" rx="1" /><rect width="7" height="5" x="14" y="3" rx="1" /><rect width="7" height="9" x="14" y="12" rx="1" /><rect width="7" height="5" x="3" y="16" rx="1" /></>,
    shield: <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />,
    bell: <><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" /><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" /></>,
    arrowRight: <><path d="M5 12h14" /><path d="m12 5 7 7-7 7" /></>,
    messageCircle: <><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></>,
    zap: <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />,
    brain: <><path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96.44 2.5 2.5 0 0 1-2.96-3.12 3 3 0 0 1-.34-5.58l.5-.9A2.5 2.5 0 0 1 9.5 2Z" /><path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96.44 2.5 2.5 0 0 0 2.96-3.12 3 3 0 0 0 .34-5.58l-.5-.9A2.5 2.5 0 0 0 14.5 2Z" /></>,
  };
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      {icons[name]}
    </svg>
  );
};

type PlatformName = 'google-ads' | 'meta-ads' | 'tiktok-ads' | 'linkedin-ads' | 'gtm' | 'google-analytics';

// Componente para logos das plataformas
const PlatformLogo = ({ name, className }: { name: PlatformName; className?: string }) => {
  const logos: Record<PlatformName, string> = {
    'google-ads': '/logos/google-ads.svg',
    'meta-ads': '/logos/meta-ads.svg',
    'tiktok-ads': '/logos/tiktok-ads.svg',
    'linkedin-ads': '/logos/linkedin-ads.svg',
    'gtm': '/logos/gtm.svg',
    'google-analytics': '/logos/google-analytics.svg'
  };

  return (
    <div className="relative group">
      <img
        src={logos[name]}
        alt={`${name} logo`}
        className={`${className} transition-all duration-300 group-hover:scale-110`}
      />
      <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap text-xs text-gray-600">
        {name.split('-').map((word: string) => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
      </div>
    </div>
  );
};

export default function LandingPageV2() {
  const features = [
    {
      icon: 'messageCircle',
      title: 'Conversa Natural',
      description: 'Descreva seus objetivos em linguagem simples. Nossa IA entende e configura tudo automaticamente.',
      gradient: 'from-blue-500 to-cyan-400'
    },
    {
      icon: 'brain',
      title: 'IA Especializada',
      description: 'Treinada com milhares de casos reais de tracking, nossa IA conhece as melhores práticas.',
      gradient: 'from-purple-500 to-pink-500'
    },
    {
      icon: 'zap',
      title: 'Setup Instantâneo',
      description: 'Em poucos minutos, receba um setup completo de tracking pronto para implementar.',
      gradient: 'from-orange-400 to-red-500'
    },
    {
      icon: 'shield',
      title: 'Validação Automática',
      description: 'A IA verifica se tudo está funcionando corretamente antes de entregar o projeto.',
      gradient: 'from-green-500 to-emerald-400'
    },
    {
      icon: 'dashboard',
      title: 'Gestão Inteligente',
      description: 'Monitore a saúde do tracking e receba alertas quando algo precisar de atenção.',
      gradient: 'from-indigo-500 to-blue-500'
    },
    {
      icon: 'server',
      title: 'Server-Side Pronto',
      description: 'Implementação automática de tracking server-side para máxima precisão e privacidade.',
      gradient: 'from-yellow-400 to-orange-500'
    },
  ];

  return (
    <div className="bg-white text-gray-900 antialiased overflow-x-hidden">
      {/* Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-purple-600/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-40 -left-40 w-60 h-60 bg-gradient-to-br from-pink-400/20 to-red-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute bottom-40 right-20 w-72 h-72 bg-gradient-to-br from-green-400/20 to-blue-500/20 rounded-full blur-3xl animate-pulse delay-2000"></div>
      </div>

      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-xl border-b border-gray-200/50">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <Logo />
          <nav className="hidden md:flex items-center space-x-6">
            <Link href="#features" className="text-sm font-medium text-gray-600 hover:text-indigo-600 transition-colors">
              Recursos
            </Link>
            <Link href="#pricing" className="text-sm font-medium text-gray-600 hover:text-indigo-600 transition-colors">
              Preços
            </Link>
          </nav>
          <div className='flex items-center space-x-2'>
            <Link href="/login" className="px-5 py-2.5 text-sm font-semibold text-gray-700 hover:text-indigo-600 transition-colors">
              Entrar
            </Link>
            <Link href="/signup" className="px-5 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-indigo-600 to-blue-600 rounded-lg hover:shadow-lg hover:shadow-indigo-500/40 transition-all duration-300">
              Começar Grátis
            </Link>
          </div>
        </div>
      </header>

      <main className="relative">
        {/* Hero Section */}
        <section className="pt-32 pb-24 relative">
          <div className="container mx-auto px-6 text-center relative z-10">
            <div className="inline-flex items-center px-4 py-2 text-sm font-semibold text-indigo-700 bg-gradient-to-r from-indigo-100 to-blue-100 rounded-full mb-8 border border-indigo-200/50 shadow-sm">
              <FeatureIcon name="brain" className="w-4 h-4 mr-2" />
              Revolução AI-First no Tracking
            </div>
            
            <h1 className="text-5xl md:text-7xl font-black mb-8 leading-tight">
              <span className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-700 bg-clip-text text-transparent">
                Converse com nossa IA.
              </span>
              <br />
              <span className="bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent">
                Receba seu tracking pronto.
              </span>
            </h1>
            
            <p className="max-w-4xl mx-auto text-xl md:text-2xl text-gray-600 mb-12 leading-relaxed">
              Esqueça os tutoriais e a complexidade técnica. Apenas descreva seus objetivos de negócio e nossa IA constrói e implementa o setup de tracking completo para você.
            </p>
            
            <div className="flex flex-col sm:flex-row justify-center items-center gap-4 mb-16">
              <Link href="/signup" className="flex items-center justify-center w-full sm:w-auto px-8 py-4 text-lg font-bold text-white bg-gradient-to-r from-indigo-600 to-blue-600 rounded-xl hover:shadow-2xl hover:shadow-indigo-500/40 hover:scale-105 transition-all duration-300">
                Começar Conversa com IA
                <FeatureIcon name="arrowRight" className="inline ml-2 h-5 w-5" />
              </Link>
            </div>

            {/* Platform Logos */}
            <div className="max-w-4xl mx-auto">
              <p className="text-sm font-medium text-gray-500 mb-8">Integração nativa com as principais plataformas</p>
              <div className="flex justify-center items-center gap-12 mb-12">
                <PlatformLogo name="google-ads" className="w-12 h-12" />
                <PlatformLogo name="meta-ads" className="w-12 h-12" />
                <PlatformLogo name="tiktok-ads" className="w-12 h-12" />
                <PlatformLogo name="linkedin-ads" className="w-12 h-12" />
                <PlatformLogo name="gtm" className="w-12 h-12" />
                <PlatformLogo name="google-analytics" className="w-12 h-12" />
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-24 relative bg-gray-50">
          <div className="container mx-auto px-6">
            <div className="text-center mb-20">
              <h2 className="text-4xl md:text-5xl font-bold mb-6">
                <span className="bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                  A experiência mais simples para
                </span>
                <br />
                <span className="bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent">
                  tracking profissional
                </span>
              </h2>
              <p className="max-w-3xl mx-auto text-xl text-gray-600 leading-relaxed">
                Não é mais necessário entender GTM, GA4 ou Meta Pixel. Nossa IA faz todo o trabalho técnico para você.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {features.map((feature, index) => (
                <div key={index} className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100">
                  <div className={`w-16 h-16 bg-gradient-to-r ${feature.gradient} rounded-2xl flex items-center justify-center mb-6 shadow-lg`}>
                    <FeatureIcon name={feature.icon} className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4">{feature.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="py-24 relative">
          <div className="container mx-auto px-6">
            <div className="text-center mb-20">
              <h2 className="text-4xl md:text-5xl font-bold mb-6">
                <span className="bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                  Como funciona
                </span>
              </h2>
              <p className="max-w-3xl mx-auto text-xl text-gray-600 leading-relaxed">
                Em apenas 3 passos simples, você terá um setup de tracking profissional
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              <div className="text-center">
                <div className="w-20 h-20 bg-gradient-to-r from-indigo-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                  <span className="text-2xl font-bold text-white">1</span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">Descreva seu negócio</h3>
                <p className="text-gray-600">Conte para nossa IA sobre seu site, objetivos e principais conversões</p>
              </div>
              
              <div className="text-center">
                <div className="w-20 h-20 bg-gradient-to-r from-purple-500 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                  <span className="text-2xl font-bold text-white">2</span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">IA analisa e configura</h3>
                <p className="text-gray-600">Nossa IA cria o setup completo de tracking baseado nas melhores práticas</p>
              </div>
              
              <div className="text-center">
                <div className="w-20 h-20 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                  <span className="text-2xl font-bold text-white">3</span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">Implemente e monitore</h3>
                <p className="text-gray-600">Receba o código pronto para implementar e monitore a saúde do tracking</p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-24 relative bg-gradient-to-r from-indigo-600 to-blue-600">
          <div className="container mx-auto px-6 text-center">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Pronto para revolucionar seu tracking?
            </h2>
            <p className="max-w-3xl mx-auto text-xl text-indigo-100 mb-12 leading-relaxed">
              Junte-se a centenas de profissionais que já estão economizando horas de trabalho técnico com nossa IA
            </p>
            <Link href="/signup" className="inline-flex items-center px-8 py-4 text-lg font-bold text-indigo-600 bg-white rounded-xl hover:shadow-2xl hover:scale-105 transition-all duration-300">
              Começar Agora - É Grátis
              <FeatureIcon name="arrowRight" className="ml-2 h-5 w-5" />
            </Link>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <Logo />
            <div className="flex items-center space-x-6 mt-4 md:mt-0">
              <Link href="/privacy" className="text-sm text-gray-400 hover:text-white transition-colors">
                Privacidade
              </Link>
              <Link href="/terms" className="text-sm text-gray-400 hover:text-white transition-colors">
                Termos
              </Link>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center">
            <p className="text-sm text-gray-400">
              © 2024 Tag Mage. Revolucionando o tracking com IA.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
