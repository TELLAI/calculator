"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import type { Recolte } from "@/lib/supabase";

const BILLETS = [
  { key: "billet_100", valeur: 100 },
  { key: "billet_50", valeur: 50 },
  { key: "billet_20", valeur: 20 },
  { key: "billet_10", valeur: 10 },
  { key: "billet_5", valeur: 5 },
] as const;
const PIECES = [
  { key: "piece_2", valeur: 2 },
  { key: "piece_1", valeur: 1 },
  { key: "piece_050", valeur: 0.5 },
  { key: "piece_020", valeur: 0.2 },
  { key: "piece_010", valeur: 0.1 },
  { key: "piece_005", valeur: 0.05 },
  { key: "piece_002", valeur: 0.02 },
  { key: "piece_001", valeur: 0.01 },
] as const;

function totalBillets(r: Recolte): number {
  return BILLETS.reduce((s, b) => s + (r[b.key] || 0) * b.valeur, 0);
}
function totalPieces(r: Recolte): number {
  return PIECES.reduce((s, p) => s + (r[p.key] || 0) * p.valeur, 0);
}
function totalRecolte(r: Recolte): number {
  const esp = totalBillets(r) + totalPieces(r) + (r.cotisation_adherents || 0);
  return esp + (r.cheques || 0) + (r.carte_bancaire || 0) + (r.autres || 0);
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function HistoriquePage() {
  const [recoltes, setRecoltes] = useState<Recolte[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const troisMois = new Date();
    troisMois.setMonth(troisMois.getMonth() - 3);

    supabase
      .from("recoltes")
      .select("*")
      .gte("created_at", troisMois.toISOString())
      .order("created_at", { ascending: false })
      .then(({ data, error: err }) => {
        setLoading(false);
        if (err) {
          setError(err.message);
          return;
        }
        setRecoltes((data as Recolte[]) || []);
      });
  }, []);

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <header className="border-b border-[var(--border)] bg-[var(--card)] px-4 py-3">
        <div className="mx-auto flex max-w-2xl items-center justify-between">
          <Link
            href="/"
            className="text-sm text-[var(--accent)] hover:underline"
          >
            ← Nouvelle récolte
          </Link>
          <h1 className="text-lg font-semibold text-[var(--foreground)]">
            Historique (3 mois)
          </h1>
          <span />
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-4 py-6">
        {loading && (
          <p className="text-center text-gray-500">Chargement…</p>
        )}
        {error && (
          <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
            {error}
          </p>
        )}
        {!loading && !error && recoltes.length === 0 && (
          <p className="text-center text-gray-500">
            Aucune récolte sur les 3 derniers mois.
          </p>
        )}
        {!loading && !error && recoltes.length > 0 && (
          <ul className="space-y-4">
            {recoltes.map((r) => (
              <li
                key={r.id}
                className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-4"
              >
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm font-medium text-[var(--foreground)]">
                    {formatDate(r.created_at)}
                  </p>
                  <p className="text-lg font-semibold text-[var(--accent)]">
                    {totalRecolte(r).toFixed(2)} €
                  </p>
                </div>
                {(r.personnes_presentes || r.observations) && (
                  <div className="mt-2 space-y-1 text-sm text-gray-600">
                    {r.personnes_presentes && (
                      <p>Présents : {r.personnes_presentes}</p>
                    )}
                    {r.observations && (
                      <p>Obs. : {r.observations}</p>
                    )}
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </main>
    </div>
  );
}
