-- Table des récoltes de dons
create table if not exists recoltes (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),
  recolte_date date default current_date,

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

-- Profils utilisateurs (rôle après connexion)
create table if not exists profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null check (role in ('admin', 'user')),
  created_at timestamptz default now(),
  unique(user_id)
);

create index if not exists idx_profiles_user_id on profiles(user_id);

-- RLS
alter table recoltes enable row level security;
alter table profiles enable row level security;

-- Supprimer les politiques existantes pour pouvoir réexécuter le script sans erreur
drop policy if exists "recoltes_select" on recoltes;
drop policy if exists "recoltes_insert" on recoltes;
drop policy if exists "recoltes_update" on recoltes;
drop policy if exists "recoltes_delete" on recoltes;
drop policy if exists "profiles_select_own" on profiles;

-- Tout utilisateur connecté peut lire et insérer des récoltes
create policy "recoltes_select" on recoltes for select to authenticated using (true);
create policy "recoltes_insert" on recoltes for insert to authenticated with check (true);

-- Seuls les admins peuvent modifier et supprimer (vérifié côté app via profiles.role)
create policy "recoltes_update" on recoltes for update to authenticated using (
  exists (
    select 1 from profiles
    where profiles.user_id = auth.uid() and profiles.role = 'admin'
  )
);
create policy "recoltes_delete" on recoltes for delete to authenticated using (
  exists (
    select 1 from profiles
    where profiles.user_id = auth.uid() and profiles.role = 'admin'
  )
);

-- Lecture du profil : uniquement le sien
create policy "profiles_select_own" on profiles for select to authenticated using (auth.uid() = user_id);

-- Création des profils : à faire manuellement ou via trigger (voir ci-dessous)
-- Exemple d'insert pour ton premier admin (remplace USER_UUID par l'id après inscription) :
-- insert into profiles (user_id, role) values ('USER_UUID', 'admin');
-- insert into profiles (user_id, role) values ('AUTRE_USER_UUID', 'user');

-- Optionnel : trigger pour créer un profil "user" par défaut à l'inscription
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (user_id, role)
  values (new.id, 'user');
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
