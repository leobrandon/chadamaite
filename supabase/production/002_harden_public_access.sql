-- Apply only after the new frontend deployment is confirmed active.
BEGIN;
SET LOCAL lock_timeout = '5s';

DO $$
DECLARE
  item record;
BEGIN
  FOR item IN
    SELECT schemaname, tablename, policyname
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename IN (
        'event_config', 'gifts', 'gift_pledges', 'rsvps', 'messages',
        'gift_pledge_totals', 'admin_credentials', 'admin_login_attempts'
      )
  LOOP
    EXECUTE format('DROP POLICY %I ON %I.%I', item.policyname, item.schemaname, item.tablename);
  END LOOP;
END;
$$;

ALTER TABLE public.event_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gifts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gift_pledges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rsvps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gift_pledge_totals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_credentials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_login_attempts ENABLE ROW LEVEL SECURITY;

CREATE POLICY event_config_public_read ON public.event_config
  FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY gifts_public_read ON public.gifts
  FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY messages_approved_read ON public.messages
  FOR SELECT TO anon, authenticated USING (status = 'approved');
CREATE POLICY gift_pledge_totals_public_read ON public.gift_pledge_totals
  FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY rsvps_no_client_access ON public.rsvps
  FOR ALL TO anon, authenticated USING (false) WITH CHECK (false);
CREATE POLICY gift_pledges_no_client_access ON public.gift_pledges
  FOR ALL TO anon, authenticated USING (false) WITH CHECK (false);
CREATE POLICY admin_credentials_no_client_access ON public.admin_credentials
  FOR ALL TO anon, authenticated USING (false) WITH CHECK (false);
CREATE POLICY admin_login_attempts_no_client_access ON public.admin_login_attempts
  FOR ALL TO anon, authenticated USING (false) WITH CHECK (false);

REVOKE ALL PRIVILEGES ON TABLE public.event_config, public.gifts,
  public.gift_pledges, public.rsvps, public.messages,
  public.gift_pledge_totals, public.admin_credentials, public.admin_login_attempts
  FROM PUBLIC, anon, authenticated;
REVOKE ALL PRIVILEGES ON TABLE public.gifts_public FROM PUBLIC, anon, authenticated;
REVOKE ALL PRIVILEGES ON FUNCTION public.get_admin_rsvps(text) FROM PUBLIC, anon, authenticated;
REVOKE ALL PRIVILEGES ON FUNCTION public.increment_message_likes(text) FROM PUBLIC, anon, authenticated;
REVOKE ALL PRIVILEGES ON FUNCTION public.migrate_legacy_admin_credentials(text, text, integer, timestamptz)
  FROM PUBLIC, anon, authenticated;

GRANT SELECT (id, baby_name, parents, event_date, event_time, display_date, display_time,
  location_name, address, city, map_url, pix_key, pix_name, welcome_message, updated_at)
  ON TABLE public.event_config TO anon, authenticated;
GRANT SELECT (id, title, category, description, icon, status, priority,
  target_quantity, display_order, created_at)
  ON TABLE public.gifts TO anon, authenticated;
GRANT SELECT (id, author, text, date, likes, status, created_at)
  ON TABLE public.messages TO anon, authenticated;
GRANT SELECT (gift_id, pledged_quantity, updated_at)
  ON TABLE public.gift_pledge_totals TO anon, authenticated;
GRANT SELECT ON TABLE public.gifts_public TO anon, authenticated;

GRANT ALL PRIVILEGES ON TABLE public.event_config, public.gifts,
  public.gift_pledges, public.rsvps, public.messages,
  public.gift_pledge_totals, public.admin_credentials, public.admin_login_attempts
  TO service_role;
GRANT EXECUTE ON FUNCTION public.increment_message_likes(text) TO service_role;
GRANT EXECUTE ON FUNCTION public.migrate_legacy_admin_credentials(text, text, integer, timestamptz)
  TO service_role;

-- Stop a future event_config insert from receiving a default plaintext PIN.
ALTER TABLE public.event_config ALTER COLUMN admin_pin DROP DEFAULT;

COMMIT;
