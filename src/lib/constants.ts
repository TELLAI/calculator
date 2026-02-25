export const BILLETS = [
  { key: "billet_100", label: "Billet 100 €", valeur: 100 },
  { key: "billet_50", label: "Billet 50 €", valeur: 50 },
  { key: "billet_20", label: "Billet 20 €", valeur: 20 },
  { key: "billet_10", label: "Billet 10 €", valeur: 10 },
  { key: "billet_5", label: "Billet 5 €", valeur: 5 },
] as const;

export const PIECES = [
  { key: "piece_2", label: "Pièce 2 €", valeur: 2 },
  { key: "piece_1", label: "Pièce 1 €", valeur: 1 },
  { key: "piece_050", label: "Pièce 0,50 €", valeur: 0.5 },
  { key: "piece_020", label: "Pièce 0,20 €", valeur: 0.2 },
  { key: "piece_010", label: "Pièce 0,10 €", valeur: 0.1 },
  { key: "piece_005", label: "Pièce 0,05 €", valeur: 0.05 },
  { key: "piece_002", label: "Pièce 0,02 €", valeur: 0.02 },
  { key: "piece_001", label: "Pièce 0,01 €", valeur: 0.01 },
] as const;

export type BilletKey = (typeof BILLETS)[number]["key"];
export type PieceKey = (typeof PIECES)[number]["key"];
