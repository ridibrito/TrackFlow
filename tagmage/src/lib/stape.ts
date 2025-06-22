// Integração com Stape.io para containers server-side
// Documentação: https://docs.stape.io/

export interface StapeContainer {
  id: string;
  name: string;
  domain: string;
  status: 'active' | 'inactive';
  created_at: string;
  updated_at: string;
}

export interface StapeTag {
  id: string;
  name: string;
  type: 'gtag' | 'fbq' | 'tiktok' | 'linkedin' | 'custom';
  config: any;
  triggers: string[];
  status: 'active' | 'inactive';
}

export interface StapeTrigger {
  id: string;
  name: string;
  type: 'page_view' | 'click' | 'custom_event' | 'form_submit';
  conditions: any[];
}

export interface StapeVariable {
  id: string;
  name: string;
  type: 'constant' | 'data_layer' | 'custom';
  value: string;
}

export interface StapeProject {
  id: string;
  name: string;
  domain: string;
  containers: StapeContainer[];
  tags: StapeTag[];
  triggers: StapeTrigger[];
  variables: StapeVariable[];
}

class StapeAPI {
  private apiKey: string;
  private baseUrl = 'https://api.stape.io/v1';

  constructor() {
    // Usar API Key da empresa (TagMage) - não exposta ao usuário
    this.apiKey = process.env.STAPE_API_KEY || '';
    
    if (!this.apiKey) {
      throw new Error('STAPE_API_KEY não configurada no ambiente');
    }
  }

  private async request(endpoint: string, options: RequestInit = {}) {
    const url = `${this.baseUrl}${endpoint}`;
    
    const response = await fetch(url, {
      ...options,
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || `Stape API error: ${response.status}`);
    }

    return response.json();
  }

  // ===== CONTAINERS =====
  
  /**
   * Lista todos os containers do usuário
   */
  async listContainers(): Promise<StapeContainer[]> {
    return this.request('/containers');
  }

  /**
   * Cria um novo container server-side
   */
  async createContainer(data: {
    name: string;
    domain: string;
    description?: string;
    customDomain?: string; // Domínio próprio opcional
  }): Promise<StapeContainer> {
    return this.request('/containers', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  /**
   * Obtém detalhes de um container específico
   */
  async getContainer(containerId: string): Promise<StapeContainer> {
    return this.request(`/containers/${containerId}`);
  }

  /**
   * Atualiza um container existente
   */
  async updateContainer(containerId: string, data: Partial<StapeContainer>): Promise<StapeContainer> {
    return this.request(`/containers/${containerId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  /**
   * Remove um container
   */
  async deleteContainer(containerId: string): Promise<void> {
    return this.request(`/containers/${containerId}`, {
      method: 'DELETE',
    });
  }

  /**
   * Configura domínio próprio para um container
   */
  async configureCustomDomain(containerId: string, customDomain: string): Promise<{ domain: string; status: string }> {
    return this.request(`/containers/${containerId}/custom-domain`, {
      method: 'POST',
      body: JSON.stringify({ domain: customDomain }),
    });
  }

  /**
   * Verifica status de um domínio próprio
   */
  async checkCustomDomainStatus(containerId: string): Promise<{ domain: string; status: 'pending' | 'active' | 'failed'; message?: string }> {
    return this.request(`/containers/${containerId}/custom-domain/status`);
  }

  // ===== TAGS =====

  /**
   * Lista todas as tags de um container
   */
  async listTags(containerId: string): Promise<StapeTag[]> {
    return this.request(`/containers/${containerId}/tags`);
  }

  /**
   * Cria uma nova tag
   */
  async createTag(containerId: string, data: {
    name: string;
    type: StapeTag['type'];
    config: any;
    triggers: string[];
  }): Promise<StapeTag> {
    return this.request(`/containers/${containerId}/tags`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  /**
   * Atualiza uma tag existente
   */
  async updateTag(containerId: string, tagId: string, data: Partial<StapeTag>): Promise<StapeTag> {
    return this.request(`/containers/${containerId}/tags/${tagId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  /**
   * Remove uma tag
   */
  async deleteTag(containerId: string, tagId: string): Promise<void> {
    return this.request(`/containers/${containerId}/tags/${tagId}`, {
      method: 'DELETE',
    });
  }

  // ===== TRIGGERS =====

  /**
   * Lista todos os triggers de um container
   */
  async listTriggers(containerId: string): Promise<StapeTrigger[]> {
    return this.request(`/containers/${containerId}/triggers`);
  }

  /**
   * Cria um novo trigger
   */
  async createTrigger(containerId: string, data: {
    name: string;
    type: StapeTrigger['type'];
    conditions: any[];
  }): Promise<StapeTrigger> {
    return this.request(`/containers/${containerId}/triggers`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // ===== VARIABLES =====

  /**
   * Lista todas as variáveis de um container
   */
  async listVariables(containerId: string): Promise<StapeVariable[]> {
    return this.request(`/containers/${containerId}/variables`);
  }

  /**
   * Cria uma nova variável
   */
  async createVariable(containerId: string, data: {
    name: string;
    type: StapeVariable['type'];
    value: string;
  }): Promise<StapeVariable> {
    return this.request(`/containers/${containerId}/variables`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // ===== PUBLICAÇÃO =====

  /**
   * Publica as mudanças de um container
   */
  async publishContainer(containerId: string): Promise<{ version: string; published_at: string }> {
    return this.request(`/containers/${containerId}/publish`, {
      method: 'POST',
    });
  }

  // ===== TEMPLATES PRÉ-CONFIGURADOS =====

  /**
   * Configura tags para Google Analytics 4
   */
  async configureGA4(containerId: string, measurementId: string): Promise<StapeTag> {
    // Criar trigger para todas as páginas
    const pageViewTrigger = await this.createTrigger(containerId, {
      name: 'All Pages',
      type: 'page_view',
      conditions: [],
    });

    // Criar variável para o Measurement ID
    const measurementIdVar = await this.createVariable(containerId, {
      name: 'GA4 Measurement ID',
      type: 'constant',
      value: measurementId,
    });

    // Criar tag GA4
    return this.createTag(containerId, {
      name: 'Google Analytics 4 - Page View',
      type: 'gtag',
      config: {
        measurement_id: `{{${measurementIdVar.name}}}`,
        event_name: 'page_view',
        parameters: {},
      },
      triggers: [pageViewTrigger.id],
    });
  }

  /**
   * Configura tags para Meta Pixel
   */
  async configureMetaPixel(containerId: string, pixelId: string): Promise<StapeTag> {
    // Criar trigger para todas as páginas
    const pageViewTrigger = await this.createTrigger(containerId, {
      name: 'All Pages',
      type: 'page_view',
      conditions: [],
    });

    // Criar variável para o Pixel ID
    const pixelIdVar = await this.createVariable(containerId, {
      name: 'Meta Pixel ID',
      type: 'constant',
      value: pixelId,
    });

    // Criar tag Meta Pixel
    return this.createTag(containerId, {
      name: 'Meta Pixel - Page View',
      type: 'fbq',
      config: {
        pixel_id: `{{${pixelIdVar.name}}}`,
        event_name: 'PageView',
        parameters: {},
      },
      triggers: [pageViewTrigger.id],
    });
  }

  /**
   * Configura tags para Google Ads
   */
  async configureGoogleAds(containerId: string, conversionId: string, conversionLabel: string): Promise<StapeTag> {
    // Criar trigger para todas as páginas
    const pageViewTrigger = await this.createTrigger(containerId, {
      name: 'All Pages',
      type: 'page_view',
      conditions: [],
    });

    // Criar variáveis
    const conversionIdVar = await this.createVariable(containerId, {
      name: 'Google Ads Conversion ID',
      type: 'constant',
      value: conversionId,
    });

    const conversionLabelVar = await this.createVariable(containerId, {
      name: 'Google Ads Conversion Label',
      type: 'constant',
      value: conversionLabel,
    });

    // Criar tag Google Ads
    return this.createTag(containerId, {
      name: 'Google Ads - Conversion Tracking',
      type: 'gtag',
      config: {
        conversion_id: `{{${conversionIdVar.name}}}`,
        conversion_label: `{{${conversionLabelVar.name}}}`,
        event_name: 'page_view',
        parameters: {},
      },
      triggers: [pageViewTrigger.id],
    });
  }

  /**
   * Configura tags para TikTok Pixel
   */
  async configureTikTokPixel(containerId: string, pixelId: string): Promise<StapeTag> {
    // Criar trigger para todas as páginas
    const pageViewTrigger = await this.createTrigger(containerId, {
      name: 'All Pages',
      type: 'page_view',
      conditions: [],
    });

    // Criar variável para o Pixel ID
    const pixelIdVar = await this.createVariable(containerId, {
      name: 'TikTok Pixel ID',
      type: 'constant',
      value: pixelId,
    });

    // Criar tag TikTok Pixel
    return this.createTag(containerId, {
      name: 'TikTok Pixel - Page View',
      type: 'tiktok',
      config: {
        pixel_id: `{{${pixelIdVar.name}}}`,
        event_name: 'PageView',
        parameters: {},
      },
      triggers: [pageViewTrigger.id],
    });
  }

  /**
   * Configura tags para LinkedIn Insight Tag
   */
  async configureLinkedInInsight(containerId: string, partnerId: string): Promise<StapeTag> {
    // Criar trigger para todas as páginas
    const pageViewTrigger = await this.createTrigger(containerId, {
      name: 'All Pages',
      type: 'page_view',
      conditions: [],
    });

    // Criar variável para o Partner ID
    const partnerIdVar = await this.createVariable(containerId, {
      name: 'LinkedIn Partner ID',
      type: 'constant',
      value: partnerId,
    });

    // Criar tag LinkedIn Insight
    return this.createTag(containerId, {
      name: 'LinkedIn Insight Tag - Page View',
      type: 'linkedin',
      config: {
        partner_id: `{{${partnerIdVar.name}}}`,
        event_name: 'PageView',
        parameters: {},
      },
      triggers: [pageViewTrigger.id],
    });
  }

  /**
   * Configura evento de conversão customizado
   */
  async configureConversionEvent(
    containerId: string,
    eventName: string,
    eventConfig: any,
    triggerType: 'click' | 'form_submit' | 'custom_event' = 'custom_event'
  ): Promise<{ trigger: StapeTrigger; tag: StapeTag }> {
    // Criar trigger para o evento
    const trigger = await this.createTrigger(containerId, {
      name: `${eventName} Trigger`,
      type: triggerType,
      conditions: eventConfig.conditions || [],
    });

    // Criar tag para o evento
    const tag = await this.createTag(containerId, {
      name: `${eventName} - Conversion Tracking`,
      type: 'gtag',
      config: {
        event_name: eventName,
        parameters: eventConfig.parameters || {},
      },
      triggers: [trigger.id],
    });

    return { trigger, tag };
  }
}

// Função helper para criar instância da API (sem necessidade de API Key do usuário)
export function createStapeAPI(): StapeAPI {
  return new StapeAPI();
}

// Configurações padrão para diferentes tipos de negócio
export const BUSINESS_TYPE_CONFIGS = {
  ecommerce: {
    conversionEvents: [
      { name: 'purchase', description: 'Compra realizada' },
      { name: 'add_to_cart', description: 'Produto adicionado ao carrinho' },
      { name: 'view_item', description: 'Visualização de produto' },
      { name: 'begin_checkout', description: 'Início do checkout' },
    ],
  },
  lead_generation: {
    conversionEvents: [
      { name: 'lead', description: 'Lead gerado' },
      { name: 'form_submit', description: 'Formulário enviado' },
      { name: 'phone_call', description: 'Ligação realizada' },
      { name: 'whatsapp_click', description: 'Clique no WhatsApp' },
    ],
  },
  service: {
    conversionEvents: [
      { name: 'booking', description: 'Agendamento realizado' },
      { name: 'contact', description: 'Contato realizado' },
      { name: 'quote_request', description: 'Solicitação de orçamento' },
    ],
  },
}; 