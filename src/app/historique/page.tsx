"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import type { Recolte } from "@/lib/supabase";
import { totalRecolte, formatDate, formatRecolteDate } from "@/lib/recolte-utils";

export default function HistoriquePage() {
  const { role, logout } = useAuth();
  const [recoltes, setRecoltes] = useState<Recolte[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const isAdmin = role === "admin";

  const load = () => {
    const troisMois = new Date();
    troisMois.setMonth(troisMois.getMonth() - 3);
    supabase
      .from("recoltes")
      .select("*")
      .gte("created_at", troisMois.toISOString())
      .order("recolte_date", { ascending: false, nullsFirst: false })
      .order("created_at", { ascending: false })
      .then(({ data, error: err }) => {
        setLoading(false);
        if (err) {
          setError(err.message);
          return;
        }
        setRecoltes((data as Recolte[]) || []);
      });
  };

  useEffect(() => {
    load();
  }, []);

  const handleDelete = async (id: string) => {
    if (!isAdmin) return;
    if (!confirm("Supprimer cette récolte ?")) return;
    setDeletingId(id);
    const { error: err } = await supabase.from("recoltes").delete().eq("id", id);
    setDeletingId(null);
    if (err) {
      setError(err.message);
      return;
    }
    setRecoltes((prev) => prev.filter((r) => r.id !== id));
  };

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <header className="flex items-center justify-between bg-[var(--header-bg)] px-4 py-3 text-white">
        <Link href="/" className="text-sm text-white/90 hover:text-white">
          ← Nouvelle récolte
        </Link>
        <h1 className="text-base font-semibold">Historique (3 mois)</h1>
        <button
          type="button"
          onClick={logout}
          className="rounded bg-white/10 px-3 py-1.5 text-sm hover:bg-white/20"
        >
          Déconnexion
        </button>
      </header>

      <main className="mx-auto max-w-2xl px-4 py-6">
        {loading && (
          <p className="text-center text-[var(--muted)]">Chargement…</p>
        )}
        {error && (
          <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
            {error}
          </p>
        )}
        {!loading && !error && recoltes.length === 0 && (
          <p className="text-center text-[var(--muted)]">
            Aucune récolte sur les 3 derniers mois.
          </p>
        )}
        {!loading && !error && recoltes.length > 0 && (
          <ul className="space-y-4">
            {recoltes.map((r) => (
              <li
                key={r.id}
                className="flex flex-col gap-2 rounded-xl border border-[var(--border)] bg-[var(--card)] p-4 shadow-sm"
              >
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-medium text-[var(--foreground)]">
                    {r.recolte_date
                      ? formatRecolteDate(r.recolte_date)
                      : formatDate(r.created_at)}
                  </p>
                  <p className="text-lg font-semibold text-[var(--accent)]">
                    {totalRecolte(r).toFixed(2)} €
                  </p>
                </div>
                {(r.personnes_presentes || r.observations) && (
                  <div className="space-y-1 text-sm text-[var(--muted)]">
                    {r.personnes_presentes && (
                      <p>Présents : {r.personnes_presentes}</p>
                    )}
                    {r.observations && <p>Obs. : {r.observations}</p>}
                  </div>
                )}
                <div className="mt-2 flex flex-wrap gap-2">
                  <Link
                    href={`/historique/${r.id}`}
                    className="rounded-lg bg-[var(--accent)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--accent-hover)]"
                  >
                    Voir le détail
                  </Link>
                  {isAdmin && (
                    <Link
                      href={`/historique/${r.id}/modifier`}
                      className="rounded-lg border border-[var(--border)] bg-white px-4 py-2 text-sm font-medium text-[var(--foreground)] hover:bg-[var(--background)]"
                    >
                      Modifier
                    </Link>
                  )}
                  {isAdmin && (
                    <button
                      type="button"
                      onClick={() => handleDelete(r.id)}
                      disabled={deletingId === r.id}
                      className="rounded-lg border border-red-300 bg-white px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 disabled:opacity-50"
                    >
                      {deletingId === r.id ? "Suppression…" : "Supprimer"}
                    </button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </main>
    </div>
  );
}
