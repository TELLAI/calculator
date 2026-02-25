-- Politique RLS : seuls les admins peuvent modifier une récolte
drop policy if exists "recoltes_update" on recoltes;
create policy "recoltes_update" on recoltes for update to authenticated using (
  exists (
    select 1 from profiles
    where profiles.user_id = auth.uid() and profiles.role = 'admin'
  )
);
