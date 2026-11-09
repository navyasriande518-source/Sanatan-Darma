create table if not exists public.user_data (
  owner_id uuid not null references auth.users(id) on delete cascade,
  table_name text not null,
  row_id text not null,
  data jsonb not null,
  updated_at timestamptz not null default now(),
  primary key (owner_id, table_name, row_id)
);

create index if not exists user_data_lookup_idx
  on public.user_data (owner_id, table_name, updated_at);

alter table public.user_data enable row level security;

drop policy if exists "Users manage their own data" on public.user_data;
create policy "Users manage their own data"
  on public.user_data for all
  using (auth.uid() = owner_id)
  with check (auth.uid() = owner_id);

create table if not exists public.status_checks (
  id text primary key,
  client_name text not null,
  timestamp timestamptz not null default now()
);

create index if not exists status_checks_timestamp_idx
  on public.status_checks (timestamp desc);

alter table public.status_checks enable row level security;