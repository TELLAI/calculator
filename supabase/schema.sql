-- ⚠️  À utiliser uniquement pour une NOUVELLE base (sans données).
-- Si vous avez déjà des données : n'exécutez PAS ce fichier en entier.
-- Exécutez uniquement : supabase/migrations/005_organizations.sql

-- Table organisations (multi-tenant)
create table if not exists organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_at timestamptz default now()
);

alter table organizations enable row level security;

-- Organisation par défaut (pour nouveaux projets)
insert into organizations (name)
select 'Organisation par défaut'
where not exists (select 1 from organizations limit 1);

-- Table des récoltes de dons
create table if not exists recoltes (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),
  recolte_date date default current_date,
  organization_id uuid not null references organizations(id) on delete restrict,

  billet_100 int default 0,
  billet_50 int default 0,
  billet_20 int default 0,
  billet_10 int default 0,
  billet_5 int default 0,

  piece_2 numeric(10, 2) default 0,
  piece_1 numeric(10, 2) default 0,
  piece_050 numeric(10, 2) default 0,
  piece_020 numeric(10, 2) default 0,
  piece_010 numeric(10, 2) default 0,
  piece_005 numeric(10, 2) default 0,
  piece_002 numeric(10, 2) default 0,
  piece_001 numeric(10, 2) default 0,

  cotisation_adherents numeric(10, 2) default 0,
  cheques numeric(10, 2) default 0,
  carte_bancaire numeric(10, 2) default 0,
  autres numeric(10, 2) default 0,

  personnes_presentes text,
  observations text
);

create index if not exists idx_recoltes_created_at on recoltes (created_at desc);
create index if not exists idx_recoltes_organization_id on recoltes (organization_id);

-- Profils utilisateurs (rôle + organisation)
create table if not exists profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  organization_id uuid references organizations(id) on delete restrict,
  role text not null check (role in ('admin', 'user')),
  created_at timestamptz default now(),
  unique(user_id)
);

create index if not exists idx_profiles_user_id on profiles(user_id);
create index if not exists idx_profiles_organization_id on profiles(organization_id);

-- RLS
alter table recoltes enable row level security;
alter table profiles enable row level security;

drop policy if exists "recoltes_select" on recoltes;
drop policy if exists "recoltes_insert" on recoltes;
drop policy if exists "recoltes_update" on recoltes;
drop policy if exists "recoltes_delete" on recoltes;
drop policy if exists "profiles_select_own" on profiles;

create policy "recoltes_select" on recoltes for select to authenticated using (
  organization_id = (select organization_id from profiles where user_id = auth.uid())
);

create policy "recoltes_insert" on recoltes for insert to authenticated with check (
  organization_id = (select organization_id from profiles where user_id = auth.uid())
  and exists (select 1 from profiles where user_id = auth.uid() and organization_id is not null)
);

create policy "recoltes_update" on recoltes for update to authenticated using (
  organization_id = (select organization_id from profiles where user_id = auth.uid())
  and exists (select 1 from profiles where user_id = auth.uid() and profiles.role = 'admin')
);

create policy "recoltes_delete" on recoltes for delete to authenticated using (
  organization_id = (select organization_id from profiles where user_id = auth.uid())
  and exists (select 1 from profiles where user_id = auth.uid() and profiles.role = 'admin')
);

create policy "profiles_select_own" on profiles for select to authenticated using (auth.uid() = user_id);

drop policy if exists "organizations_select_own" on organizations;
create policy "organizations_select_own" on organizations for select to authenticated using (
  id = (select organization_id from profiles where user_id = auth.uid())
);

-- Trigger : nouveau user rattaché à la première organisation
create or replace function public.handle_new_user()
returns trigger as $$
declare
  default_org_id uuid;
begin
  select id into default_org_id from public.organizations limit 1;
  insert into public.profiles (user_id, role, organization_id)
  values (new.id, 'user', default_org_id);
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
