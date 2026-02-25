"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { RecolteFormBody } from "@/components/RecolteFormBody";
import type { FormState } from "./form-types";

function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

function getInitialForm(): FormState {
  return {
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
    recolte_date: todayISO(),
    personnes_presentes: "",
    observations: "",
  };
}

const initialForm = getInitialForm();

function toNum(v: string | number): number {
  if (typeof v === "number") return v;
  const n = parseFloat(String(v).replace(",", "."));
  return isNaN(n) ? 0 : n;
}

function parsePersonnes(s: string): string[] {
  return s ? s.split(",").map((x) => x.trim()).filter(Boolean) : [];
}

export default function Home() {
  const router = useRouter();
  const { logout } = useAuth();
  const [form, setForm] = useState<FormState>(initialForm);
  const [currentPerson, setCurrentPerson] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  const personnesList = parsePersonnes(form.personnes_presentes);

  const addPerson = () => {
    const name = currentPerson.trim();
    if (!name) return;
    update(
      "personnes_presentes",
      form.personnes_presentes ? form.personnes_presentes + ", " + name : name
    );
    setCurrentPerson("");
  };

  const removePerson = (index: number) => {
    const list = personnesList.filter((_, i) => i !== index);
    update("personnes_presentes", list.join(", "));
  };

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
      });
      if (error) throw error;
      router.push("/historique");
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

  const resetForm = () => {
    setForm(getInitialForm());
    setCurrentPerson("");
    setMessage(null);
  };

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <header className="flex items-center justify-between bg-[var(--header-bg)] px-4 py-3 text-white">
        <span className="text-sm font-medium opacity-90">Application Récoltes</span>
        <div className="flex items-center gap-3">
          <Link
            href="/historique"
            className="text-sm text-white/90 hover:text-white"
          >
            Historique
          </Link>
          <button
            type="button"
            onClick={logout}
            className="rounded bg-white/10 px-3 py-1.5 text-sm hover:bg-white/20"
          >
            Déconnexion
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-4 py-6">
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-[var(--foreground)]">
            Nouvelle récolte
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
            submitLabel="✓ Enregistrer"
            secondaryLabel="× Annuler"
            secondaryOnClick={resetForm}
          />
        </div>
      </main>
    </div>
  );
}
