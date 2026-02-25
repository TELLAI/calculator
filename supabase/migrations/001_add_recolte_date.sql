-- À exécuter si la table recoltes existe déjà sans la colonne recolte_date
alter table recoltes add column if not exists recolte_date date default current_date;
