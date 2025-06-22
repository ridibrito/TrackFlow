import axios from 'axios';

// Mapeamento de nomes de tags para suas expressões regulares
const tagPatterns: { [key: string]: RegExp[] } = {
  'Google Tag Manager': [/gtm\.js/, /googletagmanager\.com\/gtm\.js/],
  'Google Analytics (GA4)': [/googletagmanager\.com\/gtag\/js\?id=G-/, /gtag\('config', 'G-/],
  'Google Ads': [/googletagmanager\.com\/gtag\/js\?id=AW-/, /gtag\('config', 'AW-/],
  'Meta Pixel (Facebook)': [/connect\.facebook\.net\/en_US\/fbevents\.js/, /fbq\('init'/],
  'TikTok Pixel': [/analytics\.tiktok\.com\/gtm\/tiktok-pixel\.js/, /ttq\.init/],
  'LinkedIn Insight Tag': [/snap\.licdn\.com\/li\.lms-analytics\/insight\.min\.js/],
};

/**
 * Escaneia o conteúdo HTML de uma URL para encontrar tags de tracking conhecidas.
 * @param url A URL do site a ser escaneado.
 * @returns Uma lista de nomes de tags encontradas.
 */
export const scanForTags = async (url: string): Promise<string[]> => {
  const foundTags: Set<string> = new Set();
  
  try {
    // Garante que a URL tenha um protocolo
    const fullUrl = url.startsWith('http') ? url : `https://\${url}`;
    
    const response = await axios.get(fullUrl, {
      headers: {
        // Simula um navegador comum para evitar bloqueios simples
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      }
    });

    const htmlContent = response.data;

    // Itera sobre cada tipo de tag e seus padrões
    for (const tagName in tagPatterns) {
      for (const pattern of tagPatterns[tagName]) {
        if (pattern.test(htmlContent)) {
          foundTags.add(tagName);
          break; // Vai para a próxima tag assim que um dos padrões for encontrado
        }
      }
    }

    return Array.from(foundTags);
  } catch (error) {
    console.error(`Erro ao escanear a URL \${url}:`, error instanceof Error ? error.message : error);
    // Retorna um array vazio em caso de erro para não quebrar o fluxo
    return [];
  }
}; 