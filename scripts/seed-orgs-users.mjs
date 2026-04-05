/**
 * Crée les organisations et comptes initiaux (idempotent).
 * Contient des mots de passe en clair : ne pas publier ce dépôt ; changer les mdp après mise en prod si besoin.
 *
 * DATABASE_URL requise (ex. …@db:5432/… depuis le réseau Docker compose).
 */
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

/** @type {{ orgName: string; email: string; password: string; role: string }[]} */
const SEED = [
  {
    orgName: "Mosquée Elkhalil Savigny sur Orge",
    email: "elkhalilmosquee@gmail.com",
    password: "elkhalil91600",
    role: "admin",
  },
  {
    orgName: "Mosquée Elkhalil Savigny sur Orge",
    email: "elkhalilmosquee+user@gmail.com",
    password: "elkhalilUser",
    role: "user",
  },
  {
    orgName: "Mosquée de Gentilly UMG",
    email: "elkhalilmosquee+gentilly@gmail.com",
    password: "gentillyUmg",
    role: "admin",
  },
  {
    orgName: "Mosquée de Gentilly UMG",
    email: "elkhalilmosquee+gentillyUser@gmail.com",
    password: "gentillyUser",
    role: "user",
  },
];

async function ensureOrg(name) {
  let org = await prisma.organization.findFirst({ where: { name } });
  if (!org) {
    org = await prisma.organization.create({ data: { name } });
    console.log("Organisation créée :", name);
  } else {
    console.log("Organisation déjà présente :", name);
  }
  return org;
}

async function ensureUser(email, password, organizationId, role) {
  const password_hash = await bcrypt.hash(password, 12);
  const user = await prisma.user.upsert({
    where: { email },
    update: { password_hash },
    create: { email, password_hash },
  });
  await prisma.profile.upsert({
    where: { user_id: user.id },
    update: { role, organization_id: organizationId },
    create: {
      user_id: user.id,
      role,
      organization_id: organizationId,
    },
  });
  console.log("  OK", role, "—", email);
}

async function main() {
  const orgCache = new Map();
  for (const row of SEED) {
    if (!orgCache.has(row.orgName)) {
      const org = await ensureOrg(row.orgName);
      orgCache.set(row.orgName, org.id);
    }
    const orgId = orgCache.get(row.orgName);
    await ensureUser(row.email, row.password, orgId, row.role);
  }
  console.log("\nSeed terminé.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
