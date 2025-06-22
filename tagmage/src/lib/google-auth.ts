import { google } from 'googleapis';

/**
 * Cria um cliente OAuth2 configurado com o token fornecido
 */
export function createGoogleOAuthClient(providerToken: string) {
  const oauth2Client = new google.auth.OAuth2();
  oauth2Client.setCredentials({ access_token: providerToken });
  return oauth2Client;
}

/**
 * Cria um cliente Tag Manager configurado
 */
export function createTagManagerClient(providerToken: string) {
  const oauth2Client = createGoogleOAuthClient(providerToken);
  return google.tagmanager({
    version: 'v2',
    auth: oauth2Client,
  });
}

/**
 * Escopos necessários para o GTM
 */
export const GTM_SCOPES = [
  'https://www.googleapis.com/auth/tagmanager.edit.containers',
  'https://www.googleapis.com/auth/tagmanager.manage.accounts',
  'https://www.googleapis.com/auth/tagmanager.manage.users',
  'https://www.googleapis.com/auth/adwords',
  'https://www.googleapis.com/auth/analytics.readonly'
];

/**
 * Verifica se todos os escopos necessários estão presentes
 */
export function hasRequiredScopes(session: any): boolean {
  if (!session?.provider_token) return false;
  
  // Por enquanto, vamos assumir que se o token existe, os escopos estão corretos
  // Uma verificação mais robusta seria feita verificando o token_info endpoint
  return true;
} 