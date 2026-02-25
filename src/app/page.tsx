"use client";

import { useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

const BILLETS = [
  { key: "billet_100", label: "Billet 100 €", valeur: 100 },
  { key: "billet_50", label: "Billet 50 €", valeur: 50 },
  { key: "billet_20", label: "Billet 20 €", valeur: 20 },
  { key: "billet_10", label: "Billet 10 €", valeur: 10 },
  { key: "billet_5", label: "Billet 5 €", valeur: 5 },
] as const;

const PIECES = [
  { key: "piece_2", label: "Pièce 2 €", valeur: 2 },
  { key: "piece_1", label: "Pièce 1 €", valeur: 1 },
  { key: "piece_050", label: "Pièce 0,50 €", valeur: 0.5 },
  { key: "piece_020", label: "Pièce 0,20 €", valeur: 0.2 },
  { key: "piece_010", label: "Pièce 0,10 €", valeur: 0.1 },
  { key: "piece_005", label: "Pièce 0,05 €", valeur: 0.05 },
  { key: "piece_002", label: "Pièce 0,02 €", valeur: 0.02 },
  { key: "piece_001", label: "Pièce 0,01 €", valeur: 0.01 },
] as const;

type FormState = {
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
  personnes_presentes: string;
  observations: string;
};

const initialForm: FormState = {
  billet_100: 0,
  billet_50: 0,
  billet_20: 0,
  billet_10: 0,
  billet_5: 0,
  piece_2: 0,
  piece_1: 0,
  piece_050: 0,
  piece_020: 0,
  piece_010: 0,
  piece_005: 0,
  piece_002: 0,
  piece_001: 0,
  cotisation_adherents: 0,
  cheques: 0,
  carte_bancaire: 0,
  autres: 0,
  personnes_presentes: "",
  observations: "",
};

function toNum(v: string | number): number {
  if (typeof v === "number") return v;
  const n = parseFloat(String(v).replace(",", "."));
  return isNaN(n) ? 0 : n;
}

export default function Home() {
  const [form, setForm] = useState<FormState>(initialForm);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  const totalBillets = BILLETS.reduce((s, b) => s + (form[b.key] || 0) * b.valeur, 0);
  const totalPieces = PIECES.reduce((s, p) => s + (form[p.key] || 0) * p.valeur, 0);
  const totalEspeces = totalBillets + totalPieces + toNum(form.cotisation_adherents);
  const autresMontants =
    toNum(form.cheques) + toNum(form.carte_bancaire) + toNum(form.autres);
  const totalFinal = totalEspeces + autresMontants;

  const update = (key: keyof FormState, value: string | number) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setMessage(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    try {
      const { error } = await supabase.from("recoltes").insert({
        billet_100: form.billet_100,
        billet_50: form.billet_50,
        billet_20: form.billet_20,
        billet_10: form.billet_10,
        billet_5: form.billet_5,
        piece_2: form.piece_2,
        piece_1: form.piece_1,
        piece_050: form.piece_050,
        piece_020: form.piece_020,
        piece_010: form.piece_010,
        piece_005: form.piece_005,
        piece_002: form.piece_002,
        piece_001: form.piece_001,
        cotisation_adherents: toNum(form.cotisation_adherents),
        cheques: toNum(form.cheques),
        carte_bancaire: toNum(form.carte_bancaire),
        autres: toNum(form.autres),
        personnes_presentes: form.personnes_presentes || null,
        observations: form.observations || null,
      });
      if (error) throw error;
      setForm(initialForm);
      setMessage({ type: "ok", text: "Récolte enregistrée." });
    } catch (err) {
      setMessage({
        type: "err",
        text: err instanceof Error ? err.message : "Erreur lors de l’enregistrement.",
      });
    } finally {
      setSaving(false);
    }
  };

  const resetForm = () => {
    setForm(initialForm);
    setMessage(null);
  };

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <header className="border-b border-[var(--border)] bg-[var(--card)] px-4 py-3">
        <div className="mx-auto flex max-w-2xl items-center justify-between">
          <h1 className="text-lg font-semibold text-[var(--foreground)]">
            Récolte des dons
          </h1>
          <Link
            href="/historique"
            className="rounded-md bg-[var(--accent)] px-3 py-1.5 text-sm font-medium text-white hover:bg-[var(--accent-hover)]"
          >
            Historique 3 mois
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-4 py-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-base font-medium text-[var(--foreground)]">
            Nouvelle récolte
          </h2>
          <button
            type="button"
            onClick={resetForm}
            className="text-sm text-[var(--accent)] hover:underline"
          >
            Réinitialiser
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Billets */}
          <section className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-4">
            <h3 className="mb-3 text-sm font-semibold text-[var(--foreground)]">
              Billets
            </h3>
            <div className="space-y-2">
              {BILLETS.map(({ key, label, valeur }) => (
                <div key={key} className="flex items-center gap-3">
                  <label className="w-28 text-sm text-gray-600">{label}</label>
                  <input
                    type="number"
                    min={0}
                    step={1}
                    value={form[key] || ""}
                    onChange={(e) => update(key, parseInt(e.target.value, 10) || 0)}
                    className="w-20 rounded border border-[var(--border)] px-2 py-1 text-right"
                  />
                </div>
              ))}
            </div>
            <p className="mt-2 text-sm font-medium text-[var(--foreground)]">
              Total billets : {totalBillets.toFixed(2)} €
            </p>
          </section>

          {/* Pièces */}
          <section className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-4">
            <h3 className="mb-3 text-sm font-semibold text-[var(--foreground)]">
              Pièces
            </h3>
            <div className="space-y-2">
              {PIECES.map(({ key, label, valeur }) => (
                <div key={key} className="flex items-center gap-3">
                  <label className="w-28 text-sm text-gray-600">{label}</label>
                  <input
                    type="number"
                    min={0}
                    step={1}
                    value={form[key] || ""}
                    onChange={(e) => update(key, parseInt(e.target.value, 10) || 0)}
                    className="w-20 rounded border border-[var(--border)] px-2 py-1 text-right"
                  />
                </div>
              ))}
            </div>
            <p className="mt-2 text-sm font-medium text-[var(--foreground)]">
              Total pièces : {totalPieces.toFixed(2)} €
            </p>
          </section>

          {/* Cotisation + autres moyens */}
          <section className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-4">
            <h3 className="mb-3 text-sm font-semibold text-[var(--foreground)]">
              Autres montants
            </h3>
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <label className="w-40 text-sm text-gray-600">
                  Cotisation adhérents (€)
                </label>
                <input
                  type="number"
                  min={0}
                  step={0.01}
                  value={form.cotisation_adherents || ""}
                  onChange={(e) =>
                    update("cotisation_adherents", e.target.value)
                  }
                  className="w-24 rounded border border-[var(--border)] px-2 py-1 text-right"
                />
              </div>
              <div className="flex items-center gap-3">
                <label className="w-40 text-sm text-gray-600">Chèques (€)</label>
                <input
                  type="number"
                  min={0}
                  step={0.01}
                  value={form.cheques || ""}
                  onChange={(e) => update("cheques", e.target.value)}
                  className="w-24 rounded border border-[var(--border)] px-2 py-1 text-right"
                />
              </div>
              <div className="flex items-center gap-3">
                <label className="w-40 text-sm text-gray-600">
                  Carte bancaire (€)
                </label>
                <input
                  type="number"
                  min={0}
                  step={0.01}
                  value={form.carte_bancaire || ""}
                  onChange={(e) => update("carte_bancaire", e.target.value)}
                  className="w-24 rounded border border-[var(--border)] px-2 py-1 text-right"
                />
              </div>
              <div className="flex items-center gap-3">
                <label className="w-40 text-sm text-gray-600">Autres (€)</label>
                <input
                  type="number"
                  min={0}
                  step={0.01}
                  value={form.autres || ""}
                  onChange={(e) => update("autres", e.target.value)}
                  className="w-24 rounded border border-[var(--border)] px-2 py-1 text-right"
                />
              </div>
            </div>
          </section>

          {/* Total final */}
          <div className="rounded-lg border-2 border-[var(--accent)] bg-[var(--card)] p-4">
            <p className="text-lg font-semibold text-[var(--foreground)]">
              Montant total de la récolte : {totalFinal.toFixed(2)} €
            </p>
          </div>

          {/* Personnes présentes & observations */}
          <section className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-4">
            <div className="space-y-3">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-600">
                  Personnes présentes
                </label>
                <input
                  type="text"
                  value={form.personnes_presentes}
                  onChange={(e) => update("personnes_presentes", e.target.value)}
                  placeholder="Noms séparés par des virgules"
                  className="w-full rounded border border-[var(--border)] px-3 py-2"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-600">
                  Observations
                </label>
                <textarea
                  value={form.observations}
                  onChange={(e) => update("observations", e.target.value)}
                  placeholder="Commentaires..."
                  rows={3}
                  className="w-full rounded border border-[var(--border)] px-3 py-2"
                />
              </div>
            </div>
          </section>

          {message && (
            <p
              className={
                message.type === "ok"
                  ? "text-sm text-green-600"
                  : "text-sm text-red-600"
              }
            >
              {message.text}
            </p>
          )}

          <button
            type="submit"
            disabled={saving}
            className="w-full rounded-lg bg-[var(--accent)] py-3 font-medium text-white hover:bg-[var(--accent-hover)] disabled:opacity-50"
          >
            {saving ? "Enregistrement…" : "Enregistrer la récolte"}
          </button>
        </form>
      </main>
    </div>
  );
}
