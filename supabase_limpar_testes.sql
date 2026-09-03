-- ====================================================================
-- SCRIPT DE LIMPEZA DE DADOS DE TESTE - CHÁ DA MAITÊ
-- Execute este script no SQL Editor do seu Supabase para remover
-- os registros criados durante os testes de desenvolvimento.
-- ====================================================================

-- 1. Excluir contribuições e cotas de fraldas/presentes de teste
DELETE FROM public.gift_pledges
WHERE giver_name ILIKE '%teste%'
   OR giver_name IN ('Carlos Eduardo', 'Mariana Silva');

-- 2. Excluir confirmações de presença (RSVP) de teste
DELETE FROM public.rsvps
WHERE name ILIKE '%teste%'
   OR name IN ('Carlos Eduardo', 'Mariana Silva');

-- 3. Excluir recados no mural de teste (se houver)
DELETE FROM public.messages
WHERE author ILIKE '%teste%'
   OR author IN ('Carlos Eduardo', 'Mariana Silva');

-- ====================================================================
-- Fim do script de limpeza.
-- ====================================================================
