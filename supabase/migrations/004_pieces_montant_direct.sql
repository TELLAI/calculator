-- Pièces : stocker des montants (€) au lieu des quantités
-- Conversion des anciennes données : quantité * valeur = montant
alter table recoltes
  alter column piece_2 type numeric(10, 2) using (piece_2::numeric * 2),
  alter column piece_1 type numeric(10, 2) using (piece_1::numeric * 1),
  alter column piece_050 type numeric(10, 2) using (piece_050::numeric * 0.5),
  alter column piece_020 type numeric(10, 2) using (piece_020::numeric * 0.2),
  alter column piece_010 type numeric(10, 2) using (piece_010::numeric * 0.1),
  alter column piece_005 type numeric(10, 2) using (piece_005::numeric * 0.05),
  alter column piece_002 type numeric(10, 2) using (piece_002::numeric * 0.02),
  alter column piece_001 type numeric(10, 2) using (piece_001::numeric * 0.01);

-- Valeurs par défaut
alter table recoltes
  alter column piece_2 set default 0,
  alter column piece_1 set default 0,
  alter column piece_050 set default 0,
  alter column piece_020 set default 0,
  alter column piece_010 set default 0,
  alter column piece_005 set default 0,
  alter column piece_002 set default 0,
  alter column piece_001 set default 0;
