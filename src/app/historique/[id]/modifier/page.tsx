"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { RecolteFormBody } from "@/components/RecolteFormBody";
import { recolteToFormState } from "@/lib/recolte-form";
import type { FormState } from "@/app/form-types";
import type { Recolte } from "@/lib/supabase";

function toNum(v: string | number): number {
  if (typeof v === "number") return v;
  const n = parseFloat(String(v).replace(",", "."));
  return isNaN(n) ? 0 : n;
}

function parsePersonnes(s: string): string[] {
  return s ? s.split(",").map((x) => x.trim()).filter(Boolean) : [];
}

export default function ModifierRecoltePage() {
  const params = useParams();
  const router = useRouter();
  const { role, logout } = useAuth();
  const id = params.id as string;
  const [recolte, setRecolte] = useState<Recolte | null>(null);
  const [form, setForm] = useState<FormState | null>(null);
  const [currentPerson, setCurrentPerson] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "ok" | "err"; text: string } | null>(null);

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
          setRecolte(null);
          return;
        }
        const r = data as Recolte;
        setRecolte(r);
        setForm(recolteToFormState(r));
      });
  }, [id]);

  const personnesList = form ? parsePersonnes(form.personnes_presentes) : [];

  const update = (key: keyof FormState, value: string | number) => {
    setForm((prev) => (prev ? { ...prev, [key]: value } : null));
    setMessage(null);
  };

  const addPerson = () => {
    if (!form) return;
    const name = currentPerson.trim();
    if (!name) return;
    update(
      "personnes_presentes",
      form.personnes_presentes ? form.personnes_presentes + ", " + name : name
    );
    setCurrentPerson("");
  };

  const removePerson = (index: number) => {
    if (!form) return;
    const list = personnesList.filter((_, i) => i !== index);
    update("personnes_presentes", list.join(", "));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form || !isAdmin) return;
    setSaving(true);
    setMessage(null);
    try {
      const { error } = await supabase
        .from("recoltes")
        .update({
          recolte_date: form.recolte_date || null,
          billet_100: form.billet_100,
          billet_50: form.billet_50,
          billet_20: form.billet_20,
          billet_10: form.billet_10,
          billet_5: form.billet_5,
          piece_2: toNum(form.piece_2),
          piece_1: toNum(form.piece_1),
          piece_050: toNum(form.piece_050),
          piece_020: toNum(form.piece_020),
          piece_010: toNum(form.piece_010),
          piece_005: toNum(form.piece_005),
          piece_002: toNum(form.piece_002),
          piece_001: toNum(form.piece_001),
          cotisation_adherents: toNum(form.cotisation_adherents),
          cheques: toNum(form.cheques),
          carte_bancaire: toNum(form.carte_bancaire),
          autres: toNum(form.autres),
          personnes_presentes: form.personnes_presentes || null,
          observations: form.observations || null,
        })
        .eq("id", id);
      if (error) throw error;
      setMessage({ type: "ok", text: "Récolte modifiée." });
      router.push(`/historique/${id}`);
      router.refresh();
    } catch (err) {
      setMessage({
        type: "err",
        text: err instanceof Error ? err.message : "Erreur lors de l'enregistrement.",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading || !recolte) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--background)]">
        <p className="text-[var(--muted)]">
          {loading ? "Chargement…" : "Récolte introuvable."}
        </p>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-[var(--background)] px-4">
        <p className="text-center text-[var(--muted)]">
          Vous n&apos;avez pas les droits pour modifier cette récolte.
        </p>
        <Link
          href={`/historique/${id}`}
          className="text-[var(--accent)] hover:underline"
        >
          Retour au détail
        </Link>
      </div>
    );
  }

  if (!form) return null;

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <header className="flex items-center justify-between bg-[var(--header-bg)] px-4 py-3 text-white">
        <Link
          href={`/historique/${id}`}
          className="text-sm text-white/90 hover:text-white"
        >
          ← Retour au détail
        </Link>
        <h1 className="text-base font-semibold">Modifier la récolte</h1>
        <button
          type="button"
          onClick={() => logout()}
          className="rounded bg-white/10 px-3 py-1.5 text-sm hover:bg-white/20"
        >
          Déconnexion
        </button>
      </header>

      <main className="mx-auto max-w-2xl px-4 py-6">
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-[var(--foreground)]">
            Modifier la récolte
          </h2>

          <RecolteFormBody
            form={form}
            update={update}
            currentPerson={currentPerson}
            setCurrentPerson={setCurrentPerson}
            addPerson={addPerson}
            removePerson={removePerson}
            onSubmit={handleSubmit}
            saving={saving}
            message={message}
            submitLabel="✓ Enregistrer les modifications"
            secondaryLabel="× Annuler"
            secondaryOnClick={() => router.push(`/historique/${id}`)}
          />
        </div>
      </main>
    </div>
  );
}
