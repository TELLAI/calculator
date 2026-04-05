/**
 * Crée une organisation (si besoin) et un utilisateur admin rattaché.
 *
 * Variables d'environnement obligatoires :
 *   ADMIN_EMAIL, ADMIN_PASSWORD
 * Optionnel :
 *   ORG_NAME (défaut : "Mon organisation")
 *
 * DATABASE_URL doit pointer vers Postgres (ex. …@db:5432/… depuis un conteneur sur le réseau compose).
 */
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const EMAIL = process.env.ADMIN_EMAIL?.trim();
const PASSWORD = process.env.ADMIN_PASSWORD;
const ORG_NAME = (process.env.ORG_NAME || "Mon organisation").trim();

async function main() {
  if (!EMAIL || !PASSWORD) {
    console.error(
      "Définir ADMIN_EMAIL et ADMIN_PASSWORD (variables d'environnement)."
    );
    process.exit(1);
  }

  let org = await prisma.organization.findFirst({
    where: { name: ORG_NAME },
  });
  if (!org) {
    org = await prisma.organization.create({ data: { name: ORG_NAME } });
    console.log("Organisation créée :", org.name, "(", org.id, ")");
  } else {
    console.log("Organisation existante :", org.name, "(", org.id, ")");
  }

  const password_hash = await bcrypt.hash(PASSWORD, 12);

  const user = await prisma.user.upsert({
    where: { email: EMAIL },
    update: { password_hash },
    create: { email: EMAIL, password_hash },
  });

  await prisma.profile.upsert({
    where: { user_id: user.id },
    update: { role: "admin", organization_id: org.id },
    create: {
      user_id: user.id,
      role: "admin",
      organization_id: org.id,
    },
  });

  const full = await prisma.user.findUnique({
    where: { id: user.id },
    include: { profile: { include: { organization: true } } },
  });

  console.log("Utilisateur admin prêt :");
  console.log("  email        :", full?.email);
  console.log("  rôle         :", full?.profile?.role);
  console.log("  organisation :", full?.profile?.organization?.name);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
