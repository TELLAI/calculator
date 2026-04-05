import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const EMAIL = "elkhalilmosquee+user@gmail.com";
const NEW_ROLE = "user";

async function main() {
  const user = await prisma.user.findUnique({
    where: { email: EMAIL },
    include: { profile: true },
  });

  if (!user) {
    console.error("Utilisateur introuvable :", EMAIL);
    process.exit(1);
  }

  const profile = await prisma.profile.update({
    where: { user_id: user.id },
    data: { role: NEW_ROLE },
  });

  console.log("Rôle mis à jour :");
  console.log("  email  :", EMAIL);
  console.log("  role   :", profile.role);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
