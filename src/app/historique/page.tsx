"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import type { Recolte } from "@/lib/supabase";
import {
  totalRecolte,
  totalBillets,
  totalPieces,
  formatDate,
  formatRecolteDateLong,
} from "@/lib/recolte-utils";

function getDateForRecolte(r: Recolte): Date {
  const str = r.recolte_date || r.created_at;
  return new Date(str + (r.recolte_date ? "T12:00:00" : ""));
}

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

  const { totalCollecte, moyenneMois, tendanceMois } = useMemo(() => {
    const total = recoltes.reduce((s, r) => s + totalRecolte(r), 0);
    const now = new Date();
    const yearNow = now.getFullYear();
    const monthNow = now.getMonth();

    const startCurrentMonth = new Date(yearNow, monthNow, 1);
    const startPrevMonth = new Date(yearNow, monthNow - 1, 1);
    const endPrevMonth = new Date(yearNow, monthNow, 0, 23, 59, 59);

    const recoltesMoisEnCours = recoltes.filter(
      (r) => getDateForRecolte(r) >= startCurrentMonth
    );
    const recoltesMoisPrecedent = recoltes.filter((r) => {
      const d = getDateForRecolte(r);
      return d >= startPrevMonth && d <= endPrevMonth;
    });

    const totalMoisEnCours = recoltesMoisEnCours.reduce(
      (s, r) => s + totalRecolte(r),
      0
    );
    const totalMoisPrecedent = recoltesMoisPrecedent.reduce(
      (s, r) => s + totalRecolte(r),
      0
    );

    const nbRecoltesMoisEnCours = recoltesMoisEnCours.length;
    const moyenneMois =
      nbRecoltesMoisEnCours > 0
        ? totalMoisEnCours / nbRecoltesMoisEnCours
        : 0;

    let tendanceMois = 0;
    if (totalMoisPrecedent > 0) {
      tendanceMois =
        ((totalMoisEnCours - totalMoisPrecedent) / totalMoisPrecedent) * 100;
    } else if (totalMoisEnCours > 0) {
      tendanceMois = 100;
    }

    return {
      totalCollecte: total,
      moyenneMois,
      tendanceMois,
    };
  }, [recoltes]);

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
      <header className="flex items-center justify-between border-b border-[var(--border)] bg-[var(--card)] px-4 py-3 shadow-sm">
        <Link
          href="/"
          className="rounded-lg bg-[var(--accent)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--accent-hover)]"
        >
          + Nouvelle récolte
        </Link>
        <button
          type="button"
          onClick={logout}
          className="text-sm text-[var(--muted)] hover:text-[var(--foreground)]"
        >
          Déconnexion
        </button>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-6">
        <div className="mb-6">
          <h1 className="text-xl font-semibold text-[var(--foreground)]">
            Gestion des Récoltes
          </h1>
          <p className="mt-0.5 text-sm text-[var(--muted)]">
            Suivi mensuel et analyse des données
          </p>
        </div>

        {loading && (
          <p className="text-center text-[var(--muted)]">Chargement…</p>
        )}
        {error && (
          <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
            {error}
          </p>
        )}

        {!loading && !error && recoltes.length > 0 && (
          <>
            <section className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-4 shadow-sm">
                <div className="flex items-center gap-2 text-[var(--muted)]">
                  <span className="text-lg" aria-hidden>📅</span>
                  <span className="text-xs font-medium uppercase">
                    Total collecté
                  </span>
                </div>
                <p className="mt-2 text-xl font-semibold text-[var(--foreground)]">
                  {totalCollecte.toFixed(2)} €
                </p>
              </div>
              <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-4 shadow-sm">
                <div className="flex items-center gap-2 text-[var(--muted)]">
                  <span className="text-lg text-green-600" aria-hidden>📈</span>
                  <span className="text-xs font-medium uppercase">
                    Moyenne du mois en cours
                  </span>
                </div>
                <p className="mt-2 text-xl font-semibold text-[var(--foreground)]">
                  {moyenneMois.toFixed(2)} €
                </p>
              </div>
              <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-4 shadow-sm">
                <div className="flex items-center gap-2 text-[var(--muted)]">
                  <span className="text-lg text-purple-600" aria-hidden>📦</span>
                  <span className="text-xs font-medium uppercase">
                    Tendance (vs mois précédent)
                  </span>
                </div>
                <p
                  className={`mt-2 text-xl font-semibold ${
                    tendanceMois >= 0 ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {tendanceMois >= 0 ? "+" : ""}
                  {tendanceMois.toFixed(1)} %
                </p>
              </div>
            </section>

            <section>
              <div className="mb-3 flex items-center justify-between">
                <h2 className="text-base font-semibold text-[var(--foreground)]">
                  Historique des Récoltes
                </h2>
                <span className="text-sm text-[var(--accent)]">Afficher tout</span>
              </div>
              <ul className="space-y-4">
                {recoltes.map((r) => {
                  const dateStr = r.recolte_date || r.created_at.slice(0, 10);
                  const total = totalRecolte(r);
                  const billets = totalBillets(r);
                  const pieces = totalPieces(r);
                  const cheques = r.cheques ?? 0;
                  const cb = r.carte_bancaire ?? 0;
                  return (
                    <li
                      key={r.id}
                      className="relative rounded-xl border border-[var(--border)] bg-[var(--card)] p-4 shadow-sm"
                    >
                      <div className="absolute right-4 top-4 text-right">
                        <p className="text-xl font-semibold text-[var(--success)]">
                          {total.toFixed(2)} €
                        </p>
                        <p className="text-xs text-[var(--muted)]">
                          Total récolté
                        </p>
                      </div>
                      <p className="text-sm font-medium text-[var(--foreground)] pr-24">
                        {r.recolte_date
                          ? formatRecolteDateLong(dateStr)
                          : formatDate(r.created_at)}
                      </p>
                      {r.personnes_presentes && (
                        <p className="mt-1 text-sm text-[var(--muted)]">
                          Personnes : {r.personnes_presentes}
                        </p>
                      )}
                      <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-sm text-[var(--muted)]">
                        <span>Billets {billets.toFixed(2)} €</span>
                        <span>Pièces {pieces.toFixed(2)} €</span>
                        <span>Chèques {cheques.toFixed(2)} €</span>
                        <span>Carte Bancaire {cb.toFixed(2)} €</span>
                      </div>
                      {r.observations && (
                        <p className="mt-2 text-sm text-[var(--muted)]">
                          Observations : {r.observations}
                        </p>
                      )}
                      <div className="mt-4 flex flex-wrap gap-2">
                        <Link
                          href={`/historique/${r.id}`}
                          className="rounded-lg bg-[var(--accent)] px-3 py-1.5 text-sm font-medium text-white hover:bg-[var(--accent-hover)]"
                        >
                          Voir le détail
                        </Link>
                        {isAdmin && (
                          <>
                            <Link
                              href={`/historique/${r.id}/modifier`}
                              className="rounded-lg border border-[var(--border)] bg-white px-3 py-1.5 text-sm font-medium hover:bg-[var(--background)]"
                            >
                              Modifier
                            </Link>
                            <button
                              type="button"
                              onClick={() => handleDelete(r.id)}
                              disabled={deletingId === r.id}
                              className="rounded-lg border border-red-300 px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50 disabled:opacity-50"
                            >
                              {deletingId === r.id ? "Suppression…" : "Supprimer"}
                            </button>
                          </>
                        )}
                      </div>
                    </li>
                  );
                })}
              </ul>
            </section>
          </>
        )}

        {!loading && !error && recoltes.length === 0 && (
          <p className="text-center text-[var(--muted)]">
            Aucune récolte sur les 3 derniers mois.
          </p>
        )}
      </main>
    </div>
  );
}
