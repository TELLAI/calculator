-- Table des récoltes de dons
-- À exécuter dans l'éditeur SQL de ton projet Supabase

create table if not exists recoltes (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),

  -- Billets (quantités)
  billet_100 int default 0,
  billet_50 int default 0,
  billet_20 int default 0,
  billet_10 int default 0,
  billet_5 int default 0,

  -- Pièces (quantités)
  piece_2 int default 0,
  piece_1 int default 0,
  piece_050 int default 0,
  piece_020 int default 0,
  piece_010 int default 0,
  piece_005 int default 0,
  piece_002 int default 0,
  piece_001 int default 0,

  -- Autres montants (en euros)
  cotisation_adherents numeric(10, 2) default 0,
  cheques numeric(10, 2) default 0,
  carte_bancaire numeric(10, 2) default 0,
  autres numeric(10, 2) default 0,

  -- Métadonnées
  personnes_presentes text,
  observations text
);

-- Index pour filtrer par date (historique 3 mois)
create index if not exists idx_recoltes_created_at on recoltes (created_at desc);

-- RLS (Row Level Security) : à activer selon ton auth Supabase
-- alter table recoltes enable row level security;
-- create policy "Allow all for now" on recoltes for all using (true);
