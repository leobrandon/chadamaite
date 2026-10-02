-- Additive production preparation. Keeps the legacy frontend working until the
-- new frontend is active. Does not seed or replace any event data.
BEGIN;
SET LOCAL lock_timeout = '5s';

DO $$
BEGIN
  IF to_regclass('public.event_config') IS NULL
    OR to_regclass('public.gifts') IS NULL
    OR to_regclass('public.gift_pledges') IS NULL
    OR to_regclass('public.rsvps') IS NULL
    OR to_regclass('public.messages') IS NULL THEN
    RAISE EXCEPTION 'Required existing Chá da Maitê tables are missing.';
  END IF;
END;
$$;

ALTER TABLE public.gifts ADD COLUMN IF NOT EXISTS target_quantity integer;
UPDATE public.gifts SET target_quantity = 999 WHERE target_quantity IS NULL;
ALTER TABLE public.gifts ALTER COLUMN target_quantity SET DEFAULT 1;
ALTER TABLE public.gifts ALTER COLUMN target_quantity SET NOT NULL;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conrelid = 'public.gifts'::regclass
      AND conname = 'gifts_target_quantity_range'
  ) THEN
    ALTER TABLE public.gifts
      ADD CONSTRAINT gifts_target_quantity_range
      CHECK (target_quantity BETWEEN 1 AND 999) NOT VALID;
  END IF;
END;
$$;
ALTER TABLE public.gifts VALIDATE CONSTRAINT gifts_target_quantity_range;

ALTER TABLE public.gifts ADD COLUMN IF NOT EXISTS display_order integer;
WITH ranked_gifts AS (
  SELECT id, row_number() OVER (ORDER BY created_at ASC NULLS LAST, id ASC)::integer AS position
  FROM public.gifts
)
UPDATE public.gifts AS gifts
SET display_order = ranked_gifts.position
FROM ranked_gifts
WHERE gifts.id = ranked_gifts.id AND gifts.display_order IS NULL;
ALTER TABLE public.gifts ALTER COLUMN display_order SET DEFAULT 999;
ALTER TABLE public.gifts ALTER COLUMN display_order SET NOT NULL;

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

CREATE INDEX IF NOT EXISTS admin_login_attempts_blocked_idx
  ON public.admin_login_attempts (blocked_until) WHERE blocked_until IS NOT NULL;
CREATE INDEX IF NOT EXISTS gift_pledges_gift_created_idx
  ON public.gift_pledges (gift_id, created_at);

CREATE SCHEMA IF NOT EXISTS internal;
REVOKE ALL ON SCHEMA internal FROM PUBLIC, anon, authenticated;

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
  FROM public.gifts WHERE id = NEW.gift_id FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Presente não encontrado.' USING ERRCODE = '23503';
  END IF;

  SELECT pledged_quantity INTO v_current
  FROM public.gift_pledge_totals WHERE gift_id = NEW.gift_id;
  IF NOT FOUND THEN v_current := 0; END IF;

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

REVOKE ALL ON FUNCTION internal.initialize_gift_total() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION internal.enforce_gift_pledge_limit() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION internal.sync_gift_pledge_total() FROM PUBLIC, anon, authenticated;

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

INSERT INTO public.gift_pledge_totals (gift_id, pledged_quantity)
SELECT gifts.id, COALESCE(sum(pledges.quantity), 0)::integer
FROM public.gifts AS gifts
LEFT JOIN public.gift_pledges AS pledges ON pledges.gift_id = gifts.id
GROUP BY gifts.id
ON CONFLICT (gift_id) DO UPDATE
SET pledged_quantity = EXCLUDED.pledged_quantity, updated_at = now();

ALTER TABLE public.gift_pledge_totals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_credentials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_login_attempts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS gift_pledge_totals_public_read ON public.gift_pledge_totals;
CREATE POLICY gift_pledge_totals_public_read ON public.gift_pledge_totals
  FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS admin_credentials_no_client_access ON public.admin_credentials;
CREATE POLICY admin_credentials_no_client_access ON public.admin_credentials
  FOR ALL TO anon, authenticated USING (false) WITH CHECK (false);
DROP POLICY IF EXISTS admin_login_attempts_no_client_access ON public.admin_login_attempts;
CREATE POLICY admin_login_attempts_no_client_access ON public.admin_login_attempts
  FOR ALL TO anon, authenticated USING (false) WITH CHECK (false);

CREATE OR REPLACE VIEW public.gifts_public WITH (security_invoker = true) AS
SELECT id, title, category, description, icon, status, priority,
       target_quantity, display_order, created_at
FROM public.gifts;

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
REVOKE ALL ON FUNCTION public.increment_message_likes(text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.increment_message_likes(text) TO service_role;

-- The first successful login verifies the legacy PIN in app-api, hashes the
-- exact same value there, then calls this function to save the hash and clear
-- the plaintext copy in one transaction. This RPC is service-role only.
CREATE OR REPLACE FUNCTION public.migrate_legacy_admin_credentials(
  p_pin_salt text,
  p_pin_hash text,
  p_pin_iterations integer,
  p_expected_updated_at timestamptz
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_has_legacy_pin boolean;
  v_legacy_pin text;
  v_updated_at timestamptz;
  v_inserted integer;
BEGIN
  IF p_pin_salt !~ '^[0-9a-fA-F]{64}$'
    OR p_pin_hash !~ '^[0-9a-fA-F]{64}$'
    OR p_pin_iterations < 100000 OR p_pin_iterations > 1000000 THEN
    RAISE EXCEPTION 'Invalid credential migration payload.';
  END IF;

  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'event_config'
      AND column_name = 'admin_pin'
  ) INTO v_has_legacy_pin;
  IF NOT v_has_legacy_pin OR NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'event_config'
      AND column_name = 'updated_at'
  ) THEN
    RETURN false;
  END IF;

  EXECUTE 'SELECT admin_pin, updated_at FROM public.event_config WHERE id = $1 FOR UPDATE'
    INTO v_legacy_pin, v_updated_at USING 'default_config';
  IF v_legacy_pin IS NULL OR v_updated_at IS DISTINCT FROM p_expected_updated_at THEN
    RETURN false;
  END IF;

  INSERT INTO public.admin_credentials (id, pin_salt, pin_hash, pin_iterations, updated_at)
  VALUES (true, lower(p_pin_salt), lower(p_pin_hash), p_pin_iterations, now())
  ON CONFLICT (id) DO NOTHING;
  GET DIAGNOSTICS v_inserted = ROW_COUNT;
  IF v_inserted = 0 THEN
    RETURN false;
  END IF;

  UPDATE public.event_config SET admin_pin = NULL WHERE id = 'default_config';
  IF NOT FOUND THEN RAISE EXCEPTION 'Legacy configuration row is missing.'; END IF;
  RETURN true;
END;
$$;
REVOKE ALL ON FUNCTION public.migrate_legacy_admin_credentials(text, text, integer, timestamptz)
  FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.migrate_legacy_admin_credentials(text, text, integer, timestamptz)
  TO service_role;

REVOKE ALL ON TABLE public.admin_credentials, public.admin_login_attempts
  FROM PUBLIC, anon, authenticated;
GRANT ALL ON TABLE public.admin_credentials, public.admin_login_attempts TO service_role;
GRANT SELECT ON TABLE public.gift_pledge_totals, public.gifts_public TO anon, authenticated;
GRANT ALL ON TABLE public.gift_pledge_totals TO service_role;
GRANT SELECT (id, title, category, description, icon, status, priority,
  target_quantity, display_order, created_at) ON TABLE public.gifts TO anon, authenticated;
GRANT ALL ON TABLE public.event_config, public.gifts, public.gift_pledges,
  public.gift_pledge_totals, public.rsvps, public.messages,
  public.admin_credentials, public.admin_login_attempts TO service_role;

COMMIT;
