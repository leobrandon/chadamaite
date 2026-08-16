-- ============================================================
-- SQL DE CRIAÇÃO DO BANCO DE DADOS - CHÁ DA MAITÊ (SUPABASE)
-- Basta copiar e colar todo este código no "SQL Editor" do Supabase
-- e clicar no botão "RUN" (Executar)
-- ============================================================

-- 1. TABELA DE CONFIGURAÇÃO DO EVENTO
create table if not exists public.event_config (
  id text primary key default 'default_config',
  baby_name text default 'Maitê',
  parents text default 'Leonardo & Isabella',
  event_date text default '2026-10-18',
  event_time text default '15:30',
  display_date text default 'Domingo, 18 de Outubro de 2026',
  display_time text default 'A partir das 15:30h',
  location_name text default 'Espaço Recanto das Flores & Eventos',
  address text default 'Rua das Camélias, 120 - Jardim Primavera',
  city text default 'São Paulo - SP',
  map_url text default 'https://maps.google.com/?q=Rua+das+Camelias+120',
  pix_key text default 'maite.bebe@email.com',
  pix_name text default 'Leonardo / Isabella',
  admin_pin text default '1234',
  welcome_message text default 'Estamos muito felizes em compartilhar esse momento tão especial com você! Preparamos tudo com muito amor e carinho para esperar a nossa Maitê.',
  updated_at timestamp with time zone default timezone('utc'::text, now())
);

-- Inserir configuração inicial se não existir
insert into public.event_config (id)
values ('default_config')
on conflict (id) do nothing;


-- 2. TABELA DE PRESENTES
create table if not exists public.gifts (
  id text primary key,
  title text not null,
  category text not null,
  description text default '',
  icon text default '🎁',
  status text default 'available', -- 'available' ou 'reserved'
  reserved_by text default '',
  reserved_at text,
  priority text default 'medium',
  created_at timestamp with time zone default timezone('utc'::text, now())
);


-- 3. TABELA DE CONFIRMAÇÃO DE PRESENÇA (RSVP)
create table if not exists public.rsvps (
  id text primary key,
  name text not null,
  attending boolean not null default true,
  adults_count integer default 1,
  children_count integer default 0,
  companion_names text[] default '{}',
  phone text default '',
  message text default '',
  created_at timestamp with time zone default timezone('utc'::text, now())
);


-- 4. TABELA DO MURAL DE RECADOS
create table if not exists public.messages (
  id text primary key,
  author text not null,
  text text not null,
  date text default 'Recente',
  likes integer default 0,
  status text default 'pending', -- 'pending' ou 'approved'
  created_at timestamp with time zone default timezone('utc'::text, now())
);


-- ============================================================
-- HABILITAR POLÍTICAS DE SEGURANÇA (RLS PÚBLICO PARA CONVIDADOS)
-- ============================================================

alter table public.event_config enable row level security;
alter table public.gifts enable row level security;
alter table public.rsvps enable row level security;
alter table public.messages enable row level security;

-- Políticas para event_config (Leitura pública, atualização permitida)
create policy "Configurações públicas leitura" on public.event_config for select using (true);
create policy "Configurações atualização" on public.event_config for update using (true);

-- Políticas para gifts (Leitura, Criação, Atualização e Deleção)
create policy "Presentes leitura pública" on public.gifts for select using (true);
create policy "Presentes inserção pública" on public.gifts for insert with check (true);
create policy "Presentes atualização pública" on public.gifts for update using (true);
create policy "Presentes deleção pública" on public.gifts for delete using (true);

-- Políticas para rsvps (Leitura, Inserção e Deleção)
create policy "RSVPs leitura pública" on public.rsvps for select using (true);
create policy "RSVPs inserção pública" on public.rsvps for insert with check (true);
create policy "RSVPs deleção pública" on public.rsvps for delete using (true);

-- Políticas para messages (Leitura, Inserção, Atualização e Deleção)
create policy "Recados leitura pública" on public.messages for select using (true);
create policy "Recados inserção pública" on public.messages for insert with check (true);
create policy "Recados atualização pública" on public.messages for update using (true);
create policy "Recados deleção pública" on public.messages for delete using (true);
