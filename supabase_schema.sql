-- Esquema seguro do projeto de homologação Chá da Maitê.
-- Não contém dados de produção nem chaves de API.
-- O PIN de homologação é cadastrado separadamente e sua hash não fica no Git.

CREATE SCHEMA IF NOT EXISTS internal;
REVOKE ALL ON SCHEMA internal FROM PUBLIC, anon, authenticated;

CREATE TABLE IF NOT EXISTS public.event_config (
  id text PRIMARY KEY DEFAULT 'default_config' CHECK (id = 'default_config'),
  baby_name text NOT NULL,
  parents text NOT NULL,
  event_date text NOT NULL,
  event_time text NOT NULL,
  display_date text NOT NULL,
  display_time text NOT NULL,
  location_name text NOT NULL,
  address text NOT NULL,
  city text NOT NULL,
  map_url text NOT NULL,
  pix_key text NOT NULL,
  pix_name text NOT NULL,
  welcome_message text NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.gifts (
  id text PRIMARY KEY,
  title text NOT NULL CHECK (char_length(title) BETWEEN 1 AND 160),
  category text NOT NULL CHECK (char_length(category) <= 80),
  description text NOT NULL DEFAULT '' CHECK (char_length(description) <= 1000),
  icon text NOT NULL DEFAULT '🎁' CHECK (char_length(icon) <= 32),
  status text NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'reserved')),
  reserved_by text NOT NULL DEFAULT '' CHECK (char_length(reserved_by) <= 80),
  reserved_at timestamptz,
  priority text NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
  target_quantity integer NOT NULL DEFAULT 1 CHECK (target_quantity BETWEEN 1 AND 999),
  display_order integer NOT NULL DEFAULT 999,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.rsvps (
  id text PRIMARY KEY,
  name text NOT NULL CHECK (char_length(name) BETWEEN 1 AND 80),
  attending boolean NOT NULL DEFAULT true,
  adults_count integer NOT NULL DEFAULT 1 CHECK (adults_count BETWEEN 0 AND 20),
  children_count integer NOT NULL DEFAULT 0 CHECK (children_count BETWEEN 0 AND 20),
  companion_names text[] NOT NULL DEFAULT '{}',
  phone text NOT NULL DEFAULT '' CHECK (char_length(phone) <= 30),
  message text NOT NULL DEFAULT '' CHECK (char_length(message) <= 500),
  created_at timestamptz NOT NULL DEFAULT now(),
  CHECK (cardinality(companion_names) <= 20),
  CHECK (attending OR (adults_count = 0 AND children_count = 0 AND cardinality(companion_names) = 0))
);

CREATE TABLE IF NOT EXISTS public.messages (
  id text PRIMARY KEY,
  author text NOT NULL CHECK (char_length(author) BETWEEN 1 AND 80),
  text text NOT NULL CHECK (char_length(text) BETWEEN 1 AND 500),
  date text NOT NULL DEFAULT 'Recente',
  likes integer NOT NULL DEFAULT 0 CHECK (likes >= 0),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved')),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.gift_pledges (
  id text PRIMARY KEY,
  gift_id text NOT NULL REFERENCES public.gifts(id) ON DELETE CASCADE,
  giver_name text NOT NULL CHECK (char_length(giver_name) BETWEEN 1 AND 80),
  quantity integer NOT NULL DEFAULT 1 CHECK (quantity BETWEEN 1 AND 999),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.gift_pledge_totals (
  gift_id text PRIMARY KEY REFERENCES public.gifts(id) ON DELETE CASCADE,
  pledged_quantity integer NOT NULL DEFAULT 0 CHECK (pledged_quantity >= 0),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.admin_credentials (
  id boolean PRIMARY KEY DEFAULT true CHECK (id),
  pin_salt text NOT NULL,
  pin_hash text NOT NULL,
  pin_iterations integer NOT NULL DEFAULT 310000 CHECK (pin_iterations BETWEEN 100000 AND 1000000),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.admin_login_attempts (
  ip_hash text PRIMARY KEY,
  failures integer NOT NULL DEFAULT 0 CHECK (failures >= 0),
  window_started_at timestamptz NOT NULL DEFAULT now(),
  blocked_until timestamptz
);

CREATE INDEX IF NOT EXISTS rsvps_created_at_idx ON public.rsvps (created_at DESC);
CREATE INDEX IF NOT EXISTS messages_public_created_at_idx ON public.messages (created_at DESC) WHERE status = 'approved';
CREATE INDEX IF NOT EXISTS messages_admin_created_at_idx ON public.messages (created_at DESC);
CREATE INDEX IF NOT EXISTS gift_pledges_gift_created_idx ON public.gift_pledges (gift_id, created_at);
CREATE INDEX IF NOT EXISTS admin_login_attempts_blocked_idx ON public.admin_login_attempts (blocked_until) WHERE blocked_until IS NOT NULL;

ALTER TABLE public.event_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gifts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rsvps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gift_pledges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gift_pledge_totals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_credentials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_login_attempts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS event_config_public_read ON public.event_config;
CREATE POLICY event_config_public_read ON public.event_config FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS gifts_public_read ON public.gifts;
CREATE POLICY gifts_public_read ON public.gifts FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS messages_approved_read ON public.messages;
CREATE POLICY messages_approved_read ON public.messages FOR SELECT TO anon, authenticated USING (status = 'approved');
DROP POLICY IF EXISTS gift_pledge_totals_public_read ON public.gift_pledge_totals;
CREATE POLICY gift_pledge_totals_public_read ON public.gift_pledge_totals FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS rsvps_no_client_access ON public.rsvps;
CREATE POLICY rsvps_no_client_access ON public.rsvps
  FOR ALL TO anon, authenticated USING (false) WITH CHECK (false);
DROP POLICY IF EXISTS gift_pledges_no_client_access ON public.gift_pledges;
CREATE POLICY gift_pledges_no_client_access ON public.gift_pledges
  FOR ALL TO anon, authenticated USING (false) WITH CHECK (false);
DROP POLICY IF EXISTS admin_credentials_no_client_access ON public.admin_credentials;
CREATE POLICY admin_credentials_no_client_access ON public.admin_credentials
  FOR ALL TO anon, authenticated USING (false) WITH CHECK (false);
DROP POLICY IF EXISTS admin_login_attempts_no_client_access ON public.admin_login_attempts;
CREATE POLICY admin_login_attempts_no_client_access ON public.admin_login_attempts
  FOR ALL TO anon, authenticated USING (false) WITH CHECK (false);

CREATE OR REPLACE VIEW public.gifts_public WITH (security_invoker = true) AS
SELECT id, title, category, description, icon, status, priority, target_quantity, display_order, created_at
FROM public.gifts;

CREATE OR REPLACE FUNCTION internal.initialize_gift_total()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.gift_pledge_totals (gift_id, pledged_quantity)
  VALUES (NEW.id, 0)
  ON CONFLICT (gift_id) DO NOTHING;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION internal.enforce_gift_pledge_limit()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_target integer;
  v_current integer;
BEGIN
  SELECT target_quantity INTO v_target
  FROM public.gifts
  WHERE id = NEW.gift_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Presente não encontrado.' USING ERRCODE = '23503';
  END IF;

  SELECT pledged_quantity INTO v_current
  FROM public.gift_pledge_totals
  WHERE gift_id = NEW.gift_id;

  IF NOT FOUND THEN
    v_current := 0;
  END IF;

  IF v_current + NEW.quantity > v_target THEN
    RAISE EXCEPTION 'A quantidade disponível para este presente foi atingida.'
      USING ERRCODE = '23514';
  END IF;

  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION internal.sync_gift_pledge_total()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.gift_pledge_totals
    SET pledged_quantity = pledged_quantity + NEW.quantity, updated_at = now()
    WHERE gift_id = NEW.gift_id;
    RETURN NEW;
  END IF;

  UPDATE public.gift_pledge_totals
  SET pledged_quantity = GREATEST(0, pledged_quantity - OLD.quantity), updated_at = now()
  WHERE gift_id = OLD.gift_id;
  RETURN OLD;
END;
$$;

DROP TRIGGER IF EXISTS gifts_initialize_total ON public.gifts;
CREATE TRIGGER gifts_initialize_total
AFTER INSERT ON public.gifts
FOR EACH ROW EXECUTE FUNCTION internal.initialize_gift_total();

DROP TRIGGER IF EXISTS gift_pledges_enforce_limit ON public.gift_pledges;
CREATE TRIGGER gift_pledges_enforce_limit
BEFORE INSERT ON public.gift_pledges
FOR EACH ROW EXECUTE FUNCTION internal.enforce_gift_pledge_limit();

DROP TRIGGER IF EXISTS gift_pledges_sync_total ON public.gift_pledges;
CREATE TRIGGER gift_pledges_sync_total
AFTER INSERT OR DELETE ON public.gift_pledges
FOR EACH ROW EXECUTE FUNCTION internal.sync_gift_pledge_total();

CREATE OR REPLACE FUNCTION public.increment_message_likes(p_message_id text)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_likes integer;
BEGIN
  UPDATE public.messages
  SET likes = likes + 1
  WHERE id = p_message_id AND status = 'approved'
  RETURNING likes INTO v_likes;

  IF v_likes IS NULL THEN
    RAISE EXCEPTION 'Recado não encontrado ou não publicado.' USING ERRCODE = 'P0002';
  END IF;

  RETURN v_likes;
END;
$$;

-- A API é opt-in: conceda apenas leitura pública dos campos necessários.
REVOKE ALL ON ALL TABLES IN SCHEMA public FROM anon, authenticated;
REVOKE ALL ON ALL SEQUENCES IN SCHEMA public FROM anon, authenticated;
REVOKE ALL ON ALL FUNCTIONS IN SCHEMA public FROM PUBLIC, anon, authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public
  REVOKE SELECT, INSERT, UPDATE, DELETE ON TABLES FROM anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public
  REVOKE EXECUTE ON FUNCTIONS FROM PUBLIC, anon, authenticated, service_role;

GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
GRANT SELECT (id, baby_name, parents, event_date, event_time, display_date, display_time,
  location_name, address, city, map_url, pix_key, pix_name, welcome_message, updated_at)
  ON public.event_config TO anon, authenticated;
GRANT SELECT ON public.messages, public.gift_pledge_totals, public.gifts_public TO anon, authenticated;
GRANT SELECT (id, title, category, description, icon, status, priority, target_quantity, display_order, created_at)
  ON public.gifts TO anon, authenticated;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO service_role;
GRANT USAGE ON SCHEMA internal TO service_role;
GRANT EXECUTE ON FUNCTION internal.initialize_gift_total() TO service_role;
GRANT EXECUTE ON FUNCTION internal.enforce_gift_pledge_limit() TO service_role;
GRANT EXECUTE ON FUNCTION internal.sync_gift_pledge_total() TO service_role;
GRANT EXECUTE ON FUNCTION public.increment_message_likes(text) TO service_role;

REVOKE ALL ON FUNCTION public.increment_message_likes(text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.increment_message_likes(text) TO service_role;

INSERT INTO public.event_config (
  id, baby_name, parents, event_date, event_time, display_date, display_time,
  location_name, address, city, map_url, pix_key, pix_name, welcome_message
) VALUES (
  'default_config', 'Maitê', 'Pais da Maitê', '2026-10-31', '14:00',
  'Data de teste', 'Horário de teste', 'Espaço de homologação',
  'Endereço fictício de homologação', 'Cidade de teste',
  'https://maps.google.com', 'CHAVE PIX FICTÍCIA - NÃO PAGAR', 'Conta de teste',
  'Ambiente de homologação com informações fictícias.'
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.gifts (
  id, title, category, description, icon, status, reserved_by, reserved_at,
  priority, target_quantity, display_order
) VALUES
('gift-1', 'Pacote de Fraldas Tam. RN (Pampers / Huggies)', 'Fraldas', 'Pacote tamanho Recém-Nascido para os primeiros dias da Maitê.', '👶', 'available', '', NULL, 'high', 3, 1),
('gift-2', 'Pacote de Fraldas Tam. P (Pampers Confort Sec ou Huggies)', 'Fraldas', 'Tamanho P (3 a 5kg), muito útil nos primeiros 2 meses.', '🌸', 'available', '', NULL, 'high', 5, 2),
('gift-3', 'Pacote de Fraldas Tam. M (Pampers Pants ou Premium Care)', 'Fraldas', 'Tamanho M (6 a 9kg), o tamanho que a bebê mais vai usar.', '🎀', 'available', '', NULL, 'high', 5, 3),
('gift-4', 'Pacote de Fraldas Tam. G (Huggies Supreme Care / Pampers)', 'Fraldas', 'Tamanho G (9 a 12kg) para quando a Maitê estiver mais crescidinha.', '🧸', 'available', '', NULL, 'medium', 5, 4),
('gift-5', 'Kit Lenços Umedecidos (3 a 4 pacotinhos)', 'Higiene & Banho', 'Sem perfume ou à base d’água (ex: Pampers Wipes, Huggies Pure).', '✨', 'available', '', NULL, 'high', 3, 5),
('gift-6', 'Kit Shampoo e Sabonete Líquido Neutro para Bebê', 'Higiene & Banho', 'Linha Granado Bebê, Mustela ou Johnson’s Hora do Sono.', '🛁', 'available', '', NULL, 'high', 2, 6),
('gift-7', 'Pomadas para Assaduras (Desitin / Bepantol Baby / Hipoglós)', 'Higiene & Banho', 'Cuidado essencial para proteger a pele sensível da Maitê.', '🧴', 'available', '', NULL, 'high', 3, 7),
('gift-8', 'Toalha de Banho com Capuz Infantil Macia', 'Higiene & Banho', 'Toalha aveludada 100% algodão com capuz fofo.', '🦢', 'available', '', NULL, 'medium', 2, 8),
('gift-9', 'Kit Cuidados do Bebê (Tesourinha, Cortador, Lixa e Escova)', 'Higiene & Banho', 'Kit de manicure e escovinha de cerdas naturais para recém-nascido.', '✂️', 'available', '', NULL, 'medium', 1, 9),
('gift-10', 'Termômetro Digital Corporal & Termômetro de Banheira', 'Higiene & Banho', 'Para acompanhar a temperatura da água e cuidar da saúde da bebê.', '🌡️', 'available', '', NULL, 'medium', 1, 10),
('gift-11', 'Aspirador Nasal de Sucção (NoseFrida ou similar)', 'Higiene & Banho', 'Salvação para os dias de narizinho trancado.', '💨', 'available', '', NULL, 'medium', 1, 11),
('gift-12', 'Kit Mamadeiras Anticólica (Avent Philips ou MAM)', 'Alimentação', 'Com bico pétala ou sistema anticólica para conforto da Maitê.', '🍼', 'available', '', NULL, 'medium', 2, 12),
('gift-13', 'Kit Pratinho, Babadores de Silicone e Colheres Termossensíveis', 'Alimentação', 'Kit prático com pega-migalhas para a introdução alimentar.', '🥣', 'available', '', NULL, 'medium', 2, 13),
('gift-14', 'Copo de Transição 360° Antivazamento (Munchkin)', 'Alimentação', 'Facilita a transição para tomar água de forma independente.', '🥤', 'available', '', NULL, 'low', 2, 14),
('gift-15', 'Almofada de Amamentação Anatômica', 'Alimentação', 'Proporciona muito conforto para a mamãe Isabella e a Maitê.', '🌙', 'available', '', NULL, 'high', 1, 15),
('gift-16', 'Jogo de Lençol para Berço 100% Algodão (Rosa / Neutro)', 'Quarto & Enxoval', 'Toque suave de percal ou malha para noites tranquilas.', '🛏️', 'available', '', NULL, 'high', 2, 16),
('gift-17', 'Kit Fraldinhas de Boca e Paninhos de Ombro (Bordadas/Estampadas)', 'Quarto & Enxoval', 'Kit com 5 a 6 paninhos 100% algodão super absorventes.', '🧵', 'available', '', NULL, 'high', 3, 17),
('gift-18', 'Manta Quentinha / Cobertor de Microfibra Antialérgico', 'Quarto & Enxoval', 'Manta macia e quentinha em tons delicados.', '🧸', 'available', '', NULL, 'high', 2, 18),
('gift-19', 'Luminária Abajur Noturno com Luz Suave / Som Ruído Branco', 'Quarto & Enxoval', 'Luz acolhedora para as mamadas noturnas sem despertar o bebê.', '💡', 'available', '', NULL, 'medium', 1, 19),
('gift-20', 'Ninho Redutor de Berço Aconchegante', 'Quarto & Enxoval', 'Simula o aconchego do útero materno para a Maitê dormir segura.', '🪺', 'available', '', NULL, 'medium', 1, 20),
('gift-21', 'Bolsa Maternidade / Mochila Térmica Multifuncional', 'Passeio & Segurança', 'Com divisórias impermeáveis e bolsos térmicos para mamadeira.', '🎒', 'available', '', NULL, 'high', 1, 21),
('gift-22', 'Espelho Retrovisor para Banco Traseiro do Carro', 'Passeio & Segurança', 'Permite que os papais vejam a Maitê no bebê conforto enquanto dirigem.', '🪞', 'available', '', NULL, 'medium', 1, 22),
('gift-23', 'Canguru Ergonômico / Sling de Algodão', 'Passeio & Segurança', 'Facilita passeios mantendo o bebê coladinho com os pais.', '🤍', 'available', '', NULL, 'medium', 1, 23),
('gift-24', 'Trocador Portátil Dobrável e Impermeável', 'Passeio & Segurança', 'Prático para levar na bolsa e trocar a Maitê em qualquer lugar.', '👝', 'available', '', NULL, 'medium', 1, 24),
('gift-25', 'Kit Body Manga Curta e Mijões (Tam. P / M)', 'Roupas & Acessórios', 'Peças básicas e confortáveis 100% algodão suedine.', '👚', 'available', '', NULL, 'high', 3, 25),
('gift-26', 'Kit Macacões com Zíper Duplo (Tam. P ou M)', 'Roupas & Acessórios', 'Macacão com zíper nos dois sentidos, agiliza a troca de fraldas.', '👗', 'available', '', NULL, 'high', 3, 26),
('gift-27', 'Kit Meias, Luvinhas e Faixas de Cabelo Delicadas', 'Roupas & Acessórios', 'Acessórios macios e charmosos para enfeitar a princesinha.', '🎀', 'available', '', NULL, 'medium', 3, 27),
('gift-28', 'Saída de Maternidade em Tricot / Linha Suave', 'Roupas & Acessórios', 'Conjuntinho especial para as primeiras fotos da Maitê.', '👑', 'available', '', NULL, 'medium', 1, 28),
('gift-29', 'Naninha de Pelúcia / Paninho de Apego Antialérgico', 'Brinquedos & Mimos', 'Companheira fofinha para os soninhos e momentos de carinho.', '🐰', 'available', '', NULL, 'medium', 2, 29),
('gift-30', 'Chocalho e Mordedor Macio com Água Gelável', 'Brinquedos & Mimos', 'Alivia o desconforto do nascimento dos primeiros dentinhos.', '🔔', 'available', '', NULL, 'low', 2, 30),
('gift-31', 'Tapete de Atividades / Ginásio com Móbile Musical', 'Brinquedos & Mimos', 'Estimula o desenvolvimento sensorial e motor da bebê.', '🎪', 'available', '', NULL, 'medium', 1, 31),
('gift-32', 'Livrinho Sensorial de Pano / Banho', 'Brinquedos & Mimos', 'Com texturas e cores para estimular a curiosidade da Maitê.', '📖', 'available', '', NULL, 'low', 2, 32)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.messages (id, author, text, date, likes, status, created_at) VALUES
  ('msg-stage-1', 'Convidado de teste', 'Que a chegada da Maitê seja cheia de carinho!', 'Teste', 0, 'approved', now()),
  ('msg-stage-2', 'Família de teste', 'Estamos felizes em celebrar com vocês!', 'Teste', 0, 'approved', now() - interval '1 day')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.gift_pledge_totals (gift_id, pledged_quantity)
SELECT id, 0 FROM public.gifts
ON CONFLICT (gift_id) DO NOTHING;
