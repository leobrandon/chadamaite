-- ====================================================================
-- LOTE 2: SEGURANÇA DE RLS (TABELAS DE DADOS E PRIVACIDADE DE CONVIDADOS)
-- ====================================================================

-- --------------------------------------------------------------------
-- 1. TABELA public.rsvps (Confirmações de Presença)
-- --------------------------------------------------------------------
-- Remover políticas permissivas antigas que permitiam DELETE, UPDATE e SELECT indiscriminado
DROP POLICY IF EXISTS "Presenças exclusão" ON public.rsvps;
DROP POLICY IF EXISTS "Presenças atualização" ON public.rsvps;
DROP POLICY IF EXISTS "Presenças leitura" ON public.rsvps;
DROP POLICY IF EXISTS "Presenças inserção" ON public.rsvps;
DROP POLICY IF EXISTS "Presenças inserção pública" ON public.rsvps;

-- Permitir que convidados anônimos CONTINUEM enviando sua confirmação de presença (INSERT)
CREATE POLICY "Presenças inserção pública" 
  ON public.rsvps 
  FOR INSERT 
  TO anon, authenticated 
  WITH CHECK (true);

-- Função segura (RPC) para que o Admin (que possui o PIN) consiga listar todos os RSVPs
-- sem expor a tabela publicamente para qualquer visitante
CREATE OR REPLACE FUNCTION public.get_admin_rsvps(p_pin_hash text)
RETURNS SETOF public.rsvps
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_db_pin text;
BEGIN
  SELECT admin_pin INTO v_db_pin FROM public.event_config LIMIT 1;
  -- Valida se o hash fornecido confere com o PIN cadastrado
  IF (v_db_pin IS NOT NULL AND p_pin_hash = v_db_pin) 
     OR (v_db_pin IS NULL AND p_pin_hash = 'e815b24d314219266fbae1d11292d9d23bb2befbd5d0dc3f7a2422edc354413c') THEN
    RETURN QUERY SELECT * FROM public.rsvps ORDER BY created_at DESC;
  ELSE
    RAISE EXCEPTION 'Acesso não autorizado: PIN incorreto.';
  END IF;
END;
$$;

-- --------------------------------------------------------------------
-- 2. TABELA public.gift_pledges (Contribuições de Presentes / Cotas)
-- --------------------------------------------------------------------
DROP POLICY IF EXISTS "Pledges exclusao" ON public.gift_pledges;
DROP POLICY IF EXISTS "Pledges atualizacao" ON public.gift_pledges;
DROP POLICY IF EXISTS "Pledges leitura" ON public.gift_pledges;
DROP POLICY IF EXISTS "Pledges insercao" ON public.gift_pledges;
DROP POLICY IF EXISTS "Pledges leitura pública" ON public.gift_pledges;
DROP POLICY IF EXISTS "Pledges inserção pública" ON public.gift_pledges;

-- Leitura pública para que a vitrine possa calcular as metas de fraldas/mimos
CREATE POLICY "Pledges leitura pública" 
  ON public.gift_pledges 
  FOR SELECT 
  TO anon, authenticated 
  USING (true);

-- Inserção pública para que os convidados possam registrar as cotas escolhidas
CREATE POLICY "Pledges inserção pública" 
  ON public.gift_pledges 
  FOR INSERT 
  TO anon, authenticated 
  WITH CHECK (true);

-- --------------------------------------------------------------------
-- 3. TABELA public.gifts (Catálogo de Presentes)
-- --------------------------------------------------------------------
DROP POLICY IF EXISTS "Presentes exclusão" ON public.gifts;
DROP POLICY IF EXISTS "Presentes inserção" ON public.gifts;
DROP POLICY IF EXISTS "Presentes leitura" ON public.gifts;
DROP POLICY IF EXISTS "Presentes atualização" ON public.gifts;
DROP POLICY IF EXISTS "Presentes leitura pública" ON public.gifts;
DROP POLICY IF EXISTS "Presentes reserva pública" ON public.gifts;

-- Leitura pública do catálogo de presentes
CREATE POLICY "Presentes leitura pública" 
  ON public.gifts 
  FOR SELECT 
  TO anon, authenticated 
  USING (true);

-- Atualização permitida para reservas
CREATE POLICY "Presentes reserva pública" 
  ON public.gifts 
  FOR UPDATE 
  TO anon, authenticated 
  USING (true)
  WITH CHECK (true);

-- --------------------------------------------------------------------
-- 4. TABELA public.messages (Mural de Recados)
-- --------------------------------------------------------------------
DROP POLICY IF EXISTS "Recados exclusão" ON public.messages;
DROP POLICY IF EXISTS "Recados atualização" ON public.messages;
DROP POLICY IF EXISTS "Recados leitura" ON public.messages;
DROP POLICY IF EXISTS "Recados inserção" ON public.messages;
DROP POLICY IF EXISTS "Recados leitura aprovados" ON public.messages;
DROP POLICY IF EXISTS "Recados envio público" ON public.messages;
DROP POLICY IF EXISTS "Recados curtir público" ON public.messages;

-- Visitantes públicos só visualizam recados aprovados
CREATE POLICY "Recados leitura aprovados" 
  ON public.messages 
  FOR SELECT 
  TO anon, authenticated 
  USING (status = 'approved');

-- Visitantes podem enviar recados (status 'pending')
CREATE POLICY "Recados envio público" 
  ON public.messages 
  FOR INSERT 
  TO anon, authenticated 
  WITH CHECK (true);

-- Visitantes podem curtir recados
CREATE POLICY "Recados curtir público" 
  ON public.messages 
  FOR UPDATE 
  TO anon, authenticated 
  USING (true)
  WITH CHECK (true);
