-- Table organisations (multi-tenant)
create table if not exists organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_at timestamptz default now()
);
alter table organizations enable row level security;

-- Organisation par défaut pour les données existantes
insert into organizations (id, name)
select gen_random_uuid(), 'Organisation par défaut'
where not exists (select 1 from organizations limit 1);

-- Rattacher les profils à une organisation
alter table profiles add column if not exists organization_id uuid references organizations(id) on delete restrict;
create index if not exists idx_profiles_organization_id on profiles(organization_id);

-- Rattacher les récoltes à une organisation
alter table recoltes add column if not exists organization_id uuid references organizations(id) on delete restrict;
create index if not exists idx_recoltes_organization_id on recoltes(organization_id);

-- Backfill : attribuer l'organisation par défaut aux données existantes
do $$
declare
  default_org_id uuid;
begin
  select id into default_org_id from organizations limit 1;
  update profiles set organization_id = default_org_id where organization_id is null;
  update recoltes set organization_id = default_org_id where organization_id is null;
end $$;

-- Rendre organization_id obligatoire sur les récoltes (après backfill)
alter table recoltes alter column organization_id set not null;

-- RLS : politiques par organisation
drop policy if exists "recoltes_select" on recoltes;
drop policy if exists "recoltes_insert" on recoltes;
drop policy if exists "recoltes_update" on recoltes;
drop policy if exists "recoltes_delete" on recoltes;

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

-- Lecture organisation : uniquement la sienne
drop policy if exists "organizations_select_own" on organizations;
create policy "organizations_select_own" on organizations for select to authenticated using (
  id = (select organization_id from profiles where user_id = auth.uid())
);

-- Trigger : nouveau user rattaché à la première organisation par défaut
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
