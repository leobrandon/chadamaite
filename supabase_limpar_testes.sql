-- ====================================================================
-- SCRIPT DE LIMPEZA DE DADOS DE TESTE - CHÁ DA MAITÊ
-- Execute este script no SQL Editor do seu Supabase para remover
-- exclusivamente os registros de teste gerados durante homologação.
-- ====================================================================

-- 1. Excluir contribuições e cotas de presentes vinculadas a testes
DELETE FROM public.gift_pledges
WHERE giver_name ILIKE '%teste%' 
   OR giver_name IN ('Carlos Eduardo', 'Mariana Silva');

-- 2. Excluir confirmações de presença (RSVP) de teste e registros de probes
DELETE FROM public.rsvps
WHERE name ILIKE '%teste%'
   OR name IN ('Carlos Eduardo', 'Mariana Silva', 'Tio Marcos')
   OR phone = 'mural_only'
   OR id LIKE 'rsvp-msg-%'
   OR id LIKE '%probe%';

-- 3. Excluir recados de teste do mural
DELETE FROM public.messages
WHERE author ILIKE '%teste%'
   OR author IN ('Carlos Eduardo', 'Mariana Silva', 'Tio Marcos', '[EXCLUIDO]')
   OR id LIKE 'msg-test%'
   OR id LIKE 'test%'
   OR id LIKE '%probe%'
   OR id LIKE '%flow%'
   OR id LIKE '%loop%'
   OR id = 'msg-rsvp-probe-mural';

-- ====================================================================
-- 4. CONFERÊNCIA FINAL DOS DADOS
-- ====================================================================
SELECT 'Total RSVPs' AS item, count(*) AS total FROM public.rsvps
UNION ALL
SELECT 'Total Presentes/Pledges', count(*) FROM public.gift_pledges
UNION ALL
SELECT 'Total Mensagens no Mural', count(*) FROM public.messages;

