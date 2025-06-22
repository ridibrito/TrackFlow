export interface EventTemplate {
  id: string;
  name: string;
  type: 'page_view' | 'click' | 'form_submit' | 'purchase' | 'lead' | 'custom';
  selector?: string;
  value?: number;
  enabled: boolean;
}

export interface ConversionTemplate {
  id: string;
  name: string;
  description: string;
  events: EventTemplate[];
}

export const eventTemplates: ConversionTemplate[] = [
  {
    id: 'ecommerce',
    name: 'E-commerce',
    description: 'Eventos essenciais para lojas virtuais, focados no funil de compra.',
    events: [
      { id: 'page_view', name: 'Visualização de Página', type: 'page_view', enabled: true },
      { id: 'view_item', name: 'Ver Produto', type: 'custom', selector: '.product-view', enabled: true },
      { id: 'add_to_cart', name: 'Adicionar ao Carrinho', type: 'custom', selector: '.add-to-cart-btn', enabled: true },
      { id: 'begin_checkout', name: 'Iniciar Checkout', type: 'custom', selector: '.checkout-btn', enabled: true },
      { id: 'purchase', name: 'Compra Realizada', type: 'purchase', value: 0, enabled: true },
    ]
  },
  {
    id: 'lead_gen',
    name: 'Geração de Leads',
    description: 'Eventos para otimizar a captura de contatos em sites e landing pages.',
    events: [
      { id: 'page_view', name: 'Visualização de Página', type: 'page_view', enabled: true },
      { id: 'form_submit', name: 'Envio de Formulário de Contato', type: 'form_submit', selector: 'form[name="contact"]', enabled: true },
      { id: 'lead', name: 'Lead (Newsletter)', type: 'lead', selector: 'form[name="newsletter"]', enabled: true },
      { id: 'whatsapp_click', name: 'Clique no WhatsApp', type: 'click', selector: 'a[href*="wa.me"]', enabled: true },
    ]
  },
  {
    id: 'saas',
    name: 'SaaS',
    description: 'Eventos para rastrear o engajamento e as conversões em plataformas SaaS.',
    events: [
      { id: 'page_view', name: 'Visualização de Página', type: 'page_view', enabled: true },
      { id: 'sign_up', name: 'Cadastro na Plataforma', type: 'custom', selector: '.signup-btn', enabled: true },
      { id: 'login', name: 'Login de Usuário', type: 'custom', selector: '.login-btn', enabled: true },
      { id: 'trial_start', name: 'Início de Trial', type: 'lead', selector: '.start-trial-btn', enabled: true },
      { id: 'subscription', name: 'Assinatura Paga', type: 'purchase', value: 0, enabled: true },
    ]
  },
]; 