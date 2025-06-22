-- Verificar políticas existentes na tabela projects
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'projects';

-- Habilitar RLS na tabela projects (se não estiver habilitado)
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

-- Criar política para permitir que usuários excluam seus próprios projetos
DROP POLICY IF EXISTS "Users can delete their own projects" ON projects;

CREATE POLICY "Users can delete their own projects" ON projects
    FOR DELETE
    USING (auth.uid() = user_id);

-- Verificar se a política foi criada
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies 
WHERE tablename = 'projects' AND policyname = 'Users can delete their own projects';

-- Testar a exclusão (substitua 'project_id' e 'user_id' pelos valores reais)
-- DELETE FROM projects WHERE id = 'project_id' AND user_id = 'user_id'; 