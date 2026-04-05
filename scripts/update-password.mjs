import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const EMAIL = "elkhalilmosquee@gmail.com";
const NEW_PASSWORD = "elkhalil91600";

async function main() {
  const password_hash = await bcrypt.hash(NEW_PASSWORD, 12);

  const user = await prisma.user.update({
    where: { email: EMAIL },
    data: { password_hash },
  });

  console.log("Mot de passe mis à jour pour :", user.email);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
