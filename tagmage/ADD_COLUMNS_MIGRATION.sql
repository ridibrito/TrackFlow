-- =================================================================
-- MIGRATION SCRIPT: Adicionar colunas de rastreamento à tabela 'projects'
-- =================================================================
-- Este script adiciona as colunas necessárias para armazenar os IDs 
-- do Meta Pixel e do Google Analytics 4.

-- Adicionar a coluna para o Meta Pixel ID
-- Utiliza 'IF NOT EXISTS' para evitar erros caso a coluna já tenha sido criada manualmente.
ALTER TABLE public.projects
ADD COLUMN IF NOT EXISTS meta_pixel_id TEXT;

-- Adicionar a coluna para o GA4 Measurement ID
ALTER TABLE public.projects
ADD COLUMN IF NOT EXISTS ga4_measurement_id TEXT;

-- Adicionar a coluna para a URL do logo do cliente
ALTER TABLE public.projects
ADD COLUMN IF NOT EXISTS client_logo_url TEXT;

-- Confirmação
-- Após executar, esta consulta deve retornar as 3 colunas que acabamos de adicionar.
SELECT 
    column_name, 
    data_type, 
    is_nullable
FROM 
    information_schema.columns
WHERE 
    table_name = 'projects' 
    AND column_name IN ('meta_pixel_id', 'ga4_measurement_id', 'client_logo_url');

-- NOTA: Após executar este script, o Supabase geralmente atualiza o cache do esquema
-- automaticamente. Se o erro persistir, pode ser útil recarregar o esquema manualmente
-- indo em API Docs -> e clicando no botão para recarregar.
-- ================================================================= 