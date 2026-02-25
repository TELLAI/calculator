import type { Recolte } from "@/lib/supabase";
import type { FormState } from "@/app/form-types";

export function recolteToFormState(r: Recolte): FormState {
  return {
    billet_100: r.billet_100 ?? 0,
    billet_50: r.billet_50 ?? 0,
    billet_20: r.billet_20 ?? 0,
    billet_10: r.billet_10 ?? 0,
    billet_5: r.billet_5 ?? 0,
    piece_2: r.piece_2 ?? 0,
    piece_1: r.piece_1 ?? 0,
    piece_050: r.piece_050 ?? 0,
    piece_020: r.piece_020 ?? 0,
    piece_010: r.piece_010 ?? 0,
    piece_005: r.piece_005 ?? 0,
    piece_002: r.piece_002 ?? 0,
    piece_001: r.piece_001 ?? 0,
    cotisation_adherents: r.cotisation_adherents ?? 0,
    cheques: r.cheques ?? 0,
    carte_bancaire: r.carte_bancaire ?? 0,
    autres: r.autres ?? 0,
    recolte_date: r.recolte_date ?? new Date().toISOString().slice(0, 10),
    personnes_presentes: r.personnes_presentes ?? "",
    observations: r.observations ?? "",
  };
}
