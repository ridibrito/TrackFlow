-- =================================================================
-- MIGRATION SCRIPT: Integração com Stape.io
-- Execute este script no seu editor de SQL do Supabase.
-- =================================================================

-- Adicionar colunas para integração com Stape.io
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS stape_container_id TEXT;
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS stape_domain TEXT;
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS stape_api_key TEXT;

-- Adicionar colunas que podem estar faltando para outras plataformas
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS ga4_measurement_id TEXT;
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS meta_ads_id TEXT;
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS tiktok_ads_id TEXT;
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS linkedin_ads_id TEXT;

-- Adicionar comentários para documentar as novas colunas
COMMENT ON COLUMN public.projects.stape_container_id IS 'ID do container server-side no Stape.io';
COMMENT ON COLUMN public.projects.stape_domain IS 'Domínio configurado no container Stape.io';
COMMENT ON COLUMN public.projects.stape_api_key IS 'API Key do Stape.io (criptografada)';

-- Confirmação
-- Após executar, esta consulta deve mostrar as novas colunas.
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM 
    information_schema.columns
WHERE 
    table_name = 'projects' 
    AND column_name IN (
        'stape_container_id', 
        'stape_domain', 
        'stape_api_key',
        'ga4_measurement_id',
        'meta_ads_id',
        'tiktok_ads_id',
        'linkedin_ads_id'
    )
ORDER BY column_name;

-- =================================================================
-- NOTA: Execute este script no SQL Editor do seu painel Supabase.
-- Após executar, a integração com Stape.io estará disponível.
-- ================================================================= 