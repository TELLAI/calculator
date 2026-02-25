"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { BILLETS, PIECES } from "@/lib/constants";
import {
  totalBillets,
  totalPieces,
  totalAutres,
  totalRecolte,
  formatDate,
  formatRecolteDate,
} from "@/lib/recolte-utils";
import type { Recolte } from "@/lib/supabase";

export default function DetailRecoltePage() {
  const params = useParams();
  const router = useRouter();
  const { role, logout } = useAuth();
  const id = params.id as string;
  const [recolte, setRecolte] = useState<Recolte | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);

  const isAdmin = role === "admin";

  useEffect(() => {
    supabase
      .from("recoltes")
      .select("*")
      .eq("id", id)
      .single()
      .then(({ data, error: err }) => {
        setLoading(false);
        if (err) {
          setError(err.message);
          return;
        }
        setRecolte(data as Recolte);
      });
  }, [id]);

  const handlePrint = useCallback(() => {
    window.print();
  }, []);

  const handleDelete = async () => {
    if (!isAdmin) return;
    if (!confirm("Supprimer définitivement cette récolte ?")) return;
    setDeleting(true);
    const { error: err } = await supabase.from("recoltes").delete().eq("id", id);
    setDeleting(false);
    if (err) {
      setError(err.message);
      return;
    }
    router.push("/historique");
    router.refresh();
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--background)]">
        <p className="text-[var(--muted)]">Chargement…</p>
      </div>
    );
  }

  if (error || !recolte) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-[var(--background)] px-4">
        <p className="text-red-600">{error || "Récolte introuvable."}</p>
        <Link
          href="/historique"
          className="text-[var(--accent)] hover:underline"
        >
          Retour à l’historique
        </Link>
      </div>
    );
  }

  const totalB = totalBillets(recolte);
  const totalP = totalPieces(recolte);
  const totalA = totalAutres(recolte);
  const total = totalRecolte(recolte);

  return (
    <>
      <div className="min-h-screen bg-[var(--background)]">
        <header className="flex items-center justify-between bg-[var(--header-bg)] px-4 py-3 text-white print:hidden">
          <Link href="/historique" className="text-sm text-white/90 hover:text-white">
            ← Historique
          </Link>
          <h1 className="text-base font-semibold">Détail de la récolte</h1>
          <button
            type="button"
            onClick={logout}
            className="rounded bg-white/10 px-3 py-1.5 text-sm hover:bg-white/20"
          >
            Déconnexion
          </button>
        </header>

        <main className="mx-auto max-w-2xl px-4 py-6 print:max-w-none print:px-6">
          <div ref={printRef} className="rounded-xl border border-[var(--border)] bg-white p-6 shadow-sm print:shadow-none">
            <h2 className="mb-4 text-lg font-semibold text-[var(--foreground)]">
              Récolte du{" "}
              {recolte.recolte_date
                ? formatRecolteDate(recolte.recolte_date)
                : formatDate(recolte.created_at)}
            </h2>

            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--border)]">
                  <th className="pb-2 font-semibold text-[var(--foreground)]">
                    DÉSIGNATION
                  </th>
                  <th className="w-16 text-center pb-2 font-semibold text-[var(--foreground)]">
                    QTÉ
                  </th>
                  <th className="w-24 text-right pb-2 font-semibold text-[var(--foreground)]">
                    MONTANT
                  </th>
                </tr>
              </thead>
              <tbody>
                {BILLETS.map(({ key, label, valeur }) => {
                  const qty = recolte[key] || 0;
                  const montant = qty * valeur;
                  return (
                    <tr key={key} className="border-b border-[var(--border)]">
                      <td className="py-1.5">{label}</td>
                      <td className="text-center">{qty}</td>
                      <td className="text-right font-medium text-[var(--accent)]">
                        {montant.toFixed(2)} €
                      </td>
                    </tr>
                  );
                })}
                <tr className="border-b border-[var(--border)] bg-gray-100 font-semibold print:bg-gray-100">
                  <td className="py-2" colSpan={2}>
                    MONTANT TOTAL BILLETS
                  </td>
                  <td className="text-right text-[var(--accent)]">
                    {totalB.toFixed(2)} €
                  </td>
                </tr>
                {PIECES.map(({ key, label, valeur }) => {
                  const qty = recolte[key] || 0;
                  const montant = qty * valeur;
                  return (
                    <tr key={key} className="border-b border-[var(--border)]">
                      <td className="py-1.5">{label}</td>
                      <td className="text-center">{qty}</td>
                      <td className="text-right font-medium text-[var(--accent)]">
                        {montant.toFixed(2)} €
                      </td>
                    </tr>
                  );
                })}
                <tr className="border-b border-[var(--border)] bg-gray-100 font-semibold print:bg-gray-100">
                  <td className="py-2" colSpan={2}>
                    MONTANT TOTAL PIÈCES
                  </td>
                  <td className="text-right text-[var(--accent)]">
                    {totalP.toFixed(2)} €
                  </td>
                </tr>
                <tr className="border-b border-[var(--border)]">
                  <td className="py-1.5">Cotisation adhérents</td>
                  <td className="text-center">—</td>
                  <td className="text-right text-[var(--accent)]">
                    {(recolte.cotisation_adherents || 0).toFixed(2)} €
                  </td>
                </tr>
                <tr className="border-b border-[var(--border)]">
                  <td className="py-1.5">Chèques</td>
                  <td className="text-center">—</td>
                  <td className="text-right text-[var(--accent)]">
                    {(recolte.cheques || 0).toFixed(2)} €
                  </td>
                </tr>
                <tr className="border-b border-[var(--border)]">
                  <td className="py-1.5">Carte bancaire</td>
                  <td className="text-center">—</td>
                  <td className="text-right text-[var(--accent)]">
                    {(recolte.carte_bancaire || 0).toFixed(2)} €
                  </td>
                </tr>
                <tr className="border-b border-[var(--border)]">
                  <td className="py-1.5">Autres</td>
                  <td className="text-center">—</td>
                  <td className="text-right text-[var(--accent)]">
                    {(recolte.autres || 0).toFixed(2)} €
                  </td>
                </tr>
                <tr className="border-b border-[var(--border)] bg-gray-100 font-semibold print:bg-gray-100">
                  <td className="py-2" colSpan={2}>
                    MONTANT TOTAL AUTRES
                  </td>
                  <td className="text-right text-[var(--accent)]">
                    {totalA.toFixed(2)} €
                  </td>
                </tr>
                <tr className="bg-[var(--success-bg)] font-semibold print:bg-[var(--success-bg)]">
                  <td className="py-3" colSpan={2}>
                    MONTANT TOTAL DE LA RÉCOLTE
                  </td>
                  <td className="text-right text-lg text-[var(--success)]">
                    {total.toFixed(2)} €
                  </td>
                </tr>
              </tbody>
            </table>

            {(recolte.personnes_presentes || recolte.observations) && (
              <div className="mt-4 space-y-2 border-t border-[var(--border)] pt-4 text-sm text-[var(--muted)]">
                {recolte.personnes_presentes && (
                  <div>
                    <strong className="text-[var(--foreground)]">
                      Personnes présentes :
                    </strong>
                    <ul className="mt-1 list-inside list-disc space-y-0.5 pl-1">
                      {recolte.personnes_presentes
                        .split(",")
                        .map((s) => s.trim())
                        .filter(Boolean)
                        .map((name, i) => (
                          <li key={i}>{name}</li>
                        ))}
                    </ul>
                  </div>
                )}
                {recolte.observations && (
                  <p>
                    <strong className="text-[var(--foreground)]">
                      Observations :
                    </strong>{" "}
                    {recolte.observations}
                  </p>
                )}
              </div>
            )}
          </div>

          <div className="mt-6 flex flex-wrap gap-3 print:hidden">
            <button
              type="button"
              onClick={handlePrint}
              className="rounded-lg bg-[var(--accent)] px-4 py-3 font-medium text-white hover:bg-[var(--accent-hover)]"
            >
              Imprimer / Enregistrer en PDF
            </button>
            {isAdmin && (
              <Link
                href={`/historique/${id}/modifier`}
                className="rounded-lg border border-[var(--border)] bg-white px-4 py-3 font-medium text-[var(--foreground)] hover:bg-[var(--background)]"
              >
                Modifier la récolte
              </Link>
            )}
            {isAdmin && (
              <button
                type="button"
                onClick={handleDelete}
                disabled={deleting}
                className="rounded-lg border border-red-300 bg-white px-4 py-3 font-medium text-red-600 hover:bg-red-50 disabled:opacity-50"
              >
                {deleting ? "Suppression…" : "Supprimer la récolte"}
              </button>
            )}
            <Link
              href="/historique"
              className="rounded-lg border border-[var(--border)] bg-white px-4 py-3 font-medium text-[var(--foreground)] hover:bg-[var(--background)]"
            >
              Retour à l’historique
            </Link>
          </div>
        </main>
      </div>

    </>
  );
}
