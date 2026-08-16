-- Instruções: Execute este script no SQL Editor do Supabase para criar a tabela de contribuições.
-- Tabela de contribuições para presentes (sistema não-exclusivo)
create table if not exists public.gift_pledges (
  id text primary key,
  gift_id text not null references public.gifts(id) on delete cascade,
  giver_name text not null,
  quantity integer not null default 1,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

alter table public.gift_pledges enable row level security;

create policy "Pledges leitura pública" on public.gift_pledges for select using (true);
create policy "Pledges inserção pública" on public.gift_pledges for insert with check (true);
create policy "Pledges deleção pública" on public.gift_pledges for delete using (true);
