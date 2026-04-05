import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany({
    include: {
      profile: {
        include: { organization: true },
      },
    },
    orderBy: { created_at: "asc" },
  });

  console.log(`\n${users.length} utilisateur(s) trouvé(s) :\n`);
  for (const u of users) {
    console.log(`- ${u.email}`);
    console.log(`    id           : ${u.id}`);
    console.log(`    role         : ${u.profile?.role ?? "—"}`);
    console.log(`    organisation : ${u.profile?.organization?.name ?? "—"}`);
    console.log(`    créé le      : ${u.created_at.toLocaleDateString("fr-FR")}`);
    console.log();
  }
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
