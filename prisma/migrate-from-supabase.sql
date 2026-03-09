-- Script de migration depuis Supabase vers Azure PostgreSQL
-- À exécuter UNE SEULE FOIS après avoir créé les tables avec: npx prisma migrate deploy
--
-- ÉTAPES :
-- 1. Exporter les données de Supabase (Table Editor > Export CSV ou pg_dump)
-- 2. Créer les tables Azure avec: npx prisma migrate deploy
-- 3. Insérer un utilisateur admin (voir section ci-dessous)
-- 4. Importer les récoltes existantes

-- ============================================================
-- CRÉER UN UTILISATEUR ADMIN
-- Remplace l'email et le mot de passe (hash bcrypt, rounds=10)
-- Pour générer un hash: node -e "const b=require('bcryptjs'); console.log(b.hashSync('TON_MOT_DE_PASSE',10))"
-- ============================================================

-- 1. Créer l'organisation
INSERT INTO organizations (id, name, created_at)
VALUES (gen_random_uuid(), 'Ton Association', NOW())
ON CONFLICT DO NOTHING;

-- 2. Créer l'utilisateur admin (remplace les valeurs)
-- Le password_hash ci-dessous correspond à "password123" — CHANGE-LE OBLIGATOIREMENT
INSERT INTO users (id, email, password_hash, created_at)
VALUES (
  gen_random_uuid(),
  'admin@ton-association.fr',
  '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhmW', -- hash de "password123"
  NOW()
);

-- 3. Créer le profil admin lié à l'organisation
INSERT INTO profiles (id, user_id, organization_id, role, created_at)
SELECT
  gen_random_uuid(),
  u.id,
  o.id,
  'admin',
  NOW()
FROM users u, organizations o
WHERE u.email = 'admin@ton-association.fr'
  AND o.name = 'Ton Association';

-- ============================================================
-- IMPORTER LES RÉCOLTES EXISTANTES (exemple)
-- Après export CSV de Supabase, adapter selon tes données
-- ============================================================

-- INSERT INTO recoltes (id, created_at, recolte_date, organization_id, ...)
-- SELECT id, created_at, recolte_date, '<ID_ORGANISATION>', ...
-- FROM import_temp_table;
