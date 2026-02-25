# Calculateur récoltes de dons

Application simple (Next.js + Supabase) pour enregistrer et consulter les récoltes de dons : billets, pièces, chèques, carte bancaire, personnes présentes et observations.

## Stack

- **Next.js 15** (App Router)
- **Tailwind CSS**
- **Supabase** (base de données)

## Démarrage

1. **Cloner / ouvrir le projet**

2. **Installer les dépendances**
   ```bash
   npm install
   ```

3. **Configurer Supabase**
   - Crée un projet sur [supabase.com](https://supabase.com).
   - Dans **SQL Editor**, exécute le script `supabase/schema.sql` pour créer la table `recoltes`.
   - Dans **Project Settings → API**, copie l’URL et la clé **anon public**.
   - Crée un fichier `.env.local` à la racine (voir `.env.example`) :
     ```
     NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
     NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
     ```

4. **Lancer en dev**
   ```bash
   npm run dev
   ```
   Puis ouvre [http://localhost:3000](http://localhost:3000).

## Pages

- **/** : formulaire « Nouvelle récolte » (billets, pièces, chèques, CB, totaux, personnes présentes, observations) + lien vers l’historique.
- **/historique** : liste des récoltes des 3 derniers mois.

## Déploiement (Vercel)

1. Push le repo sur GitHub.
2. Connecte le repo à [Vercel](https://vercel.com) et déploie.
3. Dans les paramètres du projet Vercel, ajoute les variables d’environnement `NEXT_PUBLIC_SUPABASE_URL` et `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
