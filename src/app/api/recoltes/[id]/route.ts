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

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.organizationId) {
    return Response.json({ error: "Non autorisé" }, { status: 401 });
  }

  const { id } = await params;

  const recolte = await prisma.recolte.findFirst({
    where: { id, organization_id: session.user.organizationId },
  });

  if (!recolte) {
    return Response.json({ error: "Introuvable" }, { status: 404 });
  }

  return Response.json(serializeRecolte(recolte));
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.organizationId || session.user.role !== "admin") {
    return Response.json({ error: "Non autorisé" }, { status: 403 });
  }

  const { id } = await params;
  const body = await req.json();

  const existing = await prisma.recolte.findFirst({
    where: { id, organization_id: session.user.organizationId },
  });

  if (!existing) {
    return Response.json({ error: "Introuvable" }, { status: 404 });
  }

  const updated = await prisma.recolte.update({
    where: { id },
    data: {
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

  return Response.json(serializeRecolte(updated));
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.organizationId || session.user.role !== "admin") {
    return Response.json({ error: "Non autorisé" }, { status: 403 });
  }

  const { id } = await params;

  const existing = await prisma.recolte.findFirst({
    where: { id, organization_id: session.user.organizationId },
  });

  if (!existing) {
    return Response.json({ error: "Introuvable" }, { status: 404 });
  }

  await prisma.recolte.delete({ where: { id } });

  return new Response(null, { status: 204 });
}
