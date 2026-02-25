-- Cron : supprimer les récoltes de plus de 3 mois
-- Prérequis : activer l’extension pg_cron dans le Dashboard Supabase
-- (Database → Extensions → pg_cron), ou exécuter : create extension if not exists pg_cron;

-- Supprimer le job s’il existe déjà (pour réexécution sans erreur)
select cron.unschedule(jobid) from cron.job where jobname = 'delete_old_recoltes';

-- Tous les jours à 3h du matin (UTC), supprimer les récoltes plus anciennes que 3 mois
select cron.schedule(
  'delete_old_recoltes',
  '0 3 * * *',
  $$delete from public.recoltes where created_at < now() - interval '3 months'$$
);
