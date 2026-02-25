import { BILLETS, PIECES } from "@/lib/constants";
import type { Recolte } from "@/lib/supabase";

export function totalBillets(r: Recolte): number {
  return BILLETS.reduce((s, b) => s + (r[b.key] || 0) * b.valeur, 0);
}

/** Somme des montants pièces (saisie directe en €). */
export function totalPieces(r: Recolte): number {
  return PIECES.reduce((s, p) => s + (r[p.key] ?? 0), 0);
}

export function totalAutres(r: Recolte): number {
  return (
    (r.cotisation_adherents || 0) +
    (r.cheques || 0) +
    (r.carte_bancaire || 0) +
    (r.autres || 0)
  );
}

export function totalRecolte(r: Recolte): number {
  return totalBillets(r) + totalPieces(r) + totalAutres(r);
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/** Pour une date seule (YYYY-MM-DD). */
export function formatRecolteDate(dateStr: string): string {
  return new Date(dateStr + "T12:00:00").toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

/** Date avec jour de la semaine (ex. "mercredi 25 février 2026"). */
export function formatRecolteDateLong(dateStr: string): string {
  return new Date(dateStr + "T12:00:00").toLocaleDateString("fr-FR", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}
