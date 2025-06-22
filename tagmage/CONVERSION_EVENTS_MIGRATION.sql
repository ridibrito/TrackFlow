-- =================================================================
-- MIGRATION SCRIPT: Adicionar coluna de eventos de conversão
-- =================================================================
-- Este script adiciona uma coluna JSONB para armazenar uma lista
-- de eventos de conversão para cada projeto.

-- Adicionar a coluna 'conversion_events' do tipo JSONB.
-- O valor padrão é um array JSON vazio '[]'.
ALTER TABLE public.projects
ADD COLUMN IF NOT EXISTS conversion_events JSONB DEFAULT '[]'::jsonb;

-- Confirmação
-- Após executar, esta consulta deve mostrar a nova coluna.
SELECT 
    column_name, 
    data_type,
    column_default,
    is_nullable
FROM 
    information_schema.columns
WHERE 
    table_name = 'projects' 
    AND column_name = 'conversion_events';

-- =================================================================
-- NOTA: Execute este script no SQL Editor do seu painel Supabase.
-- ================================================================= 