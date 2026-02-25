"use client";

import { BILLETS, PIECES } from "@/lib/constants";
import type { FormState } from "@/app/form-types";

function toNum(v: string | number): number {
  if (typeof v === "number") return v;
  const n = parseFloat(String(v).replace(",", "."));
  return isNaN(n) ? 0 : n;
}

function parsePersonnes(s: string): string[] {
  return s ? s.split(",").map((x) => x.trim()).filter(Boolean) : [];
}

type Props = {
  form: FormState;
  update: (key: keyof FormState, value: string | number) => void;
  currentPerson: string;
  setCurrentPerson: (s: string) => void;
  addPerson: () => void;
  removePerson: (index: number) => void;
  onSubmit: (e: React.FormEvent) => void;
  saving: boolean;
  message: { type: "ok" | "err"; text: string } | null;
  submitLabel: string;
  secondaryLabel: string;
  secondaryOnClick: () => void;
};

export function RecolteFormBody({
  form,
  update,
  currentPerson,
  setCurrentPerson,
  addPerson,
  removePerson,
  onSubmit,
  saving,
  message,
  submitLabel,
  secondaryLabel,
  secondaryOnClick,
}: Props) {
  const totalBillets = BILLETS.reduce((s, b) => s + (form[b.key] || 0) * b.valeur, 0);
  const totalPieces = PIECES.reduce((s, p) => s + (form[p.key] || 0) * p.valeur, 0);
  const totalAutres =
    toNum(form.cotisation_adherents) +
    toNum(form.cheques) +
    toNum(form.carte_bancaire) +
    toNum(form.autres);
  const totalFinal = totalBillets + totalPieces + totalAutres;
  const personnesList = parsePersonnes(form.personnes_presentes);

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <div>
        <label className="mb-1 block text-sm font-medium text-[var(--foreground)]">
          Date de la récolte
        </label>
        <input
          type="date"
          value={form.recolte_date || ""}
          onChange={(e) => update("recolte_date", e.target.value)}
          required
          className="rounded-lg border border-[var(--input-border)] bg-[var(--background)] px-3 py-2 text-sm text-[var(--foreground)]"
        />
      </div>

      <section>
        <h3 className="mb-2 text-sm font-semibold text-[var(--foreground)]">BILLETS</h3>
        <div className="overflow-hidden rounded-lg border border-[var(--border)]">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-[var(--border)] bg-[var(--background)]">
                <th className="px-3 py-2 text-xs font-semibold text-[var(--foreground)]">
                  DÉSIGNATION
                </th>
                <th className="w-20 px-2 py-2 text-center text-xs font-semibold text-[var(--foreground)]">
                  QUANTITÉ
                </th>
                <th className="w-24 px-2 py-2 text-right text-xs font-semibold text-[var(--foreground)]">
                  MONTANT
                </th>
              </tr>
            </thead>
            <tbody>
              {BILLETS.map(({ key, label, valeur }) => {
                const qty = form[key] || 0;
                const montant = qty * valeur;
                return (
                  <tr
                    key={key}
                    className="border-b border-[var(--border)] last:border-0"
                  >
                    <td className="py-2 pl-3 text-sm font-medium text-[var(--foreground)]">
                      {label}
                    </td>
                    <td className="py-2">
                      <input
                        type="number"
                        min={0}
                        step={1}
                        value={qty || ""}
                        onChange={(e) =>
                          update(key, parseInt(e.target.value, 10) || 0)
                        }
                        className="w-full rounded border border-[var(--input-border)] bg-white px-2 py-1 text-right text-sm"
                      />
                    </td>
                    <td className="py-2 pr-3 text-right text-sm font-medium text-[var(--accent)]">
                      {montant.toFixed(2)} €
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <p className="mt-2 text-sm font-semibold text-[var(--foreground)]">
          MONTANT TOTAL BILLETS :{" "}
          <span className="text-[var(--accent)]">{totalBillets.toFixed(2)} €</span>
        </p>
      </section>

      <section>
        <h3 className="mb-2 text-sm font-semibold text-[var(--foreground)]">PIÈCES</h3>
        <div className="overflow-hidden rounded-lg border border-[var(--border)]">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-[var(--border)] bg-[var(--background)]">
                <th className="px-3 py-2 text-xs font-semibold text-[var(--foreground)]">
                  DÉSIGNATION
                </th>
                <th className="w-20 px-2 py-2 text-center text-xs font-semibold text-[var(--foreground)]">
                  QUANTITÉ
                </th>
                <th className="w-24 px-2 py-2 text-right text-xs font-semibold text-[var(--foreground)]">
                  MONTANT
                </th>
              </tr>
            </thead>
            <tbody>
              {PIECES.map(({ key, label, valeur }) => {
                const qty = form[key] || 0;
                const montant = qty * valeur;
                return (
                  <tr
                    key={key}
                    className="border-b border-[var(--border)] last:border-0"
                  >
                    <td className="py-2 pl-3 text-sm font-medium text-[var(--foreground)]">
                      {label}
                    </td>
                    <td className="py-2">
                      <input
                        type="number"
                        min={0}
                        step={1}
                        value={qty || ""}
                        onChange={(e) =>
                          update(key, parseInt(e.target.value, 10) || 0)
                        }
                        className="w-full rounded border border-[var(--input-border)] bg-white px-2 py-1 text-right text-sm"
                      />
                    </td>
                    <td className="py-2 pr-3 text-right text-sm font-medium text-[var(--accent)]">
                      {montant.toFixed(2)} €
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <p className="mt-2 text-sm font-semibold text-[var(--foreground)]">
          MONTANT TOTAL PIÈCES :{" "}
          <span className="text-[var(--accent)]">{totalPieces.toFixed(2)} €</span>
        </p>
      </section>

      <section>
        <h3 className="mb-2 text-sm font-semibold text-[var(--foreground)]">AUTRES</h3>
        <div className="space-y-2 rounded-lg border border-[var(--border)] p-3">
          <div className="flex items-center justify-between gap-2">
            <span className="text-sm text-[var(--foreground)]">
              Cotisation adhérents
            </span>
            <input
              type="number"
              min={0}
              step={0.01}
              value={form.cotisation_adherents || ""}
              onChange={(e) => update("cotisation_adherents", e.target.value)}
              className="w-24 rounded border border-[var(--input-border)] bg-white px-2 py-1 text-right text-sm"
            />
          </div>
          <div className="flex items-center justify-between gap-2">
            <span className="text-sm text-[var(--foreground)]">Chèques</span>
            <input
              type="number"
              min={0}
              step={0.01}
              value={form.cheques || ""}
              onChange={(e) => update("cheques", e.target.value)}
              className="w-24 rounded border border-[var(--input-border)] bg-white px-2 py-1 text-right text-sm"
            />
          </div>
          <div className="flex items-center justify-between gap-2">
            <span className="text-sm text-[var(--foreground)]">
              Carte bancaire
            </span>
            <input
              type="number"
              min={0}
              step={0.01}
              value={form.carte_bancaire || ""}
              onChange={(e) => update("carte_bancaire", e.target.value)}
              className="w-24 rounded border border-[var(--input-border)] bg-white px-2 py-1 text-right text-sm"
            />
          </div>
          <div className="flex items-center justify-between gap-2">
            <span className="text-sm text-[var(--foreground)]">Autres</span>
            <input
              type="number"
              min={0}
              step={0.01}
              value={form.autres || ""}
              onChange={(e) => update("autres", e.target.value)}
              className="w-24 rounded border border-[var(--input-border)] bg-white px-2 py-1 text-right text-sm"
            />
          </div>
        </div>
        <p className="mt-2 text-sm font-semibold text-[var(--foreground)]">
          MONTANT TOTAL AUTRES :{" "}
          <span className="text-[var(--accent)]">{totalAutres.toFixed(2)} €</span>
        </p>
      </section>

      <div className="rounded-lg bg-[var(--success-bg)] p-4">
        <p className="text-base font-semibold text-[var(--foreground)]">
          MONTANT TOTAL DE LA RÉCOLTE :{" "}
          <span className="text-lg text-[var(--success)]">
            {totalFinal.toFixed(2)} €
          </span>
        </p>
      </div>

      <section className="space-y-3">
        <div>
          <label className="mb-1 block text-sm font-medium text-[var(--foreground)]">
            Personnes présentes
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={currentPerson}
              onChange={(e) => setCurrentPerson(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addPerson();
                }
              }}
              placeholder="Nom de la personne"
              className="flex-1 rounded-lg border border-[var(--input-border)] bg-white px-3 py-2 text-sm placeholder:text-[var(--muted)]"
            />
            <button
              type="button"
              onClick={addPerson}
              aria-label="Ajouter"
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-[var(--input-border)] bg-[var(--background)] text-lg font-medium text-[var(--foreground)] hover:bg-gray-200"
            >
              +
            </button>
          </div>
          {personnesList.length > 0 && (
            <ul className="mt-2 flex flex-wrap gap-2">
              {personnesList.map((name, i) => (
                <li
                  key={`${name}-${i}`}
                  className="flex items-center gap-1 rounded-full bg-gray-100 px-3 py-1 text-sm"
                >
                  {name}
                  <button
                    type="button"
                    onClick={() => removePerson(i)}
                    aria-label={`Retirer ${name}`}
                    className="ml-1 text-gray-500 hover:text-red-600"
                  >
                    ×
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-[var(--foreground)]">
            Observations
          </label>
          <textarea
            value={form.observations}
            onChange={(e) => update("observations", e.target.value)}
            placeholder="Notes et observations..."
            rows={3}
            className="w-full rounded-lg border border-[var(--input-border)] bg-white px-3 py-2 text-sm placeholder:text-[var(--muted)]"
          />
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

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={saving}
          className="flex-1 rounded-lg bg-[var(--success)] py-3 font-medium text-white hover:bg-[var(--success-hover)] disabled:opacity-50"
        >
          {submitLabel}
        </button>
        <button
          type="button"
          onClick={secondaryOnClick}
          className="rounded-lg bg-[var(--muted)] px-4 py-3 font-medium text-white hover:bg-gray-600"
        >
          {secondaryLabel}
        </button>
      </div>
    </form>
  );
}
