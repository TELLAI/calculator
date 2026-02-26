import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Recolte = {
  id: string;
  created_at: string;
  recolte_date: string | null;
  organization_id: string;

  billet_100: number;
  billet_50: number;
  billet_20: number;
  billet_10: number;
  billet_5: number;

  piece_2: number;
  piece_1: number;
  piece_050: number;
  piece_020: number;
  piece_010: number;
  piece_005: number;
  piece_002: number;
  piece_001: number;

  cotisation_adherents: number;
  cheques: number;
  carte_bancaire: number;
  autres: number;

  personnes_presentes: string | null;
  observations: string | null;
};

export type RecolteInsert = Omit<Recolte, "id" | "created_at">;
