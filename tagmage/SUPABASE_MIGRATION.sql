-- =================================================================
-- MIGRATION SCRIPT v2 - ATUALIZAÇÃO DE PERMISSÕES E COLUNAS
-- Execute este script no seu editor de SQL do Supabase.
-- =================================================================

-- Adicionar colunas faltantes, caso não existam
-- O ALTER TABLE irá falhar graciosamente se as colunas já existirem.
-- Você pode executar apenas as partes que faltam.

ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS gtm_id text;
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS google_ads_id text;
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS meta_ads_id text;
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS tiktok_ads_id text;
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS linkedin_ads_id text;
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS conversion_events text;
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS client_logo_url text;


-- =================================================================
-- ATUALIZAÇÃO DAS POLÍTICAS DE ROW LEVEL SECURITY (RLS)
-- Esta é a parte mais importante para corrigir os erros de salvamento.
-- =================================================================

-- 1. Remove a política de UPDATE antiga para recriá-la
DROP POLICY IF EXISTS "Allow individual update access" ON public.projects;

-- 2. Cria a nova política de UPDATE permitindo a modificação de TODAS as colunas
CREATE POLICY "Allow individual update access"
ON public.projects
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Confirmação: As políticas de SELECT, INSERT e DELETE não precisam de mudança,
-- pois elas geralmente se aplicam à linha inteira e não a colunas específicas.
-- A política de UPDATE é a que mais comumente causa problemas ao se adicionar colunas.

-- Fim do script.
-- Após executar, a funcionalidade de salvar deve funcionar corretamente. 