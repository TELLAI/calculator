import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const EMAIL = "elkhalilmosquee+gentillyUser@gmail.com";
const PASSWORD = "gentillyUser";
const ORGANIZATION_ID = "6cafdb0b-88a6-4a90-9f7b-b235c9992c1d";

async function main() {
  const password_hash = await bcrypt.hash(PASSWORD, 12);

  const user = await prisma.user.upsert({
    where: { email: EMAIL },
    update: { password_hash },
    create: {
      email: EMAIL,
      password_hash,
      profile: {
        create: {
          role: "user",
          organization_id: ORGANIZATION_ID,
        },
      },
    },
    include: { profile: true },
  });

  console.log("Utilisateur créé/mis à jour :");
  console.log("  email  :", user.email);
  console.log("  id     :", user.id);
  console.log("  role   :", user.profile?.role);
  console.log("  org_id :", user.profile?.organization_id);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
