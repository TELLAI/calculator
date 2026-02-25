import type { BilletKey, PieceKey } from "@/lib/constants";

export type FormState = {
  [K in BilletKey]: number;
} & {
  [K in PieceKey]: number;
} & {
  cotisation_adherents: number;
  cheques: number;
  carte_bancaire: number;
  autres: number;
  recolte_date: string;
  personnes_presentes: string;
  observations: string;
};
