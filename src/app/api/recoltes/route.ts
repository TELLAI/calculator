import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import type { Recolte as PrismaRecolte } from "@prisma/client";

function serializeRecolte(r: PrismaRecolte) {
  return {
    ...r,
    created_at: r.created_at.toISOString(),
    recolte_date: r.recolte_date ? r.recolte_date.toISOString().slice(0, 10) : null,
  };
}

export async function GET() {
  const session = await auth();
  if (!session?.user?.organizationId) {
    return Response.json({ error: "Non autorisé" }, { status: 401 });
  }

  const troisMois = new Date();
  troisMois.setMonth(troisMois.getMonth() - 3);

  const recoltes = await prisma.recolte.findMany({
    where: {
      organization_id: session.user.organizationId,
      created_at: { gte: troisMois },
    },
    orderBy: [{ recolte_date: "desc" }, { created_at: "desc" }],
  });

  return Response.json(recoltes.map(serializeRecolte));
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.organizationId) {
    return Response.json({ error: "Non autorisé" }, { status: 401 });
  }

  const body = await req.json();

  const recolte = await prisma.recolte.create({
    data: {
      organization_id: session.user.organizationId,
      recolte_date: body.recolte_date ? new Date(body.recolte_date) : null,
      billet_100: body.billet_100 ?? 0,
      billet_50: body.billet_50 ?? 0,
      billet_20: body.billet_20 ?? 0,
      billet_10: body.billet_10 ?? 0,
      billet_5: body.billet_5 ?? 0,
      piece_2: Number(body.piece_2) || 0,
      piece_1: Number(body.piece_1) || 0,
      piece_050: Number(body.piece_050) || 0,
      piece_020: Number(body.piece_020) || 0,
      piece_010: Number(body.piece_010) || 0,
      piece_005: Number(body.piece_005) || 0,
      piece_002: Number(body.piece_002) || 0,
      piece_001: Number(body.piece_001) || 0,
      cotisation_adherents: Number(body.cotisation_adherents) || 0,
      cheques: Number(body.cheques) || 0,
      carte_bancaire: Number(body.carte_bancaire) || 0,
      autres: Number(body.autres) || 0,
      personnes_presentes: body.personnes_presentes || null,
      observations: body.observations || null,
    },
  });

  return Response.json(serializeRecolte(recolte), { status: 201 });
}
