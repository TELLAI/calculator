# Calculateur récoltes de dons

Application (Next.js + Supabase) pour enregistrer et consulter les récoltes de dons : billets, pièces, chèques, carte bancaire, avec authentification et rôles (admin / user).

## Stack

- **Next.js 15** (App Router)
- **Tailwind CSS**
- **Supabase** (Auth + base de données)
- **@supabase/ssr** (sessions en middleware)

## Démarrage

1. **Installer les dépendances**
   ```bash
   npm install
   ```

2. **Configurer Supabase**
   - Crée un projet sur [supabase.com](https://supabase.com).
   - Dans **Authentication → Providers**, active **Email** (login par email / mot de passe).
   - Dans **SQL Editor**, exécute tout le script `supabase/schema.sql` (tables `recoltes`, `profiles`, RLS, trigger).
   - Dans **Project Settings → API**, copie l’URL et la clé **anon public**.
   - Crée un fichier `.env.local` à la racine (voir `.env.example`) :
     ```
     NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
     NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
     ```

3. **Créer des utilisateurs et rôles**
   - Dans **Authentication → Users**, crée au moins un utilisateur (ou inscris-toi via l’app si tu ajoutes une page d’inscription).
   - Par défaut, le trigger `on_auth_user_created` crée un profil avec le rôle **user**.
   - Pour donner le rôle **admin** (création + suppression de récoltes), exécute dans SQL Editor en remplaçant `USER_UUID` par l’id de l’utilisateur :
     ```sql
     update profiles set role = 'admin' where user_id = 'USER_UUID';
     ```

4. **Lancer en dev**
   ```bash
   npm run dev
   ```
   Ouvre [http://localhost:3000](http://localhost:3000). Tu seras redirigé vers **/login** si tu n’es pas connecté.

## Pages

- **/login** : connexion (email / mot de passe).
- **/** : formulaire « Nouvelle récolte » avec totaux par ligne (ex. 2 × 10 € = 20 €), totaux par type (billets, pièces, autres) et total final. Boutons Enregistrer (vert) et Annuler (gris).
- **/historique** : liste des récoltes des 3 derniers mois. Chaque récolte a un lien **Voir le détail**. Les **admin** voient en plus un bouton **Supprimer**.
- **/historique/[id]** : détail d’une récolte (tableau complet). Bouton **Imprimer / Enregistrer en PDF** (ouvre la boîte de dialogue d’impression du navigateur : imprimante ou « Enregistrer en PDF »). Les admin peuvent **Supprimer la récolte**.

## Rôles

- **user** : peut créer des récoltes et consulter l’historique / détail / imprimer. Ne peut pas supprimer.
- **admin** : idem + peut supprimer des récoltes.

## Suppression automatique des récoltes de plus de 3 mois (cron)

Un job planifié supprime chaque jour les récoltes dont la date de création est antérieure à 3 mois.

1. **Activer pg_cron** : dans le Dashboard Supabase, va dans **Database → Extensions**, cherche **pg_cron** et active-la.
2. **Créer le job** : dans **SQL Editor**, exécute le script `supabase/migrations/003_cron_delete_old_recoltes.sql`.  
   Le job `delete_old_recoltes` s’exécute tous les jours à 3h UTC.

## Déploiement (Vercel)

1. Push le repo sur GitHub.
2. Connecte le repo à [Vercel](https://vercel.com) et déploie.
3. Dans les paramètres du projet Vercel, ajoute les variables d’environnement `NEXT_PUBLIC_SUPABASE_URL` et `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
