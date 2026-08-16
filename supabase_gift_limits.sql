-- Instruções: Execute este comando no SQL Editor do Supabase para adicionar o suporte a metas/limites de quantidade nos presentes.

-- Adiciona a coluna target_quantity na tabela gifts se ainda não existir
ALTER TABLE public.gifts ADD COLUMN IF NOT EXISTS target_quantity integer DEFAULT 5;

-- Atualiza eventuais registros nulos com o valor padrão 5
UPDATE public.gifts SET target_quantity = 5 WHERE target_quantity IS NULL;
