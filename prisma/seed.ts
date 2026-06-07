import "dotenv/config";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const members = [
    { name: "Alex Chen", email: "alex@example.com" },
    { name: "Sam Rivera", email: "sam@example.com" },
    { name: "Morgan Lee", email: "morgan@example.com" },
  ];

  for (const member of members) {
    await prisma.user.upsert({
      where: { email: member.email },
      update: {},
      create: {
        name: member.name,
        email: member.email,
        role: "MEMBER",
      },
    });
  }

  console.log("Seeded 3 example members.");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
